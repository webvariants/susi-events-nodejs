var crypto = require('crypto');

function Susi(){
    var _finishCallbacks = {};
    var _consumers = [];
    var _processors = [];

    var _consumerTopicCounter = {};
    var _processorTopicCounter = {};

    var _publishProcesses = {};
    
    var generateId = function(){
        return crypto.randomBytes(16).toString('hex');
    };

    var self = this;

    self.publish = function(evt,finishCallback){
        if(!typeof evt.topic === 'string'){
            return false;
        }
        evt.id = evt.id || generateId();
        var publishProcess = {
            next: 0,
            processors: [],
            consumers: [],
            finishCallback: finishCallback
        };
        for(var i=0;i<_processors.length;i++){
            if(evt.topic.match(_processors[i].topic)){
               publishProcess.processors.push(_processors[i].callback);
            }
        }
        for(var i=0;i<_consumers.length;i++){
            if(evt.topic.match(_consumers[i].topic)){
               publishProcess.consumers.push(_consumers[i].callback);
            }
        }
        _publishProcesses[evt.id] = publishProcess;
        self.ack(evt);
        return true;
    };

    self.ack = function(evt){
        var publishProcess = _publishProcesses[evt.id];
        if(!publishProcess){
            return;
        }
        var next = publishProcess.next;
        var processors = publishProcess.processors;
        if(next < processors.length){
            publishProcess.next++;
            processors[next](evt);
        }else{
            for(var i=0;i<publishProcess.consumers.length;i++){
                publishProcess.consumers[i](evt);
            }
            publishProcess.finishCallback(evt);
            delete _publishProcesses[evt.id];
        }
    };

    self.dismiss = function(evt){
        var publishProcess = _publishProcesses[evt.id];
        if(!publishProcess){
            return;
        }
        for(var i=0;i<publishProcess.consumers.length;i++){
            publishProcess.consumers[i](evt);
        }
        publishProcess.finishCallback(evt);
        delete self._publishProcesses[evt.id];
    };

    self.registerConsumer = function(topic,callback){
        var obj = {
            topic: topic,
            callback: callback,
            id : generateId()
        }
        _consumers.push(obj);
        return obj.id;
    };

    self.registerProcessor = function(topic,callback){
        var obj = {
            topic: topic,
            callback: callback,
            id : generateId()
        }
        _processors.push(obj);
        return obj.id;
    };

    self.unregisterConsumer = function(id){
        for(var i=0;i<_consumers.length;i++){
            if(_consumers[i].id == id){
                _consumers.splice(i,1);
                break;
            }
        }
    };

    self.unregisterProcessor = function(id){
        for(var i=0;i<_processors.length;i++){
            if(_processors[i].id == id){
                _processors.splice(i,1);
                break;
            }
        }
    };
}

module.exports = Susi;

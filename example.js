var Susi = require('./susi');

var susi = new Susi();

// register preprocessor for all events
susi.registerProcessor('.*', function(evt) {
    evt.payload = evt.payload || {};
    evt.ack();
});

// add 'foo' processor
var processorId = susi.registerProcessor('foo', function(evt) {
    evt.payload.foo = 'bar';
    evt.ack();
});

// add 'foo' consumer
var consumerId = susi.registerConsumer('foo', function(evt) {
    console.log('consumer', JSON.stringify(evt.payload));
});

// publish 'foo'
susi.publish({
    topic: 'foo'
}, function(evt) {
    console.log('finish', JSON.stringify(evt.payload));
    console.log('-----------------------------------');

    // unregister processor 'foo'
    susi.unregisterProcessor(processorId);
    susi.publish({
        topic: 'foo'
    }, function(evt) {
        console.log('finish', JSON.stringify(evt.payload));
        console.log('-----------------------------------');

        // unregister consumer 'foo'
        susi.unregisterConsumer(consumerId);
        susi.publish({
            topic: 'foo'
        }, function(evt) {
            console.log('finish', JSON.stringify(evt.payload));
            console.log('-----------------------------------');
        });
    });
});

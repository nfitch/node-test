// Copyright (c) 2013, Nate Fitch. All rights reserved.

var util = require('util');
var stream = require('stream');

function ValueTransform(a) {
    var self = this;
    //This is the line that will actually make this work :/
    stream.Transform.call(self, { 'objectMode': true });
}

util.inherits(ValueTransform, stream.Transform);

ValueTransform.prototype._transform = function (data, encoding, cb) {
    var self = this;
    if ((typeof data) === 'object') {
        if (data.value) {
            data = data.value;
        }
    }
    this.push(data);
    cb();
}

module.exports = ValueTransform;

if (process.argv[1] === __filename) {
    var MemStream = require('./mem_stream');
    var ms = new MemStream([
        { 'value': 'foo' },
        'bar',
        { 'value': 'baz', 'x': 'X' },
        { 'val': 'value' }
    ]);

    var t = new ValueTransform();
    ms.pipe(t);

    t.on('readable', function () {
        var d;
        while (null !== (d = t.read())) {
            console.log(d);
        }
    });

    t.on('end', function () {
        console.log('Done!');
    });
}

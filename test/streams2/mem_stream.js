// Copyright (c) 2013, Joyent, Inc. All rights reserved.

var util = require('util');
var stream = require('stream');

function MemoryStream(a) {
    var self = this;
    self.a = a;
    self.i = 0;
    self.ended = false;
    //This is the line that will actually make this work :/
    stream.Readable.call(self, { 'objectMode': true });
}

util.inherits(MemoryStream, stream.Readable);

MemoryStream.prototype._read = function () {
    var self = this;
    if (self.ended) {
        return;
    }
    self.push(self.a[self.i++]);
    if (self.i === self.a.length) {
        self.ended = true;
        self.push(null);
    }
}

module.exports = MemoryStream;

if (process.argv[1] === __filename) {
    var one = new MemoryStream([1, 2, 3]);
    var res = [];
    var flowing = false;

    if (flowing) {
        one.on('data', function (d) {
            res.push(d);
        });
    } else {
        one.on('readable', function () {
            while (null !== (d = one.read())) {
                res.push(d);
            }
        });
    }

    one.once('end', function () {
        console.log({ 'result': res });
    });
}

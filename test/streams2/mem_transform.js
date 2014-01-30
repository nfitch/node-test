#!/usr/bin/node

var util = require('util');
var stream = require('stream');

//Memory Stream
function MemoryStream(a) {
    var self = this;
    self.a = a;
    self.i = 0;
    self.ended = false;
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

//Noop Transformer
function NoopTransform() {
    stream.Transform.call(this, { 'objectMode': true });
}
util.inherits(NoopTransform, stream.Transform);

NoopTransform.prototype._transform = function (entry, encoding, cb) {
    this.push(entry + '-t');
    process.nextTick(cb);
};

var a = ['one', 'two', 'three'];
function aS(cb) {
    var s = new MemoryStream(a);
    process.nextTick(cb.bind(null, s));
}

function printStream(s, cb) {
    s.on('readable', function () {
        var d;
        while(null !== (d = s.read())) {
            console.log(d);
        }
    });

    s.on('end', cb);
}

aS(function (s) {
    if (true) {
        var n = new NoopTransform();
        s.pipe(n);
        s = n;
    }

    printStream(s, function () {
        console.log('done');
    });
});

#!/usr/bin/node

//http://nodejs.org/docs/v0.8.22/api/stream.html

var Stream = require('stream').Stream;
var util = require('util');
//module.exports = ReadableStream;

var BYTES_TO_EMIT = 16;
var GLOBAL_COUNTER = 0;
var VERBOSE = false;

//Fast Readable
function FastReadableStream(maxWrites) {
        this.id = GLOBAL_COUNTER++;
        this.readable = true;
        this.paused = false;
        this.chunksWritten = 0;
        this.pausedCalled = 0;
        this.resumeCalled = 0;
        this.maxWrites = maxWrites;
        this.data = '';
        for (var i = 0; i < BYTES_TO_EMIT; ++i) {
                this.data += 'x';
        }
        process.nextTick(this._resume.bind(this));
}

util.inherits(FastReadableStream, Stream);

FastReadableStream.prototype._resume = function() {
        if (this.maxWrites && this.chunksWritten >= this.maxWrites) {
                this.destroy();
                return;
        }
        if (!this.paused && this.readable) {
                this.log('emitting ' + this.chunksWritten);
                this.emit('data', this.data);
                ++this.chunksWritten;
                process.nextTick(this._resume.bind(this));
        }
};

FastReadableStream.prototype.pause = function() {
        this.log('paused');
        ++this.pausedCalled;
        this.paused = true;
};

FastReadableStream.prototype.resume = function() {
        this.log('resumed');
        ++this.resumeCalled;
        this.paused = false;
        this._resume();
};

FastReadableStream.prototype.destroy = function() {
        this.log('destroyed');
        this.pause();
        this.readable = false;
        this.emit('end');
        this.emit('close');
};

FastReadableStream.prototype.log = function(message) {
        if (VERBOSE) {
                console.log({
                        id: this.id,
                        type: 'readable',
                        message: message
                });
        }
}

//Slow Writable
function SlowWritableStream(percentReject) {
        this.id = GLOBAL_COUNTER++;
        this.writable = true;
        this.percentReject = percentReject;
        this.written = 0;
        this.drained = 0;
}

util.inherits(SlowWritableStream, Stream);

SlowWritableStream.prototype._drain = function() {
        this.log('drain');
        ++this.drained;
        this.emit('drain');
}

SlowWritableStream.prototype.write = function(data) {
        if (!this.writable) {
                return false;
        }
        this.log('writing: ' + this.written);
        ++this.written;
        if (Math.floor((Math.random()*100)+1) >= this.percentReject) {
                return true;
        } else {
                setTimeout(this._drain.bind(this), 1000);
                return false;
        }
};

SlowWritableStream.prototype.end = function() {
        this.log('close');
        this.emit('close');
};

SlowWritableStream.prototype.log = function(message) {
        if (VERBOSE) {
                console.log({
                        id: this.id,
                        type: 'writable',
                        message: message
                });
        }
}


//--- Testing

function testFastWritableStream() {
        console.log('Testing fast writable stream');
        var rstream = new FastReadableStream(100000);
        var wstream = new SlowWritableStream(0);

        wstream.on('close', function () {
                console.log({
                        'rstream.chunksWritten': rstream.chunksWritten,
                        'rstream.readable': rstream.readable,
                        'rstream.pauseCalled': rstream.pausedCalled,
                        'rstream.resumeCalled': rstream.resumeCalled,
                        'wstream.writable': wstream.writable,
                        'wstream.written': wstream.written,
                        'wstream.drained': wstream.drained
                });
        });
        rstream.pipe(wstream);
}
//testFastWritableStream();

function testSlowWritableStreamPipe() {
        console.log('Testing slow writable stream with a pipe');
        var rstream = new FastReadableStream(100);
        var wstream = new SlowWritableStream(20);

        var done = false;
        function printStats() {
                console.log({
                        'rstream.chunksWritten': rstream.chunksWritten,
                        'rstream.readable': rstream.readable,
                        'rstream.pauseCalled': rstream.pausedCalled,
                        'rstream.resumeCalled': rstream.resumeCalled,
                        'wstream.writable': wstream.writable,
                        'wstream.written': wstream.written,
                        'wstream.drained': wstream.drained
                });
                if (!done) {
                        setTimeout(printStats, 2000);
                }
        }
        printStats();

        wstream.on('close', function () {
                done = true;
                printStats();
        });
        rstream.pipe(wstream);
}
//testSlowWritableStreamPipe();

//Checking that pausing, resuming and destroying works:
function testFastReadableStream() {
        var stream = new FastReadableStream();
        stream.on('data', function (data) {
                console.log(data);
        });

        function printStats() {
                console.log({
                        chunks: stream.chunksWritten,
                        readable: stream.readable
                });
                setTimeout(printStats, 1000);
        }
        printStats();

        function pauseOrResume() {
                stream.paused ? stream.resume() : stream.pause();
                setTimeout(pauseOrResume, 3000);
        }
        pauseOrResume();

        setTimeout(function () {
                stream.destroy();
        }, 20000);
}
//testFastReadableStream();

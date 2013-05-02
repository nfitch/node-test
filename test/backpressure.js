#!/usr/bin/node

/**
 * Note that this is irrelevant if you're working with node > 0.10 since that's
 * the rev where the streams interface changed.  See:
 *     http://blog.nodejs.org/2013/03/11/node-v0-10-0-stable/
 *     https://github.com/isaacs/readable-stream
 *
 * For the < 0.10 docs (and what the streams below are made for) see:
 *     http://nodejs.org/docs/v0.8.22/api/stream.html
 */
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
        this.writable = false;
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

//Demux stream
function demux(readstream, writestreams, cb) {
        var i = 0;
        readstream.pause();
        var waitingForDrain = [];
        var ended = false;

        function tryEnd() {
                if (ended) {
                        return;
                }
                var endNow = !readstream.readable;
                for (var i = 0; i < writestreams.length; ++i) {
                        endNow = endNow && !writestreams[i].writable;
                }
                if (endNow) {
                        ended = true;
                        cb();
                }
        }

        //Set up the read stream
        readstream.on('data', function (chunk) {
                //Round robin
                var ws = writestreams[i++ % writestreams.length];
                if (false === ws.write(chunk)) {
                        if (waitingForDrain.indexOf(ws) === -1) {
                                waitingForDrain.push(ws);
                        }
                        readstream.pause();
                }
        });

        readstream.on('end', function () {
                //In a real library, should probably have an option for
                // leaving these open.
                for (var i = 0; i < writestreams.length; ++i) {
                        writestreams[i].end();
                }
        });

        readstream.on('error', function (err) {
                err.stream = readstream;
                cb(err);
        });

        readstream.on('close', function () {
                tryEnd();
        });

        //Set up each write stream
        for (var i = 0; i < writestreams.length; ++i) {
                var ws = writestreams[i];
                ws.on('drain', function () {
                        var s = this;
                        var index = waitingForDrain.indexOf(s);
                        if (index !== -1) {
                                waitingForDrain.splice(index, 1);
                        }
                        if (waitingForDrain.length === 0) {
                                readstream.resume();
                        }
                }.bind(ws));

                ws.on('error', function (err) {
                        err.stream = this;
                        cb(err);
                }.bind(ws));

                ws.on('close', function () {
                        if (readstream.readable) {
                                //Write streams shouldn't close prematurely
                                var err = new Error(
                                        'write stream closed prematurely');
                                err.stream = this;
                                cb(err);
                                return;
                        }
                        tryEnd();
                }.bind(ws));
        }

        readstream.resume();
}


//--- Testing


function testDemux() {
        console.log('Testing demux');
        var rstream = new FastReadableStream(5);
        var wstream1 = new SlowWritableStream(20);
        var wstream2 = new SlowWritableStream(40);

        VERBOSE = true;
        demux(rstream, [wstream1, wstream2], function (err) {
                if (err) {
                        console.error(err);
                }
                console.log({
                        'rstream.readable': rstream.readable,
                        'wstream1.writable': wstream1.writable,
                        'wstream2.writable': wstream2.writable
                });
                VERBOSE = false;
        });
}
testDemux();


//Test that the classes above work with pipe and that no pause/resume/drain is
// called when the slow guy isn't actually slow.
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

//Testing that the classes above actually work as pausable/resumable/drinable
// streams.
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

//Checking that pausing, resuming and destroying works on the readable
// stream.
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

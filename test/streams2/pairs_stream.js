// Copyright (c) 2013, Nate Fitch. All rights reserved.

var util = require('util');
var stream = require('stream');
var MemStream = require('./mem_stream');

function PairsStream(opts) {
    var self = this;
    self.left = opts.left;
    self.right = opts.right;
    self.leftEnded = false;
    self.rightEnded = false;
    self.waitingForReadable = false;
    self.ended = false;
    //This is the line that will actually make this work :/
    stream.Readable.call(self, { 'objectMode': true });
    init.call(self);
}

function init() {
    var self = this;

    function end() {
        if (self.ended || self.waitingForReadable) {
            return;
        }
        //This is an attempt to take left out of flowing mode.  It should work
        // in later (>v0.11) versions of Node (see the streams docs).  Not sure
        // if it'll work with v0.10.
        if (!self.leftEnded) {
            self.left.pause();
        }
        cleanup();
        self.ended = true;
        self.push(null);
    }

    function waitForRightReadable(ldata) {
        //Since we're holding onto left data, we need to be sure that we put it
        // back into the left stream before we end.  Otherwise, we could lose
        // some data from the left side.  We use this waiting for readable to
        // guard against ending before we have a chance to shift it back on.
        self.waitingForReadable = true;
        //One of two things is going to happen:
        // 1) We're waiting for more data from the right stream, in which
        //    case we'll get a readable event.
        // 2) We're at the end but haven't received the 'end' event yet.
        function onRightEnd() {
            self.rightEnded = true;
            self.waitingForReadable = false;
            //Note that is causes an on('data') to fire, but that's caught by
            // the if (self.rightEnded) at the top of the on('data') function.
            self.left.unshift(ldata);
            end();
        }

        function onRightReadable() {
            self.waitingForReadable = false;
            self.right.removeListener('end', onRightEnd);
            rdata = self.right.read();
            //For whatever reason, even though we get a 'readable' event, we
            // can read null.  I've only seen it happen between the last element
            // being read and the end event.
            if (rdata === null) {
                waitForRightReadable(ldata);
            } else {
                if (self.push({ 'left': ldata, 'right': rdata })) {
                    self.left.resume();
                }
            }
        }
        self.right.once('end', onRightEnd);
        self.right.once('readable', onRightReadable);
    }

    function onLeftData(ldata) {
        if (self.rightEnded) {
            self.left.removeListener('data', onLeftData);
            self.left.pause();
            self.left.unshift(ldata);
            return;
        }

        var rdata = self.right.read();

        //Right was read right away, so we can just return.
        if (rdata !== null) {
            if (!self.push({ 'left': ldata, 'right': rdata })) {
                self.left.pause();
            }
            return;
        }

        //Otherwise, so we need to wait for the right to catch up.
        self.left.pause();
        waitForRightReadable(ldata);
    }

    function onError(err) {
        cleanup();
        self.emit('error', err);
    }

    function onLeftEnd() {
        self.emit('leftEnded');
        self.leftEnded = true;
        end();
    }

    function onRightEnd() {
        self.emit('rightEnded');
        self.rightEnded = true;
        end();
    }

    //Left goes into flowing mode.
    self.left.on('data', onLeftData);
    self.left.on('error', onError);
    self.left.on('end', onLeftEnd);

    //Right we leave in non-flowing mode.
    self.right.on('error', onError);
    self.right.on('end', onRightEnd);

    function cleanup() {
        //We leave the onEnd listeners so that we can capture the right
        // state before the caller receives the 'end' event for this.
        self.left.removeListener('data', onLeftData);
        self.left.removeListener('error', onError);
        self.right.removeListener('error', onError);
    }
}

util.inherits(PairsStream, stream.Readable);

PairsStream.prototype._read = function () {
    var self = this;
    if (self.ended || self.rightEnded || self.leftEnded ||
        self.waitingForReadable) {
        return;
    }
    self.left.resume();
}

module.exports = PairsStream;

if (process.argv[1] === __filename) {
    var left = new MemStream([1, 2, 3, 4]);
    var right = new MemStream([1, 2, 3]);
    var ps = new PairsStream({ 'left': left, 'right': right });
    var res = [];
    var flowing = false;

    if (flowing) {
        ps.on('data', function (d) {
            res.push(d);
        });
    } else {
        ps.on('readable', function () {
            var d;
            while (null !== (d = ps.read())) {
                res.push(d);
            }
        });
    }

    ps.once('end', function () {
        console.log({ 'result': res,
                      'leftEnded': ps.leftEnded,
                      'rightEnded': ps.rightEnded
                    });

        function end() {
            console.log('All done!');
        }

        if (ps.leftEnded && ps.rightEnded) {
            end();
            return;
        }

        var streamNotEnded;
        if (!ps.leftEnded) {
            console.log('More in left');
            streamNotEnded = left;
        } else {
            console.log('More in right');
            streamNotEnded = right;
        }
        var endFlowing = false;
        if (endFlowing) {
            /* WARNING: Flowing mode doesn't work if the left-hand stream is
               the one with data remaining.  As far as I can tell, all the
               data events are lost because we can't transition back to non-
               flowing mode. */
            streamNotEnded.on('data', function (d) {
                console.log('LeftOver: ' + d);
            });
        } else {
            function onReadable() {
                var d;
                while (null !== (d = streamNotEnded.read())) {
                    console.log('LeftOver: ' + d);
                }
            }
            streamNotEnded.on('readable', onReadable);
            onReadable();
        }

        streamNotEnded.on('end', function () {
            end();
        });

    });
}

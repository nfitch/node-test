//This shows how to pair the first of one stream with the first of the
// second stream, etc, eventually noticing the rest of the stream that didn't
// end first.
// Based off: https://gist.github.com/isaacs/7422303
var fs = require('fs');
var lstream = require('lstream');

var l1 = fs.createReadStream('./data/list1.txt').pipe(new lstream());
var l2 = fs.createReadStream('./data/list2.txt').pipe(new lstream());
var l2Ended = false;
var line = 0;

function filter(x) {
    if (x === '') {
        x = '-';
    }
    return x;
}

function pp(a, b) {
    console.log(++line + ': ' + a + ' ' + b);
}

function end() {
    console.log('Ended!!');
}

function onData(c1) {
    c1 = filter(c1);
    var c2 = filter(l2.read());
    if (!l2Ended && c2 === null) {
        l1.pause();
        //One of two things is going to happen:
        // 1) We're waiting for more data from the l2 stream, in which case
        //    we'll get a readable event.
        // 2) We're at the end but haven't received the 'end' event yet.
        function iend() {
            pp(c1, null);
            l1.resume();
        }
        l2.once('end', iend);
        l2.once('readable', function () {
            l2.removeListener('end', iend);
            c2 = filter(l2.read());
            pp(c1, c2);
            l1.resume();
        });
    } else {
        pp(c1, c2);
    }
}

function onEnd() {
    //Just let the onData finish us up...
    l2Ended = true;
}
l2.once('end', onEnd);
l2.once('error', function (err) {
    console.error(err, 'error with l2');
    process.exit(1);
});

l1.on('data', onData);
l1.once('end', function () {
    //Consume the rest of l2 if it's not done yet...
    if (!l2Ended) {
        l2.removeListener('end', onEnd);
        l2.on('data', function (c2) {
            pp(null, filter(c2));
        });
        l2.once('end', end);
    } else {
        end();
    }
});
l1.once('error', function (err) {
    console.error(err, 'error with l1');
    process.exit(1);
});

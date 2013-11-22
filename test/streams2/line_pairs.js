//This shows how to pair the first of one stream with the first of the
// second stream, etc, eventually noticing the rest of the stream that didn't
// end first.
var fs = require('fs');
var lstream = require('lstream');

var l1 = fs.createReadStream('./data/list1.txt').pipe(new lstream());
var l2 = fs.createReadStream('./data/list2.txt').pipe(new lstream());
var c1 = null;
var c2 = null;
var l1end = false;
var l2end = false;
var line = 0;

function filter(x) {
    if (x === '') {
        return ('-');
    }
    return (x === null ? null : parseInt(x, 10));
}

function debug(m) {
//    console.log('-- ' + m);
}

function pp(a, b) {
    console.log(++line + ': ' + a + ' ' + b);
}

function tryNext() {
    //Base case.
    if (l1end && l2end) {
        console.log('Ended!!');
        return;
    }

    if (c1 === null) {
        c1 = filter(l1.read());
        debug('l1 read ' + c1);
    }

    if (c2 === null) {
        c2 = filter(l2.read());
        debug('l2 read ' + c2);
    }

    if (l1end && c2 !== null) {
        pp(c1, c2);
        c2 = null;
        return (tryNext());
    }

    if (l2end && c1 !== null) {
        pp(c1, c2);
        c1 = null;
        return (tryNext());
    }

    //Need to wait for the next readable event.
    if (c1 === null || c2 === null) {
        debug('waiting for readable');
        return;
    }

    pp(c1, c2);
    c1 = c2 = null;
    tryNext();
}

l1.on('readable', function () {
    debug('l1 readable');
    tryNext();
});

l1.on('error', function (err) {
    console.error(err, 'error with l1');
    process.exit(1);
});

l1.on('end', function () {
    debug('l1 end');
    l1end = true;
    tryNext();
});

l2.on('readable', function () {
    debug('l2 readable');
    tryNext();
});

l2.on('error', function (err) {
    console.error(err, 'error with l2');
    process.exit(1);
});

l2.on('end', function () {
    debug('l2 end');
    l2end = true;
    tryNext();
});


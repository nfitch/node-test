//Ye old union of sorted streams.
var fs = require('fs');
var lstream = require('lstream');

var l1 = fs.createReadStream('./data/list1.txt').pipe(new lstream());
var l2 = fs.createReadStream('./data/list2.txt').pipe(new lstream());
var c1 = null;
var c2 = null;
var l1end = false;
var l2end = false;

function filter(x) {
    if (x === '') {
        return (null);
    }
    return (x === null ? null : parseInt(x, 10));
}

function debug(m) {
//    console.log('-- ' + m);
}

function tryNext() {
    //Base case.
    if (l1end && l2end) {
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
        console.log(c2);
        c2 = null;
        return (tryNext());
    }

    if (l2end && c1 !== null) {
        console.log(c1);
        c1 = null;
        return (tryNext());
    }

    //Need to wait for the next readable event.
    if (c1 === null || c2 === null) {
        debug('waiting for readable');
        return;
    }

    debug('comparing c1 (' + c1 + ') to c2 (' + c2 + ')');
    if (c1 < c2) {
        console.log(c1);
        c1 = null;
    } else if (c2 < c1) {
        console.log(c2);
        c2 = null;
    } else {
        console.log(c1);
        c1 = c2 = null;
    }
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


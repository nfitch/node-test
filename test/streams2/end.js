//This attemps to show that end is emitted immediately after the read of the
// last element from a stream.
var fs = require('fs');
var lstream = require('lstream');

function log(x) {
    console.log((new Date().getTime()) + ' ' + x);
}

var l1 = fs.createReadStream('./data/list1.txt').pipe(new lstream());

l1.on('readable', function () {
    function tryRead() {
        setTimeout(function () {
            var x = l1.read();
            if (x === null) {
                return;
            }
            log('read: ' + x);
            tryRead();
        }, 1000);
    }
    tryRead();
});

l1.on('error', function (err) {
    console.error(err, 'error with l1');
    process.exit(1);
});

l1.on('end', function () {
    //l1.read() returns null here, in case you were wondering...
    log('ended');
});

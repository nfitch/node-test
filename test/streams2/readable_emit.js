//This attempts to show that 'readable' isn't emmitted for every 'read',
// especially in async scenarios...
var fs = require('fs');
var lstream = require('lstream');

function log(x) {
    console.log((new Date().getTime()) + ' ' + x);
}

var l1 = fs.createReadStream('./data/list1.txt').pipe(new lstream());
var read = 0;
var readable = 0;

l1.on('readable', function () {
    ++readable;
    setTimeout(function () {
        while (null !== l1.read()) {
            ++read;
        }
        //If we replace the while loop above with this:
        //l1.read(); ++read;
        //Then this dies without any input- it will never emit readable again.
    }, 1000);
});

l1.on('error', function (err) {
    console.error(err, 'error with l1');
    process.exit(1);
});

l1.on('end', function () {
    console.log({
        read: read,
        readable: readable
    });
    log('ended');
});

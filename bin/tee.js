#!/usr/bin/node

var fs = require('fs');

var args = process.argv.slice(2);
if (args.length < 1) {
        console.log('usage: ' + process.argv[1] + ' [file]');
        process.exit(1);
}
var file = args[0];

var stream = fs.createWriteStream(file);

stream.once('open', function (fd) {
        process.stdin.pipe(process.stdout);
        process.stdin.pipe(stream);
        process.stdin.resume();
});

stream.once('error', function (err) {
        console.error(err);
        process.exit(1);
});

process.stdin.once('end', function () {
        stream.end();
});

#!/usr/bin/node

var stream = require('stream');

function onEnd1() {
    console.log('end 1');
}

function onEnd2() {
    console.log('end 2');
}

var s = stream.Readable();

function printEvents(msg) {
    console.log('-------- ' + msg + ' ---------');
    console.log(s._events['end']);
}

s.once('end', onEnd1);
printEvents('After adding once onEnd1');

s.once('end', onEnd2);
printEvents('After adding once onEnd2');

s.removeListener('end', onEnd1);
printEvents('After removing onEnd1');

s.once('end', onEnd1);
printEvents('After adding once onEnd1');

s.removeListener('end', onEnd1);
printEvents('After removing onEnd1');

#!/usr/bin/node

//String of hex to buffer.
var hex = '0101 080a 0031 d931 0031 d92a'.replace(/ /g, '');
console.log({
        hex: hex
});

var b = new Buffer(hex, 'hex');
console.log(b);

//Append to it
var hex2 = '0000 000b'.replace(/ /g, '');
var b2 = Buffer.concat([
        b,
        new Buffer(hex2, 'hex')
]);
console.log(b2);

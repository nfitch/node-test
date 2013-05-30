#!/usr/bin/node

var util = require('util');

//Lame.  I figured it would be sprintf compatible.
console.log(util.format('%04d', 3));
console.log(util.format('%d', 3));

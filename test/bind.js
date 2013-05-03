#!/usr/bin/node

function c(x) {
        console.log(x);
}

//This won't work...
var funcs = [];
for (var i = 0; i < 10; ++i) {
        funcs.push(function () {
                console.log(i);
        });
}

for (var j = 0; j < 10; ++j) {
        funcs[j]();
}

//But this does...
var funcs = [];
for (var i = 0; i < 10; ++i) {
        funcs.push(function (i) {
                console.log(i);
        }.bind(null, i));
}

for (var j = 0; j < 10; ++j) {
        funcs[j]();
}

//Trying with new Function...
var f = new Function('console.log(this.fvar);');
var opts = { 'fvar': 'foo' };
f.bind(opts)();

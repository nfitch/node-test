#!/usr/bin/node

var util = require('util');
var vm = require('vm');
var mod_crypto = require('crypto');

//--- Functions that run other functions...

function runinNewContextFunc(code, line) {
        var x = {
                'line': line
        };
        try {
                return vm.runInNewContext(code, x);
        } catch (e) {
                console.error(e);
                process.exit(1);
        }
}

function evalFunc(code, line) {
        return eval(code);
}

function functionFunc(code, line) {
        var f = new Function('line', 'return ' + code + ';');
        return f(line);
}

var CACHED_FUNC = null;
function cachedFunctionFunc(code, line) {
        if (CACHED_FUNC === null) {
                CACHED_FUNC = new Function('line', 'return ' + code + ';');
        }
        return CACHED_FUNC(line);
}

//--- Time

function timeInvocations(f, iters, code, line) {
        var start = (new Date()).getTime();
        for (var i = 0; i < iters; ++i) {
                f(code, line);
        }
        var end = (new Date()).getTime();
        return (end - start);
}

//Should be the same as the "code" below...
function baseline(code, line) {
        return line.split(',')[0];
}


//--- Main

var line = 'x,y,z';
var code = 'line.split(\',\')[0]';
var expected = 'x';

var funcs = [
//        runinNewContextFunc,
        evalFunc,
        functionFunc,
        cachedFunctionFunc,
        baseline
];

// First test that they will give back the same thing...
for (var i = 0; i < funcs.length; ++i) {
        var f = funcs[i];
        var res = f(code, line);
        if (res !== expected) {
                console.log(f.name + ' returned ' + res + ', expected: ' +
                            expected);
                process.exit(1);
        }
}

for (var i = 0; i < funcs.length; ++i) {
        var f = funcs[i];
        //Safe with run in new context
//        var t = timeInvocations(f, 100000, code, line);
        var t = timeInvocations(f, 100000000, code, line);
        console.log(f.name + ' => ' + t);
}

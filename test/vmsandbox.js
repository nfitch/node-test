#!/usr/bin/node

var util = require('util');
var vm = require('vm');

//----- Objects

var x = {
        'name': '123456789',
        'date': '2013-02-05T15:32:23.720Z'
};

//var code = 'console.log(name);';
//var code = 'name'; // 123456789
//var code = 'name.substring(0,1)'; // 1
var code = 'name.substring(0,3)'; // 1
//var code = 'var d = new Date(); name; d';
//var code = 'var t = (new Date(date)).getTime(); (t - (t % (60 * 1000)))';

try {
        var res = vm.runInNewContext(code, x);
        console.log('Obj Result: ' + util.inspect(res));
} catch (e) {
        console.log('Obj Error: ' + e);
}


//------ Strings

var s = { this: 'helloworld', console: console, util: util };
//var s = 'helloworld';


//var scode = 'substring(0,1)'; // ReferenceError: substring is not defined
var scode = 'console.log(util.inspect(this));';

try {
        var res = vm.runInNewContext(scode, s);
        console.log('Str Result: ' + util.inspect(res));
} catch (e) {
        console.log('Str Error: ' + e);
}

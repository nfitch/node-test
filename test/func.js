#!/usr/bin/node

(function foo() { (function bar() { console.log("hi"); })(); })();

var f = new Function('(function foo() { (function bar() { console.log("hi"); })(); })();');
f();

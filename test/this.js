#!/usr/bin/node

//Trying to dynamically rebind this... doesn't work this way.
function thisNormal(opts) {
        console.log(this.foo);
}

function thisHack(opts) {
        this = opts;
        console.log(this.foo);
}

thisNormal.bind({ 'foo': 'bar' }, { 'foo': 'baz' })();
//Fails
//thisHack.bind({ 'foo': 'bar' }, { 'foo': 'baz' })();

//Trying to bind this for an eval... doesn't work this way.
console.log(eval.call({'foo': 'bar'}, 'this.foo'));

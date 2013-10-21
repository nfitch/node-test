#!/usr/bin/node

var array = ['a', 'b', 'c'];
console.log(array);
array.length = 2; //Uh oh... truncate!
console.log(array);
for (var i = 0; i < 3; ++i) {
        console.log({ 'index': i, 'val': array[i] });
}

array = ['a', 'b', 'c'];
console.log(array.slice(1,3));
console.log(array.slice(1,4));
console.log(array.slice(-2,-1)); //Interesting
console.log(array.slice(-2,3)); //Interesting

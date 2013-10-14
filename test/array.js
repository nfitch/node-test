#!/usr/bin/node

var array = ['a', 'b', 'c'];
console.log(array);
array.length = 2; //Uh oh... truncate!
console.log(array);
for (var i = 0; i < 3; ++i) {
        console.log({ 'index': i, 'val': array[i] });
}

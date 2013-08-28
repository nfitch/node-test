#!/usr/bin/node

console.log(new Error().stack);

try {
        foo();
} catch(e) {
        console.log(e.stack);
}

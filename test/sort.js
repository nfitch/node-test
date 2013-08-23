#!/usr/bin/node

function ga() {
        return ([10, 5, 11, 19]);
}

console.log(ga());
console.log(ga().sort())
console.log(ga().sort(function (a, b) {
        return (b - a);
}));
console.log(ga().sort(function (a, b) {
        return (a - b);
}));
console.log(ga().sort(function (a, b) {
        if (a < b)
                return (-1);
        if (a > b)
                return (1);
        return (0);
}));

#!/usr/bin/node

var V = 'foo';

function printResult(func) {
        var res = null;
        try {
                res = func();
        } catch (err) {
                res = err.message;
        }
        console.log({
                name: func.name,
                result: res
        });
}

function normal() {
        return (
                V
        );
}
printResult(normal);

//Illustrates that multi-line needs ()
function returnNothing() {
        return
        V;
}
printResult(returnNothing);


/* This fails compilation with:
 *    SyntaxError: Unexpected token ;
function twoStatements() {
        return (V; V);
}
printResult(twoStatements);
*/

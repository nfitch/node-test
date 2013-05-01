function floatingfunction1() {
        console.log('outer1: ' + outer1);
}

function outerfunction1() {
        var outer1 = 'outer1';
        var innerfunction1 = function() {
                console.log('outer1: ' + outer1);
        }
        innerfunction1();

        //Causes a 'not defined error'
        //floatingfunction1();

        //Also causes a 'not defined error'
        //var ff = floatingfunction1();
        //ff();
}

function outerfunction2() {
        var outer2 = 'outer2';
        var innerfunction2 = function() {
                console.log('2:outer2: ' + outer2);
                var innerfunction22 = function() {
                        console.log('22:outer2: ' + outer2);
                        var innerfunction222 = function() {
                                console.log('222:outer2: ' + outer2);
                                var innerfunction2222 = function() {
                                        console.log('2222:outer2: ' + outer2);
                                }
                                innerfunction2222();
                        }
                        innerfunction222();
                }
                innerfunction22();
        }
        innerfunction2();
}

function loop() {
        var i = 'i';
        //Showing that block scope doesn't matter.
        for(var i = 0; i < 10; ++i) {
                var x = 'x';
        }
        console.log('i => ' + i + ', x => ' + x);
}

//Bad!
function makeFuncsLoop() {
        var fs = [];
        for(var i = 0; i < 3; ++i) {
                fs.push(function() {
                        console.log('Make Functs Loop: ' + i);
                });
        }
        return (fs);
}

function runLoopFuncts() {
        var fs = makeFuncsLoop();
        fs.forEach(function(f) {
                f();
        });
}

outerfunction1();
outerfunction2();
loop();
runLoopFuncts();

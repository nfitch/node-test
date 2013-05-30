// This show some control flow patterns for javascript.  It's much easier to use
// a library like async or vasync, but sometimes it's easier just to do this.

function asyncFunc(message, cb) {
        setTimeout(function () {
                console.log(message);
                cb();
        }, Math.floor(Math.random() * 11));
}

var messages = ['foo', 'bar', 'baz'];

// For each serial

function forEachSerial(cb) {
        var i = 0;
        function printNext() {
                var message = messages[i];

                if (!message) {
                        cb();
                        return;
                }

                asyncFunc(message, function () {
                        ++i;
                        printNext();
                });
        }
        printNext();
}

// When you don't care about the results... Will make messages print out
// in random order.
function forEachParallel(cb) {
        var done = 0;

        for (var i = 0; i < messages.length; ++i) {
                asyncFunc.bind(null, messages[i], function () {
                        ++done;
                        if (done === messages.length) {
                                cb();
                        }
                })();
        }
}

console.log('forEachSerial\n-------------');
forEachSerial(function () {
        console.log('-------------');

        console.log('forEachParallel\n---------------');
        forEachParallel(function () {
                console.log('---------------');
        });
});

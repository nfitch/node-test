#!/usr/bin/node

function throwError(b, cb) {
    if (b === 1) {
        throw new Error('thrown error');
    } else if (b === 2) {
        setImmediate(cb.bind(null, new Error('cb error')));
    } else {
        setImmediate(cb);
    }
}

function handleResponse(err) {
    if (err) {
        console.log(err, 'There was an error');
    } else {
        console.log('There was *no* error');
    }
}

function ewrap(f) {
    var args = Array.prototype.slice.call(arguments, 1);
    try {
        f.apply(null, args);
    } catch (e) {
        var cb = args[args.length - 1];
        if ((typeof (cb)) === 'function') {
            cb(e);
        }
    }
}

/*
throwError(0, handleResponse);
throwError(2, handleResponse);
try {
    throwError(1, handleResponse);
} catch (e) {
    console.log(e, 'caught an error');
}
*/

ewrap(throwError, 0, handleResponse);
ewrap(throwError, 2, handleResponse);
ewrap(throwError, 1, handleResponse);

var http = require('http');

//http.globalAgent.maxSockets = 1000;

var opts = {
    hostname: 'localhost',
    port: 8080,
    path: '/r',
    agent: false
};

function log(s) {
    console.log((new Date()).toISOString(), ' ', s);
}

var reqs = 0;
function request() {
    var req = http.request(opts);
    var called = false;
    function end() {
        if (!called) {
            ++reqs;
            called = true;
            setImmediate(request);
        }
    }
    req.on('response', function (res) {
//        log('GET success');
        end();
    });
    req.on('error', function () {
//        log('GET fail ' + err.code);
        end();
    });
    req.end();
}

function printReqs() {
    log(reqs);
    reqs = 0;
    setTimeout(printReqs, 1000);
}
setTimeout(printReqs, 1000);

request();

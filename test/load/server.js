var http = require('http');

function log(s) {
    console.log((new Date()).toISOString(), ' ', s);
}

var reqs = 0;
var s = http.createServer(function (req, res) {
//    log(req.url);
    reqs++;
    res.end('Ok');
});

function printReqs() {
    log(reqs);
    reqs = 0;
    setTimeout(printReqs, 1000);
}
setTimeout(printReqs, 1000);

s.listen(8080);

var restify = require('restify');

function log(s) {
    console.log((new Date()).toISOString(), ' ', s);
}

var reqs = 0;
var s = restify.createServer({
    name: 'restify',
    version: '0.0.1'
});

s.get('/r', function (req, res, next) {
//    log(req.url);
    reqs++;
    res.end('Ok');
    return (next());
});

function printReqs() {
    log(reqs);
    reqs = 0;
    setTimeout(printReqs, 1000);
}
setTimeout(printReqs, 1000);

s.listen(8080);

var http = require('http');

var conns = [];
var s = http.createServer(function (req, res) {
    console.log(req.url);
    if (req.url === '/shutdown') {
        console.log('shutting down server');
        //Kill all the sockets (see comments below)
        conns.forEach(function (socket) {
            socket.destroy();
        });
        s.on('close', function () {
            console.log('server closed');
        });
        s.close();
    }
    res.end();
});

s.listen(8080, function () {
    //This holds a connection open to the server.  So while the server is
    // has that connection open, it won't shut down.
    http.get('http://localhost:8080/shutdown', function (res) {
        console.log(res.statusCode);
    }).on('error', function (err) {
        //Since shutdown force-closes all connections, we expect an error
        console.log('HTTP Error: ' + err.code + ' (expected ECONNRESET)');
    });
});

//This keeps track of the open sockets so that it can close them down when
// the serve shuts down.  It's not really "nice" to force close connections
// but that's what this example is meant to show.
s.on('connection', function (socket) {
    conns.push(socket);
    socket.on('close', function () {
        var i = conns.indexOf(socket);
        if (i !== -1) {
            conns.splice(i, 1);
        }
    });
});

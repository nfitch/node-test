// https://gist.github.com/isaacs/4667685
var http = require('http');
var Stream = require('stream');
var net = require('net');

// a big fake stream
var r = new Stream();

r.paused = false;

r.pause = function() {
  r.paused = true;
  r.emit('pause');
  console.error('    r.pause');
};

r.resume = function() {
  r.paused = false;
  r.emit('resume');
  console.error('    r.resume');
  r._go();
};

r.chunks = 10000;

r._go = function() {
  if (this.paused || this.going)
    return;

  this.going = true;

  if (r.chunks-- === 0) {
    console.error('r.end');
    return this.emit('end');
  }

  this.emit('data', new Buffer(100));
  this.going = false;
  setTimeout(this._go.bind(this));
};

r.destroy = function() {};

var N = r.chunks * 100;

// relatively fast writer
var server = http.createServer(function(q, s) {
  console.error('got request', q.headers);
  // q.socket.removeAllListeners('timeout');
  q.socket.setTimeout(100, function() {
    console.error('socket timeout');
  });
  s.setHeader('content-length', N);
  s.on('drain', function() {
    //console.error('  response drain');
  });
  r.on('end', function() {
    console.error('  r end');
    s.end();
  });
  var wrote = 0;
  s.write = function(o) { return function(chunk) {
    wrote += chunk.length;
    //console.error('  response.write', wrote);
    return o.apply(this, arguments);
  }}(s.write);
  r.pipe(s);
  r.resume();
});

server.listen(1337, function() {
  console.error('listening');

  // rather slow reader
  var sock = net.connect(1337, function() {
    var req = [ 'GET /nfitch/public/1000000.txt HTTP/1.1',
                'host: manta-beta.joyent.com',
                '',
                '' ].join('\r\n');
    sock.write(req);
  });

  var read = 0;
  sock.on('data', function(chunk) {
    read += chunk.length;
    console.error('data', N, read, chunk.length);
    if (read === N + 105)
      return sock.end();
    sock.pause();
    setTimeout(function() {
      // console.error('resuming socket');
      sock.resume();
    }, 500);
  });
  sock.allowHalfOpen = false;

  sock.on('end', function() {
    console.error('end');
  });

  sock.on('close', function() {
    console.error('close');
    server.close();
  })
});

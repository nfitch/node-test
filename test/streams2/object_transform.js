// Copyright (c) 2013, Nate Fitch. All rights reserved.

var util = require('util');
var lstream = require('lstream');
var stream = require('stream');

function JsonTransform(a) {
    var self = this;
    //This is the line that will actually make this work :/
    stream.Transform.call(self, { 'objectMode': true });
}

util.inherits(JsonTransform, stream.Transform);

JsonTransform.prototype._transform = function (data, encoding, cb) {
    var self = this;
    this.push(JSON.stringify(data, null, 0) + '\n');
    cb();
}

function ObjectTransform(a) {
    var self = this;
    //This is the line that will actually make this work :/
    stream.Transform.call(self, { 'objectMode': true });
}

util.inherits(ObjectTransform, stream.Transform);

ObjectTransform.prototype._transform = function (data, encoding, cb) {
    var self = this;
    if (data === '') {
        return (cb());
    }
    console.log("<<" + data + ">>");
    this.push(JSON.parse(data));
    cb();
}

module.exports = {
    JsonTransform: JsonTransform,
    ObjectTransform: ObjectTransform
}

if (process.argv[1] === __filename) {
    var MemStream = require('./mem_stream');
    var ms = new MemStream([
        { 'value': 'foo' },
        'bar',
        { 'value': 'baz', 'x': 'X' },
        { 'val': 'value' }
    ]);

    var o = new ObjectTransform();
    ms.pipe(new JsonTransform()).pipe(new lstream()).pipe(o);

    var objs = [];
    o.on('readable', function () {
        var d;
        while (null !== (d = o.read())) {
            objs.push(d);
        }
    });

    o.on('end', function () {
        console.log("---- Objects ----");
        console.log(objs);
        console.log("--------------");
        console.log('Done!');
    });
}

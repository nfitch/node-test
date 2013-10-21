//Shows where each queue is a link in a chain, such that links further down the
// chain can consume several from the previous link.
//The problem with the way this is done is that the first element to be added
// will be consumed without waiting.  Could result in the first element being
// processed inefficiently.

var DEBUG = false;

function asyncFunc(todo, cb) {
    setTimeout(function () {
        cb();
    }, 1000);
}

///--- Queue
function Queue(name, num, next) {
    var self = this;
    if (name === undefined) {
        throw new Error('Queue.name is required.');
    }
    self.name = name;
    self.todo = [];
    self.doing = undefined;
    self.inProgress = false;
    self.num = num === undefined ? 1 : num;
    self.next = next;
}

Queue.prototype.append = function (data, cb) {
    var self = this;
    self.todo.push({
        'data': data,
        'cb': cb
    });
    self.consumeSome();
}

Queue.prototype.consumeSome = function () {
    var self = this;
    if (self.inProgress) {
        return;
    }

    //This self.num should be replaced with a callback so that the caller
    // can decide how many of the tasks can be taken off the queue for the
    // next invocation of asyncFunc
    self.doing = self.todo.splice(0, self.num);
    //The async func should be specified at Queue construct time.
    asyncFunc(self.doing, function () {
        if (DEBUG) {
            console.log({
                'name': self.name,
                'todo': doing.map(function (t) { return (t.data); })
            }, 'done with these.');
        }
        self.doing.forEach(function (t) {
            if (self.next) {
                self.next.append(t.data, t.cb);
            }
            else {
                t.cb();
            }
        });
        self.doing = undefined;
        self.inProgress = false;
        if (self.todo.length > 0) {
            self.consumeSome();
        }
    });
    self.inProgress = true;
}

Queue.prototype.toString = function () {
    var self = this;
    return (JSON.stringify({
        'name': self.name,
        'num': self.num,
        'doing': self.doing === undefined ? undefined :
            self.doing.map(function (d) { return (d.data); }),
        'todo': self.todo.map(function (d) { return (d.data); })
    }, null, 0));
}

///--- Main
var thirdQueue = new Queue('third', 3);
var secondQueue = new Queue('second', 5, thirdQueue);
var firstQueue = new Queue('first', 10, secondQueue);

/*
// Just do 20...
for (var i = 0; i < 20; ++i) {
    firstQueue.append(i, function () {
        console.log('done with ' + this);
    }.bind(i));
}
*/

//Do it continually...
var i = 0;
function addMore() {
    var howMany = Math.floor(Math.random() * (20 - 5 + 1)) + 5;
    var to = i + howMany;
    for (; i < to; ++i) {
        firstQueue.append(i, function () {
            if (DEBUG) {
                console.log('done with ' + this);
            }
        }.bind(i));
    }
    setTimeout(addMore, 5000);
}
addMore();

//Print every second to see what's happening on the queues...
function print() {
    console.log('---------------');
    console.log(firstQueue.toString());
    console.log(secondQueue.toString());
    console.log(thirdQueue.toString());
    setTimeout(function () {
        print();
    }, 1000);
}
print();

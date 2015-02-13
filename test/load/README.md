## Try This:

Run server like this:

```
$ node ./test/load/server.js
$ node ./test/load/restify_server.js
```

Run tests either with the client or ApacheBench:

```
$ node ./test/load/client.js
$ ab -c 100 -n 100000000 -r http://localhost:8080/r
```

#!/usr/bin/node

/**
 * The contents of the file when this is run will be:
 * shorta really long string
 *
 * Though counter-intuitive at first (it was for me), this is *correct*
 * behavior.  The resulting order of operations is:
 * open /var/tmp/foo
 * open /var/tmp/foo
 * write "i am a really long string" at offset 0
 * write "short" at offset 0
 * close /var/tmp/foo
 * close /var/tmp/foo
 *
 * Sometimes I forget how node doesn't protect you.
 */

var fs = require('fs');

fs.writeFile('/var/tmp/foo', 'i am a really long string', function (err) {
});

fs.writeFile('/var/tmp/foo', 'short', function (err) {
});

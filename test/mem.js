#!/usr/bin/env node

/*
--max_new_space_size (max size of the new generation (in kBytes))
type: int  default: 0
--max_old_space_size (max size of the old generation (in Mbytes))
type: int  default: 0
--max_executable_size (max size of executable memory (in Mbytes))
type: int  default: 0
*/

var arr = [];
while(true) {
    arr.push(new Buffer(4096));
}

# select-file-menu

Commandline file selector written in node.

With this script you can browse folders and select a file, to call a bash function and pass additional arguments.

![screenshot](https://github.com/im-barry/select-file-menu/blob/main/screenshot1.png?raw=true)

usage:

`$ node select-file-menu/index.js [bash_function_name] [addition_optional_argument] [addition_optional_argument]`

Make sure the bash function is exported in oder for this script to reach it.

`export -f bash_function_name`

#!/usr/bin/sh
(trap 'kill 0' SIGINT; python -m http.server -d src -b localhost 8080 & tsc -w)

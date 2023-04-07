@echo off
start tsc -w
start python -m http.server -d src -b localhost 8080

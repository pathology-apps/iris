#!/bin/bash
export TERM=xterm

# Set file descriptor limits (useful for high load servers)
ulimit -n 65536

# Set environment variables
export GOMAXPROCS=$(nproc)

if [ $ENV = 'local' ]
then
    echo "Application is watching changes and compiling in -race mode:"
    cd /app/server && CompileDaemon -log-prefix=false -build="go build -race -v -o ./build/${APP}" -command="./build/${APP}"
else
    echo "Application is running in production mode."
    cd /app/server && ./build/${APP}
fi


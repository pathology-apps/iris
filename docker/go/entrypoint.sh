#!/bin/sh
set -e

# Set file descriptor limits
# ulimit -n 65536

# Set environment variables
export GOMAXPROCS=$(nproc)

# Ensure APP is set
if [ -z "$APP" ]; then
    echo "ERROR: APP environment variable is not set"
    exit 1
fi

# Change to server directory
cd /app/server

# Download dependencies first
echo "Downloading Go dependencies..."
go mod download

# Ensure build directory exists
mkdir -p ./build

case "$ENV" in
    local|dev)
        echo "Starting application in development mode with race detection..."
        exec CompileDaemon \
            -directory="." \
            -build="go build -race -buildvcs=false -o ./build/${APP}" \
            -command="./build/${APP}" \
            -pattern="(.+\.go|.+\.c)$" \
            -graceful-kill \
            -log-prefix=false \
            -color
        ;;
    *)
        echo "Starting application in production mode..."
        if [ -f "./build/${APP}" ]; then
            echo "Using existing binary."
            ./build/${APP}
        else
            echo "Binary not found. Compiling..."
            if go build -v -buildvcs=false -o ./build/${APP}; then
                echo "Compilation successful. Running the application."
                ./build/${APP}
            else
                echo "ERROR: Compilation failed."
                exit 1
            fi
        fi
        ;;
esac

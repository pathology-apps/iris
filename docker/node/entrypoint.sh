#!/bin/bash
set -e

cd client

echo "Environment: $NODE_ENV"
# Check if node_modules directory is empty
if [ ! "$(ls -A /usr/src/app/client/node_modules)" ]; then
   echo "Installing dependencies..."
   pnpm install
fi

# Determine the command to run based on the environment variable
if [ "$NODE_ENV" = "production" ]; then
   exec pnpm run build
else
   exec pnpm run local
fi

#!/bin/bash

# Start the main server process
pnpm start &

# Start the webrtc process
pnpm start:webrtc &

# Start the websocket process
pnpm start:websocket &

# Wait for any process to exit
wait

# Exit with status of process that exited first
exit $?

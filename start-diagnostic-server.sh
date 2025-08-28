#!/bin/bash

# Check if Python is already running
if pgrep -f "python.*simple-server.py" > /dev/null; then
    echo "Server is already running. Restarting..."
    pkill -f "python.*simple-server.py"
    sleep 1
fi

# Make sure Python script is executable
chmod +x simple-server.py

# Execute with the available Python interpreter
if [ -x ./python3 ]; then
    echo "Starting server with local Python interpreter..."
    ./python3 simple-server.py
elif command -v python3 > /dev/null; then
    echo "Starting server with system Python 3..."
    python3 simple-server.py
elif command -v python > /dev/null; then
    echo "Starting server with system Python..."
    python simple-server.py
else
    echo "ERROR: No Python interpreter found!"
    exit 1
fi
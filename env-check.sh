#!/bin/bash

echo "===== ENVIRONMENT CHECK ====="
echo "Date: $(date)"
echo "User: $(whoami)"
echo "Current directory: $(pwd)"
echo "Available disk space: $(df -h . | tail -1)"

echo -e "\n===== INSTALLED PROGRAMS ====="
echo "Bash version: $BASH_VERSION"
which node || echo "node not found"
which npm || echo "npm not found"
which python || echo "python not found"
which python3 || echo "python3 not found"
which nc || echo "netcat not found"
which curl || echo "curl not found"

echo -e "\n===== ENVIRONMENT VARIABLES ====="
echo "NODE_ENV: ${NODE_ENV:-not set}"
echo "REPL_ID: ${REPL_ID:-not set}"
echo "REPL_SLUG: ${REPL_SLUG:-not set}"
echo "REPL_OWNER: ${REPL_OWNER:-not set}"
echo "PATH: $PATH"

echo -e "\n===== NETWORK TEST ====="
# Check if port 5000 is available
nc -z localhost 5000 2>/dev/null
if [ $? -eq 0 ]; then
  echo "Port 5000 is in use"
else
  echo "Port 5000 is available"
fi

# Check if we can make outbound connections
echo "Testing connection to example.com..."
curl -s -o /dev/null -w "Connection to example.com: %{http_code}\n" http://example.com

echo -e "\n===== FILESYSTEM TEST ====="
touch test-file.txt && echo "Can create files: Yes" || echo "Can create files: No"
rm test-file.txt && echo "Can delete files: Yes" || echo "Can delete files: No"

echo -e "\n===== CHECK COMPLETE ====="

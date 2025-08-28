#!/bin/bash

# Create a named pipe to communicate with netcat
if [ -e pipe ]; then
    rm pipe
fi
mkfifo pipe

# Print server start message
echo "Starting simple diagnostic HTTP server on port 5000..."
echo "Press Ctrl+C to stop"

# Function to handle a request
handle_request() {
    read request_line
    echo "Received request: $request_line"
    
    # Extract the path from the request line
    path=$(echo "$request_line" | awk '{print $2}')
    
    # Prepare the response based on the path
    if [ "$path" = "/" ] || [ "$path" = "/index.html" ]; then
        # HTML response for root path
        echo -e "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n<!DOCTYPE html>
<html>
<head>
    <title>Simple Bash Server</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .info { background: #e1f5fe; border-left: 4px solid #03a9f4; padding: 12px; margin: 15px 0; }
    </style>
</head>
<body>
    <h1>Simple Bash HTTP Server</h1>
    <div class='info'>
        <p>If you can see this page, the simple Bash server is running!</p>
    </div>
    <h2>Available Endpoints:</h2>
    <ul>
        <li><a href='/api/health'>/api/health</a> - Server health information</li>
        <li><a href='/api/env'>/api/env</a> - Environment variables</li>
    </ul>
    <p><small>Generated at: $(date)</small></p>
</body>
</html>"
    
    elif [ "$path" = "/api/health" ]; then
        # JSON response for health endpoint
        echo -e "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{
  \"status\": \"ok\",
  \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",
  \"environment\": \"$([ -n "$NODE_ENV" ] && echo "$NODE_ENV" || echo "development")\",
  \"replitMode\": $([ -n "$REPL_ID" ] && echo "true" || echo "false"),
  \"server\": {
    \"uptime\": \"$(uptime)\",
    \"hostname\": \"$(hostname)\",
    \"os\": \"$(uname -a)\"
  }
}"
    
    elif [ "$path" = "/api/env" ]; then
        # List environment variables as JSON
        echo -e "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{
  \"REPL_ID\": \"${REPL_ID:-not set}\",
  \"REPL_SLUG\": \"${REPL_SLUG:-not set}\",
  \"REPL_OWNER\": \"${REPL_OWNER:-not set}\",
  \"PORT\": \"${PORT:-not set}\",
  \"NODE_ENV\": \"${NODE_ENV:-not set}\",
  \"DATABASE_URL\": \"$([ -n "$DATABASE_URL" ] && echo "Available" || echo "Not set")\"
}"
    
    else
        # 404 Not Found for any other path
        echo -e "HTTP/1.1 404 Not Found\r\nContent-Type: application/json\r\n\r\n{
  \"error\": \"Not Found\",
  \"message\": \"The requested path '$path' does not exist on this server\"
}"
    fi
    
    # The rest of the request headers are not needed for this simple server
    while read line && [ "$line" != $'\r' ] && [ "$line" != "" ]; do
        :
    done
}

# Main server loop that listens for connections
while true; do
    cat pipe | nc -l -p 5000 | handle_request > pipe
done
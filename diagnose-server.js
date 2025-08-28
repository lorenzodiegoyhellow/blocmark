// Simple diagnostic server for troubleshooting
// Run with: node diagnose-server.js

const http = require('http');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 5000;

// Create a basic HTTP server
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  console.log(`${new Date().toISOString()} - ${req.method} ${pathname}`);

  try {
    // Route handling
    if (pathname === '/' || pathname === '/index.html') {
      // Home page
      sendHtml(res);
    } else if (pathname === '/api/health') {
      // Health check endpoint
      sendHealth(req, res);
    } else if (pathname === '/api/env') {
      // Environment variables endpoint
      sendEnv(res);
    } else if (pathname === '/api/headers') {
      // Request headers endpoint
      sendHeaders(req, res);
    } else {
      // 404 Not Found
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not Found', path: pathname }));
    }
  } catch (err) {
    console.error('Request error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal Server Error', message: err.message }));
  }
});

function sendHtml(res) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Diagnostic Server</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
    code { background-color: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
    pre { background-color: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
    .info { background: #e1f5fe; border-left: 4px solid #03a9f4; padding: 12px; margin: 15px 0; }
    .error { background: #ffebee; border-left: 4px solid #f44336; padding: 12px; margin: 15px 0; }
  </style>
</head>
<body>
  <h1>Diagnostic Server</h1>
  <div class="info">
    <p>If you can see this page, the diagnostic server is working correctly.</p>
  </div>
  
  <h2>API Endpoints:</h2>
  <ul>
    <li><a href="/api/health">/api/health</a> - Server health information</li>
    <li><a href="/api/env">/api/env</a> - Environment variables</li>
    <li><a href="/api/headers">/api/headers</a> - Request headers</li>
  </ul>
  
  <h2>Server Information:</h2>
  <ul>
    <li>Node Version: <code>${process.version}</code></li>
    <li>Platform: <code>${process.platform}</code></li>
    <li>Architecture: <code>${process.arch}</code></li>
    <li>PID: <code>${process.pid}</code></li>
    <li>Uptime: <code>${formatUptime(process.uptime())}</code></li>
  </ul>
  
  <h2>Host Environment:</h2>
  <ul>
    <li>Hostname: <code>${os.hostname()}</code></li>
    <li>OS Type: <code>${os.type()}</code></li>
    <li>OS Release: <code>${os.release()}</code></li>
    <li>OS Platform: <code>${os.platform()}</code></li>
    <li>Total Memory: <code>${formatMemory(os.totalmem())}</code></li>
    <li>Free Memory: <code>${formatMemory(os.freemem())}</code></li>
    <li>CPUs: <code>${os.cpus().length}</code></li>
  </ul>
  
  <p><small>Generated at: ${new Date().toISOString()}</small></p>
</body>
</html>`;

  res.end(html);
}

function sendHealth(req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  
  const health = {
    status: 'up',
    timestamp: new Date().toISOString(),
    hostname: os.hostname(),
    protocol: req.socket.encrypted ? 'https' : 'http',
    server: {
      node: process.version,
      pid: process.pid,
      uptime: formatUptime(process.uptime()),
      memoryUsage: process.memoryUsage(),
      platform: process.platform,
      arch: process.arch,
    },
    system: {
      platform: os.platform(),
      type: os.type(),
      release: os.release(),
      hostname: os.hostname(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        usage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2) + '%'
      },
      cpus: os.cpus().length
    }
  };
  
  res.end(JSON.stringify(health, null, 2));
}

function sendEnv(res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  
  // Filter environment variables for safety
  const env = {
    NODE_ENV: process.env.NODE_ENV || 'not set',
    PORT: process.env.PORT || 'not set',
    REPL_ID: process.env.REPL_ID || 'not set',
    REPL_SLUG: process.env.REPL_SLUG || 'not set',
    REPL_OWNER: process.env.REPL_OWNER || 'not set',
    DATABASE_URL: process.env.DATABASE_URL ? 'set (value hidden)' : 'not set',
    X_REPLIT_FORWARDED: process.env.X_REPLIT_FORWARDED || 'not set',
    REPLIT_CLUSTER: process.env.REPLIT_CLUSTER || 'not set',
    REPLIT_DEPLOYMENT_ID: process.env.REPLIT_DEPLOYMENT_ID || 'not set',
    REPL_LANGUAGE: process.env.REPL_LANGUAGE || 'not set',
    REPL_IMAGE: process.env.REPL_IMAGE || 'not set',
    HOME: process.env.HOME || 'not set',
    PATH: process.env.PATH || 'not set',
    PWD: process.env.PWD || 'not set',
  };
  
  res.end(JSON.stringify(env, null, 2));
}

function sendHeaders(req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(req.headers, null, 2));
}

// Helper functions
function formatUptime(uptime) {
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  
  return parts.join(' ');
}

function formatMemory(bytes) {
  const gigabytes = bytes / (1024 ** 3);
  if (gigabytes >= 1) {
    return `${gigabytes.toFixed(2)} GB`;
  }
  
  const megabytes = bytes / (1024 ** 2);
  if (megabytes >= 1) {
    return `${megabytes.toFixed(2)} MB`;
  }
  
  const kilobytes = bytes / 1024;
  return `${kilobytes.toFixed(2)} KB`;
}

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Diagnostic server running at http://0.0.0.0:${PORT}/`);
  console.log('Press Ctrl+C to stop');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server shutdown complete');
    process.exit(0);
  });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  // Keep server running despite errors
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  // Keep server running despite errors
});
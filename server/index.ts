import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupSecurity } from "./middleware/security.js";
import { setupCsrf } from "./middleware/csrf";
import { auditMiddleware } from "./middleware/audit";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

// Get directory names for ES modules environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const app = express();

// Enable 'trust proxy' for proper IP detection behind proxies and SSL detection
// This is crucial for Replit environment which uses proxies for HTTPS
app.set('trust proxy', true);

// Create a special handler for the root route to provide a more helpful
// error message specifically for SSL issues in Replit
app.get('/ssl-error-help', (req, res) => {
  // Record the request details for diagnostic purposes
  console.log('[SSL-HELP] Diagnostic details:', {
    path: req.path,
    host: req.headers.host,
    protocol: req.protocol,
    secure: req.secure,
    forwardedProto: req.headers['x-forwarded-proto'],
    userAgent: req.headers['user-agent'],
    referrer: req.headers.referer || 'none'
  });
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>SSL Error Helper for Replit</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        code { background-color: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
        pre { background-color: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
        .error { color: #cc0000; }
        .success { color: #00aa00; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 15px 0; }
        .info { background: #e1f5fe; border-left: 4px solid #03a9f4; padding: 12px; margin: 15px 0; }
        button { background: #4CAF50; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
        button:hover { background: #45a049; }
        .diagnostic-section { margin-top: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
      </style>
    </head>
    <body>
      <h1>SSL/HTTPS Troubleshooting for Replit</h1>
      <div class="warning">
        <strong>Connection Issue Detected:</strong> Your browser is likely showing an SSL_ERROR_RX_RECORD_TOO_LONG error.
      </div>
      
      <h2>Why This Happens</h2>
      <p>This error occurs when your browser tries to make an HTTPS connection to a server that only supports HTTP or isn't properly configured for HTTPS.</p>
      
      <div class="info">
        <p><strong>Current Status:</strong> You can see this page, which means the basic connection works but there may still be issues with other routes.</p>
      </div>
      
      <h2>Solutions to Try</h2>
      
      <h3>Option 1: Use the Replit Webview (Recommended)</h3>
      <p>The most reliable way to access this application:</p>
      <ol>
        <li>Go back to the Replit workspace UI</li>
        <li>Wait for the server to completely start (check the console logs)</li>
        <li>Use the "Webview" tab in Replit to view the app</li>
      </ol>
      
      <h3>Option 2: Try the Root URL</h3>
      <p>Click the button below to attempt to access the application's main page:</p>
      <p><a href="/" style="display: inline-block; background: #4CAF50; color: white; text-decoration: none; padding: 10px 15px; border-radius: 4px;">Go to Main Page</a></p>
      
      <h3>Option 3: Test API Connection</h3>
      <div>
        <button id="testApi">Test API Connection</button>
        <div id="apiResult" style="margin-top: 10px; display: none;"></div>
      </div>
      
      <div class="diagnostic-section">
        <h3>Technical Diagnostics</h3>
        <p>These details can help troubleshoot the issue:</p>
        <ul>
          <li>Current host: <code>${req.headers.host || 'unknown'}</code></li>
          <li>Protocol: <code>${req.protocol || 'unknown'}</code></li>
          <li>Secure: <code>${req.secure ? 'Yes' : 'No'}</code></li>
          <li>X-Forwarded-Proto: <code>${req.headers['x-forwarded-proto'] || 'Not set'}</code></li>
          <li>URL: <code>${req.originalUrl || 'unknown'}</code></li>
          <li>User-Agent: <code>${req.headers['user-agent'] || 'unknown'}</code></li>
          <li>Server running in: <code>${process.env.REPL_ID ? 'Replit environment' : 'Standard environment'}</code></li>
          <li>NODE_ENV: <code>${process.env.NODE_ENV || 'not set'}</code></li>
        </ul>
        
        <h4>Server Configuration</h4>
        <ul>
          <li>Security headers: <code>${process.env.REPL_ID ? 'Disabled for Replit' : 'Enabled'}</code></li>
          <li>CORS: <code>Configured with wildcard origin (*)</code></li>
          <li>HTTP to HTTPS redirection: <code>${process.env.REPL_ID ? 'Disabled for Replit' : 'Enabled in production'}</code></li>
        </ul>
      </div>
      
      <hr>
      <p><small>Generated at: ${new Date().toISOString()}</small></p>
      
      <script>
        // Simple API test function
        document.getElementById('testApi').addEventListener('click', function() {
          const resultDiv = document.getElementById('apiResult');
          resultDiv.style.display = 'block';
          resultDiv.innerHTML = '<p>Testing API connection...</p>';
          
          fetch('/api/health', {
            headers: {
              'Accept': 'application/json'
            }
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('API returned status ' + response.status);
            }
            return response.json();
          })
          .then(data => {
            resultDiv.innerHTML = '<p class="success">✅ API connection successful!</p><pre>' + JSON.stringify(data, null, 2) + '</pre>';
          })
          .catch(error => {
            resultDiv.innerHTML = '<p class="error">❌ API connection failed: ' + error.message + '</p>';
          });
        });
      </script>
    </body>
    </html>
  `);
});

// Special configuration for Replit environment
if (process.env.REPL_ID) {
  // This is just a log message to confirm this code is running
  console.log("Running in Replit environment - disabling HTTPS requirements");
  
  // Set environment variable to ensure Vite knows we're in development mode
  // This helps Vite avoid HTTPS-related issues in Replit
  process.env.NODE_ENV = 'development';
  
  // Special environment variables for Replit
  process.env.VITE_CJS_IGNORE_WARNING = '1';
  
  // DO NOT set PORT - let Replit infrastructure handle it
}

// Handle proper protocol in different environments
app.use((req: Request, res: Response, next: NextFunction) => {
  // For Replit environment, we need special handling and detailed logging
  if (process.env.REPL_ID) {
    // Log every request in Replit for debugging
    console.log(`[REPLIT-REQUEST] path=${req.path}, method=${req.method}, protocol=${req.protocol}, x-forwarded-proto=${req.headers['x-forwarded-proto']}`);
    
    // Serve our special diagnostic page at this route
    if (req.path === '/ssl-error-help') {
      return next();
    }
    
    // In Replit, we completely bypass all protocol checks and redirections
    return next();
  }
  
  // For production environments outside Replit
  if (process.env.NODE_ENV === 'production' && !process.env.REPL_ID) {
    if (!req.secure && req.headers['x-forwarded-proto'] !== 'https') {
      const httpsUrl = `https://${req.headers.host}${req.url}`;
      return res.redirect(301, httpsUrl);
    }
  }
  
  // For all other cases (development or already HTTPS), just continue
  next();
});

// Debug middleware to log all requests and responses
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`DEBUG [REQUEST] ${req.method} ${req.path}`);
  
  // Store the original end method
  const originalEnd = res.end;
  
  // Override the end method
  res.end = function(chunk?: any, encoding?: any, cb?: any): any {
    console.log(`DEBUG [RESPONSE] ${req.method} ${req.path} - Status: ${res.statusCode}`);
    return originalEnd.call(this, chunk, encoding, cb);
  };
  
  next();
});

// Security middleware will be applied in the async IIFE below

// Apply audit logging middleware
app.use(auditMiddleware);

// Increase JSON payload limit and add raw body for Stripe webhook
app.use((req, res, next) => {
  if (req.originalUrl === '/api/stripe-webhook') {
    next();
  } else {
    express.json({ limit: '50mb' })(req, res, next);
  }
});
app.use((req, res, next) => {
  if (req.originalUrl === '/api/stripe-webhook') {
    next();
  } else {
    express.urlencoded({ extended: false, limit: '50mb' })(req, res, next);
  }
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Apply security middleware first
  try {
    await setupSecurity(app);
    console.log('Security middleware setup complete');
  } catch (error) {
    console.error('Failed to setup security middleware:', error);
    process.exit(1);
  }

  const server = await registerRoutes(app);
  
  // Apply CSRF protection after routes are registered
  setupCsrf(app);

  // Error handling middleware
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Handle payload too large error specifically
    if (err.type === 'entity.too.large') {
      return res.status(413).json({
        message: 'Request entity too large. Please reduce the size of uploaded files.'
      });
    }
    
    // Special handling for SSL errors in Replit environment
    if (process.env.REPL_ID && 
       (err.code === 'SSL_ERROR_RX_RECORD_TOO_LONG' || 
        err.message?.includes('SSL') || 
        err.message?.includes('secure'))) {
      console.error('SSL/HTTPS error detected:', {
        url: req.originalUrl,
        headers: req.headers,
        error: err.message
      });
      
      // Redirect to the help page instead of returning JSON error
      return res.redirect('/ssl-error-help');
    }

    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Simplified port binding optimized for Replit
  // Replit always expects port 5000 for its workflows
  const port = 5000;
  
  // For Replit environments, always bind to 0.0.0.0 for proper accessibility
  server.listen(port, "0.0.0.0", () => {
    log(`📡 Server running on port ${port}`);
    
    // Additional helpful logging for Replit environment
    if (process.env.REPL_ID) {
      log(`🌐 You are running in a Replit environment`);
      
      // Determine the Replit domain
      const replitDomain = process.env.REPL_SLUG 
        ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER || 'id'}.repl.co` 
        : "https://[your-repl-name].[username].repl.co";
      
      log(`ℹ️ Access your app via the Replit webview tab or at: ${replitDomain}`);
      log(`💡 If you encounter SSL issues, try using the webview tab in Replit`);
      log(`🔧 SSL Diagnostics: ${replitDomain}/ssl-error-help`);
      log(`🩺 Health Check: ${replitDomain}/api/health`);
    }
  });
})();
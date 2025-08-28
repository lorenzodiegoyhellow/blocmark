#!/usr/bin/env python3
from http.server import BaseHTTPRequestHandler, HTTPServer
import os
import json
import socket
import platform
import sys
import subprocess
import time
import datetime
import traceback
import ssl
import logging
from urllib.parse import parse_qs, urlparse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger('diagnostic-server')

# Track server start time
SERVER_START_TIME = time.time()

# Track database connection status
DB_STATUS = {
    'status': 'unknown',
    'last_checked': None,
    'error': None
}

class DiagnosticHTTPRequestHandler(BaseHTTPRequestHandler):
    # Override the default server version header for security
    server_version = 'DiagnosticServer/1.0'
    sys_version = ''

    # Ensure all requests get logged
    def log_message(self, format, *args):
        logger.info(f"{self.client_address[0]} - {format % args}")
    
    def handle_error(self, status_code, message):
        """Handle errors with proper HTTP response"""
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        error_data = {
            'error': {
                'status': status_code,
                'message': message,
                'timestamp': datetime.datetime.now().isoformat()
            }
        }
        
        self.wfile.write(json.dumps(error_data, indent=2).encode('utf-8'))
    
    def send_json_response(self, data):
        """Helper to send JSON responses"""
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2).encode('utf-8'))

    def do_GET(self):
        """Handle GET requests"""
        try:
            parsed_url = urlparse(self.path)
            path = parsed_url.path
            query = parse_qs(parsed_url.query)
            
            logger.info(f"Received request: {self.command} {path}")
            
            # Route handling
            if path == '/' or path == '/index.html':
                # Home page
                self.send_home_page()
            elif path == '/api/health':
                # Health check endpoint
                self.send_health_info()
            elif path == '/api/env':
                # Environment variables endpoint
                self.send_env_info()
            elif path == '/api/headers':
                # Request headers endpoint
                self.send_headers_info()
            elif path == '/api/database':
                # Database status endpoint
                self.check_database()
            elif path == '/api/system':
                # System diagnostics endpoint
                self.send_system_info()
            elif path == '/api/ssl-diagnostics':
                # SSL diagnostics page
                self.send_ssl_diagnostics()
            elif path == '/ssl-test':
                # SSL test page
                self.send_ssl_test_page()
            else:
                # 404 Not Found
                self.handle_error(404, f"Path '{path}' not found")
                
        except Exception as e:
            logger.error(f"Error handling request: {str(e)}")
            logger.error(traceback.format_exc())
            self.handle_error(500, f"Internal server error: {str(e)}")

    def send_home_page(self):
        """Render the home page"""
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        
        # Get uptime
        uptime = time.time() - SERVER_START_TIME
        uptime_str = format_uptime(uptime)
        
        try:
            node_version = subprocess.check_output(['node', '--version']).decode('utf-8').strip()
        except:
            node_version = "Not installed"
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Diagnostic Server</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body {{ 
                    font-family: Arial, sans-serif; 
                    max-width: 900px; 
                    margin: 0 auto; 
                    padding: 20px; 
                    line-height: 1.6;
                    color: #333;
                }}
                h1, h2, h3 {{ 
                    color: #2c3e50;
                    margin-top: 1.5em;
                }}
                code {{ 
                    background-color: #f4f4f4; 
                    padding: 2px 4px; 
                    border-radius: 3px;
                    font-family: monospace;
                }}
                pre {{ 
                    background-color: #f4f4f4; 
                    padding: 15px; 
                    border-radius: 5px; 
                    overflow-x: auto;
                    border: 1px solid #ddd;
                }}
                .info {{ 
                    background: #e1f5fe; 
                    border-left: 4px solid #03a9f4; 
                    padding: 12px; 
                    margin: 15px 0;
                }}
                .warning {{ 
                    background: #fff3e0; 
                    border-left: 4px solid #ff9800; 
                    padding: 12px; 
                    margin: 15px 0;
                }}
                .error {{ 
                    background: #ffebee; 
                    border-left: 4px solid #f44336; 
                    padding: 12px; 
                    margin: 15px 0;
                }}
                .card {{
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 16px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }}
                .card-header {{
                    font-weight: bold;
                    margin-bottom: 10px;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 8px;
                }}
                table {{
                    width: 100%;
                    border-collapse: collapse;
                }}
                th, td {{
                    text-align: left;
                    padding: 8px;
                    border-bottom: 1px solid #ddd;
                }}
                th {{
                    background-color: #f4f4f4;
                }}
                a {{
                    color: #0078d7;
                    text-decoration: none;
                }}
                a:hover {{
                    text-decoration: underline;
                }}
                .container {{
                    display: flex;
                    flex-wrap: wrap;
                    gap: 16px;
                }}
                .column {{
                    flex: 1;
                    min-width: 250px;
                }}
                .status-ok {{
                    color: #00c853;
                    font-weight: bold;
                }}
                .status-warn {{
                    color: #ff9800;
                    font-weight: bold;
                }}
                .status-error {{
                    color: #f44336;
                    font-weight: bold;
                }}
            </style>
        </head>
        <body>
            <h1>Diagnostic Server</h1>
            
            <div class="info">
                <p>✅ The diagnostic server is <strong>operational</strong>.</p>
                <p>Server has been running for <strong>{uptime_str}</strong>.</p>
            </div>

            <div class="container">
                <div class="column">
                    <div class="card">
                        <div class="card-header">Quick Diagnostics</div>
                        <table>
                            <tr>
                                <td>Server Status</td>
                                <td><span class="status-ok">Running</span></td>
                            </tr>
                            <tr>
                                <td>Python Version</td>
                                <td>{platform.python_version()}</td>
                            </tr>
                            <tr>
                                <td>Node.js Version</td>
                                <td>{node_version}</td>
                            </tr>
                            <tr>
                                <td>Database</td>
                                <td>{'Available' if 'DATABASE_URL' in os.environ else 'Not configured'}</td>
                            </tr>
                            <tr>
                                <td>Protocol</td>
                                <td>{self.headers.get('X-Forwarded-Proto', 'http')}</td>
                            </tr>
                        </table>
                    </div>
                </div>
                
                <div class="column">
                    <div class="card">
                        <div class="card-header">API Endpoints</div>
                        <ul>
                            <li><a href="/api/health">/api/health</a> - Health status</li>
                            <li><a href="/api/env">/api/env</a> - Environment variables</li>
                            <li><a href="/api/headers">/api/headers</a> - Request headers</li>
                            <li><a href="/api/system">/api/system</a> - System information</li>
                            <li><a href="/api/database">/api/database</a> - Database status</li>
                            <li><a href="/api/ssl-diagnostics">/api/ssl-diagnostics</a> - SSL info</li>
                            <li><a href="/ssl-test">/ssl-test</a> - HTTPS/SSL test page</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <h2>Request Information</h2>
            <div class="card">
                <table>
                    <tr>
                        <td>Client Address</td>
                        <td>{self.client_address[0]}</td>
                    </tr>
                    <tr>
                        <td>Request Time</td>
                        <td>{self.date_time_string()}</td>
                    </tr>
                    <tr>
                        <td>Protocol Version</td>
                        <td>HTTP/{self.request_version}</td>
                    </tr>
                    <tr>
                        <td>Host Header</td>
                        <td>{self.headers.get('Host', 'Not provided')}</td>
                    </tr>
                    <tr>
                        <td>User Agent</td>
                        <td>{self.headers.get('User-Agent', 'Not provided')}</td>
                    </tr>
                    <tr>
                        <td>X-Forwarded-Proto</td>
                        <td>{self.headers.get('X-Forwarded-Proto', 'Not provided')}</td>
                    </tr>
                    <tr>
                        <td>X-Forwarded-For</td>
                        <td>{self.headers.get('X-Forwarded-For', 'Not provided')}</td>
                    </tr>
                </table>
            </div>
            
            <h2>Server Environment</h2>
            <div class="container">
                <div class="column">
                    <div class="card">
                        <div class="card-header">System Information</div>
                        <table>
                            <tr>
                                <td>Hostname</td>
                                <td>{socket.gethostname()}</td>
                            </tr>
                            <tr>
                                <td>Platform</td>
                                <td>{platform.platform()}</td>
                            </tr>
                            <tr>
                                <td>Python</td>
                                <td>{platform.python_version()}</td>
                            </tr>
                            <tr>
                                <td>Node.js</td>
                                <td>{node_version}</td>
                            </tr>
                        </table>
                    </div>
                </div>
                
                <div class="column">
                    <div class="card">
                        <div class="card-header">Replit Information</div>
                        <table>
                            <tr>
                                <td>REPL_ID</td>
                                <td>{os.environ.get('REPL_ID', 'Not set')}</td>
                            </tr>
                            <tr>
                                <td>REPL_SLUG</td>
                                <td>{os.environ.get('REPL_SLUG', 'Not set')}</td>
                            </tr>
                            <tr>
                                <td>REPL_OWNER</td>
                                <td>{os.environ.get('REPL_OWNER', 'Not set')}</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
            
            <div class="warning">
                <p><strong>HTTPS/SSL Diagnostics</strong>: If you're experiencing SSL-related issues, check the
                <a href="/api/ssl-diagnostics">SSL diagnostics page</a> or try the <a href="/ssl-test">SSL test page</a>.</p>
            </div>
            
            <p><small>Generated at: {datetime.datetime.now().isoformat()}</small></p>
        </body>
        </html>
        """
        
        self.wfile.write(html.encode('utf-8'))

    def send_health_info(self):
        """API endpoint for health status"""
        # Try to detect Node.js
        node_version = "Not installed"
        try:
            node_version = subprocess.check_output(['node', '--version']).decode('utf-8').strip()
        except:
            pass
        
        # Calculate uptime
        uptime = time.time() - SERVER_START_TIME
        
        health_data = {
            'status': 'ok',
            'timestamp': datetime.datetime.now().isoformat(),
            'hostname': socket.gethostname(),
            'request': {
                'protocol': self.headers.get('X-Forwarded-Proto', 'http'),
                'host': self.headers.get('Host', 'unknown'),
                'client_ip': self.client_address[0],
                'forwarded_for': self.headers.get('X-Forwarded-For', None)
            },
            'environment': os.environ.get('NODE_ENV', 'development'),
            'replit': {
                'is_replit': 'REPL_ID' in os.environ,
                'repl_id': os.environ.get('REPL_ID', None),
                'repl_slug': os.environ.get('REPL_SLUG', None),
                'repl_owner': os.environ.get('REPL_OWNER', None)
            },
            'server': {
                'uptime_seconds': uptime,
                'uptime_formatted': format_uptime(uptime),
                'python_version': platform.python_version(),
                'node_version': node_version, 
                'platform': platform.platform(),
                'system': platform.system(),
                'machine': platform.machine(),
                'processor': platform.processor()
            },
            'database': {
                'is_configured': 'DATABASE_URL' in os.environ,
                'status': DB_STATUS['status'],
                'last_checked': DB_STATUS['last_checked'],
                'error': DB_STATUS['error']
            }
        }
        
        self.send_json_response(health_data)

    def send_env_info(self):
        """API endpoint for environment variables"""
        # Filter environment variables for security
        env_data = {
            'NODE_ENV': os.environ.get('NODE_ENV', 'not set'),
            'PORT': os.environ.get('PORT', 'not set'),
            'REPL_ID': os.environ.get('REPL_ID', 'not set'),
            'REPL_SLUG': os.environ.get('REPL_SLUG', 'not set'),
            'REPL_OWNER': os.environ.get('REPL_OWNER', 'not set'),
            'DATABASE_URL': 'Available' if 'DATABASE_URL' in os.environ else 'Not set',
            'X_REPLIT_FORWARDED': os.environ.get('X_REPLIT_FORWARDED', 'not set'),
            'REPLIT_CLUSTER': os.environ.get('REPLIT_CLUSTER', 'not set'),
            'REPLIT_DEPLOYMENT_ID': os.environ.get('REPLIT_DEPLOYMENT_ID', 'not set'),
            'REPL_LANGUAGE': os.environ.get('REPL_LANGUAGE', 'not set'),
            'REPL_IMAGE': os.environ.get('REPL_IMAGE', 'not set'),
            'HOME': os.environ.get('HOME', 'not set'),
            'PATH': os.environ.get('PATH', 'not set'),
            'PWD': os.environ.get('PWD', 'not set'),
        }
        
        self.send_json_response(env_data)

    def send_headers_info(self):
        """API endpoint for request headers"""
        headers = dict(self.headers)
        self.send_json_response(headers)
    
    def send_system_info(self):
        """API endpoint for system information"""
        try:
            memory_info = {}
            try:
                meminfo = {}
                with open('/proc/meminfo', 'r') as f:
                    for line in f:
                        parts = line.split(':')
                        if len(parts) == 2:
                            meminfo[parts[0].strip()] = parts[1].strip()
                
                memory_info = {
                    'total': meminfo.get('MemTotal', 'unknown'),
                    'free': meminfo.get('MemFree', 'unknown'),
                    'available': meminfo.get('MemAvailable', 'unknown'),
                    'buffers': meminfo.get('Buffers', 'unknown'),
                    'cached': meminfo.get('Cached', 'unknown')
                }
            except:
                memory_info = {'error': 'Unable to read memory information'}
            
            cpu_info = {}
            try:
                cpuinfo = {}
                with open('/proc/cpuinfo', 'r') as f:
                    for line in f:
                        parts = line.split(':')
                        if len(parts) == 2:
                            cpuinfo[parts[0].strip()] = parts[1].strip()
                
                cpu_info = {
                    'model': cpuinfo.get('model name', 'unknown'),
                    'cores': cpuinfo.get('cpu cores', 'unknown'),
                    'mhz': cpuinfo.get('cpu MHz', 'unknown')
                }
            except:
                cpu_info = {'error': 'Unable to read CPU information'}
            
            # Process information
            process_info = {
                'pid': os.getpid(),
                'ppid': os.getppid(),
                'exe': sys.executable,
                'python_version': sys.version,
                'argv': sys.argv,
                'cwd': os.getcwd()
            }
            
            # Network information
            # server_address is a tuple (host, port)
            server_address = self.server.server_address if hasattr(self.server, 'server_address') else ('unknown', 0)
            try:
                listen_address = server_address[0] if isinstance(server_address, tuple) and len(server_address) > 0 else 'unknown'
                listen_port = server_address[1] if isinstance(server_address, tuple) and len(server_address) > 1 else 0
            except (IndexError, TypeError):
                listen_address = 'unknown'
                listen_port = 0
                
            network_info = {
                'hostname': socket.gethostname(),
                'fqdn': socket.getfqdn(),
                'listen_port': listen_port,
                'listen_address': listen_address
            }
            
            system_data = {
                'platform': {
                    'system': platform.system(),
                    'node': platform.node(),
                    'release': platform.release(),
                    'version': platform.version(),
                    'machine': platform.machine(),
                    'processor': platform.processor(),
                    'architecture': platform.architecture(),
                    'python_version': platform.python_version(),
                    'python_implementation': platform.python_implementation()
                },
                'memory': memory_info,
                'cpu': cpu_info,
                'process': process_info,
                'network': network_info,
                'uptime': format_uptime(time.time() - SERVER_START_TIME)
            }
            
            self.send_json_response(system_data)
        except Exception as e:
            logger.error(f"Error in system_info: {str(e)}")
            self.handle_error(500, f"Error getting system information: {str(e)}")
    
    def check_database(self):
        """Check the database connection and return status"""
        if 'DATABASE_URL' not in os.environ:
            DB_STATUS['status'] = 'not_configured'
            DB_STATUS['last_checked'] = datetime.datetime.now().isoformat()
            DB_STATUS['error'] = "DATABASE_URL environment variable not set"
            
            self.send_json_response({
                'status': 'not_configured',
                'message': 'Database is not configured (DATABASE_URL not set)',
                'timestamp': DB_STATUS['last_checked']
            })
            return
        
        try:
            # Try to check if we can connect to the database using psycopg2
            # Only import if needed to avoid dependency issues
            try:
                import psycopg2
            except ImportError:
                logger.error("psycopg2 module not found. Attempting to install it...")
                
                try:
                    # Try to install psycopg2 automatically
                    import subprocess
                    subprocess.check_call([sys.executable, "-m", "pip", "install", "psycopg2-binary"])
                    logger.info("Successfully installed psycopg2-binary")
                    import psycopg2
                except Exception as install_err:
                    DB_STATUS['status'] = 'module_install_failed'
                    DB_STATUS['last_checked'] = datetime.datetime.now().isoformat()
                    DB_STATUS['error'] = f"Failed to install psycopg2: {str(install_err)}"
                    
                    # Get pip version safely
                    pip_version = "unknown"
                    try:
                        import subprocess as subp  # Local import to ensure it's available
                        pip_version = subp.check_output([sys.executable, "-m", "pip", "--version"]).decode().strip()
                    except Exception as pip_err:
                        logger.error(f"Error getting pip version: {str(pip_err)}")
                        pip_version = f"Error: {str(pip_err)}"
                    
                    self.send_json_response({
                        'status': 'module_install_failed',
                        'message': f'Failed to install psycopg2 module: {str(install_err)}',
                        'timestamp': DB_STATUS['last_checked'],
                        'pip_version': pip_version
                    })
                    return
            
            db_url = os.environ['DATABASE_URL']
            conn = None
            cursor = None
            
            try:
                logger.info("Attempting database connection...")
                conn = psycopg2.connect(db_url)
                cursor = conn.cursor()
                
                # Get database info
                logger.info("Querying database version...")
                cursor.execute("SELECT version();")
                version_result = cursor.fetchone()
                version = version_result[0] if version_result else "Unknown"
                
                logger.info("Querying database name...")
                cursor.execute("SELECT current_database();")
                db_name_result = cursor.fetchone()
                db_name = db_name_result[0] if db_name_result else "Unknown"
                
                logger.info("Querying database user...")
                cursor.execute("SELECT current_user;")
                db_user_result = cursor.fetchone()
                db_user = db_user_result[0] if db_user_result else "Unknown"
                
                DB_STATUS['status'] = 'ok'
                DB_STATUS['last_checked'] = datetime.datetime.now().isoformat()
                DB_STATUS['error'] = None
                
                self.send_json_response({
                    'status': 'ok',
                    'message': 'Successfully connected to the database',
                    'timestamp': DB_STATUS['last_checked'],
                    'db_info': {
                        'version': version,
                        'database': db_name,
                        'user': db_user
                    }
                })
            finally:
                # Ensure connections are properly closed
                if cursor:
                    logger.info("Closing database cursor...")
                    cursor.close()
                if conn:
                    logger.info("Closing database connection...")
                    conn.close()
            
        except Exception as e:
            logger.error(f"Database connection error: {str(e)}")
            logger.error(traceback.format_exc())
            
            DB_STATUS['status'] = 'error'
            DB_STATUS['last_checked'] = datetime.datetime.now().isoformat()
            DB_STATUS['error'] = str(e)
            
            self.send_json_response({
                'status': 'error',
                'message': f'Error connecting to database: {str(e)}',
                'timestamp': DB_STATUS['last_checked'],
                'error_details': traceback.format_exc()
            })

    def send_ssl_diagnostics(self):
        """API endpoint for SSL/HTTPS diagnostics"""
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        # Get information about SSL capabilities and environment
        ssl_info = {
            'request': {
                'protocol': self.headers.get('X-Forwarded-Proto', 'http'),
                'host': self.headers.get('Host', 'unknown'),
                'scheme': 'https' if self.headers.get('X-Forwarded-Proto') == 'https' else 'http',
                'is_secure': self.headers.get('X-Forwarded-Proto') == 'https',
                'forwarded_host': self.headers.get('X-Forwarded-Host', None),
                'forwarded_proto': self.headers.get('X-Forwarded-Proto', None),
                'replit_forwarded': self.headers.get('X-Replit-Forwarded', None)
            },
            'server': {
                'python_ssl_enabled': ssl is not None,
                'ssl_version': ssl.OPENSSL_VERSION if ssl is not None else None,
                'ssl_version_info': ssl.OPENSSL_VERSION_INFO if ssl is not None else None
            },
            'environment': {
                'replit': 'REPL_ID' in os.environ,
                'repl_id': os.environ.get('REPL_ID', None),
                'repl_slug': os.environ.get('REPL_SLUG', None)
            },
            'certificates': {
                'default_verify_paths': ssl.get_default_verify_paths() if ssl is not None else None
            }
        }
        
        self.wfile.write(json.dumps(ssl_info, indent=2).encode('utf-8'))

    def send_ssl_test_page(self):
        """Render a dedicated SSL/HTTPS test page"""
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        
        is_secure = self.headers.get('X-Forwarded-Proto') == 'https'
        host = self.headers.get('Host', 'unknown')
        protocol = self.headers.get('X-Forwarded-Proto', 'http')
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>SSL/HTTPS Test Page</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body {{ 
                    font-family: Arial, sans-serif; 
                    max-width: 900px; 
                    margin: 0 auto; 
                    padding: 20px; 
                    line-height: 1.6;
                    color: #333;
                }}
                h1, h2, h3 {{ 
                    color: #2c3e50;
                    margin-top: 1.5em;
                }}
                code {{ 
                    background-color: #f4f4f4; 
                    padding: 2px 4px; 
                    border-radius: 3px;
                    font-family: monospace;
                }}
                pre {{ 
                    background-color: #f4f4f4; 
                    padding: 15px; 
                    border-radius: 5px; 
                    overflow-x: auto;
                    border: 1px solid #ddd;
                }}
                .info {{ 
                    background: #e1f5fe; 
                    border-left: 4px solid #03a9f4; 
                    padding: 12px; 
                    margin: 15px 0;
                }}
                .warning {{ 
                    background: #fff3e0; 
                    border-left: 4px solid #ff9800; 
                    padding: 12px; 
                    margin: 15px 0;
                }}
                .error {{ 
                    background: #ffebee; 
                    border-left: 4px solid #f44336; 
                    padding: 12px; 
                    margin: 15px 0;
                }}
                .success {{ 
                    background: #e8f5e9; 
                    border-left: 4px solid #4caf50; 
                    padding: 12px; 
                    margin: 15px 0;
                }}
                .card {{
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 16px;
                    margin: 16px 0;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }}
                .card-header {{
                    font-weight: bold;
                    margin-bottom: 10px;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 8px;
                }}
                table {{
                    width: 100%;
                    border-collapse: collapse;
                }}
                th, td {{
                    text-align: left;
                    padding: 8px;
                    border-bottom: 1px solid #ddd;
                }}
                th {{
                    background-color: #f4f4f4;
                }}
                a {{
                    color: #0078d7;
                    text-decoration: none;
                }}
                a:hover {{
                    text-decoration: underline;
                }}
                #check-results {{
                    margin-top: 20px;
                }}
            </style>
            <script>
                // JavaScript to test fetch API with HTTPS
                document.addEventListener('DOMContentLoaded', function() {{
                    const resultDiv = document.getElementById('check-results');
                    
                    function addResult(status, message) {{
                        const div = document.createElement('div');
                        div.className = status === 'success' ? 'success' : status === 'warning' ? 'warning' : 'error';
                        div.innerHTML = message;
                        resultDiv.appendChild(div);
                    }}
                    
                    // Check if we're using HTTPS
                    const isSecure = window.location.protocol === 'https:';
                    if (isSecure) {{
                        addResult('success', '<strong>✅ Current connection:</strong> Using HTTPS successfully.');
                    }} else {{
                        addResult('error', '<strong>❌ Current connection:</strong> Not using HTTPS. ' +
                            'This page was loaded via HTTP instead of HTTPS.');
                    }}
                    
                    // Display protocol info
                    addResult('info', '<strong>🔍 Protocol details:</strong><br>' +
                        'Window location protocol: <code>' + window.location.protocol + '</code><br>' +
                        'Server-reported protocol: <code>{protocol}</code><br>' +
                        'Host header: <code>{host}</code>');
                    
                    // Check if current host matches expected Replit domain pattern
                    const isReplitDomain = /\.replit\.app$|\.repl\.co$/.test(window.location.hostname);
                    if (isReplitDomain) {{
                        addResult('info', '<strong>ℹ️ Domain:</strong> Running on a Replit domain: <code>' + 
                            window.location.hostname + '</code>');
                    }}
                    
                    // Test same-origin fetch
                    fetch('/api/health')
                        .then(response => {{
                            if (!response.ok) throw new Error('Network response was not ok');
                            return response.json();
                        }})
                        .then(data => {{
                            addResult('success', '<strong>✅ API fetch:</strong> Successfully fetched data from the API endpoint.');
                        }})
                        .catch(error => {{
                            addResult('error', '<strong>❌ API fetch:</strong> Error fetching from API: ' + error.message);
                        }});
                }});
            </script>
        </head>
        <body>
            <h1>SSL/HTTPS Test Page</h1>
            
            {'<div class="success"><p><strong>✅ Secure Connection:</strong> You are currently using HTTPS.</p></div>' 
              if is_secure else 
             '<div class="error"><p><strong>❌ Not Secure:</strong> You are currently using HTTP instead of HTTPS.</p></div>'}
            
            <div class="card">
                <div class="card-header">Connection Information</div>
                <table>
                    <tr>
                        <td>Protocol</td>
                        <td><code>{protocol}</code></td>
                    </tr>
                    <tr>
                        <td>Host</td>
                        <td><code>{host}</code></td>
                    </tr>
                    <tr>
                        <td>Secure</td>
                        <td><code>{str(is_secure)}</code></td>
                    </tr>
                    <tr>
                        <td>Current URL</td>
                        <td><code>{protocol}://{host}/ssl-test</code></td>
                    </tr>
                </table>
            </div>
            
            <h2>Headers</h2>
            <div class="card">
                <pre>{json.dumps(dict(self.headers), indent=2)}</pre>
            </div>
            
            <h2>Client-Side SSL Checks</h2>
            <p>The following checks are performed by JavaScript in your browser:</p>
            <div id="check-results">
                <!-- Results will be added here by JavaScript -->
            </div>
            
            <h2>Common SSL Issues and Solutions</h2>
            <div class="card">
                <div class="card-header">Problem: Mixed Content</div>
                <p>If your site loads over HTTPS but tries to load resources (images, scripts, etc.) over HTTP, browsers will block them.</p>
                <p><strong>Solution:</strong> Make sure all resources are loaded using HTTPS or protocol-relative URLs (<code>//example.com/resource</code>).</p>
            </div>
            
            <div class="card">
                <div class="card-header">Problem: Redirect Loop</div>
                <p>Sometimes servers can get stuck in a redirect loop when handling HTTP to HTTPS redirections.</p>
                <p><strong>Solution:</strong> Check your server configuration and make sure X-Forwarded-Proto header is being respected.</p>
            </div>
            
            <div class="card">
                <div class="card-header">Problem: Replit Environment</div>
                <p>In Replit, SSL termination happens at the proxy level, and your app receives regular HTTP requests. The proxy adds X-Forwarded-Proto headers.</p>
                <p><strong>Solution:</strong> Your server should check for <code>X-Forwarded-Proto: https</code> instead of directly checking for HTTPS.</p>
                <pre>
// Express.js example:
app.use((req, res, next) => {{
  if (req.headers['x-forwarded-proto'] === 'https') {{
    // Request came in as HTTPS
    next();
  }} else {{
    // Handle as needed: redirect or error
  }}
}});</pre>
            </div>
            
            <p><a href="/">← Back to Diagnostic Home</a></p>
            
            <p><small>Generated at: {datetime.datetime.now().isoformat()}</small></p>
        </body>
        </html>
        """
        
        self.wfile.write(html.encode('utf-8'))

# Helper functions
def format_uptime(seconds):
    """Format uptime in seconds to a readable string"""
    days, remainder = divmod(seconds, 86400)
    hours, remainder = divmod(remainder, 3600)
    minutes, seconds = divmod(remainder, 60)
    
    parts = []
    if days > 0:
        parts.append(f"{int(days)}d")
    if hours > 0:
        parts.append(f"{int(hours)}h")
    if minutes > 0:
        parts.append(f"{int(minutes)}m")
    parts.append(f"{int(seconds)}s")
    
    return " ".join(parts)

def run_server(port=5000):
    """Start the HTTP server"""
    server_address = ('0.0.0.0', port)
    httpd = HTTPServer(server_address, DiagnosticHTTPRequestHandler)
    
    logger.info(f"Starting diagnostic server on http://0.0.0.0:{port}/")
    logger.info("Press Ctrl+C to stop the server")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logger.info("Server shutdown requested")
    finally:
        httpd.server_close()
        logger.info("Server has been stopped")

if __name__ == '__main__':
    try:
        # Get port from environment variable or use default
        port = int(os.environ.get('PORT', 5000))
        
        # Additional startup checks
        logger.info(f"Starting diagnostic server (Python {platform.python_version()})")
        logger.info(f"Hostname: {socket.gethostname()}")
        logger.info(f"Platform: {platform.platform()}")
        
        # Detect environment
        if 'REPL_ID' in os.environ:
            logger.info(f"Running in Replit environment (REPL_ID: {os.environ.get('REPL_ID')})")
            logger.info(f"REPL_SLUG: {os.environ.get('REPL_SLUG', 'Not set')}")
            logger.info(f"REPL_OWNER: {os.environ.get('REPL_OWNER', 'Not set')}")
        
        # Check database connection at startup
        if 'DATABASE_URL' in os.environ:
            logger.info("Database URL is configured in environment variables")
            # Sanitize the URL for logging (hide password)
            db_url = os.environ.get('DATABASE_URL', '')
            if '://' in db_url and '@' in db_url:
                prefix = db_url.split('://')[0]
                credentials = db_url.split('://')[1].split('@')[0]
                if ':' in credentials:
                    username = credentials.split(':')[0]
                    rest = db_url.split('@')[1]
                    sanitized_url = f"{prefix}://{username}:****@{rest}"
                    logger.info(f"Database connection string format: {sanitized_url}")
        else:
            logger.warning("Database URL is not configured in environment variables")
        
        # Log available environment variables for debugging
        env_vars = []
        for key in sorted(os.environ.keys()):
            if key.startswith(('REPL_', 'PORT', 'PATH', 'DATABASE_', 'NODE_')):
                # Don't log sensitive values
                if 'URL' in key or 'TOKEN' in key or 'KEY' in key or 'SECRET' in key or 'PASS' in key:
                    env_vars.append(f"{key}=<hidden>")
                else:
                    env_vars.append(f"{key}={os.environ[key]}")
        logger.info(f"Environment variables: {', '.join(env_vars)}")
        
        # Run the server, handling keyboard interrupts
        try:
            run_server(port)
        except KeyboardInterrupt:
            logger.info("Server stopped by keyboard interrupt")
            sys.exit(0)
            
    except Exception as e:
        logger.error(f"Unhandled exception during server startup: {str(e)}")
        logger.error(traceback.format_exc())
        sys.exit(1)
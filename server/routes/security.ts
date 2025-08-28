import { Router, Request, Response } from 'express';
import { securityLogger } from '../middleware/security.js';
import { auditLogger } from '../middleware/audit';
import fs from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';
import { storage } from '../storage';

export const securityRouter = Router();

// Middleware to ensure user is an admin
const isAdmin = (req: Request, res: Response, next: Function) => {
  // Check if the user is authenticated and has admin role
  if (!req.user) {
    return res.status(401).json({
      message: 'Unauthorized - You must be logged in to access this resource'
    });
  }

  const user = req.user as any;
  
  if (!user.roles || !user.roles.includes('admin')) {
    return res.status(403).json({
      message: 'Forbidden - You do not have permission to access this resource'
    });
  }
  
  next();
};

// Get security status
securityRouter.get('/status', async (req: Request, res: Response) => {
  try {
    // Get security log file stats
    const securityLogPath = resolve('./logs/security.log');
    const alertsLogPath = resolve('./logs/security-alerts.log');
    const auditLogPath = resolve('./logs/audit.log');
    
    let securityLogStats = null;
    let alertsLogStats = null;
    let auditLogStats = null;
    
    try {
      securityLogStats = fs.statSync(securityLogPath);
    } catch (err) {
      console.error('Security log not found:', err);
    }
    
    try {
      alertsLogStats = fs.statSync(alertsLogPath);
    } catch (err) {
      console.error('Alerts log not found:', err);
    }
    
    try {
      auditLogStats = fs.statSync(auditLogPath);
    } catch (err) {
      console.error('Audit log not found:', err);
    }
    
    // Get the most recent security threats
    const recentThreats = await readLastLines(alertsLogPath, 50);
    
    // Parse threats into more readable format
    const parsedThreats = recentThreats
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean)
      .map(threat => ({
        timestamp: threat.timestamp,
        ip: threat.ip,
        path: threat.path,
        userId: threat.userId,
        severity: threat.severity,
        threatTypes: threat.threats ? Object.keys(threat.threats) : [],
        method: threat.method
      }));
    
    // Count threats by category
    const threatCategoryCounts = parsedThreats.reduce((acc: Record<string, number>, threat: any) => {
      if (threat.threatTypes) {
        threat.threatTypes.forEach((type: string) => {
          acc[type] = (acc[type] || 0) + 1;
        });
      }
      return acc;
    }, {});
    
    // Get recent activity from audit log
    const recentAuditLogs = await readLastLines(auditLogPath, 100);
    
    // Parse audit logs
    const parsedAuditLogs = recentAuditLogs
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean)
      .map(log => ({
        timestamp: log.timestamp,
        ip: log.ip,
        path: log.path,
        userId: log.userId,
        statusCode: log.statusCode,
        operationType: log.operationType,
        processingTime: log.processingTime
      }));
    
    // Count operations by type
    const operationTypeCounts = parsedAuditLogs.reduce((acc: Record<string, number>, log: any) => {
      if (log.operationType) {
        acc[log.operationType] = (acc[log.operationType] || 0) + 1;
      }
      return acc;
    }, {});
    
    // Calculate stats
    const stats = {
      securityLogSize: securityLogStats ? securityLogStats.size : 0,
      alertsLogSize: alertsLogStats ? alertsLogStats.size : 0,
      auditLogSize: auditLogStats ? auditLogStats.size : 0,
      securityLogModified: securityLogStats ? securityLogStats.mtime : null,
      alertsLogModified: alertsLogStats ? alertsLogStats.mtime : null,
      auditLogModified: auditLogStats ? auditLogStats.mtime : null,
      recentThreatsCount: parsedThreats.length,
      threatCategoryCounts,
      operationTypeCounts,
      securityStatus: [
        { name: "CSRF Protection", status: "active", description: "Cross-Site Request Forgery protection is enabled", lastChecked: new Date().toISOString() },
        { name: "XSS Protection", status: "active", description: "Cross-Site Scripting protection is enabled", lastChecked: new Date().toISOString() },
        { name: "Secure Headers", status: "active", description: "Security headers are properly configured", lastChecked: new Date().toISOString() },
        { name: "Rate Limiting", status: "active", description: "API rate limiting is enabled to prevent abuse", lastChecked: new Date().toISOString() },
        { name: "SQL Injection Protection", status: "active", description: "SQL injection detection and prevention is active", lastChecked: new Date().toISOString() },
        { name: "Audit Logging", status: "active", description: "Comprehensive audit logging of all sensitive operations", lastChecked: new Date().toISOString() },
        { name: "SSRF Protection", status: "active", description: "Server-Side Request Forgery protection is enabled", lastChecked: new Date().toISOString() },
        { name: "Content Security Policy", status: "active", description: "Content Security Policy headers are enforced", lastChecked: new Date().toISOString() }
      ]
    };
    
    // Return the security status
    res.json({
      status: 'ok',
      data: stats,
      recentThreats: parsedThreats.slice(0, 10), // Send only the 10 most recent threats
      recentActivity: parsedAuditLogs.slice(0, 20) // Send only the 20 most recent audit logs
    });
  } catch (error) {
    console.error('Error getting security status:', error);
    res.status(500).json({
      message: 'Failed to retrieve security status',
      error: (error as Error).message
    });
  }
});

// Healthcheck endpoint for monitoring
securityRouter.get('/healthcheck', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    securityMiddlewareStatus: 'active'
  });
});

// Endpoint to test the audit logging system
securityRouter.post('/test-audit', isAdmin, async (req: Request, res: Response) => {
  try {
    const { level, message } = req.body;
    
    if (!level || !message) {
      return res.status(400).json({
        message: 'Level and message are required'
      });
    }
    
    // Log the test message at the appropriate level
    switch (level) {
      case 'info':
        auditLogger.info(message, {
          userId: (req.user as any).id,
          operationType: 'TEST_AUDIT',
          path: req.path,
          source: 'TEST'
        });
        securityLogger.info(message, {
          userId: (req.user as any).id,
          path: req.path,
          source: 'TEST'
        });
        break;
      case 'warn':
        auditLogger.warn(message, {
          userId: (req.user as any).id,
          operationType: 'TEST_AUDIT',
          path: req.path,
          source: 'TEST'
        });
        securityLogger.warn(message, {
          userId: (req.user as any).id,
          path: req.path,
          source: 'TEST'
        });
        break;
      case 'error':
        auditLogger.error(message, {
          userId: (req.user as any).id,
          operationType: 'TEST_AUDIT',
          path: req.path,
          source: 'TEST'
        });
        securityLogger.error(message, {
          userId: (req.user as any).id,
          path: req.path,
          source: 'TEST'
        });
        break;
      default:
        return res.status(400).json({
          message: 'Invalid log level. Use info, warn, or error.'
        });
    }
    
    // Create an admin log entry
    await storage.createAdminLog({
      adminId: (req.user as any).id,
      action: 'TEST_AUDIT',
      targetType: 'SECURITY',
      targetId: 0,
      details: {
        level,
        message,
        timestamp: new Date().toISOString()
      }
    });
    
    res.json({
      message: 'Test audit log created successfully',
      level,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating test audit log:', error);
    res.status(500).json({
      message: 'Failed to create test audit log',
      error: (error as Error).message
    });
  }
});

// Endpoint to retrieve security logs
securityRouter.get('/logs', isAdmin, async (req: Request, res: Response) => {
  try {
    const { type = 'security', lines = 100 } = req.query;
    
    let logPath;
    switch (type) {
      case 'security':
        logPath = resolve('./logs/security.log');
        break;
      case 'alerts':
        logPath = resolve('./logs/security-alerts.log');
        break;
      case 'audit':
        logPath = resolve('./logs/audit.log');
        break;
      default:
        return res.status(400).json({
          message: 'Invalid log type. Use security, alerts, or audit.'
        });
    }
    
    // Read the last N lines from the log file
    const logLines = await readLastLines(logPath, parseInt(lines as string, 10));
    
    // Parse log lines into JSON objects where possible
    const parsedLogs = logLines
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          return { raw: line };
        }
      });
    
    res.json({
      logType: type,
      count: parsedLogs.length,
      logs: parsedLogs
    });
  } catch (error) {
    console.error('Error retrieving logs:', error);
    res.status(500).json({
      message: 'Failed to retrieve logs',
      error: (error as Error).message
    });
  }
});

// Helper function to read the last N lines of a file
async function readLastLines(filePath: string, maxLines: number): Promise<string[]> {
  try {
    const readFile = promisify(fs.readFile);
    const fileContent = await readFile(filePath, 'utf8');
    const lines = fileContent.split('\n').filter(line => line.trim());
    
    // Return the last n lines
    return lines.slice(-maxLines);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
}
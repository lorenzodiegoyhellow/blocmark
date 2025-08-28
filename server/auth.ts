import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { User as SelectUser } from "@shared/schema";
import { setupOAuth } from "./oauth";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function setupAuth(app: Express) {
  try {
    // Dynamically import storage to avoid startup errors
    const { storage } = await import("./storage");
    
    const sessionSettings: session.SessionOptions = {
      secret: process.env.REPL_ID || 'blocmark-dev-secret',
      resave: false,
      saveUninitialized: false,
      store: storage.sessionStore,
      cookie: {
        httpOnly: true,
        secure: app.get('env') === 'production', // Only use secure cookies in production
        sameSite: 'lax', // Helps prevent CSRF attacks
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      }
      
      // Check if user is banned or suspended
      if (user.status === "banned") {
        return done(null, false, { message: "Account has been banned" });
      }
      
      if (user.status === "suspended") {
        return done(null, false, { message: "Account is temporarily suspended" });
      }
      
      return done(null, user);
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    
    // Check if user is banned or suspended and invalidate session if so
    if (user && (user.status === "banned" || user.status === "suspended")) {
      return done(null, false);
    }
    
    done(null, user);
  });



  app.post("/api/login", (req, res, next) => {
    console.log("🔍 ===== LOGIN START =====");
    console.log("🔍 Login request received:", req.body);
    
    passport.authenticate("local", async (err: any, user: any, info: any) => {
      if (err) {
        console.error("🔍 Authentication error:", err);
        return next(err);
      }
      
      if (!user) {
        console.log("🔍 Authentication failed:", info);
        return res.status(401).json({ 
          success: false, 
          message: info?.message || "Invalid username or password" 
        });
      }
      
      console.log("🔍 User authenticated, attempting login...");
      
      req.login(user, async (err: any) => {
        if (err) {
          console.error("🔍 Login error:", err);
          return next(err);
        }
        
        try {
          // Update last login IP and timestamp
          const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
          console.log("🔍 Updating user login info...");
          
          await storage.updateUser(user.id, {
            lastLoginIp: clientIp,
            lastLoginAt: new Date()
          });
          
          console.log("🔍 User login info updated successfully");
        } catch (updateError: any) {
          console.error("🔍 Failed to update user login info:", updateError);
          // Don't fail the login if this update fails
        }
        
        console.log("🔍 User authenticated successfully:", user.username);
        console.log("🔍 ===== LOGIN SUCCESS =====");
        
        return res.status(200).json({ 
          success: true, 
          user: req.user 
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });



  // Simple server health check
  app.get("/api/health", (req, res) => {
    console.log("🔍 Server health check requested");
    res.json({ 
      status: "healthy", 
      server: "running",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development"
    });
  });

  // Setup OAuth strategies
  setupOAuth(app);
  
  } catch (error) {
    console.error("🔍 Failed to setup auth:", error);
    // Continue without auth setup to prevent app crash
  }
}

// Authentication middleware
export function authenticateUser(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      error: "Authentication required",
      message: "You must be logged in to access this resource"
    });
  }
  return next();
}

// Authentication middleware with a friendly name alias
export const requireAuth = authenticateUser;

// Admin role check middleware with editor permission support
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  console.log("Admin Authentication Check:", {
    path: req.path,
    isAuthenticated: req.isAuthenticated(),
    user: req.user ? { id: req.user.id, roles: req.user.roles } : null,
    method: req.method,
    headers: {
      cookie: req.headers.cookie ? "Present (Not shown)" : "Not present",
      authorization: req.headers.authorization ? "Present (Not shown)" : "Not present"
    }
  });
  
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      error: "Authentication required",
      message: "You must be logged in to access this resource"
    });
  }
  
  // Check if user has admin role
  if (req.user?.roles.includes("admin")) {
    return next();
  }
  
  // Check if user has editor role with secretCorners permission
  if (req.user?.roles.includes("editor")) {
    // Check if this is a Secret Corners route and user has permission
    if (req.path.includes('/secret-corners/') && req.user.editorPermissions?.secretCorners === true) {
      console.log("Editor with Secret Corners permission granted access");
      return next();
    }
  }
  
  return res.status(403).json({
    error: "Admin access required",
    message: "You do not have permission to access this resource"
  });
}
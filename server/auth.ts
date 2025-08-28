import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
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

export function setupAuth(app: Express) {
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

  app.post("/api/register", async (req, res, next) => {
    try {
      console.log("Registration request received:", { 
        username: req.body.username, 
        email: req.body.email,
        hasPassword: !!req.body.password 
      });

      // Validate required fields
      if (!req.body.username || !req.body.password) {
        console.log("Missing required fields");
        return res.status(400).json({ 
          success: false, 
          message: "Username and password are required" 
        });
      }

      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        console.log("Username already exists:", req.body.username);
        return res.status(400).json({ 
          success: false, 
          message: "Username already exists" 
        });
      }

      // Hash password
      const hashedPassword = await hashPassword(req.body.password);
      console.log("Password hashed successfully");

      // Create user
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
        roles: ["owner", "client"], // Automatically assign both roles
      });

      console.log("User created successfully:", user.id);

      req.login(user, (err) => {
        if (err) {
          console.error("Login error after registration:", err);
          return next(err);
        }
        res.status(201).json({
          success: true,
          user: user,
          message: "Account created successfully"
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Registration failed. Please try again.",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log("Login request received:", req.body);
    
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Authentication error:", err);
        return next(err);
      }
      
      if (!user) {
        console.log("Authentication failed:", info);
        return res.status(401).json({ 
          success: false, 
          message: info?.message || "Invalid username or password" 
        });
      }
      
      req.login(user, async (err) => {
        if (err) {
          console.error("Login error:", err);
          return next(err);
        }
        
        // Update last login IP and timestamp
        const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
        await storage.updateUser(user.id, {
          lastLoginIp: clientIp,
          lastLoginAt: new Date()
        });
        
        console.log("User authenticated successfully:", user.username);
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

  // Setup OAuth strategies
  setupOAuth(app);
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
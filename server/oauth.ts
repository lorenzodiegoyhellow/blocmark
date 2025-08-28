import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Express } from "express";
import { storage } from "./storage";
import { User } from "@shared/schema";

// Helper function to generate a unique username from OAuth profile
function generateUsername(provider: string, profile: any): string {
  const base = profile.displayName?.replace(/\s+/g, '.').toLowerCase() || 
               profile.emails?.[0]?.value?.split('@')[0] || 
               `${provider}user`;
  return `${base}.${Date.now().toString(36)}`;
}

// Helper function to find or create OAuth user
async function findOrCreateOAuthUser(
  provider: 'google' | 'facebook',
  providerId: string,
  profile: any
): Promise<User> {
  console.log(`[OAUTH] Finding or creating ${provider} user with ID: ${providerId}`);
  
  // Check if user exists with this provider ID
  let user: User | undefined;
  
  switch (provider) {
    case 'google':
      user = await storage.getUserByGoogleId(providerId);
      break;
    case 'facebook':
      user = await storage.getUserByFacebookId(providerId);
      break;
  }
  
  console.log(`[OAUTH] Existing user found:`, user ? 'yes' : 'no');
  
  if (user) {
    // Check if user is banned or suspended
    if (user.status === "banned") {
      throw new Error("Account has been banned");
    }
    
    if (user.status === "suspended") {
      throw new Error("Account is temporarily suspended");
    }
    
    return user;
  }
  
  // Check if user exists with same email
  const email = profile.emails?.[0]?.value;
  if (email) {
    user = await storage.getUserByEmail(email);
    if (user) {
      // Check if user is banned or suspended
      if (user.status === "banned") {
        throw new Error("Account has been banned");
      }
      
      if (user.status === "suspended") {
        throw new Error("Account is temporarily suspended");
      }
      
      // Link the OAuth provider to existing user
      await storage.linkOAuthProvider(user.id, provider, providerId);
      return await storage.getUser(user.id) as User;
    }
  }
  
  // Create new user
  const username = generateUsername(provider, profile);
  const newUser = await storage.createUser({
    username,
    email: email || undefined,
    profileImage: profile.photos?.[0]?.value || profile.picture || undefined,
    termsAccepted: true, // OAuth users implicitly accept terms when authorizing
    authProvider: provider,
    googleId: provider === 'google' ? providerId : undefined,
    facebookId: provider === 'facebook' ? providerId : undefined,
  } as any);
  
  return newUser;
}

export function setupOAuth(app: Express) {
  const BASE_URL = process.env.REPLIT_DOMAINS ? 
    `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 
    'http://localhost:5000';

  console.log('[OAUTH] Base URL:', BASE_URL);
  console.log('[OAUTH] Google Client ID exists:', !!process.env.GOOGLE_CLIENT_ID);
  console.log('[OAUTH] Google Client Secret exists:', !!process.env.GOOGLE_CLIENT_SECRET);
  console.log('[OAUTH] Google Client ID length:', process.env.GOOGLE_CLIENT_ID?.length);

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    // Use the actual Replit domain for OAuth callback
    const callbackURL = `${BASE_URL}/api/auth/google/callback`;
    console.log('\n========================================');
    console.log('[OAUTH] IMPORTANT: Google OAuth Callback Configuration');
    console.log('[OAUTH] Your app is running at:', BASE_URL);
    console.log('[OAUTH] Google Callback URL configured in app:', callbackURL);
    console.log('[OAUTH] You MUST add this exact URL to Google Cloud Console:');
    console.log('[OAUTH] →', callbackURL);
    console.log('========================================\n');
    
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('[OAUTH] Google profile received:', { 
          id: profile.id, 
          displayName: profile.displayName,
          emails: profile.emails 
        });
        const user = await findOrCreateOAuthUser('google', profile.id, profile);
        console.log('[OAUTH] User created/found:', user);
        done(null, user);
      } catch (error) {
        console.error('[OAUTH] Error in Google strategy:', error);
        done(error as Error);
      }
    }));

    // Google Auth Routes
    app.get('/api/auth/google', (req, res, next) => {
      console.log('[OAUTH] Google auth initiated');
      passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
    });

    app.get('/api/auth/google/callback', (req, res, next) => {
      console.log('[OAUTH] Google callback received');
      console.log('[OAUTH] Query params:', req.query);
      
      passport.authenticate('google', (err, user, info) => {
        if (err) {
          console.error('[OAUTH] Authentication error:', err);
          return res.redirect('/auth?error=google&message=' + encodeURIComponent(err.message));
        }
        if (!user) {
          console.error('[OAUTH] No user returned:', info);
          return res.redirect('/auth?error=google&message=authentication_failed');
        }
        
        req.logIn(user, (err) => {
          if (err) {
            console.error('[OAUTH] Login error:', err);
            return res.redirect('/auth?error=google&message=' + encodeURIComponent(err.message));
          }
          console.log('[OAUTH] User logged in successfully:', user.id);
          res.redirect('/'); // Redirect to home page after successful login
        });
      })(req, res, next);
    });
  }

  // Facebook OAuth Strategy
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `${BASE_URL}/api/auth/facebook/callback`,
      profileFields: ['id', 'emails', 'name', 'picture.type(large)']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateOAuthUser('facebook', profile.id, profile);
        done(null, user);
      } catch (error) {
        done(error as Error);
      }
    }));

    // Facebook Auth Routes
    app.get('/api/auth/facebook',
      passport.authenticate('facebook', { scope: ['email'] })
    );

    app.get('/api/auth/facebook/callback',
      passport.authenticate('facebook', { failureRedirect: '/auth?error=facebook' }),
      (req, res) => {
        // Successful authentication, redirect to dashboard or home
        res.redirect('/dashboard');
      }
    );
  }



  // OAuth status endpoint
  app.get('/api/auth/oauth-status', (req, res) => {
    res.json({
      google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      facebook: !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET)
    });
  });
}
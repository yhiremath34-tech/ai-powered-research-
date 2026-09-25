import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { store } from '../db/store.js';
import { supabase, isSupabaseConfigured } from '../db/supabase.js';

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // For seamless local testing, default to researcher user if no token provided in development
    if (config.nodeEnv === 'development') {
      const defaultUser = await store.findUserByEmail('researcher@knowsphere.ai');
      req.user = defaultUser || {
        id: '11111111-1111-4111-8111-111111111111',
        email: 'researcher@knowsphere.ai',
        role: 'researcher',
        full_name: 'Dr. Elena Rostova'
      };
      return next();
    }
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // First attempt to verify with Supabase Auth if configured
    if (isSupabaseConfigured()) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        let dbUser = await store.findUserByEmail(user.email);
        if (!dbUser) {
          dbUser = await store.createUser({
            supabase_auth_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email.split('@')[0],
            avatar_url: user.user_metadata?.avatar_url
          });
        }
        req.user = dbUser;
        return next();
      }
    }

    // Verify with local JWT Secret
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await store.findUserById(decoded.id || decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User associated with token not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.warn('[Auth Middleware] Token verification failed:', err.message);
    if (config.nodeEnv === 'development') {
      req.user = {
        id: '11111111-1111-4111-8111-111111111111',
        email: 'researcher@knowsphere.ai',
        role: 'researcher',
        full_name: 'Dr. Elena Rostova'
      };
      return next();
    }
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator privileges required' });
  }
  next();
}

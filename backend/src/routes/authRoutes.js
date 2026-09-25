import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { signupSchema, loginSchema } from '../validators/schemas.js';
import { store } from '../db/store.js';
import { config } from '../config/env.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/signup
router.post('/signup', async (req, res, next) => {
  try {
    const validated = signupSchema.parse(req.body);
    const existing = await store.findUserByEmail(validated.email);
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const password_hash = await bcrypt.hash(validated.password, 10);
    const user = await store.createUser({
      email: validated.email,
      password_hash,
      full_name: validated.full_name,
      primary_domain: validated.primary_domain || 'Technology',
      institution: validated.institution || 'Independent Research Institute'
    });

    const token = createToken(user);
    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        primary_domain: user.primary_domain,
        avatar_url: user.avatar_url,
        institution: user.institution
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await store.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.password_hash) {
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    }

    const token = createToken(user);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        primary_domain: user.primary_domain,
        avatar_url: user.avatar_url,
        institution: user.institution
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/demo (1-Click Login for Evaluators & Reviewers)
router.post('/demo', async (req, res, next) => {
  try {
    const role = req.body.role === 'admin' ? 'admin' : 'researcher';
    const email = role === 'admin' ? 'admin@knowsphere.ai' : 'researcher@knowsphere.ai';
    const user = await store.findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ error: 'Demo account not found' });
    }

    const token = createToken(user);
    res.json({
      message: `Signed in as Demo ${role === 'admin' ? 'Administrator' : 'Lead Researcher'}`,
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        primary_domain: user.primary_domain,
        avatar_url: user.avatar_url,
        institution: user.institution
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      full_name: req.user.full_name,
      role: req.user.role,
      primary_domain: req.user.primary_domain,
      avatar_url: req.user.avatar_url,
      institution: req.user.institution
    }
  });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Signed out successfully' });
});

export default router;

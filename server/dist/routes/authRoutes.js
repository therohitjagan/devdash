import { Router } from 'express';
import { githubCallback, githubLogin, logout, me } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
export const authRoutes = Router();
authRoutes.get('/github/login', githubLogin);
authRoutes.get('/github/callback', githubCallback);
authRoutes.get('/me', requireAuth, me);
authRoutes.post('/logout', logout);

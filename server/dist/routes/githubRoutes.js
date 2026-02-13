import { Router } from 'express';
import { getGitHubStats } from '../controllers/githubController.js';
import { requireAuth } from '../middleware/auth.js';
export const githubRoutes = Router();
githubRoutes.get('/stats', requireAuth, getGitHubStats);

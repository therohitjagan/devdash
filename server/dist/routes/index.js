import { Router } from 'express';
import { authRoutes } from './authRoutes.js';
import { commitRoutes } from './commitRoutes.js';
import { githubRoutes } from './githubRoutes.js';
import { mockRoutes } from './mockRoutes.js';
import { snippetRoutes } from './snippetRoutes.js';
export const apiRouter = Router();
apiRouter.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'devdash-server', now: new Date().toISOString() });
});
apiRouter.use('/auth', authRoutes);
apiRouter.use('/github', githubRoutes);
apiRouter.use('/commits', commitRoutes);
apiRouter.use('/snippets', snippetRoutes);
apiRouter.use('/mocks', mockRoutes);

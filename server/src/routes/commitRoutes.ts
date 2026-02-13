import { Router } from 'express'
import { getCommitAnalysisStatus, queueCommitAnalysis } from '../controllers/commitController.js'
import { requireAuth } from '../middleware/auth.js'

export const commitRoutes = Router()

commitRoutes.use(requireAuth)

commitRoutes.post('/analyze', queueCommitAnalysis)
commitRoutes.get('/analyze/:jobId', getCommitAnalysisStatus)

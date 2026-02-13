import { Router } from 'express'
import {
	createMock,
	deleteMock,
	exportMocksOpenApi,
	exportMocksPostman,
	listMocks,
} from '../controllers/mockController.js'
import { requireAuth } from '../middleware/auth.js'

export const mockRoutes = Router()

mockRoutes.use(requireAuth)

mockRoutes.get('/', listMocks)
mockRoutes.post('/', createMock)
mockRoutes.delete('/:id', deleteMock)
mockRoutes.get('/export/openapi', exportMocksOpenApi)
mockRoutes.get('/export/postman', exportMocksPostman)

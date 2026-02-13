import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { optionalAuth } from './middleware/auth.js'
import { apiRouter } from './routes/index.js'

export function createApp() {
  const app = express()
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)

  const allowedOrigins = env.CLIENT_URLS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
          callback(null, true)
          return
        }
        callback(new Error('CORS origin not allowed'))
      },
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '2mb' }))
  app.use(optionalAuth)

  app.use('/api', apiRouter)

  const clientDistPath = path.resolve(__dirname, '../../client/dist')
  const shouldServeClient = env.SERVE_CLIENT || env.NODE_ENV === 'production'
  if (shouldServeClient && fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath))

    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        next()
        return
      }
      res.sendFile(path.join(clientDistPath, 'index.html'))
    })
  }

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message = error instanceof Error ? error.message : 'Unexpected server error'
    res.status(500).json({ message })
  })

  return app
}

import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

type DevdashJwtPayload = {
  sub: string
  username: string
}

function getCookieValue(rawCookies: string | undefined, name: string): string | undefined {
  if (!rawCookies) return undefined
  const cookies = rawCookies.split(';').map((cookie) => cookie.trim())
  for (const cookie of cookies) {
    if (!cookie.startsWith(`${name}=`)) continue
    return decodeURIComponent(cookie.slice(name.length + 1))
  }
  return undefined
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const bearerToken = req.headers.authorization?.replace('Bearer ', '')
  const cookieToken = getCookieValue(req.headers.cookie, 'devdash_token')
  const token = bearerToken || cookieToken
  if (!token) {
    next()
    return
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as DevdashJwtPayload
    req.user = payload
  } catch {
    req.user = undefined
  }

  next()
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' })
    return
  }
  next()
}

declare global {
  namespace Express {
    interface Request {
      user?: DevdashJwtPayload
    }
  }
}

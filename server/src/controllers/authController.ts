import type { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { prisma } from '../services/prisma.js'
import { redis } from '../services/redis.js'

type GitHubTokenResponse = {
  access_token?: string
  token_type?: string
  scope?: string
  error?: string
  error_description?: string
}

type GitHubUserResponse = {
  id: number
  login: string
  avatar_url?: string
}

function setAuthCookie(res: Response, token: string) {
  res.cookie('devdash_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: '/',
  })
}

export async function githubLogin(_req: Request, res: Response) {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    res.status(500).json({ message: 'GitHub OAuth is not configured in server environment variables.' })
    return
  }

  const state = crypto.randomUUID()
  await redis.set(`oauth:github:state:${state}`, '1', 'EX', 300)

  const redirect = new URL('https://github.com/login/oauth/authorize')
  redirect.searchParams.set('client_id', env.GITHUB_CLIENT_ID)
  redirect.searchParams.set('redirect_uri', env.GITHUB_CALLBACK_URL)
  redirect.searchParams.set('scope', 'read:user repo')
  redirect.searchParams.set('state', state)

  res.redirect(redirect.toString())
}

export async function githubCallback(req: Request, res: Response) {
  const code = typeof req.query.code === 'string' ? req.query.code : undefined
  const state = typeof req.query.state === 'string' ? req.query.state : undefined

  if (!code || !state) {
    res.status(400).json({ message: 'Missing OAuth code or state.' })
    return
  }

  const stateKey = `oauth:github:state:${state}`
  const storedState = await redis.get(stateKey)
  if (!storedState) {
    res.status(400).json({ message: 'OAuth state is invalid or expired.' })
    return
  }
  await redis.del(stateKey)

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: env.GITHUB_CALLBACK_URL,
      state,
    }),
  })

  if (!tokenResponse.ok) {
    res.status(502).json({ message: 'Failed to exchange code for GitHub token.' })
    return
  }

  const tokenPayload = (await tokenResponse.json()) as GitHubTokenResponse
  if (!tokenPayload.access_token) {
    res.status(502).json({ message: tokenPayload.error_description ?? 'GitHub token response missing access token.' })
    return
  }

  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${tokenPayload.access_token}`,
      'User-Agent': 'DevDash',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })

  if (!userResponse.ok) {
    res.status(502).json({ message: 'Failed to fetch GitHub user profile.' })
    return
  }

  const githubUser = (await userResponse.json()) as GitHubUserResponse

  const user = await prisma.user.upsert({
    where: { githubId: String(githubUser.id) },
    update: {
      username: githubUser.login,
      avatarUrl: githubUser.avatar_url,
    },
    create: {
      githubId: String(githubUser.id),
      username: githubUser.login,
      avatarUrl: githubUser.avatar_url,
    },
  })

  await redis.set(`github:token:${user.id}`, tokenPayload.access_token, 'EX', 3600)

  const jwtToken = jwt.sign(
    {
      sub: user.id,
      username: user.username,
    },
    env.JWT_SECRET,
    { expiresIn: '7d' },
  )

  setAuthCookie(res, jwtToken)
  const firstClientOrigin = env.CLIENT_URLS.split(',')
    .map((origin) => origin.trim())
    .find(Boolean)
  res.redirect(`${firstClientOrigin ?? 'http://localhost:5173'}/?auth=success`)
}

export function me(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' })
    return
  }

  res.json({ user: req.user })
}

export function logout(_req: Request, res: Response) {
  res.clearCookie('devdash_token', {
    path: '/',
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
  })
  res.status(204).send()
}

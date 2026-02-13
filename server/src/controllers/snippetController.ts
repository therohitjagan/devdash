import type { Request, Response } from 'express'
import { prisma } from '../services/prisma.js'

export async function listSnippets(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' })
    return
  }

  const snippets = await prisma.snippet.findMany({
    where: { userId: req.user.sub },
    orderBy: { updatedAt: 'desc' },
  })
  res.json(snippets)
}

export async function createSnippet(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' })
    return
  }

  const incoming = req.body as {
    title?: string
    language?: string
    code?: string
    tags?: string[]
    isFavorite?: boolean
  }

  if (!incoming.title || !incoming.language || !incoming.code) {
    res.status(400).json({ message: 'title, language, and code are required' })
    return
  }

  const snippet = await prisma.snippet.create({
    data: {
      title: incoming.title,
      language: incoming.language,
      code: incoming.code,
      tags: incoming.tags ?? [],
      isFavorite: incoming.isFavorite ?? false,
      userId: req.user.sub,
    },
  })

  res.status(201).json(snippet)
}

export async function updateSnippet(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' })
    return
  }

  const rawSnippetId = req.params.id
  const snippetId = Array.isArray(rawSnippetId) ? rawSnippetId[0] : rawSnippetId
  if (!snippetId) {
    res.status(400).json({ message: 'Snippet id is required' })
    return
  }
  const existing = await prisma.snippet.findFirst({
    where: { id: snippetId, userId: req.user.sub },
  })
  if (!existing) {
    res.status(404).json({ message: 'Snippet not found' })
    return
  }

  const body = req.body as Partial<{
    title: string
    language: string
    code: string
    tags: string[]
    isFavorite: boolean
  }>

  const snippet = await prisma.snippet.update({
    where: { id: snippetId },
    data: {
      title: body.title,
      language: body.language,
      code: body.code,
      tags: body.tags,
      isFavorite: body.isFavorite,
    },
  })

  res.json(snippet)
}

export async function deleteSnippet(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' })
    return
  }

  const rawSnippetId = req.params.id
  const snippetId = Array.isArray(rawSnippetId) ? rawSnippetId[0] : rawSnippetId
  if (!snippetId) {
    res.status(400).json({ message: 'Snippet id is required' })
    return
  }
  const existing = await prisma.snippet.findFirst({
    where: { id: snippetId, userId: req.user.sub },
  })
  if (!existing) {
    res.status(404).json({ message: 'Snippet not found' })
    return
  }

  await prisma.snippet.delete({ where: { id: snippetId } })
  res.status(204).send()
}

function generateShareId() {
  return crypto.randomUUID().replaceAll('-', '').slice(0, 14)
}

export async function shareSnippet(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' })
    return
  }

  const rawSnippetId = req.params.id
  const snippetId = Array.isArray(rawSnippetId) ? rawSnippetId[0] : rawSnippetId
  if (!snippetId) {
    res.status(400).json({ message: 'Snippet id is required' })
    return
  }
  const snippet = await prisma.snippet.findFirst({
    where: { id: snippetId, userId: req.user.sub },
  })

  if (!snippet) {
    res.status(404).json({ message: 'Snippet not found' })
    return
  }

  const shareId = snippet.shareId ?? generateShareId()
  const updated = await prisma.snippet.update({
    where: { id: snippetId },
    data: { shareId },
  })

  const shareUrl = `${req.protocol}://${req.get('host')}/api/snippets/share/${updated.shareId}`
  res.json({
    id: updated.id,
    shareId: updated.shareId,
    shareUrl,
  })
}

export async function getSnippetByShareId(req: Request, res: Response) {
  const rawShareId = req.params.shareId
  const shareId = Array.isArray(rawShareId) ? rawShareId[0] : rawShareId
  if (!shareId) {
    res.status(400).json({ message: 'shareId is required' })
    return
  }
  const snippet = await prisma.snippet.findUnique({
    where: { shareId },
    select: {
      id: true,
      title: true,
      language: true,
      code: true,
      tags: true,
      updatedAt: true,
      shareId: true,
    },
  })

  if (!snippet) {
    res.status(404).json({ message: 'Shared snippet not found' })
    return
  }

  res.json(snippet)
}

import { api } from './api'

export type AuthMeResponse = {
  user: {
    sub: string
    username: string
  }
}

export type Snippet = {
  id: string
  title: string
  language: string
  code: string
  tags: string[]
  isFavorite: boolean
  updatedAt: string
}

export type MockApi = {
  id: string
  route: string
  method: string
  statusCode: number
  delayMs: number
  response: unknown
}

export type GitHubStats = {
  commitsToday: number
  streakDays: number
  topRepo: string
  languages: Array<{ name: string; value: number }>
  message?: string
}

export type CommitAnalysisStart = {
  jobId: string
}

export type CommitAnalysisResult = {
  repoUrl: string
  generatedAt: string
  insights: string[]
  metrics: {
    lateNightRatio: number
    compliance: number
    shortMessageRate: number
  }
}

export type CommitAnalysisStatus = {
  jobId: string
  state: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused'
  progress?: number
  failedReason?: string
  result?: CommitAnalysisResult
}

export type ShareSnippetResponse = {
  id: string
  shareId: string
  shareUrl: string
}

export async function getAuthMe() {
  const { data } = await api.get<AuthMeResponse>('/auth/me')
  return data
}

export async function logout() {
  await api.post('/auth/logout')
}

export async function getSnippets() {
  const { data } = await api.get<Snippet[]>('/snippets')
  return data
}

export async function createSnippet(payload: {
  title: string
  language: string
  code: string
  tags: string[]
}) {
  const { data } = await api.post<Snippet>('/snippets', payload)
  return data
}

export async function deleteSnippet(id: string) {
  await api.delete(`/snippets/${id}`)
}

export async function shareSnippet(id: string) {
  const { data } = await api.post<ShareSnippetResponse>(`/snippets/${id}/share`)
  return data
}

export async function getMocks() {
  const { data } = await api.get<MockApi[]>('/mocks')
  return data
}

export async function createMock(payload: {
  route: string
  method: string
  statusCode: number
  delayMs: number
  response: unknown
}) {
  const { data } = await api.post<MockApi>('/mocks', payload)
  return data
}

export async function deleteMock(id: string) {
  await api.delete(`/mocks/${id}`)
}

export async function exportMocksOpenApi() {
  const { data } = await api.get<Blob>('/mocks/export/openapi', {
    responseType: 'blob',
  })
  return data
}

export async function exportMocksPostman() {
  const { data } = await api.get<Blob>('/mocks/export/postman', {
    responseType: 'blob',
  })
  return data
}

export async function getGitHubStats() {
  const { data } = await api.get<GitHubStats>('/github/stats')
  return data
}

export async function queueCommitAnalysis(repoUrl: string) {
  const { data } = await api.post<CommitAnalysisStart>('/commits/analyze', { repoUrl })
  return data
}

export async function getCommitAnalysisStatus(jobId: string) {
  const { data } = await api.get<CommitAnalysisStatus>(`/commits/analyze/${jobId}`)
  return data
}

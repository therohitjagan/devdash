import type { DevdashModule } from '../hooks/useDevdashStore'

export type ModuleMeta = {
  id: DevdashModule
  name: string
  description: string
  accent: 'blue' | 'coral' | 'teal' | 'purple'
}

export const MODULES: ModuleMeta[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Bento overview with realtime pulse',
    accent: 'blue',
  },
  {
    id: 'github',
    name: 'GitHub Stats',
    description: 'Contributions, languages, streak signals',
    accent: 'teal',
  },
  {
    id: 'commits',
    name: 'Commit Analyzer',
    description: 'Patterns, quality checks, and recommendations',
    accent: 'purple',
  },
  {
    id: 'snippets',
    name: 'Snippet Manager',
    description: 'Save, search, and share production snippets',
    accent: 'coral',
  },
  {
    id: 'mocker',
    name: 'API Mocker',
    description: 'Generate and test instant mock endpoints',
    accent: 'blue',
  },
]

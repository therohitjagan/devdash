import { create } from 'zustand'

export type DevdashModule = 'dashboard' | 'github' | 'commits' | 'snippets' | 'mocker'

export type DashboardWidget = {
  id: string
  title: string
}

type DevdashStore = {
  activeModule: DevdashModule
  isPaletteOpen: boolean
  widgets: DashboardWidget[]
  setActiveModule: (module: DevdashModule) => void
  setPaletteOpen: (open: boolean) => void
  reorderWidgets: (fromIndex: number, toIndex: number) => void
}

const defaultWidgets: DashboardWidget[] = [
  { id: 'github-summary', title: 'GitHub Pulse' },
  { id: 'snippet-recent', title: 'Recent Snippets' },
  { id: 'mock-status', title: 'Mock APIs' },
  { id: 'commit-insights', title: 'Commit Insights' },
]

export const useDevdashStore = create<DevdashStore>((set) => ({
  activeModule: 'dashboard',
  isPaletteOpen: false,
  widgets: defaultWidgets,
  setActiveModule: (module) => set({ activeModule: module }),
  setPaletteOpen: (isPaletteOpen) => set({ isPaletteOpen }),
  reorderWidgets: (fromIndex, toIndex) =>
    set((state) => {
      const next = [...state.widgets]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return { widgets: next }
    }),
}))

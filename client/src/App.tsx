import { AnimatePresence, motion } from 'framer-motion'
import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { APIMockerView } from './components/APIMocker/APIMockerView'
import { CommitAnalyzerView } from './components/CommitAnalyzer/CommitAnalyzerView'
import { DashboardView } from './components/Dashboard/DashboardView'
import { GitHubStatsView } from './components/GitHubStats/GitHubStatsView'
import { SnippetManagerView } from './components/SnippetManager/SnippetManagerView'
import { CommandPalette } from './components/Shared/CommandPalette'
import { FloatingTabBar } from './components/Shared/FloatingTabBar'
import { TopNav } from './components/Shared/TopNav'
import { useCommandPaletteHotkey } from './hooks/useCommandPaletteHotkey'
import { type DevdashModule, useDevdashStore } from './hooks/useDevdashStore'

const moduleComponents: Record<DevdashModule, ReactNode> = {
  dashboard: <DashboardView />,
  github: <GitHubStatsView />,
  commits: <CommitAnalyzerView />,
  snippets: <SnippetManagerView />,
  mocker: <APIMockerView />,
}

function App() {
  const activeModule = useDevdashStore((state) => state.activeModule)
  const isPaletteOpen = useDevdashStore((state) => state.isPaletteOpen)
  const setPaletteOpen = useDevdashStore((state) => state.setPaletteOpen)

  useCommandPaletteHotkey()

  const content = useMemo(() => moduleComponents[activeModule], [activeModule])

  return (
    <div className="min-h-screen px-4 pb-32 pt-6 md:px-8 md:pt-8">
      <div className="grid-overlay" aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="mx-auto flex w-full max-w-7xl flex-col gap-6"
      >
        <TopNav />

        <AnimatePresence mode="wait">
          <motion.main
            key={activeModule}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="min-h-[65vh]"
          >
            {content}
          </motion.main>
        </AnimatePresence>

        <FloatingTabBar />
      </motion.div>

      <CommandPalette isOpen={isPaletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}

export default App

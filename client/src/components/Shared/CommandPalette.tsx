import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { MODULES } from '../../utils/modules'
import { useDevdashStore } from '../../hooks/useDevdashStore'

type CommandPaletteProps = {
  isOpen: boolean
  onClose: () => void
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const setActiveModule = useDevdashStore((state) => state.setActiveModule)

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return MODULES
    return MODULES.filter((item) => item.name.toLowerCase().includes(normalized))
  }, [query])

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-30 flex items-start justify-center bg-[#0f111acc] p-4 pt-24 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-2xl rounded-panel border border-tn-border bg-tn-surface p-3 shadow-neo"
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal
            aria-label="Command palette"
          >
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Type a module name…"
              className="focus-ring mb-2 w-full rounded-lg border border-tn-border bg-tn-bg px-3 py-3 font-mono text-sm text-tn-text"
            />

            <div className="max-h-72 overflow-y-auto rounded-lg border border-tn-border/70 bg-tn-bg/60">
              {results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="focus-ring flex w-full items-start justify-between border-b border-tn-border/60 px-3 py-3 text-left transition last:border-b-0 hover:bg-tn-surface"
                  onClick={() => {
                    setActiveModule(item.id)
                    onClose()
                    setQuery('')
                  }}
                >
                  <span>
                    <span className="block font-heading text-sm text-tn-text">{item.name}</span>
                    <span className="text-xs text-tn-muted">{item.description}</span>
                  </span>
                  <span className="font-mono text-xs text-tn-blue">open</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

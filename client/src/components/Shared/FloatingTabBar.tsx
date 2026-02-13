import clsx from 'clsx'
import { Blocks, Braces, Github, LayoutDashboard, ScrollText } from 'lucide-react'
import { useDevdashStore } from '../../hooks/useDevdashStore'
import type { DevdashModule } from '../../hooks/useDevdashStore'

const tabs: Array<{ id: DevdashModule; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'github', label: 'GitHub', icon: Github },
  { id: 'commits', label: 'Commits', icon: ScrollText },
  { id: 'snippets', label: 'Snippets', icon: Braces },
  { id: 'mocker', label: 'Mocker', icon: Blocks },
]

export function FloatingTabBar() {
  const activeModule = useDevdashStore((state) => state.activeModule)
  const setActiveModule = useDevdashStore((state) => state.setActiveModule)

  return (
    <nav className="fixed inset-x-0 bottom-4 z-20 mx-auto w-full max-w-md px-4 md:max-w-2xl" aria-label="Module navigation">
      <div className="grid grid-cols-5 gap-1 rounded-2xl border border-tn-border/80 bg-tn-surface/95 p-1 shadow-neo backdrop-blur-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeModule === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveModule(tab.id)}
              aria-pressed={isActive}
              className={clsx(
                'focus-ring flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] transition',
                isActive
                  ? 'bg-tn-surfaceStrong text-tn-teal shadow-[0_0_0_1px_rgba(125,207,255,0.4)]'
                  : 'text-tn-muted hover:text-tn-text',
              )}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

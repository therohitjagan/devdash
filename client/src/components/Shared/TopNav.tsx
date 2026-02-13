import { Command, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useDevdashStore } from '../../hooks/useDevdashStore'
import { getAuthMe, logout } from '../../services/devdashApi'

export function TopNav() {
  const setPaletteOpen = useDevdashStore((state) => state.setPaletteOpen)
  const queryClient = useQueryClient()

  const authQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getAuthMe,
    retry: false,
  })

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      toast.success('Session closed')
    },
  })

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-panel border border-tn-border/80 bg-tn-surface/85 px-4 py-3 shadow-neo backdrop-blur">
      <div>
        <p className="font-heading text-xl font-bold tracking-wide text-tn-text">DevDash</p>
        <p className="text-sm text-tn-muted">Tokyo Night Studio developer productivity suite</p>
      </div>

      <div className="flex items-center gap-2">
        {authQuery.data?.user ? (
          <span className="rounded-full border border-tn-border bg-tn-bg px-3 py-1 text-xs text-tn-muted">
            @{authQuery.data.user.username}
          </span>
        ) : null}

        <motion.span
          className="inline-flex items-center gap-2 rounded-full border border-tn-teal/40 bg-tn-bg px-3 py-1 text-xs text-tn-teal"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 2.8 }}
        >
          <Sparkles size={12} /> Live session
        </motion.span>

        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="focus-ring inline-flex items-center gap-2 rounded-lg border border-tn-border bg-tn-bg px-3 py-2 text-sm text-tn-text transition hover:border-tn-blue hover:text-tn-blue"
          aria-label="Open command palette"
        >
          <Command size={16} />
          <span className="font-mono text-xs">Ctrl/Cmd + K</span>
        </button>

        {authQuery.data?.user ? (
          <button
            type="button"
            onClick={() => logoutMutation.mutate()}
            className="focus-ring rounded-lg border border-tn-border bg-tn-bg px-3 py-2 text-xs text-tn-muted transition hover:border-tn-coral hover:text-tn-coral"
          >
            Logout
          </button>
        ) : (
          <a
            href={`${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'}/auth/github/login`}
            className="focus-ring rounded-lg border border-tn-border bg-tn-bg px-3 py-2 text-xs text-tn-text transition hover:border-tn-blue hover:text-tn-blue"
          >
            Connect GitHub
          </a>
        )}
      </div>
    </header>
  )
}

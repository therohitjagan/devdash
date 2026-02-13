import { motion } from 'framer-motion'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { SectionCard } from '../Shared/SectionCard'
import { getCommitAnalysisStatus, queueCommitAnalysis } from '../../services/devdashApi'

export function CommitAnalyzerView() {
  const [repoUrl, setRepoUrl] = useState('https://github.com/example/devdash')
  const [jobId, setJobId] = useState<string | null>(null)

  const startMutation = useMutation({
    mutationFn: queueCommitAnalysis,
    onSuccess: (data) => {
      setJobId(data.jobId)
      toast.success('Commit analysis queued')
    },
    onError: () => {
      toast.error('Unable to queue analysis. Connect GitHub first.')
    },
  })

  const statusQuery = useQuery({
    queryKey: ['commit-analysis', jobId],
    queryFn: () => getCommitAnalysisStatus(jobId ?? ''),
    enabled: Boolean(jobId),
    refetchInterval: (query) => {
      const state = query.state.data?.state
      if (!state || state === 'completed' || state === 'failed') {
        return false
      }
      return 1800
    },
  })

  const findings = statusQuery.data?.result?.insights ?? [
    'Queue a repository URL to generate commit activity insights.',
    'Results will stream in this terminal panel after processing.',
  ]

  return (
    <SectionCard title="Commit Analyzer" subtitle="Terminal-style insight stream with quality signals">
      <div className="mb-3 flex flex-wrap gap-2">
        <input
          value={repoUrl}
          onChange={(event) => setRepoUrl(event.target.value)}
          placeholder="Paste repository URL"
          className="focus-ring min-w-[260px] flex-1 rounded-lg border border-tn-border bg-tn-bg px-3 py-2 text-sm text-tn-text"
        />
        <button
          type="button"
          onClick={() => startMutation.mutate(repoUrl)}
          className="focus-ring rounded-lg border border-tn-purple/50 bg-tn-purple/10 px-3 py-2 text-sm text-tn-purple hover:bg-tn-purple/20"
        >
          Analyze
        </button>
      </div>

      {statusQuery.data ? (
        <p className="mb-2 text-xs text-tn-muted">
          Job {statusQuery.data.jobId}: {statusQuery.data.state}
          {typeof statusQuery.data.progress === 'number' ? ` (${statusQuery.data.progress}%)` : ''}
        </p>
      ) : null}

      <div className="rounded-xl border border-tn-border bg-[#131623] p-4 font-mono text-sm">
        {findings.map((line, index) => (
          <motion.p
            key={line}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.18 }}
            className="mb-2 text-tn-teal last:mb-0"
          >
            {'>'} {line}
          </motion.p>
        ))}

        {statusQuery.data?.result?.metrics ? (
          <>
            <p className="mt-3 text-tn-blue">$ late-night ratio: {statusQuery.data.result.metrics.lateNightRatio}%</p>
            <p className="text-tn-blue">$ conventional commits: {statusQuery.data.result.metrics.compliance}%</p>
            <p className="text-tn-blue">$ short messages: {statusQuery.data.result.metrics.shortMessageRate}%</p>
          </>
        ) : null}

        {statusQuery.data?.state === 'failed' ? (
          <p className="mt-3 text-tn-coral">$ error: {statusQuery.data.failedReason ?? 'analysis failed'}</p>
        ) : null}
      </div>
    </SectionCard>
  )
}

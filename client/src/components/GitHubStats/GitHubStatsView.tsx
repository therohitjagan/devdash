import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { SectionCard } from '../Shared/SectionCard'
import { getGitHubStats } from '../../services/devdashApi'

const fallbackLanguageData = [
  { name: 'TypeScript', value: 56, color: '#7AA2F7' },
  { name: 'Go', value: 17, color: '#7DCFFF' },
  { name: 'Rust', value: 14, color: '#BB9AF7' },
  { name: 'Python', value: 13, color: '#FF9E64' },
]

const colorPalette = ['#7AA2F7', '#7DCFFF', '#BB9AF7', '#FF9E64']

export function GitHubStatsView() {
  const statsQuery = useQuery({
    queryKey: ['github', 'stats'],
    queryFn: getGitHubStats,
    retry: false,
  })

  const languageData =
    statsQuery.data?.languages?.map((entry, index) => ({
      ...entry,
      color: colorPalette[index % colorPalette.length],
    })) ?? fallbackLanguageData

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SectionCard title="Language Breakdown" subtitle="Themed donut with Tokyo Night accent palette">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={languageData} dataKey="value" nameKey="name" innerRadius={56} outerRadius={92}>
                {languageData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="rgba(192,202,245,0.2)" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#24283B',
                  border: '1px solid #414868',
                  borderRadius: 12,
                  color: '#C0CAF5',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <SectionCard title="Contribution Pulse" subtitle="Heatmap + streak insights are scaffolded for GitHub API sync">
        <div className="space-y-3">
          <p className="rounded-xl border border-tn-border bg-tn-bg p-3 font-mono text-sm text-tn-teal">
            Current streak: {statsQuery.data?.streakDays ?? 0} days
          </p>
          <p className="rounded-xl border border-tn-border bg-tn-bg p-3 font-mono text-sm text-tn-blue">
            Commits today: {statsQuery.data?.commitsToday ?? 0}
          </p>
          <p className="rounded-xl border border-tn-border bg-tn-bg p-3 font-mono text-sm text-tn-coral">
            Top repo: {statsQuery.data?.topRepo ?? 'n/a'}
          </p>
          {statsQuery.data?.message ? <p className="text-xs text-tn-muted">{statsQuery.data.message}</p> : null}
        </div>
      </SectionCard>
    </div>
  )
}

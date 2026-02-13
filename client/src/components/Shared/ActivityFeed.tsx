import { motion } from 'framer-motion'
import { useActivityFeed } from '../../hooks/useActivityFeed'

export function ActivityFeed() {
  const items = useActivityFeed()

  return (
    <section className="rounded-panel border border-tn-border bg-tn-surface p-4 shadow-neo">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-heading text-base text-tn-text">Live Activity</h3>
        <span className="rounded-full border border-tn-teal/40 px-2 py-0.5 font-mono text-[10px] text-tn-teal">WS</span>
      </div>

      <ul className="space-y-2">
        {items.map((item, index) => (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.02 }}
            className="rounded-lg border border-tn-border/70 bg-tn-bg/70 px-3 py-2"
          >
            <p className="text-sm text-tn-text">{item.event}</p>
            <p className="font-mono text-[10px] text-tn-muted">{item.at}</p>
          </motion.li>
        ))}
      </ul>
    </section>
  )
}

import type { PropsWithChildren } from 'react'
import clsx from 'clsx'

type SectionCardProps = PropsWithChildren<{
  title: string
  subtitle?: string
  className?: string
}>

export function SectionCard({ title, subtitle, className, children }: SectionCardProps) {
  return (
    <section className={clsx('rounded-panel border border-tn-border bg-tn-surface p-4 shadow-neo', className)}>
      <header className="mb-3">
        <h2 className="font-heading text-lg text-tn-text">{title}</h2>
        {subtitle ? <p className="text-sm text-tn-muted">{subtitle}</p> : null}
      </header>
      {children}
    </section>
  )
}

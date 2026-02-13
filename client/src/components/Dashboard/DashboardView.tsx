import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd'
import { motion } from 'framer-motion'
import { ActivityFeed } from '../Shared/ActivityFeed'
import { SectionCard } from '../Shared/SectionCard'
import { useDevdashStore } from '../../hooks/useDevdashStore'

const statBlocks = [
  { label: 'Active Mocks', value: '12', color: 'text-tn-blue' },
  { label: 'Saved Snippets', value: '48', color: 'text-tn-coral' },
  { label: 'Commits Today', value: '9', color: 'text-tn-teal' },
  { label: 'Streak', value: '31d', color: 'text-tn-purple' },
]

export function DashboardView() {
  const widgets = useDevdashStore((state) => state.widgets)
  const reorderWidgets = useDevdashStore((state) => state.reorderWidgets)

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return
    reorderWidgets(result.source.index, result.destination.index)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <SectionCard title="Overview" subtitle="Realtime productivity pulse across all modules">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {statBlocks.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.25 }}
                className="rounded-xl border border-tn-border bg-tn-bg/80 p-3"
              >
                <p className="text-xs text-tn-muted">{item.label}</p>
                <p className={`font-heading text-2xl ${item.color}`}>{item.value}</p>
              </motion.div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Bento Widgets" subtitle="Drag and drop to customize your dashboard layout">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="widgets-droppable">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  {widgets.map((widget, index) => (
                    <Draggable draggableId={widget.id} index={index} key={widget.id}>
                      {(draggableProvided, snapshot) => (
                        <article
                          ref={draggableProvided.innerRef}
                          {...draggableProvided.draggableProps}
                          {...draggableProvided.dragHandleProps}
                          className={`min-h-28 rounded-xl border border-tn-border bg-tn-bg p-4 transition ${
                            snapshot.isDragging ? 'scale-[1.01] border-tn-teal shadow-neo' : 'hover:border-tn-blue'
                          }`}
                        >
                          <p className="font-heading text-sm text-tn-text">{widget.title}</p>
                          <p className="mt-2 font-mono text-xs text-tn-muted">Widget ID: {widget.id}</p>
                        </article>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </SectionCard>
      </div>

      <ActivityFeed />
    </div>
  )
}

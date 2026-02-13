import { useEffect, useState } from 'react'
import { socket } from '../services/socket'

type ActivityItem = {
  id: string
  event: string
  at: string
}

const fallbackEvents = [
  'Snippet synced to cloud collection',
  'Mock endpoint /v1/devdash/users started',
  'GitHub stats refreshed for today',
  'Commit quality scan finished',
]

export function useActivityFeed() {
  const [items, setItems] = useState<ActivityItem[]>([
    {
      id: 'seed',
      event: 'DevDash session initialized',
      at: new Date().toLocaleTimeString(),
    },
  ])

  useEffect(() => {
    socket.connect()

    const onActivity = (payload: ActivityItem) => {
      setItems((current) => [payload, ...current].slice(0, 8))
    }

    socket.on('activity', onActivity)

    const interval = window.setInterval(() => {
      const event = fallbackEvents[Math.floor(Math.random() * fallbackEvents.length)]
      setItems((current) => [
        {
          id: crypto.randomUUID(),
          event,
          at: new Date().toLocaleTimeString(),
        },
        ...current,
      ].slice(0, 8))
    }, 6000)

    return () => {
      window.clearInterval(interval)
      socket.off('activity', onActivity)
      socket.disconnect()
    }
  }, [])

  return items
}

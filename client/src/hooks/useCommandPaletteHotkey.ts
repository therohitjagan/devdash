import { useEffect } from 'react'
import { useDevdashStore } from './useDevdashStore'

export function useCommandPaletteHotkey() {
  const isPaletteOpen = useDevdashStore((state) => state.isPaletteOpen)
  const setPaletteOpen = useDevdashStore((state) => state.setPaletteOpen)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen(!isPaletteOpen)
      }

      if (event.key === 'Escape' && isPaletteOpen) {
        setPaletteOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isPaletteOpen, setPaletteOpen])
}

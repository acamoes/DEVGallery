import { AnimatePresence } from 'motion/react'
import type { AppEntry } from '../types'
import { AppCard } from './AppCard'

interface GalleryGridProps {
  apps: AppEntry[]
  onSelect: (app: AppEntry) => void
}

/** Grelha arejada: 1 → 2 → 3 colunas conforme a largura. */
export function GalleryGrid({ apps, onSelect }: GalleryGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {apps.map((app, index) => (
          <AppCard key={app.id} app={app} index={index} onSelect={onSelect} />
        ))}
      </AnimatePresence>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import type { AppDraft, AppEntry } from './types'
import { useApps } from './hooks/useApps'
import { TopBar } from './components/TopBar'
import { Hero } from './components/Hero'
import { TagFilter } from './components/TagFilter'
import { GalleryGrid } from './components/GalleryGrid'
import { EmptyState } from './components/EmptyState'
import { AppDetail } from './components/AppDetail'
import { AdminFab } from './components/AdminFab'
import { AppFormModal } from './components/AppFormModal'
import { Footer } from './components/Footer'

const IS_DEV = import.meta.env.DEV

export default function App() {
  const { apps, addApp, updateApp, deleteApp } = useApps()

  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  /** 'new' abre o formulário vazio; uma AppEntry abre-o em modo edição. */
  const [formTarget, setFormTarget] = useState<AppEntry | 'new' | null>(null)

  const tags = useMemo(
    () => [...new Set(apps.flatMap((app) => app.tags))].sort(),
    [apps],
  )

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return apps.filter((app) => {
      if (activeTag && !app.tags.includes(activeTag)) return false
      if (!needle) return true
      return [app.name, app.description, app.tags.join(' ')]
        .join(' ')
        .toLowerCase()
        .includes(needle)
    })
  }, [apps, activeTag, query])

  const selected = selectedId ? (apps.find((app) => app.id === selectedId) ?? null) : null
  const selectedIndex = selected ? apps.indexOf(selected) : -1

  const handleFormSubmit = async (draft: AppDraft) => {
    if (formTarget && formTarget !== 'new') return updateApp(formTarget.id, draft)
    return addApp(draft)
  }

  return (
    <div className="min-h-dvh">
      <div className="noise" aria-hidden />

      <TopBar count={apps.length} />
      <Hero count={apps.length} />

      <main className="mx-auto max-w-[88rem] px-5 pb-4 sm:px-8">
        <TagFilter
          tags={tags}
          activeTag={activeTag}
          onTagChange={setActiveTag}
          query={query}
          onQueryChange={setQuery}
          shown={filtered.length}
          total={apps.length}
        />

        {filtered.length > 0 ? (
          <GalleryGrid apps={filtered} onSelect={(app) => setSelectedId(app.id)} />
        ) : (
          <EmptyState
            filtered={apps.length > 0}
            onAdd={IS_DEV ? () => setFormTarget('new') : undefined}
          />
        )}
      </main>

      <Footer />

      {IS_DEV && <AdminFab onClick={() => setFormTarget('new')} />}

      <AnimatePresence>
        {selected && (
          <AppDetail
            key={selected.id}
            app={selected}
            index={selectedIndex}
            onClose={() => setSelectedId(null)}
            onEdit={IS_DEV ? (app) => setFormTarget(app) : undefined}
            onDelete={IS_DEV ? (app) => deleteApp(app.id) : undefined}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {formTarget && (
          <AppFormModal
            key={formTarget === 'new' ? 'new' : formTarget.id}
            app={formTarget === 'new' ? null : formTarget}
            onClose={() => setFormTarget(null)}
            onSubmit={handleFormSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

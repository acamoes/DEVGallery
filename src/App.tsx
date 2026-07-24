import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
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
import { TokenModal } from './components/TokenModal'
import { Footer } from './components/Footer'

export default function App() {
  const { apps, addApp, updateApp, deleteApp, admin } = useApps()

  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  /** 'new' abre o formulário vazio; uma AppEntry abre-o em modo edição. */
  const [formTarget, setFormTarget] = useState<AppEntry | 'new' | null>(null)
  const [showToken, setShowToken] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const canEdit = admin.enabled

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 6000)
    return () => clearTimeout(timer)
  }, [toast])

  /** Em produção cada alteração é um commit — o site público só reflete após o rebuild. */
  const notifyDeploy = () => {
    if (!admin.isDev) setToast('Guardado no GitHub. O site publicado atualiza em ~1 min.')
  }

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
    const result =
      formTarget && formTarget !== 'new'
        ? await updateApp(formTarget.id, draft)
        : await addApp(draft)
    notifyDeploy()
    return result
  }

  const handleDelete = async (app: AppEntry) => {
    await deleteApp(app.id)
    notifyDeploy()
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
            onAdd={canEdit ? () => setFormTarget('new') : undefined}
          />
        )}
      </main>

      <Footer />

      {/* Em produção: aceder/gerir o token de administração. */}
      {!admin.isDev && (
        <button
          type="button"
          onClick={() => setShowToken(true)}
          className="type-label fixed bottom-5 left-5 z-30 border border-line bg-ink/80 px-4 py-3 text-mute backdrop-blur-sm transition-colors hover:border-acid hover:text-acid sm:bottom-8 sm:left-8"
        >
          {admin.tokenConfigured ? '⚙ Admin' : '⚙ Ativar edição'}
        </button>
      )}

      {canEdit && (
        <AdminFab onClick={() => setFormTarget('new')} badge={admin.isDev ? 'dev' : 'live'} />
      )}

      <AnimatePresence>
        {selected && (
          <AppDetail
            key={selected.id}
            app={selected}
            index={selectedIndex}
            onClose={() => setSelectedId(null)}
            onEdit={canEdit ? (app) => setFormTarget(app) : undefined}
            onDelete={canEdit ? handleDelete : undefined}
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

      <AnimatePresence>
        {showToken && (
          <TokenModal onClose={() => setShowToken(false)} onSaved={admin.refreshToken} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="type-label fixed inset-x-4 bottom-24 z-40 mx-auto max-w-md border border-acid bg-ink/90 px-5 py-4 text-center text-paper backdrop-blur-sm sm:bottom-8"
            role="status"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

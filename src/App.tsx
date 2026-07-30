import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react'
import type { AppDraft, AppEntry } from './types'
import { useApps } from './hooks/useApps'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { Hero } from './components/Hero'
import { ProjectList } from './components/ProjectList'
import { EmptyState } from './components/EmptyState'
import { AppDetail } from './components/AppDetail'
import { AdminFab } from './components/AdminFab'
import { AppFormModal } from './components/AppFormModal'
import { TokenModal } from './components/TokenModal'

export default function App() {
  const { apps, addApp, updateApp, deleteApp, admin } = useApps()
  useSmoothScroll()

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
    <div className="min-h-dvh bg-ink">
      <div className="noise" aria-hidden />

      <ScrollMarker count={apps.length} />

      <Hero />

      <main>
        {apps.length > 0 ? (
          <ProjectList apps={apps} onSelect={(app) => setSelectedId(app.id)} />
        ) : (
          <EmptyState onAdd={canEdit ? () => setFormTarget('new') : undefined} />
        )}
      </main>

      {/* Em produção: aceder/gerir o token de administração. */}
      {!admin.isDev && (
        <button
          type="button"
          onClick={() => setShowToken(true)}
          className="type-label fixed bottom-5 left-5 z-30 border border-line bg-ink/80 px-4 py-3 text-mute backdrop-blur-sm transition-colors hover:border-paper hover:text-paper sm:bottom-8 sm:left-8"
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
            className="type-label fixed inset-x-4 bottom-24 z-40 mx-auto max-w-md border border-paper bg-ink/90 px-5 py-4 text-center text-paper backdrop-blur-sm sm:bottom-8"
            role="status"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Barra fina no topo que só aparece depois do hero sair do ecrã — o ecrã de
 * abertura fica assim completamente limpo, sem deixar a página longa sem
 * qualquer ponto de referência.
 */
function ScrollMarker({ count }: { count: number }) {
  const { scrollY } = useScroll()
  const [viewport, setViewport] = useState(() => window.innerHeight)

  useEffect(() => {
    // Só re-medir quando a largura muda. Em telemóvel, esconder a barra de
    // endereço altera innerHeight a meio do scroll; reagir a isso deslocava
    // o limiar do fade e fazia a barra saltar.
    let lastWidth = window.innerWidth
    const onResize = () => {
      if (window.innerWidth === lastWidth) return
      lastWidth = window.innerWidth
      setViewport(window.innerHeight)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const opacity = useTransform(scrollY, [viewport * 0.55, viewport * 0.95], [0, 1])

  return (
    <motion.div
      style={{ opacity }}
      className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-5 sm:px-10"
    >
      {/* Véu em vez de mix-blend-difference: a inversão colapsava para 1:1
          sobre cinzas médios, e é disso que são feitos os previews em modo
          escuro. O gradiente garante branco puro legível em qualquer fundo. */}
      <div
        className="absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-ink via-ink/70 to-transparent"
        aria-hidden
      />
      <span className="type-label text-paper">DEV Gallery</span>
      <span className="type-label text-paper">
        {String(count).padStart(2, '0')} {count === 1 ? 'Projeto' : 'Projetos'}
      </span>
    </motion.div>
  )
}

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import type { AppEntry } from '../types'
import { LivePreview } from './LivePreview'
import { useModal } from '../hooks/useModal'

const EASE = [0.22, 1, 0.36, 1] as const

/** Entrada coreografada: header → preview → ficha, em sequência. */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.12 } },
}
const rise = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
}
const settle = {
  hidden: { opacity: 0, scale: 0.97 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: EASE } },
}

interface AppDetailProps {
  app: AppEntry
  index: number
  onClose: () => void
  /** Presentes apenas em dev. */
  onEdit?: (app: AppEntry) => void
  onDelete?: (app: AppEntry) => Promise<void>
}

/** Overlay full-screen com o preview live interativo e a ficha da app. */
export function AppDetail({ app, index, onClose, onEdit, onDelete }: AppDetailProps) {
  const containerRef = useModal<HTMLDivElement>(onClose)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // O pedido de confirmação de apagar expira sozinho.
  useEffect(() => {
    if (!confirmingDelete) return
    const timer = setTimeout(() => setConfirmingDelete(false), 3000)
    return () => clearTimeout(timer)
  }, [confirmingDelete])

  const handleDelete = async () => {
    if (!onDelete) return
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      return
    }
    setDeleting(true)
    try {
      await onDelete(app)
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 z-40 overflow-y-auto bg-ink/85 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Detalhes de ${app.name}`}
    >
      <motion.div
        className="relative mx-auto my-6 w-[min(1280px,calc(100vw-2rem))] border border-line bg-ink sm:my-12"
        initial={{ opacity: 0, y: 48 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.5, ease: EASE }}
        onClick={(event) => event.stopPropagation()}
      >
        <motion.div variants={stagger} initial="hidden" animate="show">
          {/* Cabeçalho */}
          <motion.div
            variants={rise}
            className="flex items-start justify-between gap-6 border-b border-line p-6 sm:p-8"
          >
            <div className="min-w-0">
              <p className="type-label text-mute">{String(index + 1).padStart(2, '0')}</p>
              {/* Sem truncate: é o único ecrã onde o nome tem de aparecer
                  inteiro. O min-w-0 do contentor e a quebra por caracter
                  seguram nomes longos sem os cortar. */}
              <h2 className="type-huge mt-4 text-4xl italic [overflow-wrap:anywhere] sm:text-6xl">
                {app.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="grid size-11 shrink-0 place-items-center border border-line text-mute transition-colors hover:border-paper hover:text-paper"
            >
              ✕
            </button>
          </motion.div>

          <div className="grid lg:grid-cols-[1.6fr_1fr]">
            {/* Preview grande e interativo */}
            <motion.div
              variants={settle}
              className="relative aspect-[16/10] border-b border-line lg:aspect-auto lg:min-h-[560px] lg:border-r lg:border-b-0"
            >
              <LivePreview app={app} interactive />
            </motion.div>

            {/* Ficha */}
            <motion.div variants={rise} className="flex flex-col gap-7 p-6 sm:p-8">
              <div>
                <p className="type-label text-mute">Sobre</p>
                <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-line text-paper">
                  {app.description || '—'}
                </p>
              </div>

              {app.tags.length > 0 && (
                <div>
                  <p className="type-label text-mute">Tags</p>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {app.tags.map((tag) => (
                      <li key={tag} className="type-label border border-line px-2 py-1 text-mute">
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-2">
                <p className="type-label text-mute">Meta</p>
                <p className="type-label truncate text-paper" title={app.url}>
                  {app.url || '—'}
                </p>
                <p className="type-label text-mute">
                  Adicionada em{' '}
                  {new Date(app.createdAt).toLocaleDateString('pt-PT', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="mt-auto space-y-3 pt-2">
                {app.url && (
                  <a
                    href={app.url}
                    target="_blank"
                    rel="noreferrer"
                    className="type-display block bg-paper px-6 py-4 text-center text-lg text-ink italic transition-colors hover:bg-mute"
                  >
                    Abrir app ↗
                  </a>
                )}

                {app.repoUrl && (
                  <a
                    href={app.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="type-label block border border-line py-3.5 text-center text-paper transition-colors hover:border-paper"
                  >
                    Código fonte ↗
                  </a>
                )}

                {(onEdit || onDelete) && (
                  <div className="grid grid-cols-2 gap-3">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(app)}
                        className="type-label border border-line py-3.5 text-paper transition-colors hover:border-paper"
                      >
                        Editar
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className={`type-label py-3.5 transition-colors disabled:opacity-50 ${
                          confirmingDelete
                            ? 'bg-danger text-ink'
                            : 'border border-danger/40 text-danger hover:border-danger'
                        }`}
                      >
                        {deleting ? 'A apagar…' : confirmingDelete ? 'Confirmar?' : 'Apagar'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

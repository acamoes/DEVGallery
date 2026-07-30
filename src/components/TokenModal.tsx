import { useState } from 'react'
import { motion } from 'motion/react'
import { useModal } from '../hooks/useModal'
import { getConfig, getToken, hasToken, setConfig, setToken, verifyAccess } from '../lib/github'

const EASE = [0.22, 1, 0.36, 1] as const

interface TokenModalProps {
  onClose: () => void
  /** Chamado após guardar ou limpar o token, para o App reavaliar o modo admin. */
  onSaved: () => void
}

/**
 * Configuração do acesso de administração em produção.
 *
 * Guarda um token pessoal do GitHub (fine-grained PAT) no localStorage deste
 * browser. Com ele, a galeria escreve as alterações diretamente no repositório.
 */
export function TokenModal({ onClose, onSaved }: TokenModalProps) {
  const containerRef = useModal<HTMLDivElement>(onClose)
  const cfg = getConfig()
  const [owner, setOwner] = useState(cfg.owner)
  const [repo, setRepo] = useState(cfg.repo)
  const [branch, setBranch] = useState(cfg.branch)
  const [token, setTokenValue] = useState(getToken() ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!owner.trim() || !repo.trim()) return setError('Indica owner e repositório.')
    if (!token.trim()) return setError('Cola o teu token pessoal do GitHub.')

    setBusy(true)
    setError(null)
    setConfig({ owner: owner.trim(), repo: repo.trim(), branch: branch.trim() || 'main', path: cfg.path })
    setToken(token.trim())
    try {
      await verifyAccess()
      onSaved()
      onClose()
    } catch (verifyError) {
      // Credenciais inválidas — não deixar ficar guardadas.
      setToken(null)
      setError(verifyError instanceof Error ? verifyError.message : 'Não foi possível validar o token.')
      setBusy(false)
    }
  }

  const handleClear = () => {
    setToken(null)
    onSaved()
    onClose()
  }

  const pillLink =
    'https://github.com/settings/personal-access-tokens/new'

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-y-auto bg-ink/70 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Configurar acesso de administração"
    >
      <motion.div
        ref={containerRef}
        className="relative mx-auto my-6 w-[min(560px,calc(100vw-2rem))] border border-line bg-ink sm:my-16"
        initial={{ opacity: 0, y: 48 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.5, ease: EASE }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-6 border-b border-line p-6 sm:p-8">
          <div>
            <p className="type-label text-mute">Admin / GitHub</p>
            <h2 className="type-huge mt-4 text-3xl italic sm:text-4xl">Acesso de edição.</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="grid size-11 shrink-0 place-items-center border border-line text-mute transition-colors hover:border-paper hover:text-paper"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6 p-6 sm:p-8">
          <p className="text-sm leading-relaxed text-mute">
            Para adicionar ou editar apps no site publicado, cola um{' '}
            <a
              href={pillLink}
              target="_blank"
              rel="noreferrer"
              className="text-paper underline underline-offset-2"
            >
              token pessoal do GitHub
            </a>
            . Cria um <strong className="text-paper">fine-grained token</strong> com acesso apenas a
            este repositório e à permissão <strong className="text-paper">Contents: Read and write</strong>.
            Fica guardado só neste browser.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Owner">
              <input
                type="text"
                value={owner}
                onChange={(event) => setOwner(event.target.value)}
                placeholder="utilizador"
                data-autofocus
                className={inputClass}
              />
            </Field>
            <Field label="Repositório">
              <input
                type="text"
                value={repo}
                onChange={(event) => setRepo(event.target.value)}
                placeholder="DEVGallery"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Branch">
            <input
              type="text"
              value={branch}
              onChange={(event) => setBranch(event.target.value)}
              placeholder="main"
              className={inputClass}
            />
          </Field>

          <Field label="Token">
            <input
              type="password"
              value={token}
              onChange={(event) => setTokenValue(event.target.value)}
              placeholder="github_pat_…"
              autoComplete="off"
              className={`${inputClass} font-mono`}
            />
          </Field>

          <p className="type-label leading-relaxed text-mute/80">
            Nota: quem tiver este token pode escrever no repositório. Limita-o a este repo e revoga-o
            em github.com se deixar de o usar.
          </p>

          {error && (
            <p className="type-label border border-danger/40 px-4 py-3 text-danger" role="alert">
              {error}
            </p>
          )}

          <div className="grid grid-cols-[1fr_auto] gap-3 pt-2">
            <button
              type="submit"
              disabled={busy}
              className="type-display bg-paper px-6 py-4 text-lg text-ink italic transition-colors hover:bg-mute disabled:opacity-50"
            >
              {busy ? 'A validar…' : 'Guardar e ativar'}
            </button>
            {hasToken() && (
              <button
                type="button"
                onClick={handleClear}
                className="type-label border border-danger/40 px-6 text-danger transition-colors hover:border-danger"
              >
                Remover token
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

const inputClass =
  'w-full border border-line bg-transparent px-4 py-3 text-sm text-paper outline-none transition-colors placeholder:text-mute/50 focus:border-paper'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="type-label mb-2.5 block text-mute">{label}</span>
      {children}
    </label>
  )
}

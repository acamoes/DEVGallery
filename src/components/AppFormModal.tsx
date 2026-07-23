import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import type { AppDraft, AppEntry } from '../types'
import { LivePreview } from './LivePreview'
import { useModal } from '../hooks/useModal'

const EASE = [0.22, 1, 0.36, 1] as const

interface AppFormModalProps {
  /** null = criar nova; caso contrário edita a app dada. */
  app: AppEntry | null
  onClose: () => void
  onSubmit: (draft: AppDraft) => Promise<unknown>
}

/** Formulário de criar/editar app com preview live imediato (só em dev). */
export function AppFormModal({ app, onClose, onSubmit }: AppFormModalProps) {
  const containerRef = useModal<HTMLDivElement>(onClose)
  const [name, setName] = useState(app?.name ?? '')
  const [url, setUrl] = useState(app?.url ?? '')
  const [repoUrl, setRepoUrl] = useState(app?.repoUrl ?? '')
  const [description, setDescription] = useState(app?.description ?? '')
  const [tagsInput, setTagsInput] = useState(app?.tags.join(', ') ?? '')
  const [previewMode, setPreviewMode] = useState<'iframe' | 'image'>(app?.previewMode ?? 'iframe')
  const [imageData, setImageData] = useState<string | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // URL com debounce para o painel de preview não recarregar a cada tecla.
  const [previewUrl, setPreviewUrl] = useState(url)
  useEffect(() => {
    const timer = setTimeout(() => setPreviewUrl(url), 600)
    return () => clearTimeout(timer)
  }, [url])

  const tags = useMemo(
    () =>
      tagsInput
        .split(',')
        .map((tag) => tag.trim().toUpperCase())
        .filter(Boolean),
    [tagsInput],
  )

  const validUrl = useMemo(() => {
    try {
      const parsed = new URL(previewUrl)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? previewUrl : null
    } catch {
      return null
    }
  }, [previewUrl])

  const existingImage = !removeImage && !imageData && app?.image ? app.image : undefined
  const previewImageSrc =
    imageData ?? (existingImage ? import.meta.env.BASE_URL + existingImage : null)

  const handleFile = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('O ficheiro tem de ser uma imagem.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setImageData(reader.result as string)
      setRemoveImage(false)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return setError('Dá um nome à app.')
    if (url.trim() && !/^https?:\/\//.test(url.trim()))
      return setError('O URL tem de começar por http:// ou https://.')
    if (repoUrl.trim() && !/^https?:\/\//.test(repoUrl.trim()))
      return setError('O link do repositório tem de começar por http:// ou https://.')
    if (previewMode === 'iframe' && !url.trim())
      return setError('O modo live precisa de um URL.')
    if (previewMode === 'image' && !imageData && !existingImage)
      return setError('O modo imagem precisa de um screenshot.')

    setBusy(true)
    setError(null)
    try {
      const draft: AppDraft = {
        name: name.trim(),
        description: description.trim(),
        url: url.trim(),
        tags,
        previewMode,
        repoUrl: repoUrl.trim(),
      }
      if (imageData) draft.imageData = imageData
      if (removeImage) draft.removeImage = true
      await onSubmit(draft)
      onClose()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível guardar.')
      setBusy(false)
    }
  }

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
      aria-label={app ? `Editar ${app.name}` : 'Adicionar app'}
    >
      <motion.div
        ref={containerRef}
        className="relative mx-auto my-6 w-[min(1060px,calc(100vw-2rem))] border border-line bg-ink sm:my-12"
        initial={{ opacity: 0, y: 48 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.5, ease: EASE }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-6 border-b border-line p-6 sm:p-8">
          <div>
            <p className="type-label text-acid">{app ? 'Editar' : 'Nova entrada'} / dev</p>
            <h2 className="type-display mt-3 text-3xl italic sm:text-5xl">
              {app ? app.name : 'Adicionar app.'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="grid size-11 shrink-0 place-items-center border border-line text-mute transition-colors hover:border-acid hover:text-acid"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_1fr]">
          {/* Campos */}
          <div className="space-y-6 border-b border-line p-6 sm:p-8 lg:border-r lg:border-b-0">
            <Field label="Nome *">
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="A minha app"
                data-autofocus
                className={inputClass}
              />
            </Field>

            <Field label="URL">
              <input
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://…"
                className={inputClass}
              />
            </Field>

            <Field label="Repositório (opcional)">
              <input
                type="url"
                value={repoUrl}
                onChange={(event) => setRepoUrl(event.target.value)}
                placeholder="https://github.com/…"
                className={inputClass}
              />
            </Field>

            <Field label="Descrição">
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="O que faz esta app?"
                rows={4}
                className={`${inputClass} resize-y`}
              />
            </Field>

            <Field label="Tags (separadas por vírgula)">
              <input
                type="text"
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
                placeholder="REACT, MOBILE, API"
                className={inputClass}
              />
              {tags.length > 0 && (
                <ul className="mt-2.5 flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <li key={tag} className="type-label border border-line px-2 py-0.5 text-[10px] text-mute">
                      {tag}
                    </li>
                  ))}
                </ul>
              )}
            </Field>

            <Field label="Modo de preview">
              <div className="grid grid-cols-2 gap-2">
                <ModeButton
                  label="Live iframe"
                  active={previewMode === 'iframe'}
                  onClick={() => setPreviewMode('iframe')}
                />
                <ModeButton
                  label="Imagem"
                  active={previewMode === 'image'}
                  onClick={() => setPreviewMode('image')}
                />
              </div>
            </Field>

            <Field label={previewMode === 'image' ? 'Screenshot *' : 'Screenshot (fallback opcional)'}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="type-label border border-line px-4 py-3 text-paper transition-colors hover:border-paper"
                >
                  {previewImageSrc ? 'Substituir imagem' : 'Carregar imagem'}
                </button>
                {previewImageSrc && (
                  <>
                    <img
                      src={previewImageSrc}
                      alt="Miniatura da imagem escolhida"
                      className="h-11 w-16 border border-line object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageData(null)
                        setRemoveImage(Boolean(app?.image))
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      className="type-label text-mute transition-colors hover:text-danger"
                    >
                      Remover
                    </button>
                  </>
                )}
              </div>
            </Field>
          </div>

          {/* Preview em tempo real + ações */}
          <div className="flex flex-col p-6 sm:p-8">
            <p className="type-label text-mute">Preview em direto</p>
            <div className="relative mt-3 aspect-[16/10] overflow-hidden border border-line bg-surface">
              {previewMode === 'image' && previewImageSrc ? (
                <img
                  src={previewImageSrc}
                  alt="Preview da imagem"
                  className="absolute inset-0 h-full w-full object-cover object-top"
                />
              ) : previewMode === 'iframe' && validUrl ? (
                <LivePreview
                  key={validUrl}
                  app={{ name: name || 'Preview', url: validUrl, previewMode: 'iframe' }}
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center">
                  <span className="type-label px-6 text-center leading-relaxed text-mute">
                    {previewMode === 'iframe'
                      ? 'Escreve um URL válido para veres o preview live aqui.'
                      : 'Carrega um screenshot para veres a capa aqui.'}
                  </span>
                </div>
              )}
            </div>

            {error && (
              <p className="type-label mt-4 border border-danger/40 px-4 py-3 text-danger" role="alert">
                {error}
              </p>
            )}

            <div className="mt-auto grid grid-cols-[1fr_auto] gap-3 pt-8">
              <button
                type="submit"
                disabled={busy}
                className="type-display bg-acid px-6 py-4 text-lg text-ink italic transition-colors hover:bg-paper disabled:opacity-50"
              >
                {busy ? 'A guardar…' : app ? 'Guardar alterações' : 'Adicionar à DEV Gallery'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="type-label border border-line px-6 text-mute transition-colors hover:border-paper hover:text-paper"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

const inputClass =
  'w-full border border-line bg-transparent px-4 py-3 text-sm text-paper outline-none transition-colors placeholder:text-mute/50 focus:border-acid'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="type-label mb-2.5 block text-mute">{label}</span>
      {children}
    </label>
  )
}

function ModeButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`type-label py-3 transition-colors ${
        active ? 'border border-acid bg-acid text-ink' : 'border border-line text-mute hover:border-mute'
      }`}
    >
      {label}
    </button>
  )
}

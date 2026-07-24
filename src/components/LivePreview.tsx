import { useEffect, useRef, useState } from 'react'
import type { AppEntry } from '../types'
import { resolveImage } from '../lib/image'

/** Largura virtual do viewport renderizado dentro do iframe em miniatura. */
const FRAME_WIDTH = 1280
/** Tempo máximo à espera do onLoad antes de esconder o skeleton. */
const LOAD_TIMEOUT_MS = 6000

interface LivePreviewProps {
  app: Pick<AppEntry, 'name' | 'url' | 'previewMode' | 'image' | 'accent'>
  /** true no overlay de detalhe — iframe em tamanho real e clicável. */
  interactive?: boolean
  className?: string
}

/**
 * Preview de uma app com fallback em cadeia:
 * iframe live escalado → imagem enviada → placeholder com monograma.
 * O iframe só é montado quando o cartão se aproxima do viewport.
 */
export function LivePreview({ app, interactive = false, className = '' }: LivePreviewProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)
  const [visible, setVisible] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const useIframe = app.previewMode === 'iframe' && Boolean(app.url)
  const imageSrc = app.image ? resolveImage(app.image) : null

  // Mede o contentor para calcular a escala do iframe.
  useEffect(() => {
    if (!useIframe) return
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) setSize({ w: width, h: height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [useIframe])

  // Observação contínua: o iframe monta quando se aproxima do viewport e
  // desmonta quando sai bem para fora dele — a memória mantém-se constante
  // mesmo com dezenas de apps na galeria.
  useEffect(() => {
    if (!useIframe) return
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: '500px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [useIframe])

  // Ao desmontar o iframe, o próximo mount recomeça do skeleton.
  useEffect(() => {
    if (!visible) setLoaded(false)
  }, [visible])

  // Sites que bloqueiam o embed podem nunca disparar onLoad — não deixar
  // o skeleton pendurado para sempre.
  useEffect(() => {
    if (!visible || loaded) return
    const timer = setTimeout(() => setLoaded(true), LOAD_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [visible, loaded])

  if (!useIframe) {
    return (
      <div className={`absolute inset-0 overflow-hidden bg-surface ${className}`}>
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={`Preview de ${app.name}`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        ) : (
          <Monogram name={app.name} accent={app.accent} />
        )}
      </div>
    )
  }

  const scale = size ? size.w / FRAME_WIDTH : 0

  return (
    <div ref={ref} className={`absolute inset-0 overflow-hidden bg-surface ${className}`}>
      {visible && size && scale > 0 && (
        <iframe
          src={app.url}
          title={`Preview de ${app.name}`}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          // Fora da ordem de tabulação: um iframe cross-origin engoliria o
          // foco do teclado sem forma de o devolver ao trap do modal.
          tabIndex={-1}
          {...(interactive
            ? { className: 'absolute inset-0 h-full w-full border-0 bg-white' }
            : {
                'aria-hidden': true,
                width: FRAME_WIDTH,
                height: Math.max(1, Math.round(size.h / scale)),
                className: 'pointer-events-none absolute left-0 top-0 border-0 bg-white',
                style: { transform: `scale(${scale})`, transformOrigin: 'top left' },
              })}
        />
      )}
      {!loaded && (
        <div className="shimmer absolute inset-0 grid place-items-center bg-surface">
          <span className="type-label flex items-center gap-2 text-mute">
            <span className="inline-block size-2 animate-pulse bg-acid" aria-hidden />
            A carregar
          </span>
        </div>
      )}
    </div>
  )
}

/** Placeholder quando não há URL embebível nem imagem. */
function Monogram({ name, accent }: { name: string; accent?: string }) {
  const color = accent ?? 'var(--color-acid)'
  return (
    <div
      className="absolute inset-0 grid place-items-center"
      style={{ background: `radial-gradient(120% 90% at 20% 0%, ${hexWithAlpha(color)} 0%, transparent 60%)` }}
    >
      <span className="type-display italic text-7xl select-none" style={{ color }} aria-hidden>
        {(name.trim()[0] ?? '?').toUpperCase()}
      </span>
      <span className="type-label absolute bottom-3 left-3 text-mute">Sem preview</span>
    </div>
  )
}

function hexWithAlpha(color: string): string {
  return color.startsWith('#') && color.length === 7 ? `${color}1f` : color
}

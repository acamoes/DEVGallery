import { useMemo, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import type { AppEntry } from '../types'
import { LivePreview } from './LivePreview'

const EASE = [0.22, 1, 0.36, 1] as const
const TILT_DEG = 2.5

interface AppCardProps {
  app: AppEntry
  index: number
  onSelect: (app: AppEntry) => void
}

export function AppCard({ app, index, onSelect }: AppCardProps) {
  const ref = useRef<HTMLElement>(null)

  // Tilt 3D subtil a seguir o cursor — só em dispositivos com rato e
  // sem preferência por movimento reduzido.
  const canTilt = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches,
    [],
  )
  const pointerX = useMotionValue(0.5)
  const pointerY = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(pointerY, [0, 1], [TILT_DEG, -TILT_DEG]), {
    stiffness: 220,
    damping: 24,
  })
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-TILT_DEG, TILT_DEG]), {
    stiffness: 220,
    damping: 24,
  })

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!canTilt || event.pointerType !== 'mouse') return
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    pointerX.set((event.clientX - rect.left) / rect.width)
    pointerY.set((event.clientY - rect.top) / rect.height)
  }

  const resetTilt = () => {
    pointerX.set(0.5)
    pointerY.set(0.5)
  }

  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, ease: EASE, delay: (index % 3) * 0.08 }}
      style={canTilt ? { rotateX, rotateY, transformPerspective: 900 } : undefined}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      className="group relative flex cursor-pointer flex-col border border-line bg-ink transition-colors duration-300 hover:bg-surface"
      onClick={() => onSelect(app)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(app)
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalhes de ${app.name}`}
    >
      {/* Moldura ácida que acende no hover */}
      <span
        className="pointer-events-none absolute inset-0 z-10 border border-acid opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
      />

      <div className="relative aspect-[16/10] overflow-hidden border-b border-line">
        <LivePreview
          app={app}
          className="brightness-[0.92] saturate-[0.85] transition-[filter] duration-500 group-hover:brightness-100 group-hover:saturate-100"
        />
        <span className="type-label absolute top-3 left-3 z-10 bg-ink/80 px-2 py-1 text-[10px] text-acid backdrop-blur-sm">
          {String(index + 1).padStart(2, '0')}
        </span>
        {app.previewMode === 'iframe' && (
          <span className="type-label absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-ink/80 px-2 py-1 text-[10px] text-paper backdrop-blur-sm">
            <span className="size-1.5 animate-pulse rounded-full bg-acid" aria-hidden />
            Live
          </span>
        )}
        {app.url && (
          <a
            href={app.url}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            aria-label={`Abrir ${app.name} em nova aba`}
            title="Abrir app em nova aba"
            className="absolute right-3 bottom-3 z-20 grid size-9 translate-y-1 place-items-center bg-acid text-base text-ink opacity-0 transition-all duration-300 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-paper"
          >
            ↗
          </a>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="type-display text-xl italic transition-colors duration-300 group-hover:text-acid sm:text-2xl">
            {app.name}
          </h3>
          <span
            className="type-label mt-1 shrink-0 text-acid opacity-0 transition-all duration-300 -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100"
            aria-hidden
          >
            Ver →
          </span>
        </div>

        <p className="mt-3 line-clamp-2 min-h-[2lh] text-sm leading-relaxed text-mute">
          {app.description}
        </p>

        {app.tags.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-4">
            {app.tags.map((tag) => (
              <li key={tag} className="type-label border border-line px-2 py-0.5 text-[10px] text-mute">
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.article>
  )
}

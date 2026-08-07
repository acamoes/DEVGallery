import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import type { AppEntry } from '../types'
import { LivePreview } from './LivePreview'

const EASE = [0.22, 1, 0.36, 1] as const

/** Cortina a abrir — reservada ao nome do projeto, o momento autoral da linha. */
const curtain = {
  hidden: { opacity: 0, y: 26, clipPath: 'inset(0 0 100% 0)' },
  show: {
    opacity: 1,
    y: 0,
    clipPath: 'inset(0 0 0% 0)',
    transition: { duration: 0.8, ease: EASE },
  },
}

/** Entrada discreta para o texto de apoio, que não deve competir com a cortina. */
const rise = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}

interface ProjectRowProps {
  app: AppEntry
  index: number
  /** Espelha as colunas — as linhas ímpares trazem o preview à direita. */
  reversed: boolean
  onSelect: (app: AppEntry) => void
}

/** Uma linha grande por projeto: preview de um lado, ficha do outro. */
export function ProjectRow({ app, index, reversed, onSelect }: ProjectRowProps) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const previewY = useTransform(scrollYProgress, [0, 1], [48, -48])
  const previewScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.06, 1, 1.06])
  // Só a ficha recua quando a linha sai do centro. O preview nunca é esbatido:
  // uma app viva a meia opacidade lê-se como avariada, não como discreta.
  const copyOpacity = useTransform(scrollYProgress, [0, 0.22, 0.78, 1], [0.55, 1, 1, 0.55])

  return (
    <motion.article
      ref={ref}
      layout
      exit={{ opacity: 0, scale: 0.98 }}
      className="group grid cursor-pointer items-center gap-8 border-t border-line py-16 lg:min-h-[78vh] lg:grid-cols-2 lg:gap-16 lg:py-24"
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
      {/* ——— Preview ———
          min-w-0 é obrigatório: sem ele as colunas herdam min-width:auto e um
          nome longo e inquebrável empurra o preview para fora do contentor. */}
      <motion.div
        style={{ y: previewY }}
        className={`relative aspect-[16/10] min-w-0 overflow-hidden border border-line bg-surface ${
          reversed ? 'lg:order-2' : 'lg:order-1'
        }`}
      >
        {/* O zoom vive dentro da moldura para a borda não deformar. */}
        <motion.div style={{ scale: previewScale }} className="absolute inset-0">
          <LivePreview
            app={app}
            className="grayscale-[0.6] brightness-[0.85] transition-[filter] duration-250 group-hover:grayscale-0 group-hover:brightness-100"
          />
        </motion.div>
        {app.url && (
          <a
            href={app.url}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            aria-label={`Abrir ${app.name} em nova aba`}
            title="Abrir app em nova aba"
            className="absolute right-4 bottom-4 z-20 grid size-11 translate-y-2 place-items-center bg-paper text-lg text-ink opacity-0 transition-all duration-200 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-mute"
          >
            ↗
          </a>
        )}
      </motion.div>

      {/* ——— Ficha ——— */}
      <motion.div
        style={{ opacity: copyOpacity }}
        className={`min-w-0 ${reversed ? 'lg:order-1' : 'lg:order-2'}`}
      >
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-15% 0px' }}
          className="flex flex-col items-start"
        >
          {/* O chip "Live" vive aqui, não sobre a moldura: dentro do preview
              tapava a própria navegação da app. */}
          <motion.p variants={rise} className="type-label flex items-center gap-4 text-mute">
            {String(index + 1).padStart(2, '0')}
            {app.previewMode === 'iframe' && (
              <span className="flex items-center gap-2 text-paper">
                <span className="size-1.5 animate-pulse rounded-full bg-paper" aria-hidden />
                Live
              </span>
            )}
          </motion.p>

          <motion.h2
            variants={curtain}
            className="type-huge mt-5 text-[clamp(2rem,4vw,3.5rem)] italic [overflow-wrap:anywhere]"
          >
            <span className="relative inline-block">
              {app.name}
              <span
                className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-paper transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
                aria-hidden
              />
            </span>
          </motion.h2>

          {app.description && (
            <motion.p
              variants={rise}
              className="mt-7 max-w-md text-[15px] leading-relaxed text-mute"
            >
              {app.description}
            </motion.p>
          )}

          {app.tags.length > 0 && (
            <motion.ul variants={rise} className="mt-7 flex flex-wrap gap-x-4 gap-y-2">
              {app.tags.map((tag) => (
                <li key={tag} className="type-label text-mute">
                  {tag}
                </li>
              ))}
            </motion.ul>
          )}

          <motion.span
            variants={rise}
            className="type-label mt-10 inline-flex items-center gap-3 text-paper"
            aria-hidden
          >
            Ver projeto
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5">
              →
            </span>
          </motion.span>
        </motion.div>
      </motion.div>
    </motion.article>
  )
}

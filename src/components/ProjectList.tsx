import { AnimatePresence, motion } from 'motion/react'
import type { AppEntry } from '../types'
import { ProjectRow } from './ProjectRow'

const EASE = [0.22, 1, 0.36, 1] as const

const AUTHOR = {
  name: 'André Camões',
  github: 'https://github.com/acamoes',
}

interface ProjectListProps {
  apps: AppEntry[]
  onSelect: (app: AppEntry) => void
}

/** Pilha vertical de linhas grandes, alternadas, com o fecho da página. */
export function ProjectList({ apps, onSelect }: ProjectListProps) {
  return (
    <div className="mx-auto max-w-[92rem] px-5 sm:px-10">
      <AnimatePresence mode="popLayout">
        {apps.map((app, index) => (
          <ProjectRow
            key={app.id}
            app={app}
            index={index}
            reversed={index % 2 === 1}
            onSelect={onSelect}
          />
        ))}
      </AnimatePresence>

      {/* Fecho da página — substitui o rodapé. */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.8, ease: EASE }}
        className="flex flex-col items-center gap-8 border-t border-line py-28 text-center sm:py-40"
      >
        {/* Subordinado ao masthead: a marca de água de fecho nunca deve ser
            maior do que o título de abertura. */}
        <p className="type-huge type-outline text-[clamp(3rem,10vw,8rem)] italic select-none" aria-hidden>
          Fim
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <span className="type-label text-mute">
            {AUTHOR.name} · {new Date().getFullYear()}
          </span>
          {/* Em paper, não em mute: um link com a cor exata do texto estático
              ao lado só se revela no hover. */}
          <a
            href={AUTHOR.github}
            target="_blank"
            rel="noreferrer"
            className="type-label text-paper transition-colors hover:text-mute"
          >
            GitHub ↗
          </a>
        </div>
      </motion.div>
    </div>
  )
}

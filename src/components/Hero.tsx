import { motion } from 'motion/react'

const EASE = [0.22, 1, 0.36, 1] as const

/** Cabeçalho compacto: masthead display de uma linha, contexto e contador. */
export function Hero({ count }: { count: number }) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-[88rem] flex-col gap-6 px-5 pt-10 pb-9 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:pt-14 sm:pb-11">
        <div>
          <motion.p
            className="type-label text-acid"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            Hello — bem-vindo à DEV Gallery
          </motion.p>
          <div className="mt-4 overflow-hidden pb-[0.1em] -mb-[0.1em]">
            <motion.h1
              className="type-display text-5xl italic sm:text-6xl"
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, delay: 0.08, ease: EASE }}
            >
              DEV<span className="text-acid"> Gallery</span>
            </motion.h1>
          </div>
          <motion.p
            className="mt-5 max-w-xl text-[15px] leading-relaxed text-mute"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
          >
            Previews vivos, em tempo real, das aplicações que construí.{' '}
            Rápidas. Interativas. A um clique de distância.
          </motion.p>
        </div>
        <motion.p
          className="type-label shrink-0 text-mute"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          N.º de apps / <span className="text-acid">{String(count).padStart(2, '0')}</span>
        </motion.p>
      </div>
    </header>
  )
}

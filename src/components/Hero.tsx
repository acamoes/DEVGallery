import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'

const EASE = [0.22, 1, 0.36, 1] as const

/** As duas palavras do masthead sobem em sequência de dentro da máscara. */
const WORDS = ['DEV', 'Gallery'] as const

/**
 * Ecrã de abertura: preto inteiro, só a marca e o autor.
 * Ao fazer scroll desvanece e sobe, entregando o ecrã aos projetos.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94])
  const y = useTransform(scrollYProgress, [0, 1], [0, -60])
  const cueOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])

  return (
    <section ref={ref} className="relative h-dvh">
      <motion.div
        style={{ opacity, scale, y }}
        className="flex h-full flex-col items-center justify-center px-5 text-center"
      >
        <h1 className="type-huge text-[clamp(3rem,13vw,12rem)] italic">
          <span className="sr-only">DEV Gallery</span>
          {WORDS.map((word, index) => (
            // A folga de 0.18em impede que o overflow-hidden da máscara corte
            // a descendente do "y"; a margem negativa anula-a no layout.
            <span key={word} className="block overflow-hidden pb-[0.18em] -mb-[0.18em]" aria-hidden>
              <motion.span
                className="block"
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1, delay: index * 0.08, ease: EASE }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          className="type-label mt-8 tracking-[0.4em] text-mute sm:mt-10"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.55, ease: EASE }}
        >
          André Camões
        </motion.p>
      </motion.div>

      {/* Ancorado à secção, não ao viewport: o indicador pertence ao ecrã de
          abertura e deve sair com ele, sem depender de position: fixed. */}
      <motion.span
        style={{ opacity: cueOpacity }}
        className="type-label pointer-events-none absolute inset-x-0 bottom-8 text-center text-mute"
        aria-hidden
      >
        <motion.span
          className="inline-block"
          // A pulsação é opacidade, que o reducedMotion do Motion não trava
          // sozinho — um elemento a pulsar para sempre é exatamente o que a
          // preferência do sistema existe para calar.
          initial={{ opacity: reduced ? 1 : 0 }}
          animate={reduced ? { opacity: 1 } : { opacity: [0.35, 1, 0.35] }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 2.6, delay: 1.1, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          Scroll ↓
        </motion.span>
      </motion.span>
    </section>
  )
}

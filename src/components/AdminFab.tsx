import { motion } from 'motion/react'

/** Botão flutuante de adicionar app — visível em dev ou quando o admin está ativo. */
export function AdminFab({ onClick, badge = 'dev' }: { onClick: () => void; badge?: string }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      className="type-display fixed right-5 bottom-5 z-30 flex items-center gap-2.5 bg-paper px-6 py-4 text-base text-ink italic shadow-[0_12px_40px_rgba(255,255,255,0.18)] sm:right-8 sm:bottom-8"
    >
      <span className="text-xl leading-none not-italic" aria-hidden>
        +
      </span>
      Adicionar app
      <span className="type-label ml-1 border border-ink/30 px-1.5 py-0.5 text-[9px] not-italic">
        {badge}
      </span>
    </motion.button>
  )
}

import { useEffect, useRef } from 'react'
import { pauseSmoothScroll, resumeSmoothScroll } from './useSmoothScroll'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Comportamento partilhado dos overlays:
 * - bloqueia o scroll da página
 * - Esc fecha
 * - focus trap: Tab circula dentro do modal
 * - foco inicial em `[data-autofocus]` (ou no primeiro focável)
 * - ao fechar, devolve o foco ao elemento que abriu o modal
 *
 * Devolve o ref a colocar no contentor do modal.
 */
export function useModal<T extends HTMLElement>(onClose: () => void) {
  const containerRef = useRef<T>(null)

  // Handler estável — o efeito não deve re-correr quando o pai re-renderiza.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    const container = containerRef.current
    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // O scroll com inércia agarra a roda do rato — tem de largar enquanto
    // o overlay estiver aberto para o conteúdo do modal poder deslizar.
    pauseSmoothScroll()

    const focusables = () =>
      Array.from(container?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
        (el) => el.offsetParent !== null,
      )

    const initial =
      container?.querySelector<HTMLElement>('[data-autofocus]') ?? focusables()[0]
    initial?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return
      const els = focusables()
      if (els.length === 0) return
      const first = els[0]
      const last = els[els.length - 1]
      const active = document.activeElement as HTMLElement | null
      const inside = active !== null && container !== null && container.contains(active)

      if (event.shiftKey && (active === first || !inside)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || !inside)) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      resumeSmoothScroll()
      previouslyFocused?.focus?.()
    }
  }, [])

  return containerRef
}

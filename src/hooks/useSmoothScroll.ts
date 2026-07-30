import { useEffect } from 'react'
import Lenis from 'lenis'

/**
 * Instância partilhada — os modais precisam de a parar enquanto estão
 * abertos, senão o scroll do overlay compete com o da página.
 */
let lenis: Lenis | null = null

export function pauseSmoothScroll() {
  lenis?.stop()
}

export function resumeSmoothScroll() {
  lenis?.start()
}

/**
 * Scroll com inércia (o traço que define este tipo de site).
 * Não faz nada se o utilizador pediu movimento reduzido — nesse caso o
 * browser trata do scroll nativamente.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const instance = new Lenis({ lerp: 0.09, wheelMultiplier: 1 })
    lenis = instance

    let frame = 0
    const raf = (time: number) => {
      instance.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      instance.destroy()
      lenis = null
    }
  }, [])
}

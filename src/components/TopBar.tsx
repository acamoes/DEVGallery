import { useEffect, useState } from 'react'

/** Barra superior fina — aceno à status bar da referência (relógio vivo). */
export function TopBar({ count }: { count: number }) {
  const [time, setTime] = useState(() => formatTime(new Date()))

  useEffect(() => {
    const timer = setInterval(() => setTime(formatTime(new Date())), 30_000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="border-b border-line">
      <div className="mx-auto flex max-w-[88rem] items-center justify-between px-5 py-3.5 sm:px-8">
        <span className="type-label flex items-center gap-2 text-paper">
          <span className="inline-block size-2 bg-acid" aria-hidden />
          DEV Gallery
        </span>
        <span className="type-label text-mute">
          {String(count).padStart(2, '0')} apps — <span className="text-paper">{time}</span>
        </span>
      </div>
    </div>
  )
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
}

// Preenche com os teus dados reais antes de publicar.
const AUTHOR = {
  name: 'André',
  github: 'https://github.com/o-teu-username',
  email: 'mailto:o-teu-email@exemplo.com',
}

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto flex max-w-[88rem] flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="type-label text-mute">
          © {new Date().getFullYear()} <span className="text-paper">{AUTHOR.name}</span> — DEV Gallery
        </p>
        <div className="flex items-center gap-6">
          <a
            href={AUTHOR.github}
            target="_blank"
            rel="noreferrer"
            className="type-label text-mute transition-colors hover:text-acid"
          >
            GitHub ↗
          </a>
          <a href={AUTHOR.email} className="type-label text-mute transition-colors hover:text-acid">
            Email ↗
          </a>
          <span className="type-label hidden text-mute/60 sm:inline">React · Vite · Tailwind</span>
        </div>
      </div>
    </footer>
  )
}

interface TagFilterProps {
  tags: string[]
  activeTag: string | null
  onTagChange: (tag: string | null) => void
  query: string
  onQueryChange: (query: string) => void
  shown: number
  total: number
}

export function TagFilter({
  tags,
  activeTag,
  onTagChange,
  query,
  onQueryChange,
  shown,
  total,
}: TagFilterProps) {
  return (
    <div className="flex flex-col gap-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por tag">
        <FilterChip label="Todas" active={activeTag === null} onClick={() => onTagChange(null)} />
        {tags.map((tag) => (
          <FilterChip
            key={tag}
            label={tag}
            active={activeTag === tag}
            onClick={() => onTagChange(activeTag === tag ? null : tag)}
          />
        ))}
      </div>

      <div className="flex items-center gap-5">
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="PESQUISAR…"
          aria-label="Pesquisar apps"
          className="type-label w-44 border-b border-line bg-transparent px-1 pb-2 text-paper transition-colors outline-none placeholder:text-mute/60 focus:border-acid"
        />
        <span className="type-label shrink-0 text-mute" aria-live="polite">
          {String(shown).padStart(2, '0')}
          <span className="text-line"> / </span>
          {String(total).padStart(2, '0')}
        </span>
      </div>
    </div>
  )
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`type-label px-3 py-1.5 transition-colors duration-200 ${
        active
          ? 'border border-acid bg-acid text-ink'
          : 'border border-line text-mute hover:border-mute hover:text-paper'
      }`}
    >
      {label}
    </button>
  )
}

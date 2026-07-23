interface EmptyStateProps {
  /** true quando existem apps mas o filtro/pesquisa não devolve nada. */
  filtered: boolean
  onAdd?: () => void
}

export function EmptyState({ filtered, onAdd }: EmptyStateProps) {
  return (
    <div className="border border-line px-6 py-24 text-center sm:py-32">
      <p className="type-display type-outline text-[clamp(3rem,10vw,7rem)] italic select-none" aria-hidden>
        {filtered ? 'Sem resultados.' : 'Vazio.'}
      </p>
      <p className="mx-auto mt-6 max-w-sm text-sm leading-relaxed text-mute">
        {filtered
          ? 'Nenhuma app corresponde ao filtro atual. Limpa a pesquisa ou escolhe outra tag.'
          : 'Ainda não há nada na DEV Gallery. A primeira app está à distância de um clique.'}
      </p>
      {!filtered && onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="type-display mt-10 inline-block bg-acid px-8 py-4 text-lg text-ink italic transition-colors hover:bg-paper"
        >
          Adicionar a primeira app
        </button>
      )}
    </div>
  )
}

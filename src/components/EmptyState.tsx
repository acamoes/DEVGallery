interface EmptyStateProps {
  onAdd?: () => void
}

/** Galeria sem nenhuma app — só acontece antes da primeira entrada. */
export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="mx-auto flex max-w-[92rem] flex-col items-center border-t border-line px-5 py-32 text-center sm:px-10 sm:py-48">
      <p className="type-huge type-outline text-[clamp(3rem,12vw,9rem)] italic select-none" aria-hidden>
        Vazio
      </p>
      {/* Sem o botão não há clique nenhum — prometê-lo seria mentir. Nesse
          caso a mensagem aponta para onde as entradas vivem mesmo. */}
      <p className="mx-auto mt-8 max-w-sm text-sm leading-relaxed text-mute">
        {onAdd
          ? 'Ainda não há nada na DEV Gallery. A primeira app está à distância de um clique.'
          : 'Ainda não há nada na DEV Gallery. As entradas vivem em src/data/apps.json.'}
      </p>
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="type-display mt-12 inline-block bg-paper px-8 py-4 text-lg text-ink italic transition-colors hover:bg-mute"
        >
          Adicionar a primeira app
        </button>
      )}
    </div>
  )
}

import type { ReactNode } from 'react'

/** A row of choices with a label on its left (above it on narrow screens, or always with `stacked`). */
export function Choice({ label, stacked = false, children }: { label: string; stacked?: boolean; children: ReactNode }) {
  return (
    <div className={`flex flex-col gap-2 ${stacked ? '' : 'tablet:flex-row tablet:items-center tablet:gap-4'}`}>
      <p className={`type-ui-md text-typography-secondary ${stacked ? '' : 'tablet:w-24'}`}>{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

/** A pill the visitor picks (a coin, a currency, a term): the chosen one is dark, the others are light. */
export function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`type-ui-md rounded-pill px-4 py-2 ring-1 transition-colors ring-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand ${
        selected ? 'bg-surface-inverse text-typography-inverse ring-transparent' : 'bg-surface-subtle text-typography-primary ring-border-subtle hover:bg-surface-hover'
      }`}
    >
      {children}
    </button>
  )
}

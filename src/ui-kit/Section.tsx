import type { ReactNode } from 'react'

/** A titled block of the UI Kit page. The id is the anchor and the `data-el` (`ui-kit__{id}`). */
export function Section({ id, title, note, children }: { id: string; title: string; note?: string; children: ReactNode }) {
  return (
    <section id={id} data-el={`ui-kit__${id}`} className="flex flex-col gap-6 border-t border-border-subtle py-10">
      <div className="flex flex-col gap-1">
        <h2 className="type-heading-md text-typography-primary">{title}</h2>
        {note && <p className="type-body-md max-w-3xl text-typography-secondary">{note}</p>}
      </div>
      {children}
    </section>
  )
}

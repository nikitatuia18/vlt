import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Chip, Choice } from '../../components/ui/Chip'
import { duration, easeOut } from '../../motion/tokens'
import { CLIENT, currencies, dueOptions, formatMoney, INVOICE_NO, lineItems, payLink, RATES, setDraft, totals, useDraft, type ItemId } from './demo'
import { CheckIcon, CopyIcon, TwinAmount } from './parts'
import { createScene } from './sceneText'

/**
 * Step 1 of the Invoicing page: "Create". `invoicing__step-create-illustration`.
 * The visitor builds an invoice: the currency of the client, which items go in, the term, the tax. The sheet on the right is the invoice itself,
 * it recounts at once, and its total is shown in two currencies at the same time (the currency of the client and the coin the client pays in).
 * "Create invoice" ends the step with the payment link. The choice is shared with steps 2 and 3.
 * Texts inside the scene are part of the picture: not revealed by words.
 */
export function StepCreate() {
  const draft = useDraft()
  const reduced = useReducedMotion() ?? false
  const sums = totals(draft)
  const [pulse, setPulse] = useState(0)
  const [created, setCreated] = useState(false)
  const [copied, setCopied] = useState(false)
  const first = useRef(true)

  // The dot runs over the bridge each time the total changes; a changed invoice has to be created again.
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setPulse((count) => count + 1)
    setCreated(false)
  }, [sums.total, sums.coin, draft.currency, draft.due])

  const toggle = (id: ItemId) => setDraft({ items: draft.items.includes(id) ? draft.items.filter((item) => item !== id) : [...draft.items, id] })

  const link = payLink(INVOICE_NO)
  const copy = () => {
    void navigator.clipboard?.writeText(link).catch(() => {})
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <div data-el="invoicing__step-create-illustration" className="grid grid-cols-[minmax(0,1fr)] gap-4 tablet:grid-cols-2 tablet:gap-6">
      <div className="flex flex-col gap-5">
        <h4 className="type-heading-sm text-typography-primary">{createScene.title}</h4>
        <Choice label={createScene.currency} stacked>
          {currencies.map((currency) => (
            <Chip key={currency} selected={currency === draft.currency} onClick={() => setDraft({ currency })}>
              {currency}
            </Chip>
          ))}
        </Choice>
        <Choice label={createScene.items} stacked>
          <ul className="flex w-full flex-col gap-2">
            {lineItems.map((item) => {
              const on = draft.items.includes(item.id)
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(item.id)}
                    data-item={item.id}
                    className={`flex w-full items-center gap-3 rounded-32 bg-surface-subtle px-4 py-3 text-left ring-1 transition-colors ring-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand ${
                      on ? 'ring-border-brand' : 'ring-border-subtle hover:bg-surface-hover'
                    }`}
                  >
                    <span className={`flex size-6 shrink-0 items-center justify-center rounded-pill transition-colors ${on ? 'bg-surface-brand-default text-typography-static-w' : 'bg-surface-hover text-transparent'}`}>
                      <CheckIcon />
                    </span>
                    <span className="type-ui-md min-w-0 flex-1 text-typography-primary">{item.title}</span>
                    <span className="type-ui-md whitespace-nowrap text-typography-secondary tabular-nums">{formatMoney(totals({ ...draft, items: [item.id], tax: false }).total)}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </Choice>
        <Choice label={createScene.due} stacked>
          {dueOptions.map((days) => (
            <Chip key={days} selected={days === draft.due} onClick={() => setDraft({ due: days })}>
              {days} {createScene.days}
            </Chip>
          ))}
        </Choice>
        <div>
          <Chip selected={draft.tax} onClick={() => setDraft({ tax: !draft.tax })}>
            {createScene.tax}
          </Chip>
        </div>
        <p data-el="invoicing__step-create-hint" className="type-ui-sm text-typography-secondary">
          {createScene.hint}
        </p>
      </div>

      {/* The invoice itself. */}
      <div data-el="invoicing__step-create-sheet" className="flex flex-col gap-4 rounded-32 bg-surface-subtle p-5 ring-1 ring-border-subtle ring-inset tablet:p-6">
        <div className="flex flex-col items-start gap-2">
          <div className="flex flex-col">
            <p className="type-heading-sm whitespace-nowrap text-typography-primary">
              {createScene.sheetTitle} {INVOICE_NO}
            </p>
            <p className="type-ui-sm text-typography-secondary">
              {createScene.to} {CLIENT}
            </p>
          </div>
          <span className="type-ui-sm rounded-pill bg-surface-hover px-3 py-1 whitespace-nowrap text-typography-primary">
            {createScene.dueLine} {draft.due} {createScene.days}
          </span>
        </div>

        <ul className="flex min-h-24 flex-col border-t border-dashed border-border-strong pt-2">
          <AnimatePresence initial={false}>
            {sums.lines.map((line) => (
              <motion.li
                key={line.id}
                initial={reduced ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: duration.reveal / 2, ease: easeOut }}
                className="overflow-hidden"
              >
                <div className="type-ui-md flex items-baseline justify-between gap-3 py-1.5 text-typography-primary">
                  <span>{line.title}</span>
                  <span className="tabular-nums">{formatMoney(line.amount)}</span>
                </div>
              </motion.li>
            ))}
            {draft.tax && sums.lines.length > 0 && (
              <motion.li
                key="tax"
                initial={reduced ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: duration.reveal / 2, ease: easeOut }}
                className="overflow-hidden"
              >
                <div className="type-ui-md flex items-baseline justify-between gap-3 py-1.5 text-typography-secondary">
                  <span>{createScene.taxLine}</span>
                  <span className="tabular-nums">{formatMoney(sums.taxAmount)}</span>
                </div>
              </motion.li>
            )}
          </AnimatePresence>
          {sums.lines.length === 0 && <li className="type-ui-md py-1.5 text-typography-secondary">{createScene.empty}</li>}
        </ul>

        <div className="mt-auto flex flex-col gap-2 border-t border-dashed border-border-strong pt-4">
          <p className="type-ui-sm text-typography-secondary">
            {createScene.total} · {createScene.clientPays}
          </p>
          <TwinAmount local={sums.total} currency={draft.currency} coin={sums.coin} pulse={pulse} layout="stack" size="md" />
          <p data-el="invoicing__step-create-rate" className="type-ui-sm text-typography-secondary">
            {createScene.rate} 1 USDT = {draft.currency} {RATES[draft.currency].toFixed(2)}
          </p>
        </div>

        {/* The result of the step: the invoice is created and has its link. */}
        {created ? (
          <div data-el="invoicing__step-create-result" className="flex flex-col gap-2">
            <p className="type-ui-md inline-flex items-center gap-2 text-typography-success">
              <CheckIcon />
              {createScene.created}
            </p>
            <div className="flex items-center justify-between gap-3 rounded-pill bg-surface-page py-2 pr-2 pl-4 ring-1 ring-border-subtle ring-inset">
              <span className="type-code-sm truncate text-typography-primary">{link}</span>
              <button
                type="button"
                onClick={copy}
                className="type-ui-sm inline-flex items-center gap-1.5 rounded-pill bg-surface-subtle px-3 py-1.5 whitespace-nowrap text-typography-primary ring-1 ring-border-subtle transition-colors ring-inset hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand"
              >
                <CopyIcon />
                {copied ? createScene.copied : createScene.copy}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            data-el="invoicing__step-create-button"
            disabled={sums.lines.length === 0}
            onClick={() => setCreated(true)}
            className="type-ui-md w-full rounded-pill bg-surface-inverse px-5 py-3 text-typography-inverse transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand disabled:opacity-40"
          >
            {createScene.create}
          </button>
        )}
      </div>
    </div>
  )
}

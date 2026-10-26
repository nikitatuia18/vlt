import { useEffect, useRef, useState } from 'react'
import type { Direction } from './demo'
import { directionText } from './sceneText'

/** The two directions as a switch of two plain words; the short line under it says what each one is called. `name` prefixes the `data-el`. */
export function DirectionSwitch({ name, direction, onChange }: { name: string; direction: Direction; onChange: (next: Direction) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <fieldset className="m-0 flex w-fit min-w-0 gap-1 rounded-pill border-0 bg-surface-subtle p-1 ring-1 ring-border-subtle ring-inset">
        <legend className="sr-only">Direction</legend>
        {(['on', 'off'] as const).map((value) => (
          <button
            key={value}
            type="button"
            data-el={`${name}-direction-${value}`}
            aria-pressed={direction === value}
            onClick={() => onChange(value)}
            className={`type-ui-md rounded-pill px-4 py-2 whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand ${
              direction === value ? 'bg-surface-inverse text-typography-inverse' : 'text-typography-primary hover:bg-surface-hover'
            }`}
          >
            {directionText[value].label}
          </button>
        ))}
      </fieldset>
      <p data-el={`${name}-direction-caption`} className="type-ui-sm text-typography-secondary">
        {directionText[direction].caption}
      </p>
    </div>
  )
}

/**
 * The field of the sum with the code of the currency next to the number (before it for money, after it for USDT, like in the receipt).
 * It keeps what the visitor types; when the sum is changed elsewhere and the field is not in use, it follows.
 */
export function AmountField({
  id,
  dataEl,
  amount,
  code,
  codeFirst,
  placeholder,
  readOnly = false,
  format,
  onChange,
}: {
  id: string
  dataEl: string
  amount: number
  code: string
  codeFirst: boolean
  placeholder: string
  readOnly?: boolean
  format: (value: number) => string
  onChange: (value: number) => void
}) {
  const [text, setText] = useState(() => format(amount))
  const typing = useRef(false)
  useEffect(() => {
    if (!typing.current) setText(amount > 0 ? format(amount) : '')
  }, [amount, format])

  return (
    <div className="type-ui-lg flex min-w-0 flex-1 items-center gap-2 rounded-pill bg-surface-subtle px-4 py-2 text-typography-primary ring-1 ring-border-subtle ring-inset focus-within:ring-typography-brand">
      {codeFirst && <span className="text-typography-secondary">{code}</span>}
      <input
        id={id}
        data-el={dataEl}
        inputMode="decimal"
        autoComplete="off"
        readOnly={readOnly}
        placeholder={placeholder}
        value={text}
        onFocus={() => void (typing.current = true)}
        onBlur={() => {
          typing.current = false
          setText(amount > 0 ? format(amount) : '')
        }}
        onChange={(event) => {
          setText(event.target.value)
          const parsed = Number.parseFloat(event.target.value.replace(/,/g, ''))
          onChange(Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 1e12) : 0)
        }}
        className="w-full min-w-0 bg-transparent text-right outline-none placeholder:text-typography-tertiary tablet:w-32"
      />
      {!codeFirst && <span className="text-typography-secondary">{code}</span>}
    </div>
  )
}

/** One line of the receipt: a small label over a value. */
export function ReceiptCell({ label, value, name, strong = false, className = '' }: { label: string; value: string; name: string; strong?: boolean; className?: string }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <p className="type-ui-sm text-typography-secondary">{label}</p>
      <p data-el={name} className={`${strong ? 'type-heading-sm' : 'type-ui-lg'} text-typography-primary`}>
        {value}
      </p>
    </div>
  )
}

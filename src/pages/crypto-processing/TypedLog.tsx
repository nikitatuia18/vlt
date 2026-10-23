import { useEffect, useState } from 'react'

export type LogLine = { text: string; tone: 'event' | 'text' | 'muted' | 'ok' }

/** Milliseconds per typed character, and the pause between two lines counted in characters. */
const CHAR_MS = 22
const LINE_PAUSE = 8

const toneClass: Record<LogLine['tone'], string> = {
  event: 'text-typography-brand',
  text: 'text-typography-primary',
  muted: 'text-typography-secondary',
  ok: 'text-typography-brand',
}

/**
 * A small console that writes its lines one after another, character by character, with a thin bar showing how far the writing has gone.
 * The component is mounted again (a new `key`) whenever the lines must be written anew. `instant` shows everything at once
 * (reduced motion, appearance animations off). `onDone` is told when the last character is written (and with `false` while it is not).
 */
export function TypedLog({ lines, instant, onDone, ...rest }: { lines: readonly LogLine[]; instant: boolean; onDone?: (done: boolean) => void; 'data-el': string }) {
  // Where each line starts on the common "typing line": the pause between lines is a few characters long.
  const starts: number[] = []
  let total = 0
  for (const line of lines) {
    starts.push(total)
    total += line.text.length + LINE_PAUSE
  }
  total -= LINE_PAUSE

  const [typed, setTyped] = useState(instant ? total : 0)
  const done = typed >= total

  useEffect(() => {
    if (instant || done) return
    const timer = window.setInterval(() => setTyped((current) => current + 1), CHAR_MS)
    return () => window.clearInterval(timer)
  }, [instant, done])

  useEffect(() => {
    onDone?.(done)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  return (
    <div {...rest} data-done={done} className="flex flex-col gap-3 rounded-32 bg-surface-page p-4 ring-1 ring-border-subtle ring-inset">
      <div aria-hidden="true" className="h-0.5 overflow-hidden rounded-pill bg-border-subtle">
        <div className="h-full bg-typography-brand" style={{ width: `${Math.min(100, (typed / total) * 100)}%` }} />
      </div>
      <div className="flex flex-col" role="log" aria-label={lines.map((line) => line.text).join('. ')}>
        {lines.map((line, index) => {
          const visible = Math.max(0, Math.min(line.text.length, typed - starts[index]))
          const writing = !done && visible > 0 && visible < line.text.length
          return (
            <p key={index} aria-hidden="true" className={`type-code-sm min-h-[1.5em] whitespace-pre-wrap ${toneClass[line.tone]}`}>
              {visible > 0 && <span className="text-typography-tertiary">{line.tone === 'ok' ? '✓ ' : '> '}</span>}
              {line.text.slice(0, visible)}
              {writing && <span className="ml-px inline-block h-[1em] w-[0.5ch] translate-y-[0.15em] bg-current" />}
            </p>
          )
        })}
      </div>
    </div>
  )
}

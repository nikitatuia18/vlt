import type { CodeScript } from './codeScripts'

/**
 * The timing of the code window, as a pure function of the time (no state, so it is easy to test and to pause):
 * for each script: the caret alone, the typing, the pause on the finished text, the erasing; then the next script.
 * Times in milliseconds.
 */
export const typing = {
  /** The caret blinks alone before the typing starts (and the tab has already switched). */
  lead: 600,
  /** Time of one character: base plus a steady "random" part, so the typing is a little uneven like a hand. */
  char: { base: 26, spread: 16 },
  /** Indentation is typed at once (the editor does it), the end of a line and a comma make a small pause. */
  space: 4,
  newline: 150,
  comma: 70,
  /** The finished text stays. */
  hold: 3600,
  /** The erasing starts slowly and speeds up (a key held down); the whole text goes in this time. */
  erase: 1000,
  /** The caret blinks: half a period. */
  blink: 530,
} as const

/** A number from 0 to 1 for the character `index`: the same every time, so the typing does not change from loop to loop. */
const noise = (index: number) => {
  const x = Math.sin(index * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

/** The moment (ms from the start of the typing) when each character appears. */
export function typeTimes(text: string): number[] {
  const times: number[] = []
  let at = 0
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const before = text[i - 1]
    if (char === ' ' && (before === ' ' || before === '\n')) at += typing.space
    else at += typing.char.base + noise(i) * typing.char.spread
    if (char === '\n') at += typing.newline
    if (char === ',') at += typing.comma
    times.push(at)
  }
  return times
}

export type Frame = {
  /** Which script is on the screen. */
  index: number
  /** How many characters of it are shown. */
  chars: number
  /** The caret is drawn (it blinks while nothing is typed or erased). */
  caret: boolean
}

export type Cycle = {
  scripts: readonly { text: string; times: number[] }[]
  /** Length of each script's turn, ms. */
  durations: number[]
  total: number
}

export function buildCycle(scripts: readonly CodeScript[]): Cycle {
  const prepared = scripts.map((script) => {
    const text = script.tokens.map((token) => token.text).join('')
    return { text, times: typeTimes(text) }
  })
  const durations = prepared.map(({ times }) => typing.lead + (times.at(-1) ?? 0) + typing.hold + typing.erase)
  return { scripts: prepared, durations, total: durations.reduce((sum, value) => sum + value, 0) }
}

/** What is on the screen `time` ms after the start (the loop goes on from the first script when the last one is erased). */
export function frameAt(cycle: Cycle, time: number): Frame {
  let local = time % cycle.total
  let index = 0
  while (index < cycle.durations.length - 1 && local >= cycle.durations[index]) {
    local -= cycle.durations[index]
    index++
  }
  const { text, times } = cycle.scripts[index]

  const typeEnd = typing.lead + (times.at(-1) ?? 0)
  const holdEnd = typeEnd + typing.hold

  if (local < typing.lead) return { index, chars: 0, caret: Math.floor(local / typing.blink) % 2 === 0 }
  if (local < typeEnd) {
    let chars = 0
    while (chars < times.length && times[chars] <= local - typing.lead) chars++
    return { index, chars, caret: true }
  }
  if (local < holdEnd) return { index, chars: text.length, caret: Math.floor((local - typeEnd) / typing.blink) % 2 === 0 }
  const progress = (local - holdEnd) / typing.erase
  return { index, chars: Math.ceil(text.length * (1 - progress * progress)), caret: true }
}

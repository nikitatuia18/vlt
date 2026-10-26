import { glyphPoints, seeded } from './glyphs'

/*
 * The cloud of the hero: one swarm of dots that is the euro on the left and, after it has crossed the door in the middle, the ₮ on the right
 * (and back). The dots float like the dots of the site: each has its own slow orbit, is held to its place by a spring (so it swings and
 * overshoots), and the mouse pushes it away. No DOM here: the scene gives the size, the time and the mouse, and draws what `draw` is told.
 */

/** Side A is the bank (the euro, on the left), side B is the wallet (the ₮, on the right). */
export type Side = 0 | 1

/**
 * Seconds. Before a crossing the dots that are not at its source are swapped softly: each one fades out where it is (`SWAP_OUT`), and fades in at
 * the source (`SWAP_IN`), the starts shaken over `SWAP_SPREAD`, so nothing flies across the picture. Then a short wait, and the wave:
 * the dots set off one after another over `DEPART`; one dot flies for about `FLIGHT`.
 */
const SWAP_OUT = 0.35
const SWAP_IN = 0.6
const SWAP_SPREAD = 0.4
const SWAP_TOTAL = SWAP_SPREAD + SWAP_OUT + SWAP_IN
export const QUICK = 0.45
export const HOLD = 0.35
export const DEPART = 2.2
export const FLIGHT = 1.6
const FEE_SECONDS = 1.5
/** The share of the dots that are the fee. */
export const FEE_SHARE = 0.005

const SPRING = 0.04
const DAMPING = 0.88
const PUSH_RADIUS = 130
const PUSH_FORCE = 2.2

const MODE_REST = 0
const MODE_FLY = 1
const MODE_FEE = 2
const MODE_GONE = 3

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

/** `dot` is the color of the dots of the cloud (thin, like the dots of the background), `ink` the one of the captions, `brand` the fee. */
export type Palette = { ink: string; dot: string; brand: string; mute: string }

export class Cloud {
  count = 0
  width = 0
  height = 0
  /** The size of a sign, the middle of the picture, the left and the right sign, the radius of a dot. */
  size = 0
  middleY = 0
  leftX = 0
  rightX = 0
  radius = 1

  /** The radius of the ring of the door. */
  get doorRadius() {
    return this.size * (this.width < 600 ? 0.22 : 0.27)
  }

  private x = new Float32Array(0)
  private y = new Float32Array(0)
  private vx = new Float32Array(0)
  private vy = new Float32Array(0)
  private alpha = new Float32Array(0)
  private phase = new Float32Array(0)
  private speed = new Float32Array(0)
  private reach = new Float32Array(0)
  private home: [Float32Array, Float32Array] = [new Float32Array(0), new Float32Array(0)]
  /** Position of each dot along the sign from the top (0) to the bottom (1): the wave of the departure follows it. */
  private order = new Float32Array(0)
  private depart = new Float64Array(0)
  private flight = new Float32Array(0)
  private mode = new Uint8Array(0)
  /** The side each dot belongs to: its spring pulls it to the place it has there. */
  private side = new Uint8Array(0)
  private isFee = new Uint8Array(0)
  private ejected = new Float64Array(0)
  private gate = new Float32Array(0)
  private lift = new Float32Array(0)
  /** When a dot starts its soft swap (0 = it is not swapping), and whether it has already been moved to the source. */
  private swapAt = new Float64Array(0)
  private swapMoved = new Uint8Array(0)

  /** The side the last wave started from, and the side the cloud stands on when nothing flies. */
  private from: Side = 0
  private cloudAt: Side = 0
  private finishAt = 0
  private reported = true
  private flux = 0
  /** Until when (seconds) the last fee dot is on its way up, for the caption at the door. */
  feeUntil = 0

  /** How much the door glows (0…1): the more dots cross it, the more. */
  get glow() {
    return this.flux
  }

  /** Called once when the last dot has landed. */
  onDone: () => void = () => {}

  /** The size of the picture in px: builds the signs, and keeps the dots where they are in the new coordinates. */
  layout(width: number, height: number) {
    this.width = width
    this.height = height
    this.size = Math.min(height * 0.64, width * (width < 600 ? 0.38 : 0.33))
    this.middleY = height * (width < 600 ? 0.43 : 0.46)
    this.leftX = width * 0.24
    this.rightX = width * 0.76
    // Fewer, thinner dots than the first try: close to the dots of the page background (about 1 px), spaced airily.
    const count = Math.round(Math.min(1000, Math.max(300, (this.size * this.size) / 90)))
    const spacing = Math.sqrt((0.35 * this.size * this.size) / count)
    this.radius = Math.min(1.3, Math.max(0.8, spacing * 0.2))

    const euro = glyphPoints('euro', count, 7)
    const tether = glyphPoints('tether', count, 11)
    const fresh = count !== this.count
    if (fresh) this.allocate(count)
    for (let index = 0; index < count; index++) {
      this.home[0][index * 2] = this.leftX + euro[index].x * this.size
      this.home[0][index * 2 + 1] = this.middleY + euro[index].y * this.size
      this.home[1][index * 2] = this.rightX + tether[index].x * this.size
      this.home[1][index * 2 + 1] = this.middleY + tether[index].y * this.size
      this.order[index] = index / (count - 1)
      if (fresh) {
        this.x[index] = this.home[this.cloudAt][index * 2]
        this.y[index] = this.home[this.cloudAt][index * 2 + 1]
        this.side[index] = this.cloudAt
      }
    }
  }

  private allocate(count: number) {
    this.count = count
    const random = seeded(3)
    this.x = new Float32Array(count)
    this.y = new Float32Array(count)
    this.vx = new Float32Array(count)
    this.vy = new Float32Array(count)
    this.alpha = new Float32Array(count).fill(1)
    this.phase = new Float32Array(count)
    this.speed = new Float32Array(count)
    this.reach = new Float32Array(count)
    this.home = [new Float32Array(count * 2), new Float32Array(count * 2)]
    this.order = new Float32Array(count)
    this.depart = new Float64Array(count)
    this.flight = new Float32Array(count)
    this.mode = new Uint8Array(count)
    this.side = new Uint8Array(count)
    this.isFee = new Uint8Array(count)
    this.ejected = new Float64Array(count)
    this.gate = new Float32Array(count)
    this.lift = new Float32Array(count)
    this.swapAt = new Float64Array(count)
    this.swapMoved = new Uint8Array(count)
    for (let index = 0; index < count; index++) {
      this.phase[index] = random() * Math.PI * 2
      this.speed[index] = 0.35 + random() * 0.6
      this.reach[index] = 0.7 + random() * 1.9
      this.flight[index] = FLIGHT * (0.85 + random() * 0.3)
      this.gate[index] = (random() - 0.5) * 2
      this.lift[index] = 0.4 + random() * 0.9
    }
  }

  /** The dots stand on the finished picture: the ₮ is whole on the right (or the euro on the left), nothing moves. */
  settle(side: Side) {
    this.cloudAt = side
    for (let index = 0; index < this.count; index++) {
      this.x[index] = this.home[side][index * 2]
      this.y[index] = this.home[side][index * 2 + 1]
      this.vx[index] = 0
      this.vy[index] = 0
      this.alpha[index] = 1
      this.mode[index] = MODE_REST
      this.side[index] = side
      this.swapAt[index] = 0
      this.isFee[index] = 0
    }
    this.reported = true
  }

  /**
   * The cloud is at the source `from` (the dots that are somewhere else are swapped softly, see above), and after a short wait the wave
   * crosses the door towards the other side.
   */
  play(from: Side, now: number) {
    this.from = from
    this.cloudAt = from
    this.reported = false
    const fees = Math.max(4, Math.round(this.count * FEE_SHARE))
    const random = seeded(Math.floor(now * 1000) + 5)
    this.isFee.fill(0)
    for (let step = 0; step < fees; step++) {
      // The fee dots come from the middle of the wave, spread along it.
      const at = Math.floor(this.count * (0.3 + (0.4 * (step + 0.5)) / fees))
      this.isFee[at] = 1
    }
    let swapping = false
    for (let index = 0; index < this.count; index++) {
      const clean = this.mode[index] === MODE_REST && this.side[index] === from && this.swapAt[index] === 0
      if (!clean) {
        swapping = true
        // A dot that was the fee last time (or is on its way) fades out first as well: it has no place to fly back from.
        if (this.mode[index] === MODE_GONE) this.alpha[index] = 0
        this.swapAt[index] = now + random() * SWAP_SPREAD
        this.swapMoved[index] = this.mode[index] === MODE_GONE ? 1 : 0
        if (this.mode[index] === MODE_GONE) {
          this.x[index] = this.home[from][index * 2]
          this.y[index] = this.home[from][index * 2 + 1]
          this.vx[index] = 0
          this.vy[index] = 0
          this.side[index] = from
        }
        this.mode[index] = MODE_REST
      }
    }
    const ready = now + (swapping ? SWAP_TOTAL : QUICK) + HOLD
    for (let index = 0; index < this.count; index++) this.depart[index] = ready + this.order[index] * DEPART + (random() - 0.5) * 0.12
    this.finishAt = ready + DEPART + FLIGHT * 1.2
  }

  get playing() {
    return !this.reported
  }

  /** One frame: `dt` seconds since the last one, `now` in seconds, the mouse in px of the picture (or far outside). */
  step(dt: number, now: number, mouseX: number, mouseY: number) {
    const frame = Math.min(dt * 60, 2.5)
    const damping = Math.pow(DAMPING, frame)
    const doorX = this.width / 2
    let crossing = 0
    for (let index = 0; index < this.count; index++) {
      if (this.mode[index] === MODE_GONE && this.swapAt[index] === 0) continue

      // A soft swap: fade out where the dot is, move it to the source, fade in there.
      if (this.swapAt[index] > 0) {
        const t = now - this.swapAt[index]
        if (t >= 0) {
          if (this.swapMoved[index] === 0) {
            if (t >= SWAP_OUT) {
              this.x[index] = this.home[this.from][index * 2]
              this.y[index] = this.home[this.from][index * 2 + 1]
              this.vx[index] = 0
              this.vy[index] = 0
              this.side[index] = this.from
              this.swapMoved[index] = 1
              this.alpha[index] = 0
            } else this.alpha[index] = 1 - t / SWAP_OUT
          }
          if (this.swapMoved[index] === 1) {
            this.alpha[index] = clamp01((t - SWAP_OUT) / SWAP_IN)
            if (this.alpha[index] >= 1) this.swapAt[index] = 0
          }
        }
      }

      if (this.mode[index] === MODE_REST && !this.reported && this.swapAt[index] === 0 && this.side[index] === this.from && now >= this.depart[index]) this.mode[index] = MODE_FLY

      if (this.mode[index] === MODE_FLY) {
        const u = (now - this.depart[index]) / this.flight[index]
        const to = (1 - this.from) as Side
        const startX = this.home[this.from][index * 2]
        const startY = this.home[this.from][index * 2 + 1]
        const endX = this.home[to][index * 2]
        const endY = this.home[to][index * 2 + 1]
        // Through the door: a point on the middle line, close to the height the dot started at, so that the swarm pinches and opens again.
        const gateX = doorX
        const gateY = this.middleY + (startY - this.middleY) * 0.1 + this.gate[index] * this.size * 0.035
        const lift = this.lift[index] * this.size * 0.14
        const e = ease(clamp01(u))
        const previousX = this.x[index]
        const previousY = this.y[index]
        if (e < 0.5) {
          const t = e * 2
          const controlX = startX + (gateX - startX) * 0.55
          const controlY = startY - lift
          const m = 1 - t
          this.x[index] = m * m * startX + 2 * m * t * controlX + t * t * gateX
          this.y[index] = m * m * startY + 2 * m * t * controlY + t * t * gateY
        } else {
          const t = (e - 0.5) * 2
          const controlX = gateX + (endX - gateX) * 0.45
          const controlY = endY + lift
          const m = 1 - t
          this.x[index] = m * m * gateX + 2 * m * t * controlX + t * t * endX
          this.y[index] = m * m * gateY + 2 * m * t * controlY + t * t * endY
        }
        this.vx[index] = (this.x[index] - previousX) / Math.max(frame, 0.2)
        this.vy[index] = (this.y[index] - previousY) / Math.max(frame, 0.2)
        if (u > 0.42 && u < 0.58) crossing++
        if (this.isFee[index] === 1 && u >= 0.5) {
          // The fee: the dot is let go at the door and rises, fading.
          this.mode[index] = MODE_FEE
          this.ejected[index] = now
          this.vx[index] = (this.gate[index] * 0.6 + (to === 1 ? 0.5 : -0.5)) * this.size * 0.003
          this.vy[index] = -this.size * 0.009 * (0.7 + this.lift[index] * 0.4)
          this.feeUntil = now + FEE_SECONDS
        } else if (u >= 1) {
          this.mode[index] = MODE_REST
          this.side[index] = to
        }
        continue
      }

      if (this.mode[index] === MODE_FEE) {
        this.x[index] += this.vx[index] * frame
        this.y[index] += this.vy[index] * frame
        this.vx[index] *= Math.pow(0.99, frame)
        this.vy[index] *= Math.pow(0.985, frame)
        if (now - this.ejected[index] > FEE_SECONDS) this.mode[index] = MODE_GONE
        continue
      }

      // Resting: held to the place by a spring (it swings and overshoots), floating on its own slow orbit, pushed by the mouse.
      const owner = this.side[index]
      const orbit = this.reach[index]
      const targetX = this.home[owner][index * 2] + Math.sin(now * this.speed[index] + this.phase[index]) * orbit
      const targetY = this.home[owner][index * 2 + 1] + Math.cos(now * this.speed[index] * 0.83 + this.phase[index] * 1.3) * orbit
      this.vx[index] += (targetX - this.x[index]) * SPRING * frame
      this.vy[index] += (targetY - this.y[index]) * SPRING * frame
      const dx = this.x[index] - mouseX
      const dy = this.y[index] - mouseY
      const distance2 = dx * dx + dy * dy
      if (distance2 < PUSH_RADIUS * PUSH_RADIUS && distance2 > 0.01) {
        const distance = Math.sqrt(distance2)
        const strength = 1 - distance / PUSH_RADIUS
        const push = strength * strength * PUSH_FORCE * frame
        this.vx[index] += (dx / distance) * push
        this.vy[index] += (dy / distance) * push
      }
      this.vx[index] *= damping
      this.vy[index] *= damping
      this.x[index] += this.vx[index] * frame
      this.y[index] += this.vy[index] * frame
    }

    this.flux += (Math.min(1, crossing / (this.count * 0.06)) - this.flux) * 0.15
    if (!this.reported && now >= this.finishAt) {
      this.reported = true
      this.cloudAt = (1 - this.from) as Side
      this.onDone()
    }
  }

  /** Draws the ring of the door, the dots of the cloud (the ones that fade in or out in three steps of the alpha) and the fee dots. */
  draw(context: CanvasRenderingContext2D, palette: Palette, now: number) {
    const { dot, brand, mute } = palette
    const radius = this.radius

    // The door: a ring that glows while dots cross it.
    context.globalAlpha = 0.55 + this.flux * 0.45
    context.strokeStyle = this.flux > 0.05 ? brand : mute
    context.lineWidth = 1.2 + this.flux * 1.4
    context.beginPath()
    context.arc(this.width / 2, this.middleY, this.doorRadius, 0, Math.PI * 2)
    context.stroke()

    // The cloud: whole dots first, then the ones that fade, a few shades of it.
    context.fillStyle = dot
    for (const [low, high, shade] of [
      [0.99, 2, 1],
      [0.66, 0.99, 0.8],
      [0.33, 0.66, 0.5],
      [0.03, 0.33, 0.2],
    ] as const) {
      context.globalAlpha = shade
      context.beginPath()
      for (let index = 0; index < this.count; index++) {
        const mode = this.mode[index]
        const alpha = this.alpha[index]
        if (mode === MODE_FEE || mode === MODE_GONE || alpha < low || alpha >= high) continue
        context.moveTo(this.x[index] + radius, this.y[index])
        context.arc(this.x[index], this.y[index], radius, 0, Math.PI * 2)
      }
      context.fill()
    }

    // The fee dots: orange, larger, fading as they rise.
    context.fillStyle = brand
    for (let index = 0; index < this.count; index++) {
      if (this.mode[index] !== MODE_FEE) continue
      context.globalAlpha = clamp01(1 - (now - this.ejected[index]) / FEE_SECONDS)
      context.beginPath()
      context.arc(this.x[index], this.y[index], radius * 2.2, 0, Math.PI * 2)
      context.fill()
    }
    context.globalAlpha = 1
  }

  /** 0…1: how much of the fee caption at the door is to be seen. */
  feeVisible(now: number) {
    return clamp01((this.feeUntil - now) / 0.5)
  }
}

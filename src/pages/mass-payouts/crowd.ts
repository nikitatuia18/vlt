import { seeded } from '../ramp/glyphs'
import type { HeroCount } from './demo'

/*
 * The scene of the hero of the Mass Payouts page: on the left a round cloud of dots, the balance; on the right the recipients as round photos placed in
 * rings round one big head in the middle (the farther from the middle, the smaller). The more recipients the slider says, the more rings are filled.
 * "Pay everyone": dots of the balance itself leave the cloud, float away (a slow curve with a sway, like the dots of the site) and fly into the circle
 * of a head; the ring round the head fills smoothly as its share arrives, and the head, dim until then, becomes clear. A while after everything is
 * paid the scene is reset by the caller. The dots and the heads float on their own (a slow orbit, a spring that overshoots, the mouse pushes them).
 * No DOM here: the scene gives the size, the time, the mouse and the photos, and draws what `draw` is told.
 */

/** `disc` is the soft round ground of a head (it shows under a cut-out photo, and is the circle the money flies to). */
export type Palette = { ink: string; dot: string; brand: string; mute: string; disc: string }

/** Heads in each ring (the first is the big one in the middle) for a number of recipients: 6, 9 and 12 heads (three heads are a triangle of equal circles, see `build`). */
const RINGS: Record<HeroCount, readonly number[]> = { 10: [1, 2], 250: [1, 5], 1000: [1, 8], 10000: [1, 11] }
/** The space kept between two heads, px: they never touch. */
const GAP = 4
/** The radius of a head in each ring, as a share of the radius of the one in the middle (the first ring may be smaller still, see `build`). */
const RING_SIZE = [1, 0.66, 0.44, 0.34]
/** How many dots of the balance fly: the same for every number of recipients (half of the cloud), so that the payment is as easy to see with three heads as with twelve. */
export const packetsFor = (_count: HeroCount) => 240
export const headsFor = (count: HeroCount) => RINGS[count].reduce((sum, value) => sum + value, 0)

/** Seconds: all dots set off over `SPREAD`; one flies for about `FLIGHT`; a dot that has arrived fades in `ABSORB`; a returned one fades in over `RETURN`. */
const SPREAD = 3.2
const FLIGHT = 1.7
const ABSORB = 0.35
const RETURN = 0.9
/** How fast the ring round a head fills (the share of the way per frame). */
const FILL_EASE = 0.045
/** Seconds a head takes to swim out of the middle one to its place. */
const EMERGE = 0.95

const SPRING = 0.04
const DAMPING = 0.88
const PUSH_RADIUS = 150
const PUSH_FORCE = 2.2

const HOME = 0
const FLYING = 1
const FADING = 2
const GONE = 3
export const BALANCE_DOTS = 480

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

export class Crowd {
  width = 0
  height = 0
  /** The balance: the middle of its cloud and its radius. */
  balance = { x: 0, y: 0, radius: 0 }
  /** The middle of the heads, and the lowest point of them (for the captions under them). */
  center = 0
  bottom = 0
  count: HeroCount = 1000
  headCount = 0
  /** The photos of the heads, round and round (the scene loads them). */
  faces: (HTMLImageElement | null)[] = []
  /** How many dots fly, how many have arrived. */
  packets = 0
  landed = 0

  // The dots of the balance.
  private bx = new Float32Array(BALANCE_DOTS)
  private by = new Float32Array(BALANCE_DOTS)
  private bvx = new Float32Array(BALANCE_DOTS)
  private bvy = new Float32Array(BALANCE_DOTS)
  private bhx = new Float32Array(BALANCE_DOTS)
  private bhy = new Float32Array(BALANCE_DOTS)
  private bphase = new Float32Array(BALANCE_DOTS)
  private balpha = new Float32Array(BALANCE_DOTS).fill(1)
  private bstate = new Uint8Array(BALANCE_DOTS)
  /** For a dot that flies: whether it is to set off, when, how long it takes, where it started, where in the head it lands, the sway of its way. */
  private armed = new Uint8Array(BALANCE_DOTS)
  private launch = new Float64Array(BALANCE_DOTS)
  private flight = new Float32Array(BALANCE_DOTS)
  private sx = new Float32Array(BALANCE_DOTS)
  private sy = new Float32Array(BALANCE_DOTS)
  private head = new Uint8Array(BALANCE_DOTS)
  private ox = new Float32Array(BALANCE_DOTS)
  private oy = new Float32Array(BALANCE_DOTS)
  private bend = new Float32Array(BALANCE_DOTS)
  private sway = new Float32Array(BALANCE_DOTS)
  private arrivedAt = new Float64Array(BALANCE_DOTS)
  private returnAt = new Float64Array(BALANCE_DOTS)

  // The heads.
  private heads = 0
  private radius = new Float32Array(0)
  private hx = new Float32Array(0)
  private hy = new Float32Array(0)
  private x = new Float32Array(0)
  private y = new Float32Array(0)
  private vx = new Float32Array(0)
  private vy = new Float32Array(0)
  private phase = new Float32Array(0)
  private speed = new Float32Array(0)
  private reach = new Float32Array(0)
  private assigned = new Uint16Array(0)
  private received = new Uint16Array(0)
  /** How full the ring of each head looks now (it follows the real share smoothly). */
  private shown = new Float32Array(0)
  private flash = new Float64Array(0)
  /** When each head sets off from the middle one (long ago for a head that is just there), the picture each head shows, and where the swimming starts. */
  private born = new Float64Array(0)
  private face = new Uint8Array(0)
  private faceOrder: number[] = []
  private origin = { x: 0, y: 0 }
  private running = false

  /** Called as dots arrive (0…1 of them arrived), and once when the last one has. */
  onProgress: (fraction: number) => void = () => {}
  onDone: () => void = () => {}

  layout(width: number, height: number) {
    // The same size again (the observer fires for other reasons too): nothing to do.
    if (width === this.width && height === this.height) return
    this.width = width
    this.height = height
    const small = width < 600
    this.balance = { x: width * 0.2, y: height * 0.45, radius: Math.min(width * (small ? 0.14 : 0.12), height * 0.26) }
    const random = seeded(21)
    for (let index = 0; index < BALANCE_DOTS; index++) {
      const r = this.balance.radius * Math.sqrt((index + 0.5) / BALANCE_DOTS)
      const angle = index * 2.39996
      this.bhx[index] = this.balance.x + Math.cos(angle) * r
      this.bhy[index] = this.balance.y + Math.sin(angle) * r
      this.bphase[index] = random() * Math.PI * 2
      // A dot at home moves to its new home at once (it does not drift across the picture when the size changes).
      if (this.bstate[index] === HOME && !this.armed[index]) {
        this.bx[index] = this.bhx[index]
        this.by[index] = this.bhy[index]
      }
    }
    // A payment that is on its way is not cut short by a new size: the heads are made again when it is over.
    if (this.running) this.dirty = true
    else this.build(this.count)
  }
  private dirty = false

  /** A new number of recipients: the heads are made again, the dots of the balance are all there, nothing is paid yet. */
  setCount(count: HeroCount) {
    this.count = count
    // A new set of people every time, and the heads swim out of the middle one to their places.
    this.shuffleFaces()
    this.build(count, true)
  }

  /** Everybody is picked at random from all the photos, the middle head too: each switch and each page load shows other people. */
  private shuffleFaces() {
    const order = Array.from({ length: this.faces.length }, (_, index) => index)
    for (let index = order.length - 1; index > 0; index--) {
      const other = Math.floor(Math.random() * (index + 1))
      ;[order[index], order[other]] = [order[other], order[index]]
    }
    this.faceOrder = order
  }

  /** The heads for `count`: ring after ring round the big one, each ring smaller than the last, a little jitter in size and place so that it is not a diagram. */
  private build(count: HeroCount, emerge = false) {
    this.dirty = false
    // The first build (and a changed pool of photos) also starts with a random set.
    if (this.faceOrder.length !== this.faces.length) this.shuffleFaces()
    const small = this.width < 600
    // A phone has room for three rings at most.
    const rings = RINGS[count].slice(0, small ? 3 : 4)
    const random = seeded(33 + count)
    // The size of a head in each ring, as a share of the middle one: ring after ring is smaller, and a ring of many heads is as big as lets them just touch.
    const sizes = rings.map((amount, ring) => {
      if (ring === 0) return 1
      const touching = amount >= 7 ? Math.sin(Math.PI / amount) / (1 - Math.sin(Math.PI / amount)) : 1
      return Math.min(RING_SIZE[ring], touching)
    })
    // The distance of each ring from the middle (the gap between two rings is `GAP` px, a little more than that in units while the scale is guessed).
    const distances = (gap: number) => {
      const list: number[] = [0]
      for (let ring = 1; ring < rings.length; ring++) list.push(list[ring - 1] + sizes[ring - 1] + sizes[ring] + gap)
      return list
    }
    const available = Math.min(this.height * 0.37, this.width * (small ? 0.24 : 0.27))
    let unit = Math.min(available / (distances(0.04)[rings.length - 1] + sizes[rings.length - 1]), this.height * 0.24)
    const distance = distances(GAP / unit)
    const reachOut = distance[rings.length - 1] + sizes[rings.length - 1]
    unit = Math.min(available / reachOut, this.height * 0.24)
    this.center = this.width * (small ? 0.68 : 0.7)
    const cy = this.height * 0.45

    const hx: number[] = []
    const hy: number[] = []
    const radius: number[] = []
    if (count === 10) {
      // Three equal circles in a triangle (one on top, two below), just apart.
      const size = Math.min(available / 2.2, this.height * 0.2)
      const away = (2 * size + GAP) / Math.sqrt(3)
      for (const angle of [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6]) {
        hx.push(this.center + Math.cos(angle) * away)
        hy.push(cy + Math.sin(angle) * away)
        radius.push(size)
      }
    } else
    rings.forEach((amount, ring) => {
      const offset = random() * Math.PI * 2
      for (let each = 0; each < amount; each++) {
        const angle = offset + (each / amount) * Math.PI * 2
        const size = sizes[ring] * unit * (ring < 2 ? 1 : 0.92 + random() * 0.16)
        const away = distance[ring] * unit
        hx.push(this.center + Math.cos(angle) * away)
        hy.push(cy + Math.sin(angle) * away)
        radius.push(size)
      }
    })
    // The ideal places are only a start: the heads are pushed apart until every pair is at least `GAP` px from the other (and drawn back to the ideal place).
    const ideal = { x: hx.slice(), y: hy.slice() }
    for (let round = 0; round < 120; round++) {
      for (let a = 0; a < hx.length; a++) {
        for (let b = a + 1; b < hx.length; b++) {
          const dx = hx[b] - hx[a]
          const dy = hy[b] - hy[a]
          const distanceAB = Math.hypot(dx, dy) || 0.001
          const least = radius[a] + radius[b] + GAP
          if (distanceAB >= least) continue
          const push = (least - distanceAB) / 2
          hx[a] -= (dx / distanceAB) * push
          hy[a] -= (dy / distanceAB) * push
          hx[b] += (dx / distanceAB) * push
          hy[b] += (dy / distanceAB) * push
        }
      }
      for (let a = 0; a < hx.length; a++) {
        hx[a] += (ideal.x[a] - hx[a]) * 0.04
        hy[a] += (ideal.y[a] - hy[a]) * 0.04
      }
    }
    this.heads = hx.length
    this.headCount = hx.length
    this.hx = Float32Array.from(hx)
    this.hy = Float32Array.from(hy)
    this.radius = Float32Array.from(radius)
    this.x = Float32Array.from(hx)
    this.y = Float32Array.from(hy)
    this.vx = new Float32Array(this.heads)
    this.vy = new Float32Array(this.heads)
    this.phase = Float32Array.from({ length: this.heads }, () => random() * Math.PI * 2)
    this.speed = Float32Array.from({ length: this.heads }, () => 0.3 + random() * 0.5)
    this.reach = Float32Array.from(radius, () => 0.8)
    this.bottom = Math.max(...hy.map((value, index) => value + radius[index]))

    // The dots that fly: every head gets a share in proportion to its area (at least one).
    const packets = Math.max(packetsFor(count), this.heads)
    const areas = radius.map((value) => value * value)
    const totalArea = areas.reduce((sum, value) => sum + value, 0)
    const shares = areas.map((area) => Math.max(1, Math.floor((area / totalArea) * packets)))
    let spare = packets - shares.reduce((sum, value) => sum + value, 0)
    for (let index = 0; spare > 0; index = (index + 1) % this.heads, spare--) shares[index]++
    this.assigned = Uint16Array.from(shares)
    this.packets = shares.reduce((sum, value) => sum + value, 0)
    this.received = new Uint16Array(this.heads)
    this.shown = new Float32Array(this.heads)
    this.flash = new Float64Array(this.heads).fill(-10)
    this.face = Uint8Array.from({ length: this.heads }, (_, index) => this.faceOrder[index] ?? index)
    this.origin = { x: this.hx[0], y: this.hy[0] }
    this.born = Float64Array.from({ length: this.heads }, (_, index) => (emerge && index > 0 ? this.clock + 0.05 + (index - 1) * 0.06 : -100))
    // A head that has not set off yet waits in the middle one.
    if (emerge) for (let index = 1; index < this.heads; index++) {
      this.x[index] = this.origin.x
      this.y[index] = this.origin.y
    }

    // Dots that are away (paid out, or on their way) come back to the balance by fading in there: they never fly back from the heads.
    const back = seeded(Math.floor(this.clock * 1000) + 11)
    for (let index = 0; index < BALANCE_DOTS; index++) {
      if (this.bstate[index] === HOME && this.balpha[index] >= 1) {
        this.armed[index] = 0
        continue
      }
      this.bx[index] = this.bhx[index]
      this.by[index] = this.bhy[index]
      this.bvx[index] = 0
      this.bvy[index] = 0
      this.balpha[index] = 0
      this.bstate[index] = GONE
      this.armed[index] = 0
      this.returnAt[index] = this.clock + back() * 0.9
    }
    this.landed = 0
    this.running = false
  }
  /** The time of the last frame, seconds. */
  private clock = 0

  /** The balance pays everyone: dots of the cloud set off one after another (the heads nearest to the balance are served first). */
  pay(now: number) {
    if (this.running) return
    if (this.dirty) this.build(this.count)
    const random = seeded(Math.floor(now * 1000))
    // Which dots fly: a random choice over the whole cloud, so that the cloud thins out evenly; the dots nearest to the heads go first.
    const dots = Array.from({ length: BALANCE_DOTS }, (_, index) => index)
      .sort(() => random() - 0.5)
      .slice(0, this.packets)
    dots.sort((a, b) => this.bhx[b] - this.bhx[a] + (random() - 0.5) * 60)
    const targets: number[] = []
    this.assigned.forEach((share, head) => {
      for (let each = 0; each < share; each++) targets.push(head)
    })
    targets.sort((a, b) => this.hx[a] - this.hx[b] + (random() - 0.5) * this.width * 0.15)
    // Every dot has its own place on the circle of its head (not on the face): the places are taken in turn round the circle, clockwise from the top.
    const taken = new Uint16Array(this.heads)
    dots.forEach((dot, rank) => {
      const head = targets[rank]
      const angle = -Math.PI / 2 + ((taken[head]++ + 0.5) / this.assigned[head]) * Math.PI * 2
      this.head[dot] = head
      this.ox[dot] = Math.cos(angle) * (this.radius[head] - 1.5)
      this.oy[dot] = Math.sin(angle) * (this.radius[head] - 1.5)
      this.bend[dot] = (random() - 0.5) * 2
      this.sway[dot] = (random() < 0.5 ? -1 : 1) * (10 + random() * 14)
      this.flight[dot] = FLIGHT * (0.85 + random() * 0.4)
      this.launch[dot] = now + 0.2 + (rank / dots.length) * SPREAD + random() * 0.15
      this.armed[dot] = 1
      this.bstate[dot] = HOME
      this.balpha[dot] = 1
    })
    this.received.fill(0)
    this.landed = 0
    this.running = true
  }

  /** Everything goes back: the dots of the balance return softly, the heads become dim again. */
  reset(now: number) {
    if (this.dirty) this.build(this.count)
    const random = seeded(Math.floor(now * 1000) + 3)
    for (let index = 0; index < BALANCE_DOTS; index++) {
      if (this.bstate[index] !== HOME || this.armed[index]) {
        this.bx[index] = this.bhx[index]
        this.by[index] = this.bhy[index]
        this.bvx[index] = 0
        this.bvy[index] = 0
        this.balpha[index] = 0
        this.returnAt[index] = now + random() * 1.2
        this.bstate[index] = GONE
        this.armed[index] = 0
      }
    }
    this.received.fill(0)
    this.landed = 0
    this.running = false
  }

  /** Everyone is paid and nothing moves: the finished picture (reduced motion, or out of sight). */
  finish() {
    this.received.set(this.assigned)
    this.shown.fill(1)
    this.flash.fill(-10)
    this.bstate.fill(HOME)
    this.armed.fill(0)
    this.balpha.fill(1)
    // The dots that would have flown are gone.
    const random = seeded(5)
    const gone = Array.from({ length: BALANCE_DOTS }, (_, index) => index)
      .sort(() => random() - 0.5)
      .slice(0, this.packets)
    for (const dot of gone) {
      this.bstate[dot] = GONE
      this.balpha[dot] = 0
      this.returnAt[dot] = Number.POSITIVE_INFINITY
    }
    this.landed = this.packets
    this.running = false
  }

  get paying() {
    return this.running
  }

  /** The share of the dots that have arrived: 0…1. */
  get fraction() {
    return this.packets === 0 ? 0 : this.landed / this.packets
  }

  step(dt: number, now: number, mouseX: number, mouseY: number) {
    this.clock = now
    const frame = Math.min(dt * 60, 2.5)
    const damping = Math.pow(DAMPING, frame)

    // The dots of the balance: the ones at home float and hold their places; the ones that fly follow their way; a returning dot fades back in.
    for (let index = 0; index < BALANCE_DOTS; index++) {
      if (this.bstate[index] === HOME && this.armed[index] === 1 && now >= this.launch[index]) {
        this.armed[index] = 0
        this.sx[index] = this.bx[index]
        this.sy[index] = this.by[index]
        this.bstate[index] = FLYING
      }
      if (this.bstate[index] === FLYING) {
        const u = (now - this.launch[index]) / this.flight[index]
        const head = this.head[index]
        if (u >= 1) {
          this.bstate[index] = FADING
          this.arrivedAt[index] = now
          this.received[head]++
          this.flash[head] = now
          this.landed++
          continue
        }
        const e = ease(clamp01(u))
        const ex = this.x[head] + this.ox[index]
        const ey = this.y[head] + this.oy[index]
        const mx = (this.sx[index] + ex) / 2
        const my = (this.sy[index] + ey) / 2
        const lift = Math.hypot(ex - this.sx[index], ey - this.sy[index]) * 0.22 * this.bend[index]
        const m = 1 - e
        // A slow sway across the way, strongest in the middle of it: the dots drift rather than shoot.
        const wave = Math.sin(e * Math.PI) * this.sway[index] * Math.cos(e * 5 + index)
        this.bx[index] = m * m * this.sx[index] + 2 * m * e * mx + e * e * ex
        this.by[index] = m * m * this.sy[index] + 2 * m * e * (my + lift) + e * e * ey + wave
        continue
      }
      if (this.bstate[index] === FADING) {
        const head = this.head[index]
        this.bx[index] = this.x[head] + this.ox[index]
        this.by[index] = this.y[head] + this.oy[index]
        this.balpha[index] = clamp01(1 - (now - this.arrivedAt[index]) / ABSORB)
        if (this.balpha[index] <= 0) {
          // Gone for good: it does not come back until the scene is reset (a dot with no time to return to would fly back to the balance).
          this.bstate[index] = GONE
          this.returnAt[index] = Number.POSITIVE_INFINITY
        }
        continue
      }
      if (this.bstate[index] === GONE) {
        if (now < this.returnAt[index]) continue
        this.balpha[index] = clamp01((now - this.returnAt[index]) / RETURN)
        if (this.balpha[index] >= 1) this.bstate[index] = HOME
      }
      const targetX = this.bhx[index] + Math.sin(now * 0.6 + this.bphase[index]) * 1.6
      const targetY = this.bhy[index] + Math.cos(now * 0.5 + this.bphase[index] * 1.3) * 1.6
      this.bvx[index] = (this.bvx[index] + (targetX - this.bx[index]) * SPRING * frame + this.push(this.bx[index], mouseX, this.by[index], mouseY, 'x', 1) * frame) * damping
      this.bvy[index] = (this.bvy[index] + (targetY - this.by[index]) * SPRING * frame + this.push(this.bx[index], mouseX, this.by[index], mouseY, 'y', 1) * frame) * damping
      this.bx[index] += this.bvx[index] * frame
      this.by[index] += this.bvy[index] * frame
    }

    // The heads: a slow orbit, a spring, the mouse pushes them (a big head is slower to move than a small one); the ring follows the real share smoothly.
    for (let index = 0; index < this.heads; index++) {
      const targetX = this.hx[index] + Math.sin(now * this.speed[index] + this.phase[index]) * this.reach[index]
      const targetY = this.hy[index] + Math.cos(now * this.speed[index] * 0.83 + this.phase[index] * 1.3) * this.reach[index]
      const lightness = 40 / (40 + this.radius[index])
      this.vx[index] = (this.vx[index] + (targetX - this.x[index]) * SPRING * frame + this.push(this.x[index], mouseX, this.y[index], mouseY, 'x', lightness) * frame) * damping
      this.vy[index] = (this.vy[index] + (targetY - this.y[index]) * SPRING * frame + this.push(this.x[index], mouseX, this.y[index], mouseY, 'y', lightness) * frame) * damping
      this.x[index] += this.vx[index] * frame
      this.y[index] += this.vy[index] * frame
      const real = this.assigned[index] === 0 ? 0 : this.received[index] / this.assigned[index]
      this.shown[index] += (real - this.shown[index]) * Math.min(1, FILL_EASE * frame)
      // A head that is still swimming out of the middle one goes along its own way (no sway, no push) and keeps the others from being pushed.
      const swim = clamp01((now - this.born[index]) / EMERGE)
      if (swim < 1) {
        const e = 1 - Math.pow(1 - swim, 3)
        this.x[index] = this.origin.x + (this.hx[index] - this.origin.x) * e
        this.y[index] = this.origin.y + (this.hy[index] - this.origin.y) * e
        this.vx[index] = 0
        this.vy[index] = 0
      }
    }
    // Two heads never touch: when a push or a sway brings them closer than `GAP`, they are moved apart.
    for (let a = 0; a < this.heads; a++) {
      for (let b = a + 1; b < this.heads; b++) {
        if (now < this.born[a] + EMERGE || now < this.born[b] + EMERGE) continue
        const dx = this.x[b] - this.x[a]
        const dy = this.y[b] - this.y[a]
        const distanceAB = Math.hypot(dx, dy) || 0.001
        const least = this.radius[a] + this.radius[b] + GAP
        if (distanceAB >= least) continue
        const push = (least - distanceAB) / 2
        this.x[a] -= (dx / distanceAB) * push
        this.y[a] -= (dy / distanceAB) * push
        this.x[b] += (dx / distanceAB) * push
        this.y[b] += (dy / distanceAB) * push
      }
    }

    if (this.running) this.onProgress(this.fraction)
    if (this.running && this.landed >= this.packets) {
      this.running = false
      this.onProgress(1)
      this.onDone()
    }
  }

  /** The push of the mouse on a dot or a head, on one axis. */
  private push(x: number, mouseX: number, y: number, mouseY: number, axis: 'x' | 'y', lightness: number) {
    const dx = x - mouseX
    const dy = y - mouseY
    const distance2 = dx * dx + dy * dy
    if (distance2 >= PUSH_RADIUS * PUSH_RADIUS || distance2 < 0.01) return 0
    const distance = Math.sqrt(distance2)
    const strength = 1 - distance / PUSH_RADIUS
    return ((axis === 'x' ? dx : dy) / distance) * strength * strength * PUSH_FORCE * lightness
  }

  draw(context: CanvasRenderingContext2D, palette: Palette, now: number) {
    const { dot, brand, mute, disc } = palette

    // The balance: the dots at home (a thin cloud, no ring round it) and the ones that float, fade in or fade out.
    context.fillStyle = dot
    context.globalAlpha = 0.9
    context.beginPath()
    for (let index = 0; index < BALANCE_DOTS; index++) {
      if (this.bstate[index] !== HOME || this.balpha[index] < 1) continue
      context.moveTo(this.bx[index] + 1.3, this.by[index])
      context.arc(this.bx[index], this.by[index], 1.3, 0, Math.PI * 2)
    }
    context.fill()
    for (let index = 0; index < BALANCE_DOTS; index++) {
      const state = this.bstate[index]
      if (state === HOME && this.balpha[index] >= 1) continue
      if (state === GONE && this.balpha[index] <= 0) continue
      if (state === FLYING) {
        // Flying: the dot is the same dot; it grows a little and warms towards the colour of the brand as it nears the head.
        const u = clamp01((now - this.launch[index]) / this.flight[index])
        context.fillStyle = dot
        context.globalAlpha = 0.9 * (1 - u * 0.6)
        context.beginPath()
        context.arc(this.bx[index], this.by[index], 1.5 + u * 0.6, 0, Math.PI * 2)
        context.fill()
        context.fillStyle = brand
        context.globalAlpha = clamp01(u * 1.3) * 0.95
        context.beginPath()
        context.arc(this.bx[index], this.by[index], 1.5 + u * 0.6, 0, Math.PI * 2)
        context.fill()
        continue
      }
      context.fillStyle = state === FADING ? brand : dot
      context.globalAlpha = this.balpha[index] * (state === FADING ? 0.95 : 0.9)
      context.beginPath()
      context.arc(this.bx[index], this.by[index], 1.4, 0, Math.PI * 2)
      context.fill()
    }

    // The heads: a round photo (always clear, no outline, no tick). The money that has come is a ring on the very edge of the photo that fills smoothly.
    // The middle head is drawn last, so that the others swim out from behind it, not over it.
    for (let step = 0; step < this.heads; step++) {
      const index = (step + 1) % this.heads
      // A head that has not set off yet is not seen; one that is swimming out grows and clears as it goes.
      if (now < this.born[index]) continue
      const swim = clamp01((now - this.born[index]) / EMERGE)
      const fade = 1 - Math.pow(1 - swim, 3)
      const r = this.radius[index] * (0.35 + 0.65 * fade)
      const x = this.x[index]
      const y = this.y[index]
      const fill = this.shown[index]
      const face = this.faces.length ? this.faces[this.face[index] % this.faces.length] : null
      context.save()
      context.beginPath()
      context.arc(x, y, r, 0, Math.PI * 2)
      context.clip()
      // The soft ground, so that a cut-out photo still sits in a circle.
      context.fillStyle = disc
      context.globalAlpha = fade
      context.fill()
      if (face && face.complete && face.naturalWidth > 0) {
        const side = Math.min(face.naturalWidth, face.naturalHeight)
        context.globalAlpha = fade
        context.drawImage(face, (face.naturalWidth - side) / 2, (face.naturalHeight - side) * 0.25, side, side, x - r, y - r, r * 2, r * 2)
      } else {
        context.fillStyle = mute
        context.globalAlpha = 0.5
        context.fill()
      }
      context.restore()

      if (fill > 0.004) {
        context.strokeStyle = brand
        // The same thin ring on every head, the big one and the small ones alike.
        context.lineWidth = 2
        context.lineCap = 'round'
        context.globalAlpha = fade
        context.beginPath()
        context.arc(x, y, r - context.lineWidth / 2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, fill))
        context.stroke()
      }
      // Paid: a small tick inside the circle, low on the right (it stays inside the photo, so it never touches a neighbour).
      if (fill > 0.985) {
        const size = Math.max(6, r * 0.17)
        const tx = x + r * 0.5
        const ty = y + r * 0.5
        context.globalAlpha = fade
        context.fillStyle = brand
        context.beginPath()
        context.arc(tx, ty, size, 0, Math.PI * 2)
        context.fill()
        context.strokeStyle = '#fff'
        context.lineWidth = Math.max(1.3, size * 0.22)
        context.lineCap = 'round'
        context.lineJoin = 'round'
        context.beginPath()
        context.moveTo(tx - size * 0.42, ty + size * 0.02)
        context.lineTo(tx - size * 0.1, ty + size * 0.34)
        context.lineTo(tx + size * 0.46, ty - size * 0.3)
        context.stroke()
      }
    }
    context.globalAlpha = 1
  }
}

/*
 * The cables of the "Pick your route." block: two ropes of dots, one from the plug in the chosen bank to the door, one from the door to the plug in the
 * chosen network. The ropes hang and sway a little, the mouse pushes them, the plugs are pulled by springs to the sockets they are in (and follow the
 * pointer while the visitor drags one), a plug that is let go near another socket snaps into it with a few sparks, and bright dots (the signal) run
 * along the whole way in the direction of the transfer. No DOM here: the block gives the places of the sockets and draws what `draw` is told.
 */

export type Pt = { x: number; y: number }
export type Palette = { dot: string; brand: string; mute: string }

/** Where everything stands, in px of the scene. The sockets of a column are keyed by the id of the card. */
export type Ports = {
  /** True when the banks are on the left and the networks on the right; false when they are stacked (a phone). */
  wide: boolean
  doorIn: Pt
  doorOut: Pt
  door: Pt & { radius: number }
  banks: Record<string, Pt>
  nets: Record<string, Pt>
}

/** 0 is the plug in the bank, 1 is the plug in the network. */
export type PlugKind = 0 | 1

const POINTS = 18
const SPARKS = 14

type Spark = { x: number; y: number; vx: number; vy: number; born: number }

export class Cables {
  ports: Ports | null = null
  /** The place of each plug now, and where it is pulled to. */
  readonly plug: [Pt, Pt] = [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ]
  private velocity: [Pt, Pt] = [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ]
  private target: [Pt, Pt] = [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ]
  private pointer: [Pt | null, Pt | null] = [null, null]
  private rope = [this.makeRope(), this.makeRope()]
  private sparks: Spark[] = []
  private phase = 0
  /** How much the door glows (0…1), from the signal that passes it. */
  glow = 0

  private makeRope() {
    return { x: new Float32Array(POINTS), y: new Float32Array(POINTS), px: new Float32Array(POINTS), py: new Float32Array(POINTS) }
  }

  /** The sockets changed place (a resize, the fonts): the plugs stay in their sockets, and with `snap` they jump there at once. */
  setPorts(ports: Ports, bank: string, net: string, snap: boolean) {
    this.ports = ports
    this.select(0, bank)
    this.select(1, net)
    if (snap) {
      for (const kind of [0, 1] as const) {
        this.plug[kind] = { ...this.target[kind] }
        this.velocity[kind] = { x: 0, y: 0 }
      }
      this.hang()
    }
  }

  /** A plug is pulled to the socket `id` of its column. */
  select(kind: PlugKind, id: string) {
    const place = kind === 0 ? this.ports?.banks[id] : this.ports?.nets[id]
    if (place) this.target[kind] = { ...place }
  }

  /** The visitor holds the plug at `point` (null: let go, it goes back to its socket or to the one it was dropped on). */
  hold(kind: PlugKind, point: Pt | null) {
    this.pointer[kind] = point
  }

  /** The socket of a column nearest to `point`, if it is within `within` px. */
  nearest(kind: PlugKind, point: Pt, within = 90): string | null {
    const sockets = kind === 0 ? this.ports?.banks : this.ports?.nets
    if (!sockets) return null
    let best: string | null = null
    let bestDistance = within
    for (const [id, place] of Object.entries(sockets)) {
      const distance = Math.hypot(place.x - point.x, place.y - point.y)
      if (distance < bestDistance) {
        best = id
        bestDistance = distance
      }
    }
    return best
  }

  /** A few sparks fly out of `point`. */
  spark(point: Pt, now: number) {
    for (let index = 0; index < SPARKS; index++) {
      const angle = (index / SPARKS) * Math.PI * 2 + Math.random() * 0.4
      const speed = 0.8 + Math.random() * 2.2
      this.sparks.push({ x: point.x, y: point.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, born: now })
    }
  }

  private ends(which: 0 | 1): [Pt, Pt] {
    const ports = this.ports
    if (!ports) return [this.plug[0], this.plug[1]]
    // Rope 0 runs from the plug in the bank to the door, rope 1 from the door to the plug in the network.
    return which === 0 ? [this.plug[0], ports.doorIn] : [ports.doorOut, this.plug[1]]
  }

  /** Both ropes lie in a soft curve between their ends (the first picture, or after the sockets moved). */
  private hang() {
    for (const which of [0, 1] as const) {
      const [a, b] = this.ends(which)
      const rope = this.rope[which]
      for (let index = 0; index < POINTS; index++) {
        const t = index / (POINTS - 1)
        rope.x[index] = rope.px[index] = a.x + (b.x - a.x) * t
        rope.y[index] = rope.py[index] = a.y + (b.y - a.y) * t + Math.sin(t * Math.PI) * 14
      }
    }
    for (let round = 0; round < 40; round++) this.step(1 / 60, round / 60, null, 'on', true)
  }

  /** One frame: `dt` seconds, `now` in seconds, the mouse in px of the scene (or null), the direction of the transfer. */
  step(dt: number, now: number, mouse: Pt | null, direction: 'on' | 'off', quiet = false) {
    const frame = Math.min(dt * 60, 2.5)

    // The plugs: pulled by springs to their sockets, or following the pointer.
    for (const kind of [0, 1] as const) {
      const held = this.pointer[kind]
      const plug = this.plug[kind]
      const velocity = this.velocity[kind]
      if (held) {
        plug.x += (held.x - plug.x) * Math.min(1, 0.5 * frame)
        plug.y += (held.y - plug.y) * Math.min(1, 0.5 * frame)
        velocity.x = velocity.y = 0
        continue
      }
      const goal = this.target[kind]
      velocity.x = (velocity.x + (goal.x - plug.x) * 0.1 * frame) * Math.pow(0.8, frame)
      velocity.y = (velocity.y + (goal.y - plug.y) * 0.1 * frame) * Math.pow(0.8, frame)
      plug.x += velocity.x * frame
      plug.y += velocity.y * frame
    }

    // The ropes: Verlet points that sag a little, sway, are pushed by the mouse and cannot stretch.
    for (const which of [0, 1] as const) {
      const [a, b] = this.ends(which)
      const rope = this.rope[which]
      const last = POINTS - 1
      const span = Math.hypot(b.x - a.x, b.y - a.y)
      const rest = (span * 1.12 + 10) / last
      for (let index = 1; index < last; index++) {
        const vx = (rope.x[index] - rope.px[index]) * 0.97
        const vy = (rope.y[index] - rope.py[index]) * 0.97
        rope.px[index] = rope.x[index]
        rope.py[index] = rope.y[index]
        rope.x[index] += vx + Math.sin(now * 1.3 + index * 0.9 + which) * 0.04
        rope.y[index] += vy + 0.05 * frame + Math.cos(now * 1.1 + index * 0.7) * 0.04
        if (mouse) {
          const dx = rope.x[index] - mouse.x
          const dy = rope.y[index] - mouse.y
          const distance = Math.hypot(dx, dy)
          if (distance < 90 && distance > 0.1) {
            const push = (1 - distance / 90) * 1.6 * frame
            rope.x[index] += (dx / distance) * push
            rope.y[index] += (dy / distance) * push
          }
        }
      }
      rope.x[0] = a.x
      rope.y[0] = a.y
      rope.x[last] = b.x
      rope.y[last] = b.y
      for (let round = 0; round < 6; round++) {
        for (let index = 0; index < last; index++) {
          const dx = rope.x[index + 1] - rope.x[index]
          const dy = rope.y[index + 1] - rope.y[index]
          const distance = Math.hypot(dx, dy) || 0.0001
          const shift = ((distance - rest) / distance) * 0.5
          if (index > 0) {
            rope.x[index] += dx * shift
            rope.y[index] += dy * shift
          }
          if (index + 1 < last) {
            rope.x[index + 1] -= dx * shift
            rope.y[index + 1] -= dy * shift
          }
        }
      }
    }

    if (quiet) return
    this.phase = (this.phase + dt * 0.35) % 1
    this.sparks = this.sparks.filter((spark) => now - spark.born < 0.7)
    for (const spark of this.sparks) {
      spark.x += spark.vx * frame
      spark.y += spark.vy * frame
      spark.vx *= Math.pow(0.94, frame)
      spark.vy *= Math.pow(0.94, frame)
    }
    void direction
  }

  /** The whole way as one list of points: the rope in the bank, then the rope in the network. */
  private way() {
    const points: Pt[] = []
    for (const which of [0, 1] as const) {
      const rope = this.rope[which]
      for (let index = 0; index < POINTS; index++) points.push({ x: rope.x[index], y: rope.y[index] })
    }
    return points
  }

  draw(context: CanvasRenderingContext2D, palette: Palette, now: number, direction: 'on' | 'off', moving: boolean) {
    const { dot, brand, mute } = palette

    // The ropes: a faint line and the dots on it (in between the points, too).
    context.strokeStyle = mute
    context.globalAlpha = 0.45
    context.lineWidth = 1
    for (const which of [0, 1] as const) {
      const rope = this.rope[which]
      context.beginPath()
      context.moveTo(rope.x[0], rope.y[0])
      for (let index = 1; index < POINTS; index++) context.lineTo(rope.x[index], rope.y[index])
      context.stroke()
    }
    context.fillStyle = dot
    context.globalAlpha = 0.9
    context.beginPath()
    for (const which of [0, 1] as const) {
      const rope = this.rope[which]
      for (let index = 0; index < POINTS; index++) {
        for (const t of [0, 0.5]) {
          if (index === POINTS - 1 && t > 0) continue
          const x = rope.x[index] + (rope.x[Math.min(index + 1, POINTS - 1)] - rope.x[index]) * t
          const y = rope.y[index] + (rope.y[Math.min(index + 1, POINTS - 1)] - rope.y[index]) * t
          context.moveTo(x + 1.5, y)
          context.arc(x, y, 1.5, 0, Math.PI * 2)
        }
      }
    }
    context.fill()

    // The signal: bright dots with a short tail run along the whole way, from the bank to the network (or back), and light the door as they pass it.
    const way = this.way()
    const lengths: number[] = [0]
    for (let index = 1; index < way.length; index++) lengths.push(lengths[index - 1] + Math.hypot(way[index].x - way[index - 1].x, way[index].y - way[index - 1].y))
    const total = lengths[lengths.length - 1] || 1
    const at = (distance: number): Pt => {
      const along = Math.min(Math.max(distance, 0), total)
      let index = 1
      while (index < lengths.length - 1 && lengths[index] < along) index++
      const span = lengths[index] - lengths[index - 1] || 1
      const t = (along - lengths[index - 1]) / span
      return { x: way[index - 1].x + (way[index].x - way[index - 1].x) * t, y: way[index - 1].y + (way[index].y - way[index - 1].y) * t }
    }
    let lit = 0
    if (moving && this.ports) {
      const door = this.ports.door
      context.fillStyle = brand
      for (let pulse = 0; pulse < 5; pulse++) {
        const along = (this.phase + pulse / 5) % 1
        const head = (direction === 'on' ? along : 1 - along) * total
        for (let tail = 0; tail < 5; tail++) {
          const place = at(head - (direction === 'on' ? 1 : -1) * tail * 7)
          if (Math.hypot(place.x - door.x, place.y - door.y) < door.radius) {
            if (tail === 0) lit = 1
            continue
          }
          context.globalAlpha = 1 - tail * 0.2
          context.beginPath()
          context.arc(place.x, place.y, 3.2 - tail * 0.45, 0, Math.PI * 2)
          context.fill()
        }
      }
    }
    this.glow += (lit - this.glow) * 0.15
    if (this.ports && this.glow > 0.02) {
      const door = this.ports.door
      context.strokeStyle = brand
      context.globalAlpha = this.glow * 0.7
      context.lineWidth = 2
      context.beginPath()
      context.arc(door.x, door.y, door.radius + 4, 0, Math.PI * 2)
      context.stroke()
    }

    // The sparks of a plug that has snapped into its socket.
    context.fillStyle = brand
    for (const spark of this.sparks) {
      context.globalAlpha = Math.max(0, 1 - (now - spark.born) / 0.7)
      context.beginPath()
      context.arc(spark.x, spark.y, 2, 0, Math.PI * 2)
      context.fill()
    }
    context.globalAlpha = 1
  }
}

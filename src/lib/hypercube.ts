/*
 * A hypercube of 1 to 4 dimensions (segment, square, cube, tesseract) turned and projected on a flat picture. Shared by the tesseract of the
 * card "Crypto Processing" (blocks/Features/illustrations) and the pictures of the steps (blocks/NextSteps/illustrations).
 * A corner is a vector of 4 numbers (x, y, z, w); the unused coordinates of a lower dimension are 0.
 */

export type Corner = readonly [number, number, number, number]
export type Edge = readonly [from: number, to: number]

/** The planes of the turns: the two numbers are the coordinates that turn into each other. */
export const PLANE = { XY: [0, 1], XZ: [0, 2], YZ: [1, 2], XW: [0, 3], YW: [1, 3], ZW: [2, 3] } as const
export type Turn = readonly [plane: readonly [number, number], angle: number]

export type Hypercube = { corners: readonly Corner[]; edges: readonly Edge[] }

/** The corners and edges of the hypercube of `dimension` 1 to 4: 2, 4, 8 or 16 corners; two corners are joined when they differ in one coordinate. */
export function hypercube(dimension: 1 | 2 | 3 | 4): Hypercube {
  const count = 2 ** dimension
  const corners = Array.from({ length: count }, (_, index) => [index & 1 ? 1 : -1, dimension > 1 && index & 2 ? 1 : dimension > 1 ? -1 : 0, dimension > 2 && index & 4 ? 1 : dimension > 2 ? -1 : 0, dimension > 3 && index & 8 ? 1 : dimension > 3 ? -1 : 0] as const)
  const edges = corners.flatMap((_, from) =>
    corners.slice(from + 1).flatMap((_, offset) => {
      const to = from + 1 + offset
      const difference = from ^ to
      return (difference & (difference - 1)) === 0 ? [[from, to] as const] : []
    }),
  )
  return { corners, edges }
}

/** Half of the edge of the hypercube, so that the perspective below never meets the eye (the farthest corner is 1.6 away from the centre). */
const HALF = 0.8
/** The eye is this far from the hypercube along the fourth axis, and along the depth of the picture. */
const DISTANCE_W = 2.6
const DISTANCE_Z = 6.5

export type Projected = {
  x: number
  y: number
  /** 0 (far) to 1 (near): the picture draws near edges and corners darker and thicker. */
  near: number
}

/** One corner: turned (the turns are made in the given order), then projected from 4D to 3D and from 3D to the picture, in units of half an edge. */
export function project(corner: Corner, turns: readonly Turn[]): Projected {
  const vector = corner.map((value) => value * HALF)
  for (const [[a, b], angle] of turns) {
    const first = vector[a]
    const second = vector[b]
    vector[a] = first * Math.cos(angle) - second * Math.sin(angle)
    vector[b] = first * Math.sin(angle) + second * Math.cos(angle)
  }
  const [x, y, z, w] = vector
  const k = DISTANCE_W / (DISTANCE_W - w)
  const s = DISTANCE_Z / (DISTANCE_Z - z * k)
  return { x: x * k * s, y: y * k * s, near: Math.min(1, Math.max(0, (k * s - 0.55) / 1.6)) }
}

/*
 * How delicate the picture is: the width of an edge, the radius of a corner and the strength of an edge by depth (`near`, 0 far to 1 near).
 * `detail` is the size of the picture against its design size (1 at 509 px for the tesseract of the card "Crypto Processing", 1 at 260 px
 * for the pictures of the steps). Thin lines and small corners on purpose: the picture must look neat, not heavy.
 */
export const edgeWidth = (near: number, detail: number) => (0.45 + 0.85 * near) * detail
export const cornerRadius = (near: number, detail: number) => (1.8 + 3.8 * near) * detail
export const edgeAlpha = (near: number) => 0.25 + 0.65 * near
export const cornerAlpha = (near: number) => 0.45 + 0.55 * near

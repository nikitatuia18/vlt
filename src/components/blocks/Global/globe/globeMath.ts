/*
 * Math of the dot globe: a unit sphere seen from outside, orthographic projection.
 * Axes: x to the right, y up, z towards the viewer. Latitude/longitude 0, 0 looks straight at the viewer.
 * No dependencies: the module is tested in node.
 */

export const RAD = Math.PI / 180

export type Vec3 = readonly [number, number, number]

/** How the globe is turned: the point (lon, lat) is in the middle of the picture. */
export type View = { cosYaw: number; sinYaw: number; cosPitch: number; sinPitch: number }

export const latLonToVector = (latDeg: number, lonDeg: number): Vec3 => {
  const lat = latDeg * RAD
  const lon = lonDeg * RAD
  const ring = Math.cos(lat)
  return [ring * Math.sin(lon), Math.sin(lat), ring * Math.cos(lon)]
}

/** `centerLon` / `centerLat` in radians: the point of the Earth that faces the viewer. */
export const createView = (centerLon: number, centerLat: number): View => ({
  cosYaw: Math.cos(centerLon),
  sinYaw: Math.sin(centerLon),
  cosPitch: Math.cos(centerLat),
  sinPitch: Math.sin(centerLat),
})

/** Turns a point of the Earth into camera space (writes x, y, z into `out`). */
export const rotateInto = (view: View, x: number, y: number, z: number, out: number[]) => {
  // Around the vertical axis: the center longitude moves to the middle ...
  const x1 = x * view.cosYaw - z * view.sinYaw
  const z1 = x * view.sinYaw + z * view.cosYaw
  // ... then tilt, so that the center latitude moves to the middle as well.
  out[0] = x1
  out[1] = y * view.cosPitch - z1 * view.sinPitch
  out[2] = y * view.sinPitch + z1 * view.cosPitch
  return out
}

/** A point of camera space is seen unless the globe is in front of it: behind the middle plane and inside the disk. */
export const isSeen = (x: number, y: number, z: number) => z >= 0 || x * x + y * y > 1

/** Angle between two points of the sphere, radians. */
export const angleBetween = (a: Vec3, b: Vec3) => Math.acos(Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])))

/** Longer arcs fly higher over the surface (share of the radius at the middle of the arc). */
export const arcHeight = (angle: number) => 0.04 + 0.16 * (angle / Math.PI)

/** Point of the arc at `t` (0 to 1) from `a` to `b` along the great circle, lifted above the surface in the middle. */
export const arcPoint = (a: Vec3, b: Vec3, angle: number, t: number, out: number[]) => {
  const sine = Math.sin(angle)
  const weightA = sine < 1e-6 ? 1 - t : Math.sin((1 - t) * angle) / sine
  const weightB = sine < 1e-6 ? t : Math.sin(t * angle) / sine
  const lift = 1 + arcHeight(angle) * Math.sin(Math.PI * t)
  out[0] = (a[0] * weightA + b[0] * weightB) * lift
  out[1] = (a[1] * weightA + b[1] * weightB) * lift
  out[2] = (a[2] * weightA + b[2] * weightB) * lift
  return out
}

export const smoothstep = (from: number, to: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - from) / (to - from)))
  return t * t * (3 - 2 * t)
}

/** Even points on the sphere (Fibonacci lattice): i-th of `count`, as latitude and longitude in degrees. */
export const latticePoint = (index: number, count: number): [number, number] => {
  const y = 1 - (2 * (index + 0.5)) / count
  const longitude = ((index * Math.PI * (3 - Math.sqrt(5))) / RAD) % 360
  return [Math.asin(y) / RAD, longitude > 180 ? longitude - 360 : longitude]
}

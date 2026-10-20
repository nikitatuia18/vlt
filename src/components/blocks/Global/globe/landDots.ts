import { LAND_MASK_BASE64, LAND_MASK_HEIGHT, LAND_MASK_WIDTH } from './landMask.data'
import { latticePoint, RAD } from './globeMath'

let mask: Uint8Array | null = null

const decodeMask = () => {
  const binary = atob(LAND_MASK_BASE64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

/** True when the point (degrees) is on land. */
const isLand = (latitude: number, longitude: number) => {
  mask ??= decodeMask()
  const row = Math.min(LAND_MASK_HEIGHT - 1, Math.floor(90 - latitude))
  const column = Math.min(LAND_MASK_WIDTH - 1, Math.floor(longitude + 180))
  const index = row * LAND_MASK_WIDTH + column
  return (mask[index >> 3] & (1 << (index & 7))) !== 0
}

/**
 * The dots of the globe: an even lattice of `lattice` points over the whole sphere, of which only those on land are kept.
 * Returns unit vectors as x, y, z triples.
 */
export const createLandDots = (lattice: number) => {
  const found: number[] = []
  for (let index = 0; index < lattice; index++) {
    const [latitude, longitude] = latticePoint(index, lattice)
    if (!isLand(latitude, longitude)) continue
    const ring = Math.cos(latitude * RAD)
    found.push(ring * Math.sin(longitude * RAD), Math.sin(latitude * RAD), ring * Math.cos(longitude * RAD))
  }
  return new Float32Array(found)
}

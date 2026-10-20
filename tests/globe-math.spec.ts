import { expect, test } from '@playwright/test'
import {
  angleBetween,
  arcHeight,
  arcPoint,
  createView,
  isSeen,
  latLonToVector,
  latticePoint,
  RAD,
  rotateInto,
  smoothstep,
  spinSpeed,
} from '../src/components/blocks/Global/globe/globeMath'

const project = (lat: number, lon: number, centerLat: number, centerLon: number) => {
  const [x, y, z] = latLonToVector(lat, lon)
  return rotateInto(createView(centerLon * RAD, centerLat * RAD), x, y, z, [0, 0, 0])
}

test('the point at the center of the view faces the viewer', () => {
  for (const [lat, lon] of [
    [0, 0],
    [20, 15],
    [-35, -60],
    [50, 170],
  ]) {
    const [x, y, z] = project(lat, lon, lat, lon)
    expect(x).toBeCloseTo(0, 6)
    expect(y).toBeCloseTo(0, 6)
    expect(z).toBeCloseTo(1, 6)
  }
})

test('east is to the right and north is up', () => {
  const east = project(0, 10, 0, 0)
  const north = project(10, 0, 0, 0)
  expect(east[0]).toBeGreaterThan(0)
  expect(north[1]).toBeGreaterThan(0)
})

test('the opposite side of the globe is hidden, the near side is seen', () => {
  expect(isSeen(...(project(0, 180, 0, 0) as [number, number, number]))).toBe(false)
  expect(isSeen(...(project(0, 0, 0, 0) as [number, number, number]))).toBe(true)
})

test('a lifted point behind the rim stays seen, behind the disk it does not', () => {
  expect(isSeen(1.05, 0, -0.1)).toBe(true)
  expect(isSeen(0.3, 0.2, -0.5)).toBe(false)
})

test('an arc starts and ends on the surface and rises in between, longer arcs higher', () => {
  const a = latLonToVector(40, -100)
  const b = latLonToVector(50, 9)
  const angle = angleBetween(a, b)
  const out = [0, 0, 0]
  const length = (p: number[]) => Math.hypot(p[0], p[1], p[2])
  expect(length(arcPoint(a, b, angle, 0, out))).toBeCloseTo(1, 6)
  expect(length(arcPoint(a, b, angle, 1, out))).toBeCloseTo(1 , 6)
  expect(length(arcPoint(a, b, angle, 0.5, out))).toBeCloseTo(1 + arcHeight(angle), 6)
  expect(arcHeight(3)).toBeGreaterThan(arcHeight(0.3))
})

test('the lattice covers the sphere evenly: both hemispheres get half of the points', () => {
  const count = 2000
  let north = 0
  let east = 0
  for (let i = 0; i < count; i++) {
    const [lat, lon] = latticePoint(i, count)
    expect(Math.abs(lat)).toBeLessThanOrEqual(90)
    expect(Math.abs(lon)).toBeLessThanOrEqual(180)
    if (lat > 0) north++
    if (lon > 0) east++
  }
  expect(Math.abs(north - count / 2)).toBeLessThan(count * 0.01)
  expect(Math.abs(east - count / 2)).toBeLessThan(count * 0.03)
})

const spin = { base: 4, boost: 2.5, emptyCenter: -165, fullUntil: 20, fadeTo: 60 }

test('the globe turns faster over the empty Pacific and at the base speed over the Atlantic', () => {
  expect(spinSpeed(-165, spin)).toBeCloseTo(10, 6)
  expect(spinSpeed(-150, spin)).toBeCloseTo(10, 6)
  expect(spinSpeed(0, spin)).toBeCloseTo(4, 6)
  expect(spinSpeed(20, spin)).toBeCloseTo(4, 6)
})

test('the turn speed has no jump: it changes smoothly, also across 180 degrees', () => {
  let previous = spinSpeed(-180, spin)
  for (let lon = -179; lon <= 180; lon++) {
    const speed = spinSpeed(lon, spin)
    expect(Math.abs(speed - previous)).toBeLessThan(0.5)
    previous = speed
  }
  // 180 and -180 are the same meridian.
  expect(spinSpeed(180, spin)).toBeCloseTo(spinSpeed(-180, spin), 6)
  expect(spinSpeed(540, spin)).toBeCloseTo(spinSpeed(180, spin), 6)
})

test('smoothstep stays inside 0 to 1 and is flat at the ends', () => {
  expect(smoothstep(0.2, 0.8, 0)).toBe(0)
  expect(smoothstep(0.2, 0.8, 1)).toBe(1)
  expect(smoothstep(0.2, 0.8, 0.5)).toBeCloseTo(0.5, 6)
})

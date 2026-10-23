import { isLand } from '../../components/blocks/Global/globe/landDots'

/** The part of the world the map shows (degrees): without the poles, so the continents fill the card. */
export const MAP = { lonFrom: -170, lonTo: 175, latTop: 78, latBottom: -57 } as const

export const LON_SPAN = MAP.lonTo - MAP.lonFrom
export const LAT_SPAN = MAP.latTop - MAP.latBottom

export type FlatDot = { lon: number; lat: number }

/**
 * A rough name of the part of the world a point is in, for the panel of the latest payment. Boxes, not borders: good enough to say
 * "Asia" for a click on India and nothing more.
 */
export function regionOf({ lat, lon }: FlatDot): string {
  if (lon < -30) return lat >= 12 ? 'North America' : 'South America'
  if (lat >= 36 && lon < 45) return 'Europe'
  if (lat >= 12 && lon >= 35 && lon < 62) return 'Middle East'
  if (lon < 52 && lat < 36) return 'Africa'
  if (lat < -10 && lon >= 110) return 'Oceania'
  if (lat < 0 && lon >= 140) return 'Oceania'
  return 'Asia'
}

/**
 * The dots of the flat map: a square grid of `columns` x rows cells over the map, of which only the cells on land stay
 * (the same land mask as the dots of the globe). Rows follow from the columns so that the cells are square.
 */
export function createFlatLandDots(columns: number): FlatDot[] {
  const rows = Math.round((columns * LAT_SPAN) / LON_SPAN)
  const dots: FlatDot[] = []
  for (let row = 0; row < rows; row++) {
    const lat = MAP.latTop - ((row + 0.5) / rows) * LAT_SPAN
    for (let column = 0; column < columns; column++) {
      const lon = MAP.lonFrom + ((column + 0.5) / columns) * LON_SPAN
      if (isLand(lat, lon)) dots.push({ lon, lat })
    }
  }
  return dots
}

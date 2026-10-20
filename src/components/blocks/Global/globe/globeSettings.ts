import { RAD, type SpinSettings } from './globeMath'

/* Look of the globe and how it moves. Numbers from docs/blocks/global.motion.md; tune them here. */

/** Distance between neighbouring dots at the final size, px: sets how many dots the globe gets (and the cost of a frame). */
export const DOT_SPACING = 4.7
/** Dot radius, px, on a globe 650 px wide; it grows slower than the globe, so the big globe has fine dots, not blobs. */
export const DOT_RADIUS = 1
export const DOT_RADIUS_GROWTH = 0.6
/** Brightness and size of the dots by depth: the rim of the globe is faint and fine, the middle is full. */
export const LEVEL_FROM_DEPTH = [0, 0.18, 0.4, 0.7]
export const LEVEL_ALPHA = [0.25, 0.5, 0.8, 1]
export const LEVEL_SIZE = [0.6, 0.8, 0.9, 1]

/** The pointer pushes dots away: the values of the approved prototype (see InteractiveDots). */
export const POINTER_RADIUS = 150
/** The pointer's position while it is not over the page (no push, and no need to measure the canvas), and a point far enough from any dot. */
export const POINTER_AWAY = -1000
export const POINTER_FAR = 100000
/** The dots are built when the globe comes within this distance of the screen (one screen up or down), not at page load. */
export const PRIME_MARGIN = '100% 0px 100% 0px'
export const POINTER_FORCE = 1
export const POINTER_EASE = 0.1

/**
 * The turn: 4 degrees per second over land (a revolution in about 90 s), 2.5 times faster over the empty Pacific so that
 * the viewer does not wait for the land to come back. Also: the longitude that faces the viewer at the start,
 * and the tilt of the axis towards the viewer.
 */
export const SPIN: SpinSettings = { base: 4, boost: 2.5, emptyCenter: -165, fullUntil: 20, fadeTo: 60 }
export const START_LONGITUDE = -10
export const TILT = 20

/** The hand may turn the globe only a little: the limits (degrees) of the soft stop, and the spring that brings it back. */
export const DRAG_LIMIT_LONGITUDE = 45 * RAD
export const DRAG_LIMIT_LATITUDE = 12 * RAD
export const SPRING = 12
export const SPRING_DAMPING = 2 * Math.sqrt(SPRING)

/** Scene (progress of the pinned section, 0 to 1): the globe flies from "big" to its place, then the cards start. */
export const MOVE_FROM = 0
export const MOVE_TO = 0.75
export const CARDS_AT = 0.85
/** With reduced motion the timeline stands still at this frame: three cards (EU, Chile, Argentina) and three lines are on. */
export const STILL_FRAME = 800
/** The big globe is as wide as the page container; on a phone, where that is hardly bigger than the end place, at least this many times the end size. */
export const BIG_MIN_TIMES_SLOT = 1.6
/** While the section comes into view the globe also grows a little, from this share of its big size. */
export const APPEAR_SCALE_FROM = 0.92

/** Cards: design size at a globe of this radius (the design shows the globe 650 px wide); never scaled below MIN_CARD_SCALE. */
export const CARD_REFERENCE_RADIUS = 325
export const MIN_CARD_SCALE = 0.6
/** A card fades out as its country turns to the rim of the globe (z of the surface point). */
export const CARD_VISIBLE_FROM = 0.02
export const CARD_VISIBLE_TO = 0.28

export const ARC_STEPS = 56

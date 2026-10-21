import { useEffect, useRef, useState, type ReactNode } from 'react'

/** The card of the design: 436.67 × 550 px. The illustrations are drawn in the coordinates of this card. */
const DESIGN_WIDTH = 436.67
const DESIGN_HEIGHT = 550

type CardFrameProps = {
  /** Which corner of the card the picture keeps when the card is narrower than the design. */
  anchor?: 'bottom-left' | 'bottom-right'
  children: ReactNode
}

/**
 * A layer over the whole card in which the illustration is drawn at the size of the design card; when the real card is narrower
 * (tablet, phone) the whole picture shrinks around the lower corner, so that it keeps its place and nothing is cut.
 * Wider cards keep the design size. Pointer events go through.
 */
export function CardFrame({ anchor = 'bottom-left', children }: CardFrameProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const measure = () => setScale(Math.min(1, element.clientWidth / DESIGN_WIDTH))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const right = anchor === 'bottom-right'
  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div
        className={`absolute bottom-0 ${right ? 'right-0' : 'left-0'}`}
        style={{ width: DESIGN_WIDTH, height: DESIGN_HEIGHT, transform: `scale(${scale})`, transformOrigin: right ? 'bottom right' : 'bottom left' }}
      >
        {children}
      </div>
    </div>
  )
}

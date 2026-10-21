import type { Pin } from '../pins'

/**
 * Card with a flag, a currency code and the payment rails. Figma `global__pin-{id}`.
 * Above 1280 px it is a pill with text; below, only the flag in a round frame (derived: the text would be too small).
 * The outer layer is moved onto the country every frame by the globe loop; the flag centre is its origin.
 * Font note: the design uses Urbanist for the code, which is not in the font set; the closest styles are used (ui-md, body-sm).
 */
export function PinCard({ pin, outerRef }: { pin: Pin; outerRef: (element: HTMLDivElement | null) => void }) {
  const toLeft = pin.side === 'left'
  return (
    <div ref={outerRef} className="pointer-events-none absolute top-0 left-0 origin-top-left opacity-0 will-change-transform">
      <div
        data-el={`global__pin-${pin.id}`}
        // w-max: the box sits in a zero-width layer, without it the width is squeezed to what is left of the 30 px offset.
        className={`absolute top-[-30px] desktop:top-[-38px] flex w-max items-center justify-center gap-3 rounded-pill bg-surface-subtle p-2 ring-1 ring-inset ring-border-subtle desktop:p-4 ${
          toLeft ? 'right-[-30px] desktop:right-[-38px] flex-row-reverse' : 'left-[-30px] desktop:left-[-38px]'
        }`}
      >
        <img src={pin.flag} alt="" width={44} height={44} loading="lazy" decoding="async" className="size-11 max-w-none shrink-0" />
        <div className={`hidden flex-col items-start justify-center text-center whitespace-nowrap desktop:flex ${toLeft ? 'pl-2' : 'pr-2'}`}>
          <span data-el={`global__pin-${pin.id}-label`} className="type-ui-md text-typography-primary">
            {pin.code}
          </span>
          <span data-el={`global__pin-${pin.id}-desc`} className="type-body-sm text-typography-secondary">
            {pin.rails}
          </span>
        </div>
      </div>
    </div>
  )
}

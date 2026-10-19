/**
 * Burger / close icon for the mobile menu button.
 * Not taken from Figma: the menu is not designed in the desktop frame.
 * Replace it with the icon from the mobile frame when that frame is processed.
 */
export function MenuToggleIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {isOpen ? (
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      )}
    </svg>
  )
}

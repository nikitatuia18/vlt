import type { ComponentProps } from 'react'
import moonIcon from '../../assets/icons/moon.svg'
import sunIcon from '../../assets/icons/sun.svg'
import { useTheme } from '../../lib/theme'
import { Icon } from './Icon'
import { IconButton } from './IconButton'

/** Light/dark switch. Shows the icon of the current theme: sun for light, moon for dark. */
export function ThemeToggle(props: Omit<ComponentProps<'button'>, 'children' | 'onClick'>) {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <IconButton
      aria-label="Switch color theme"
      {...props}
      aria-pressed={isDark}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {/* Both icons live in a 24 px slot; the moon glyph is 20.9 x 21.5 px in the design. */}
      <span className="grid size-6 place-items-center">
        {isDark ? <Icon src={moonIcon} width={20.8634} height={21.5021} /> : <Icon src={sunIcon} width={24} height={24} />}
      </span>
    </IconButton>
  )
}

import type { ReactNode } from 'react'
import { navBlockIds } from '../components/ui/Header/navigation'
import { Footer } from '../components/ui/Footer'
import { Header } from '../components/ui/Header'
import { useScrollSpy } from '../lib/useScrollSpy'

/**
 * What every page of the site has in common: the skip link, the header, the main area and the footer.
 * `currentId` marks a menu item for good (a product page is under "Products"); `spy` marks the item of the block on the screen
 * instead (the home page, where the menu items are its blocks).
 */
export function PageShell({ currentId = 'products', spy = false, children }: { currentId?: string; spy?: boolean; children: ReactNode }) {
  const spied = useScrollSpy(navBlockIds)
  return (
    <>
      {/* The first stop of the Tab key: shown only while it has focus; jumps over the header to the content. */}
      <a
        href="#main"
        data-el="skip-link"
        className="type-ui-sm sr-only rounded-pill bg-surface-inverse text-typography-inverse focus:not-sr-only focus:px-4 focus:py-3 focus:fixed focus:top-4 focus:left-4 focus:z-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand"
      >
        Skip to content
      </a>
      <Header currentId={spy ? spied : currentId} />
      <main id="main" tabIndex={-1} className="focus:outline-none">
        {children}
      </main>
      <Footer />
    </>
  )
}

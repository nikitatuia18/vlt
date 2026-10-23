import { useEffect } from 'react'

/** Puts the title and the description of the page into the tab and the search snippet while the page is shown. */
export function usePageMeta({ title, description }: { title: string; description?: string }) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title
    const meta = document.head.querySelector<HTMLMetaElement>('meta[name="description"]')
    const previousDescription = meta?.content
    if (meta && description) meta.content = description
    return () => {
      document.title = previousTitle
      if (meta && previousDescription !== undefined) meta.content = previousDescription
    }
  }, [title, description])
}

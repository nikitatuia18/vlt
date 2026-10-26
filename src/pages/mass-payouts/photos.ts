/*
 * The photos of the Mass Payouts page. Every picture put in a folder is taken by its name (any number, in the order of the names); nothing else
 * has to be changed. Photos are square, head and shoulders, the same plain background; a circle crops them.
 */

const urls = (modules: Record<string, string>) =>
  Object.entries(modules)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, url]) => url)

/** The people of the hero: `src/assets/mass-payouts/people/` (01 is the big head in the middle). */
export const heroPhotos = urls(import.meta.glob('../../assets/mass-payouts/people/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>)

/**
 * The people of the example batch of the routing block, one picture for each recipient in the order of the list (01 Anna Keller, 02 Lucas Almeida …):
 * `src/assets/mass-payouts/recipients/`. Until a recipient has a picture of their own, a person of the hero stands in for them.
 */
const own = urls(import.meta.glob('../../assets/mass-payouts/recipients/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>)
export const recipientPhoto = (index: number): string | null => own[index] ?? (heroPhotos.length ? heroPhotos[(index + 1) % heroPhotos.length] : null)

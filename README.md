# Velant Pay

Landing page of Velant Pay: React 19, Vite, TypeScript, Tailwind v4, motion.dev, Lenis. The layout comes from Figma (file «Design», frames `desctop / home page` and `mobile / home page`).

Live site: https://nikitatuia18.github.io/vlt/ (UI Kit: https://nikitatuia18.github.io/vlt/ui-kit, closed from search engines).
It is published by GitHub Pages from `main` (`.github/workflows/deploy.yml`). Settings → Pages → Source must be «GitHub Actions».

## Run

Node 20.19+ or 22.12+ (Vite 8).

| Command | What it does |
|---|---|
| `npm install` | install dependencies |
| `npm run dev` | dev server, http://localhost:5173 |
| `npm run build` | type check (`tsc -b`) and production build into `dist/` |
| `npm run lint` | oxlint |
| `npm run preview` | serve the built `dist/` |
| `npx playwright test` | visual and behavior checks (`tests/`); the first run needs `npx playwright install chromium` |

The site is built for the sub-folder `/vlt/` on GitHub Pages: the path comes from `VITE_BASE` (see `vite.config.ts`); locally it is `/`. For a build like the published one: `VITE_BASE=/vlt/ npm run build`.

## Where things are

- `src/components/blocks/<Block>/` — one component per block of the page; `src/components/ui/` — shared elements (the design system).
- `src/styles/` — tokens (`tokens.css`, `typography.css`) from Figma Variables, light and dark themes.
- `src/motion/` — appearance animations (`reveal.tsx`) and shared timings (`tokens.ts`).
- `src/ui-kit/` — the living UI Kit page (`/ui-kit`).
- `tests/` — Playwright specs, one per block plus cross-cutting ones.
- `scripts/` — one-off generators: `build-globe-land.mjs` makes the land mask of the globe (needs the devDependencies `d3-geo`, `topojson-client`, `world-atlas`); `optimize-cta-person.mjs` is the record of how the banner picture was made (the source picture is not kept).
- `docs/` — start with [docs/status.md](docs/status.md) (what is done, what is open); rules and conventions are in [CLAUDE.md](CLAUDE.md), the design system in [docs/ui-kit.md](docs/ui-kit.md), traps and how to avoid them in [docs/lessons.md](docs/lessons.md).

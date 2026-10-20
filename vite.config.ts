import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // The site is published in a sub-folder (GitHub Pages, .github/workflows/deploy.yml): the path comes from the build, locally it is '/'.
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss()],
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { appsApi } from './plugins/apps-api.ts'

// Em produção o site vive em https://<utilizador>.github.io/<repo>/ —
// ajustar se o repositório GitHub tiver outro nome.
const GH_PAGES_BASE = '/DEVGallery/'

export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? GH_PAGES_BASE : '/',
  plugins: [react(), tailwindcss(), appsApi()],
}))

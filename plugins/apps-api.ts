import { promises as fs } from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'

/**
 * Mini-API de desenvolvimento para gerir a galeria.
 *
 * Em `npm run dev` expõe CRUD sobre `src/data/apps.json` e grava imagens de
 * fallback em `public/previews/`. Em produção (GitHub Pages) nada disto
 * existe — o site é read-only e os dados viajam com o build.
 *
 *   GET    /api/apps        → lista
 *   POST   /api/apps        → cria (aceita `imageData` como data URL)
 *   PUT    /api/apps/:id    → atualiza
 *   DELETE /api/apps/:id    → apaga (remove também a imagem associada)
 */

interface AppRecord {
  id: string
  name: string
  description: string
  url: string
  tags: string[]
  previewMode: 'iframe' | 'image'
  image?: string
  accent?: string
  repoUrl?: string
  createdAt: string
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => (data += chunk))
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

export function appsApi(): Plugin {
  let root = process.cwd()
  const dataFile = () => path.join(root, 'src/data/apps.json')
  const previewsDir = () => path.join(root, 'public/previews')

  async function load(): Promise<AppRecord[]> {
    return JSON.parse(await fs.readFile(dataFile(), 'utf8'))
  }

  async function save(apps: AppRecord[]): Promise<void> {
    await fs.writeFile(dataFile(), JSON.stringify(apps, null, 2) + '\n')
  }

  /** Grava uma imagem enviada como data URL e devolve o caminho público relativo. */
  async function saveImage(id: string, dataUrl: string): Promise<string> {
    const match = /^data:image\/(png|jpe?g|webp|gif|avif|svg\+xml);base64,(.+)$/.exec(dataUrl)
    if (!match) throw new Error('Formato de imagem inválido — esperado data URL base64.')
    const ext = match[1] === 'jpeg' ? 'jpg' : match[1] === 'svg+xml' ? 'svg' : match[1]
    await fs.mkdir(previewsDir(), { recursive: true })
    // Sufixo temporal para evitar caches do browser em edições sucessivas.
    const file = `${id}-${Date.now().toString(36)}.${ext}`
    await fs.writeFile(path.join(previewsDir(), file), Buffer.from(match[2], 'base64'))
    return `previews/${file}`
  }

  async function deleteImage(image?: string): Promise<void> {
    if (!image?.startsWith('previews/')) return
    await fs.unlink(path.join(root, 'public', image)).catch(() => {})
  }

  const sanitizeTags = (tags: unknown): string[] =>
    Array.isArray(tags)
      ? tags.map((t) => String(t).trim().toUpperCase()).filter(Boolean).slice(0, 8)
      : []

  return {
    name: 'devgallery:apps-api',
    apply: 'serve',

    config() {
      // As escritas do próprio plugin não devem disparar reloads da página —
      // o estado no cliente já é atualizado de forma otimista.
      return {
        server: {
          watch: { ignored: ['**/src/data/apps.json', '**/public/previews/**'] },
        },
      }
    },

    configResolved(config) {
      root = config.root
    },

    configureServer(server) {
      server.middlewares.use('/api/apps', (req: IncomingMessage, res: ServerResponse) => {
        const send = (status: number, body: unknown) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
        }

        void (async () => {
          const id = decodeURIComponent((req.url ?? '/').split('?')[0].replace(/^\//, '')) || null
          const apps = await load()

          if (req.method === 'GET') return send(200, apps)

          if (req.method === 'POST' && !id) {
            const draft = JSON.parse(await readBody(req))
            if (!draft.name?.trim()) return send(400, { error: 'O nome é obrigatório.' })
            const newId = crypto.randomUUID().slice(0, 8)
            const entry: AppRecord = {
              id: newId,
              name: String(draft.name).trim(),
              description: String(draft.description ?? '').trim(),
              url: String(draft.url ?? '').trim(),
              tags: sanitizeTags(draft.tags),
              previewMode: draft.previewMode === 'image' ? 'image' : 'iframe',
              createdAt: new Date().toISOString(),
            }
            if (draft.accent) entry.accent = String(draft.accent)
            if (draft.repoUrl?.trim()) entry.repoUrl = String(draft.repoUrl).trim()
            if (draft.imageUrl?.trim()) entry.image = String(draft.imageUrl).trim()
            else if (draft.imageData) entry.image = await saveImage(newId, draft.imageData)
            apps.push(entry)
            await save(apps)
            return send(201, entry)
          }

          if (req.method === 'PUT' && id) {
            const index = apps.findIndex((a) => a.id === id)
            if (index < 0) return send(404, { error: 'App não encontrada.' })
            const draft = JSON.parse(await readBody(req))
            const prev = apps[index]
            const entry: AppRecord = {
              ...prev,
              name: String(draft.name ?? prev.name).trim(),
              description: String(draft.description ?? prev.description).trim(),
              url: String(draft.url ?? prev.url).trim(),
              tags: draft.tags !== undefined ? sanitizeTags(draft.tags) : prev.tags,
              previewMode: draft.previewMode === 'image' ? 'image' : 'iframe',
            }
            if (draft.repoUrl !== undefined) {
              const repoUrl = String(draft.repoUrl).trim()
              if (repoUrl) entry.repoUrl = repoUrl
              else delete entry.repoUrl
            }
            if (draft.imageUrl?.trim()) {
              await deleteImage(prev.image)
              entry.image = String(draft.imageUrl).trim()
            } else if (draft.imageData) {
              await deleteImage(prev.image)
              entry.image = await saveImage(id, draft.imageData)
            } else if (draft.removeImage) {
              await deleteImage(prev.image)
              delete entry.image
            }
            apps[index] = entry
            await save(apps)
            return send(200, entry)
          }

          if (req.method === 'DELETE' && id) {
            const entry = apps.find((a) => a.id === id)
            if (!entry) return send(404, { error: 'App não encontrada.' })
            await deleteImage(entry.image)
            await save(apps.filter((a) => a.id !== id))
            return send(200, { ok: true })
          }

          send(405, { error: 'Método não suportado.' })
        })().catch((error: unknown) => {
          send(500, { error: error instanceof Error ? error.message : 'Erro inesperado.' })
        })
      })
    },
  }
}

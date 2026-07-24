import { useCallback, useEffect, useRef, useState } from 'react'
import type { AppDraft, AppEntry } from '../types'
import seed from '../data/apps.json'
import { commitAppsFile, fetchAppsFile, hasToken } from '../lib/github'

const API = '/api/apps'
const IS_DEV = import.meta.env.DEV

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Erro HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

const sanitizeTags = (tags: string[]): string[] =>
  tags.map((tag) => tag.trim().toUpperCase()).filter(Boolean).slice(0, 8)

/** Converte um draft numa entrada completa (o cliente atribui id/data no modo GitHub). */
function draftToEntry(draft: AppDraft, base?: AppEntry): AppEntry {
  const entry: AppEntry = {
    id: base?.id ?? crypto.randomUUID().slice(0, 8),
    name: draft.name.trim(),
    description: draft.description.trim(),
    url: draft.url.trim(),
    tags: sanitizeTags(draft.tags),
    previewMode: draft.previewMode === 'image' ? 'image' : 'iframe',
    createdAt: base?.createdAt ?? new Date().toISOString(),
  }
  if (base?.accent) entry.accent = base.accent
  const repoUrl = draft.repoUrl?.trim()
  if (repoUrl) entry.repoUrl = repoUrl

  if (draft.imageUrl?.trim()) entry.image = draft.imageUrl.trim()
  else if (!draft.removeImage && base?.image) entry.image = base.image

  return entry
}

/**
 * Fonte de dados da galeria, com três modos:
 *
 * - dev            → mini-API do plugin Vite, que grava em src/data/apps.json.
 * - prod + token   → Contents API do GitHub: cada alteração é um commit ao repo.
 * - prod sem token → só leitura, a partir do apps.json embebido no build.
 */
export function useApps() {
  const [apps, setApps] = useState<AppEntry[]>(seed as AppEntry[])
  const [tokenConfigured, setTokenConfigured] = useState(!IS_DEV && hasToken())

  // SHA do blob apps.json no GitHub — necessário para cada commit encadear no anterior.
  const shaRef = useRef<string | null>(null)
  // Espelho do estado para os commits usarem a lista completa mais recente.
  const appsRef = useRef(apps)
  useEffect(() => {
    appsRef.current = apps
  }, [apps])

  const useGithub = !IS_DEV && tokenConfigured

  useEffect(() => {
    if (IS_DEV) {
      request<AppEntry[]>(API).then(setApps).catch(() => {
        // Sem API (ex.: preview do build) — ficam os dados do import.
      })
      return
    }
    if (!tokenConfigured) return
    fetchAppsFile()
      .then(({ apps: remote, sha }) => {
        setApps(remote)
        shaRef.current = sha
      })
      .catch(() => {
        // Sem acesso — mantém o seed do build; o TokenModal reporta o erro ao guardar.
      })
  }, [tokenConfigured])

  /** Garante um SHA fresco antes de committar (ex.: token acabou de ser configurado). */
  const currentSha = useCallback(async (): Promise<string> => {
    if (shaRef.current) return shaRef.current
    const { sha } = await fetchAppsFile()
    shaRef.current = sha
    return sha
  }, [])

  const addApp = useCallback(
    async (draft: AppDraft) => {
      if (useGithub) {
        const entry = draftToEntry(draft)
        const next = [...appsRef.current, entry]
        shaRef.current = await commitAppsFile(next, await currentSha(), `Adicionar app: ${entry.name}`)
        setApps(next)
        return entry
      }
      const created = await request<AppEntry>(API, { method: 'POST', body: JSON.stringify(draft) })
      setApps((prev) => [...prev, created])
      return created
    },
    [useGithub, currentSha],
  )

  const updateApp = useCallback(
    async (id: string, draft: AppDraft) => {
      if (useGithub) {
        let updated: AppEntry | undefined
        const next = appsRef.current.map((app) => {
          if (app.id !== id) return app
          updated = draftToEntry(draft, app)
          return updated
        })
        if (!updated) throw new Error('App não encontrada.')
        shaRef.current = await commitAppsFile(next, await currentSha(), `Editar app: ${updated.name}`)
        setApps(next)
        return updated
      }
      const saved = await request<AppEntry>(`${API}/${id}`, { method: 'PUT', body: JSON.stringify(draft) })
      setApps((prev) => prev.map((app) => (app.id === id ? saved : app)))
      return saved
    },
    [useGithub, currentSha],
  )

  const deleteApp = useCallback(
    async (id: string) => {
      if (useGithub) {
        const target = appsRef.current.find((app) => app.id === id)
        const next = appsRef.current.filter((app) => app.id !== id)
        shaRef.current = await commitAppsFile(
          next,
          await currentSha(),
          `Remover app: ${target?.name ?? id}`,
        )
        setApps(next)
        return
      }
      await request<{ ok: boolean }>(`${API}/${id}`, { method: 'DELETE' })
      setApps((prev) => prev.filter((app) => app.id !== id))
    },
    [useGithub, currentSha],
  )

  /** Reavalia a presença do token (após o TokenModal guardar/limpar credenciais). */
  const refreshToken = useCallback(() => setTokenConfigured(!IS_DEV && hasToken()), [])

  return {
    apps,
    addApp,
    updateApp,
    deleteApp,
    admin: {
      /** Há permissões para editar (dev sempre; prod só com token válido). */
      enabled: IS_DEV || tokenConfigured,
      isDev: IS_DEV,
      tokenConfigured,
      refreshToken,
    },
  }
}

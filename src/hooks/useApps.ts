import { useCallback, useEffect, useState } from 'react'
import type { AppDraft, AppEntry } from '../types'
import seed from '../data/apps.json'

const API = '/api/apps'

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

/**
 * Fonte de dados da galeria.
 *
 * Em produção os dados vêm do build (import estático de apps.json).
 * Em dev sincroniza com a mini-API do plugin Vite, que persiste as
 * alterações diretamente no ficheiro.
 */
export function useApps() {
  const [apps, setApps] = useState<AppEntry[]>(seed as AppEntry[])

  useEffect(() => {
    if (!import.meta.env.DEV) return
    request<AppEntry[]>(API).then(setApps).catch(() => {
      // Sem API (ex.: preview do build) — ficam os dados do import.
    })
  }, [])

  const addApp = useCallback(async (draft: AppDraft) => {
    const created = await request<AppEntry>(API, {
      method: 'POST',
      body: JSON.stringify(draft),
    })
    setApps((prev) => [...prev, created])
    return created
  }, [])

  const updateApp = useCallback(async (id: string, draft: AppDraft) => {
    const updated = await request<AppEntry>(`${API}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(draft),
    })
    setApps((prev) => prev.map((app) => (app.id === id ? updated : app)))
    return updated
  }, [])

  const deleteApp = useCallback(async (id: string) => {
    await request<{ ok: boolean }>(`${API}/${id}`, { method: 'DELETE' })
    setApps((prev) => prev.filter((app) => app.id !== id))
  }, [])

  return { apps, addApp, updateApp, deleteApp }
}

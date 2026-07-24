import type { AppEntry } from '../types'

/**
 * Cliente da API do GitHub para gerir a galeria em produção.
 *
 * Em GitHub Pages não há servidor: para adicionar/editar apps o browser faz
 * commit do próprio `src/data/apps.json` ao repositório através da Contents API,
 * usando um token pessoal (fine-grained PAT) que só existe no localStorage deste
 * browser. O push dispara o workflow de deploy — o site reconstrói em ~1 min.
 *
 * O token deve ter acesso apenas a este repositório e à permissão
 * "Contents: Read and write". Assim o alcance de um token comprometido é mínimo.
 */

const API_ROOT = 'https://api.github.com'
const CONFIG_KEY = 'devgallery.gh-config'
const TOKEN_KEY = 'devgallery.gh-token'

export interface GithubConfig {
  owner: string
  repo: string
  branch: string
  /** Caminho do ficheiro de dados dentro do repositório. */
  path: string
}

const DEFAULT_CONFIG: GithubConfig = {
  owner: 'acamoes',
  repo: 'DEVGallery',
  branch: 'main',
  path: 'src/data/apps.json',
}

export function getConfig(): GithubConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    return raw ? { ...DEFAULT_CONFIG, ...(JSON.parse(raw) as Partial<GithubConfig>) } : DEFAULT_CONFIG
  } catch {
    return DEFAULT_CONFIG
  }
}

export function setConfig(config: GithubConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function hasToken(): boolean {
  return Boolean(getToken())
}

/** Base64 de uma string UTF-8 (btoa só lida com Latin-1). */
function encodeBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

/** Descodifica base64 (com quebras de linha da API) de volta a UTF-8. */
function decodeBase64(base64: string): string {
  const binary = atob(base64.replace(/\n/g, ''))
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

async function gh(path: string, init?: RequestInit): Promise<Response> {
  const token = getToken()
  if (!token) throw new Error('Token do GitHub não configurado.')

  const res = await fetch(API_ROOT + path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  })

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null
    const detail = body?.message ?? `erro ${res.status}`
    if (res.status === 401) throw new Error('Token inválido ou expirado.')
    if (res.status === 404)
      throw new Error('Repositório/ficheiro não encontrado — confirma owner, repo e permissões do token.')
    throw new Error(`GitHub: ${detail}`)
  }
  return res
}

/** Lê o apps.json do repositório e devolve os dados + o SHA atual do blob. */
export async function fetchAppsFile(): Promise<{ apps: AppEntry[]; sha: string }> {
  const { owner, repo, branch, path } = getConfig()
  const res = await gh(`/repos/${owner}/${repo}/contents/${path}?ref=${branch}`)
  const data = (await res.json()) as { content: string; sha: string }
  return { apps: JSON.parse(decodeBase64(data.content)) as AppEntry[], sha: data.sha }
}

/** Committa a lista completa de apps. Devolve o novo SHA do blob. */
export async function commitAppsFile(
  apps: AppEntry[],
  sha: string,
  message: string,
): Promise<string> {
  const { owner, repo, branch, path } = getConfig()
  const content = encodeBase64(JSON.stringify(apps, null, 2) + '\n')
  const res = await gh(`/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify({ message, content, sha, branch }),
  })
  const data = (await res.json()) as { content: { sha: string } }
  return data.content.sha
}

/** Valida token + acesso ao ficheiro (usado ao guardar as credenciais). */
export async function verifyAccess(): Promise<void> {
  await fetchAppsFile()
}

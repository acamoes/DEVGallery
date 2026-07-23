export interface AppEntry {
  id: string
  name: string
  description: string
  url: string
  tags: string[]
  /** "iframe" = preview live escalado; "image" = usa a imagem enviada. */
  previewMode: 'iframe' | 'image'
  /** Caminho relativo a public/ (ex.: "previews/abc.png"). */
  image?: string
  /** Cor de destaque opcional para o placeholder. */
  accent?: string
  /** Link opcional para o repositório (GitHub, etc.). */
  repoUrl?: string
  createdAt: string
}

/** Payload enviado à API de dev ao criar/editar uma app. */
export interface AppDraft {
  name: string
  description: string
  url: string
  tags: string[]
  previewMode: 'iframe' | 'image'
  repoUrl?: string
  /** Imagem nova como data URL base64 (o servidor grava-a em public/previews). */
  imageData?: string
  /** Em edição: remover a imagem existente sem enviar outra. */
  removeImage?: boolean
}

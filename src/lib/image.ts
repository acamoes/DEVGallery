/** Resolve o campo `image` de uma app para um src utilizável no browser. */
export function resolveImage(image: string): string {
  // URLs absolutos e data URLs usam-se tal como estão; caminhos relativos
  // (ex.: "previews/abc.png") vivem dentro de public/ e levam o base do build.
  return isAbsoluteImage(image) ? image : import.meta.env.BASE_URL + image
}

/** true para http(s) e data URLs — imagens que não vivem em public/. */
export function isAbsoluteImage(image: string): boolean {
  return /^(https?:|data:)/i.test(image)
}

# DEV Gallery

Galeria pessoal de apps com **previews live** — fundo preto, acento amarelo-ácido, tipografia display expandida. Construída com React + Vite + Tailwind v4 + Motion, publicada no GitHub Pages.

## Começar

```bash
npm install
npm run dev
```

## Adicionar / editar apps

Os controlos de administração **só existem em dev** (`npm run dev`):

1. Clica em **“+ Adicionar app”** (canto inferior direito).
2. Preenche nome, URL, descrição e tags — o preview live aparece no próprio formulário.
3. Ao guardar, a app entra imediatamente na galeria e fica persistida em [src/data/apps.json](src/data/apps.json). As imagens de fallback vão para `public/previews/`.

Editar/apagar: abre o cartão da app e usa **Editar** / **Apagar** no painel de detalhe.

No site publicado a galeria é read-only — os visitantes não veem os controlos.

### Previews

- **Live iframe** — a app é renderizada num iframe a 1280 px escalado para caber no cartão. Requer que o site permita embedding (sem `X-Frame-Options` / `frame-ancestors`).
- **Imagem** — para apps que bloqueiam iframes (ou apps mobile/desktop): muda o modo de preview e envia um screenshot.

## Publicar (GitHub Pages)

1. Cria um repositório no GitHub chamado `DEVGallery` (se usares outro nome, ajusta `GH_PAGES_BASE` em [vite.config.ts](vite.config.ts)).
2. No repositório: **Settings → Pages → Source: GitHub Actions**.
3. Push para `main`:

```bash
git remote add origin https://github.com/<utilizador>/DEVGallery.git
git push -u origin main
```

O workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml) faz build e deploy automáticos a cada push. Fluxo do dia-a-dia: adicionar app em dev → commit → push → publicado.

## Estrutura

- `src/data/apps.json` — fonte de verdade da galeria (versionada com o código)
- `plugins/apps-api.ts` — mini-API de dev que escreve no JSON e grava imagens
- `src/components/LivePreview.tsx` — iframe escalado com lazy-load e fallbacks
- `src/styles/index.css` — design system (tokens, tipografia, noise, marquee)

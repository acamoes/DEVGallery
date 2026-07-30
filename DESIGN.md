---
name: DEV Gallery
description: Índice pessoal de aplicações web, cada uma a correr viva dentro da página.
colors:
  ink: "#000000"
  surface: "#0b0b0b"
  line: "#1c1c1c"
  paper: "#ffffff"
  mute: "#7a7a7a"
  watermark: "#3a3a3a"
  danger: "#e0523c"
typography:
  display:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "clamp(3rem, 13vw, 12rem)"
    fontWeight: 880
    lineHeight: 0.84
    letterSpacing: "-0.03em"
    fontVariation: "wdth 125"
  headline:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "clamp(2rem, 5vw, 4.5rem)"
    fontWeight: 880
    lineHeight: 0.84
    letterSpacing: "-0.03em"
    fontVariation: "wdth 125"
  title:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 860
    lineHeight: 0.92
    letterSpacing: "-0.015em"
    fontVariation: "wdth 122"
  body:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "normal"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, Cascadia Mono, monospace"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.14em"
rounded:
  none: "0px"
  pulse: "9999px"
spacing:
  gutter: "20px"
  gutter-wide: "40px"
  stack: "28px"
  section: "64px"
  section-wide: "96px"
  column-gap: "64px"
components:
  button-primary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    padding: "16px 24px"
  button-primary-hover:
    backgroundColor: "{colors.mute}"
    textColor: "{colors.ink}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.mute}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "14px 24px"
  button-ghost-hover:
    textColor: "{colors.paper}"
  input-text:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "12px 16px"
  chip-tag:
    backgroundColor: "transparent"
    textColor: "{colors.mute}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "2px 8px"
  frame-preview:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.none}"
  panel-overlay:
    backgroundColor: "{colors.ink}"
    rounded: "{rounded.none}"
---

# Design System: DEV Gallery

## Overview

**Creative North Star: "A Sala de Projeção"**

Uma sala escura onde as coisas passam uma de cada vez. O ecrã abre a preto absoluto e só com tipografia; o scroll é a sequência, e o preto entre projetos é o corte. Cada aplicação aparece iluminada dentro da sua moldura, viva e a correr, enquanto tudo à volta se apaga para lhe dar passagem. O grão de filme sobre a página inteira não é textura decorativa — é o que impede o preto de ler como vazio digital e o faz ler como escuridão de sala.

O caráter é dramático e contrastado. Não há meios-tons na hierarquia: ou é branco puro sobre preto absoluto, ou é cinza de legenda a recuar. A tensão nasce do salto de escala entre a tipografia monumental — nomes a ocupar treze por cento da largura do ecrã — e o detalhe minúsculo dos rótulos monoespaçados a onze pixels. Densidade baixa, gestos fortes: poucos elementos por ecrã, cada um com muito espaço e muita presença.

O sistema serve uma curadoria apertada de projetos reais, para uso do próprio autor antes de qualquer visitante. Isso justifica a austeridade: não há nada a vender nem ninguém a convencer, por isso a interface pode desaparecer quase por completo.

**Key Characteristics:**
- Preto absoluto como palco, não como tema escuro
- Escala tipográfica extrema — do monumental ao minúsculo, sem degraus intermédios
- A única cor da página vem das próprias aplicações
- Grão de filme constante sobre toda a superfície
- Movimento com inércia: o scroll desliza, não salta

## Colors

Uma paleta sem matiz: preto, branco e três cinzas, com um único vermelho reservado a destruição.

### Primary
- **Branco de Projeção** (`{colors.paper}`): O acento do sistema. Texto principal, botões primários (invertidos, texto preto sobre branco), estados ativos e de foco. Funciona como acento porque é raro em área — a maior parte do ecrã é preta.

### Neutral
- **Preto de Sala** (`{colors.ink}`): O palco. Fundo de toda a página e dos painéis de sobreposição. Preto absoluto, não quase-preto.
- **Penumbra** (`{colors.surface}`): A camada imediatamente acima do palco. Fundo das molduras de preview enquanto o iframe carrega. Distingue-se do palco por um degrau tonal quase impercetível.
- **Risco de Parede** (`{colors.line}`): Todos os filetes de 1px — separadores entre projetos, contorno das molduras, bordas de campos e de rótulos.
- **Cinza de Legenda** (`{colors.mute}`): Texto secundário, descrições, tags, rótulos de metadados. Tudo o que informa sem reclamar atenção. O valor é o mais escuro que ainda cumpre 4.5:1 sobre o Preto de Sala com margem (4.89:1) — recuar mais escurece abaixo do mínimo legível.

- **Cinza de Marca de Água** (`{colors.watermark}`): Exclusivamente o contorno dos títulos gigantes decorativos (`type-outline`). Distinto do Risco de Parede por uma razão de papel: os filetes estruturam, isto sussurra. A 1.85:1 lê-se como palavra sem se impor como texto — é decoração `aria-hidden`, nunca conteúdo.

### Tertiary
- **Vermelho de Emergência** (`{colors.danger}`): Exclusivamente ações destrutivas — o botão de apagar e a sua confirmação. Nunca decorativo, nunca em estados de erro de validação suaves.

### Named Rules

**A Regra da Cor Emprestada.** O sistema não tem cor própria. Toda a cor visível na página vem dos previews das aplicações a correr. Introduzir um matiz nos elementos de interface quebra a premissa central: a sala é neutra para a obra ser vista.

**A Regra do Vermelho Único.** O Vermelho de Emergência é a única exceção à regra acima, e só em ações irreversíveis. Se aparecer em qualquer outro sítio, é erro.

## Typography

**Display Font:** Archivo Variable (com Archivo e `system-ui` como recurso)
**Body Font:** Space Grotesk (com `system-ui`)
**Label/Mono Font:** JetBrains Mono (com `ui-monospace` e Cascadia Mono)

**Character:** Uma grotesca variável levada ao extremo — peso 880, largura expandida a 125%, itálico e caixa alta — contra uma monoespaçada minúscula de tracking largo. O emparelhamento não tem meio-termo: ou grita, ou sussurra em código.

### Hierarchy
- **Display** (880, `clamp(3rem, 13vw, 12rem)`, lh 0.84): O masthead do ecrã de abertura. Uma ocorrência por página.
- **Headline** (880, `clamp(2rem, 5vw, 4.5rem)`, lh 0.84): Nome de cada projeto e títulos de painéis de sobreposição.
- **Title** (860, 1.5rem, lh 0.92): Botões primários e cabeçalhos de formulário.
- **Body** (400, 0.9375rem, lh 1.625): Descrições de projeto e texto corrido. Medida confortável até ~65ch.
- **Label** (500, 0.6875rem, tracking 0.14em, caixa alta): Rótulos monoespaçados — numeração de projetos, tags, metadados, chips de estado, botões secundários.

### Named Rules

**A Regra do Masthead Maior.** O título do ecrã de abertura é o maior texto da página. Nenhuma marca de água, título de secção ou estado vazio o pode exceder em tamanho — a hierarquia da página lê-se pela escala antes de se ler pelo conteúdo.

**A Regra dos Dois Extremos.** Entre o Headline e o Label não existe degrau intermédio no corpo da galeria. Introduzir um tamanho de conforto no meio dilui a tensão que sustenta o sistema.

**A Regra do Rótulo Monoespaçado.** Todo o metadado — números, tags, estados, datas, unidades — usa a monoespaçada em caixa alta. Nunca a fonte de corpo.

**A Regra do Piso de Contraste.** Nenhum texto desce abaixo do Cinza de Legenda sobre o Preto de Sala. Não há degrau mais recessivo: `text-mute/60`, `text-mute/80` e afins quebram o mínimo de 4.5:1. Para recuar mais, reduz-se o tamanho ou o peso, nunca o contraste.

## Layout

Contentor central de `max-w-[92rem]` com goteira de 20px que abre para 40px a partir de `sm`. O ritmo vertical é dado por secções de `64px` de padding que passam a `96px` a partir de `lg`.

O ecrã de abertura ocupa exatamente `100dvh` e não contém nada além de tipografia. A galeria é uma pilha vertical de secções por projeto, cada uma separada por um filete de 1px em Risco de Parede; em `lg` cada secção é uma grelha de duas colunas com `64px` de intervalo, e as colunas espelham-se a cada linha ímpar. Abaixo de `lg` tudo empilha numa coluna, com o preview sempre acima do texto.

Breakpoints são os do Tailwind por omissão: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px. A transição que importa é `lg` — é onde a alternância de colunas passa a existir.

Uma barra fixa no topo com a marca e o contador de projetos aparece por fade só depois do ecrã de abertura sair do viewport. Assenta sobre um véu de 96px que desce do Preto de Sala até transparente, o que a mantém em branco puro sobre qualquer preview.

## Elevation & Depth

O sistema é hoje **inteiramente plano**. Existe uma única sombra em todo o projeto — um halo branco difuso sob o botão flutuante de administração (`0 12px 40px rgba(255,255,255,0.18)`). Toda a restante profundidade vem de quatro recursos sem sombra: o degrau tonal entre Preto de Sala e Penumbra, os filetes de 1px, o `backdrop-blur` dos painéis de sobreposição, e o grão de filme a 3.5% de opacidade aplicado sobre a página inteira.

**Este estado é descritivo, não normativo.** O autor deixou explicitamente em aberto se a ausência de sombras é doutrina ou acaso. Trabalho futuro pode introduzir uma linguagem de elevação sem estar a violar o sistema — mas deve fazê-lo de forma deliberada e documentá-la aqui.

## Shapes

Raio zero em toda a interface: botões, campos, molduras de preview, painéis de sobreposição, chips e rótulos têm cantos vivos. A única exceção em todo o projeto é o ponto pulsante de 6px do chip "Live", que é um círculo perfeito.

A linguagem de forma resume-se ao retângulo e ao filete. Bordas são sempre de 1px em Risco de Parede, nunca mais grossas. As molduras de preview mantêm proporção 16:10 fixa. Não há divisórias com espessura variável, nem separadores decorativos, nem formas orgânicas.

Tal como a elevação, o raio zero é **estado observado e não invariante confirmado**.

## Components

**Filosofia:** tátil e decidido. Alvos generosos, inversões de cor nítidas no hover, resposta imediata.

> **Divergência conhecida.** A filosofia acima é a direção escolhida; a implementação atual é mais lenta e mais contida, com transições de 500–700ms e realces subtis. Fechar esta distância — encurtar as transições de estado para 150–250ms e tornar as inversões mais francas — é trabalho de refinamento por fazer, não sistema a preservar. O movimento de entrada e de scroll (0.5–1s, `cubic-bezier(0.22, 1, 0.36, 1)`) fica de fora desta redução: é coreografia, não resposta a input.

### Buttons
- **Shape:** Cantos vivos (0px).
- **Primary:** Inversão total — fundo Branco de Projeção, texto Preto de Sala, tipografia Title em itálico, padding `16px 24px`.
- **Hover / Focus:** O primário escurece para Cinza de Legenda. O foco visível é um contorno branco de 2px com 3px de afastamento, herdado do `:focus-visible` global.
- **Secondary / Ghost:** Sem fundo, filete de 1px em Risco de Parede, texto em Cinza de Legenda com tipografia Label. No hover, filete e texto passam a Branco de Projeção.

### Chips
- **Style:** Rótulo monoespaçado em Cinza de Legenda. Nas secções de projeto aparecem nus, sem contentor; nos painéis de sobreposição levam filete de 1px e padding `2px 8px`.
- **State:** O chip "Live" acrescenta fundo `Preto de Sala a 80%` com desfoque e um ponto pulsante de 6px em Branco de Projeção.

### Cards / Containers
- **Corner Style:** Cantos vivos (0px).
- **Background:** Penumbra nas molduras de preview; Preto de Sala nos painéis de sobreposição.
- **Shadow Strategy:** Nenhuma — ver Elevation & Depth.
- **Border:** Filete de 1px em Risco de Parede.
- **Internal Padding:** `24px`, a subir para `32px` a partir de `sm`.

### Inputs / Fields
- **Style:** Fundo transparente, filete de 1px em Risco de Parede, cantos vivos, padding `12px 16px`. Texto em Branco de Projeção, marcador de posição em Cinza de Legenda a 50%.
- **Focus:** O filete passa a Branco de Projeção.
- **Error:** Mensagem em Vermelho de Emergência dentro de um filete a 40% de opacidade da mesma cor.

### Navigation
Não há navegação convencional. A única persistente é a barra fixa do topo, em rótulo monoespaçado sobre um véu gradiente, que aparece por fade depois do ecrã de abertura e não é clicável. A navegação real é o próprio scroll.

**A Regra do Véu, não da Inversão.** Texto sobreposto a previews assenta sempre num véu que garante o contraste. `mix-blend-difference` está proibido nesta função: colapsa para 1:1 sobre cinzas médios, e é disso que são feitas as interfaces em modo escuro que a galeria mostra.

### Signature Component: a moldura de preview
O componente que define o sistema. Um retângulo 16:10 com filete de 1px que contém a aplicação real a correr, renderizada num viewport virtual de 1280px e escalada para o espaço disponível. Monta e desmonta conforme se aproxima do viewport, para a memória se manter constante com dezenas de entradas. Em repouso apresenta-se dessaturada e escurecida; no hover recupera cor e brilho plenos. Quando o site de destino bloqueia incorporação, a cadeia de recurso é imagem enviada e depois um monograma sobre gradiente radial.

## Do's and Don'ts

### Do:
- **Do** deixar que toda a cor da página venha dos previews — a interface fica em preto, branco e cinzas.
- **Do** usar a monoespaçada em caixa alta com tracking `0.14em` para todo o metadado: números, tags, estados, datas.
- **Do** manter o preto absoluto `#000000` como fundo. Não é um cinza-escuro de tema escuro.
- **Do** reservar o Vermelho de Emergência para ações irreversíveis, e só para essas.
- **Do** manter o grão de filme sobre a página inteira — é o que dá matéria ao preto.
- **Do** respeitar `prefers-reduced-motion`: sem inércia de scroll e sem parallax quando está ativo.

### Don't:
- **Don't** reintroduzir o amarelo-ácido `#d7ff3e` do sistema anterior, nem qualquer outra cor de acento cromática. Foi uma decisão revertida deliberadamente, não um esquecimento.
- **Don't** criar um tamanho tipográfico de conforto entre o Headline e o Label no corpo da galeria.
- **Don't** usar a fonte de corpo para rótulos, tags ou metadados.
- **Don't** engrossar filetes acima de 1px nem variar a sua cor conforme o contexto.
- **Don't** deixar que o preview de uma aplicação seja apresentado com opacidade reduzida — uma app viva a 35% lê-se como avariada, não como discreta.

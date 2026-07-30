# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

O utilizador principal é o próprio autor, André Camões. A DEV Gallery é o **índice pessoal** das aplicações que construiu: um sítio único onde as tem todas à mão e vivas.

Terceiros (recrutadores, clientes, outros programadores) podem chegar ao site por partilha de link, mas são audiência secundária — nenhuma decisão de produto foi tomada a pensar neles.

## Product Purpose

Reunir num só lugar as aplicações web que o autor construiu, cada uma apresentada a correr de verdade dentro da página, em vez de descrita por um screenshot ou por um repositório sem contexto.

Sucesso é o autor conseguir chegar a qualquer uma das suas apps a partir de um ponto único e vê-la viva, sem a ter de procurar ou de a arrancar localmente.

## Positioning

**Curadoria apertada.** Poucos projetos, escolhidos a dedo e apresentados com cuidado — o oposto de um perfil de GitHub com dezenas de repositórios sem contexto. O valor está na seleção e na apresentação, não na cobertura exaustiva.

## Operating Context

- Site estático publicado no GitHub Pages, sob a base `/DEVGallery/`, com deploy automático a cada push para `main` ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)).
- O catálogo vive num único ficheiro versionado, [src/data/apps.json](src/data/apps.json), editado à mão pelo autor.
- Cada entrada é apresentada por um preview live: um iframe da app real renderizado num viewport virtual de 1280px e escalado para o espaço disponível ([src/components/LivePreview.tsx](src/components/LivePreview.tsx)). Quando não há iframe possível, a cadeia de recurso é imagem enviada → monograma.

## Capabilities and Constraints

- **Tem de continuar estático e gratuito.** GitHub Pages, sem backend, sem base de dados, sem custos de alojamento. Qualquer solução que exija servidor está fora de âmbito.
- **O preview live depende de terceiros.** Sites que bloqueiam incorporação (`X-Frame-Options`, `frame-ancestors`) não podem ser mostrados em iframe e obrigam ao modo imagem. É uma limitação externa, não um defeito a corrigir.
- **A edição no browser é dispensável.** O fluxo de administração existente — botão Admin, token pessoal do GitHub, formulário de app, escrita via Contents API ([src/lib/github.ts](src/lib/github.ts), [src/components/TokenModal.tsx](src/components/TokenModal.tsx), [src/components/AppFormModal.tsx](src/components/AppFormModal.tsx)) — **não** é uma capacidade a preservar. O autor prefere editar o `apps.json` diretamente. Continua a funcionar hoje, mas pode ser removido sem perda de valor de produto.
- **Sem requisito de internacionalização.** A interface está escrita em português europeu (pt-PT). Não foi confirmado como compromisso vinculativo nem existe versão noutra língua prevista.

## Brand Commitments

- Nome do produto: **DEV Gallery**.
- Autor, creditado no site: **André Camões**.

Nenhum outro compromisso de identidade (logótipo, paleta, voz) foi estabelecido como vinculativo.

## Evidence on Hand

- **Os seis projetos são reais**: Missão, FretNavigator, Pedaleira, Cordoaria, Chituix e PrdMe. Os nomes e a curadoria são verdadeiros e podem ser usados.
- **Os URLs em `apps.json` ainda não são os verdadeiros.** Apontam para `vite.dev`, `react.dev`, `tailwindcss.com` e `example.com/app4..6` — são endereços de demonstração, à espera de serem ligados às apps reais.
- **Três descrições são enchimento** e não devem ser tratadas como verdade nem citadas: Cordoaria, Chituix e PrdMe têm literalmente "Descrição do App 4/5/6". A descrição de FretNavigator ("Or URL aparece aqui em tempo real…") é texto de exemplo com gralha, não uma descrição do projeto.
- **Não existem** testemunhos, métricas de utilização, número de utilizadores, prémios, imprensa ou casos de estudo. Nenhum trabalho futuro os pode inventar.
- Não existem imagens de preview: [public/previews/](public/previews/) contém apenas um `.gitkeep`. Todas as entradas dependem hoje do iframe live.

## Product Principles

1. **O índice é para uma pessoa.** Otimizar primeiro para o uso do autor; visitantes são consequência, não requisito.
2. **Curadoria acima de cobertura.** Cada entrada tem de merecer o lugar. Crescer a lista não é um objetivo.
3. **A app viva é a prova.** O que distingue esta galeria é o projeto a correr, não a sua descrição.
4. **Zero infraestrutura.** Estático, gratuito e sem dependências operacionais é uma restrição de produto, não uma limitação técnica temporária.
5. **Dados de baixo atrito.** Um ficheiro JSON versionado, editável à mão, é a fonte de verdade do catálogo.

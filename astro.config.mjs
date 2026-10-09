import { defineConfig } from 'astro/config';

// Site estático publicado em https://recioes.github.io/Esther_Recio/
export default defineConfig({
  site: 'https://recioes.github.io',
  base: '/Esther_Recio',
  trailingSlash: 'always',
  // CSP sem 'unsafe-inline': todo CSS/JS precisa sair em arquivos externos.
  build: { inlineStylesheets: 'never' },
  // Sem data: URIs (fontes/imagens pequenas ficam como arquivos).
  // O chunk do three.js passa de 500 kB, mas só é baixado sob demanda (import dinâmico).
  vite: { build: { assetsInlineLimit: 0, chunkSizeWarningLimit: 900 } },
  devToolbar: { enabled: false },
});

import { defineConfig } from 'vitest/config';

// Sem isto o Vitest esvazia os .css, inclusive com ?raw, e o teste de contraste não vê os tokens.
export default defineConfig({ test: { css: true } });

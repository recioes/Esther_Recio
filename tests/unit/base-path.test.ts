import { describe, expect, it } from 'vitest';
import { joinBase } from '../../src/lib/base-path';

describe('joinBase', () => {
  it('junta base e caminho sem barras duplicadas', () => {
    expect(joinBase('/Esther_Recio', 'media/earth.webm')).toBe('/Esther_Recio/media/earth.webm');
    expect(joinBase('/Esther_Recio/', '/en/')).toBe('/Esther_Recio/en/');
  });

  it('retorna a raiz da base quando o caminho é vazio', () => {
    expect(joinBase('/Esther_Recio/', '')).toBe('/Esther_Recio/');
  });

  it('funciona com base na raiz do domínio', () => {
    expect(joinBase('/', 'favicon.svg')).toBe('/favicon.svg');
  });
});

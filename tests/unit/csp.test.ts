import { describe, expect, it } from 'vitest';
import { CONTENT_SECURITY_POLICY } from '../../src/lib/csp';

describe('CONTENT_SECURITY_POLICY', () => {
  it('nega tudo por padrão', () => {
    expect(CONTENT_SECURITY_POLICY).toContain("default-src 'none'");
  });

  it("nunca usa 'unsafe-inline' nem 'unsafe-eval'", () => {
    expect(CONTENT_SECURITY_POLICY).not.toMatch(/unsafe-(inline|eval)/);
  });

  it('não depende de nenhuma origem externa', () => {
    expect(CONTENT_SECURITY_POLICY).not.toMatch(/https?:/);
  });

  it('bloqueia conexões, base e formulários', () => {
    expect(CONTENT_SECURITY_POLICY).toContain("connect-src 'none'");
    expect(CONTENT_SECURITY_POLICY).toContain("base-uri 'none'");
    expect(CONTENT_SECURITY_POLICY).toContain("form-action 'none'");
  });
});

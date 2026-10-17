import { describe, expect, it } from 'vitest';
import npmrc from '../../.npmrc?raw';
import pkg from '../../package.json';
import lock from '../../package-lock.json';

type LockEntry = { resolved?: string; integrity?: string; link?: boolean };
const entries = Object.entries(lock.packages as Record<string, LockEntry>).filter(
  ([path, entry]) => path !== '' && !entry.link,
);

describe('cadeia de suprimentos (npm)', () => {
  it('todo pacote do lockfile vem do registro oficial por HTTPS', () => {
    const outside = entries.filter(
      ([, entry]) => !entry.resolved?.startsWith('https://registry.npmjs.org/'),
    );
    expect(outside.map(([path]) => path)).toEqual([]);
  });

  it('todo pacote tem hash de integridade sha512', () => {
    const weak = entries.filter(([, entry]) => !entry.integrity?.startsWith('sha512-'));
    expect(weak.map(([path]) => path)).toEqual([]);
  });

  it('nenhuma dependência aponta para git, arquivo local, URL ou tag "latest"', () => {
    const all = { ...pkg.dependencies, ...pkg.devDependencies } as Record<string, string>;
    for (const [name, range] of Object.entries(all)) {
      expect(range, name).toMatch(/^\^?\d+\.\d+\.\d+$/);
    }
  });

  it('o .npmrc bloqueia scripts de instalação e fixa o registro oficial', () => {
    expect(npmrc).toMatch(/^ignore-scripts=true$/m);
    expect(npmrc).toMatch(/^registry=https:\/\/registry\.npmjs\.org\/$/m);
  });

  it('o projeto não tem hooks de instalação próprios (preinstall/postinstall/prepare)', () => {
    const scripts = Object.keys(pkg.scripts);
    expect(scripts.filter((name) => /^(pre|post)?install$|^prepare$/.test(name))).toEqual([]);
  });
});

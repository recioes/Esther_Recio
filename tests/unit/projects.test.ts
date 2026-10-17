import { describe, expect, it } from 'vitest';
import { CV, CV_CONTACT } from '../../src/data/cv';
import { PROJECTS } from '../../src/data/projects';
import { dictionaries } from '../../src/i18n';

describe('projetos em destaque', () => {
  it('apontam para repositórios públicos do GitHub da Esther, em https', () => {
    for (const project of PROJECTS) {
      const url = new URL(project.href);
      expect(url.protocol).toBe('https:');
      expect(url.hostname).toBe('github.com');
      expect(url.pathname.startsWith('/recioes/')).toBe(true);
      expect(project.tags.length).toBeGreaterThan(0);
    }
  });

  it('não repetem ids e têm texto nos três idiomas', () => {
    expect(new Set(PROJECTS.map((project) => project.id)).size).toBe(PROJECTS.length);
    for (const dict of Object.values(dictionaries)) {
      expect(Object.keys(dict.projects.items).sort()).toEqual(
        PROJECTS.map((project) => project.id).sort(),
      );
      for (const project of PROJECTS) {
        expect(dict.projects.items[project.id].summary.length, dict.locale).toBeGreaterThan(20);
      }
      expect(dict.projects.allLabel.length).toBeGreaterThan(0);
    }
  });

  it('o currículo cita os mesmos projetos', () => {
    for (const cv of Object.values(CV)) {
      expect(cv.projects).toContain('iHairCare');
      expect(cv.projects).toContain('github.com/recioes/ihaircare.backend.app');
    }
  });
});

describe('contato do currículo', () => {
  it('tem cidade e e-mail com link mailto', () => {
    const labels = CV_CONTACT.items.map((item) => item.label);
    expect(labels).toContain('Brasília, DF');
    const email = CV_CONTACT.items.find((item) => item.label.includes('@'));
    expect(email?.href).toBe(`mailto:${email?.label}`);
  });
});

describe('contador de segredos', () => {
  it('todo idioma tem o rótulo', () => {
    for (const dict of Object.values(dictionaries)) {
      expect(dict.easter.counterLabel.length).toBeGreaterThan(0);
    }
  });
});

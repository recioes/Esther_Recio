import { describe, expect, it } from 'vitest';
import { dayPeriod, formatClock } from '../../src/lib/greeting';
import { subsolarPoint, sunDirectionForDate, wrapLongitude } from '../../src/lib/sun';

describe('wrapLongitude', () => {
  it('mantém a longitude em (-180, 180]', () => {
    expect(wrapLongitude(0)).toBe(0);
    expect(wrapLongitude(190)).toBe(-170);
    expect(wrapLongitude(-190)).toBe(170);
    expect(wrapLongitude(180)).toBe(180);
    expect(wrapLongitude(-180)).toBe(180);
    expect(wrapLongitude(540)).toBe(180);
  });
});

describe('subsolarPoint', () => {
  it('ao meio-dia UTC o Sol está sobre o meridiano de Greenwich', () => {
    expect(subsolarPoint(new Date('2026-03-20T12:00:00Z')).lon).toBeCloseTo(0, 5);
  });

  it('a cada hora o ponto subsolar anda 15° para o oeste', () => {
    const noon = subsolarPoint(new Date('2026-03-20T12:00:00Z')).lon;
    const one = subsolarPoint(new Date('2026-03-20T13:00:00Z')).lon;
    expect(noon - one).toBeCloseTo(15, 5);
  });

  it('à meia-noite UTC o Sol está no lado oposto (±180°)', () => {
    expect(Math.abs(subsolarPoint(new Date('2026-03-20T00:00:00Z')).lon)).toBe(180);
  });

  it('a latitude acompanha as estações', () => {
    expect(subsolarPoint(new Date('2026-06-21T12:00:00Z')).lat).toBeGreaterThan(22.5);
    expect(subsolarPoint(new Date('2026-12-21T12:00:00Z')).lat).toBeLessThan(-22.5);
    expect(Math.abs(subsolarPoint(new Date('2026-03-20T12:00:00Z')).lat)).toBeLessThan(2);
  });
});

describe('sunDirectionForDate', () => {
  it('devolve um vetor unitário', () => {
    for (const iso of ['2026-01-01T00:00:00Z', '2026-07-15T18:30:00Z', '2026-10-14T03:10:00Z']) {
      const [x, y, z] = sunDirectionForDate(new Date(iso));
      expect(Math.hypot(x, y, z)).toBeCloseTo(1, 10);
    }
  });

  it('no equinócio ao meio-dia UTC aponta para +X (lon 0, lat ~0)', () => {
    const [x, y] = sunDirectionForDate(new Date('2026-03-20T12:00:00Z'));
    expect(x).toBeGreaterThan(0.99);
    expect(Math.abs(y)).toBeLessThan(0.05);
  });
});

describe('dayPeriod', () => {
  it('divide o dia em quatro períodos', () => {
    expect(dayPeriod(0)).toBe('dawn');
    expect(dayPeriod(4)).toBe('dawn');
    expect(dayPeriod(5)).toBe('morning');
    expect(dayPeriod(11)).toBe('morning');
    expect(dayPeriod(12)).toBe('afternoon');
    expect(dayPeriod(17)).toBe('afternoon');
    expect(dayPeriod(18)).toBe('evening');
    expect(dayPeriod(23)).toBe('evening');
  });

  it('normaliza horas fora de 0–23', () => {
    expect(dayPeriod(24)).toBe('dawn');
    expect(dayPeriod(-1)).toBe('evening');
    expect(dayPeriod(13.7)).toBe('afternoon');
  });
});

describe('formatClock', () => {
  it('usa dois dígitos', () => {
    expect(formatClock(new Date(2026, 0, 1, 3, 5))).toBe('03:05');
    expect(formatClock(new Date(2026, 0, 1, 23, 59))).toBe('23:59');
  });
});

import { describe, expect, it } from 'vitest';
import { type DayPeriod, dayPeriod, formatClock, shouldGreet } from '../../src/lib/greeting';

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

  it('cobre as 24 horas, sem lacunas nem sobreposições', () => {
    const order: DayPeriod[] = ['dawn', 'morning', 'afternoon', 'evening'];
    let previousIndex = 0;
    for (let hour = 0; hour < 24; hour += 1) {
      const index = order.indexOf(dayPeriod(hour));
      expect(index).toBeGreaterThanOrEqual(previousIndex);
      previousIndex = index;
    }
    expect(new Set(Array.from({ length: 24 }, (_, hour) => dayPeriod(hour))).size).toBe(4);
  });

  it('normaliza horas fora de 0–23', () => {
    expect(dayPeriod(24)).toBe('dawn');
    expect(dayPeriod(-1)).toBe('evening');
    expect(dayPeriod(13.7)).toBe('afternoon');
  });
});

describe('shouldGreet', () => {
  it('saúda na primeira visita da sessão', () => {
    expect(shouldGreet(null, 'morning')).toBe(true);
  });

  it('não repete no mesmo período (ex.: ao recarregar)', () => {
    expect(shouldGreet('morning', 'morning')).toBe(false);
  });

  it('saúda de novo quando o período muda', () => {
    expect(shouldGreet('morning', 'afternoon')).toBe(true);
    expect(shouldGreet('evening', 'dawn')).toBe(true);
  });
});

describe('formatClock', () => {
  it('usa dois dígitos, no horário local', () => {
    expect(formatClock(new Date(2026, 0, 1, 3, 5))).toBe('03:05');
    expect(formatClock(new Date(2026, 0, 1, 23, 59))).toBe('23:59');
  });
});

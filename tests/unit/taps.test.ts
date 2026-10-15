import { describe, expect, it } from 'vitest';
import { boostEnvelope, tapBoostMultiplier } from '../../src/lib/boost';
import { createTapCounter } from '../../src/lib/taps';

describe('createTapCounter', () => {
  it('conta toques dentro da janela', () => {
    const counter = createTapCounter(1000);
    expect([0, 400, 900, 1500].map((time) => counter.record(time))).toEqual([1, 2, 3, 4]);
  });

  it('zera quando a pausa passa da janela', () => {
    const counter = createTapCounter(1000);
    counter.record(0);
    counter.record(500);
    expect(counter.record(1600)).toBe(1);
  });

  it('reset recomeça a contagem', () => {
    const counter = createTapCounter(1000);
    counter.record(0);
    counter.record(100);
    counter.reset();
    expect(counter.record(200)).toBe(1);
  });

  it('o primeiro toque sempre vale 1, mesmo em tempo 0', () => {
    expect(createTapCounter(1000).record(0)).toBe(1);
  });
});

describe('boostEnvelope', () => {
  it('começa em 1 e termina em 0', () => {
    expect(boostEnvelope(0, 1000)).toBe(1);
    expect(boostEnvelope(1000, 1000)).toBe(0);
  });

  it('cai de forma monotônica', () => {
    const samples = [0, 200, 400, 600, 800, 999].map((time) => boostEnvelope(time, 1000));
    for (let index = 1; index < samples.length; index += 1) {
      expect(samples[index] ?? 0).toBeLessThan(samples[index - 1] ?? 0);
    }
  });

  it('é 0 antes de começar, depois de acabar ou sem duração', () => {
    expect(boostEnvelope(-5, 1000)).toBe(0);
    expect(boostEnvelope(2000, 1000)).toBe(0);
    expect(boostEnvelope(10, 0)).toBe(0);
  });
});

describe('tapBoostMultiplier', () => {
  it('cresce a cada toque e respeita o teto', () => {
    expect(tapBoostMultiplier(0)).toBe(1);
    expect(tapBoostMultiplier(1)).toBeGreaterThan(tapBoostMultiplier(0));
    expect(tapBoostMultiplier(100)).toBe(14);
    expect(tapBoostMultiplier(-3)).toBe(1);
  });
});

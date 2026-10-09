/** PRNG determinístico (mulberry32): o céu estrelado é sempre o mesmo. */
export function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Posições (x, y, z) distribuídas uniformemente numa casca esférica. */
export function starPositions(
  count: number,
  rng: () => number,
  minRadius: number,
  maxRadius: number,
): Float32Array {
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index++) {
    const z = rng() * 2 - 1;
    const angle = rng() * Math.PI * 2;
    const ring = Math.sqrt(1 - z * z);
    const radius = minRadius + rng() * (maxRadius - minRadius);
    positions[index * 3] = ring * Math.cos(angle) * radius;
    positions[index * 3 + 1] = ring * Math.sin(angle) * radius;
    positions[index * 3 + 2] = z * radius;
  }
  return positions;
}

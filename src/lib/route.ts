export interface RoutePoint {
  readonly x: number;
  readonly y: number;
}

/** Curvas em S alternadas ligando as estações: o traço serpenteia em vez de descer reto. */
export function buildRoutePath(points: readonly RoutePoint[], amplitude: number): string {
  const [first, ...rest] = points;
  if (!first) return '';

  let previous = first;
  const segments = rest.map((point, index) => {
    const bulge = (index % 2 === 0 ? 1 : -1) * amplitude;
    const height = point.y - previous.y;
    const curve = `C ${previous.x + bulge} ${previous.y + height / 3} ${point.x + bulge} ${previous.y + (2 * height) / 3} ${point.x} ${point.y}`;
    previous = point;
    return curve;
  });
  return [`M ${first.x} ${first.y}`, ...segments].join(' ');
}

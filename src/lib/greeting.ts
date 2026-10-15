export type DayPeriod = 'dawn' | 'morning' | 'afternoon' | 'evening';

/** Madrugada 0–5h, manhã 5–12h, tarde 12–18h, noite 18–24h. */
export function dayPeriod(hour: number): DayPeriod {
  const h = ((Math.floor(hour) % 24) + 24) % 24;
  if (h < 5) return 'dawn';
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

export function formatClock(date: Date): string {
  const pad = (value: number): string => String(value).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Saúda se ainda não saudou neste período (`lastGreeted` vem do armazenamento da sessão). */
export function shouldGreet(lastGreeted: string | null, current: DayPeriod): boolean {
  return lastGreeted !== current;
}

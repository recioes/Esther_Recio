import type { YearMonth } from '../data/types';

function parseYearMonth(value: YearMonth): Date {
  const [year, month] = value.split('-').map(Number);
  return new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, 1));
}

/** "jun 2024" (pt/es em minúsculas, en capitalizado), sem ponto de abreviação. */
export function formatMonth(value: YearMonth, locale: string): string {
  const date = parseYearMonth(value);
  const month = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' })
    .format(date)
    .replace(/\.$/, '');
  return `${month} ${date.getUTCFullYear()}`;
}

/** "jun 2024 — atual" ou "ago 2023 — jun 2024". */
export function formatPeriod(
  start: YearMonth,
  end: YearMonth | undefined,
  locale: string,
  presentLabel: string,
): string {
  return `${formatMonth(start, locale)} — ${end ? formatMonth(end, locale) : presentLabel}`;
}

/** "24 de maio de 2021" / "May 24, 2021" / "24 de mayo de 2021". */
export function formatFullDate(value: `${number}-${number}-${number}`, locale: string): string {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1));
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

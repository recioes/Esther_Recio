export const THEMES = ['aurora', 'neptune', 'terminal'] as const;
export type ThemeId = (typeof THEMES)[number];

/** Cores do globo para cada tema (atmosfera e crepúsculo). */
export const THEME_GLOBE: Readonly<Record<ThemeId, { glow: number; twilight: number }>> = {
  aurora: { glow: 0x56c7d9, twilight: 0xff9a66 },
  neptune: { glow: 0x4cc9ff, twilight: 0x7c9cff },
  terminal: { glow: 0x22c55e, twilight: 0x4ade80 },
};

export function nextTheme(current: ThemeId): ThemeId {
  const index = THEMES.indexOf(current);
  return THEMES[(index + 1) % THEMES.length] ?? 'aurora';
}

export function isThemeId(value: string | undefined): value is ThemeId {
  return THEMES.some((theme) => theme === value);
}

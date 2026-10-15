export const THEMES = ['aurora', 'sunset', 'terminal'] as const;
export type ThemeId = (typeof THEMES)[number];

/** Cores do globo para cada tema (atmosfera e crepúsculo). */
export const THEME_GLOBE: Readonly<Record<ThemeId, { glow: number; twilight: number }>> = {
  aurora: { glow: 0x8b5cf6, twilight: 0xec4899 },
  sunset: { glow: 0xf97316, twilight: 0xfb7185 },
  terminal: { glow: 0x22c55e, twilight: 0x4ade80 },
};

export function nextTheme(current: ThemeId): ThemeId {
  const index = THEMES.indexOf(current);
  return THEMES[(index + 1) % THEMES.length] ?? 'aurora';
}

export function isThemeId(value: string | undefined): value is ThemeId {
  return THEMES.some((theme) => theme === value);
}

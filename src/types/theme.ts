export type AccentTheme = 'default' | 'ocean' | 'forest' | 'sunset' | 'rose';

export interface ThemeConfig {
  mode: 'light' | 'dark';
  accent: AccentTheme;
}

export const ACCENT_THEMES: Record<AccentTheme, { name: string; color: string }> = {
  default: { name: 'Purple', color: 'hsl(262.1, 83.3%, 57.8%)' },
  ocean: { name: 'Ocean', color: 'hsl(200, 95%, 40%)' },
  forest: { name: 'Forest', color: 'hsl(142, 76%, 36%)' },
  sunset: { name: 'Sunset', color: 'hsl(25, 95%, 53%)' },
  rose: { name: 'Rose', color: 'hsl(330, 81%, 60%)' },
};
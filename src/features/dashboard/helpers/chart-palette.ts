export const DASHBOARD_CHART_COLORS = {
  indigo: '#4F46E5',
  indigoFill: 'rgba(79, 70, 229, 0.12)',
  cyan: '#0891B2',
  emerald: '#059669',
  amber: '#D97706',
  rose: '#E11D48',
  violet: '#7C3AED',
} as const;

export const DASHBOARD_CATEGORY_COLORS = [
  DASHBOARD_CHART_COLORS.indigo,
  DASHBOARD_CHART_COLORS.cyan,
  DASHBOARD_CHART_COLORS.emerald,
  DASHBOARD_CHART_COLORS.amber,
  DASHBOARD_CHART_COLORS.rose,
  DASHBOARD_CHART_COLORS.violet,
] as const;

/**
 * Equivalentes para fondo oscuro: los tonos 600 pierden contraste sobre la
 * superficie oscura (#111827), así que se sube a los 400 de cada familia.
 */
const DARK_EQUIVALENTS: Record<string, string> = {
  [DASHBOARD_CHART_COLORS.indigo]: '#818CF8',
  [DASHBOARD_CHART_COLORS.indigoFill]: 'rgba(129, 140, 248, 0.18)',
  [DASHBOARD_CHART_COLORS.cyan]: '#22D3EE',
  [DASHBOARD_CHART_COLORS.emerald]: '#34D399',
  [DASHBOARD_CHART_COLORS.amber]: '#FBBF24',
  [DASHBOARD_CHART_COLORS.rose]: '#FB7185',
  [DASHBOARD_CHART_COLORS.violet]: '#A78BFA',
};

export function toThemeChartColor<T>(color: T, dark: boolean): T {
  if (!dark) return color;
  if (typeof color === 'string') return (DARK_EQUIVALENTS[color] ?? color) as T;
  if (Array.isArray(color)) return color.map((item) => toThemeChartColor(item, dark)) as T;
  return color;
}

export const CHART_THEME = {
  light: { text: '#6B7280', grid: 'rgba(17, 24, 39, 0.08)', surface: '#FFFFFF' },
  dark: { text: '#94A3B8', grid: 'rgba(148, 163, 184, 0.16)', surface: '#111827' },
} as const;

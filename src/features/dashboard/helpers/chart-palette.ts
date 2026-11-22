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

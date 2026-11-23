'use client';

/**
 * Wrapper de Chart.js con registro de módulos.
 * Importar SIEMPRE vía next/dynamic para mantener chart.js (~200KB)
 * fuera del bundle inicial del dashboard.
 */
import type { ChartData, ChartType } from "chart.js";
import { Bar as BarBase, Line as LineBase, Pie as PieBase, type ChartProps } from "react-chartjs-2";
import { useIsDarkTheme } from "@/lib/theme";
import { CHART_THEME, toThemeChartColor } from "@/features/dashboard/helpers/chart-palette";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Colors,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Colors,
  Filler
);

type Props<T extends ChartType> = Omit<ChartProps<T>, 'type'>;

const COLOR_KEYS = ['backgroundColor', 'borderColor', 'pointBackgroundColor', 'pointBorderColor'] as const;

function themeData<T extends ChartType>(data: ChartData<T>, dark: boolean): ChartData<T> {
  if (!dark) return data;
  return {
    ...data,
    datasets: data.datasets.map((dataset) => {
      const next: Record<string, unknown> = { ...dataset };
      for (const key of COLOR_KEYS) {
        if (key in next) next[key] = toThemeChartColor(next[key], true);
      }
      return next as typeof dataset;
    }),
  };
}

/*
 * Chart.js lee los colores de ejes y rejilla de sus defaults al crear el
 * gráfico, así que se fijan antes de pintar y la key fuerza a recrearlo
 * cuando cambia el tema; sin eso el texto de los ejes quedaría ilegible.
 */
function useChartTheme(): boolean {
  const dark = useIsDarkTheme();
  const theme = dark ? CHART_THEME.dark : CHART_THEME.light;
  ChartJS.defaults.color = theme.text;
  ChartJS.defaults.borderColor = theme.grid;
  ChartJS.defaults.elements.arc.borderColor = theme.surface;
  return dark;
}

function ThemedLine(props: Readonly<Props<'line'>>) {
  const dark = useChartTheme();
  return <LineBase key={dark ? 'dark' : 'light'} {...props} data={themeData(props.data, dark)} />;
}

function ThemedBar(props: Readonly<Props<'bar'>>) {
  const dark = useChartTheme();
  return <BarBase key={dark ? 'dark' : 'light'} {...props} data={themeData(props.data, dark)} />;
}

function ThemedPie(props: Readonly<Props<'pie'>>) {
  const dark = useChartTheme();
  return <PieBase key={dark ? 'dark' : 'light'} {...props} data={themeData(props.data, dark)} />;
}

// Se conserva la firma genérica de react-chartjs-2 para no endurecer los tipos de quien los usa.
export const Line = ThemedLine as unknown as typeof LineBase;
export const Bar = ThemedBar as unknown as typeof BarBase;
export const Pie = ThemedPie as unknown as typeof PieBase;

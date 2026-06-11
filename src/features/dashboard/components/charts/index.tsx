'use client';

/**
 * Wrapper de Chart.js con registro de módulos.
 * Importar SIEMPRE vía next/dynamic para mantener chart.js (~200KB)
 * fuera del bundle inicial del dashboard.
 */
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Colors,
  Filler,
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

export { Line, Bar, Pie } from "react-chartjs-2";

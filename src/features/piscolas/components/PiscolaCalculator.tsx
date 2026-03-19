'use client';

import { useMemo, useState } from 'react';
import { Calculator, BottleWine, ShoppingCart, Users, Coins, RefreshCcw } from 'lucide-react';

const colaBottleOptions = [1, 1.5, 2, 2.5, 3] as const;
const piscoBottleOptions = [0.7, 0.75, 1, 1.5] as const;

function formatLiters(value: number): string {
  return `${value.toFixed(value % 1 === 0 ? 0 : 2)} L`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value);
}

function ceilBottles(totalLiters: number, bottleSizeLiters: number): number {
  return Math.ceil(totalLiters / bottleSizeLiters);
}

export default function PiscolaCalculator() {
  const [people, setPeople] = useState(10);
  const [piscolasPerPerson, setPiscolasPerPerson] = useState(3);
  const [piscoPerDrinkMl, setPiscoPerDrinkMl] = useState(60);
  const [colaPerDrinkMl, setColaPerDrinkMl] = useState(150);
  const [extraMargin, setExtraMargin] = useState(10);
  const [colaBottleSize, setColaBottleSize] = useState(1.5);
  const [piscoBottleSize, setPiscoBottleSize] = useState(0.75);
  const [colaBottlePrice, setColaBottlePrice] = useState(2490);
  const [piscoBottlePrice, setPiscoBottlePrice] = useState(6990);
  const [selectedPreset, setSelectedPreset] = useState<'suave' | 'tipica' | 'cargada' | 'personalizada'>('tipica');

  const calculations = useMemo(() => {
    const totalDrinks = people * piscolasPerPerson;
    const multiplier = 1 + extraMargin / 100;

    const totalPiscoLiters = (totalDrinks * piscoPerDrinkMl * multiplier) / 1000;
    const totalColaLiters = (totalDrinks * colaPerDrinkMl * multiplier) / 1000;

    const piscoBottles = ceilBottles(totalPiscoLiters, piscoBottleSize);
    const colaBottles = ceilBottles(totalColaLiters, colaBottleSize);

    const piscoTotal = piscoBottles * piscoBottlePrice;
    const colaTotal = colaBottles * colaBottlePrice;
    const totalBudget = piscoTotal + colaTotal;

    return {
      totalDrinks,
      totalPiscoLiters,
      totalColaLiters,
      piscoBottles,
      colaBottles,
      piscoTotal,
      colaTotal,
      totalBudget,
      costPerPerson: people > 0 ? totalBudget / people : 0,
      costPerDrink: totalDrinks > 0 ? totalBudget / totalDrinks : 0,
      ratio: `1 : ${(colaPerDrinkMl / piscoPerDrinkMl).toFixed(2)}`,
    };
  }, [people, piscolasPerPerson, piscoPerDrinkMl, colaPerDrinkMl, extraMargin, colaBottleSize, piscoBottleSize, colaBottlePrice, piscoBottlePrice]);

  function resetValues() {
    setPeople(10);
    setPiscolasPerPerson(3);
    setPiscoPerDrinkMl(60);
    setColaPerDrinkMl(150);
    setExtraMargin(10);
    setColaBottleSize(1.5);
    setPiscoBottleSize(0.75);
    setColaBottlePrice(2490);
    setPiscoBottlePrice(6990);
    setSelectedPreset('tipica');
  }

  function applyPreset(type: 'suave' | 'tipica' | 'cargada') {
    setSelectedPreset(type);

    if (type === 'suave') {
      setPiscoPerDrinkMl(50);
      setColaPerDrinkMl(170);
      return;
    }

    if (type === 'tipica') {
      setPiscoPerDrinkMl(60);
      setColaPerDrinkMl(150);
      return;
    }

    setPiscoPerDrinkMl(70);
    setColaPerDrinkMl(140);
  }

  function getPresetButtonClass(type: 'suave' | 'tipica' | 'cargada') {
    const isActive = selectedPreset === type;

    return [
      'rounded-xl px-4 py-2 text-sm font-medium transition cursor-pointer border',
      isActive
        ? 'border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm'
        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
    ].join(' ');
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
            <Calculator className="h-4 w-4" />
            
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Calculadora de Piscolas</h1>
          <p className="mt-3 max-w-3xl text-base text-gray-600">
            Calcula cuántas botellas de Coca-Cola y pisco necesitas para una junta.
          </p>
        </div>

        <button
          type="button"
          onClick={resetValues}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 cursor-pointer"
        >
          <RefreshCcw className="h-4 w-4" />
          Restablecer
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <Users className="h-4 w-4" />
                Cantidad de personas
              </span>
              <input
                type="number"
                min={1}
                value={people}
                onChange={(e) => setPeople(Math.max(1, Number(e.target.value) || 1))}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">Piscolas por persona</span>
              <input
                type="number"
                min={1}
                value={piscolasPerPerson}
                onChange={(e) => setPiscolasPerPerson(Math.max(1, Number(e.target.value) || 1))}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">Pisco por vaso (ml)</span>
              <input
                type="number"
                min={30}
                step={5}
                value={piscoPerDrinkMl}
                onChange={(e) => {
                  setPiscoPerDrinkMl(Math.max(30, Number(e.target.value) || 30));
                  setSelectedPreset('personalizada');
                }}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">Coca-Cola por vaso (ml)</span>
              <input
                type="number"
                min={90}
                step={10}
                value={colaPerDrinkMl}
                onChange={(e) => {
                  setColaPerDrinkMl(Math.max(90, Number(e.target.value) || 90));
                  setSelectedPreset('personalizada');
                }}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">Tamaño botella Coca-Cola</span>
              <select
                value={colaBottleSize}
                onChange={(e) => setColaBottleSize(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500"
              >
                {colaBottleOptions.map((option) => (
                  <option key={option} value={option}>{formatLiters(option)}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">Tamaño botella pisco</span>
              <select
                value={piscoBottleSize}
                onChange={(e) => setPiscoBottleSize(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500"
              >
                {piscoBottleOptions.map((option) => (
                  <option key={option} value={option}>{formatLiters(option)}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <Coins className="h-4 w-4" />
                Precio botella Coca-Cola (CLP)
              </span>
              <input
                type="number"
                min={0}
                step={100}
                value={colaBottlePrice}
                onChange={(e) => setColaBottlePrice(Math.max(0, Number(e.target.value) || 0))}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <Coins className="h-4 w-4" />
                Precio botella pisco (CLP)
              </span>
              <input
                type="number"
                min={0}
                step={100}
                value={piscoBottlePrice}
                onChange={(e) => setPiscoBottlePrice(Math.max(0, Number(e.target.value) || 0))}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500"
              />
            </label>
          </div>

          <div className="mt-6 rounded-2xl bg-gray-50 p-4">
            <div className="mb-2 flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-gray-700">Margen extra por hielo, derrame o consumo adicional</span>
              <span className="text-sm font-semibold text-indigo-700">{extraMargin}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              step={5}
              value={extraMargin}
              onChange={(e) => setExtraMargin(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => applyPreset('suave')} className={getPresetButtonClass('suave')}>Suave</button>
            <button type="button" onClick={() => applyPreset('tipica')} className={getPresetButtonClass('tipica')}>Precisa</button>
            <button type="button" onClick={() => applyPreset('cargada')} className={getPresetButtonClass('cargada')}>Cargada</button>
            {selectedPreset === 'personalizada' && (
              <span className="inline-flex items-center rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
                Receta personalizada
              </span>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl bg-gray-900 p-6 text-white shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gray-300">Presupuesto total estimado</p>
                <p className="mt-2 text-4xl font-bold">{formatCurrency(calculations.totalBudget)}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-gray-300" />
            </div>
            <div className="mt-6 grid gap-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                <span>Costo por persona</span>
                <span className="font-semibold">{formatCurrency(calculations.costPerPerson)}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                <span>Costo por piscola</span>
                <span className="font-semibold">{formatCurrency(calculations.costPerDrink)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Compra sugerida</h2>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-indigo-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-indigo-700">Botellas de pisco</p>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{calculations.piscoBottles}</p>
                  </div>
                  <BottleWine className="h-8 w-8 text-indigo-700" />
                </div>
                <p className="mt-3 text-sm text-gray-600">{formatLiters(piscoBottleSize)} c/u · {formatCurrency(calculations.piscoTotal)} total</p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Botellas de Coca-Cola</p>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{calculations.colaBottles}</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-gray-500" />
                </div>
                <p className="mt-3 text-sm text-gray-600">{formatLiters(colaBottleSize)} c/u · {formatCurrency(calculations.colaTotal)} total</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Detalle</h2>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"><span className="text-gray-600">Total de piscolas</span><span className="font-semibold text-gray-900">{calculations.totalDrinks}</span></div>
              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"><span className="text-gray-600">Pisco total</span><span className="font-semibold text-gray-900">{calculations.totalPiscoLiters.toFixed(2)} L</span></div>
              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"><span className="text-gray-600">Coca-Cola total</span><span className="font-semibold text-gray-900">{calculations.totalColaLiters.toFixed(2)} L</span></div>
              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"><span className="text-gray-600">Proporción</span><span className="font-semibold text-gray-900">{calculations.ratio}</span></div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

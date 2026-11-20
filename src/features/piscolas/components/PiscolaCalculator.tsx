'use client';

import { useMemo, useState } from 'react';
import { useNumberField } from '@/features/piscolas/hooks/useNumberField';
import { BottleWine, Calculator, Coins, RefreshCcw, ShoppingCart, Users } from 'lucide-react';
import { useFormatter, useLocale, useTranslations } from 'next-intl';

const colaBottleOptions = [1, 1.5, 2, 2.5, 3] as const;
const piscoBottleOptions = [0.7, 0.75, 1, 1.5] as const;

function ceilBottles(totalLiters: number, bottleSizeLiters: number): number {
  return Math.ceil(totalLiters / bottleSizeLiters);
}

export default function PiscolaCalculator() {
  const t = useTranslations('Piscolas');
  const format = useFormatter();
  const locale = useLocale();
  const formatLiters = (value: number) => `${format.number(value, { maximumFractionDigits: 2 })} L`;
  const formatCurrency = (value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
  const people = useNumberField(10, 1);
  const piscolasPerPerson = useNumberField(3, 1);
  const piscoPerDrinkMl = useNumberField(60, 30);
  const colaPerDrinkMl = useNumberField(150, 90);
  const [extraMargin, setExtraMargin] = useState(10);
  const [colaBottleSize, setColaBottleSize] = useState(1.5);
  const [piscoBottleSize, setPiscoBottleSize] = useState(0.75);
  const colaBottlePrice = useNumberField(2490, 0);
  const piscoBottlePrice = useNumberField(6990, 0);
  const [selectedPreset, setSelectedPreset] = useState<'suave' | 'tipica' | 'cargada' | 'personalizada'>('tipica');

  const calculations = useMemo(() => {
    const totalDrinks = people.value * piscolasPerPerson.value;
    const multiplier = 1 + extraMargin / 100;

    const totalPiscoLiters = (totalDrinks * piscoPerDrinkMl.value * multiplier) / 1000;
    const totalColaLiters = (totalDrinks * colaPerDrinkMl.value * multiplier) / 1000;

    const piscoBottles = ceilBottles(totalPiscoLiters, piscoBottleSize);
    const colaBottles = ceilBottles(totalColaLiters, colaBottleSize);

    const piscoTotal = piscoBottles * piscoBottlePrice.value;
    const colaTotal = colaBottles * colaBottlePrice.value;
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
      costPerPerson: people.value > 0 ? totalBudget / people.value : 0,
      costPerDrink: totalDrinks > 0 ? totalBudget / totalDrinks : 0,
      ratio: `1 : ${(colaPerDrinkMl.value / piscoPerDrinkMl.value).toFixed(2)}`,
    };
  }, [people.value, piscolasPerPerson.value, piscoPerDrinkMl.value, colaPerDrinkMl.value, extraMargin, colaBottleSize, piscoBottleSize, colaBottlePrice.value, piscoBottlePrice.value]);

  function resetValues() {
    people.set(10);
    piscolasPerPerson.set(3);
    piscoPerDrinkMl.set(60);
    colaPerDrinkMl.set(150);
    setExtraMargin(10);
    setColaBottleSize(1.5);
    setPiscoBottleSize(0.75);
    colaBottlePrice.set(2490);
    piscoBottlePrice.set(6990);
    setSelectedPreset('tipica');
  }

  function applyPreset(type: 'suave' | 'tipica' | 'cargada') {
    setSelectedPreset(type);

    if (type === 'suave') {
      piscoPerDrinkMl.set(50);
      colaPerDrinkMl.set(170);
      return;
    }

    if (type === 'tipica') {
      piscoPerDrinkMl.set(60);
      colaPerDrinkMl.set(150);
      return;
    }

    piscoPerDrinkMl.set(70);
    colaPerDrinkMl.set(140);
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
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">{t('title')}</h1>
          <p className="mt-3 max-w-3xl text-base text-gray-600">
            {t('intro')}
          </p>
        </div>

        <button
          type="button"
          onClick={resetValues}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 cursor-pointer"
        >
          <RefreshCcw className="h-4 w-4" />
          {t('reset')}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
  <div className="mb-6">
    <span className="mb-2 block text-sm font-medium text-gray-700">{t('presetLabel')}</span>

    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => applyPreset('suave')}
        className={getPresetButtonClass('suave')}
      >
        {t('mild')}
      </button>

      <button
        type="button"
        onClick={() => applyPreset('tipica')}
        className={getPresetButtonClass('tipica')}
      >
        {t('typical')}
      </button>

      <button
        type="button"
        onClick={() => applyPreset('cargada')}
        className={getPresetButtonClass('cargada')}
      >
        {t('strong')}
      </button>

      {selectedPreset === 'personalizada' && (
        <span className="inline-flex items-center rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
          {t('custom')}
        </span>
      )}
    </div>

    <p className="mt-3 text-sm text-gray-500">
      {t('presetHelp')}
    </p>
  </div>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <Users className="h-4 w-4" />
                {t('people')}
              </span>
              <input
                type="number"
                min={1}
                {...people.inputProps}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">{t('perPerson')}</span>
              <input
                type="number"
                min={1}
                {...piscolasPerPerson.inputProps}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">{t('piscoPerDrink')}</span>
              <input
                type="number"
                min={30}
                step={5}
                {...piscoPerDrinkMl.inputProps}
                onChange={(e) => {
                  piscoPerDrinkMl.inputProps.onChange(e);
                  setSelectedPreset('personalizada');
                }}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">{t('colaPerDrink')}</span>
              <input
                type="number"
                min={90}
                step={10}
                {...colaPerDrinkMl.inputProps}
                onChange={(e) => {
                  colaPerDrinkMl.inputProps.onChange(e);
                  setSelectedPreset('personalizada');
                }}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">{t('colaSize')}</span>
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
              <span className="mb-2 block text-sm font-medium text-gray-700">{t('piscoSize')}</span>
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
                {t('colaPrice')}
              </span>
              <input
                type="number"
                min={0}
                step={100}
                {...colaBottlePrice.inputProps}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <Coins className="h-4 w-4" />
                {t('piscoPrice')}
              </span>
              <input
                type="number"
                min={0}
                step={100}
                {...piscoBottlePrice.inputProps}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500"
              />
            </label>
          </div>

             <div className="mt-6 rounded-2xl bg-gray-50 p-4">
            <div className="mb-2 flex items-center justify-between gap-4">
              <label htmlFor="extra-margin" className="text-sm font-medium text-gray-700">{t('margin')}</label>
              <span className="text-sm font-semibold text-indigo-700">{extraMargin}%</span>
            </div>
            <input
              type="range"
              id="extra-margin"
              min={0}
              max={30}
              step={5}
              value={extraMargin}
              onChange={(e) => setExtraMargin(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl bg-gray-900 p-6 text-white shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gray-300">{t('budget')}</p>
                <p className="mt-2 text-4xl font-bold">{formatCurrency(calculations.totalBudget)}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-gray-300" />
            </div>
            <div className="mt-6 grid gap-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                <span>{t('costPerson')}</span>
                <span className="font-semibold">{formatCurrency(calculations.costPerPerson)}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                <span>{t('costDrink')}</span>
                <span className="font-semibold">{formatCurrency(calculations.costPerDrink)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">{t('shopping')}</h2>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-indigo-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-indigo-700">{t('piscoBottles')}</p>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{calculations.piscoBottles}</p>
                  </div>
                  <BottleWine className="h-8 w-8 text-indigo-700" />
                </div>
                <p className="mt-3 text-sm text-gray-600">{t('bottleSummary', { size: formatLiters(piscoBottleSize), total: formatCurrency(calculations.piscoTotal) })}</p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-600">{t('colaBottles')}</p>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{calculations.colaBottles}</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-gray-500" />
                </div>
                <p className="mt-3 text-sm text-gray-600">{t('bottleSummary', { size: formatLiters(colaBottleSize), total: formatCurrency(calculations.colaTotal) })}</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">{t('details')}</h2>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"><span className="text-gray-600">{t('totalDrinks')}</span><span className="font-semibold text-gray-900">{format.number(calculations.totalDrinks)}</span></div>
              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"><span className="text-gray-600">{t('totalPisco')}</span><span className="font-semibold text-gray-900">{formatLiters(calculations.totalPiscoLiters)}</span></div>
              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"><span className="text-gray-600">{t('totalCola')}</span><span className="font-semibold text-gray-900">{formatLiters(calculations.totalColaLiters)}</span></div>
              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"><span className="text-gray-600">{t('ratio')}</span><span className="font-semibold text-gray-900">{calculations.ratio}</span></div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

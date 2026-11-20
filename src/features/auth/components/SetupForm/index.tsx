'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { getCountryOptions, getTimeZoneOptions, isTimeZone } from "@/features/auth/setup-options";

type Props = {
  next: string;
  mode?: 'setup' | 'settings';
  initialFullName: string;
  initialTeamName: string | null;
  initialCountry: string;
  initialTimezone: string;
};

type Option = { value: string; label: string };

function SearchableSelect({
  id, label, value, options, onChange, disabled,
}: {
  id: string;
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  const [query, setQuery] = useState('');
  const filtered = query.trim()
    ? options.filter((option) => `${option.label} ${option.value}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
    : options;
  return (
    <div className="relative">
      <label htmlFor={id} className="block text-sm font-medium mb-2">{label}</label>
      <Combobox value={value} disabled={disabled} onChange={(selected: string | null) => onChange(selected ?? '')} onClose={() => setQuery('')}>
        <ComboboxInput id={id} className="w-full border border-gray-300 rounded-lg p-3"
          displayValue={(selected: string) => options.find((option) => option.value === selected)?.label ?? ''}
          onChange={(event) => {
            setQuery(event.target.value);
            if (!event.target.value) onChange('');
          }} />
        <ComboboxOptions anchor="bottom" className="z-50 max-h-60 w-(--input-width) overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {filtered.map((option) => (
            <ComboboxOption key={option.value} value={option.value} className="cursor-pointer p-2 data-focus:bg-indigo-100">
              {option.label}
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>
    </div>
  );
}

export default function SetupForm({ next, mode = 'setup', initialFullName, initialTeamName, initialCountry, initialTimezone }: Props) {
  const router = useRouter();
  const t = useTranslations('Setup');
  const locale = useLocale();
  const [fullName, setFullName] = useState(initialFullName);
  const [name, setName] = useState(() => initialTeamName ?? (initialFullName ? t('defaultTeamName', { name: initialFullName.slice(0, 85) }) : ''));
  const [teamNameEdited, setTeamNameEdited] = useState(initialTeamName !== null);
  const [country, setCountry] = useState(initialCountry);
  const [timezone, setTimezone] = useState(initialTimezone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [hasTeam, setHasTeam] = useState(initialTeamName !== null);
  const countries = useMemo(() => getCountryOptions(locale), [locale]);
  const timezones = useMemo(() => getTimeZoneOptions(timezone), [timezone]);

  useEffect(() => {
    if (mode === 'setup' && !initialTimezone) {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected && isTimeZone(detected)) setTimezone(detected);
    }
  }, [initialTimezone, mode]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSaved(false);
    try {
      const response = await fetch('/api/v1/teams/personal', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, fullName, country: country || null, timezone: timezone || null }),
      });
      if (!response.ok) {
        setError(t('saveError'));
        return;
      }
      if (mode === 'settings') {
        setHasTeam(true);
        setTeamNameEdited(true);
        setSaved(true);
      } else {
        router.push(next);
      }
      router.refresh();
    } catch {
      setError(t('networkError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col w-full md:w-1/2 mx-auto p-8 bg-white rounded-2xl shadow-xl">
      <h1 className="text-3xl font-bold text-gray-600">{t(mode === 'settings' ? 'settingsTitle' : 'title')}</h1>
      <p className="mt-3 text-gray-600">{t(mode === 'settings' ? 'settingsDescription' : 'description')}</p>
      {mode === 'settings' && !hasTeam && <p className="mt-3 text-gray-600">{t('teamWillBeCreated')}</p>}
      <form className="flex flex-col gap-4 mt-6" onSubmit={submit} onChange={() => setSaved(false)}>
        <label htmlFor="full-name" className="text-sm font-medium">{t('fullName')}</label>
        <input id="full-name" value={fullName} onChange={(event) => {
          const value = event.target.value;
          setFullName(value);
          if (!teamNameEdited) setName(value.trim() ? t('defaultTeamName', { name: value.trim().slice(0, 85) }) : '');
        }} required maxLength={200} disabled={loading} autoComplete="name"
          className="border border-gray-300 rounded-lg p-3" />
        <label htmlFor="team-name" className="text-sm font-medium">{t('teamName')}</label>
        <input id="team-name" value={name} onChange={(event) => {
          setTeamNameEdited(true);
          setName(event.target.value);
        }} required maxLength={100} disabled={loading}
          className="border border-gray-300 rounded-lg p-3" />
        <SearchableSelect id="country" label={t('country')} value={country} options={countries} disabled={loading} onChange={(value) => { setCountry(value); setSaved(false); }} />
        <SearchableSelect id="timezone" label={t('timezone')} value={timezone} options={timezones} disabled={loading} onChange={(value) => { setTimezone(value); setSaved(false); }} />
        {error && <p role="alert" className="text-red-700">{error}</p>}
        {saved && <p role="status" className="text-green-700">{t('saved')}</p>}
        <button type="submit" disabled={loading} className="rounded-lg bg-indigo-600 p-3 text-white">{t(mode === 'settings' ? 'save' : 'continue')}</button>
        {mode === 'setup' && <button type="button" disabled={loading} onClick={() => router.push(next)}
          className="text-indigo-600">{t('skip')}</button>}
      </form>
    </div>
  );
}

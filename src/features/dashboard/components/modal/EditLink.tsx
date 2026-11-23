import { UserUrlStats } from "@/features/dashboard/types/types";
import { Button, Field, Fieldset, Input, Label } from "@headlessui/react";
import React, { type ChangeEvent, useActionState, useEffect, useState } from "react";
import Form from "next/form";
import { updateLinkAction, type LinkEditState } from "@/features/dashboard/actions/edit_link.actions";
import { useRefreshStats } from "@/features/dashboard/hooks/useStatsCommon";
import { ALIAS_MAX_LENGTH, isValidAlias } from "@/lib/short-links/alias";
import {UtmFields} from "@/features/short_links/components/UtmFields";
import { isValidUtmValue, sanitizeUtmValue } from "@/lib/short-links/destination";

interface Props {
  link: UserUrlStats;
  t: ReturnType<typeof import("next-intl").useTranslations>;
  onClose: () => void;
}

const INPUT_CLASS = `mt-1 block w-full rounded-md border border-gray-300 bg-surface px-3 py-2 text-sm
  focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none
  data-[invalid]:border-red-500`;

export default function EditLink({ link, t, onClose }: Readonly<Props>) {
  const initialState: LinkEditState = {
    link_id: link.link_id,
    slug: link.slug,
    alias: link.alias ?? '',
    destination: link.destination,
    utm: {
      source: link.utm_source,
      campaign: link.utm_campaign,
      medium: link.utm_medium
    }
  };

  const [state, formAction, isPending] = useActionState(updateLinkAction, initialState);

  const refreshStats = useRefreshStats();

  useEffect(() => {
    if (state?.success !== true) return;
    void refreshStats().then(onClose);
    // Sólo debe dispararse cuando la acción del servidor devuelve un resultado
    // nuevo. `refreshStats` y `onClose` se recrean en cada render, así que
    // incluirlos reabriría el efecto en bucle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const [alias, setAlias] = useState(link.alias ?? '');
  const [destination, setDestination] = useState(link.destination);
  const [aliasError, setAliasError] = useState<string | undefined>(undefined);
  const [destinationError, setDestinationError] = useState<string | undefined>(undefined);
  const [utmError, setUtmError] = useState<string | undefined>(undefined);
  const [utm, setUtm] = useState({
    source: link.utm_source ?? '',
    medium: link.utm_medium ?? '',
    campaign: link.utm_campaign ?? ''
  });

  const onChangeUtm = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = ev.target.value;
    const nextUtm = {
      ...utm,
      ...(ev.target.id === 'input_utm_source' ? { source: value }
        : ev.target.id === 'input_utm_medium' ? { medium: value }
        : ev.target.id === 'input_utm_campaign' ? { campaign: value }
        : {}),
    };

    setUtm(nextUtm);
    setUtmError(isValidUtmValue(value) ? undefined : t("modal.edit.error_utm_invalid"));
    setDestination((current) => composeDestination(current, nextUtm));
  }

  const onChangeAlias = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const invalid = !isValidAlias(value);

    setAliasError(invalid ? t("modal.edit.error_alias_invalid") : undefined);
    setAlias(value);
  }

  const onChangeDestination = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestination(value);

    const parsed = readDestinationUtms(value);
    if (parsed) setUtm(parsed);

    const invalid = value.trim().length === 0;
    setDestinationError(invalid ? t("modal.edit.error_destination") : undefined);
  };

  const serverError = state?.success === false
    ? t(`modal.edit.error_${state.reason ?? 'unknown'}`)
    : undefined;

  const disabled = isPending
    || Boolean(aliasError)
    || Boolean(destinationError)
    || Boolean(utmError);

  return (
    <Form action={formAction}>
      <Fieldset className="space-y-3" aria-label={t("modal.edit.title", { alias: alias || link.slug })}>
        <Input name="link_id" type="hidden" value={link.link_id} />

        <Field>
          <Label htmlFor="edit_destination" className="block text-sm font-medium text-gray-700">
            {t("modal.edit.destination_label")}
          </Label>
          <Input
            id="edit_destination"
            name="destination"
            type="text"
            inputMode="url"
            value={destination}
            onChange={onChangeDestination}
            autoFocus
            autoComplete="url"
            aria-invalid={Boolean(destinationError)}
            aria-describedby="edit_destination_help"
            className={INPUT_CLASS}
          />
          {destinationError
            ? <p id="edit_destination_help" className="mt-1 text-sm text-red-600" role="alert">{destinationError}</p>
            : <p id="edit_destination_help" className="mt-1 text-xs text-gray-500">{t("modal.edit.destination_help")}</p>}
        </Field>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field>
            <Label htmlFor="edit_alias" className="block text-sm font-medium text-gray-700">
              {t("modal.edit.alias_label")}
            </Label>
            <Input
              id="edit_alias"
              name="alias"
              type="text"
              value={alias}
              onChange={onChangeAlias}
              maxLength={ALIAS_MAX_LENGTH}
              aria-invalid={Boolean(aliasError)}
              aria-describedby={aliasError ? "alias-error" : "alias-help"}
              className={INPUT_CLASS}
            />
            {aliasError
              ? <p className="mt-1 text-sm text-red-600" id="alias-error" role="alert">{aliasError}</p>
              : <p className="mt-1 text-xs text-gray-500" id="alias-help">{t("modal.edit.alias_help")}</p>}
          </Field>

          {/* El enlace no cambia al editar: el slug es la clave y es inmutable. */}
          <div>
            <p className="block text-sm font-medium text-gray-700">{t("modal.edit.short_url")}</p>
            <p className="mt-1 truncate rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-600">iny.one/{link.slug}</p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <UtmFields utm={utm} onChange={onChangeUtm} compact />
          {utmError && <p className="mt-2 text-sm text-red-600" role="alert">{utmError}</p>}
        </div>

        {serverError && (
          <p className="text-sm text-red-600" role="alert">{serverError}</p>
        )}
      </Fieldset>

      {/* Fijo al pie del área con scroll: guardar siempre queda a la vista. */}
      <div className="sticky bottom-0 -mx-4 mt-4 flex justify-end gap-2 border-t border-gray-200 bg-surface px-4 py-3 sm:-mx-5 sm:px-5">
        <Button
          type="button"
          onClick={onClose}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700
                     cursor-pointer hover:bg-gray-50 focus:outline-none focus-visible:ring-2
                     focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          {t("modal.edit.cancel")}
        </Button>
        <Button
          type="submit"
          disabled={disabled}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm
                     cursor-pointer hover:bg-primary-hover focus:outline-none focus-visible:ring-2
                     focus-visible:ring-indigo-500 focus-visible:ring-offset-2
                     disabled:cursor-not-allowed disabled:bg-primary/50"
        >
          {t("modal.edit.save")}
        </Button>
      </div>
    </Form>
  );
}

function readDestinationUtms(destination: string):
  { source: string; medium: string; campaign: string } | null {
  try {
    const url = new URL(destination.trim().match(/^https?:\/\//i) ? destination.trim() : `https://${destination.trim()}`);
    return {
      source: sanitizeUtmValue(url.searchParams.get('utm_source')) ?? '',
      medium: sanitizeUtmValue(url.searchParams.get('utm_medium')) ?? '',
      campaign: sanitizeUtmValue(url.searchParams.get('utm_campaign')) ?? '',
    };
  } catch {
    return null;
  }
}

function composeDestination(
  destination: string,
  utm: { source: string; medium: string; campaign: string },
): string {
  try {
    const trimmed = destination.trim();
    const url = new URL(trimmed.match(/^https?:\/\//i) ? trimmed : `https://${trimmed}`);

    for (const [key, value] of [
      ['utm_source', utm.source],
      ['utm_medium', utm.medium],
      ['utm_campaign', utm.campaign],
    ] as const) {
      if (value) url.searchParams.set(key, sanitizeUtmValue(value) ?? '');
      else url.searchParams.delete(key);
    }

    return url.toString();
  } catch {
    return destination;
  }
}

import { UserUrlStats } from "@/features/dashboard/types/types";
import { Button, Field, Fieldset, Input, Label } from "@headlessui/react";
import React, { type ChangeEvent, useActionState, useEffect, useState } from "react";
import Form from "next/form";
import { updateLinkAction, type LinkEditState } from "@/features/dashboard/actions/edit_link.actions";
import { useRefreshStats } from "@/features/dashboard/hooks/useStatsCommon";
import { ALIAS_MAX_LENGTH, isValidAlias } from "@/lib/short-links/alias";

interface Props {
  link: UserUrlStats;
  t: ReturnType<typeof import("next-intl").useTranslations>;
  onClose: () => void;
}

const INPUT_CLASS = `mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm
  focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none
  data-[invalid]:border-red-500`;

export default function EditLink({ link, t, onClose }: Readonly<Props>) {
  const initialState: LinkEditState = {
    slug: link.slug,
    alias: link.alias ?? '',
    destination: link.destination,
  };

  const [state, formAction] = useActionState(updateLinkAction, initialState);

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
  const [error, setError] = useState<string | undefined>(undefined);
  const [disabled, setDisabled] = useState(false);

  const onChangeAlias = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Misma regla que aplica el servidor, importada y no copiada: duplicar
    // la validación es la vía más corta a que cliente y servidor discrepen.
    const invalid = !isValidAlias(value);

    setError(invalid ? t("modal.edit.error_alias_invalid") : undefined);
    setDisabled(invalid);
    setAlias(value);
  }

  const serverError = state?.success === false
    ? t(`modal.edit.error_${state.reason ?? 'unknown'}`)
    : undefined;

  return (
    <Form action={formAction}>
      <Fieldset className="mt-4 space-y-4">
        <Input name="slug" type="hidden" value={link.slug} />

        <Field>
          <Label className="block text-sm font-medium text-gray-700">
            {t("modal.edit.destination_label")}
          </Label>
          <Input
            name="destination"
            type="url"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            autoFocus
            className={INPUT_CLASS}
          />
          <p className="mt-2 text-sm text-gray-500">{t("modal.edit.destination_help")}</p>
        </Field>

        <Field>
          <Label className="block text-sm font-medium text-gray-700">
            {t("modal.edit.alias_label")}
          </Label>
          <Input
            name="alias"
            type="text"
            value={alias}
            onChange={onChangeAlias}
            maxLength={ALIAS_MAX_LENGTH}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "alias-error" : undefined}
            className={INPUT_CLASS}
          />
          {error
            ? <p className="mt-2 text-sm text-red-600" id="alias-error">{error}</p>
            : <p className="mt-2 text-sm text-gray-500">{t("modal.edit.alias_help")}</p>}
        </Field>

        {/* El enlace no cambia al editar: el slug es la clave y es inmutable. */}
        <p className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">
          {t("modal.edit.short_url")}: <span className="font-medium">iny.one/{link.slug}</span>
        </p>

        {serverError && (
          <p className="text-sm text-red-600" role="alert">{serverError}</p>
        )}
      </Fieldset>

      <div className="mt-6 flex justify-end gap-2">
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
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm
                     cursor-pointer hover:bg-indigo-700 focus:outline-none focus-visible:ring-2
                     focus-visible:ring-indigo-500 focus-visible:ring-offset-2
                     disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          {t("modal.edit.save")}
        </Button>
      </div>
    </Form>
  );
}

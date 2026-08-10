import { UserUrlStats } from "@/features/dashboard/types/types";
import { Button, Field, Fieldset, Input, Label } from "@headlessui/react";
import React, { type ChangeEvent, useActionState, useEffect, useState } from "react";
import Form from "next/form";
import { editLinkAction } from "@/features/dashboard/actions/edit_link.actions";
import { useRefreshStats } from "@/features/dashboard/hooks/useStatsCommon";

interface Props {
  link: UserUrlStats;
  t: ReturnType<typeof import("next-intl").useTranslations>;
  onClose: () => void;
}

const REGEX_ALIAS = /[^a-zA-Z0-9_\- /#]+/;

const initialState = {
  slug: '',
  alias: '',
} as { slug: string; alias: string, success?: boolean; };

export default function EditLink({ link, t, onClose }: Readonly<Props>) {
  const [state, formAction] = useActionState(editLinkAction, { ...initialState, slug: link.slug });

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
  const [error, setError] = useState<string | undefined>(undefined);
  const [disabled, setDisabled] = useState(false);

  const onChangeAlias = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const invalid = REGEX_ALIAS.test(value);

    setError(invalid ? t("modal.edit.error_alias_invalid") : undefined);
    setDisabled(invalid);
    setAlias(value);
  }

  return (
    <Form action={formAction}>
      <Fieldset className="mt-4">
        <Input name="slug" type="hidden" value={link.slug} />
        <Field>
          <Label className="block text-sm font-medium text-gray-700">Alias</Label>
          <Input
            name="alias"
            type="text"
            value={alias}
            onChange={onChangeAlias}
            autoFocus
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "alias-error" : undefined}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm
                       focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none
                       data-[invalid]:border-red-500"
          />
          {error
            ? <p className="mt-2 text-sm text-red-600" id="alias-error">{error}</p>
            : <p className="mt-2 text-sm text-gray-500">iny.one/{link.slug}</p>}
        </Field>
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

import { UserUrlStats } from "@/features/dashboard/types/types";
import { Button, Field, Fieldset, Input, Label } from "@headlessui/react";
import React, { type ChangeEvent, useState } from "react";
import Form from "next/form";
import { editLinkAction } from "@/features/dashboard/actions/edit_link.actions";

interface Props {
  link: UserUrlStats;
  t: ReturnType<typeof import("next-intl").useTranslations>;
}

const REGEX_ALIAS = /[^a-zA-Z0-9_\- /#]+/;

export default function EditLink({ link, t }: Readonly<Props>) {
  const [alias, setAlias] = useState(link.alias ?? '');
  const [error, setError] = useState<string | undefined>(undefined);
  const [disabled, setDisabled] = useState(false);

  const onChangeAlias = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if(REGEX_ALIAS.test(value)) {
      setError(t("modal.edit.error_alias_invalid"));
      setDisabled(true);
    } else {
      setError(undefined);
      setDisabled(false);
    }
    setAlias(e.target.value);
  }

  return (
    <Form action={editLinkAction}>
      <div className="mt-4 grid grid-cols-1 gap-4">
        <div className="space-y-3">
          <Fieldset>
            <Input
              name="slug"
              type="hidden"
              value={link.slug}
            />
            <Field>
              <Label className="block text-sm font-medium text-gray-700">
                Alias
              </Label>
              <div className="mt-1">
                <Input
                  name="alias"
                  type="text"
                  value={alias}
                  onChange={onChangeAlias}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {error && <p className="mt-2 text-sm text-red-600" id="alias-error">{error}</p>}
              </div>
            </Field>
          </Fieldset>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4">
        <div className="space-y-3">
          <Button type="submit" disabled={disabled}>{t("modal.edit.save")}</Button>
        </div>
      </div>
    </Form>
  );
}
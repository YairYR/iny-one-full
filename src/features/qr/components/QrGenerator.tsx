'use client';

import React, { useState } from "react";
import { QrCode } from "lucide-react";
import { Button, Field, Fieldset, Input, Label } from "@headlessui/react";
import QrPanel from "@/features/qr/components/QrPanel";

interface Props {
  labels: {
    inputLabel: string;
    placeholder: string;
    button: string;
    invalid: string;
    download: string;
    alt: string;
  };
}

/**
 * Generador QR standalone: el usuario ingresa cualquier URL
 * y obtiene el QR descargable. Client-side puro (sin costo de servidor).
 */
export default function QrGenerator({ labels }: Readonly<Props>) {
  const [value, setValue] = useState("");
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const handleGenerate = () => {
    let candidate = value.trim();
    if (!candidate) return;
    if (!/^https?:\/\//i.test(candidate)) candidate = "https://" + candidate;

    try {
      const parsed = new URL(candidate);
      if (!parsed.hostname.includes(".")) throw new Error("invalid");
      setError(false);
      setUrl(parsed.toString());
    } catch {
      setError(true);
      setUrl(null);
    }
  };

  return (
    <Fieldset className="bg-white rounded-xl shadow-lg p-8">
      <Field>
        <Label className="block text-sm font-medium text-gray-700 mb-2">{labels.inputLabel}</Label>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="url"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleGenerate(); }}
            placeholder={labels.placeholder}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
          <Button
            type="button"
            onClick={handleGenerate}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center cursor-pointer"
          >
            <QrCode className="h-5 w-5 mr-2" />
            {labels.button}
          </Button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{labels.invalid}</p>}
      </Field>

      {url && (
        <div className="mt-6 border-t border-gray-100 pt-6">
          <QrPanel
            url={url}
            filename="iny-one-qr"
            downloadLabel={labels.download}
            alt={labels.alt}
          />
          <p className="text-center text-xs text-gray-500 mt-2 break-all">{url}</p>
        </div>
      )}
    </Fieldset>
  );
}

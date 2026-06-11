'use client';

import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@headlessui/react";

interface Props {
  /** URL completa a codificar, ej: https://iny.one/abc1234 */
  url: string;
  /** Nombre base del archivo descargado (sin extensión) */
  filename?: string;
  /** Texto del botón de descarga */
  downloadLabel: string;
  /** Texto alternativo de la imagen */
  alt: string;
  /** Texto de ayuda bajo el QR (opcional) */
  hint?: string;
}

/**
 * Genera y muestra un código QR para una URL.
 * La librería `qrcode` (~16KB gzip) se carga on-demand via dynamic import,
 * por lo que no afecta el bundle inicial de ninguna página.
 */
export default function QrPanel({ url, filename = "qr-code", downloadLabel, alt, hint }: Readonly<Props>) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    import("qrcode")
      .then((QRCode) =>
        QRCode.toDataURL(url, {
          width: 512,
          margin: 2,
          errorCorrectionLevel: "M",
          color: { dark: "#1e1b4b", light: "#ffffff" },
        })
      )
      .then((result) => {
        if (!cancelled) setDataUrl(result);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${filename}.png`;
    a.click();
  };

  if (error) return null;

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
        {dataUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element -- dataURL local, next/image no aplica */
          <img
            src={dataUrl}
            alt={alt}
            width={192}
            height={192}
            className="h-48 w-48"
          />
        ) : (
          <div className="h-48 w-48 animate-pulse rounded bg-gray-100" aria-hidden="true" />
        )}
      </div>

      {hint && <p className="text-xs text-gray-500">{hint}</p>}

      <Button
        type="button"
        onClick={handleDownload}
        disabled={!dataUrl}
        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <Download className="h-4 w-4" />
        {downloadLabel}
      </Button>
    </div>
  );
}

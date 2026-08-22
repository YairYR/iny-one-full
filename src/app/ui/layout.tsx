import type React from "react";
import { NextIntlClientProvider } from "next-intl";

interface Props {
  children?: React.ReactNode;
}

// Nota: Google Analytics se carga una sola vez en el root layout
// (src/app/layout.tsx). Antes se declaraba también aquí, duplicando el código.
export default function UiLayout({ children }: Readonly<Props>) {
  return (
    <NextIntlClientProvider>
      {children}
    </NextIntlClientProvider>
  );
}

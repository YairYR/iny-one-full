import type React from "react";
import { NextIntlClientProvider } from "next-intl";
import Script from "next/script";
import { IS_PRODUCTION } from "@/constants";

interface Props {
  children?: React.ReactNode;
}

export default function UiLayout({ children }: Readonly<Props>) {
  return (
    <>
      <NextIntlClientProvider>
        {children}
      </NextIntlClientProvider>

      {IS_PRODUCTION && (
        <>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-KT87SQKGT4"
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-KT87SQKGT4', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}
    </>
  );
}

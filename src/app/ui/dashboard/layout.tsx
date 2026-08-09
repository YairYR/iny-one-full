/* INACTIVO — layout fuera de la cadena de renderizado (rev. 2026-08-09).
 * La página del dashboard vive en app/ui/(user)/dashboard/, así que su cadena
 * de layouts es app -> ui -> (user): este fichero nunca se monta y el noindex
 * que declaraba no se aplicaba. La directiva se movió a app/ui/(user)/layout.tsx.
 * Se conserva por si se crea una sección propia bajo /ui/dashboard. */
import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

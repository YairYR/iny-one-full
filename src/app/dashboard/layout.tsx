import type React from "react";
import '@/styles/globals.css';

interface Props {
  children?: React.ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <html>
    <body>{children}</body>
    </html>
  )
}
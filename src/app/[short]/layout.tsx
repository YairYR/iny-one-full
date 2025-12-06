import type React from "react";

interface Props {
  children?: React.ReactNode;
}

export default function FakeLayout({ children }: Readonly<Props>) {
  return (
    <html lang="en">
    <body>{children}</body>
    </html>
  )
}
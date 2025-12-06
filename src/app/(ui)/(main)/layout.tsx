import LayoutMain from "@/components/layouts/LayoutMain";
import type React from "react";

interface Props {
  children?: React.ReactNode;
}

export default async function Layout({ children }: Readonly<Props>) {
  return (
    <LayoutMain>
      {children}
    </LayoutMain>
  );
}
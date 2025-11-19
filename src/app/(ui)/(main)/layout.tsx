import LayoutMain from "@/components/layouts/LayoutMain";
import type React from "react";

interface Props {
  children?: React.ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <LayoutMain>
      {children}
    </LayoutMain>
  );
}
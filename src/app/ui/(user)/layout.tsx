import NavbarMain from "@/components/Navbar/NavbarMain";
import Footer from "@/components/Footer";
import React from "react";
import { getCurrentUserDTO } from "@/data/dto/user-dto";
import type { Metadata } from "next";

// El dashboard vive bajo el grupo (user), asi que su cadena de layouts es
// app -> ui -> (user). Declarar el noindex aqui es lo unico que lo aplica de
// verdad al area privada.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface Props {
  children?: React.ReactNode;
}

export default async function UserLayout({ children }: Readonly<Props>) {
  const user = await getCurrentUserDTO();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavbarMain user={user} />
      <main>
        { children }
      </main>
      <Footer />
    </div>
  )
}
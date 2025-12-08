import NavbarMain from "@/components/Navbar/NavbarMain";
import Footer from "@/components/Footer";
import React from "react";
import { getCurrentUserDTO } from "@/data/dto/user-dto";

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
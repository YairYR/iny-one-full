import NavbarMain from "@/components/Navbar/NavbarMain";
import Footer from "@/components/Footer";
import React from "react";
import { isLoggedIn } from "@/data/user-dto";

interface Props {
  children?: React.ReactNode;
}

export default async function UserLayout({ children }: Readonly<Props>) {
  const logged = await isLoggedIn();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavbarMain isLoggedIn={logged} />
      <main>
        { children }
      </main>
      <Footer />
    </div>
  )
}
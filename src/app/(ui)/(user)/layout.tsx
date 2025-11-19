import NavbarMain from "@/components/Navbar/NavbarMain";
import Footer from "@/components/Footer";
import React from "react";

interface Props {
  children?: React.ReactNode;
}

export default function UserLayout({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavbarMain />
      <main>
        { children }
      </main>
      <Footer />
    </div>
  )
}
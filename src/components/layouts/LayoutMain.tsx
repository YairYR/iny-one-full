import Footer from '@/components/Footer';
import React from "react";
import NavbarMain from "@/components/Navbar/NavbarMain";
import { getCurrentUserDTO } from "@/data/dto/user-dto";

interface Props {
  children: React.ReactNode;
}

const LayoutMain: React.FC<Props> = async ({ children }) => {
  const user = await getCurrentUserDTO();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavbarMain user={user}/>
      <main className="container mx-auto px-4 py-8 flex-grow">
        {children}
      </main>
      <Footer/>
    </div>
  );
}

export default LayoutMain;
import React from "react";
import { Metadata } from "next";
import SimpleHeader from "@/components/ciudadano/Common/SimpleHeader/SimpleHeader";
import Image from "next/image";
import Footer from "@/components/shared/Footer/Footer";

export const metadata: Metadata = {
  title: "SGIRS: Sistema de Gestión Integral de Residuos Sólidos",
  description: "Sistema de Gestión Integral de Residuos Sólidos",
};

interface ResetPasswordLayoutProps {
  children: React.ReactNode;
}

function ResetPasswordLayout({ children }: ResetPasswordLayoutProps) {
  return (
    <main className="bg-[#F9F9FA] min-h-screen">
      <SimpleHeader />
      <div className="flex items-center flex-col min-h-screen py-16 px-5 lg:px-0">
        <Image
          src="/logos_sgirs.webp"
          alt="Logo"
          width={814}
          height={814}
          className="mb-16"
        />
        {children}
      </div>
      <Footer />
    </main>
  );
}

export default ResetPasswordLayout;

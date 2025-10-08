import { Metadata } from "next";
import React from "react";
import Image from "next/image";
import Header from "@/components/shared/Header/Header";
import SimpleHeader from "@/components/ciudadano/Common/SimpleHeader/SimpleHeader";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Footer from '@/components/shared/Footer/Footer';

export const metadata: Metadata = {
  title: "SGIRS: Sistema de Gestión Integral de Residuos Sólidos",
  description: "Sistema de Gestión Integral de Residuos Sólidos",
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

function CiudadanoLayout({ children }: AuthLayoutProps) {
  return (
    <ProtectedRoute allowedRoles={["Sector Estratégico"]}>
      <main className="bg-[#F9F9FA] min-h-screen">
        <SimpleHeader />
        <Header />
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
    </ProtectedRoute>
  );
}

export default CiudadanoLayout;

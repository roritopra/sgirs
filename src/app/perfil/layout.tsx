import type { ReactNode } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Header from "@/components/shared/Header/Header";
import Footer from "@/components/shared/Footer/Footer";
import SimpleHeader from "@/components/ciudadano/Common/SimpleHeader/SimpleHeader";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SGIRS: Perfil",
  description: "Sistema de Gestión Integral de Residuos Sólidos",
};

export default function PerfilLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex flex-col">
        <SimpleHeader />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
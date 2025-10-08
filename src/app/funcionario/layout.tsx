import Sidebar from '@/components/funcionario/Sidebar';
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Header from '@/components/shared/Header/Header';
import Footer from '@/components/shared/Footer/Footer';
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SGIRS: Funcionario",
  description: "Sistema de Gestión Integral de Residuos Sólidos",
};

export default function FuncionarioLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute allowedRoles={["Funcionario"]}>
            <div className='flex h-screen'>
                <Sidebar />
                <div className='flex-1 flex flex-col ml-15'>
                    <Header />
                    <main>{children}</main>
                    <Footer />
                </div>
            </div>
        </ProtectedRoute>
    );
}

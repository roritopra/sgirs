import Sidebar from '@/components/admin/sidebar';
import { DateRangeProvider } from '@/context/admin/DateRangeProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Footer from '@/components/shared/Footer/Footer';
import Header from '@/components/shared/Header/Header';
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SGIRS: Administrador",
  description: "Sistema de Gestión Integral de Residuos Sólidos",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["Administrador", "Admin"]}>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-15">
          <Header />
          <main>
            <DateRangeProvider>
              {children}
            </DateRangeProvider>
          </main>
          <Footer />
        </div>
      </div>
    </ProtectedRoute>
  );
}

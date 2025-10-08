"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const { role } = useAuth();

  const normalizeRole = (r: string | undefined | null): string => {
    if (!r) return "";
    return r.toString().toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const baseForRole = (r: string): string => {
    const n = normalizeRole(r);
    if (n === "funcionario") return "/funcionario";
    if (n === "administrador" || n === "admin") return "/admin";
    return "/ciudadano";
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const redirect = pathname && pathname.startsWith("/") ? pathname : "/";
      router.push(`/auth/login?redirect=${encodeURIComponent(redirect)}`);
    }
  }, [isAuthenticated, loading, router, pathname]);

  useEffect(() => {
    if (!loading && isAuthenticated && allowedRoles && allowedRoles.length > 0) {
      const allowedNorm = allowedRoles.map((r) => normalizeRole(r));
      const userNorm = normalizeRole(role);
      if (!allowedNorm.includes(userNorm)) {
        router.replace(baseForRole(role));
      }
    }
  }, [allowedRoles, isAuthenticated, loading, role, router]);

  // Evitar parpadeo: no renderizar hijos si el rol no está permitido
  const isRoleAllowed = (() => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    const allowedNorm = allowedRoles.map((r) => normalizeRole(r));
    const userNorm = normalizeRole(role);
    return allowedNorm.includes(userNorm);
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0 && !isRoleAllowed) {
    // Ya hay un router.replace en el efecto; devolvemos null para evitar flashing
    return null;
  }

  return <>{children}</>;
}

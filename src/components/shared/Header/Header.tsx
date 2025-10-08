"use client";

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Breadcrumbs,
  BreadcrumbItem,
  Avatar,
} from "@heroui/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { logoutAsync } from "@/store/slices/authSlice";
import { useAuth } from "@/hooks/useAuth";

const pathTranslations: { [key: string]: string } = {
    reportes: "Mis reportes",
    "resumen-reporte": "Resumen de reporte",
  };

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useDispatch();
    const { username, role } = useAuth();
    const breadcrumbItems = useMemo(() => {
        const paths = pathname?.split("/").filter(Boolean) || [];
        const items = [];
        
        // Si estamos en /ciudadano o en la raíz, mostrar como Inicio
        if (pathname === "/ciudadano" || pathname === "/") {
          items.push({
            label: "Inicio",
            href: "/ciudadano",
            isCurrent: true,
          });
          return items;
        } else {
          items.push({
            label: "Inicio",
            href: "/ciudadano",
            isCurrent: false,
          });
        }
    
        let currentPath = "";
        paths.forEach((path) => {
          currentPath += `/${path}`;
    
          const translatedLabel =
            pathTranslations[path.toLowerCase()] ||
            path
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");
    
          items.push({
            label: translatedLabel,
            href: currentPath,
            isCurrent: currentPath === pathname,
          });
        });
    
        return items;
      }, [pathname]);


  return (
      <header className="flex items-center justify-between w-full py-3 bg-white px-7 border-b-[0.5px] border-gray-200">
        <Breadcrumbs
          itemClasses={{
            separator: "px-2",
            item: "text-default-500 hover:text-primary",
            base: "gap-1",
          }}
          separator="/"
        >
          {breadcrumbItems.map((item, index) => (
            <BreadcrumbItem
              key={`${item.href}-${index}`}
              isCurrent={item.isCurrent}
              className={item.isCurrent ? "text-primary font-medium" : ""}
            >
              <Link href={item.href}>{item.label}</Link>
            </BreadcrumbItem>
          ))}
        </Breadcrumbs>
        <div className="flex items-center gap-4" data-testid="user-dropdown">
          <Dropdown placement="bottom-start">
            <DropdownTrigger>
              <Avatar
                as="button"
                radius="sm"
                size="sm"
                isBordered
                aria-label="Menú de usuario"
                data-testid="user-menu-trigger"
                classNames={{
                  icon: "text-gray-500",
                }}
                className="transition-transform cursor-pointer"
              />
            </DropdownTrigger>
            <DropdownMenu
              aria-label="user-dropdown"
              variant="flat"
              onAction={async (key) => {
                if (key === "logout") {
                  try {
                    await dispatch<any>(logoutAsync());
                  } finally {
                    router.push("/auth/login");
                  }
                }
                if (key === "settings") {
                  router.push("/perfil");
                }
              }}
            >
              <DropdownItem key="profile">
                <p className="font-bold">{username}</p>
              </DropdownItem>
              {((role ?? "") !== "Administrador") ? (
                <DropdownItem key="settings">Configuración</DropdownItem>
              ) : null}
              <DropdownItem key="logout" color="danger" data-testid="user-dropdown-item-logout">
                Cerrar sesión
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </header>
  );
}


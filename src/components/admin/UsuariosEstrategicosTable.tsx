"use client";

import { useEffect, useMemo, useState } from "react";
import { get, patch } from "@/utils/shared/apiUtils";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@heroui/react";
import { useRouter } from "next/navigation";
import { addToast } from "@heroui/toast";

interface UsuarioEstrategico {
  id_usuario: string;
  nombre: string;
  email: string;
  establecimiento: string;
  nit: string;
  sector: string;
  comuna: string;
  barrio: string;
  activo: boolean;
}

interface ApiResponse {
  page: number;
  limit: number;
  total: number;
  data: UsuarioEstrategico[];
}

export default function UsuariosEstrategicosTable() {
  const router = useRouter();
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(15);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  const [rows, setRows] = useState<UsuarioEstrategico[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState<UsuarioEstrategico | null>(null);
  const [updatingToTrue, setUpdatingToTrue] = useState<boolean>(false);
  const [updatingToFalse, setUpdatingToFalse] = useState<boolean>(false);

  useEffect(function debounceSearch() {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(function fetchRows() {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        // Backend 1-based
        params.set("page", String(page));
        params.set("limit", String(limit));
        if (debouncedSearch) params.set("search", debouncedSearch);

        const res = await get<ApiResponse>(`/api/v1/usuarios/estrategicos?${params.toString()}`);
        if (cancelled) return;
        setRows(res.data || []);
        setTotal(res.total || 0);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || "Error al cargar datos");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [page, limit, debouncedSearch]);

  const totalPages = useMemo(() => {
    if (!limit) return 1;
    return Math.max(1, Math.ceil(total / limit));
  }, [total, limit]);

  function handleLimitChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = Number(e.target.value);
    setLimit(next);
    setPage(1);
  }

  function handlePrev() {
    setPage((p) => Math.max(1, p - 1));
  }

  function handleNext() {
    setPage((p) => Math.min(totalPages, p + 1));
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 overflow-x-auto" role="region" aria-label="Tabla de establecimientos">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
        <h2 className="font-bold">Tabla de establecimientos</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <label className="flex items-center gap-2 text-sm" aria-label="Buscar por nombre, correo o NIT">
            <span className="sr-only">Buscar</span>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar..."
              className="h-10 w-64 px-3.5 py-2 border border-[#E4E4E7] rounded-[0.5625rem] focus:outline-none focus:border-[#5F8244] focus:ring-1 focus:ring-[#5F8244]"
              aria-label="Buscar"
            />
          </label>

          <label className="flex items-center gap-2 text-sm" aria-label="Seleccionar cantidad por página">
            <span>Mostrar</span>
            <select
              value={limit}
              onChange={handleLimitChange}
              className="h-10 px-3 py-2 border border-[#E4E4E7] rounded-[0.5625rem] bg-white focus:outline-none focus:border-[#5F8244] focus:ring-1 focus:ring-[#5F8244]"
              aria-label="Límite por página"
            >
              <option value={5}>5</option>
              <option value={15}>15</option>
              <option value={30}>30</option>
            </select>
            <span>por página</span>
          </label>
        </div>
      </div>

      {loading && (
        <div role="status" aria-live="polite" className="text-sm text-gray-600 mb-2">
          Cargando...
        </div>
      )}
      {error && (
        <div role="alert" className="text-sm text-red-600 mb-2">
          {error}
        </div>
      )}

      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className="bg-[#f3f4f6]">
            <th className="p-3 rounded-l-lg">Nombre</th>
            <th className="p-3">Correo</th>
            <th className="p-3">Establecimiento</th>
            <th className="p-3">NIT</th>
            <th className="p-3">Sector</th>
            <th className="p-3">Comuna</th>
            <th className="p-3">Barrio</th>
            <th className="p-3">Activo</th>
            <th className="p-3 rounded-r-lg">Detalles</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.id_usuario} className="bg-[#fafafa] hover:bg-[#f1f1f1] rounded-lg">
              <td className="p-3">{item.nombre}</td>
              <td className="p-3">{item.email}</td>
              <td className="p-3">{item.establecimiento}</td>
              <td className="p-3">{item.nit}</td>
              <td className="p-3">{item.sector}</td>
              <td className="p-3">{item.comuna}</td>
              <td className="p-3">{item.barrio}</td>
              <td className="p-3">
                {item.activo ? (
                  <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 border border-green-200 text-center">Usuario activo</span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 border border-gray-200 text-center">No activo</span>
                )}
              </td>
              <td className="p-3">
                <button
                  className="px-3 py-1 cursor-pointer rounded-[15px] bg-[#5F8244] text-white hover:bg-[#4e6b38]"
                  aria-label={`Ver detalles de ${item.nombre}`}
                  onClick={() => {
                    setSelectedUser(item);
                    onOpen();
                  }}
                >
                  Detalles
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && !loading && !error && (
            <tr>
              <td colSpan={9} className="p-3 text-center text-gray-500">
                No hay registros
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal de detalles */}
      <Modal size="3xl" isOpen={isOpen} onOpenChange={onOpenChange} placement="center" aria-label="Detalles de usuario">
        <ModalContent>
          {(close) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Detalles del usuario</ModalHeader>
              <ModalBody>
                {!selectedUser ? (
                  <div className="text-sm text-gray-600">Cargando...</div>
                ) : (
                  <div className="space-y-2 text-sm">                    
                    <div><span className="font-semibold">Nombre:</span> {selectedUser.nombre}</div>
                    <div><span className="font-semibold">Correo:</span> {selectedUser.email}</div>
                    <div><span className="font-semibold">Establecimiento:</span> {selectedUser.establecimiento}</div>
                    <div><span className="font-semibold">NIT:</span> {selectedUser.nit}</div>
                    <div><span className="font-semibold">Sector:</span> {selectedUser.sector}</div>
                    <div><span className="font-semibold">Comuna:</span> {selectedUser.comuna}</div>
                    <div><span className="font-semibold">Barrio:</span> {selectedUser.barrio}</div>
                    <div>
                      <span className="font-semibold">Estado:</span>{" "}
                      {selectedUser.activo ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 border border-green-200">Usuario activo</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 border border-gray-200">No activo</span>
                      )}
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="bordered"
                  onPress={() => {
                    if (!selectedUser) return;
                    const href = `/admin/gestion-usuarios/${selectedUser.id_usuario}/editar`;
                    router.push(href);
                    onClose();
                  }}
                  aria-label="Editar usuario"
                >
                  Editar usuario
                </Button>
                <Button
                  color="success"
                  isDisabled={!selectedUser || selectedUser.activo}
                  isLoading={updatingToTrue}
                  onPress={async () => {
                    if (!selectedUser) return;
                    try {
                      setUpdatingToTrue(true);
                      await patch(`/api/v1/usuarios/${selectedUser.id_usuario}/status`, { status: true });
                      setRows((prev) => prev.map((u) => (u.id_usuario === selectedUser.id_usuario ? { ...u, activo: true } : u)));
                      setSelectedUser({ ...selectedUser, activo: true });
                      addToast({ title: "Acceso restaurado", description: `El usuario ${selectedUser.nombre} fue activado.`, color: "success" });
                    } catch (e) {
                      addToast({ title: "Error al restaurar acceso", description: "No se pudo activar el usuario.", color: "danger" });
                    } finally {
                      setUpdatingToTrue(false);
                    }
                  }}
                  aria-label="Restaurar acceso"
                >
                  Restaurar acceso
                </Button>
                <Button
                  color="danger"
                  isDisabled={!selectedUser || !selectedUser.activo}
                  isLoading={updatingToFalse}
                  onPress={async () => {
                    if (!selectedUser) return;
                    try {
                      setUpdatingToFalse(true);
                      await patch(`/api/v1/usuarios/${selectedUser.id_usuario}/status`, { status: false });
                      setRows((prev) => prev.map((u) => (u.id_usuario === selectedUser.id_usuario ? { ...u, activo: false } : u)));
                      setSelectedUser({ ...selectedUser, activo: false });
                      addToast({ title: "Usuario desactivado", description: `El usuario ${selectedUser.nombre} fue desactivado.`, color: "success" });
                    } catch (e) {
                      addToast({ title: "Error al desactivar", description: "No se pudo desactivar el usuario.", color: "danger" });
                    } finally {
                      setUpdatingToFalse(false);
                    }
                  }}
                  aria-label="Desactivar usuario"
                >
                  Desactivar usuario
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-600">
          Mostrando {rows.length} de {total} registros
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={page === 1 || loading}
            className="px-3 py-1 rounded border border-gray-300 bg-white disabled:opacity-50"
            aria-label="Página anterior"
          >
            Anterior
          </button>
          <span className="text-sm">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={page >= totalPages || loading}
            className="px-3 py-1 rounded border border-gray-300 bg-white disabled:opacity-50"
            aria-label="Página siguiente"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}

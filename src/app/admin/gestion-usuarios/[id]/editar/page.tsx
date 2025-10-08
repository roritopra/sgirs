"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getRegistroDetalle,
  putRegistroUsuario,
} from "@/services/admin/editarUsuarioEstrategico.service";
import type { RegistroUsuario, UpdateRegistroPayload } from "@/types/registro";
import ProfileForm from "@/components/shared/ProfileForm/ProfileForm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@heroui/react";
import { addToast } from "@heroui/toast";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const usuarioId = params?.id;

  const [data, setData] = useState<RegistroUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      if (!usuarioId) return;
      setLoading(true);
      setError(null);
      try {
        const regRes = await getRegistroDetalle(usuarioId);
        if (!mounted) return;
        const r = regRes ?? {};
        const prefill: RegistroUsuario = {
          nit: r.nit ?? "",
          nombre_establecimiento: r.nombre_establecimiento ?? "",
          direccion: r.direccion ?? "",
          primer_nombre: r.primer_nombre ?? "",
          segundo_nombre: r.segundo_nombre ?? "",
          primer_apellido: r.primer_apellido ?? "",
          segundo_apellido: r.segundo_apellido ?? "",
          num_telefono: r.num_telefono ?? "",
          nombre_barrio: r.nombre_barrio ?? "",
          nombre_sector: r.nombre_sector ?? "",
        } as RegistroUsuario;
        setData(prefill);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Error al cargar el perfil del usuario");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }
    fetchData();
    return () => {
      mounted = false;
    };
  }, [usuarioId]);

  async function handleSubmit(payload: UpdateRegistroPayload) {
    if (!usuarioId) {
      setError("No se encontró el usuario a editar");
      addToast({ title: "Usuario no encontrado", color: "danger" });
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      // PUT requiere keys: sector y barrio (no nombre_*). Nombres se envían tal cual se editen.
      const serverPayload = {
        nit: payload.nit ?? "",
        nombre_establecimiento: payload.nombre_establecimiento ?? "",
        sector: (payload as any).nombre_sector ?? "",
        direccion: payload.direccion ?? "",
        barrio: (payload as any).nombre_barrio ?? "",
        primer_nombre: payload.primer_nombre ?? "",
        segundo_nombre: payload.segundo_nombre ?? "",
        primer_apellido: payload.primer_apellido ?? "",
        segundo_apellido: payload.segundo_apellido ?? "",
        num_telefono: payload.num_telefono ?? "",
      };

      await putRegistroUsuario(usuarioId, serverPayload);
      // Refetch usando el mismo servicio GET estandarizado
      const regRes = await getRegistroDetalle(usuarioId);
      const r = regRes ?? {};
      const prefill: RegistroUsuario = {
        nit: r.nit ?? "",
        nombre_establecimiento: r.nombre_establecimiento ?? "",
        direccion: r.direccion ?? "",
        primer_nombre: r.primer_nombre ?? "",
        segundo_nombre: r.segundo_nombre ?? "",
        primer_apellido: r.primer_apellido ?? "",
        segundo_apellido: r.segundo_apellido ?? "",
        num_telefono: r.num_telefono ?? "",
        nombre_barrio: r.nombre_barrio ?? "",
        nombre_sector: r.nombre_sector ?? "",
      } as RegistroUsuario;
      setData(prefill);
      setSuccess("Perfil actualizado correctamente");
      addToast({ title: "Cambios guardados", description: "El usuario fue actualizado.", color: "success" });
    } catch (e: any) {
      setError(e?.message || "Error al actualizar el perfil");
      addToast({ title: "Error al guardar", description: "No se pudo actualizar el usuario.", color: "danger" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main role="main" aria-labelledby="admin-perfil-title">
      <section className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
        <div className="mb-4">
          <Button
            variant="bordered"
            onPress={() => router.push("/admin/gestion-usuarios")}
            aria-label="Volver a gestión de usuarios"
          >
            Volver
          </Button>
        </div>
        <Card role="region" aria-labelledby="admin-perfil-title">
          <CardHeader className="border-b">
            <CardTitle id="admin-perfil-title" className="text-2xl">
              Editar usuario
            </CardTitle>
            <CardDescription id="admin-perfil-desc">
              Actualiza la información del establecimiento y datos de contacto del usuario seleccionado.
            </CardDescription>
          </CardHeader>

          {loading ? (
            <div role="status" aria-live="polite" className="px-6 py-4 text-sm text-gray-600">
              Cargando información...
            </div>
          ) : null}

          {error ? (
            <div role="alert" aria-live="polite" className="px-6 py-4 text-sm text-red-700 bg-red-50">
              {error}
            </div>
          ) : null}

          {success ? (
            <div role="status" aria-live="polite" className="px-6 py-4 text-sm text-green-700 bg-green-50">
              {success}
            </div>
          ) : null}

          <CardContent>
            <section aria-labelledby="admin-perfil-form-title">
              <h2 id="admin-perfil-form-title" className="sr-only">
                Formulario de edición de usuario
              </h2>
              <ProfileForm initialData={data} isSubmitting={submitting} onSubmit={handleSubmit} />
            </section>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

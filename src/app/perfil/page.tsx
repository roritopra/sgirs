"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  getRegistroActual,
  updateRegistroUsuario,
} from "@/services/registro.service";
import type { RegistroUsuario, UpdateRegistroPayload } from "@/types/registro";
import ProfileForm from "@/components/shared/ProfileForm/ProfileForm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function Page() {
  const { id: usuarioId } = useAuth();

  const [data, setData] = useState<RegistroUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await getRegistroActual();
        if (!mounted) return;
        setData(res);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Error al cargar el perfil");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }
    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(payload: UpdateRegistroPayload) {
    if (!usuarioId) {
      setError("No se encontró el usuario autenticado");
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateRegistroUsuario(usuarioId, payload);
      setData(updated);
      setSuccess("Perfil actualizado correctamente");
    } catch (e: any) {
      setError(e?.message || "Error al actualizar el perfil");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      role="main"
      aria-labelledby="perfil-title"
    >
      <section className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
        <Card role="region" aria-labelledby="perfil-title">
          <CardHeader className="border-b">
            <CardTitle id="perfil-title" className="text-2xl">
              Editar perfil
            </CardTitle>
            <CardDescription id="perfil-desc">
              Actualiza la información de tu establecimiento y datos de
              contacto.
            </CardDescription>
          </CardHeader>

          {loading ? (
            <div
              role="status"
              aria-live="polite"
              className="px-6 py-4 text-sm text-gray-600"
            >
              Cargando información...
            </div>
          ) : null}

          {error ? (
            <div
              role="alert"
              aria-live="polite"
              className="px-6 py-4 text-sm text-red-700 bg-red-50"
            >
              {error}
            </div>
          ) : null}

          {success ? (
            <div
              role="status"
              aria-live="polite"
              className="px-6 py-4 text-sm text-green-700 bg-green-50"
            >
              {success}
            </div>
          ) : null}

          <CardContent>
            <section aria-labelledby="perfil-form-title">
              <h2 id="perfil-form-title" className="sr-only">
                Formulario de edición de perfil
              </h2>
              <ProfileForm
                initialData={data}
                isSubmitting={submitting}
                onSubmit={handleSubmit}
              />
            </section>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

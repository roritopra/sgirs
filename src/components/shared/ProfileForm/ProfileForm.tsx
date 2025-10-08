"use client";

import { useState, useMemo, useEffect } from "react";
import { z } from "zod";
import { Input, Button, Select, SelectItem, Autocomplete, AutocompleteItem, addToast } from "@heroui/react";
import type { RegistroUsuario, UpdateRegistroPayload } from "@/types/registro";
import { useSectores } from "@/hooks/shared/useSectores";
import AlertConfirm from "@/components/shared/AlertDialog/AlertConfirm";
import AddressBuilderPopover from "@/components/shared/Address/AddressBuilderPopover";
import { get } from "@/utils/shared/apiUtils";

const schema = z.object({
  nit: z.string().min(1, "Requerido"),
  nombre_establecimiento: z.string().min(1, "Requerido"),
  direccion: z.string().min(1, "Requerido"),
  primer_nombre: z.string().min(1, "Requerido"),
  segundo_nombre: z.string().optional(),
  primer_apellido: z.string().min(1, "Requerido"),
  segundo_apellido: z.string().optional(),
  num_telefono: z
    .string()
    .min(5, "Mínimo 7 dígitos")
    .max(12, "Máximo 20 dígitos")
    .regex(/^[0-9+\-\s()]*$/, "Formato inválido"),
  nombre_barrio: z.string().min(1, "Requerido"),
  nombre_sector: z.string().min(1, "Requerido"),
});

export interface ProfileFormProps {
  initialData: RegistroUsuario | null;
  isSubmitting: boolean;
  onSubmit: (payload: UpdateRegistroPayload) => Promise<void> | void;
}

export default function ProfileForm(props: ProfileFormProps) {
  const { initialData, isSubmitting, onSubmit } = props;

  const [form, setForm] = useState<UpdateRegistroPayload>(() => {
    if (!initialData) return {};
    const {
      nit,
      nombre_establecimiento,
      direccion,
      primer_nombre,
      segundo_nombre,
      primer_apellido,
      segundo_apellido,
      num_telefono,
      nombre_barrio,
      nombre_sector,
    } = initialData;
    return {
      nit,
      nombre_establecimiento,
      direccion,
      primer_nombre,
      segundo_nombre,
      primer_apellido,
      segundo_apellido,
      num_telefono,
      nombre_barrio,
      nombre_sector,
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isDisabled = useMemo(() => !initialData, [initialData]);

  const { sectores, isLoading: isLoadingSectores } = useSectores();
  const [confirmOpen, setConfirmOpen] = useState(false);

  type Comuna = {
    id: string;
    codigo_comuna: string;
    nombre_comuna: string;
    status: boolean;
  };

  const [comunas, setComunas] = useState<Comuna[]>([]);
  const [isLoadingComunas, setIsLoadingComunas] = useState<boolean>(false);
  const [selectedComuna, setSelectedComuna] = useState<string>("");

  const [barriosOptions, setBarriosOptions] = useState<Array<{ nombre_barrio: string }>>([]);
  const [isLoadingBarriosLocal, setIsLoadingBarriosLocal] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        setIsLoadingComunas(true);
        const res = await get<{ data: Comuna[] }>("/api/v1/comunas?page=1&per_page=25");
        setComunas(res?.data || []);
      } catch (e) {
        console.error("Error cargando comunas", e);
      } finally {
        setIsLoadingComunas(false);
      }
    })();
  }, []);

  async function handleComunaChange(value: string) {
    setSelectedComuna(value);
    // Resetear barrio seleccionado si cambia la comuna
    setForm((prev) => ({ ...prev, nombre_barrio: "" }));
    setBarriosOptions([]);
    if (!value) return;
    try {
      setIsLoadingBarriosLocal(true);
      const barrios = await get<string[]>(`/api/v1/comunas/${encodeURIComponent(value)}/barrios`);
      setBarriosOptions((barrios || []).map((b) => ({ nombre_barrio: b })));
    } catch (e) {
      console.error("Error cargando barrios por comuna", e);
    } finally {
      setIsLoadingBarriosLocal(false);
    }
  }

  useEffect(() => {
    if (!initialData) return;
    const {
      nit,
      nombre_establecimiento,
      direccion,
      primer_nombre,
      segundo_nombre,
      primer_apellido,
      segundo_apellido,
      num_telefono,
      nombre_barrio,
      nombre_sector,
    } = initialData;
    setForm({
      nit,
      nombre_establecimiento,
      direccion,
      primer_nombre,
      segundo_nombre,
      primer_apellido,
      segundo_apellido,
      num_telefono,
      nombre_barrio,
      nombre_sector,
    });
    setTouched({});
    setErrors({});
  }, [initialData]);

  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  function validateCurrent() {
    const parsed = schema.safeParse(form);
    if (parsed.success) {
      setErrors({});
      return true;
    }
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path[0] as string;
      if (!fieldErrors[path]) fieldErrors[path] = issue.message;
    }
    setErrors(fieldErrors);
    return false;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const isValid = validateCurrent();
    if (!isValid) return;
    setConfirmOpen(true);
  }

  async function handleConfirmSave() {
    try {
      if (!validateCurrent()) return;
      await onSubmit(form);
      addToast({
        title: "Cambios guardados",
        description: "Los datos de usuario se actualizaron exitosamente.",
        color: "success",
      });
    } finally {
      setConfirmOpen(false);
    }
  }

  return (
    <>
    <form
      onSubmit={handleSubmit}
      role="form"
      aria-labelledby="perfil-title"
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="nit"
          name="nit"
          label="NIT"
          value={form.nit ?? ""}
          onValueChange={(v) => setForm((prev) => ({ ...prev, nit: v }))}
          onBlur={handleBlur as any}
          isInvalid={!!errors.nit && touched.nit}
          errorMessage={touched.nit ? errors.nit : undefined}
          isDisabled={isDisabled || isSubmitting}
          aria-describedby={errors.nit ? "nit-error" : undefined}
        />

        <Input
          id="nombre_establecimiento"
          name="nombre_establecimiento"
          label="Nombre del establecimiento"
          value={form.nombre_establecimiento ?? ""}
          onValueChange={(v) =>
            setForm((prev) => ({ ...prev, nombre_establecimiento: v }))
          }
          onBlur={handleBlur as any}
          isInvalid={!!errors.nombre_establecimiento && touched.nombre_establecimiento}
          errorMessage={touched.nombre_establecimiento ? errors.nombre_establecimiento : undefined}
          isDisabled={isDisabled || isSubmitting}
        />

        <div className="md:col-span-2">
          <AddressBuilderPopover
            value={form.direccion ?? ""}
            onChange={(direccion) => {
              setForm((prev) => ({ ...prev, direccion }));
              setTouched((prev) => ({ ...prev, direccion: true }));
            }}
            label="Dirección"
            required
            addLabel="Agregar dirección"
            editLabel="Editar"
          />
          {touched.direccion && errors.direccion && (
            <p className="text-danger text-sm mt-1" role="alert" id="direccion-error">
              {errors.direccion}
            </p>
          )}
        </div>

        <Input
          id="primer_nombre"
          name="primer_nombre"
          label="Primer nombre"
          value={form.primer_nombre ?? ""}
          onValueChange={(v) => setForm((prev) => ({ ...prev, primer_nombre: v }))}
          onBlur={handleBlur as any}
          isInvalid={!!errors.primer_nombre && touched.primer_nombre}
          errorMessage={touched.primer_nombre ? errors.primer_nombre : undefined}
          isDisabled={isDisabled || isSubmitting}
        />

        <Input
          id="segundo_nombre"
          name="segundo_nombre"
          label="Segundo nombre"
          value={form.segundo_nombre ?? ""}
          onValueChange={(v) => setForm((prev) => ({ ...prev, segundo_nombre: v }))}
          onBlur={handleBlur as any}
          isDisabled={isDisabled || isSubmitting}
        />

        <Input
          id="primer_apellido"
          name="primer_apellido"
          label="Primer apellido"
          value={form.primer_apellido ?? ""}
          onValueChange={(v) => setForm((prev) => ({ ...prev, primer_apellido: v }))}
          onBlur={handleBlur as any}
          isInvalid={!!errors.primer_apellido && touched.primer_apellido}
          errorMessage={touched.primer_apellido ? errors.primer_apellido : undefined}
          isDisabled={isDisabled || isSubmitting}
        />

        <Input
          id="segundo_apellido"
          name="segundo_apellido"
          label="Segundo apellido"
          value={form.segundo_apellido ?? ""}
          onValueChange={(v) => setForm((prev) => ({ ...prev, segundo_apellido: v }))}
          onBlur={handleBlur as any}
          isDisabled={isDisabled || isSubmitting}
        />

        <Input
          id="num_telefono"
          name="num_telefono"
          label="Teléfono"
          value={form.num_telefono ?? ""}
          onValueChange={(v) => setForm((prev) => ({ ...prev, num_telefono: v }))}
          onBlur={handleBlur as any}
          isInvalid={!!errors.num_telefono && touched.num_telefono}
          errorMessage={touched.num_telefono ? errors.num_telefono : undefined}
          isDisabled={isDisabled || isSubmitting}
        />

        <Select
          label="Comuna"
          placeholder={isLoadingComunas ? "Cargando comunas..." : "Selecciona una comuna"}
          selectedKeys={selectedComuna ? [selectedComuna] : []}
          onChange={(e) => handleComunaChange(e.target.value)}
          isLoading={isLoadingComunas}
          isDisabled={isDisabled || isSubmitting}
          aria-label="Seleccionar comuna"
        >
          {comunas.map((c) => (
            <SelectItem key={c.nombre_comuna}>{c.nombre_comuna}</SelectItem>
          ))}
        </Select>

        <Autocomplete
          label="Barrio"
          placeholder={selectedComuna ? "Busca y selecciona un barrio" : "Selecciona una comuna primero"}
          selectedKey={form.nombre_barrio ?? ""}
          onSelectionChange={(key) => {
            const selected = key ? String(key) : "";
            setForm((prev) => ({ ...prev, nombre_barrio: selected }));
            setTouched((prev) => ({ ...prev, nombre_barrio: true }));
          }}
          isLoading={isLoadingBarriosLocal}
          isDisabled={isDisabled || isSubmitting || !selectedComuna}
          isInvalid={!!errors.nombre_barrio && touched.nombre_barrio}
          errorMessage={touched.nombre_barrio ? errors.nombre_barrio : undefined}
          defaultItems={barriosOptions}
          aria-describedby={errors.nombre_barrio ? "nombre_barrio-error" : undefined}
          aria-label="Buscar y seleccionar barrio"
          isVirtualized
          listboxProps={{
            emptyContent: selectedComuna
              ? "No se encontraron barrios para la comuna seleccionada."
              : "Seleccione una comuna para ver los barrios.",
          }}
          popoverProps={{ offset: 10, placement: "bottom" }}
        >
          {(barrio) => (
            <AutocompleteItem key={barrio.nombre_barrio}>{barrio.nombre_barrio}</AutocompleteItem>
          )}
        </Autocomplete>

        <Select
          label="Sector"
          placeholder="Selecciona un sector"
          selectedKeys={form.nombre_sector ? [form.nombre_sector] : []}
          onChange={(e) => {
            const value = e.target.value;
            setForm((prev) => ({ ...prev, nombre_sector: value }));
            setTouched((prev) => ({ ...prev, nombre_sector: true }));
          }}
          isLoading={isLoadingSectores}
          isInvalid={!!errors.nombre_sector && touched.nombre_sector}
          errorMessage={touched.nombre_sector ? errors.nombre_sector : undefined}
          isDisabled={isDisabled || isSubmitting}
          aria-describedby={errors.nombre_sector ? "nombre_sector-error" : undefined}
          aria-label="Seleccionar sector"
        >
          {sectores.map((sector) => (
            <SelectItem key={sector.nombre_sector}>{sector.nombre_sector}</SelectItem>
          ))}
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          color="primary"
          isDisabled={isDisabled || isSubmitting}
          isLoading={isSubmitting}
          aria-busy={isSubmitting}
          aria-live="polite"
          aria-label={isSubmitting ? "Guardando, espere" : "Guardar cambios"}
        >
          Guardar cambios
        </Button>
      </div>
    </form>

    <AlertConfirm
      isOpen={confirmOpen}
      onClose={() => setConfirmOpen(false)}
      title="Confirmar guardado"
      message="¿Está seguro de guardar los cambios de su perfil?"
      confirmText="Sí, guardar"
      cancelText="Cancelar"
      onConfirm={handleConfirmSave}
      type="warning"
      confirmColor="primary"
    />
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import UsuariosEstrategicosTable from "@/components/admin/UsuariosEstrategicosTable";
import { registroSectorEstrategico } from "@/services/admin/registroSectorEstrategico.service";
import { addToast } from "@heroui/toast";
import {
  SectoresService,
  type Sector,
} from "@/services/shared/sectoresService";
import {
  Input,
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";
import AddressBuilderPopover from "@/components/shared/Address/AddressBuilderPopover";
import { get } from "@/utils/shared/apiUtils";

interface Establecimiento {
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido: string;
  correo: string;
  contraseña: string;
  establecimiento: string;
  nit: string;
  sector: string;
  comuna: string;
  barrio: string;
  direccion: string;
  num_telefono: string;
}

// Mock inicial de establecimientos
const MOCK_ESTABLECIMIENTOS: Establecimiento[] = [
  {
    primerNombre: "Juan",
    segundoNombre: "Carlos",
    primerApellido: "Pérez",
    segundoApellido: "Gómez",
    correo: "juan@example.com",
    contraseña: "123456",
    establecimiento: "Colegio ABC",
    nit: "123456789",
    sector: "Educación",
    comuna: "Comuna 1",
    barrio: "Barrio Centro",
    direccion: "Calle 1 #2-3",
    num_telefono: "3001234567",
  },
  {
    primerNombre: "Ana",
    segundoNombre: "María",
    primerApellido: "Lopez",
    segundoApellido: "Ramirez",
    correo: "ana@example.com",
    contraseña: "abcdef",
    establecimiento: "Liceo XYZ",
    nit: "987654321",
    sector: "Educación",
    comuna: "Comuna 2",
    barrio: "Barrio Norte",
    direccion: "Carrera 4 #5-6",
    num_telefono: "3109876543",
  },
];

// Cambia a true para usar el endpoint real cuando esté listo
const useRealEndpoint = false;

// Aquí pon la URL de tu endpoint real
const REAL_ENDPOINT_URL = "https://tu-api.com/establecimientos";

export default function RegisterPage() {
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>(
    []
  );
  const [formData, setFormData] = useState<Establecimiento>({
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    correo: "",
    contraseña: "",
    establecimiento: "",
    nit: "",
    sector: "",
    comuna: "",
    barrio: "",
    direccion: "",
    num_telefono: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [loadingCat, setLoadingCat] = useState(true);

  // Comunas y barrios dependientes
  type Comuna = {
    id: string;
    codigo_comuna: string;
    nombre_comuna: string;
    status: boolean;
  };

  const [comunas, setComunas] = useState<Comuna[]>([]);
  const [isLoadingComunas, setIsLoadingComunas] = useState<boolean>(false);
  const [selectedComuna, setSelectedComuna] = useState<string>("");

  const [barriosOptions, setBarriosOptions] = useState<string[]>([]);
  const [isLoadingBarriosLocal, setIsLoadingBarriosLocal] =
    useState<boolean>(false);

  useEffect(() => {
    if (useRealEndpoint) {
      setLoading(true);
      setError(null);
      fetch(REAL_ENDPOINT_URL)
        .then((res) => {
          if (!res.ok) throw new Error("Error al obtener datos");
          return res.json();
        })
        .then((data: Establecimiento[]) => {
          setEstablecimientos(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    } else {
      // Usar mock
      setEstablecimientos(MOCK_ESTABLECIMIENTOS);
    }
    // Cargar catálogos
    (async () => {
      try {
        setLoadingCat(true);
        const [cRes, sRes] = await Promise.all([
          get<{ data: Comuna[] }>(`/api/v1/comunas?page=1&per_page=25`),
          SectoresService.getAllSectores(),
        ]);
        setComunas(cRes?.data || []);
        setSectores(sRes || []);
      } catch (e) {
        console.error("Error cargando catálogos:", e);
      } finally {
        setLoadingCat(false);
      }
    })();
  }, []);

  async function handleComunaChange(value: string) {
    setSelectedComuna(value);
    setFormData((prev) => ({ ...prev, comuna: value, barrio: "" }));
    setBarriosOptions([]);
    if (!value) return;
    try {
      setIsLoadingBarriosLocal(true);
      const barrios = await get<string[]>(
        `/api/v1/comunas/${encodeURIComponent(value)}/barrios`
      );
      setBarriosOptions(barrios || []);
    } catch (e) {
      console.error("Error cargando barrios por comuna", e);
    } finally {
      setIsLoadingBarriosLocal(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputValue = (name: keyof Establecimiento) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        nit: formData.nit,
        nombre_establecimiento: formData.establecimiento,
        sector: formData.sector,
        direccion: formData.direccion,
        barrio: formData.barrio,
        email: formData.correo,
        contraseña: formData.contraseña,
        primer_nombre: formData.primerNombre,
        primer_apellido: formData.primerApellido,
        num_telefono: formData.num_telefono,
      } as const;

      await registroSectorEstrategico(payload);
      addToast({
        title: "Usuario creado",
        description: "El usuario de sector estratégico fue registrado.",
        color: "success",
      });

      setEstablecimientos((prev) => [...prev, formData]);
      setFormData({
        primerNombre: "",
        segundoNombre: "",
        primerApellido: "",
        segundoApellido: "",
        correo: "",
        contraseña: "",
        establecimiento: "",
        nit: "",
        sector: "",
        comuna: "",
        barrio: "",
        direccion: "",
        num_telefono: "",
      });
    } catch (err: any) {
      addToast({
        title: "Error al crear usuario",
        description: err?.message || "No se pudo registrar el usuario.",
        color: "danger",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses = (value: string) =>
    `flex h-11 px-3.5 py-2 items-center border-[1.5px] rounded-[0.5625rem]
    bg-transparent border-[#E4E4E7]
    focus:outline-none focus:border-[#5F8244] focus:ring-1 focus:ring-[#5F8244]
    ${value ? "bg-[#5F8244]/10" : ""}`;

  return (
    <div className="p-8 space-y-10 bg-[#f9f9f9] min-h-screen">
      {/* Bienvenida */}
      <div className="flex items-baseline space-x-2 mb-6">
        <h1 className="text-2xl font-normal">Gestión de usuarios</h1>
      </div>

      {/* Tabla dinámica de establecimientos */}
      <UsuariosEstrategicosTable />

      {/* Mostrar estado de carga o error */}
      {loading && (
        <div className="text-center text-gray-600 mb-4">
          Cargando establecimientos...
        </div>
      )}
      {error && (
        <div className="text-center text-red-600 mb-4">Error: {error}</div>
      )}

      {/* Formulario */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="font-bold mt-2 mb-6">Registro de establecimiento</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Fila 1: Nombres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Primer nombre"
              name="primerNombre"
              value={formData.primerNombre}
              onValueChange={handleInputValue("primerNombre")}
              isRequired
              placeholder="Ingrese su primer nombre"
              variant="bordered"
            />
            <Input
              label="Segundo nombre"
              name="segundoNombre"
              value={formData.segundoNombre ?? ""}
              onValueChange={handleInputValue("segundoNombre")}
              placeholder="Ingrese su segundo nombre (opcional)"
              variant="bordered"
            />
          </div>

          {/* Fila 2: Apellidos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Primer apellido"
              name="primerApellido"
              value={formData.primerApellido}
              onValueChange={handleInputValue("primerApellido")}
              isRequired
              placeholder="Ingrese su primer apellido"
              variant="bordered"
            />
            <Input
              label="Segundo apellido"
              name="segundoApellido"
              value={formData.segundoApellido}
              onValueChange={handleInputValue("segundoApellido")}
              placeholder="Ingrese su segundo apellido"
              variant="bordered"
            />
          </div>

          {/* Fila 3: Correo - Contraseña */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Correo electrónico"
              name="correo"
              type="email"
              value={formData.correo}
              onValueChange={handleInputValue("correo")}
              isRequired
              placeholder="ejemplo@correo.com"
              variant="bordered"
              autoComplete="email"
            />
            <Input
              label="Contraseña"
              name="contraseña"
              type="password"
              value={formData.contraseña}
              onValueChange={handleInputValue("contraseña")}
              isRequired
              placeholder="Ingrese una contraseña segura"
              variant="bordered"
              autoComplete="new-password"
            />
          </div>

          {/* Fila 4: Establecimiento - NIT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nombre del establecimiento"
              name="establecimiento"
              value={formData.establecimiento}
              onValueChange={handleInputValue("establecimiento")}
              isRequired
              placeholder="Ingrese el nombre del establecimiento"
              variant="bordered"
            />
            <Input
              label="NIT"
              name="nit"
              value={formData.nit}
              onValueChange={handleInputValue("nit")}
              isRequired
              placeholder="Ingrese el NIT"
              variant="bordered"
            />
          </div>

          {/* Fila 5: Sector - Comuna - Barrio */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Select
              label="Sector"
              placeholder="Seleccione un sector"
              selectedKeys={
                formData.sector ? new Set([formData.sector]) : new Set()
              }
              onSelectionChange={(keys) => {
                const val = Array.from(keys as Set<string>)[0] || "";
                setFormData((prev) => ({ ...prev, sector: val }));
              }}
              isRequired
              variant="bordered"
              aria-label="Seleccionar sector"
            >
              {sectores.map((s) => (
                <SelectItem key={s.nombre_sector}>{s.nombre_sector}</SelectItem>
              ))}
            </Select>
            <Select
              label="Comuna"
              placeholder={
                isLoadingComunas
                  ? "Cargando comunas..."
                  : "Seleccione una comuna"
              }
              selectedKeys={formData.comuna ? [formData.comuna] : []}
              onChange={(e) => handleComunaChange(e.target.value)}
              isRequired
              isLoading={isLoadingComunas}
              variant="bordered"
              aria-label="Seleccionar comuna"
              name="comuna"
            >
              {comunas.map((c) => (
                <SelectItem key={c.nombre_comuna}>{c.nombre_comuna}</SelectItem>
              ))}
            </Select>
            <Autocomplete
              label="Barrio"
              placeholder={
                selectedComuna
                  ? "Busca y selecciona un barrio"
                  : "Seleccione una comuna primero"
              }
              selectedKey={formData.barrio}
              onSelectionChange={(key) => {
                const selected = key ? String(key) : "";
                setFormData((prev) => ({ ...prev, barrio: selected }));
              }}
              isDisabled={!selectedComuna}
              isLoading={isLoadingBarriosLocal}
              variant="bordered"
              aria-label="Buscar y seleccionar barrio"
            >
              {barriosOptions.map((b) => (
                <AutocompleteItem key={b}>{b}</AutocompleteItem>
              ))}
            </Autocomplete>
          </div>

          {/* Fila 6: Dirección - Teléfono */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <AddressBuilderPopover
                label="Dirección"
                required
                value={formData.direccion}
                onChange={(direccion) =>
                  setFormData((prev) => ({ ...prev, direccion }))
                }
                addLabel="Agregar dirección"
                editLabel="Editar"
              />
            </div>
            <Input
              label="Teléfono"
              name="num_telefono"
              type="tel"
              value={formData.num_telefono}
              onValueChange={handleInputValue("num_telefono")}
              isRequired
              placeholder="Ingrese el número de teléfono"
              variant="bordered"
            />
          </div>

          {/* Botón de registrar */}
          <div className="flex mt-6">
            <button
              type="submit"
              disabled={submitting}
              className={`flex w-full md:w-[23.67188rem] px-4 py-2 justify-center items-center gap-1 rounded-xl text-white font-semibold shadow-md transition-colors ${
                submitting
                  ? "bg-[#5F8244]/60 cursor-not-allowed"
                  : "bg-[#5F8244] hover:bg-[#4e6b38]"
              }`}
            >
              {submitting ? "Registrando..." : "Registrar usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

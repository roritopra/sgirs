"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/funcionario/residuos-aprovechables/Card";
import ToggleOrganicos from "@/components/funcionario/ToggleOrganicos";
import { Recycle, UserRound } from "lucide-react";
import TableRSO from "@/components/funcionario/residuos-organicos/TableRSO";
import EstablecimientosTabla from "@/components/funcionario/EstablecimientosTabla";
import { getCardsRSO } from "@/services/funcionario/residuos-organicos/getCardsRSO.service";
import MapTableCard, { Comuna } from "@/components/funcionario/MapTableCard";
import { getComunasCompostaje } from "@/services/funcionario/residuos-organicos/getComunasCompostaje.service";
import { getComunasRSO } from "@/services/funcionario/residuos-organicos/getComunasRSO";
import { getComunasRsoNoGestor } from "@/services/funcionario/residuos-organicos/getComunasRsoNoGestor.service";
import {
  getEstablecimientosRsoTabla,
  TipoEstablecimientos,
} from "@/services/funcionario/residuos-organicos/getEstablecimientosRsoTabla.service";
import { Select, SelectItem } from "@heroui/react";
import { getPeriodosDisponibles } from "@/services/funcionario/dashboard/getPeriodosDisponibles.service";
import RSOMetricasBar from "@/components/funcionario/residuos-organicos/RSOMetricasBar";
import { getGeneranRsoPorComunaPorcentaje } from "@/services/funcionario/residuos-organicos/getGeneranRsoPorComunaPorcentaje.service";

export default function FuncionarioPage() {
  const [selectedOption, setSelectedOption] = useState<number>(1);
  const [cardsData, setCardsData] = useState<{
    est_generan_rso: number;
    est_con_compostaje: number;
    est_sin_gestion: number;
  } | null>(null);
  const [isLoadingCards, setIsLoadingCards] = useState<boolean>(false);
  const [errorCards, setErrorCards] = useState<string | null>(null);
  const [comunasData, setComunasData] = useState<Comuna[]>([]);
  const [isLoadingComunas, setIsLoadingComunas] = useState<boolean>(false);

  // Estado para tabla de establecimientos (toggle 2 y 3)
  const [tablaData, setTablaData] = useState<
    {
      nombre: string;
      responsable: string;
      direccion: string;
      telefono: string;
      barrio: string;
      comuna: number | string;
      sector?: string;
    }[]
  >([]);
  const [searchTabla, setSearchTabla] = useState<string>("");
  const [pageTabla, setPageTabla] = useState<number>(1);
  const [limitTabla, setLimitTabla] = useState<number>(20);
  const [totalTabla, setTotalTabla] = useState<number>(0);
  const [isLoadingTabla, setIsLoadingTabla] = useState<boolean>(false);
  const [periodos, setPeriodos] = useState<string[]>([]);
  const [periodo, setPeriodo] = useState<string | null>(null);
  const [isLoadingPeriodos, setIsLoadingPeriodos] = useState<boolean>(false);

  const handleSelect = (id: number) => {
    setSelectedOption(id);
  };

  // Cargar periodos al iniciar
  useEffect(() => {
    setIsLoadingPeriodos(true);
    getPeriodosDisponibles()
      .then((list) => {
        setPeriodos(list);
        setPeriodo((prev) => prev ?? (list[0] ?? null));
      })
      .catch(console.error)
      .finally(() => setIsLoadingPeriodos(false));
  }, []);

  // Cargar tarjetas por periodo
  useEffect(() => {
    if (!periodo) return;
    const load = async () => {
      try {
        setIsLoadingCards(true);
        setErrorCards(null);
        const data = await getCardsRSO({ periodo });
        setCardsData(data);
      } catch (e) {
        setCardsData(null);
        setErrorCards("No se pudieron cargar los indicadores de RSO");
      } finally {
        setIsLoadingCards(false);
      }
    };
    load();
  }, [periodo]);

  useEffect(() => {
    if (!periodo) return;
    const load = async () => {
      try {
        setIsLoadingComunas(true);
        if (selectedOption === 1) {
          const data = await getGeneranRsoPorComunaPorcentaje({ periodo });
          setComunasData(data);
        } else if (selectedOption === 2) {
          const data = await getComunasCompostaje({ periodo });
          setComunasData(data);
        } else if (selectedOption === 3) {
          const data = await getComunasRsoNoGestor({ periodo });
          setComunasData(data);
        } else {
          setComunasData([]);
        }
      } catch (e) {
        setComunasData([]);
      } finally {
        setIsLoadingComunas(false);
      }
    };
    load();
  }, [selectedOption, periodo]);

  // Cargar tabla según toggle (2: con compostaje, 3: sin gestión)
  useEffect(() => {
    const loadTabla = async () => {
      if (!periodo || (selectedOption !== 2 && selectedOption !== 3)) return;
      try {
        setIsLoadingTabla(true);
        const tipo: TipoEstablecimientos =
          selectedOption === 2 ? "con_compostaje" : "sin_gestion";
        const res = await getEstablecimientosRsoTabla({
          tipo,
          search: searchTabla,
          page: pageTabla,
          limit: limitTabla,
          periodo,
        });
        setTablaData(
          res.data.map((e) => ({
            nombre: e.nombre,
            responsable: e.responsable,
            direccion: e.direccion,
            telefono: e.telefono,
            barrio: e.barrio,
            comuna: e.comuna,
            sector: e.sector,
          }))
        );
        setTotalTabla(res.total);
      } catch (e) {
        setTablaData([]);
        setTotalTabla(0);
      } finally {
        setIsLoadingTabla(false);
      }
    };
    loadTabla();
  }, [selectedOption, searchTabla, pageTabla, limitTabla, periodo]);

  // Resetear tabla al cambiar de opción
  useEffect(() => {
    setSearchTabla("");
    setPageTabla(1);
    setLimitTabla(20);
    setTotalTabla(0);
    setTablaData([]);
  }, [selectedOption]);

  return (
    <div className="p-8 space-y-10 bg-[#f9f9f9] min-h-screen">
      {/* Filtro de periodo */}
      <div className="w-full max-w-sm" role="group" aria-labelledby="periodo-label">
        <label id="periodo-label" className="sr-only">Filtro de periodo</label>
        <Select
          label="Filtro por periodo"
          labelPlacement="outside"
          variant="faded"
          placeholder={isLoadingPeriodos ? "Cargando periodos..." : "Selecciona un periodo"}
          selectedKeys={periodo ? [periodo] : []}
          onSelectionChange={(keys) => {
            const key = Array.from(keys)[0] as string;
            setPeriodo(key);
            setPageTabla(1);
          }}
          isDisabled={isLoadingPeriodos || periodos.length === 0}
          aria-label="Filtro por periodo para todos los componentes de la página"
        >
          {periodos.map((p) => (
            <SelectItem key={p} aria-label={`Periodo ${p}`}>
              {p}
            </SelectItem>
          ))}
        </Select>
      </div>
      <h1 className="text-2xl font-normal">
        Indicadores de residuos orgánicos (RSO)
      </h1>

      {/* Cards */}
      <div className="flex flex-col lg:flex-row gap-4 w-full mb-4">
        <div className="flex-1 flex flex-row justify-between gap-4 relative">
          {isLoadingCards && (
            <div
              className="absolute inset-0 z-[9999] bg-white/60 backdrop-blur-sm flex items-center justify-center"
              role="status"
              aria-live="polite"
              aria-label="Cargando indicadores del periodo seleccionado"
            >
              <div className="h-9 w-9 rounded-full border-4 border-[#7FB927] border-t-transparent animate-spin" aria-hidden="true" />
            </div>
          )}
          {!isLoadingCards && errorCards && (
            <div
              className="w-full text-center text-sm text-red-600"
              role="alert"
              aria-live="polite"
            >
              {errorCards}
            </div>
          )}
          {!isLoadingCards && !errorCards && cardsData && (
            <>
              <Card
                title="Establecimientos que generan RSO"
                value={cardsData.est_generan_rso}
                icon={UserRound}
                iconColor="#8280FF"
                bgColor="#E4E4FF"
                className="flex-1"
              />
              <Card
                title="Establecimientos con tratamiento in situ"
                value={cardsData.est_con_compostaje}
                icon={Recycle}
                iconColor="#7FB927"
                bgColor="#E4FFBA"
                className="flex-1"
              />
              <Card
                title="Establecimientos sin gestor"
                value={cardsData.est_sin_gestion}
                icon={UserRound}
                iconColor="#80B3FF"
                bgColor="#E4EEFF"
                className="flex-1"
              />
            </>
          )}
        </div>
      </div>

      {/* Métricas RSO - barras resumen */}
      <RSOMetricasBar periodo={periodo ?? undefined} />

      {/* Sección de búsqueda */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h1 className="text-2xl font-normal mb-4">Reportes por comuna</h1>

        <ToggleOrganicos selected={selectedOption} onSelect={handleSelect} />

        {selectedOption === 1 && (
          <>
            <MapTableCard
              data={comunasData}
              title="Usuarios que generan RSO por comuna (porcentaje)"
              subtitle="Mapa coroplético de usuarios que generan RSO por comuna"
              isLoading={isLoadingComunas}
            />
            <TableRSO periodo={periodo ?? undefined} />
          </>
        )}
        {selectedOption === 2 && (
          <>
            <MapTableCard
              data={comunasData}
              title="Distribución por comuna de establecimientos con compostaje"
              subtitle="Mapa coroplético de establecimientos con compostaje por comuna"
              isLoading={isLoadingComunas}
            />
            <EstablecimientosTabla
              data={tablaData}
              title="Establecimientos registrados"
              subtitle="Listado detallado de establecimientos con su información básica"
              search={searchTabla}
              onSearchChange={(v) => {
                setSearchTabla(v);
                setPageTabla(1);
              }}
              page={pageTabla}
              limit={limitTabla}
              total={totalTabla}
              onPageChange={(p) => setPageTabla(p)}
              isLoading={isLoadingTabla}
            />
          </>
        )}
        {selectedOption === 3 && (
          <>
            <MapTableCard
              data={comunasData}
              title="Usuarios que generan RSO y no tienen gestor ni tratamiento en sitio"
              subtitle="Mapa coroplético de usuarios que generan RSO y no tienen gestor ni tratamiento en sitio por comuna"
              isLoading={isLoadingComunas}
            />
            <EstablecimientosTabla
              data={tablaData}
              title="Establecimientos registrados"
              subtitle="Listado detallado de establecimientos con su información básica"
              search={searchTabla}
              onSearchChange={(v) => {
                setSearchTabla(v);
                setPageTabla(1);
              }}
              page={pageTabla}
              limit={limitTabla}
              total={totalTabla}
              onPageChange={(p) => setPageTabla(p)}
              isLoading={isLoadingTabla}
            />
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Recycle, UserRound, ClipboardPlus } from "lucide-react";
import ToggleRespel from "@/components/funcionario/residuos-aprovechables/ToggleRespel";
import TableRespel from "@/components/funcionario/indicadores-respel/TableRespel";
import TableSinRespel from "@/components/funcionario/indicadores-respel/TablesinRespel";
import TableRcd from "@/components/funcionario/indicadores-respel/TableRcd";
import TableSinRcd from "@/components/funcionario/indicadores-respel/TableSinRcd";
import Card from "@/components/funcionario/residuos-aprovechables/Card";
import MapTableCard, { Comuna } from "@/components/funcionario/MapTableCard";
import EstablecimientosTablaSinGestor from "@/components/funcionario/residuos-aprovechables/EstablecimientosTablaSinGestor";

// servicios
import { getCardsRespelRaeeRcd } from "@/services/funcionario/raee-respel-rcd/getCardsRespelRaeeRcd.service";
import { getDistribucionRaeePorComuna } from "@/services/funcionario/raee-respel-rcd/getDistribucionRaeePorComuna.service";
import { getDistribucionRespelPorComuna } from "@/services/funcionario/raee-respel-rcd/getDistribucionRespelPorComuna.service";
import { getDistribucionRcdPorComuna } from "@/services/funcionario/raee-respel-rcd/getDistribucionRcdPorComuna.service";
import { Select, SelectItem } from "@heroui/react";
import { getPeriodosDisponibles } from "@/services/funcionario/dashboard/getPeriodosDisponibles.service";

export default function FuncionarioPage() {
  const [selectedOption, setSelectedOption] = useState<number>(1);
  const [cardsData, setCardsData] = useState<{
    est_rec_aut_respel: number;
    est_sin_rec_aut_respel: number;
    est_rec_aut_rcd: number;
    est_sin_rec_aut_rcd: number;
    est_rec_aut_raee: number;
    est_sin_rec_aut_raee: number;
    total_reportes: number;
  } | null>(null);
  const [isLoadingCards, setIsLoadingCards] = useState<boolean>(false);
  const [errorCards, setErrorCards] = useState<string | null>(null);
  const [comunasConData, setComunasConData] = useState<Comuna[]>([]);
  const [comunasSinData, setComunasSinData] = useState<Comuna[]>([]);
  const [isLoadingComunasRaee, setIsLoadingComunasRaee] =
    useState<boolean>(false);
  const [errorComunasRaee, setErrorComunasRaee] = useState<string | null>(null);
  const [isLoadingComunasRespel, setIsLoadingComunasRespel] =
    useState<boolean>(false);
  const [errorComunasRespel, setErrorComunasRespel] = useState<string | null>(
    null
  );
  const [isLoadingComunasRcd, setIsLoadingComunasRcd] =
    useState<boolean>(false);
  const [errorComunasRcd, setErrorComunasRcd] = useState<string | null>(null);
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
        setPeriodo((prev) => prev ?? list[0] ?? null);
      })
      .catch(console.error)
      .finally(() => setIsLoadingPeriodos(false));
  }, []);

  // Cargar tarjetas por periodo
  useEffect(() => {
    if (!periodo) return;
    const loadCards = async () => {
      try {
        setIsLoadingCards(true);
        setErrorCards(null);
        const data = await getCardsRespelRaeeRcd({ periodo });
        setCardsData(data);
      } catch (e) {
        setCardsData(null);
        setErrorCards("No se pudieron cargar los indicadores");
      } finally {
        setIsLoadingCards(false);
      }
    };
    loadCards();
  }, [periodo]);

  useEffect(() => {
    if (!periodo) return;
    if (selectedOption === 1) {
      // RAEE
      const loadRaeeData = async () => {
        try {
          setIsLoadingComunasRaee(true);
          setErrorComunasRaee(null);
          const [conAutorizado, sinAutorizado] = await Promise.all([
            getDistribucionRaeePorComuna(true, { periodo }),
            getDistribucionRaeePorComuna(false, { periodo }),
          ]);
          setComunasConData(conAutorizado);
          setComunasSinData(sinAutorizado);
        } catch (e) {
          setComunasConData([]);
          setComunasSinData([]);
          setErrorComunasRaee(
            "No se pudieron cargar los datos de distribución RAEE"
          );
        } finally {
          setIsLoadingComunasRaee(false);
        }
      };
      loadRaeeData();
    } else if (selectedOption === 2) {
      // RESPEL
      const loadRespelData = async () => {
        try {
          setIsLoadingComunasRespel(true);
          setErrorComunasRespel(null);
          const [conAutorizado, sinAutorizado] = await Promise.all([
            getDistribucionRespelPorComuna(true, { periodo }),
            getDistribucionRespelPorComuna(false, { periodo }),
          ]);
          setComunasConData(conAutorizado);
          setComunasSinData(sinAutorizado);
        } catch (e) {
          setComunasConData([]);
          setComunasSinData([]);
          setErrorComunasRespel(
            "No se pudieron cargar los datos de distribución RESPEL"
          );
        } finally {
          setIsLoadingComunasRespel(false);
        }
      };
      loadRespelData();
    } else if (selectedOption === 3) {
      // RCD
      const loadRcdData = async () => {
        try {
          setIsLoadingComunasRcd(true);
          setErrorComunasRcd(null);
          const [conAutorizado, sinAutorizado] = await Promise.all([
            getDistribucionRcdPorComuna(true, { periodo }),
            getDistribucionRcdPorComuna(false, { periodo }),
          ]);
          setComunasConData(conAutorizado);
          setComunasSinData(sinAutorizado);
        } catch (e) {
          setComunasConData([]);
          setComunasSinData([]);
          setErrorComunasRcd(
            "No se pudieron cargar los datos de distribución RCD"
          );
        } finally {
          setIsLoadingComunasRcd(false);
        }
      };
      loadRcdData();
    }
  }, [selectedOption, periodo]);

  return (
    <div className="p-8 space-y-10 bg-[#f9f9f9] min-h-screen">
      {/* Filtro de periodo */}
      <div
        className="w-full max-w-sm"
        role="group"
        aria-labelledby="periodo-label"
      >
        <label id="periodo-label" className="sr-only">
          Filtro de periodo
        </label>
        <Select
          label="Filtro por periodo"
          labelPlacement="outside"
          variant="faded"
          placeholder={
            isLoadingPeriodos ? "Cargando periodos..." : "Selecciona un periodo"
          }
          selectedKeys={periodo ? [periodo] : []}
          onSelectionChange={(keys) => {
            const key = Array.from(keys)[0] as string;
            setPeriodo(key);
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
        Indicadores de RAEE, RESPEL y RCD
      </h1>

      {/* Cards dinámicas */}
      <div className="flex flex-col lg:flex-row gap-4 w-full mb-4">
        <div className="flex-1 flex flex-row justify-between gap-4 flex-wrap">
          {isLoadingCards && (
            <div
              className="w-full flex items-center justify-center py-8"
              role="status"
              aria-live="polite"
            >
              <span className="text-sm text-gray-600">
                Cargando indicadores…
              </span>
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
                title="Total de reportes"
                value={cardsData.total_reportes}
                icon={ClipboardPlus}
                iconColor="#80B3FF"
                bgColor="#E4EEFF"
                className="flex-1"
              />
              <></>
              {selectedOption === 1 && (
                <>
                  <Card
                    title="Establecimientos entrega RAEE a gestor autorizado"
                    value={cardsData.est_rec_aut_raee}
                    icon={UserRound}
                    iconColor="#80B3FF"
                    bgColor="#E4EEFF"
                    className="flex-1"
                  />
                  <Card
                    title="Establecimientos que generan RAEE pero no entregan a gestor autorizado"
                    value={cardsData.est_sin_rec_aut_raee}
                    icon={UserRound}
                    iconColor="#FF8080"
                    bgColor="#FFE4E4"
                    className="flex-1"
                  />
                </>
              )}
              {selectedOption === 2 && (
                <>
                  <Card
                    title="Establecimientos entrega RESPEL a gestor autorizado"
                    value={cardsData.est_rec_aut_respel}
                    icon={Recycle}
                    iconColor="#7FB927"
                    bgColor="#E4FFBA"
                    className="flex-1"
                  />
                  <Card
                    title="Establecimientos que generan RESPEL pero no entregan a gestor autorizado"
                    value={cardsData.est_sin_rec_aut_respel}
                    icon={UserRound}
                    iconColor="#8280FF"
                    bgColor="#E4E4FF"
                    className="flex-1"
                  />
                </>
              )}
              {selectedOption === 3 && (
                <>
                  <Card
                    title="Establecimientos entrega RCD a gestor autorizado"
                    value={cardsData.est_rec_aut_rcd}
                    icon={UserRound}
                    iconColor="#80B3FF"
                    bgColor="#E4EEFF"
                    className="flex-1"
                  />
                  <Card
                    title="Establecimientos que generan RCD pero no entregan a gestor autorizado"
                    value={cardsData.est_sin_rec_aut_rcd}
                    icon={UserRound}
                    iconColor="#FF8080"
                    bgColor="#FFE4E4"
                    className="flex-1"
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tablas y Mapas */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h1 className="text-2xl font-normal mb-4">Busca tipo de residuo</h1>

        <ToggleRespel selected={selectedOption} onSelect={handleSelect} />

        {/* RAEE */}
        {selectedOption === 1 && (
          <>
            <MapTableCard
              data={comunasConData}
              title="Distribución de establecimientos con RAEE autorizado"
              subtitle="Mapa coroplético de RAEE con recolección autorizada"
              isLoading={isLoadingComunasRaee}
            />
            <div className="pt-6 pb-10">
              <EstablecimientosTablaSinGestor
                isLoading={isLoadingComunasRaee}
                error={errorComunasRaee}
                periodo={periodo ?? undefined}
              />
            </div>

            <div className="mt-6">
              <MapTableCard
                data={comunasSinData}
                title="Distribución de establecimientos sin RAEE autorizado"
                subtitle="Mapa coroplético de RAEE sin recolección autorizada"
                isLoading={isLoadingComunasRaee}
              />
            </div>
          </>
        )}

        {/* RESPEL */}
        {selectedOption === 2 && (
          <>
            <MapTableCard
              data={comunasConData}
              title="Distribución de establecimientos con RESPEL autorizado"
              subtitle="Mapa coroplético de RESPEL con recolección autorizada"
              isLoading={isLoadingComunasRespel}
            />
            <div className="pt-6 pb-10">
              <TableRespel periodo={periodo ?? undefined} />
            </div>
            <MapTableCard
              data={comunasSinData}
              title="Distribución de establecimientos sin RESPEL autorizado"
              subtitle="Mapa coroplético de RESPEL sin recolección autorizada"
              isLoading={isLoadingComunasRespel}
            />
            <div className="pt-6 pb-10">
              <TableSinRespel periodo={periodo ?? undefined} />
            </div>
          </>
        )}

        {/* RCD */}
        {selectedOption === 3 && (
          <>
            <MapTableCard
              data={comunasConData}
              title="Distribución de establecimientos con RCD autorizado"
              subtitle="Mapa coroplético de RCD con recolección autorizada"
              isLoading={isLoadingComunasRcd}
            />
            <div className="pt-6 pb-10">
              <TableRcd periodo={periodo ?? undefined} />
            </div>
            <MapTableCard
              data={comunasSinData}
              title="Distribución de establecimientos sin RCD autorizado"
              subtitle="Mapa coroplético de RCD sin recolección autorizada"
              isLoading={isLoadingComunasRcd}
            />
            <div className="pt-6 pb-10">
              <TableSinRcd periodo={periodo ?? undefined} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

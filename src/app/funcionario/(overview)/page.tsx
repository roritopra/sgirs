"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/funcionario/residuos-aprovechables/Card";
import ToggleSelectorCard from "@/components/funcionario/residuos-aprovechables/ToggleSelectorCard";
import DistribucionUsuariosChart from "@/components/funcionario/residuos-aprovechables/DistribucionUsuariosChart";
import EstablecimientosTabla, {
  Establecimiento,
} from "@/components/funcionario/residuos-aprovechables/EstablecimientosTablaCCU";
import MapTableCard, { Comuna } from "@/components/funcionario/MapTableCard";
import { Recycle, UserRound } from "lucide-react";
import { Select, SelectItem } from "@heroui/react";
import {
  getCardsResiduos,
  CardsResiduos,
} from "@/services/funcionario/residuos-aprovechables/getCardsResiduos.service";
import {
  getRankingPorComuna,
  RankingComuna,
} from "@/services/funcionario/residuos-aprovechables/getComunasOro.service";
import { getEstablecimientosRA } from "@/services/funcionario/residuos-aprovechables/getEstablecimientos";
import { getEstablecimientosRASinGestor } from "@/services/funcionario/residuos-aprovechables/getEstablecimientosSinGestor.service";
import { getPeriodosDisponibles } from "@/services/funcionario/dashboard/getPeriodosDisponibles.service";

export default function FuncionarioPage() {
  const [selectedOption, setSelectedOption] = useState<number>(1);
  const [cardsData, setCardsData] = useState<CardsResiduos | null>(null);
  const [comunasData, setComunasData] = useState<Comuna[]>([]);
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>(
    []
  );
  const [isLoadingRanking, setIsLoadingRanking] = useState<boolean>(false);
  const [isLoadingEst, setIsLoadingEst] = useState<boolean>(false);
  const [isLoadingCards, setIsLoadingCards] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [filtro, setFiltro] = useState<"todos" | "con_ccu" | "sin_ccu">(
    "todos"
  );
  const [pageNum, setPageNum] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const [periodos, setPeriodos] = useState<string[]>([]);
  const [periodo, setPeriodo] = useState<string | null>(null);
  const [isLoadingPeriodos, setIsLoadingPeriodos] = useState<boolean>(false);

  const handleSelect = (id: number) => {
    setSelectedOption(id);
  };

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

  useEffect(() => {
    if (!periodo) return;
    setIsLoadingCards(true);
    getCardsResiduos({ periodo })
      .then(setCardsData)
      .catch(console.error)
      .finally(() => setIsLoadingCards(false));
  }, [periodo]);

  useEffect(() => {
    if (!periodo) return;
    const tipo =
      selectedOption === 1
        ? "oro"
        : selectedOption === 2
        ? "no_oro"
        : "gen_res_aprov";
    setIsLoadingRanking(true);
    getRankingPorComuna(tipo, { periodo })
      .then((rows: RankingComuna[]) => {
        const mapped: Comuna[] = rows.map((r, idx) => ({
          id: r.id ?? idx + 1,
          comuna: r.comuna,
          cantidad: r.cantidad,
          porcentaje: r.porcentaje,
        }));
        setComunasData(mapped);
      })
      .catch(console.error)
      .finally(() => setIsLoadingRanking(false));
  }, [selectedOption, periodo]);

  // Debounce para search de establecimientos
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    if (!periodo) return;
    setIsLoadingEst(true);
    if (selectedOption === 3) {
      getEstablecimientosRASinGestor({
        search: debouncedSearch || undefined,
        page: pageNum,
        limit,
        periodo,
      })
        .then((res) => {
          setEstablecimientos(res.data);
          setTotal(res.total);
        })
        .catch(console.error)
        .finally(() => setIsLoadingEst(false));
      return;
    }

    const gestor = selectedOption === 1 ? "oro" : "no_oro";
    getEstablecimientosRA({
      gestor,
      estado: filtro === "todos" ? undefined : filtro,
      search: debouncedSearch || undefined,
      page: pageNum,
      limit,
      periodo,
    })
      .then((res) => {
        setEstablecimientos(res.data);
        setTotal(res.total);
      })
      .catch(console.error)
      .finally(() => setIsLoadingEst(false));
  }, [selectedOption, debouncedSearch, filtro, pageNum, limit, periodo]);

  return (
    <div className="p-8 space-y-10 bg-[#f9f9f9] min-h-screen">
      {/* Bienvenida */}
      <div className="flex items-baseline space-x-2 mb-10">
        <h1 className="text-2xl font-bold"> Bienvenido</h1>
        <h1 className="text-2xl font-normal">De nuevo 🖐️</h1>
      </div>

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
          variant="faded"
          labelPlacement="outside"
          placeholder={
            isLoadingPeriodos ? "Cargando periodos..." : "Selecciona un periodo"
          }
          selectedKeys={periodo ? [periodo] : []}
          onSelectionChange={(keys) => {
            const key = Array.from(keys)[0] as string;
            setPeriodo(key);
            // Reiniciar paginación al cambiar periodo
            setPageNum(1);
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

      {/* Gráfica + Cards */}
      <div className="flex flex-col lg:flex-row gap-4 w-full mb-4">
        <div className="flex-1 h-full">
          <DistribucionUsuariosChart periodo={periodo ?? undefined} />
        </div>

        <div className="flex-1 flex flex-col justify-between gap-4 relative">
          {isLoadingCards && (
            <div
              className="absolute inset-0 z-[9999] bg-white/60 backdrop-blur-sm flex items-center justify-center"
              role="status"
              aria-live="polite"
              aria-label="Cargando tarjetas del periodo seleccionado"
            >
              <div
                className="h-9 w-9 rounded-full border-4 border-[#7FB927] border-t-transparent animate-spin"
                aria-hidden="true"
              />
            </div>
          )}
          {cardsData && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Card
                  title="Establecimientos que generan residuos aprovechables"
                  value={cardsData.est_aprov_res}
                  icon={Recycle}
                  iconColor="#7FB927"
                  bgColor="#E4FFBA"
                />
                <Card
                  title="Total establecimientos que generan residuos aprovechables y no entregan a ningún gestor"
                  value={cardsData.est_gen_res_aprov_no_gestor}
                  icon={Recycle}
                  iconColor="#7FB927"
                  bgColor="#E4FFBA"
                />
                   <Card
                  title="Establecimientos que tienen gestor NO ORO"
                  value={cardsData.est_gest_no_oro}
                  icon={UserRound}
                  iconColor="#8280FF"
                  bgColor="#E4E4FF"
                  className="w-1/2"
                />
                <Card
                  title="Establecimientos que tienen gestor ORO"
                  value={cardsData.est_gest_oro}
                  icon={UserRound}
                  iconColor="#80B3FF"
                  bgColor="#E4EEFF"
                  className="w-1/2"
                />
              </div>
              <div className="flex gap-4">
             
              </div>
            </>
          )}
        </div>
      </div>

      {/* Buscar por gestor */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h1 className="text-2xl font-normal mt-4 mb-4">Reportes por comunas</h1>

        <ToggleSelectorCard
          selected={selectedOption}
          onSelect={setSelectedOption}
        />

        <MapTableCard
          data={comunasData}
          title={
            selectedOption === 1
              ? "Distribución por comuna de establecimientos con gestor ORO"
              : selectedOption === 2
              ? "Distribución por comuna de establecimientos con gestor NO ORO"
              : "Distribución por comuna de establecimientos sin gestor"
          }
          subtitle="Mapa coroplético de distribución por comuna"
          isLoading={isLoadingRanking}
        />

        <EstablecimientosTabla
          title={
            selectedOption === 1
              ? "Establecimientos con gestor ORO"
              : selectedOption === 2
              ? "Establecimientos con gestor NO ORO"
              : "Establecimientos sin gestor"
          }
          subtitle="Información detallada de los establecimientos registrados"
          data={establecimientos}
          search={searchInput}
          onSearchChange={(v) => {
            setPageNum(1);
            setSearchInput(v);
          }}
          filtro={filtro}
          onFiltroChange={(v) => {
            setPageNum(1);
            setFiltro(v);
          }}
          page={pageNum}
          limit={limit}
          total={total}
          onPageChange={setPageNum}
          isLoading={isLoadingEst}
        />
      </div>
    </div>
  );
}

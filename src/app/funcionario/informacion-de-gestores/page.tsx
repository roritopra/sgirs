'use client';

import React, { useState, useEffect } from 'react';
import MapTableCard, { Comuna } from '@/components/funcionario/MapTableCard';
import { getDistribucionPorComunaSinGestor } from '@/services/funcionario/sin-gestor/getDistribucionPorComunaSinGestor.service';
import EstablecimientosTabla, { type Establecimiento as EstablecimientoRow } from '@/components/funcionario/EstablecimientosTabla';
import { getEstablecimientosSinGestorTabla } from '@/services/funcionario/sin-gestor/getEstablecimientosSinGestorTabla.service';
import { Select, SelectItem } from '@heroui/react';
import { getPeriodosDisponibles } from '@/services/funcionario/dashboard/getPeriodosDisponibles.service';
import ToggleTipoResiduo, { TIPO_RESIDUO_OPTIONS } from '@/components/funcionario/ToggleTipoResiduo';

export default function FuncionarioPage() {
    const [comunasData, setComunasData] = useState<Comuna[]>([]);
    const [isLoadingComunas, setIsLoadingComunas] = useState<boolean>(false);

    const [tableData, setTableData] = useState<EstablecimientoRow[]>([]);
    const [search, setSearch] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState<string>('');
    const [page, setPage] = useState<number>(1);
    const [limit] = useState<number>(20);
    const [total, setTotal] = useState<number>(0);
    const [isLoadingTable, setIsLoadingTable] = useState<boolean>(false);
    const [periodos, setPeriodos] = useState<string[]>([]);
    const [periodo, setPeriodo] = useState<string | null>(null);
    const [isLoadingPeriodos, setIsLoadingPeriodos] = useState<boolean>(false);
    const [tipoResiduo, setTipoResiduo] = useState<string>(TIPO_RESIDUO_OPTIONS[0]);

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

    // Cargar distribución por comuna por periodo y tipo de residuo
    useEffect(() => {
        if (!periodo) return;
        const load = async () => {
            try {
                setIsLoadingComunas(true);
                const data = await getDistribucionPorComunaSinGestor({ periodo, tipo_residuo: tipoResiduo });
                setComunasData(data);
            } catch (e) {
                setComunasData([]);
            } finally {
                setIsLoadingComunas(false);
            }
        };
        load();
    }, [periodo, tipoResiduo]);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        const load = async () => {
            try {
                setIsLoadingTable(true);
                const res = await getEstablecimientosSinGestorTabla({ search: debouncedSearch || undefined, page, limit, periodo: periodo || undefined, tipo_residuo: tipoResiduo });
                setTableData(res.data as EstablecimientoRow[]);
                setTotal(res.total);
            } catch {
                setTableData([]);
                setTotal(0);
            } finally {
                setIsLoadingTable(false);
            }
        };
        load();
    }, [debouncedSearch, page, limit, periodo, tipoResiduo]);

    // Reset de paginación al cambiar periodo o tipo de residuo
    useEffect(() => {
        setPage(1);
    }, [periodo, tipoResiduo]);

    return (
        <div className='p-8 space-y-10 bg-[#f9f9f9] min-h-screen'>
            {/* Filtro de periodo */}
            <div className='w-full max-w-sm' role='group' aria-labelledby='periodo-label'>
                <label id='periodo-label' className='sr-only'>Filtro de periodo</label>
                <Select
                    label='Filtro por periodo'
                    labelPlacement='outside'
                    variant='faded'
                    placeholder={isLoadingPeriodos ? 'Cargando periodos...' : 'Selecciona un periodo'}
                    selectedKeys={periodo ? [periodo] : []}
                    onSelectionChange={(keys) => {
                        const key = Array.from(keys)[0] as string;
                        setPeriodo(key);
                    }}
                    isDisabled={isLoadingPeriodos || periodos.length === 0}
                    aria-label='Filtro por periodo para todos los componentes de la página'
                >
                    {periodos.map((p) => (
                        <SelectItem key={p} aria-label={`Periodo ${p}`}>
                            {p}
                        </SelectItem>
                    ))}
                </Select>
            </div>
            <h1 className='text-2xl font-normal'>Información de gestores</h1>

            <div className='bg-white rounded-xl shadow-md p-6 mb-6'>
                <>
                    <div className='mb-4'>
                        <ToggleTipoResiduo
                            selected={tipoResiduo}
                            onSelect={(value) => {
                                setTipoResiduo(value);
                            }}
                        />
                    </div>
                    <MapTableCard
                        data={comunasData}
                        title='Distribución por comuna de establecimientos sin ningún gestor'
                        subtitle='Mapa coroplético de establecimientos sin gestor por comuna'
                        isLoading={isLoadingComunas}
                    />

                    <EstablecimientosTabla
                        data={tableData}
                        title='Usuarios que entregan residuos voluminosos a la empresa de aseo'
                        subtitle='Información detallada de los establecimientos registrados'
                        search={search}
                        onSearchChange={(v) => {
                            setSearch(v);
                            setPage(1);
                        }}
                        page={page}
                        limit={limit}
                        total={total}
                        onPageChange={(p) => setPage(p)}
                        isLoading={isLoadingTable}
                    />
                </>
            </div>
        </div>
    );
}

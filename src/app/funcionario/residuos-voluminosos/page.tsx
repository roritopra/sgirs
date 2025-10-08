'use client';

import React, { useState, useEffect } from 'react';
import DistribucionVoluminosos from '@/components/funcionario/residuos-voluminosos/DistribucionVoluminosos';
import MapTableCard, { Comuna } from '@/components/funcionario/MapTableCard';
import { getDistribucionPorComunaVoluminosos } from '@/services/funcionario/residuos-voluminosos/getDistribucionPorComunaVoluminosos.service';
import EstablecimientosTabla from '@/components/funcionario/EstablecimientosTabla';
import { getEstablecimientosRvTabla, type EstablecimientoTabla } from '@/services/funcionario/residuos-voluminosos/getEstablecimientosRvTabla.service';
import { Select, SelectItem } from '@heroui/react';
import { getPeriodosDisponibles } from '@/services/funcionario/dashboard/getPeriodosDisponibles.service';

export default function FuncionarioPage() {
    const [comunasData, setComunasData] = useState<Comuna[]>([]);
    const [isLoadingComunas, setIsLoadingComunas] = useState<boolean>(false);

    // Estado para tabla de establecimientos RV
    const [establecimientos, setEstablecimientos] = useState<EstablecimientoTabla[]>([]);
    const [search, setSearch] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState<string>('');
    const [page, setPage] = useState<number>(1);
    const [limit] = useState<number>(20);
    const [total, setTotal] = useState<number>(0);
    const [isLoadingEsts, setIsLoadingEsts] = useState<boolean>(false);
    const [periodos, setPeriodos] = useState<string[]>([]);
    const [periodo, setPeriodo] = useState<string | null>(null);
    const [isLoadingPeriodos, setIsLoadingPeriodos] = useState<boolean>(false);

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

    // Cargar mapa por periodo
    useEffect(() => {
        if (!periodo) return;
        const load = async () => {
            try {
                setIsLoadingComunas(true);
                const data = await getDistribucionPorComunaVoluminosos({ periodo });
                setComunasData(data);
            } catch (e) {
                setComunasData([]);
            } finally {
                setIsLoadingComunas(false);
            }
        };
        load();
    }, [periodo]);

    // Debounce para búsqueda
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
        return () => clearTimeout(t);
    }, [search]);

    // Cargar establecimientos cuando cambian search/page/limit
    useEffect(() => {
        const loadTable = async () => {
            try {
                setIsLoadingEsts(true);
                const res = await getEstablecimientosRvTabla({ search: debouncedSearch || undefined, page, limit, periodo: periodo || undefined });
                setEstablecimientos(res.data);
                setTotal(res.total);
            } catch (e) {
                setEstablecimientos([]);
                setTotal(0);
            } finally {
                setIsLoadingEsts(false);
            }
        };
        loadTable();
    }, [debouncedSearch, page, limit, periodo]);

    // Reset paginación al cambiar periodo
    useEffect(() => {
        setPage(1);
    }, [periodo]);

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

            <h1 className='text-2xl font-normal'>Residuos voluminosos</h1>

            <div className='flex flex-col lg:flex-row gap-4 w-full mb-4'>
                <div className='flex-1 h-full'>
                    <DistribucionVoluminosos periodo={periodo ?? undefined} />
                </div>
            </div>

            <div className='bg-white rounded-xl shadow-md p-6 mb-6'>
                <>
                    <MapTableCard
                        data={comunasData}
                        title='Distribución por comuna de residuos voluminosos'
                        subtitle='Mapa coroplético de residuos voluminosos por comuna'
                        isLoading={isLoadingComunas}
                    />

                    <EstablecimientosTabla
                        data={establecimientos}
                        title='Usuarios que entregan residuos voluminosos a la empresa de aseo'
                        subtitle='Información detallada de los establecimientos registrados'
                        search={search}
                        onSearchChange={(v) => {
                            setSearch(v);
                            setPage(1); // reset página al buscar
                        }}
                        page={page}
                        limit={limit}
                        total={total}
                        onPageChange={(p) => setPage(p)}
                        isLoading={isLoadingEsts}
                    />
                </>
            </div>
        </div>
    );
}

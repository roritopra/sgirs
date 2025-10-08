'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/funcionario/residuos-aprovechables/Card';
import EstablecimientosTablaACU from '@/components/funcionario/indicadores-acu/EstablecimientosTablaACU';
import MapTableCard, { Comuna } from '@/components/funcionario/MapTableCard';
import { Recycle } from 'lucide-react';
import DistribucionChart from '@/components/funcionario/indicadores-acu/DistribucionChart';
import { Select, SelectItem } from '@heroui/react';
import { getPeriodosDisponibles } from '@/services/funcionario/dashboard/getPeriodosDisponibles.service';

// servicios de ACU
import { getCardsACU } from '@/services/funcionario/aceite-usado/getCardsACU.service';
import { getDistribucionPorComunaACU } from '@/services/funcionario/aceite-usado/getDistribucionPorComunaACU.service';

export default function FuncionarioPage() {
    const [cardsData, setCardsData] = useState<{
        total_est_gen_acu: number;
        total_est_gen_acu_sin_gestor: number;
        total_est_gen_acu_con_gestor: number;
    } | null>(null);
    const [isLoadingCards, setIsLoadingCards] = useState<boolean>(false);
    const [errorCards, setErrorCards] = useState<string | null>(null);
    const [comunasData, setComunasData] = useState<Comuna[]>([]);
    const [isLoadingComunasACU, setIsLoadingComunasACU] = useState<boolean>(false);
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

    useEffect(() => {
        if (!periodo) return;
        // Cards (endpoint real)
        const loadCards = async () => {
            try {
                setIsLoadingCards(true);
                setErrorCards(null);
                const data = await getCardsACU({ periodo });
                setCardsData(data);
            } catch (e) {
                setCardsData(null);
                setErrorCards('No se pudieron cargar los indicadores de ACU');
            } finally {
                setIsLoadingCards(false);
            }
        };
        loadCards();

        // Distribución por comuna (endpoint real)
        const loadComunas = async () => {
            try {
                setIsLoadingComunasACU(true);
                const data = await getDistribucionPorComunaACU({ periodo });
                setComunasData(data);
            } catch (e) {
                setComunasData([]);
            } finally {
                setIsLoadingComunasACU(false);
            }
        };
        loadComunas();
    }, [periodo]);

    return (
        <div className='p-8 space-y-10 bg-[#f9f9f9] min-h-screen'>
            {/* Filtro de periodo */}
            <div className='w-full max-w-sm' role='group' aria-labelledby='periodo-label'>
                <label id='periodo-label' className='sr-only'>Filtro de periodo</label>
                <Select
                    label='Filtro por periodo'
                    variant='faded'
                    labelPlacement='outside'
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

            <h1 className='text-2xl font-normal'>Indicadores de ACU (aceite de cocina usado)</h1>

            {/* Gráfico + Cards */}
            <div className='flex flex-col lg:flex-row gap-4 w-full mb-4'>
                <div className='flex-1 h-full'>
                    <DistribucionChart periodo={periodo ?? undefined} />
                </div>

                <div className='flex-1 flex flex-col justify-between gap-4 relative'>
                    {isLoadingCards && (
                        <div
                            className='absolute inset-0 z-[9999] bg-white/60 backdrop-blur-sm flex items-center justify-center'
                            role='status'
                            aria-live='polite'
                            aria-label='Cargando indicadores del periodo seleccionado'
                        >
                            <div className='h-9 w-9 rounded-full border-4 border-[#7FB927] border-t-transparent animate-spin' aria-hidden='true' />
                        </div>
                    )}
                    {!isLoadingCards && errorCards && (
                        <div className='text-center text-sm text-red-600' role='alert' aria-live='polite'>
                            {errorCards}
                        </div>
                    )}
                    {!isLoadingCards && !errorCards && cardsData && (
                        <>
                            <div className='flex gap-4'>
                            <Card
                                title='Número total de establecimientos que generan ACU'
                                value={cardsData.total_est_gen_acu}
                                icon={Recycle}
                                iconColor='#7FB927'
                                bgColor='#E4FFBA'
                            />
                            <Card
                                title='Generan ACU y entregan a gestor '
                                value={cardsData.total_est_gen_acu_con_gestor}
                                icon={Recycle}
                                iconColor='#7FB927'
                                bgColor='#E4FFBA'
                            />
                            </div>
                            <Card
                                title='Establecimientos que generan ACU y no entregan a gestor'
                                value={cardsData.total_est_gen_acu_sin_gestor}
                                icon={Recycle}
                                iconColor='#7FB927'
                                bgColor='#E4FFBA'
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Mapas + tabla */}
            <div className='bg-white rounded-xl shadow-md p-6 mb-6'>
                <MapTableCard
                    data={comunasData}
                    title='Distribución por comuna de usuarios que generan ACU'
                    subtitle='Mapa coroplético de usuarios que generan ACU por comuna'
                    isLoading={isLoadingComunasACU}
                />
                <EstablecimientosTablaACU periodo={periodo ?? undefined} />
            </div>
        </div>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import EstablecimientosUar from '@/components/funcionario/uar-condiciones/EstablecimientosUar';
import DistribucionUar from '@/components/funcionario/uar-condiciones/DistribucionUar';
import UarComuna from '@/components/funcionario/uar-condiciones/UarComuna';
import { Select, SelectItem } from '@heroui/react';
import { getPeriodosDisponibles } from '@/services/funcionario/dashboard/getPeriodosDisponibles.service';

export default function FuncionarioPage() {
	const [selectedOption, setSelectedOption] = useState<number>(1);
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
                setPeriodo((prev) => prev ?? (list[0] ?? null));
            })
            .catch(console.error)
            .finally(() => setIsLoadingPeriodos(false));
    }, []);

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

			<h1 className='text-2xl font-normal'>UAR y condiciones técnicas</h1>

			<div className='flex flex-col lg:flex-row gap-4 w-full mb-4'>
				<div className='flex-1 h-full'>
					<DistribucionUar periodo={periodo ?? undefined} />
				</div>
			</div>

			<div className='bg-white rounded-xl shadow-md p-6 mb-6'>
				<>
					<EstablecimientosUar periodo={periodo ?? undefined} />
					<UarComuna periodo={periodo ?? undefined} />
				</>
			</div>
		</div>
	);
}

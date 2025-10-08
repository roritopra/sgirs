'use client';

import { useState } from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';

export interface Establecimiento {
	nombre: string;
	responsable: string;
	direccion: string;
	telefono: string;
	barrio: string;
	comuna: number;
	estado?: string;    // con_ccu | sin_ccu
	entrega?: boolean;  // true = Entregan | false = No entregan
	ACU?: boolean;
}

interface Props {
	data: Establecimiento[];
	title: string;
	subtitle?: string;
	// definimos filtros dinámicos
	filtros?: {
		label: string;
		value: string;
		match: (e: Establecimiento) => boolean;
	}[];
}

export default function EstablecimientosTablaGenerica({ data, title, subtitle, filtros }: Props) {
	const [busqueda, setBusqueda] = useState('');
	const [filtroActivo, setFiltroActivo] = useState('todos');

	const filtrados = data.filter((e) => {
		const coincideBusqueda = e.nombre.toLowerCase().includes(busqueda.toLowerCase());

		const coincideFiltro =
			filtroActivo === 'todos' ||
			filtros?.find((f) => f.value === filtroActivo)?.match(e) ||
			false;

		return coincideBusqueda && coincideFiltro;
	});

	return (
		<div className='mt-6'>
			<div className='sticky top-0 bg-white z-10 pb-2'>
				<h2 className='text-lg font-semibold text-gray-800'>{title}</h2>
				{subtitle && <p className='text-sm text-gray-500 mb-4'>{subtitle}</p>}

				<div className='flex justify-between items-center flex-wrap gap-4'>
					<input
						type='text'
						placeholder='Buscar establecimientos...'
						className='border border-gray-300 rounded-md px-3 py-1 text-sm w-full max-w-xs'
						value={busqueda}
						onChange={(e) => setBusqueda(e.target.value)}
					/>
					<div className='flex gap-2'>
						<button
							onClick={() => setFiltroActivo('todos')}
							className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm border ${
								filtroActivo === 'todos' ? 'bg-gray-200' : 'border-gray-300'
							}`}
						>
							<FunnelIcon className='h-4 w-4' /> Todos
						</button>
						{filtros?.map((f) => (
							<button
								key={f.value}
								onClick={() => setFiltroActivo(f.value)}
								className={`px-3 py-1 rounded-full text-sm border ${
									filtroActivo === f.value ? 'bg-[#D7E9BC]' : 'border-gray-300'
								}`}
							>
								{f.label}
							</button>
						))}
					</div>
				</div>
			</div>

			<div className='max-h-[300px] overflow-y-auto border rounded-lg'>
				<table className='min-w-full text-sm text-left'>
					<thead className='bg-gray-100 text-gray-600 sticky top-0 z-10'>
						<tr>
							<th className='py-3 px-4'>Establecimiento</th>
							<th className='py-3 px-4'>Responsable</th>
							<th className='py-3 px-4'>Dirección</th>
							<th className='py-3 px-4'>Teléfono</th>
							<th className='py-3 px-4'>Barrio</th>
							<th className='py-3 px-4'>Comuna</th>
						</tr>
					</thead>
					<tbody className='divide-y'>
						{filtrados.map((e, i) => (
							<tr key={i} className='hover:bg-gray-50 transition'>
								<td className='py-2 px-4'>{e.nombre}</td>
								<td className='py-2 px-4'>{e.responsable}</td>
								<td className='py-2 px-4'>{e.direccion}</td>
								<td className='py-2 px-4'>{e.telefono}</td>
								<td className='py-2 px-4'>{e.barrio}</td>
								<td className='py-2 px-4'>{e.comuna}</td>
							</tr>
						))}
						{filtrados.length === 0 && (
							<tr>
								<td colSpan={6} className='py-4 text-center text-gray-500'>
									No se encontraron establecimientos.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

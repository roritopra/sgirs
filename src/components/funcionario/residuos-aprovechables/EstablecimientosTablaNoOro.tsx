'use client';

import { useState } from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';

interface Establecimiento {
	nombre: string;
	responsable: string;
	direccion: string;
	telefono: string;
	barrio: string;
	comuna: number;
	estado: 'con' | 'sin';
}

const establecimientos: Establecimiento[] = [
	{
		nombre: 'Panadería La Cosecha',
		responsable: 'María García',
		direccion: 'Calle 13 #45-67',
		telefono: '+57 321 456 7890',
		barrio: 'San Fernando',
		comuna: 10,
		estado: 'con',
	},
	{
		nombre: 'Tienda Mi Barrio',
		responsable: 'Luis Gómez',
		direccion: 'Carrera 5 #12-34',
		telefono: '+57 310 987 6543',
		barrio: 'El Lido',
		comuna: 17,
		estado: 'sin',
	},
	{
		nombre: 'Supermercado Central',
		responsable: 'Ana Ruiz',
		direccion: 'Calle 9 #20-15',
		telefono: '+57 300 111 2233',
		barrio: 'Alameda',
		comuna: 3,
		estado: 'con',
	},
	{
		nombre: 'Ferretería El Tornillo',
		responsable: 'Carlos Peña',
		direccion: 'Carrera 18 #30-55',
		telefono: '+57 311 765 4321',
		barrio: 'Cristóbal Colón',
		comuna: 12,
		estado: 'sin',
	},
	{
		nombre: 'Droguería Vida',
		responsable: 'Julián Castro',
		direccion: 'Calle 45 #65-10',
		telefono: '+57 318 222 3344',
		barrio: 'La Flora',
		comuna: 2,
		estado: 'con',
	},
	{
		nombre: 'Restaurante El Sazón',
		responsable: 'Paola Rivas',
		direccion: 'Carrera 7 #23-10',
		telefono: '+57 301 555 6677',
		barrio: 'San Antonio',
		comuna: 1,
		estado: 'sin',
	},
	{
		nombre: 'Heladería La Nieve',
		responsable: 'Valeria Torres',
		direccion: 'Calle 25 #10-55',
		telefono: '+57 300 444 8899',
		barrio: 'El Peñón',
		comuna: 3,
		estado: 'con',
	},
];

export default function EstablecimientosTablaNoOro() {
	const [busqueda, setBusqueda] = useState('');
	const [filtro, setFiltro] = useState<'todos' | 'con' | 'sin'>('todos');

	const filtrados = establecimientos.filter((e) => {
		const coincideBusqueda = e.nombre.toLowerCase().includes(busqueda.toLowerCase());
		const coincideFiltro = filtro === 'todos' || e.estado === filtro;
		return coincideBusqueda && coincideFiltro;
	});

	return (
		<div className=' mt-6'>
			<div className='sticky top-0 bg-white z-10 pb-2'>
				<h2 className='text-lg font-semibold text-gray-800'>Establecimientos con gestor NO ORO</h2>
				<p className='text-sm text-gray-500 mb-4'>Información detallada de los establecimientos registrados</p>

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
							onClick={() => setFiltro('todos')}
							className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm border ${
								filtro === 'todos' ? 'bg-gray-200' : 'border-gray-300'
							}`}
						>
							<FunnelIcon className='h-4 w-4' /> Todos
						</button>
						<button
							onClick={() => setFiltro('con')}
							className={`px-3 py-1 rounded-full text-sm border ${
								filtro === 'con' ? 'bg-[#D7E9BC]' : 'border-gray-300'
							}`}
						>
							Con CCU
						</button>
						<button
							onClick={() => setFiltro('sin')}
							className={`px-3 py-1 rounded-full text-sm border ${
								filtro === 'sin' ? 'bg-gray-100' : 'border-gray-300'
							}`}
						>
							Sin CCU
						</button>
					</div>
				</div>
			</div>

			<div className='max-h-[300px] overflow-y-auto border rounded-lg'>
				<table className='min-w-full text-sm text-left'>
					<thead className='bg-gray-100 text-gray-600 sticky top-0 z-10'>
						<tr>
							<th className='py-3 pr-6 pl-6'>Establecimiento</th>
							<th className='py-3 pr-6'>Responsable</th>
							<th className='py-3 pr-6'>Dirección</th>
							<th className='py-3 pr-6'>Teléfono</th>
							<th className='py-3 pr-6'>Barrio</th>
							<th className='py-3 pr-6'>Comuna</th>
							<th className='py-3 pr-6'>Estado</th>
						</tr>
					</thead>
					<tbody className='divide-y'>
						{filtrados.map((e, i) => (
							<tr key={i} className='hover:bg-gray-50 transition'>
								<td className='py-2 pr-6 pl-6 whitespace-nowrap text-gray-800'>{e.nombre}</td>
								<td className='py-2 pr-6 whitespace-nowrap text-gray-700'>{e.responsable}</td>
								<td className='py-2 pr-6 whitespace-nowrap text-gray-700'>{e.direccion}</td>
								<td className='py-2 pr-6 whitespace-nowrap text-gray-700'>{e.telefono}</td>
								<td className='py-2 pr-6 whitespace-nowrap text-gray-700'>{e.barrio}</td>
								<td className='py-2 pr-6 whitespace-nowrap text-gray-700'>{e.comuna}</td>
								<td className='py-2 pr-6 whitespace-nowrap'>
									<span
										className={`px-3 py-1 text-xs rounded-full font-medium inline-block ${
											e.estado === 'con' ? 'bg-[#D7E9BC] text-[#5F8B1D]' : 'border border-gray-400 text-gray-600'
										}`}
									>
										{e.estado === 'con' ? 'Con CCU' : 'Sin CCU'}
									</span>
								</td>
							</tr>
						))}
						{filtrados.length === 0 && (
							<tr>
								<td colSpan={7} className='py-4 text-center text-gray-500'>
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

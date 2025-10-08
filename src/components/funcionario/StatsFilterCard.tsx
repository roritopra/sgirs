'use client';

import { ChevronDownIcon } from '@heroicons/react/24/solid';

export default function StatsFilterCard() {
	return (
		<div className='bg-white rounded-xl shadow-sm p-6 mb-5'>
			<div>
				<h2 className='text-lg font-semibold text-gray-800'>Estadísticas descriptivas</h2>
				<p className='text-sm text-gray-500'>Visualización analítica de datos de encuestas de gestión de residuos</p>
			</div>

			<div className='flex flex-wrap gap-6 mt-4'>
				<div className='w-64'>
					<label className='block text-sm font-medium text-gray-700 mb-1'>Sector económico</label>
					<div className='relative'>
						<select
							className='appearance-none w-full bg-white border border-gray-300 rounded-md px-4 py-2 pr-10 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400'
							defaultValue='Todos los sectores'
						>
							<option>Todos los sectores</option>
							<option>Comercio</option>
							<option>Servicios</option>
							<option>Industria</option>
						</select>
						<ChevronDownIcon className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none' />
					</div>
				</div>

				<div className='w-64'>
					<label className='block text-sm font-medium text-gray-700 mb-1'>Período</label>
					<div className='relative'>
						<select
							className='appearance-none w-full bg-white border border-gray-300 rounded-md px-4 py-2 pr-10 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400'
							defaultValue='S1 2025 (Actual)'
						>
							<option>S1 2025 (Actual)</option>
							<option>S2 2024</option>
							<option>S1 2024</option>
						</select>
						<ChevronDownIcon className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none' />
					</div>
				</div>
			</div>
		</div>
	);
}

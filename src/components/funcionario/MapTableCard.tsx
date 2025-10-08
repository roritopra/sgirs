'use client';

import dynamic from 'next/dynamic';

const ChoroplethMapCali = dynamic(() => import('./ChoroplethMapCali'), { ssr: false });

export interface Comuna {
	id: number;
	comuna: number;
	cantidad: number;
	porcentaje: number;
}

interface MapTableCardProps {
	data: Comuna[];
	title: string;
	subtitle: string;
	isLoading?: boolean;
}

export default function MapTableCard({ data, title, subtitle, isLoading = false }: MapTableCardProps) {
	return (
		<div className='w-full flex flex-col lg:flex-row gap-6 relative'>
			{isLoading && (
				<div
					className='absolute inset-0 z-[9999] bg-white/60 backdrop-blur-sm flex items-center justify-center'
					role='status'
					aria-live='polite'
					aria-label='Cargando ranking por comuna'
				>
					<div className='h-10 w-10 rounded-full border-4 border-[#7FB927] border-t-transparent animate-spin' aria-hidden='true' />
				</div>
			)}
			{/* Tabla */}
			<div className={`lg:w-1/2 w-full flex flex-col ${isLoading ? 'pointer-events-none select-none' : ''}`} aria-busy={isLoading}>
				<div className='sticky top-0 bg-white z-10'>
					<h2 className='text-lg font-semibold text-gray-800'>{title}</h2>
					<p className='text-sm text-gray-500'>{subtitle}</p>
				</div>

				<div className='flex-grow overflow-y-auto border rounded-lg mt-4' style={{ maxHeight: '438px' }}>
					<table className='min-w-full text-sm text-left'>
						<thead className='bg-gray-100 text-gray-600 sticky top-0 z-10'>
							<tr>
								<th className='py-3 pr-6 pl-4'>Posición</th>
								<th className='py-3 pr-6'>Comuna</th>
								<th className='py-3 pr-6'>Cantidad</th>
								<th className='py-3 pr-6'>Porcentaje</th>
							</tr>
						</thead>
						<tbody className='divide-y'>
							{data.map((c) => (
								<tr key={c.id}>
									<td className='py-2 pr-6 pl-4'>
										<div className='w-8 h-8 flex items-center justify-center bg-[#E4F4C8] rounded-full text-[#5F8B1D] font-semibold'>
											{c.id}
										</div>
									</td>
									<td className='py-2 pr-6 text-gray-700'>{c.comuna}</td>
									<td className='py-2 pr-6 text-gray-700'>{c.cantidad}</td>
									<td className='py-2 pr-6 text-gray-700 flex items-center gap-2'>
										{c.porcentaje.toFixed(1)}%
										<div className='w-full h-2 bg-gray-200 rounded-full overflow-hidden max-w-[100px]'>
											<div className='h-full bg-[#5F8B1D]' style={{ width: `${c.porcentaje}%` }} />
										</div>
									</td>
								</tr>
							))}
							{data.length === 0 && (
								<tr>
									<td colSpan={4} className='py-4 text-center text-gray-500'>
										No hay datos disponibles.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Mapa */}
			<div className={`lg:w-1/2 w-full border rounded-lg overflow-hidden ${isLoading ? 'pointer-events-none select-none' : ''}`} aria-busy={isLoading}>
				<ChoroplethMapCali data={data} />
			</div>
		</div>
	);
}

'use client';

import { useEffect, useState } from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';
import { getEstablecimientosACU, EstablecimientoACUNormalizado } from '@/services/funcionario/aceite-usado/getEstablecimientosACU.service';

export default function EstablecimientosTablaACU({ periodo }: { periodo?: string }) {
	const [establecimientos, setEstablecimientos] = useState<EstablecimientoACUNormalizado[]>([]);
	const [busqueda, setBusqueda] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [filtro, setFiltro] = useState<'todos' | 'tiene_gestor' | 'no_tiene_gestor'>('todos');
	const [page, setPage] = useState(1);
	const [limit] = useState(20);
	const [total, setTotal] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Debounce para búsqueda
	useEffect(() => {
		const id = setTimeout(() => {
			setDebouncedSearch(busqueda.trim());
		}, 400);
		return () => clearTimeout(id);
	}, [busqueda]);

	// Reset de paginación al cambiar el periodo
	useEffect(() => {
		setPage(1);
	}, [periodo]);

	// Cargar datos desde API
	useEffect(() => {
		const load = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const res = await getEstablecimientosACU({
					search: debouncedSearch || undefined,
					estado: filtro === 'todos' ? undefined : filtro,
					page,
					limit,
					periodo,
				});
				setEstablecimientos(res.data);
				setTotal(res.total);
			} catch (e) {
				setEstablecimientos([]);
				setTotal(0);
				setError('No se pudieron cargar los establecimientos');
			} finally {
				setIsLoading(false);
			}
		};
		load();
	}, [debouncedSearch, filtro, page, limit, periodo]);

	return (
		<div className='mt-6'>
			<div className='sticky top-0 bg-white z-10 pb-2'>
				<h2 className='text-lg font-semibold text-gray-800'>Establecimientos con gestor autorizado</h2>
				<p className='text-sm text-gray-500 mb-4'>Información detallada de los establecimientos registrados</p>

				<div className='flex justify-between items-center flex-wrap gap-4'>
					<input
						type='text'
						placeholder='Buscar establecimientos...'
						className='border border-gray-300 rounded-md px-3 py-1 text-sm w-full max-w-xs'
						value={busqueda}
						onChange={(e) => {
							setPage(1);
							setBusqueda(e.target.value);
						}}
					/>
					<div className='flex gap-2'>
						<button
							onClick={() => {
								setPage(1);
								setFiltro('todos');
							}}
							className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm border ${
								filtro === 'todos' ? 'bg-gray-200' : 'border-gray-300'
							}`}
						>
							<FunnelIcon className='h-4 w-4' /> Todos
						</button>
						<button
							onClick={() => {
								setPage(1);
								setFiltro('tiene_gestor');
							}}
							className={`px-3 py-1 rounded-full text-sm border ${
								filtro === 'tiene_gestor' ? 'bg-[#D7E9BC]' : 'border-gray-300'
							}`}
						>
							Entrega a gestor
						</button>
						<button
							onClick={() => {
								setPage(1);
								setFiltro('no_tiene_gestor');
							}}
							className={`px-3 py-1 rounded-full text-sm border ${
								filtro === 'no_tiene_gestor' ? 'bg-gray-100' : 'border-gray-300'
							}`}
						>
							No entrega a gestor
						</button>
					</div>
				</div>
			</div>

			<div className='relative max-h-[300px] overflow-y-auto border rounded-lg'>
				{isLoading && (
					<div className='absolute inset-0 z-[9999] bg-white/60 backdrop-blur-sm flex items-center justify-center' role='status' aria-live='polite' aria-label='Cargando establecimientos'>
						<div className='animate-spin h-6 w-6 border-2 border-gray-400 border-t-transparent rounded-full' />
					</div>
				)}
				{!isLoading && error && (
					<div className='p-4 text-center text-sm text-red-600' role='alert' aria-live='polite'>
						{error}
					</div>
				)}
				<table className='min-w-full text-sm text-left'>
					<thead className='bg-gray-100 text-gray-600 sticky top-0 z-10'>
						<tr>
							<th className='py-3 pr-6 pl-6'>Establecimiento</th>
							<th className='py-3 pr-6'>Responsable</th>
							<th className='py-3 pr-6'>Dirección</th>
							<th className='py-3 pr-6'>Teléfono</th>
							<th className='py-3 pr-6'>Barrio</th>
							<th className='py-3 pr-6'>Sector</th>
							<th className='py-3 pr-6'>Comuna</th>
							<th className='py-3 pr-6'>Estado</th>
						</tr>
					</thead>
					<tbody className='divide-y'>
						{establecimientos.map((e) => (
							<tr key={e.id} className='hover:bg-gray-50 transition'>
								<td className='py-2 pr-6 pl-6 whitespace-nowrap text-gray-800'>{e.nombre}</td>
								<td className='py-2 pr-6 whitespace-nowrap text-gray-700'>{e.responsable}</td>
								<td className='py-2 pr-6 whitespace-nowrap text-gray-700'>{e.direccion}</td>
								<td className='py-2 pr-6 whitespace-nowrap text-gray-700'>{e.telefono}</td>
								<td className='py-2 pr-6 whitespace-nowrap text-gray-700'>{e.barrio}</td>
								<td className='py-2 pr-6 whitespace-nowrap text-gray-700'>{e.sector ?? ''}</td>
								<td className='py-2 pr-6 whitespace-nowrap text-gray-700'>{e.comuna}</td>
								<td className='py-2 pr-6 whitespace-nowrap'>
									<span
										className={`px-3 py-1 text-xs rounded-full font-medium inline-block ${
											e.estado === 'tiene_gestor' ? 'bg-[#D7E9BC] text-[#5F8B1D]' : 'border border-gray-400 text-gray-600 bg-gray-100'
										}`}
									>
										{e.estado === 'tiene_gestor' ? 'Tiene gestor' : 'No tiene gestor'}
									</span>
								</td>
							</tr>
						))}
						{!isLoading && establecimientos.length === 0 && (
							<tr>
								<td colSpan={8} className='py-4 text-center text-gray-500'>
									{error ? 'Error al cargar datos' : 'No se encontraron establecimientos.'}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* Paginación */}
			{total > 0 && (
				<div className='flex items-center justify-between mt-3 text-sm text-gray-600'>
					<span>
						Página {page} de {Math.max(1, Math.ceil(total / limit))} • {total} establecimientos
					</span>
					<div className='flex gap-2'>
						<button
							className='px-3 py-1 border rounded disabled:opacity-50'
							disabled={page <= 1 || isLoading}
							onClick={() => setPage(page - 1)}
							aria-label='Página anterior'
						>
							Anterior
						</button>
						<button
							className='px-3 py-1 border rounded disabled:opacity-50'
							disabled={page >= Math.ceil(total / limit) || isLoading}
							onClick={() => setPage(page + 1)}
							aria-label='Página siguiente'
						>
							Siguiente
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

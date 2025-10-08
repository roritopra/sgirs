'use client';

import { useState, useEffect } from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';
import { getEstablecimientosRaee, type EstablecimientosRaeeResponse } from '@/services/funcionario/raee-respel-rcd/getEstablecimientosRaee.service';

export interface EstablecimientosTablaSinGestorProps {
	isLoading?: boolean;
	error?: string | null;
    periodo?: string;
}


export default function EstablecimientosTablaSinGestor({ isLoading = false, error = null, periodo }: EstablecimientosTablaSinGestorProps) {
	const [busqueda, setBusqueda] = useState('');
	const [busquedaDebounced, setBusquedaDebounced] = useState('');
	const [filtro, setFiltro] = useState<'todos' | 'gestor_aut' | 'gestor_no_aut'>('todos');
	const [page, setPage] = useState(1);
	const [data, setData] = useState<EstablecimientosRaeeResponse | null>(null);
	const [isLoadingData, setIsLoadingData] = useState(false);
	const [errorData, setErrorData] = useState<string | null>(null);

	const limit = 20;

	// Debounce para la búsqueda
	useEffect(() => {
		const id = setTimeout(() => setBusquedaDebounced(busqueda.trim()), 350);
		return () => clearTimeout(id);
	}, [busqueda]);

	useEffect(() => {
		const fetchData = async () => {
			setIsLoadingData(true);
			setErrorData(null);
			try {
				const params = {
					page,
					limit,
					...(busquedaDebounced && { search: busquedaDebounced }),
					...(filtro !== 'todos' && { estado: filtro }),
                    ...(periodo ? { periodo } : {}),
				};
				const response = await getEstablecimientosRaee(params);
				setData(response);
			} catch (err) {
				setErrorData(err instanceof Error ? err.message : 'Error al cargar establecimientos');
			} finally {
				setIsLoadingData(false);
			}
		};

		fetchData();
	}, [busquedaDebounced, filtro, page, periodo]);

    // Reset paginación al cambiar periodo
    useEffect(() => {
        setPage(1);
    }, [periodo]);

	const handleBusquedaChange = (value: string) => {
		setBusqueda(value);
		setPage(1);
	};

	const handleFiltroChange = (newFiltro: 'todos' | 'gestor_aut' | 'gestor_no_aut') => {
		setFiltro(newFiltro);
		setPage(1);
	};

	const totalPages = data?.totalPages || 0;
	const establecimientos = data?.data || [];

	const safe = (v: any): string => {
		if (v === null || v === undefined) return '';
		const val = typeof v === 'number' && Number.isNaN(v) ? '' : v;
		return String(val);
	};

	return (
		<div>
			<div className='sticky top-0 bg-white z-10 pb-2 mt-10'>
				<h2 className='text-lg font-semibold text-gray-800 mt-6'>
					Establecimientos sin gestor pero que generan residuos aprovechables
				</h2>
				<p className='text-sm text-gray-500 mb-4'>Información detallada de los establecimientos registrados</p>

				<div className='flex justify-between items-center flex-wrap gap-4'>
					<input
						type='text'
						placeholder='Buscar por establecimiento, responsable o barrio...'
						className='border border-gray-300 rounded-md px-3 py-1 text-sm w-full max-w-xs'
						value={busqueda}
						onChange={(e) => handleBusquedaChange(e.target.value)}
						aria-busy={isLoadingData}
					/>
					<div className='flex gap-2'>
						<button
							onClick={() => handleFiltroChange('todos')}
							className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm border ${
								filtro === 'todos' ? 'bg-gray-200' : 'border-gray-300'
							}`}
						>
							<FunnelIcon className='h-4 w-4' /> Todos
						</button>
						<button
							onClick={() => handleFiltroChange('gestor_aut')}
							className={`px-3 py-1 rounded-full text-sm border ${
								filtro === 'gestor_aut' ? 'bg-[#D7E9BC]' : 'border-gray-300'
							}`}
						>
							Gestor autorizado
						</button>
						<button
							onClick={() => handleFiltroChange('gestor_no_aut')}
							className={`px-3 py-1 rounded-full text-sm border ${
								filtro === 'gestor_no_aut' ? 'bg-gray-100' : 'border-gray-300'
							}`}
						>
							Gestor no autorizado
						</button>
					</div>
				</div>
			</div>

			{(error || errorData) && (
				<div role='alert' aria-live='polite' className='bg-red-50 border border-red-200 rounded-lg p-4 mb-4'>
					<p className='text-red-700'>Error: {error || errorData}</p>
				</div>
			)}

			{/* Contenedor tabla con overlay de carga (diseño igual a EstablecimientosTabla) */}
			<div className='border rounded-lg overflow-hidden relative'>
				<div className='overflow-y-auto' style={{ maxHeight: '400px' }}>
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
							{establecimientos.map((e, i) => (
								<tr key={i} className='hover:bg-gray-50 transition'>
									<td className='py-2 pr-6 pl-6 whitespace-nowrap text-gray-800'>{safe(e.nombre)}</td>
									<td className='py-2 pr-6 whitespace-nowrap text-gray-700'>{safe(e.responsable)}</td>
									<td className='py-2 pr-6 whitespace-nowrap text-gray-700'>{safe(e.direccion)}</td>
									<td className='py-2 pr-6 whitespace-nowrap text-gray-700'>{safe(e.telefono)}</td>
									<td className='py-2 pr-6 whitespace-nowrap text-gray-700'>{safe(e.barrio)}</td>
									<td className='py-2 pr-6 whitespace-nowrap text-gray-700'>{safe((e as any).sector)}</td>
									<td className='py-2 pr-6 whitespace-nowrap text-gray-700'>{safe(e.comuna)}</td>
									<td className='py-2 pr-6 whitespace-nowrap'>
										<span
											className={`px-3 py-1 text-xs rounded-full font-medium inline-block ${
												e.estado === 'gestor_aut' ? 'bg-[#D7E9BC] text-[#5F8B1D]' : 'border border-gray-400 text-gray-600'
											}`}
										>
											{e.estado === 'gestor_aut' ? 'Gestor autorizado' : 'Gestor no autorizado'}
										</span>
									</td>
								</tr>
							))}
							{establecimientos.length === 0 && !isLoadingData && !isLoading && (
								<tr>
									<td colSpan={8} className='py-8 text-center text-gray-500' role='status'>
										No se encontraron establecimientos.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				{(isLoading || isLoadingData) && (
					<div
						className='absolute inset-0 z-[9999] bg-white/60 backdrop-blur-sm flex items-center justify-center'
						role='status'
						aria-live='polite'
						aria-label='Cargando establecimientos'
					>
						<div className='animate-spin h-6 w-6 border-2 border-gray-400 border-t-transparent rounded-full' />
					</div>
				)}
			</div>

			{/* Paginación */}
			{totalPages > 1 && (
				<div className='flex items-center justify-between mt-2 text-sm text-gray-700'>
					<span>
						Página {page} de {totalPages} · {data?.total || 0} resultados
					</span>
					<div className='flex gap-2'>
						<button
							className='px-3 py-1 border rounded disabled:opacity-50'
							disabled={page <= 1}
							onClick={() => setPage(page - 1)}
							aria-label='Página anterior'
						>
							Anterior
						</button>
						<button
							className='px-3 py-1 border rounded disabled:opacity-50'
							disabled={page >= totalPages}
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

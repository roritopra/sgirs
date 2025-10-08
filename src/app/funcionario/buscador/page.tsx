'use client';

import { useState } from 'react';
import { Building2, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { searchEstablecimientos, type EstablecimientoApiItem, type SearchEstablecimientosParams } from '@/services/funcionario/buscador/searchEstablecimientos.service';


export default function SearchEstablishments() {
	const [searchType, setSearchType] = useState<'nombre' | 'nit' | 'email'>('nombre');
	const [searchTerm, setSearchTerm] = useState('');
	const [results, setResults] = useState<EstablecimientoApiItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hasSearched, setHasSearched] = useState(false);
	const [currentPage] = useState(1);
	const router = useRouter();

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (searchTerm.length < 3) return;

		setIsLoading(true);
		setError(null);
		setResults([]);
		setHasSearched(true);

		try {
			const params: SearchEstablecimientosParams = {
				page: currentPage,
				limit: 10,
				search: searchTerm.trim(),
				buscar_por: searchType,
			};

			const response = await searchEstablecimientos(params);
			setResults(response.data);
		} catch (err) {
			setError('Error al buscar establecimientos. Por favor, inténtelo de nuevo.');
			console.error('Error searching establishments:', err);
		} finally {
			setIsLoading(false);
		}
	};

	const handleClick = (nit: string) => {
		router.push(`/funcionario/buscador/${nit}`);
	};

	return (
		<div className='p-6'>
			<div className='flex items-center gap-3 mb-6'>
				<div className='p-3 rounded-full' style={{ backgroundColor: '#b0f44a5a' }}>
					<Building2 className='w-6 h-6' style={{ color: '#7FB927' }} />
				</div>
				<div>
					<h1 className='text-xl font-semibold'>Buscador de establecimientos</h1>
					<p className='text-sm text-gray-500'>Busque establecimientos por nombre, correo electrónico o NIT</p>
				</div>
			</div>

			<form onSubmit={handleSearch} className='flex flex-col md:flex-row gap-4 mb-6'>
				<select
					value={searchType}
					onChange={(e) => setSearchType(e.target.value as 'nombre' | 'nit' | 'email')}
					className='border border-gray-300 rounded-md px-3 py-1.5 text-sm'
					disabled={isLoading}
				>
					<option value='nombre'>Nombre</option>
					<option value='email'>Correo electrónico</option>
					<option value='nit'>NIT</option>
				</select>

				<input
					type='text'
					placeholder={
						searchType === 'nombre' ? 'Nombre del establecimiento' : searchType === 'email' ? 'Correo electrónico' : 'NIT'
					}
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className='border border-gray-300 rounded-md px-3 py-1.5 text-sm flex-grow'
					minLength={3}
					disabled={isLoading}
					required
				/>

				<button
					type='submit'
					disabled={searchTerm.length < 3 || isLoading}
					className='px-4 py-2 bg-[#5F8244] text-white rounded-md hover:bg-[#395312] transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
				>
					{isLoading && <Loader2 className='w-4 h-4 animate-spin' />}
					{isLoading ? 'Buscando...' : 'Buscar'}
				</button>
			</form>

			{error && (
				<div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3'>
					<AlertCircle className='w-5 h-5 text-red-500 flex-shrink-0' />
					<p className='text-red-700'>{error}</p>
				</div>
			)}

			{!isLoading && results.length === 0 && hasSearched && (
				<div className='bg-gray-50 border border-gray-200 rounded-lg p-8 text-center'>
					<Building2 className='w-12 h-12 text-gray-400 mx-auto mb-4' />
					<h3 className='text-lg font-medium text-gray-900 mb-2'>No se encontraron establecimientos</h3>
					<p className='text-gray-500'>No hay establecimientos que coincidan con tu búsqueda "{searchTerm}"</p>
				</div>
			)}

			{results.length > 0 && (
				<div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
					<table className='min-w-full divide-y divide-gray-200'>
						<thead className='bg-gray-50'>
							<tr>
								<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
									Establecimiento
								</th>
								<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
									Responsable
								</th>
								<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
									Dirección
								</th>
								<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
									Teléfono
								</th>
								<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
									Acciones
								</th>
							</tr>
						</thead>
						<tbody className='bg-white divide-y divide-gray-200'>
							{results.map((item) => (
								<tr key={item.id} className='hover:bg-gray-50'>
									<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>{item.establecimiento}</td>
									<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>{item.responsable}</td>
									<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>{item.direccion}</td>
									<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>{item.telefono}</td>
									<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>
										<button
											onClick={() => handleClick(item.nit)}
											className='px-4 py-2 rounded-xl text-white font-medium bg-[#7FB927] hover:bg-[#B0F44A] transition-colors duration-200'
										>
											Ver Detalles
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}

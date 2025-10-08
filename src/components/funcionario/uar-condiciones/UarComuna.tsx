'use client';

import { useEffect, useState } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { getDistribucionUarPorComuna, DistribucionUarComunaNormalizada } from '@/services/funcionario/uar/getDistribucionUarPorComuna.service';

export default function UsuariosPorComunaChart({ periodo }: { periodo?: string }) {
	const [data, setData] = useState<DistribucionUarComunaNormalizada[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const load = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const result = await getDistribucionUarPorComuna({ periodo });
				setData(result);
			} catch (e) {
				setData([]);
				setError('No se pudieron cargar los datos de distribución UAR');
			} finally {
				setIsLoading(false);
			}
		};
		load();
	}, [periodo]);

	return (
		<div className='mt-6 w-full'>
			<div className='mb-5'>
				<h2 className='text-base font-semibold text-gray-900'>Distribución UAR por comuna</h2>
				<p className='text-sm text-gray-500'>Cantidad de establecimientos con y sin UAR por comuna</p>
			</div>
			<div className='relative h-[380px]'>
				{isLoading && (
					<div className='absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex items-center justify-center' role='status' aria-live='polite'>
						<div className='flex items-center gap-2'>
							<div className='animate-spin h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full' />
							<span className='text-sm text-gray-600'>Cargando distribución UAR…</span>
						</div>
					</div>
				)}
				{!isLoading && error && (
					<div className='absolute inset-0 flex items-center justify-center' role='alert' aria-live='polite'>
						<div className='text-center text-sm text-red-600'>
							{error}
						</div>
					</div>
				)}
				{!isLoading && !error && data.length === 0 && (
					<div className='absolute inset-0 flex items-center justify-center' role='status'>
						<div className='text-center text-sm text-gray-500'>
							No hay datos disponibles
						</div>
					</div>
				)}
				{!isLoading && !error && data.length > 0 && (
					<ResponsiveBar
						data={data}
						keys={['Tiene UAR', 'No tiene UAR']}
						indexBy='comuna'
						margin={{ top: 20, right: 30, bottom: 110, left: 50 }}
						padding={0.3}
						groupMode='grouped'
						colors={['#7FB927', '#c0f44a']}
						borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
						axisBottom={{
							tickSize: 5,
							tickPadding: 5,
							tickRotation: -25,
							legend: 'Comuna',
							legendPosition: 'middle',
							legendOffset: 70,
						}}
						axisLeft={{
							tickSize: 5,
							tickPadding: 5,
							legend: 'Cantidad',
							legendPosition: 'middle',
							legendOffset: -40,
						}}
						labelSkipWidth={12}
						labelSkipHeight={12}
						enableLabel={false}
						legends={[
							{
								dataFrom: 'keys',
								anchor: 'bottom',
								direction: 'row',
								translateY: 90,
								itemsSpacing: 12,
								itemWidth: 120,
								itemHeight: 20,
								itemDirection: 'left-to-right',
								itemOpacity: 0.85,
								symbolSize: 14,
								effects: [
									{
										on: 'hover',
										style: { itemOpacity: 1 },
									},
								],
							},
						]}
						tooltip={({ id, value, indexValue }) => (
							<div className='bg-white p-2 shadow-md rounded text-xs'>
								<strong>{indexValue}</strong>: {value} establecimientos {id}
							</div>
						)}
						animate={true}
					/>
				)}
			</div>
		</div>
	);
}

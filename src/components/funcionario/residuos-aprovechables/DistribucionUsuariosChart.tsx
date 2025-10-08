'use client';
import { ResponsiveBar } from '@nivo/bar';
import { useState, useEffect, useMemo } from 'react';
import { getDistribucionUsuarios } from '@/services/funcionario/residuos-aprovechables/getDistribucionUsuarios.service';

type Props = {
	data?: any[];
  periodo?: string;
};

// Claves posibles: ahora el endpoint puede incluir 'total' además de las existentes
// Calcularemos dinámicamente las claves presentes para no romper otros escenarios.

export default function DistribucionUsuariosChart({ data, periodo }: Props) {
	const [internalData, setInternalData] = useState<any[]>([]);
	const [hoveredBar, setHoveredBar] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		if (!data) {
			setIsLoading(true);
			getDistribucionUsuarios({ periodo })
				.then(setInternalData)
				.catch(console.error)
				.finally(() => setIsLoading(false));
		}
	}, [data, periodo]);

	const finalData = data ?? internalData;

	const computedKeys = useMemo(() => {
		const ks: string[] = [];
		if (finalData?.some((d) => Object.prototype.hasOwnProperty.call(d, 'tiene_ccu'))) ks.push('tiene_ccu');
		if (finalData?.some((d) => Object.prototype.hasOwnProperty.call(d, 'no_tiene_ccu'))) ks.push('no_tiene_ccu');
		if (finalData?.some((d) => Object.prototype.hasOwnProperty.call(d, 'total'))) ks.push('total');
		return ks;
	}, [finalData]);

	const legendItems = useMemo(() => {
		return computedKeys.map((k) => ({
			id: k,
			label: k === 'tiene_ccu' ? 'Con CCU' : k === 'no_tiene_ccu' ? 'Sin CCU' : 'Total',
			color: k === 'tiene_ccu' ? '#7FB927' : k === 'no_tiene_ccu' ? '#B0F44A' : '#8280FF',
		}));
	}, [computedKeys]);

	const handleMouseEnter = (bar: { id: string | number }) => {
		setHoveredBar(String(bar.id));
	};

	return (
		<div className='bg-white rounded-xl shadow-sm px-6 pt-6 pb-3 w-full relative'>
			{isLoading && (
				<div
					className='absolute inset-0 z-[9999] bg-white/60 backdrop-blur-sm flex items-center justify-center'
					role='status'
					aria-live='polite'
					aria-label='Cargando distribución de usuarios por periodo'
				>
					<div className='h-9 w-9 rounded-full border-4 border-[#7FB927] border-t-transparent animate-spin' aria-hidden='true' />
				</div>
			)}
			<div className='mb-5'>
				<h2 className='text-base font-semibold text-gray-900'>Distribución de usuarios</h2>
				<p className='text-sm text-gray-500'>Usuarios con ORO y sin ORO</p>
			</div>
			{legendItems.length > 0 && (
				<div className='flex flex-wrap items-center gap-4 mb-2' role='list' aria-label='Leyenda de series'>
					{legendItems.map((item) => (
						<div key={item.id} className='flex items-center gap-2' role='listitem'>
							<span className='inline-block w-3.5 h-3.5 rounded-sm' style={{ backgroundColor: item.color }} aria-hidden='true' />
							<span className='text-xs text-gray-600'>{item.label}</span>
						</div>
					))}
				</div>
			)}
			<div className='h-[260px]' aria-busy={isLoading}>
				{finalData.length > 0 && (
					<ResponsiveBar
						data={finalData}
						keys={computedKeys}
						indexBy='tipo'
						margin={{ top: 20, right: 30, bottom: 90, left: 45 }}
						padding={0.4}
						layout='vertical'
						colors={({ id }) => {
							if (hoveredBar === id) {
								if (id === 'tiene_ccu') return '#8FC92B';
								if (id === 'no_tiene_ccu') return '#C0F44A';
								if (id === 'total') return '#9AA0FF';
							}
							if (id === 'tiene_ccu') return '#7FB927';
							if (id === 'no_tiene_ccu') return '#B0F44A';
							if (id === 'total') return '#8280FF';
							return '#7FB927';
						}}
						enableLabel={false}
						axisLeft={{
							legend: 'Usuarios',
							legendPosition: 'middle',
							legendOffset: -38,
						}}
						axisBottom={{
							renderTick: (tick) => {
								const width = 120;
								const height = 80;
								return (
									<g transform={`translate(${tick.x},${tick.y})`}>
										<foreignObject x={-width / 2} y={8} width={width} height={height}>
											<div style={{ width, height, textAlign: 'center', whiteSpace: 'normal', wordWrap: 'break-word', lineHeight: '1.1' }}>
												<span style={{ display: 'inline-block', maxWidth: width }}>{String(tick.value)}</span>
											</div>
										</foreignObject>
									</g>
								);
							},
						}}
						onMouseEnter={handleMouseEnter}
						onMouseLeave={() => setHoveredBar(null)}
						tooltip={({ id, value, indexValue }) => (
							<div className='bg-white border text-sm px-3 py-1 rounded shadow w-55'>
								{indexValue} · {id}: <strong>{value}</strong>
							</div>
						)}
					/>
				)}
			</div>
		</div>
	);
}

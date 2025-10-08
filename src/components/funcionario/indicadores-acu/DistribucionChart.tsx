'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { getDistribucionEstablecimientosACU } from '@/services/funcionario/aceite-usado/getDistribucionEstablecimientosACU.service';

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
	if (active && payload && payload.length) {
		return (
			<div className='bg-white p-2 rounded shadow-md border border-gray-200'>
				<p className='text-gray-800'>{`${payload[0].name}: ${payload[0].value}`}</p>
			</div>
		);
	}
	return null;
};

export default function SimpleACUChart({ periodo }: { periodo?: string }) {
	const [data, setData] = useState<{ name: string; value: number }[]>([]);
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const load = async () => {
			try {
				setLoading(true);
				setError(null);
				const dist = await getDistribucionEstablecimientosACU({ periodo });
				const mapped = dist.map((d) => ({ name: d.tipo, value: d.cantidad }));
				setData(mapped);
			} catch (e) {
				setError('No se pudo cargar la distribución de ACU');
				setData([]);
			} finally {
				setLoading(false);
			}
		};
		load();
	}, [periodo]);

	return (
		<div className='bg-white rounded-xl shadow-sm p-6 w-full'>
			<div className='mb-4'>
				<h2 className='text-base font-semibold text-gray-900'>Gestión de ACU</h2>
				<p className='text-sm text-gray-500'>Distribución de establecimientos</p>
			</div>
			<div className='h-[260px]'>
				{loading && (
					<div className='flex items-center justify-center h-full' role='status' aria-live='polite'>
						<span className='text-sm text-gray-600'>Cargando distribución…</span>
					</div>
				)}
				{!loading && error && (
					<div className='flex items-center justify-center h-full' role='alert' aria-live='polite'>
						<span className='text-sm text-red-600'>{error}</span>
					</div>
				)}
				{!loading && !error && (
					<ResponsiveContainer width='100%' height='100%'>
						<BarChart
							data={data}
							margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
							style={{ backgroundColor: '#ffffff' }}
						>
							<CartesianGrid strokeDasharray='3 3' stroke='#E5E7EB' />
							<XAxis dataKey='name' />
							<YAxis
								label={{
									value: 'Establecimientos',
									angle: -90,
									position: 'middle',
									style: {
										fontSize: '14px',
										fill: '#4b5563',
										fontWeight: 500,
									},
								}}
								tick={{ fontSize: 12 }}
							/>
							<Tooltip content={<CustomTooltip />} />
							<Bar
								dataKey='value'
								radius={[4, 4, 0, 0]}
								onMouseEnter={(_, index) => setHoverIndex(index)}
								onMouseLeave={() => setHoverIndex(null)}
							>
								{data.map((_, index) => (
									<Cell key={`cell-${index}`} fill={hoverIndex === index ? '#9FE53D' : '#B0F44A'} />
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				)}
			</div>
		</div>
	);
}

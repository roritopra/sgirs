'use client';

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

type ChartData = {
	date: string;
	value: number;
};

type ConversationsChartProps = {
	title: string;
	yLabel?: string;
	data: ChartData[];
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
	if (active && payload && payload.length) {
		return (
			<div className='bg-white p-2 rounded shadow-md border border-gray-200'>
				<p className='text-gray-800'>{`${payload[0].payload.date}: ${payload[0].value}`}</p>
			</div>
		);
	}
	return null;
};

export default function ConversationsChart({ title, yLabel = 'n de ', data }: ConversationsChartProps) {
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);

	return (
		<div className='bg-white rounded-xl shadow-sm p-6 w-full overflow-x-auto'>
			{/* Título dinámico */}
			<div className='mb-4 flex justify-between items-center'>
				<h2 className='text-base font-semibold text-gray-900'>{title}</h2>
			</div>

			{/* Gráfico */}
			<div className='h-[260px] min-w-[600px]'>
				<ResponsiveContainer width='100%' height='100%'>
					<BarChart
						data={data}
						margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
						style={{ backgroundColor: '#ffffff' }}
					>
						<CartesianGrid strokeDasharray='3 3' stroke='#E5E7EB' />
						<XAxis dataKey='date' />
						<YAxis
							label={{
								value: yLabel,
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
							radius={[2, 2, 0, 0]}
							onMouseEnter={(_, index) => setHoverIndex(index)}
							onMouseLeave={() => setHoverIndex(null)}
						>
							{data.map((_, index) => (
								<Cell key={`cell-${index}`} fill={hoverIndex === index ? '#7FB927' : '#8BC34A'} />
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}

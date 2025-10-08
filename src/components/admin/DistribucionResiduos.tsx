'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

type BarChartCardProps = {
	title: string;
	subtitle?: string;
	data: { name: string; value: number; fill: string }[];
	yLabel?: string;
};

export default function BarChartCard({ title, subtitle, data, yLabel = 'Cantidad' }: BarChartCardProps) {
	const handleDownload = () => {
		alert('Funcionalidad de descarga pendiente 🙂');
	};

	return (
		<div className='bg-white rounded-xl shadow-sm p-6 w-full overflow-x-auto'>
			{/* Encabezado */}
			<div className='mb-4 flex justify-between items-center'>
				<div>
					<h2 className='text-base font-semibold text-gray-900'>{title}</h2>
					{subtitle && <p className='text-sm text-gray-500'>{subtitle}</p>}
				</div>
			</div>

			{/* Gráfico */}
			<ResponsiveContainer width='100%' height={300}>
				<BarChart data={data}>
					<CartesianGrid strokeDasharray='3 3' />
					<XAxis dataKey='name' />
					<YAxis
						label={{
							value: yLabel,
							angle: -90,
							position: 'insideLeft',
							style: { textAnchor: 'middle' },
						}}
					/>
					<Tooltip />
					<Bar dataKey='value' />
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}

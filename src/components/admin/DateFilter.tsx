'use client';

import { useState } from 'react';

interface DateFilterProps {
	onFilter: (range: { from: Date; to: Date }) => void;
}

export default function DateFilter({ onFilter }: DateFilterProps) {
	const [customFrom, setCustomFrom] = useState('');
	const [customTo, setCustomTo] = useState('');

	const handleQuickFilter = (days: number) => {
		const to = new Date();
		const from = new Date();
		from.setDate(to.getDate() - days);
		onFilter({ from, to });
	};

	const handleCustomFilter = () => {
		if (!customFrom || !customTo) return;
		onFilter({ from: new Date(customFrom), to: new Date(customTo) });
	};

	return (
		<div className='flex flex-col md:flex-row gap-4  '>
			{/* Botones rápidos */}
			<div className='flex gap-2'>
				<button onClick={() => handleQuickFilter(7)} className='px-4 py-2 border rounded-md text-sm hover:bg-gray-100'>
					Últimos 7 días
				</button>
				<button onClick={() => handleQuickFilter(30)} className='px-4 py-2 border rounded-md text-sm hover:bg-gray-100'>
					Últimos 30 días
				</button>
				<button onClick={() => handleQuickFilter(90)} className='px-4 py-2 border rounded-md text-sm hover:bg-gray-100'>
					Últimos 90 días
				</button>
			</div>

			{/* Rango personalizado */}
			<div className='flex items-center gap-2'>
				<input
					type='date'
					value={customFrom}
					onChange={(e) => setCustomFrom(e.target.value)}
					className='border rounded-md px-2 py-1 text-sm'
				/>
				<span>-</span>
				<input
					type='date'
					value={customTo}
					onChange={(e) => setCustomTo(e.target.value)}
					className='border rounded-md px-2 py-1 text-sm'
				/>
				<button
					onClick={handleCustomFilter}
					className='px-4 py-2 text-white rounded-[9px] text-sm bg-[#5F8B1D] hover:bg-[#4B6C16]'
				>
					Filtrar
				</button>
			</div>
		</div>
	);
}

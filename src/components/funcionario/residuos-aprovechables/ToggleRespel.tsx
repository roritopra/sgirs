'use client';

import React from 'react';

type Option = {
	id: number;
	label: string;
};

type ToggleSelectorCardProps = {
	selected: number;
	onSelect: (id: number) => void;
};

const options: Option[] = [
	{ id: 1, label: 'RAEE' },
	{ id: 2, label: 'RESPEL' },
	{ id: 3, label: 'RCD' },
];

const ToggleOrganicos: React.FC<ToggleSelectorCardProps> = ({ selected, onSelect }) => {
	return (
		<div className='flex space-x-4 mb-6'>
			{options.map((option) => (
				<button
					key={option.id}
					onClick={() => onSelect(option.id)}
					className={`text-sm px-6 py-3 rounded-md transition-all duration-150
            ${
							selected === option.id
								? 'bg-[#D7E9BC] text-gray-800 font-semibold'
								: 'bg-white text-gray-800 hover:bg-gray-100'
						}
            border border-white shadow-sm
          `}
				>
					{option.label}
				</button>
			))}
		</div>
	);
};

export default ToggleOrganicos;

'use client';

import React from 'react';

export const TIPO_RESIDUO_OPTIONS: string[] = [
  'Residuos No Aprovechables (Ordinarios)',
  'Residuos Sólidos Orgánicos (RSO)',
  'Residuos Aprovechables',
  'Aceite de Cocina Usado (ACU)',
  'Residuos de Aparatos Eléctricos y Electrónicos (RAEE)',
  'Residuos de Construcción y Demolición (RCD)',
  'Residuos Peligrosos (RESPEL)',
  'Residuos Voluminosos',
  'Residuos No Aprovechables',
];

type Props = {
  selected: string;
  onSelect: (value: string) => void;
};

export default function ToggleTipoResiduo({ selected, onSelect }: Props) {
  return (
    <div className='flex flex-wrap gap-2 mb-4' role='group' aria-label='Filtro por tipo de residuo'>
      {TIPO_RESIDUO_OPTIONS.map((label) => {
        const isActive = selected === label;
        return (
          <button
            key={label}
            onClick={() => onSelect(label)}
            className={`text-sm px-4 py-2 rounded-md transition-all duration-150 border ${
              isActive ? 'bg-[#D7E9BC] text-gray-800 font-semibold border-[#D7E9BC]' : 'bg-white text-gray-800 hover:bg-gray-100 border-gray-200'
            }`}
            aria-pressed={isActive}
            aria-label={`Filtrar por ${label}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

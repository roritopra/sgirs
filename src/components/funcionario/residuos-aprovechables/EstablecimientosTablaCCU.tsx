'use client';

import { useState } from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';

export interface Establecimiento {
	nombre: string;
	responsable: string;
	direccion: string;
	telefono: string;
	barrio: string;
	comuna: number;
	estado: 'con_ccu' | 'sin_ccu';
  sector?: string;
}

interface Props {
  title: string;
  subtitle?: string;
  data: Establecimiento[];
  // Control externo opcional
  search?: string;
  onSearchChange?: (value: string) => void;
  filtro?: 'todos' | 'con_ccu' | 'sin_ccu';
  onFiltroChange?: (value: 'todos' | 'con_ccu' | 'sin_ccu') => void;
  page?: number;
  limit?: number;
  total?: number;
  onPageChange?: (value: number) => void;
  isLoading?: boolean;
}

export default function EstablecimientosTabla({
  title,
  subtitle,
  data,
  search,
  onSearchChange,
  filtro,
  onFiltroChange,
  page,
  limit,
  total,
  onPageChange,
  isLoading,
}: Props) {
  const [busqueda, setBusqueda] = useState(search ?? '');
  const [filtroLocal, setFiltroLocal] = useState<'todos' | 'con_ccu' | 'sin_ccu'>(filtro ?? 'todos');

  const currentSearch = search !== undefined ? search : busqueda;
  const currentFiltro = filtro !== undefined ? filtro : filtroLocal;

  // Si los controles vienen desde el padre, NO filtramos localmente, para que el backend sea la fuente de verdad
  const shouldFilterSearchLocally = !onSearchChange;
  const shouldFilterFiltroLocally = !onFiltroChange;

  const filtrados = data.filter((e) => {
    const coincideBusqueda = shouldFilterSearchLocally
      ? (
          e.nombre.toLowerCase().includes(currentSearch.toLowerCase()) ||
          e.responsable.toLowerCase().includes(currentSearch.toLowerCase()) ||
          e.barrio.toLowerCase().includes(currentSearch.toLowerCase()) ||
          String(e.comuna).includes(currentSearch)
        )
      : true;
    const coincideFiltro = shouldFilterFiltroLocally
      ? (currentFiltro === 'todos' || e.estado === currentFiltro)
      : true;
    return coincideBusqueda && coincideFiltro;
  });

  return (
    <div className='mt-6'>
      <div className='sticky top-0 bg-white z-10 pb-2'>
        <h2 className='text-lg font-semibold text-gray-800'>{title}</h2>
        {subtitle && <p className='text-sm text-gray-500 mb-4'>{subtitle}</p>}

        <div className='flex justify-between items-center flex-wrap gap-4'>
          <input
            type='text'
            placeholder='Buscar establecimientos...'
            className='border border-gray-300 rounded-md px-3 py-1 text-sm w-full max-w-xs'
            value={currentSearch}
            onChange={(e) => {
              if (onSearchChange) onSearchChange(e.target.value);
              else setBusqueda(e.target.value);
            }}
          />
          <div className='flex gap-2'>
            <button
              onClick={() => (onFiltroChange ? onFiltroChange('todos') : setFiltroLocal('todos'))}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm border ${
                currentFiltro === 'todos' ? 'bg-gray-200' : 'border-gray-300'
              }`}
            >
              <FunnelIcon className='h-4 w-4' /> Todos
            </button>
            <button
              onClick={() => (onFiltroChange ? onFiltroChange('con_ccu') : setFiltroLocal('con_ccu'))}
              className={`px-3 py-1 rounded-full text-sm border ${
                currentFiltro === 'con_ccu' ? 'bg-[#D7E9BC]' : 'border-gray-300'
              }`}
            >
              Con CCU
            </button>
            <button
              onClick={() => (onFiltroChange ? onFiltroChange('sin_ccu') : setFiltroLocal('sin_ccu'))}
              className={`px-3 py-1 rounded-full text-sm border ${
                currentFiltro === 'sin_ccu' ? 'bg-gray-100' : 'border-gray-300'
              }`}
            >
              Sin CCU
            </button>
          </div>
        </div>
      </div>

      <div className='relative max-h-[300px] overflow-y-auto border rounded-lg'>
        {isLoading && (
          <div className='absolute inset-0 z-[9999] bg-white/60 backdrop-blur-sm flex items-center justify-center' role='status' aria-live='polite' aria-label='Cargando establecimientos'>
            <div className='animate-spin h-6 w-6 border-2 border-gray-400 border-t-transparent rounded-full' />
          </div>
        )}
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
            {filtrados.map((e, i) => (
              <tr key={i} className='hover:bg-gray-50 transition'>
                <td className='py-2 pr-6 pl-6 whitespace-nowrap text-gray-800'>{e.nombre}</td>
                <td className='py-2 pr-6 whitespace-nowrap text-gray-700'>{e.responsable}</td>
                <td className='py-2 pr-6 whitespace-nowrap text-gray-700'>{e.direccion}</td>
                <td className='py-2 pr-6 whitespace-nowrap text-gray-700'>{e.telefono}</td>
                <td className='py-2 pr-6 whitespace-nowrap text-gray-700'>{e.barrio}</td>
                <td className='py-2 pr-6 whitespace-nowrap text-gray-700'>{e.sector ?? ''}</td>
                <td className='py-2 pr-6 whitespace-nowrap text-gray-700'>{e.comuna}</td>
                <td className='py-2 pr-6 whitespace-nowrap'>
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium inline-block ${
                      e.estado === 'con_ccu'
                        ? 'bg-[#D7E9BC] text-[#5F8B1D]'
                        : 'border border-gray-400 text-gray-600 bg-gray-100'
                    }`}
                  >
                    {e.estado === 'con_ccu' ? 'Con CCU' : 'Sin CCU'}
                  </span>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={8} className='py-4 text-center text-gray-500'>
                  No se encontraron establecimientos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {typeof page === 'number' && typeof limit === 'number' && typeof total === 'number' && onPageChange && (
        <div className='flex items-center justify-between mt-3 text-sm text-gray-600'>
          <span>
            Página {page} de {Math.max(1, Math.ceil(total / (limit || 1)))}
          </span>
          <div className='flex gap-2'>
            <button
              className='px-3 py-1 border rounded disabled:opacity-50'
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              aria-label='Página anterior'
            >
              Anterior
            </button>
            <button
              className='px-3 py-1 border rounded disabled:opacity-50'
              disabled={page >= Math.ceil((total || 0) / (limit || 1))}
              onClick={() => onPageChange(page + 1)}
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

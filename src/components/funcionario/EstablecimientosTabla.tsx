'use client';

import { useState } from 'react';

export interface Establecimiento {
    nombre: string;
    responsable: string;
    direccion: string;
    telefono: string;
    barrio: string;
    comuna: number | string;
    sector?: string;
}

interface Props {
    data: Establecimiento[];
    title: string;
    subtitle: string;
    // Control externo
    search?: string;
    onSearchChange?: (value: string) => void;
    page?: number;
    limit?: number;
    total?: number;
    onPageChange?: (value: number) => void;
    isLoading?: boolean;
}

export default function EstablecimientosTabla({
    data,
    title,
    subtitle,
    search,
    onSearchChange,
    page,
    limit,
    total,
    onPageChange,
    isLoading = false,
}: Props) {
    const [busquedaLocal, setBusquedaLocal] = useState(search ?? '');

    const currentSearch = search !== undefined ? search : busquedaLocal;
    const handleSearchChange = (value: string) => {
        if (onSearchChange) onSearchChange(value);
        else setBusquedaLocal(value);
    };

    const filtrados = onSearchChange
        ? data
        : data.filter((e) => (
              e.nombre.toLowerCase().includes(currentSearch.toLowerCase()) ||
              e.responsable.toLowerCase().includes(currentSearch.toLowerCase()) ||
              e.barrio.toLowerCase().includes(currentSearch.toLowerCase())
          ));

    const totalPages = typeof total === 'number' && typeof limit === 'number' ? Math.max(1, Math.ceil(total / (limit || 1))) : 1;

    return (
        <div className='w-full space-y-4 mt-6'>
            <div className='sticky top-0 bg-white z-10'>
                <h2 className='text-lg font-semibold text-gray-800 mb-1'>{title}</h2>
                <p className='text-sm text-gray-500 mb-4'>{subtitle}</p>

                <input
                    type='text'
                    placeholder='Buscar establecimientos...'
                    className='border border-gray-300 rounded-md px-3 py-1.5 text-sm w-full max-w-xs mb-4'
                    value={currentSearch}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    aria-label='Buscar establecimientos por nombre, responsable o barrio'
                />
            </div>
            <div className='border rounded-lg overflow-hidden relative'>
                <div className='overflow-y-auto' style={{ maxHeight: '400px' }}>
                    <table className='min-w-full text-sm'>
                        <thead className='bg-gray-50 sticky top-0'>
                            <tr className='text-left text-gray-600'>
                                <th className='py-3 px-4'>Establecimiento</th>
                                <th className='py-3 px-4'>Responsable</th>
                                <th className='py-3 px-4'>Dirección</th>
                                <th className='py-3 px-4'>Teléfono</th>
                                <th className='py-3 px-4'>Barrio</th>
                                <th className='py-3 px-4'>Sector</th>
                                <th className='py-3 px-4'>Comuna</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-200'>
                            {filtrados.map((e, i) => (
                                <tr key={i} className='hover:bg-gray-50'>
                                    <td className='py-3 px-4 whitespace-nowrap'>{e.nombre}</td>
                                    <td className='py-3 px-4'>{e.responsable}</td>
                                    <td className='py-3 px-4'>{e.direccion}</td>
                                    <td className='py-3 px-4'>{e.telefono}</td>
                                    <td className='py-3 px-4'>{e.barrio}</td>
                                    <td className='py-3 px-4'>{e.sector ?? ''}</td>
                                    <td className='py-3 px-4'>{e.comuna}</td>
                                </tr>
                            ))}
                            {filtrados.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={7} className='py-8 text-center text-gray-500'>
                                        No se encontraron establecimientos
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {isLoading && (
                    <div
                        className='absolute inset-0 z-[9999] bg-white/60 backdrop-blur-sm flex items-center justify-center'
                        role='status'
                        aria-live='polite'
                        aria-label='Cargando establecimientos'
                    >
                        <div className='animate-spin h-6 w-6 border-2 border-gray-400 border-t-transparent rounded-full' />
                    </div>
                )}
            </div>

            {typeof page === 'number' && typeof limit === 'number' && typeof total === 'number' && onPageChange && (
                <div className='flex items-center justify-between mt-2 text-sm text-gray-700'>
                    <span>
                        Página {page} de {totalPages} · {total} resultados
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
                            disabled={page >= totalPages}
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

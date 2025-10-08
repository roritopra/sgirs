'use client';

import { useEffect, useState } from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';
import { getEstablecimientosRSO, type EstadoRSO, type RSOEstablecimiento } from '@/services/funcionario/residuos-organicos/getEstablecimientosRSO.service';

export default function TableRSO({ periodo }: { periodo?: string }) {
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filtro, setFiltro] = useState<'todos' | EstadoRSO>('todos');
    const [data, setData] = useState<RSOEstablecimiento[]>([]);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(20);
    const [total, setTotal] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(function debounceSearch() {
        const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    useEffect(function fetchRSO() {
        let isMounted = true;
        async function run() {
            try {
                setIsLoading(true);
                setError(null);
                const estadoParam: EstadoRSO | undefined = filtro === 'todos' ? undefined : filtro;
                const res = await getEstablecimientosRSO({
                    estado: estadoParam,
                    search: debouncedSearch || undefined,
                    page,
                    limit,
                    periodo,
                });
                if (!isMounted) return;
                setData(res.data || []);
                setTotal(res.total || 0);
            } catch (e) {
                if (!isMounted) return;
                setError('No se pudieron cargar los establecimientos. Intenta nuevamente.');
                setData([]);
                setTotal(0);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }
        run();
        return () => {
            isMounted = false;
        };
    }, [debouncedSearch, filtro, page, limit, periodo]);

    function handleSetFiltro(next: 'todos' | 'Entregan' | 'No entregan') {
        // Mapeo a valores del backend
        const map: Record<string, 'todos' | EstadoRSO> = {
            todos: 'todos',
            Entregan: 'entregan',
            'No entregan': 'no_entregan',
        };
        const mapped = map[next];
        setFiltro(mapped);
        setPage(1);
    }

    // Reiniciar paginación al cambiar el periodo
    useEffect(() => {
        setPage(1);
    }, [periodo]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return (
        <div className='mt-6'>
            <div className='sticky top-0 bg-white z-10 pb-2'>
                <h2 className='text-lg font-semibold text-gray-800'>Usuarios que generan RSO</h2>
                <p className='text-sm text-gray-500 mb-4'>Información detallada de los establecimientos registrados</p>

                <div className='flex justify-between items-center flex-wrap gap-4'>
                    <input
                        type='text'
                        placeholder='Buscar establecimientos...'
                        className='border border-gray-300 rounded-md px-3 py-1 text-sm w-full max-w-xs'
                        aria-label='Buscar por establecimiento, responsable o barrio'
                        value={searchInput}
                        onChange={(e) => {
                            setSearchInput(e.target.value);
                            setPage(1);
                        }}
                    />
                    <div className='flex gap-2'>
                        <button
                            onClick={() => handleSetFiltro('todos')}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm border ${
                                filtro === 'todos' ? 'bg-gray-200' : 'border-gray-300'
                            }`}
                            aria-pressed={filtro === 'todos'}
                            >
                            <FunnelIcon className='h-4 w-4' /> Todos
                        </button>
                        <button
                            onClick={() => handleSetFiltro('Entregan')}
                            className={`px-3 py-1 rounded-full text-sm border ${
                                filtro === 'entregan' ? 'bg-[#D7E9BC]' : 'border-gray-300'
                            }`}
                            aria-pressed={filtro === 'entregan'}
                        >
                            Entregan
                        </button>
                        <button
                            onClick={() => handleSetFiltro('No entregan')}
                            className={`px-3 py-1 rounded-full text-sm border ${
                                filtro === 'no_entregan' ? 'bg-gray-100' : 'border-gray-300'
                            }`}
                            aria-pressed={filtro === 'no_entregan'}
                        >
                            No entregan
                        </button>
                    </div>
                </div>
            </div>

            <div className='relative max-h-[300px] overflow-y-auto border rounded-lg'>
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
                        {data.map((e, i) => {
                            const estadoTexto = ((): 'Entregan' | 'No entregan' => {
                                if (typeof e.entrega === 'boolean') return e.entrega ? 'Entregan' : 'No entregan';
                                if (typeof e.estado === 'string') return e.estado === 'entregan' ? 'Entregan' : 'No entregan';
                                return 'No entregan';
                            })();
                            return (
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
                                                estadoTexto === 'Entregan' ? 'bg-[#D7E9BC] text-[#5F8B1D]' : 'border border-gray-400 text-gray-600'
                                            }`}
                                        >
                                            {estadoTexto}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                        {data.length === 0 && !isLoading && (
                            <tr>
                                <td colSpan={8} className='py-4 text-center text-gray-500'>
                                    No se encontraron establecimientos.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

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

            <div className='mt-3 flex items-center justify-between'>
                <div className='text-xs text-gray-600'>
                    Página {page} de {totalPages} · {total} resultados
                </div>
                <div className='flex gap-2'>
                    <button
                        className='px-3 py-1 border rounded text-sm disabled:opacity-50'
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1 || isLoading}
                        aria-label='Página anterior'
                    >
                        Anterior
                    </button>
                    <button
                        className='px-3 py-1 border rounded text-sm disabled:opacity-50'
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages || isLoading}
                        aria-label='Página siguiente'
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        </div>
    );
}

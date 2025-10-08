'use client';

import { useEffect, useState } from 'react';
import { getEstablecimientosRcd, type EstablecimientosRcdResponse } from '@/services/funcionario/raee-respel-rcd/getEstablecimientosRcd.service';

export default function EstablecimientosTabla({ periodo }: { periodo?: string }) {
    const [busqueda, setBusqueda] = useState('');
    const [busquedaDebounced, setBusquedaDebounced] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [data, setData] = useState<EstablecimientosRcdResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const id = setTimeout(() => setBusquedaDebounced(busqueda.trim()), 350);
        return () => clearTimeout(id);
    }, [busqueda]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await getEstablecimientosRcd({
                    search: busquedaDebounced || undefined,
                    estado: 'gestor_no_aut',
                    page,
                    limit,
                    periodo,
                });
                setData(res);
            } catch (e) {
                setError('Error al cargar establecimientos RCD');
                setData({ data: [], total: 0, page: 1, limit, totalPages: 1 });
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [busquedaDebounced, page, limit, periodo]);

    useEffect(() => {
        setPage(1);
    }, [periodo]);

    const total = data?.total ?? 0;
    const totalPages = data?.totalPages ?? 1;
    const rows = data?.data ?? [];

    const safe = (v: any) => (v === null || v === undefined || (typeof v === 'number' && Number.isNaN(v)) ? '' : String(v));

    return (
        <div className=' w-full space-y-4'>
            <div className='sticky top-0 bg-white z-10 mt-6'>
                <h2 className='text-lg font-semibold text-gray-800 mb-1'>RCD sin recolección autorizada (UAESP)</h2>
                <p className='text-sm text-gray-500 mb-4'>Información detallada de los establecimientos registrados</p>

                <input
                    type='text'
                    placeholder='Buscar establecimientos...'
                    className='border border-gray-300 rounded-md px-3 py-1.5 text-sm w-full max-w-xs mb-4'
                    value={busqueda}
                    onChange={(e) => { setBusqueda(e.target.value); setPage(1); }}
                    aria-busy={isLoading}
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
                            {rows.map((e, i) => (
                                <tr key={i} className='hover:bg-gray-50'>
                                    <td className='py-3 px-4 whitespace-nowrap'>{safe(e.nombre)}</td>
                                    <td className='py-3 px-4'>{safe(e.responsable)}</td>
                                    <td className='py-3 px-4'>{safe(e.direccion)}</td>
                                    <td className='py-3 px-4'>{safe(e.telefono)}</td>
                                    <td className='py-3 px-4'>{safe(e.barrio)}</td>
                                    <td className='py-3 px-4'>{safe((e as any).sector)}</td>
                                    <td className='py-3 px-4'>{safe(e.comuna)}</td>
                                </tr>
                            ))}
                            {rows.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={7} className='py-8 text-center text-gray-500' role='status'>
                                        No se encontraron establecimientos
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {isLoading && (
                    <div className='absolute inset-0 z-[9999] bg-white/60 backdrop-blur-sm flex items-center justify-center' role='status' aria-live='polite' aria-label='Cargando establecimientos'>
                        <div className='animate-spin h-6 w-6 border-2 border-gray-400 border-t-transparent rounded-full' />
                    </div>
                )}
                {error && (
                    <div className='absolute left-2 bottom-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1' role='alert' aria-live='polite'>
                        {error}
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className='flex items-center justify-between mt-2 text-sm text-gray-700'>
                    <span>
                        Página {page} de {totalPages} · {total} resultados
                    </span>
                    <div className='flex gap-2'>
                        <button className='px-3 py-1 border rounded disabled:opacity-50' disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label='Página anterior'>
                            Anterior
                        </button>
                        <button className='px-3 py-1 border rounded disabled:opacity-50' disabled={page >= totalPages} onClick={() => setPage(page + 1)} aria-label='Página siguiente'>
                            Siguiente
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

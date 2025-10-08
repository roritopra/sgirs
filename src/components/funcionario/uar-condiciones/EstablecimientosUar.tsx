'use client';

import { useEffect, useState } from 'react';
import { getGestoresPorComuna } from '@/services/funcionario/uar/getGestoresPorComuna.service';

type Row = { gestor: string; comunas: Array<string | number> };

export default function ResumenGestoresComunas({ periodo }: { periodo?: string }) {
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getGestoresPorComuna({ periodo });
                setRows(data.map((d) => ({ gestor: d.gestor, comunas: d.comunas_presencia })));
            } catch (e) {
                setError('No se pudo cargar la distribución de gestores por comuna');
                setRows([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [periodo]);

    function renderComunas(comunas: Array<string | number>) {
        const nums = comunas.map((c) => Number(c)).filter((n) => !Number.isNaN(n));
        const unique = Array.from(new Set(nums)).sort((a, b) => a - b);
        return unique.join(', ');
    }

    return (
        <div className='mt-6 bg-white rounded-lg p-4'>
            <div className='mb-6'>
                <h2 className='text-lg font-semibold text-gray-800'>Distribución de Gestores por Comuna</h2>
                <p className='text-sm text-gray-500'>En qué comunas se encuentran los gestores registrados</p>
            </div>

            <div className='relative overflow-y-auto max-h-[280px] border rounded-md'>
                <table className='min-w-full table-fixed divide-y divide-gray-200'>
                    <thead className='bg-gray-50 sticky top-0 z-10'>
                        <tr>
                            <th className='w-1/2 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                Gestor
                            </th>
                            <th className='w-1/2 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                Comunas con presencia
                            </th>
                        </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                        {rows.map((row, index) => (
                            <tr key={index} className='hover:bg-gray-50 transition-colors'>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>{row.gestor}</td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{renderComunas(row.comunas)}</td>
                            </tr>
                        ))}
                        {rows.length === 0 && !loading && !error && (
                            <tr>
                                <td colSpan={2} className='px-6 py-8 text-center text-gray-500'>No hay datos disponibles</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {loading && (
                    <div
                        className='absolute inset-0 z-[9999] bg-white/60 backdrop-blur-sm flex items-center justify-center'
                        role='status'
                        aria-live='polite'
                        aria-label='Cargando gestores por comuna'
                    >
                        <div className='animate-spin h-6 w-6 border-2 border-gray-400 border-t-transparent rounded-full' />
                    </div>
                )}
                {!loading && error && (
                    <div className='absolute inset-x-0 bottom-0 p-3 text-center text-sm text-red-600' role='alert' aria-live='polite'>
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}

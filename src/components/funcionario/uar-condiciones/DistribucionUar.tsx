'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getDistribucionUar } from '@/services/funcionario/uar/getDistribucionUar.service';

export default function UARChart({ periodo }: { periodo?: string }) {
    const [data, setData] = useState<{ name: string; value: number }[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const dist = await getDistribucionUar({ periodo });
                setData(dist.map((d) => ({ name: d.tipo, value: d.cantidad })));
            } catch (e) {
                setError('No se pudo cargar la distribución UAR');
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [periodo]);

    return (
        <div className='bg-white p-6 rounded-xl shadow-md'>
            <h2 className='text-lg font-semibold text-gray-800 mb-4'>Cumplimiento UAR</h2>
            <p className='text-sm text-gray-500 mb-6'>Distribución de establecimientos según el nivel de cumplimiento UAR</p>

            <div className='w-full h-80'>
                {loading && (
                    <div className='flex items-center justify-center h-full' role='status' aria-live='polite'>
                        <span className='text-sm text-gray-600'>Cargando distribución…</span>
                    </div>
                )}
                {!loading && error && (
                    <div className='flex items-center justify-center h-full' role='alert' aria-live='polite'>
                        <span className='text-sm text-red-600'>{error}</span>
                    </div>
                )}
                {!loading && !error && (
                    <ResponsiveContainer>
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray='3 3' />
                            <XAxis dataKey='name' />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey='value' fill='#7FB927' name='Establecimientos' />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}

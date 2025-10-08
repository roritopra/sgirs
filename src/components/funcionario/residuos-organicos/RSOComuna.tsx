'use client';

import { useEffect, useState } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { getGeneranRSOPorComuna, type RSOComunaApiItem } from '@/services/funcionario/residuos-organicos/getGeneranRSOPorComuna.service';

type ComunaData = {
    comuna: string;
    Entregan: number;
    'No entregan': number;
};

export default function UsuariosPorComunaChart({ periodo }: { periodo?: string }) {
    const [data, setData] = useState<ComunaData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const res: RSOComunaApiItem[] = await getGeneranRSOPorComuna({ periodo });
                const chartData: ComunaData[] = (res || []).map((item) => ({
                    comuna: `Comuna ${item.comuna}`,
                    Entregan: Number(item.entrega || 0),
                    'No entregan': Number(item.no_entrega || 0),
                }));
                setData(chartData);
            } catch (err) {
                console.error('Error cargando datos RSO por comuna:', err);
                setError('No se pudieron cargar los datos. Intenta nuevamente.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [periodo]);

    return (
        <div>
            <div className='mb-5'>
                <h2 className='text-base font-semibold text-gray-900'>Usuarios que generan RSO por comuna</h2>
                <p className='text-sm text-gray-500'>Cantidad de establecimientos</p>
            </div>
            {isLoading && (
                <div className='mb-3 text-sm text-gray-600' role='status' aria-live='polite'>
                    Cargando datos...
                </div>
            )}
            {error && (
                <div className='mb-3 text-sm text-red-600' role='alert' aria-live='polite'>
                    {error}
                </div>
            )}
            <div className='h-[300px]'>
                <ResponsiveBar
                    data={data}
                    keys={['Entregan', 'No entregan']}
                    indexBy='comuna'
                    margin={{ top: 20, right: 30, bottom: 60, left: 50 }}
                    padding={0.3}
                    groupMode='grouped'
                    colors={['#7FB927', '#B0F44A']}
                    borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Cantidad',
                        legendPosition: 'middle',
                        legendOffset: -40,
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    enableLabel={false}
                    legends={[
                        {
                            dataFrom: 'keys',
                            anchor: 'bottom',
                            direction: 'row',
                            justify: false,
                            translateX: 0,
                            translateY: 50,
                            itemsSpacing: 2,
                            itemWidth: 100,
                            itemHeight: 20,
                            itemDirection: 'left-to-right',
                            itemOpacity: 0.85,
                            symbolSize: 12,
                            effects: [
                                {
                                    on: 'hover',
                                    style: { itemOpacity: 1 },
                                },
                            ],
                        },
                    ]}
                    tooltip={({ id, value, indexValue }) => (
                        <div className='bg-white p-2 shadow-md rounded text-xs'>
                            <strong>{indexValue}</strong>: {value} establecimientos {id}
                        </div>
                    )}
                    animate={true}
                />
            </div>
        </div>
    );
}

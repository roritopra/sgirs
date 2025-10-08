'use client';

import React from 'react';

type BackendLabel = 'Positivo' | 'Neutral' | 'Negativo';

type SentimientoDetalle = {
  label: BackendLabel;
  porcentaje: number;
  cantidad: number;
  color: string;
  iconColor: string;
};

type Props = {
  items?: { label: string; porcentaje: number; cantidad: number }[];
  indicador?: number; // indicador_sentimiento: se muestra tal cual, sin cálculos
};

const defaultItems: { label: BackendLabel; porcentaje: number; cantidad: number }[] = [
  { label: 'Positivo', porcentaje: 0, cantidad: 0 },
  { label: 'Neutral', porcentaje: 0, cantidad: 0 },
  { label: 'Negativo', porcentaje: 0, cantidad: 0 },
];

const colorMap: Record<BackendLabel, { bg: string; text: string; bar: string; item: string }> = {
  Positivo: { bg: '#ECF5DF', text: '#395312', bar: '#7FB927', item: '#7FB927' },
  Neutral: { bg: '#fef3c7', text: '#a16207', bar: '#eab308', item: '#eab308' },
  Negativo: { bg: '#fee2e2', text: '#991b1b', bar: '#dc2626', item: '#dc2626' },
};

export default function AnalisisSentimiento({ items, indicador }: Props) {
  const src = (items && items.length > 0 ? items : defaultItems).filter(Boolean) as {
    label: string;
    porcentaje: number;
    cantidad: number;
  }[];

  const detalle: SentimientoDetalle[] = src.map((it) => {
    const lbl = (['Positivo', 'Neutral', 'Negativo'].includes(it.label) ? it.label : 'Neutral') as BackendLabel;
    const colors = colorMap[lbl];
    return {
      label: lbl,
      porcentaje: Math.max(0, Math.min(100, Number(it.porcentaje) || 0)),
      cantidad: Number(it.cantidad) || 0,
      color: colors.item,
      iconColor: colors.item,
    };
  });

  // Usar el indicador_sentimiento provisto (sin calcular promedio). Para la barra, acotar a [0,100].
  const indicadorValor = Number(indicador ?? 0);
  const indicadorBarra = Number.isFinite(indicadorValor)
    ? Math.max(0, Math.min(100, indicadorValor))
    : 0;

  const sentimientoPredominante = detalle.reduce<SentimientoDetalle>(
    (prev, current) => (current.porcentaje > prev.porcentaje ? current : prev),
    detalle[0]
  );
  const tendencia =
    sentimientoPredominante.label === 'Positivo'
      ? 'Tendencia positiva'
      : sentimientoPredominante.label === 'Negativo'
      ? 'Tendencia negativa'
      : 'Tendencia neutral';

  const colores = colorMap[sentimientoPredominante.label] || colorMap.Neutral;

  return (
    <div className='bg-white rounded-xl shadow-sm p-6 w-full'>
      <div className='mb-4 flex justify-between'>
        <div>
          <h2 className='text-base font-semibold text-gray-900'>Análisis de Sentimientos</h2>
          <p className='text-sm text-gray-500'>Distribución emocional de las interacciones con el chatbot</p>
        </div>
      </div>

      <div style={{ backgroundColor: colores.bg }} className='rounded-lg p-4 mb-6'>
        <div className='flex justify-between items-center mb-2' style={{ color: colores.text }}>
          <h3 className='font-semibold'>Sentimiento Promedio</h3>
          <span className='font-semibold'>{Number.isFinite(indicadorValor) ? indicadorValor : 0}</span>
        </div>
        <div className='w-full h-3 bg-white rounded-full'>
          <div
            className='h-3 rounded-full'
            style={{ width: `${indicadorBarra}%`, backgroundColor: colores.bar }}
          ></div>
        </div>
        <p className='text-sm mt-2' style={{ color: colores.text }}>
          {tendencia}
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {detalle.map((item, idx) => (
          <div key={idx} className='bg-gray-50 p-4 rounded-lg shadow-sm'>
            <div className='flex items-center justify-between mb-2'>
              <div className='flex items-center gap-2'>
                <span className='w-3 h-3 rounded-full' style={{ backgroundColor: item.iconColor }}></span>
                <span className='font-medium text-gray-800'>{item.label}</span>
              </div>
              <span className='text-gray-600 text-sm'>
                {item.porcentaje}% ({item.cantidad})
              </span>
            </div>
            <div className='w-full h-3 bg-white rounded-full'>
              <div
                className='h-3 rounded-full'
                style={{ width: `${item.porcentaje}%`, backgroundColor: item.color }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

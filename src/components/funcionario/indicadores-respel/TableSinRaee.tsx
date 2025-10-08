'use client';

import { useState } from 'react';

const establecimientos = [
  {
    nombre: 'Panadería La Cosecha',
    responsable: 'María García',
    direccion: 'Calle 13 #45-67',
    telefono: '+57 321 456 7890',
    barrio: 'San Fernando',
    comuna: 10,
    estado: 'con',
  },
  {
    nombre: 'Tienda Mi Barrio',
    responsable: 'Luis Gómez',
    direccion: 'Carrera 5 #12-34',
    telefono: '+57 310 987 6543',
    barrio: 'El Lido',
    comuna: 17,
    estado: 'sin',
  },
  {
    nombre: 'Supermercado Central',
    responsable: 'Ana Ruiz',
    direccion: 'Calle 9 #20-15',
    telefono: '+57 300 111 2233',
    barrio: 'Alameda',
    comuna: 3,
    estado: 'con',
  },
  {
    nombre: 'Ferretería El Tornillo',
    responsable: 'Carlos Peña',
    direccion: 'Carrera 18 #30-55',
    telefono: '+57 311 765 4321',
    barrio: 'Cristóbal Colón',
    comuna: 12,
    estado: 'sin',
  },
  {
    nombre: 'Droguería Vida',
    responsable: 'Julián Castro',
    direccion: 'Calle 45 #65-10',
    telefono: '+57 318 222 3344',
    barrio: 'La Flora',
    comuna: 2,
    estado: 'con',
  },
  {
    nombre: 'Restaurante El Sazón',
    responsable: 'Paola Rivas',
    direccion: 'Carrera 7 #23-10',
    telefono: '+57 301 555 6677',
    barrio: 'San Antonio',
    comuna: 1,
    estado: 'sin',
  },
];

export default function EstablecimientosTabla() {
  const [busqueda, setBusqueda] = useState('');

  const filtrados = establecimientos.filter((e) => e.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <div className=' w-full space-y-4 mt-6'>
      <div className='sticky top-0 bg-white z-10'>
        <h2 className='text-lg font-semibold text-gray-800 mb-1'>RAEE sin recolección autorizada (CVC/DAGMA)</h2>
        <p className='text-sm text-gray-500 mb-4'>Mapa coroplético de RAEE sin recolección autorizada (CVC/DAGMA)r</p>

        <input
          type='text'
          placeholder='Buscar establecimientos...'
          className='border border-gray-300 rounded-md px-3 py-1.5 text-sm w-full max-w-xs mb-4'
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>
      <div className='border rounded-lg overflow-hidden'>
        <div className='overflow-y-auto' style={{ maxHeight: '400px' }}>
          <table className='min-w-full text-sm'>
            <thead className='bg-gray-50 sticky top-0'>
              <tr className='text-left text-gray-600'>
                <th className='py-3 px-4'>Establecimiento</th>
                <th className='py-3 px-4'>Responsable</th>
                <th className='py-3 px-4'>Dirección</th>
                <th className='py-3 px-4'>Teléfono</th>
                <th className='py-3 px-4'>Barrio</th>
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
                  <td className='py-3 px-4'>{e.comuna}</td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={6} className='py-8 text-center text-gray-500'>
                    No se encontraron establecimientos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

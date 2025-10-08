import { Comuna } from '@/components/funcionario/MapTableCard';

export const mockComunasSinRaee: Comuna[] = [
  { id: 1, comuna: 2, cantidad: 12, porcentaje: 10 },
  { id: 2, comuna: 4, cantidad: 8, porcentaje: 7 },
];

export async function getComunasSinRaee(useMock = true): Promise<Comuna[]> {
  if (useMock) return mockComunasSinRaee;

  const res = await fetch('http://tu-backend/api/comunas/sin-raee');
  if (!res.ok) throw new Error('Error al obtener comunas sin RAEE');
  return res.json();
}

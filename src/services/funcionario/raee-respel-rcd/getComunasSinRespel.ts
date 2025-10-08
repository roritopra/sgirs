import { Comuna } from '@/components/funcionario/MapTableCard';

export const mockComunasSinRespel: Comuna[] = [
  { id: 1, comuna: 11, cantidad: 10, porcentaje: 25 },
  { id: 2, comuna: 12, cantidad: 7, porcentaje: 18 },
  { id: 3, comuna: 9, cantidad: 4, porcentaje: 10 },
];

export async function getComunasSinRespel(useMock = true): Promise<Comuna[]> {
  if (useMock) return mockComunasSinRespel;

  const res = await fetch('http://tu-backend/api/comunas/sin-respel');
  if (!res.ok) throw new Error('Error al obtener comunas sin RESPEL');
  return res.json();
}

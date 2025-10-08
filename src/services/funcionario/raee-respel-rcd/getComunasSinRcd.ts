import { Comuna } from '@/components/funcionario/MapTableCard';

export const mockComunasSinRcd: Comuna[] = [
  { id: 1, comuna: 16, cantidad: 15, porcentaje: 40 },
  { id: 2, comuna: 17, cantidad: 10, porcentaje: 27 },
  { id: 3, comuna: 18, cantidad: 8, porcentaje: 22 },
];

export async function getComunasSinRcd(useMock = true): Promise<Comuna[]> {
  if (useMock) return mockComunasSinRcd;

  const res = await fetch('http://tu-backend/api/comunas/sin-rcd');
  if (!res.ok) throw new Error('Error al obtener comunas sin RCD');
  return res.json();
}

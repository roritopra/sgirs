import { Comuna } from '@/components/funcionario/MapTableCard';

export const mockComunasRcd: Comuna[] = [
	{ id: 1, comuna: 1, cantidad: 77, porcentaje: 28.0 },
	{ id: 2, comuna: 2, cantidad: 615, porcentaje: 16.0 },
	{ id: 3, comuna: 3, cantidad: 283, porcentaje: 12.0 },
	{ id: 4, comuna: 4, cantidad: 740, porcentaje: 22.0 },
	{ id: 5, comuna: 5, cantidad: 92, porcentaje: 18.0 },
	{ id: 6, comuna: 6, cantidad: 834, porcentaje: 9.0 },
	{ id: 7, comuna: 7, cantidad: 301, porcentaje: 6.0 },
	{ id: 8, comuna: 8, cantidad: 963, porcentaje: 25.0 },
	{ id: 9, comuna: 9, cantidad: 451, porcentaje: 20.0 },
	{ id: 10, comuna: 10, cantidad: 618, porcentaje: 11.0 },
	{ id: 11, comuna: 11, cantidad: 107, porcentaje: 15.0 },
	{ id: 12, comuna: 12, cantidad: 552, porcentaje: 7.0 },
	{ id: 13, comuna: 13, cantidad: 390, porcentaje: 19.0 },
	{ id: 14, comuna: 14, cantidad: 826, porcentaje: 13.0 },
	{ id: 15, comuna: 15, cantidad: 277, porcentaje: 8.0 },
	{ id: 16, comuna: 16, cantidad: 693, porcentaje: 10.0 },
	{ id: 17, comuna: 17, cantidad: 905, porcentaje: 23.0 },
	{ id: 18, comuna: 18, cantidad: 124, porcentaje: 17.0 },
	{ id: 19, comuna: 19, cantidad: 348, porcentaje: 14.0 },
	{ id: 20, comuna: 20, cantidad: 721, porcentaje: 21.0 },
	{ id: 21, comuna: 21, cantidad: 256, porcentaje: 9.0 },
	{ id: 22, comuna: 22, cantidad: 830, porcentaje: 24.0 },
];

export async function getComunasRcd(useMock = true): Promise<Comuna[]> {
	if (useMock) return mockComunasRcd;

	const res = await fetch('http://tu-backend/api/comunas/rcd');
	if (!res.ok) throw new Error('Error al obtener comunas RCD');
	return res.json();
}

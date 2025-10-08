import { Comuna } from '@/components/funcionario/MapTableCard';

export const mockComunasRespel: Comuna[] = [
	{ id: 1, comuna: 1, cantidad: 456, porcentaje: 20.0 },
	{ id: 2, comuna: 2, cantidad: 381, porcentaje: 9.0 },
	{ id: 3, comuna: 3, cantidad: 912, porcentaje: 30.0 },
	{ id: 4, comuna: 4, cantidad: 127, porcentaje: 11.0 },
	{ id: 5, comuna: 5, cantidad: 643, porcentaje: 15.0 },
	{ id: 6, comuna: 6, cantidad: 294, porcentaje: 23.0 },
	{ id: 7, comuna: 7, cantidad: 58, porcentaje: 6.0 },
	{ id: 8, comuna: 8, cantidad: 712, porcentaje: 12.0 },
	{ id: 9, comuna: 9, cantidad: 376, porcentaje: 25.0 },
	{ id: 10, comuna: 10, cantidad: 95, porcentaje: 7.0 },
	{ id: 11, comuna: 11, cantidad: 822, porcentaje: 21.0 },
	{ id: 12, comuna: 12, cantidad: 340, porcentaje: 10.0 },
	{ id: 13, comuna: 13, cantidad: 487, porcentaje: 19.0 },
	{ id: 14, comuna: 14, cantidad: 922, porcentaje: 14.0 },
	{ id: 15, comuna: 15, cantidad: 201, porcentaje: 16.0 },
	{ id: 16, comuna: 16, cantidad: 765, porcentaje: 18.0 },
	{ id: 17, comuna: 17, cantidad: 59, porcentaje: 8.0 },
	{ id: 18, comuna: 18, cantidad: 633, porcentaje: 27.0 },
	{ id: 19, comuna: 19, cantidad: 419, porcentaje: 13.0 },
	{ id: 20, comuna: 20, cantidad: 310, porcentaje: 22.0 },
	{ id: 21, comuna: 21, cantidad: 504, porcentaje: 12.0 },
	{ id: 22, comuna: 22, cantidad: 861, porcentaje: 17.0 },
];

export async function getComunasRespel(useMock = true): Promise<Comuna[]> {
	if (useMock) return mockComunasRespel;

	const res = await fetch('http://tu-backend/api/comunas/respel');
	if (!res.ok) throw new Error('Error al obtener comunas RESPEL');
	return res.json();
}

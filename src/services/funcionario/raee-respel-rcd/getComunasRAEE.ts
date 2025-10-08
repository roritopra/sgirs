import { Comuna } from '@/components/funcionario/MapTableCard';

export const mockComunasRaee: Comuna[] = [
	{ id: 1, comuna: 1, cantidad: 12, porcentaje: 16.0 },
	{ id: 2, comuna: 2, cantidad: 945, porcentaje: 25.0 },
	{ id: 3, comuna: 3, cantidad: 478, porcentaje: 14.0 },
	{ id: 4, comuna: 4, cantidad: 673, porcentaje: 8.0 },
	{ id: 5, comuna: 5, cantidad: 189, porcentaje: 22.0 },
	{ id: 6, comuna: 6, cantidad: 765, porcentaje: 12.0 },
	{ id: 7, comuna: 7, cantidad: 299, porcentaje: 7.0 },
	{ id: 8, comuna: 8, cantidad: 555, porcentaje: 10.0 },
	{ id: 9, comuna: 9, cantidad: 814, porcentaje: 27.0 },
	{ id: 10, comuna: 10, cantidad: 49, porcentaje: 13.0 },
	{ id: 11, comuna: 11, cantidad: 203, porcentaje: 19.0 },
	{ id: 12, comuna: 12, cantidad: 622, porcentaje: 21.0 },
	{ id: 13, comuna: 13, cantidad: 374, porcentaje: 15.0 },
	{ id: 14, comuna: 14, cantidad: 820, porcentaje: 18.0 },
	{ id: 15, comuna: 15, cantidad: 93, porcentaje: 6.0 },
	{ id: 16, comuna: 16, cantidad: 710, porcentaje: 28.0 },
	{ id: 17, comuna: 17, cantidad: 499, porcentaje: 23.0 },
	{ id: 18, comuna: 18, cantidad: 276, porcentaje: 17.0 },
	{ id: 19, comuna: 19, cantidad: 664, porcentaje: 20.0 },
	{ id: 20, comuna: 20, cantidad: 128, porcentaje: 9.0 },
	{ id: 21, comuna: 21, cantidad: 982, porcentaje: 11.0 },
	{ id: 22, comuna: 22, cantidad: 237, porcentaje: 5.0 },
];

export async function getComunasRaee(useMock = true): Promise<Comuna[]> {
	if (useMock) return mockComunasRaee;

	const res = await fetch('http://tu-backend/api/comunas/raee');
	if (!res.ok) throw new Error('Error al obtener comunas RAEE');
	return res.json();
}

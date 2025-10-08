import { Comuna } from '@/components/funcionario/MapTableCard';

export const mockComunasACU: Comuna[] = [
	{ id: 1, comuna: 1, cantidad: 742, porcentaje: 11.0 },
	{ id: 2, comuna: 2, cantidad: 23, porcentaje: 19.0 },
	{ id: 3, comuna: 3, cantidad: 654, porcentaje: 24.0 },
	{ id: 4, comuna: 4, cantidad: 98, porcentaje: 17.0 },
	{ id: 5, comuna: 5, cantidad: 430, porcentaje: 29.0 },
	{ id: 6, comuna: 6, cantidad: 301, porcentaje: 15.0 },
	{ id: 7, comuna: 7, cantidad: 888, porcentaje: 8.0 },
	{ id: 8, comuna: 8, cantidad: 129, porcentaje: 20.0 },
	{ id: 9, comuna: 9, cantidad: 712, porcentaje: 16.0 },
	{ id: 10, comuna: 10, cantidad: 54, porcentaje: 13.0 },
	{ id: 11, comuna: 11, cantidad: 435, porcentaje: 18.0 },
	{ id: 12, comuna: 12, cantidad: 801, porcentaje: 9.0 },
	{ id: 13, comuna: 13, cantidad: 266, porcentaje: 21.0 },
	{ id: 14, comuna: 14, cantidad: 678, porcentaje: 26.0 },
	{ id: 15, comuna: 15, cantidad: 354, porcentaje: 14.0 },
	{ id: 16, comuna: 16, cantidad: 42, porcentaje: 7.0 },
	{ id: 17, comuna: 17, cantidad: 599, porcentaje: 22.0 },
	{ id: 18, comuna: 18, cantidad: 721, porcentaje: 12.0 },
	{ id: 19, comuna: 19, cantidad: 84, porcentaje: 6.0 },
	{ id: 20, comuna: 20, cantidad: 523, porcentaje: 28.0 },
	{ id: 21, comuna: 21, cantidad: 288, porcentaje: 10.0 },
	{ id: 22, comuna: 22, cantidad: 931, porcentaje: 5.0 },
];

export async function getComunasACU(useMock = true): Promise<Comuna[]> {
	if (useMock) {
		return mockComunasACU;
	}

	const res = await fetch('http://tu-backend/api/comunas-acu');
	if (!res.ok) throw new Error('Error al obtener comunas de ACU');
	return res.json();
}

import { Comuna } from '@/components/funcionario/MapTableCard';

export async function getComunasNoOro(useMock: boolean): Promise<Comuna[]> {
	if (useMock) {
		return [
			{ id: 1, comuna: 1, cantidad: 220, porcentaje: 33.0 },
			{ id: 2, comuna: 2, cantidad: 80, porcentaje: 27.0 },
			{ id: 3, comuna: 3, cantidad: 42, porcentaje: 18.0 },
			{ id: 4, comuna: 4, cantidad: 102, porcentaje: 15.0 },
			{ id: 5, comuna: 5, cantidad: 52, porcentaje: 33.0 },
			{ id: 6, comuna: 6, cantidad: 180, porcentaje: 27.0 },
			{ id: 7, comuna: 7, cantidad: 342, porcentaje: 18.0 },
			{ id: 8, comuna: 8, cantidad: 12, porcentaje: 15.0 },
			{ id: 9, comuna: 9, cantidad: 223, porcentaje: 33.0 },
			{ id: 10, comuna: 10, cantidad: 123, porcentaje: 27.0 },
			{ id: 11, comuna: 11, cantidad: 627, porcentaje: 18.0 },
			{ id: 12, comuna: 12, cantidad: 827, porcentaje: 15.0 },
			{ id: 13, comuna: 13, cantidad: 232, porcentaje: 33.0 },
			{ id: 14, comuna: 14, cantidad: 23, porcentaje: 27.0 },
			{ id: 15, comuna: 15, cantidad: 123, porcentaje: 18.0 },
			{ id: 16, comuna: 16, cantidad: 213, porcentaje: 15.0 },
			{ id: 17, comuna: 17, cantidad: 123, porcentaje: 33.0 },
			{ id: 18, comuna: 18, cantidad: 753, porcentaje: 27.0 },
			{ id: 19, comuna: 19, cantidad: 334, porcentaje: 18.0 },
			{ id: 20, comuna: 20, cantidad: 41, porcentaje: 15.0 },
			{ id: 21, comuna: 21, cantidad: 324, porcentaje: 33.0 },
			{ id: 22, comuna: 22, cantidad: 324, porcentaje: 27.0 },
		];
	}

	// 🔹 Datos reales desde la API
	const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/residuos/no-oro`);
	if (!res.ok) throw new Error('Error al cargar comunas con gestor NO ORO');
	return res.json();
}

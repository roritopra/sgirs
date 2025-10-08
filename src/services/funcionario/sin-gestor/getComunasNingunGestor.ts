import { Comuna } from '@/components/funcionario/MapTableCard';

export async function getComunasNingunGestor(useMock: boolean): Promise<Comuna[]> {
	if (useMock) {
		return [
			{ id: 1, comuna: 1, cantidad: 901, porcentaje: 8.0 },
			{ id: 2, comuna: 2, cantidad: 32, porcentaje: 17.0 },
			{ id: 3, comuna: 3, cantidad: 678, porcentaje: 29.0 },
			{ id: 4, comuna: 4, cantidad: 455, porcentaje: 4.0 },
			{ id: 5, comuna: 5, cantidad: 12, porcentaje: 22.0 },
			{ id: 6, comuna: 6, cantidad: 789, porcentaje: 31.0 },
			{ id: 7, comuna: 7, cantidad: 0, porcentaje: 5.0 },
			{ id: 8, comuna: 8, cantidad: 214, porcentaje: 27.0 },
			{ id: 9, comuna: 9, cantidad: 999, porcentaje: 19.0 },
			{ id: 10, comuna: 10, cantidad: 401, porcentaje: 15.0 },
			{ id: 11, comuna: 11, cantidad: 87, porcentaje: 30.0 },
			{ id: 12, comuna: 12, cantidad: 600, porcentaje: 11.0 },
			{ id: 13, comuna: 13, cantidad: 345, porcentaje: 14.0 },
			{ id: 14, comuna: 14, cantidad: 78, porcentaje: 25.0 },
			{ id: 15, comuna: 15, cantidad: 501, porcentaje: 12.0 },
			{ id: 16, comuna: 16, cantidad: 923, porcentaje: 6.0 },
			{ id: 17, comuna: 17, cantidad: 260, porcentaje: 20.0 },
			{ id: 18, comuna: 18, cantidad: 147, porcentaje: 33.0 },
			{ id: 19, comuna: 19, cantidad: 702, porcentaje: 9.0 },
			{ id: 20, comuna: 20, cantidad: 58, porcentaje: 26.0 },
			{ id: 21, comuna: 21, cantidad: 834, porcentaje: 13.0 },
			{ id: 22, comuna: 22, cantidad: 492, porcentaje: 7.0 },
		];
	}

	try {
		const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comunas/ningun-gestor`);
		if (!res.ok) {
			throw new Error('Error al obtener comunas de establecimientos sin gestor');
		}

		const data = await res.json();

		return data.map((item: any, index: number) => ({
			id: item.id ?? index + 1,
			name: item.name ?? item.comuna ?? `Comuna ${index + 1}`,
			value: item.value ?? item.cantidad ?? 0,
		})) as Comuna[];
	} catch (error) {
		console.error('❌ Error en getComunasNingunGestor:', error);
		return [];
	}
}

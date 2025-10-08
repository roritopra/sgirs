import { Comuna } from '@/components/funcionario/MapTableCard';

export async function getComunasVoluminosos(useMock: boolean): Promise<Comuna[]> {
	if (useMock) {
		return [
			{ id: 1, comuna: 1, cantidad: 388, porcentaje: 19.0 },
			{ id: 2, comuna: 2, cantidad: 472, porcentaje: 9.0 },
			{ id: 3, comuna: 3, cantidad: 103, porcentaje: 21.0 },
			{ id: 4, comuna: 4, cantidad: 566, porcentaje: 14.0 },
			{ id: 5, comuna: 5, cantidad: 812, porcentaje: 7.0 },
			{ id: 6, comuna: 6, cantidad: 94, porcentaje: 23.0 },
			{ id: 7, comuna: 7, cantidad: 655, porcentaje: 18.0 },
			{ id: 8, comuna: 8, cantidad: 142, porcentaje: 15.0 },
			{ id: 9, comuna: 9, cantidad: 987, porcentaje: 20.0 },
			{ id: 10, comuna: 10, cantidad: 275, porcentaje: 10.0 },
			{ id: 11, comuna: 11, cantidad: 634, porcentaje: 28.0 },
			{ id: 12, comuna: 12, cantidad: 203, porcentaje: 12.0 },
			{ id: 13, comuna: 13, cantidad: 799, porcentaje: 11.0 },
			{ id: 14, comuna: 14, cantidad: 58, porcentaje: 6.0 },
			{ id: 15, comuna: 15, cantidad: 440, porcentaje: 24.0 },
			{ id: 16, comuna: 16, cantidad: 319, porcentaje: 13.0 },
			{ id: 17, comuna: 17, cantidad: 688, porcentaje: 16.0 },
			{ id: 18, comuna: 18, cantidad: 527, porcentaje: 26.0 },
			{ id: 19, comuna: 19, cantidad: 77, porcentaje: 8.0 },
			{ id: 20, comuna: 20, cantidad: 845, porcentaje: 17.0 },
			{ id: 21, comuna: 21, cantidad: 193, porcentaje: 22.0 },
			{ id: 22, comuna: 22, cantidad: 721, porcentaje: 5.0 },
		];
	}

	try {
		const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comunas/voluminosos`);
		if (!res.ok) {
			throw new Error('Error al obtener comunas de voluminosos');
		}

		const data = await res.json();

		return data.map((item: any, index: number) => ({
			id: item.id ?? index + 1,
			name: item.name ?? item.comuna ?? `Comuna ${index + 1}`,
			value: item.value ?? item.cantidad ?? 0,
		})) as Comuna[];
	} catch (error) {
		console.error('❌ Error en getComunasVoluminosos:', error);
		return [];
	}
}

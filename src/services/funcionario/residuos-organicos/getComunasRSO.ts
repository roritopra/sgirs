import { Comuna } from '@/components/funcionario/MapTableCard';

export async function getComunasRSO(useMock: boolean): Promise<Comuna[]> {
	if (useMock) {
		return [
			{ id: 1, comuna: 1, cantidad: 300, porcentaje: 20 },
			{ id: 2, comuna: 2, cantidad: 150, porcentaje: 10 },
			{ id: 3, comuna: 3, cantidad: 450, porcentaje: 30 },
			{ id: 4, comuna: 4, cantidad: 200, porcentaje: 15 },
			{ id: 5, comuna: 5, cantidad: 380, porcentaje: 25 },
		];
	} else {
		const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comunas-rso`);
		if (!res.ok) throw new Error('Error al cargar comunas RSO');
		return res.json();
	}
}

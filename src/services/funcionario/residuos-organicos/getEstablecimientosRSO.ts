import mockEstablecimientos from '@/mock/establecimientos.json';
import { Establecimiento } from '@/components/funcionario/EstablecimientosTabla';

export async function getEstablecimientos(useMock: boolean): Promise<Establecimiento[]> {
	if (useMock) {
		return mockEstablecimientos as Establecimiento[];
	}

	const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/establecimientos`, {
		cache: 'no-store',
	});

	if (!res.ok) {
		throw new Error('Error al obtener los establecimientos');
	}

	return res.json();
}

import { get } from '@/utils/shared/apiUtils';

export interface EstablecimientoRaee {
	nombre: string;
	responsable: string;
	direccion: string;
	telefono: string;
	barrio: string;
	comuna: number | string;
	estado: 'gestor_aut' | 'gestor_no_aut';
    sector?: string;
}

export interface EstablecimientosRaeeResponse {
	data: EstablecimientoRaee[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface GetEstablecimientosRaeeParams {
	search?: string;
	estado?: 'gestor_aut' | 'gestor_no_aut';
	page?: number;
	limit?: number;
    periodo?: string;
}

export async function getEstablecimientosRaee(params?: GetEstablecimientosRaeeParams): Promise<EstablecimientosRaeeResponse> {
	const searchParams = new URLSearchParams();

	if (params?.search) {
		searchParams.append('search', params.search);
	}

	if (params?.estado) {
		searchParams.append('estado', params.estado);
	}

	if (params?.page) {
		searchParams.append('page', params.page.toString());
	}

	if (params?.limit) {
		searchParams.append('limit', params.limit.toString());
	}

    if (params?.periodo) {
        searchParams.append('periodo', params.periodo);
    }

	const url = `/api/v1/dashboard/RAEE/recolecciones/establecimientos${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

	const response = await get<any>(url);

	// Helper para normalizar un item del backend
	const normalizeItem = (item: any): EstablecimientoRaee => ({
		nombre:
			(item?.nombre ??
			item?.establecimiento ??
			item?.nombre_establecimiento ??
			item?.razon_social ??
			item?.razón_social ??
			item?.name ??
			item?.empresa ??
			item?.comercio ??
			item?.establecimiento_nombre ??
			item?.nombre_est ??
			item?.establecimiento?.nombre ??
			'') || '(Sin nombre)',
		responsable: String(item?.responsable ?? item?.contacto ?? item?.representante ?? ''),
		direccion: String(item?.direccion ?? item?.dirección ?? item?.dir ?? item?.address ?? ''),
		telefono: String(item?.telefono ?? item?.teléfono ?? item?.celular ?? item?.tel ?? ''),
		barrio: String(item?.barrio ?? ''),
		sector: item?.sector ? String(item.sector) : undefined,
		comuna: (() => {
			const raw = item?.comuna ?? item?.id_comuna ?? item?.numero_comuna;
			const num = Number(raw);
			if (typeof raw === 'number') return Number.isNaN(raw) ? '' : raw;
			if (raw === null || raw === undefined || raw === '') return '';
			return Number.isFinite(num) && !Number.isNaN(num) ? num : String(raw);
		})(),
		estado: ((): 'gestor_aut' | 'gestor_no_aut' => {
			const raw = (item?.estado ?? item?.recoleccion ?? item?.recolección ?? '').toString().toLowerCase();
			if (raw.includes('aut')) return 'gestor_aut';
			if (raw.includes('no') || raw.includes('sin')) return 'gestor_no_aut';
			return (params?.estado as any) || 'gestor_no_aut';
		})(),
	});

	// Si la API responde con un array directo
	if (Array.isArray(response)) {
		const rawArr = response as any[];
		const arr = rawArr.map(normalizeItem);
		const limit = params?.limit || 20;
		const page = params?.page || 1;
		return {
			data: arr,
			total: arr.length,
			page,
			limit,
			totalPages: Math.ceil(arr.length / limit),
		};
	}

	// Si la API responde con objeto con paginación { data, total, page, limit, totalPages }
	if (response && Array.isArray(response.data)) {
		const norm = (response.data as any[]).map(normalizeItem);
		return {
			...response,
			data: norm,
		} as EstablecimientosRaeeResponse;
	}

	return response as EstablecimientosRaeeResponse;
}

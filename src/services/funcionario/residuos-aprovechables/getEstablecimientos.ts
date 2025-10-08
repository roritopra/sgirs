import type { Establecimiento } from '@/components/funcionario/residuos-aprovechables/EstablecimientosTablaCCU';
import rawEstablecimientos from '@/mock/establecimientos.json';
import { get } from '@/utils/shared/apiUtils';

const normalizar = (items: any[]): Establecimiento[] =>
  items.map((e) => {
    const estadoRaw = String(e.estado || '')
      .toLowerCase()
      .trim();
    const estado =
      estadoRaw.includes('con') || estadoRaw === 'con_ccu'
        ? 'con_ccu'
        : 'sin_ccu';

    // Soporta tanto shape de mock (e.nombre) como el del API (e.establecimiento)
    const nombre = e.nombre ?? e.establecimiento ?? '';
    const comunaNum = typeof e.comuna === 'string' ? parseInt(e.comuna, 10) : Number(e.comuna ?? 0);

    return {
      nombre: String(nombre),
      responsable: String(e.responsable ?? ''),
      direccion: String(e.direccion ?? ''),
      telefono: String(e.telefono ?? ''),
      barrio: String(e.barrio ?? ''),
      comuna: Number(isNaN(comunaNum) ? 0 : comunaNum),
      estado,
      sector: e.sector ? String(e.sector) : undefined,
    } satisfies Establecimiento;
  });

const mockEstablecimientos: Establecimiento[] = normalizar(rawEstablecimientos as any[]);

export type EstablecimientosResponse = {
  page: number;
  limit: number;
  total: number;
  data: Establecimiento[];
};

type GestorTipo = 'oro' | 'no_oro';

export async function getEstablecimientosRA(
  params: {
    gestor: GestorTipo; // oro | no_oro
    estado?: 'con_ccu' | 'sin_ccu';
    search?: string;
    page?: number; // >=1
    limit?: number; // default 20
    periodo?: string;
    useMock?: boolean;
  }
): Promise<EstablecimientosResponse> {
  const { gestor, estado, search, page = 1, limit = 20, periodo, useMock = false } = params;

  if (useMock) {
    const filtered = estado
      ? mockEstablecimientos.filter((e) => e.estado === estado)
      : mockEstablecimientos;
    const searched = search
      ? filtered.filter((e) =>
          [e.nombre, e.responsable, e.barrio]
            .some((v) => v.toLowerCase().includes(search.toLowerCase()))
        )
      : filtered;
    const start = (page - 1) * limit;
    const sliced = searched.slice(start, start + limit);
    return { page, limit, total: searched.length, data: sliced };
  }

  const base = gestor === 'oro'
    ? '/api/v1/dashboard/ra/establecimientos-oro'
    : '/api/v1/dashboard/ra/establecimientos-no-oro';

  const qs = new URLSearchParams();
  if (estado) qs.set('estado', estado);
  if (search) qs.set('search', search);
  qs.set('page', String(page));
  qs.set('limit', String(limit));
  if (periodo) qs.set('periodo', periodo);

  const url = `${base}?${qs.toString()}`;
  const res = await get<{ page: number; limit: number; total: number; data: any[] }>(url);
  return {
    page: res.page,
    limit: res.limit,
    total: res.total,
    data: normalizar(res.data ?? []),
  };
}

// Wrapper de compatibilidad (se usaba antes con sólo tipo y mock)
export async function getEstablecimientos(
  tipo: 'con_ccu' | 'sin_ccu' | 'todos',
  useMock = false
): Promise<Establecimiento[]> {
  if (useMock) {
    if (tipo === 'todos') return mockEstablecimientos;
    return mockEstablecimientos.filter((e) => e.estado === tipo);
  }
  const { data } = await getEstablecimientosRA({
    gestor: 'oro',
    estado: tipo === 'todos' ? undefined : tipo,
    page: 1,
    limit: 50,
  });
  return data;
}

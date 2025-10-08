import { get } from '@/utils/shared/apiUtils';

export interface EstablecimientoACU {
  id: string;
  establecimiento: string;
  responsable: string;
  direccion: string;
  telefono: string;
  barrio: string;
  comuna: string;
  estado: 'Tiene gestor' | 'No tiene gestor';
  sector?: string;
}

export interface EstablecimientoACUNormalizado {
  id: string;
  nombre: string;
  responsable: string;
  direccion: string;
  telefono: string;
  barrio: string;
  comuna: number;
  estado: 'tiene_gestor' | 'no_tiene_gestor';
  sector?: string;
}

const normalizar = (items: EstablecimientoACU[]): EstablecimientoACUNormalizado[] =>
  items.map((e) => {
    const comunaNum = typeof e.comuna === 'string' ? parseInt(e.comuna, 10) : Number(e.comuna ?? 0);
    const estadoNormalizado = e.estado === 'Tiene gestor' ? 'tiene_gestor' : 'no_tiene_gestor';
    
    return {
      id: e.id,
      nombre: e.establecimiento,
      responsable: e.responsable,
      direccion: e.direccion,
      telefono: e.telefono,
      barrio: e.barrio,
      comuna: Number(isNaN(comunaNum) ? 0 : comunaNum),
      estado: estadoNormalizado,
      sector: e.sector ? String(e.sector) : undefined,
    };
  });

export type EstablecimientosACUResponse = {
  page: number;
  limit: number;
  total: number;
  data: EstablecimientoACUNormalizado[];
};

// Endpoint: /api/v1/dashboard/acu/establecimientos-con-gestor-autorizado
export async function getEstablecimientosACU(params: {
  search?: string;
  estado?: 'tiene_gestor' | 'no_tiene_gestor';
  page?: number;
  limit?: number; // default 20
  periodo?: string;
}): Promise<EstablecimientosACUResponse> {
  const { search, estado, page = 1, limit = 20, periodo } = params;
  const qs = new URLSearchParams();
  if (search) qs.set('search', search);
  if (estado) qs.set('estado', estado);
  qs.set('page', String(page));
  qs.set('limit', String(limit));
  if (periodo) qs.set('periodo', periodo);

  const url = `/api/v1/dashboard/acu/establecimientos-con-gestor-autorizado?${qs.toString()}`;
  const res = await get<{ page: number; limit: number; total: number; data: EstablecimientoACU[] }>(url);

  return {
    page: res.page,
    limit: res.limit,
    total: res.total,
    data: normalizar(res.data ?? []),
  };
}

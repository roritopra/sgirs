import { Comuna } from '@/components/funcionario/MapTableCard';
import { get } from '@/utils/shared/apiUtils';

// GET /api/v1/dashboard/rso/establecimientos-con-compostaje-porcentaje
// Respuesta esperada: [{ posicion, comuna: string, cantidad, porcentaje }]
export async function getComunasCompostaje(options: { periodo?: string } = {}): Promise<Comuna[]> {
    const { periodo } = options;
    const base = '/api/v1/dashboard/rso/establecimientos-con-compostaje-porcentaje';
    const endpoint = periodo ? `${base}?periodo=${encodeURIComponent(periodo)}` : base;
    const res = await get<any[]>(endpoint);
    const items = Array.isArray(res) ? res : [];
    return items.map((it) => ({
        id: Number(it.posicion ?? 0) || 0,
        comuna: Number(it.comuna ?? 0) || 0,
        cantidad: Number(it.cantidad ?? 0) || 0,
        porcentaje: Number(it.porcentaje ?? 0) || 0,
    }));
}

import mockEstablecimientos from '@/mock/establecimientos.json';
import type { EstablecimientoACUNormalizado } from '@/services/funcionario/aceite-usado/getEstablecimientosACU.service';

function normalizar(items: any[]): EstablecimientoACUNormalizado[] {
  return (items ?? []).map((e: any, idx: number) => {
    const comunaNum = typeof e?.comuna === 'string' ? parseInt(e.comuna, 10) : Number(e?.comuna ?? 0);
    const estadoNormalizado = ((): 'tiene_gestor' | 'no_tiene_gestor' => {
      const estado = String(e?.estado ?? '').toLowerCase();
      const tipo = String(e?.tipo ?? '').toLowerCase();
      if (estado === 'tiene_gestor' || estado === 'con_ccu' || tipo.includes('tiene gestor')) return 'tiene_gestor';
      return 'no_tiene_gestor';
    })();

    return {
      id: String(e?.id ?? idx),
      nombre: e?.nombre ?? e?.establecimiento ?? '',
      responsable: e?.responsable ?? '',
      direccion: e?.direccion ?? '',
      telefono: e?.telefono ?? '',
      barrio: e?.barrio ?? '',
      comuna: Number(isNaN(comunaNum) ? 0 : comunaNum),
      estado: estadoNormalizado,
    };
  });
}

export async function getEstablecimientosACU(useMock = true): Promise<EstablecimientoACUNormalizado[]> {
  if (useMock) {
    return normalizar(mockEstablecimientos as any[]);
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/establecimientos-acu`);
  if (!res.ok) throw new Error('Error al cargar establecimientos ACU');
  const data = await res.json();
  return normalizar(Array.isArray(data) ? data : data?.data ?? []);
}

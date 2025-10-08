import { get, patch } from "@/utils/shared/apiUtils";

// Tipos mínimos para esta pantalla
export interface UsuarioBasico {
  id: string;
  id_rol: string;
  nombre: string;
  email: string;
  status: boolean;
  created_date: string;
  modified_date: string;
  deleted_at: string | null;
}

export interface RegistroUsuarioDetalle {
  nit: string;
  nombre_establecimiento: string;
  direccion: string;
  primer_nombre: string | null;
  segundo_nombre: string | null;
  primer_apellido: string | null;
  segundo_apellido: string | null;
  num_telefono: string;
  nombre_barrio: string;
  nombre_sector: string;
}

export interface UpdateRegistroAdminPayload {
  nit: string;
  nombre_establecimiento: string;
  sector: string;
  direccion: string;
  barrio: string;
  primer_nombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  num_telefono: string;
}

// GET: /api/v1/registro/admin/{user_id}
export async function getRegistroDetalle(userId: string): Promise<RegistroUsuarioDetalle> {
  return get<RegistroUsuarioDetalle>(`/api/v1/registro/admin/${userId}`);
}

// PUT: /api/v1/registro/admin/{user_id}
export async function putRegistroUsuario(
  userId: string,
  payload: UpdateRegistroAdminPayload
) {
  return patch(`/api/v1/registro/admin/${userId}`, payload);
}

import { get, put } from "@/utils/shared/apiUtils";
import type { RegistroUsuario, UpdateRegistroPayload } from "@/types/registro";

const BASE = "/api/v1/registro";

export async function getRegistroActual(): Promise<RegistroUsuario> {
  return get<RegistroUsuario>(`${BASE}`);
}

export async function updateRegistroUsuario(
  usuarioId: string,
  payload: UpdateRegistroPayload
): Promise<RegistroUsuario> {
  return put<RegistroUsuario>(`${BASE}/usuario/${usuarioId}`, payload);
}

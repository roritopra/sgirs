import { post } from "@/utils/shared/apiUtils";

export interface RegistroSectorPayload {
  nit: string;
  nombre_establecimiento: string;
  sector: string;
  direccion: string;
  barrio: string;
  email: string;
  contraseña: string;
  primer_nombre: string;
  primer_apellido: string;
  num_telefono: string;
}

export interface RegistroSectorResponse {
  // Ajusta según respuesta real del backend si es necesario
  message?: string;
  data?: any;
}

export async function registroSectorEstrategico(data: RegistroSectorPayload) {
  // FastAPI espera el campo 'data' en el body; por compatibilidad lo enviamos como multipart/form-data
  const fd = new FormData();
  fd.append("data", JSON.stringify(data));
  return post<RegistroSectorResponse>(
    "/api/v1/auth/registro-sector-estrategico",
    fd,
    {
      headers: {
        // Dejar que el navegador defina el boundary; Axios ajusta correctamente este header
        "Content-Type": "multipart/form-data",
      },
    }
  );
}

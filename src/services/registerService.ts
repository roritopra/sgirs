import { post } from "@/utils/shared/apiUtils";

export interface RegisterRequest {
  nit: string;
  dv: number;
  nombre_establecimiento: string;
  sector: string;
  direccion: string;
  barrio: string;
  email: string;
  contraseña: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  num_telefono?: string;
}

export interface RegisterResponse {
  message: string;
  user_id?: string;
}

export class RegisterService {
  private static readonly REGISTER_ENDPOINT = "/api/v1/auth/registro-sector-estrategico";

  static async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      console.log("RegisterService.register - userData:", userData);
      
      const formData = new FormData();
      const dataString = JSON.stringify(userData);
      formData.append('data', dataString);
      
      console.log("RegisterService.register - FormData data key:", dataString);
      console.log("RegisterService.register - Enviando a endpoint:", this.REGISTER_ENDPOINT);
      
      const response = await post<RegisterResponse>(
        this.REGISTER_ENDPOINT,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      console.log("RegisterService.register - response:", response);
      
      return response;
    } catch (error) {
      console.error("RegisterService.register - error:", error);
      throw error;
    }
  }
}

import { get } from "@/utils/shared/apiUtils";

export interface Barrio {
  id: string;
  codigo_barrio: string;
  nombre_barrio: string;
  created_date: string;
  modified_date: string;
  deleted_at: string | null;
  status: boolean;
}

export interface BarriosResponse {
  data: Barrio[];
}

export interface BarriosParams {
  page?: number;
  per_page?: number;
  search?: string;
}

export class BarriosService {
  private static readonly BARRIOS_ENDPOINT = "/api/v1/barrios";

  static async getAllBarrios(): Promise<BarriosResponse> {
    try {
      const url = `${this.BARRIOS_ENDPOINT}?page=1&per_page=400`;

      console.log("BarriosService.getAllBarrios - URL:", url);
      
      const response = await get<BarriosResponse>(url);
      
      console.log("BarriosService.getAllBarrios - response:", response);
      
      return response;
    } catch (error) {
      console.error("BarriosService.getAllBarrios - error:", error);
      throw error;
    }
  }
}

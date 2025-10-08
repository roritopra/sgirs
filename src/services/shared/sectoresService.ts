import { get } from "@/utils/shared/apiUtils";

export interface Sector {
  id: string;
  nombre_sector: string;
}

export type SectoresResponse = Sector[];

export class SectoresService {
  private static readonly SECTORES_ENDPOINT = "/api/v1/sectores/all";

  static async getAllSectores(): Promise<SectoresResponse> {
    try {
      console.log("SectoresService.getAllSectores - URL:", this.SECTORES_ENDPOINT);
      
      const response = await get<SectoresResponse>(this.SECTORES_ENDPOINT);
      
      console.log("SectoresService.getAllSectores - response:", response);
      
      return response;
    } catch (error) {
      console.error("SectoresService.getAllSectores - error:", error);
      throw error;
    }
  }
}

import { useState, useEffect } from "react";
import { SectoresService, type Sector } from "@/services/shared/sectoresService";

export function useSectores() {
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSectores = async () => {
      try {
        const response = await SectoresService.getAllSectores();
        setSectores(response);
      } catch (err: any) {
        console.error("Error loading sectores:", err);
        setError(err.message || "Error al cargar sectores");
        setSectores([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSectores();
  }, []);

  return {
    sectores,
    isLoading,
    error,
  };
}

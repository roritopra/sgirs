import { useState, useEffect } from "react";
import { BarriosService, type Barrio } from "@/services/shared/barriosService";

export function useBarrios() {
  const [barrios, setBarrios] = useState<Barrio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBarrios = async () => {
      try {
        const response = await BarriosService.getAllBarrios();
        setBarrios(response.data);
      } catch (err: any) {
        console.error("Error loading barrios:", err);
        setError(err.message || "Error al cargar barrios");
        setBarrios([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBarrios();
  }, []);

  return {
    barrios,
    isLoading,
    error,
  };
}

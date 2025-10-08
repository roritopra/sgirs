import { AuthService } from "@/services/authService";

// Configurar interceptor para agregar token automáticamente
export function setupAxiosInterceptors(axiosInstance: any) {
  // Request interceptor - agregar token a todas las requests
  axiosInstance.interceptors.request.use(
    (config: any) => {
      const token = AuthService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - manejar errores de autenticación
  axiosInstance.interceptors.response.use(
    (response: any) => {
      return response;
    },
    (error: any) => {
      if (error.response?.status === 401) {
        // Token expirado o inválido
        AuthService.logout();
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      }
      return Promise.reject(error);
    }
  );
}

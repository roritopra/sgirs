import { post } from "@/utils/shared/apiUtils";
import { LoginRequest, LoginResponse, User } from "@/types/auth";

export class AuthService {
  private static readonly LOGIN_ENDPOINT = "/api/v1/auth/login";
  private static readonly FORGOT_PASSWORD_ENDPOINT = "/api/v1/auth/forgot-password";
  private static readonly RESET_PASSWORD_ENDPOINT = "/api/v1/auth/reset-password";
  private static readonly TOKEN_KEY = "auth_token";
  private static readonly USER_KEY = "auth_user";

  // Decodifica un JWT y retorna el payload (o null si falla)
  private static decodeJwt(token: string): any | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  static async forgotPassword(request: { email: string }): Promise<{ msg: string }> {
    try {
      return await post<{ msg: string }>(this.FORGOT_PASSWORD_ENDPOINT, request);
    } catch (error) {
      throw error;
    }
  }

  static async resetPassword(request: { token: string; user_id: string; new_password: string }): Promise<{ msg?: string }> {
    try {
      return await post<{ msg?: string }>(this.RESET_PASSWORD_ENDPOINT, request);
    } catch (error) {
      throw error;
    }
  }

  // Obtiene el `sub` del token o null
  static getUserIdFromToken(token: string): string | null {
    const payload = this.decodeJwt(token);
    if (!payload || typeof payload.sub === "undefined" || payload.sub === null) return null;
    return String(payload.sub);
  }

  // Obtiene el `role` del token o null
  static getRoleFromToken(token: string): string | null {
    const payload = this.decodeJwt(token);
    if (!payload || typeof payload.role === "undefined" || payload.role === null) return null;
    return String(payload.role);
  }

  // Obtiene el nombre del token o null (acepta nombre, name o 'nombre:')
  static getNameFromToken(token: string): string | null {
    const payload = this.decodeJwt(token);
    if (!payload) return null;
    const candidate = payload.nombre ?? payload.name ?? payload["nombre:"];
    if (typeof candidate === "undefined" || candidate === null) return null;
    return String(candidate);
  }

  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log("AuthService.login - credentials:", credentials);
      console.log("AuthService.login - formData creado");
      
      const formData = new FormData();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);
      
      const response = await post<LoginResponse>(
        this.LOGIN_ENDPOINT,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      console.log("AuthService.login - response:", response);
      
      if (response.access_token) {
        console.log("AuthService.login - guardando token:", response.access_token);
        this.setToken(response.access_token);
        const payload = this.decodeJwt(response.access_token);
        const userId = payload?.sub ? String(payload.sub) : "user";
        const roleFromToken = payload?.role ? String(payload.role) : undefined;
        const name = (payload?.nombre ?? payload?.name ?? payload?.["nombre:"]) ? String(payload?.nombre ?? payload?.name ?? payload?.["nombre:"]) : undefined;
        // Rol efectivo: si no viene en el token, por defecto tratamos como "Sector estratégico"
        const effectiveRole = roleFromToken ?? "Sector estratégico";
        const basicUser: User = {
          id: userId,
          username: credentials.username,
          email: credentials.username,
          role: effectiveRole,
          name,
        };
        this.setUser(basicUser);
        // Resetear y persistir siempre el rol en cookie para que el middleware lo lea de forma confiable
        document.cookie = `auth_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `auth_role=${encodeURIComponent(effectiveRole)}; path=/; max-age=86400; SameSite=Strict`;
        console.log("AuthService.login - usuario guardado:", basicUser);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  static logout(): void {
    this.removeToken();
    this.removeUser();
  }

  static getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.TOKEN_KEY, token);
    // También guardar en cookies para el middleware
    document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Strict`;
  }

  static removeToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.TOKEN_KEY);
    // También eliminar la cookie
    document.cookie = `auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `auth_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }

  static getUser(): User | null {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  static setUser(user: User): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static removeUser(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.USER_KEY);
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

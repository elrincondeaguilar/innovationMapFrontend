import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  MinimalUser,
  User,
} from "../types/api";
import { backendService } from "./backendService";

/**
 * Servicio de autenticación que se conecta con el backend .NET
 */
export class AuthService {
  private static readonly TOKEN_KEY = "auth_token";
  private static readonly REFRESH_TOKEN_KEY = "auth_refresh_token";
  private static readonly USER_KEY = "auth_user";

  /**
   * Realizar login
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Mapear los campos al formato esperado por el backend
      const backendData = {
        Email: credentials.email,
        Password: credentials.password,
      };

      const response = await backendService.post<AuthResponse>(
        "auth/login",
        backendData
      );

      if (response.success && response.data) {
        // Check if response.data is the AuthResponse directly or wrapped
        let authData: AuthResponse;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const responseData: any = response.data;

        // If response.data has token directly, use it
        if ("token" in responseData) {
          authData = responseData as AuthResponse;
        }
        // If response.data is wrapped (e.g., { data: { token, user, ... } })
        else if (
          "data" in responseData &&
          typeof responseData.data === "object"
        ) {
          authData = responseData.data as AuthResponse;
        }
        // If response.data has other structure, try to extract
        else {
          authData = responseData as AuthResponse;
        }

        // Si no hay usuario en la respuesta, intentar obtenerlo
        if (authData.token && !authData.user) {
          // Guardar el token primero para que getCurrentUser() pueda usarlo
          localStorage.setItem(this.TOKEN_KEY, authData.token);

          try {
            // Intentar obtener usuario desde el endpoint
            const currentUser = await this.getCurrentUser();
            if (currentUser) {
              authData.user = currentUser;
            } else {
              // Si el endpoint no funciona, intentar extraer del token JWT
              const userFromToken = this.extractUserFromToken(authData.token);
              if (userFromToken) {
                authData.user = userFromToken;
              }
            }
          } catch {
            // Si falla el endpoint, intentar extraer del token JWT
            const userFromToken = this.extractUserFromToken(authData.token);
            if (userFromToken) {
              authData.user = userFromToken;
            }
          }
        }

        // Guardar tokens y usuario en localStorage
        this.saveAuthData(authData);

        return authData;
      } else {
        throw new Error(response.message || "Error en el login");
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Realizar registro
   */
  static async register(
    credentials: RegisterCredentials
  ): Promise<AuthResponse> {
    try {
      // Validar que las contraseñas coincidan
      if (credentials.password !== credentials.confirmPassword) {
        throw new Error("Las contraseñas no coinciden");
      }

      // Mapear los campos al formato esperado por el backend
      const backendData = {
        Nombre: credentials.nombre.trim(),
        Apellido: credentials.apellido.trim(),
        Email: credentials.email.trim(),
        Password: credentials.password,
        ConfirmPassword: credentials.confirmPassword,
      };

      const response = await backendService.post<AuthResponse>(
        "auth/register",
        backendData
      );

      if (response.success && response.data) {
        // Analizar la estructura de respuesta similar al login
        console.log("📊 Register response.data:", response.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const responseData: any = response.data;
        let authData: AuthResponse;

        if ("token" in responseData) {
          authData = responseData as AuthResponse;
        } else if (
          "data" in responseData &&
          typeof responseData.data === "object"
        ) {
          authData = responseData.data as AuthResponse;
        } else {
          authData = responseData as AuthResponse;
        }

        // Guardar tokens y usuario en localStorage
        this.saveAuthData(authData);
        return authData;
      } else {
        throw new Error(response.message || "Error en el registro");
      }
    } catch (error) {
      console.error("Error en registro:", error);
      throw error;
    }
  }

  /**
   * Cerrar sesión
   */
  static async logout(): Promise<void> {
    try {
      console.log("🔓 Logging out user...");

      // Solo realizar logout local ya que el backend no tiene endpoint de logout
      // Los tokens JWT son stateless y se invalidan automáticamente al expirar
      this.clearAuthData();

      console.log("✅ User logged out successfully");
    } catch (error) {
      console.error("💥 Error during logout:", error);
      // Asegurar que los datos se limpien incluso si hay error
      this.clearAuthData();
    }
  }

  /**
   * Renovar token
   */
  static async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error("No hay refresh token");
      }

      const response = await backendService.post<AuthResponse>("auth/refresh", {
        refreshToken,
      });

      if (response.success && response.data) {
        this.saveAuthData(response.data);
        return response.data.token;
      } else {
        throw new Error("Error al renovar token");
      }
    } catch (error) {
      console.error("Error al renovar token:", error);

      // Solo limpiar datos si el error no es por falta de refresh token
      if (error instanceof Error && error.message !== "No hay refresh token") {
        this.clearAuthData();
      }

      return null;
    }
  }

  /**
   * Obtener el usuario actual
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getToken();
      if (!token) {
        return null;
      }

      const response = await backendService.get<User>("auth/me");

      if (response.success && response.data) {
        console.log("🔍 getCurrentUser - Raw response.data:", response.data);

        // Check if response.data is wrapped in another structure
        let userData = response.data;

        // If response.data has a 'data' property, use that instead
        if (typeof userData === "object" && "data" in userData) {
          console.log("🔍 getCurrentUser - Using nested data structure");
          userData = (userData as Record<string, unknown>).data as User;
        }

        console.log("🔍 getCurrentUser - Final userData:", userData);

        // Map backend fields to our User type
        const user: User = {
          id: userData.id || 0,
          nombre: userData.nombre || "",
          apellido: userData.apellido || "",
          email: userData.email || "",
          rol: userData.rol === "admin" ? "admin" : "usuario",
          createdAt: userData.createdAt,
          updatedAt:
            userData.updatedAt ||
            ((userData as unknown as Record<string, unknown>)
              .lastLoginAt as string),
        };

        console.log("🔍 getCurrentUser - Mapped user:", user);

        // Actualizar usuario en localStorage con versión minimalista
        const minimalUser: MinimalUser = {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
        };

        localStorage.setItem(this.USER_KEY, JSON.stringify(minimalUser));
        console.log("🔐 Minimal user saved to localStorage:", minimalUser);

        return user;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error al obtener usuario actual:", error);
      return null;
    }
  }

  /**
   * Verificar si el token es válido usando el refresh token endpoint
   */
  static async validateToken(): Promise<boolean> {
    try {
      const token = this.getToken();
      const refreshToken = this.getRefreshToken();

      if (!token) {
        console.log("🔍 validateToken: No token found");
        return false;
      }

      if (!refreshToken) {
        console.log(
          "🔍 validateToken: No refresh token found, assuming current token is valid"
        );
        return true;
      }

      console.log(
        "🔍 validateToken: Validating token by attempting refresh..."
      );

      // Intentar hacer refresh del token para validar si está vigente
      try {
        const newToken = await this.refreshToken();
        console.log(
          "🔍 validateToken: Token refresh successful, token is valid"
        );
        return !!newToken;
      } catch (refreshError: unknown) {
        const errorMessage =
          refreshError instanceof Error
            ? refreshError.message
            : "Unknown error";
        console.log(
          "🔍 validateToken: Token refresh failed, token is invalid",
          errorMessage
        );
        return false;
      }
    } catch (error) {
      console.error("💥 Error al validar token:", error);
      // En caso de error (ej. backend no disponible), asumimos que el token es válido
      // para evitar logout forzado cuando el backend no está disponible
      console.log(
        "⚠️ validateToken: Assuming token is valid due to network error"
      );
      return true;
    }
  }

  /**
   * Guardar datos de autenticación en localStorage
   */
  private static saveAuthData(authData: AuthResponse): void {
    console.log("💾 saveAuthData called with:", {
      hasToken: !!authData.token,
      hasUser: !!authData.user,
      hasRefreshToken: !!authData.refreshToken,
      tokenType: typeof authData.token,
      tokenLength: authData.token?.length,
      authDataStructure: Object.keys(authData),
    });

    try {
      // Check localStorage availability
      if (
        typeof window === "undefined" ||
        typeof localStorage === "undefined"
      ) {
        console.error("💥 localStorage not available (SSR or not supported)");
        return;
      }

      if (authData.token) {
        console.log("🔑 Saving token to localStorage...");
        localStorage.setItem(this.TOKEN_KEY, authData.token);
        console.log("✅ Token saved to localStorage");

        // Immediate verification
        const savedToken = localStorage.getItem(this.TOKEN_KEY);
        if (savedToken === authData.token) {
          console.log("✅ Token verification successful");
        } else {
          console.error("❌ Token verification failed!", {
            expected: authData.token.substring(0, 20) + "...",
            found: savedToken?.substring(0, 20) + "...",
          });
        }
      } else {
        console.warn("⚠️ No token provided to save");
      }

      if (authData.user) {
        console.log("👤 Saving user to localStorage...");

        // Crear versión minimalista para localStorage (más seguro)
        const minimalUser: MinimalUser = {
          id: authData.user.id,
          nombre: authData.user.nombre,
          email: authData.user.email,
          rol: authData.user.rol,
        };

        localStorage.setItem(this.USER_KEY, JSON.stringify(minimalUser));
        console.log("✅ Minimal user saved to localStorage");
        console.log("🔐 Saved minimal user data:", minimalUser);

        // Immediate verification
        const savedUser = localStorage.getItem(this.USER_KEY);
        if (savedUser) {
          console.log("✅ User verification successful");
        } else {
          console.error("❌ User verification failed!");
        }
      } else {
        console.warn("⚠️ No user provided to save");
      }

      if (authData.refreshToken) {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, authData.refreshToken);
        console.log("✅ Refresh token saved to localStorage");
      } else {
        console.log("ℹ️ No refresh token provided");
      }

      // Final verification of all data
      console.log("🔍 Final verification:");
      console.log(
        "- Token in localStorage:",
        this.getToken() ? "EXISTS" : "MISSING"
      );
      console.log(
        "- User in localStorage:",
        this.getStoredUser() ? "EXISTS" : "MISSING"
      );
      console.log(
        "- RefreshToken in localStorage:",
        this.getRefreshToken() ? "EXISTS" : "MISSING"
      );
    } catch (error) {
      console.error("💥 Error saving to localStorage:", error);
    }
  }

  /**
   * Limpiar datos de autenticación
   */
  static clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Obtener token del localStorage
   */
  static getToken(): string | null {
    if (typeof window === "undefined") {
      console.log("🔍 getToken: window undefined (SSR)");
      return null;
    }

    if (typeof localStorage === "undefined") {
      console.log("🔍 getToken: localStorage undefined");
      return null;
    }

    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      console.log("🔍 getToken:", token ? "Token found" : "No token");
      return token;
    } catch (error) {
      console.error("💥 Error accessing localStorage for token:", error);
      return null;
    }
  }

  /**
   * Obtener refresh token del localStorage
   */
  static getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Obtener usuario del localStorage
   */
  static getStoredUser(): User | null {
    if (typeof window === "undefined") {
      console.log("🔍 getStoredUser: window undefined (SSR)");
      return null;
    }

    if (typeof localStorage === "undefined") {
      console.log("🔍 getStoredUser: localStorage undefined");
      return null;
    }

    try {
      const userJson = localStorage.getItem(this.USER_KEY);
      console.log("🔍 getStoredUser - Raw userJson:", userJson);
      console.log("🔍 getStoredUser - userJson type:", typeof userJson);
      console.log("🔍 getStoredUser - userJson length:", userJson?.length);

      if (!userJson) {
        console.log("🔍 getStoredUser: No user data in localStorage");
        return null;
      }

      const user = JSON.parse(userJson);
      console.log("🔍 getStoredUser - Parsed user:", user);
      console.log("🔍 getStoredUser - User type:", typeof user);
      console.log(
        "🔍 getStoredUser - User keys:",
        user ? Object.keys(user) : []
      );

      return user;
    } catch (error) {
      console.error("💥 Error al parsear usuario del localStorage:", error);
      console.error(
        "💥 Raw userJson that failed:",
        localStorage.getItem(this.USER_KEY)
      );
      return null;
    }
  }

  /**
   * Verificar si el usuario está autenticado (tiene token)
   */
  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Obtener headers de autorización para las requests
   */
  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Decodificar JWT para extraer información del usuario
   */
  private static decodeJWT(token: string): Record<string, unknown> | null {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("💥 Error decoding JWT:", error);
      return null;
    }
  }

  /**
   * Extraer información del usuario desde el token JWT
   */
  private static extractUserFromToken(token: string): User | null {
    try {
      const decoded = this.decodeJWT(token);
      if (!decoded) {
        return null;
      }

      console.log("🔍 JWT payload:", decoded);

      // Helper function to safely extract string values
      const getString = (key: string): string => {
        const value = decoded[key];
        return typeof value === "string" ? value : "";
      };

      // Helper function to safely extract number values
      const getNumber = (key: string): number => {
        const value = decoded[key];
        if (typeof value === "number") return value;
        if (typeof value === "string") {
          const parsed = parseInt(value, 10);
          return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
      };

      // Helper function to safely extract role
      const getRole = (key: string): "admin" | "usuario" => {
        const value = decoded[key];
        return value === "admin" || value === "usuario" ? value : "usuario";
      };

      // Mapear campos comunes del JWT a nuestro modelo de usuario
      const user: User = {
        id:
          getNumber("sub") ||
          getNumber("id") ||
          getNumber("userId") ||
          getNumber("nameid") ||
          0,
        nombre:
          getString("name") ||
          getString("given_name") ||
          getString("nombre") ||
          "",
        email: getString("email") || getString("email_address") || "",
        rol: getRole("role") || getRole("rol") || "usuario",
        createdAt:
          decoded.iat && typeof decoded.iat === "number"
            ? new Date(decoded.iat * 1000).toISOString()
            : undefined,
        updatedAt:
          decoded.iat && typeof decoded.iat === "number"
            ? new Date(decoded.iat * 1000).toISOString()
            : undefined,
      };

      // Verificar que tenemos información mínima
      if (!user.email && !user.nombre) {
        console.warn("⚠️ JWT doesn't contain sufficient user information");
        return null;
      }

      console.log("✅ User extracted from JWT:", user);
      return user;
    } catch (error) {
      console.error("💥 Error extracting user from token:", error);
      return null;
    }
  }
}

export default AuthService;

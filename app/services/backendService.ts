import {
  Convocatoria,
  CreateConvocatoriaRequest,
  UpdateConvocatoriaRequest,
  AnalisisConvocatoria,
  Empresa,
  CreateEmpresaRequest,
} from "../types/api";
import AuthService from "./authService";

// Configuración base para el backend
const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5297";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

class BackendService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = BACKEND_BASE_URL;
    
    // Solo en desarrollo, mostrar la configuración del backend
    if (process.env.NODE_ENV === "development") {
      console.log("🌐 Backend Service initialized");
      console.log(`📍 Backend URL: ${this.baseUrl}`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}/api/${endpoint}`;

      const defaultHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...AuthService.getAuthHeaders(), // Incluir headers de autorización
      };

      const config: RequestInit = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      };

      const response = await fetch(url, config);

      // Si es un error 401 (No autorizado), intentar renovar el token
      if (response.status === 401) {
        const newToken = await AuthService.refreshToken();

        if (newToken) {
          // Reintentar la request con el nuevo token
          const newConfig: RequestInit = {
            ...config,
            headers: {
              ...config.headers,
              ...AuthService.getAuthHeaders(),
            },
          };

          const retryResponse = await fetch(url, newConfig);

          if (retryResponse.ok) {
            const contentType = retryResponse.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const data = await retryResponse.json();
              return {
                success: true,
                data: data,
              };
            } else {
              const text = await retryResponse.text();
              return {
                success: true,
                data: (text || undefined) as T,
              };
            }
          }
        }

        // Si no se pudo renovar el token, limpiar datos y devolver error
        AuthService.clearAuthData();
        throw new Error(
          "Sesión expirada. Por favor, inicia sesión nuevamente."
        );
      }

      if (!response.ok) {
        let errorDetails = "";
        try {
          const errorText = await response.text();
          console.error("❌ Error response body:", errorText);

          // Try to parse as JSON for more detailed error info
          try {
            const errorData = JSON.parse(errorText);
            errorDetails = errorData.message || errorData.error || errorText;
            console.error("❌ Parsed error data:", errorData);
          } catch {
            errorDetails = errorText;
          }
        } catch {
          errorDetails = `HTTP ${response.status} - ${response.statusText}`;
        }

        throw new Error(
          `HTTP error! status: ${response.status} - ${errorDetails}`
        );
      }

      // Manejar respuestas vacías (204 No Content y otros casos)
      if (
        response.status === 204 ||
        response.headers.get("content-length") === "0"
      ) {
        return {
          success: true,
          data: undefined as T,
        };
      }

      // Verificar si hay contenido para parsear
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();

        // Special logging for auth endpoints
        if (
          endpoint.includes("auth/login") ||
          endpoint.includes("auth/register")
        ) {
          // Auth response handling
        }

        return {
          success: true,
          data: data,
        };
      } else {
        // Si no es JSON, devolver el texto o undefined
        const text = await response.text();
        return {
          success: true,
          data: (text || undefined) as T,
        };
      }
    } catch (error) {
      // Mejorar información sobre errores de conexión
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("ERR_CONNECTION_REFUSED")) {
        console.error(`💥 Backend connection error: Cannot connect to ${this.baseUrl}`);
        console.error("🔧 Possible solutions:");
        console.error("  1. Check if backend is running");
        console.error("  2. Verify the URL in .env.local");
        console.error("  3. Check for CORS configuration");
        console.error(`  4. Current backend URL: ${this.baseUrl}`);
      } else {
        console.error("💥 Backend request error:", error);
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  // Métodos GET
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: "GET",
    });
  }

  // Métodos POST
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Métodos PUT
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Métodos DELETE
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: "DELETE",
    });
  }

  // Método para subir archivos
  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string | number>
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      if (additionalData) {
        Object.keys(additionalData).forEach((key) => {
          formData.append(key, String(additionalData[key]));
        });
      }

      const url = `${this.baseUrl}/api/${endpoint}`;
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error("File upload error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "File upload failed",
      };
    }
  }

  /**
   * Test backend connectivity
   */
  async healthCheck(): Promise<{ isOnline: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        return { isOnline: true, message: "Backend is online" };
      } else {
        return {
          isOnline: false,
          message: `Backend returned ${response.status}`,
        };
      }
    } catch (error) {
      console.error("Backend health check failed:", error);
      return {
        isOnline: false,
        message: `Cannot reach backend at ${this.baseUrl}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Alternative health check for common endpoints
   */
  async testConnection(): Promise<{
    isOnline: boolean;
    message: string;
    suggestedPorts: number[];
  }> {
    const commonPorts = [5297, 5000, 5001, 7000, 7001, 7244];
    const baseHost = "http://localhost";

    for (const port of commonPorts) {
      try {
        const testUrl = `${baseHost}:${port}`;
        const response = await fetch(`${testUrl}/health`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(2000), // 2 second timeout
        });

        if (response.ok || response.status < 500) {
          return {
            isOnline: true,
            message: `Found backend at ${testUrl}`,
            suggestedPorts: [port],
          };
        }
      } catch {
        // Continue to next port
      }
    }

    return {
      isOnline: false,
      message: "No backend found on common ports",
      suggestedPorts: commonPorts,
    };
  }
}

// Instancia singleton del servicio
export const backendService = new BackendService();

// Funciones de conveniencia para tipos específicos
export class ConvocatoriaService {
  static async obtenerConvocatorias() {
    return backendService.get<Convocatoria[]>("convocatorias");
  }

  static async obtenerConvocatoria(id: number) {
    return backendService.get<Convocatoria>(`convocatorias/${id}`);
  }

  static async crearConvocatoria(convocatoria: CreateConvocatoriaRequest) {
    return backendService.post<Convocatoria>("convocatorias", convocatoria);
  }

  static async actualizarConvocatoria(
    id: number,
    convocatoria: UpdateConvocatoriaRequest
  ) {
    return backendService.put<Convocatoria>(
      `convocatorias/${id}`,
      convocatoria
    );
  }

  static async eliminarConvocatoria(id: number) {
    return backendService.delete<void>(`convocatorias/${id}`);
  }

  static async analizarConvocatoria(texto: string) {
    return backendService.post<AnalisisConvocatoria>("convocatorias/analizar", {
      texto,
    });
  }
}

export class EmpresaService {
  static async obtenerEmpresas() {
    return backendService.get<Empresa[]>("companies");
  }

  static async obtenerEmpresa(id: number) {
    return backendService.get<Empresa>(`companies/${id}`);
  }

  static async crearEmpresa(empresa: CreateEmpresaRequest) {
    return backendService.post<Empresa>("companies", empresa);
  }

  static async actualizarEmpresa(
    id: number,
    empresa: Partial<CreateEmpresaRequest>
  ) {
    return backendService.put<Empresa>(`companies/${id}`, empresa);
  }

  static async eliminarEmpresa(id: number) {
    return backendService.delete<void>(`companies/${id}`);
  }
}

export default backendService;

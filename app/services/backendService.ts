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
const BACKEND_BASE_URL = "/api/backend"; // Usar proxy interno en lugar de URL externa

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
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}/${endpoint}`;

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
          "Usuario y/o Contraseña incorrectos. Por favor, intente nuevamente."
        );
      }

      if (!response.ok) {
        let userFriendlyMessage = "";
        try {
          const errorText = await response.text();

          // Try to parse as JSON for more detailed error info
          try {
            const errorData = JSON.parse(errorText);
            const serverMessage =
              errorData.message || errorData.error || errorText;

            // Map common server errors to user-friendly messages
            if (
              serverMessage.toLowerCase().includes("usuario") ||
              serverMessage.toLowerCase().includes("contraseña") ||
              serverMessage.toLowerCase().includes("credenciales")
            ) {
              userFriendlyMessage = "Usuario y/o contraseña incorrectos";
            } else if (
              serverMessage.toLowerCase().includes("email") ||
              serverMessage.toLowerCase().includes("correo")
            ) {
              userFriendlyMessage = "El formato del email no es válido";
            } else if (
              serverMessage.toLowerCase().includes("token") ||
              serverMessage.toLowerCase().includes("sesión")
            ) {
              userFriendlyMessage =
                "Su sesión ha expirado. Por favor, inicie sesión nuevamente";
            } else if (response.status >= 500) {
              userFriendlyMessage =
                "Error interno del servidor. Por favor, intente más tarde";
            } else if (response.status === 404) {
              userFriendlyMessage = "Recurso no encontrado";
            } else {
              userFriendlyMessage = serverMessage || "Error en el servidor";
            }
          } catch {
            // If can't parse JSON, provide generic message based on status
            if (response.status === 400) {
              userFriendlyMessage = "Los datos enviados no son válidos";
            } else if (response.status === 401) {
              userFriendlyMessage = "Usuario y/o contraseña incorrectos";
            } else if (response.status === 403) {
              userFriendlyMessage =
                "No tiene permisos para realizar esta acción";
            } else if (response.status === 404) {
              userFriendlyMessage = "Recurso no encontrado";
            } else if (response.status >= 500) {
              userFriendlyMessage =
                "Error interno del servidor. Por favor, intente más tarde";
            } else {
              userFriendlyMessage = "Error en la conexión con el servidor";
            }
          }
        } catch {
          userFriendlyMessage = "Error en la conexión con el servidor";
        }

        throw new Error(userFriendlyMessage);
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
      // Generar mensajes amigables para el usuario
      const errorMessage =
        error instanceof Error ? error.message : "Ocurrió un error inesperado";

      let userFriendlyMessage = errorMessage;

      if (
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("ERR_CONNECTION_REFUSED") ||
        errorMessage.includes("NetworkError")
      ) {
        userFriendlyMessage =
          "No se puede conectar con el servidor. Por favor, verifique su conexión a internet e intente nuevamente";
      } else if (errorMessage.includes("timeout")) {
        userFriendlyMessage =
          "La conexión tardó demasiado. Por favor, intente nuevamente";
      } else if (errorMessage.includes("CORS")) {
        userFriendlyMessage =
          "Error de configuración del servidor. Contacte al administrador";
      }

      return {
        success: false,
        message: userFriendlyMessage,
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
        throw new Error(
          "Error al subir el archivo. Por favor, verifique el formato y tamaño del archivo"
        );
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Error al subir el archivo",
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
          message: `El servidor no está disponible (código: ${response.status})`,
        };
      }
    } catch (error) {
      return {
        isOnline: false,
        message: `No se puede conectar con el servidor: ${
          error instanceof Error ? error.message : "Error de conexión"
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
            message: `Servidor encontrado en ${testUrl}`,
            suggestedPorts: [port],
          };
        }
      } catch {
        // Continue to next port
      }
    }

    return {
      isOnline: false,
      message: "No se encontró el servidor en los puertos comunes",
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
    // Usa directamente los strings de fecha que llegan del frontend
    const backendData = {
      Titulo: convocatoria.titulo?.trim(),
      Descripcion: convocatoria.descripcion?.trim(),
      FechaInicio: convocatoria.fechaInicio,
      FechaFin: convocatoria.fechaFin,
      Categoria: convocatoria.categoria?.trim(),
      Entidad: convocatoria.entidad?.trim(),
      Enlace: convocatoria.enlace?.trim(),
      // Only include optional fields if they have valid values
      ...(convocatoria.requisitos &&
        convocatoria.requisitos.length > 0 && {
          Requisitos: convocatoria.requisitos,
        }),
      ...(convocatoria.presupuesto !== undefined &&
        convocatoria.presupuesto !== null &&
        convocatoria.presupuesto > 0 &&
        convocatoria.presupuesto <= 2147483647 && {
          Presupuesto: convocatoria.presupuesto,
        }),
      ...(convocatoria.companyId !== undefined &&
        convocatoria.companyId !== null &&
        convocatoria.companyId > 0 && { CompanyId: convocatoria.companyId }),
      ...(convocatoria.estado &&
        convocatoria.estado.trim() !== "" && {
          Estado: convocatoria.estado,
        }),
      ...(convocatoria.estadoManual !== undefined && {
        EstadoManual: convocatoria.estadoManual,
      }),
      ...(convocatoria.enlace && { Enlace: convocatoria.enlace }),
    };

    return backendService.post<Convocatoria>("convocatorias", backendData);
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

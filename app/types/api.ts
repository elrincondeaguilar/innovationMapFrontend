// Tipos para la API del backend
export interface Convocatoria {
  id?: number; // Corresponde a Id en el backend
  titulo: string; // Corresponde a Titulo (StringLength(200))
  descripcion: string; // Corresponde a Descripcion
  fechaInicio: string; // DateTime del backend convertido a string ISO
  fechaFin: string; // DateTime del backend convertido a string ISO
  categoria: string; // Corresponde a Categoria (StringLength(100))
  entidad: string; // Corresponde a Entidad (StringLength(100))
  presupuesto?: number; // Corresponde a Presupuesto (decimal?)
  estado: "activa" | "cerrada" | "pendiente"; // Corresponde a Estado (StringLength(50), default: "activa")
  estadoManual?: boolean; // Indica si el estado fue establecido manualmente
  estaActiva?: boolean; // Campo calculado del backend basado en fechas y estado
  requisitos: string[]; // Corresponde a Requisitos (List<string>)
  createdAt?: string; // Corresponde a CreatedAt (DateTime, default: DateTime.UtcNow)
  updatedAt?: string; // Corresponde a UpdatedAt (DateTime, default: DateTime.UtcNow)
  // Campos relacionados con la empresa
  companyId?: number; // Corresponde a CompanyId en el backend
  company?: Empresa; // Información completa de la empresa del backend
}

export interface Empresa {
  id?: number;
  name: string;
  url: string;
  logoUrl?: string;
  sector: string;
  department: string;
  description: string;
  createdAt?: string;
}

export interface AnalisisConvocatoria {
  estado: "activa" | "cerrada" | "no_especificada";
  justificacion: string;
  fechasEncontradas?: {
    inicio?: string;
    fin?: string;
  };
  confianza: number; // 0-100
}

export interface Usuario {
  id?: number;
  nombre: string;
  email: string;
  rol: "admin" | "usuario";
  createdAt?: string;
  updatedAt?: string;
}

export interface Registro {
  id?: number;
  usuarioId: number;
  convocatoriaId: number;
  fechaRegistro: string;
  estado: "pendiente" | "aprobado" | "rechazado";
  documentos: string[];
}

// Tipos para requests
export interface CreateConvocatoriaRequest {
  titulo: string;
  descripcion: string;
  fechaInicio: string; // Se enviará como string ISO y el backend lo convertirá a DateTime
  fechaFin: string; // Se enviará como string ISO y el backend lo convertirá a DateTime
  categoria: string;
  entidad: string;
  presupuesto?: number; // Opcional para coincidir con decimal? del backend
  estado?: "activa" | "cerrada" | "pendiente"; // Opcional, por defecto "activa" en el backend
  estadoManual?: boolean; // Indica si el estado se establece manualmente
  requisitos: string[]; // Array de strings para coincidir con List<string>
  companyId?: number; // ID de la empresa asociada
}

export interface CreateEmpresaRequest {
  name: string;
  url: string;
  logoUrl?: string;
  sector: string;
  department: string;
  description: string;
}

export interface UpdateConvocatoriaRequest
  extends Partial<CreateConvocatoriaRequest> {
  estado?: "activa" | "cerrada" | "pendiente"; // Actualizado para coincidir con el backend
}

export interface AnalizarConvocatoriaRequest {
  texto: string;
}

// Tipos para responses
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  timestamp: string;
}

// Tipos para filtros y búsquedas
export interface ConvocatoriaFilters {
  estado?: "activa" | "cerrada" | "pendiente";
  categoria?: string;
  entidad?: string;
  fechaInicio?: string;
  fechaFin?: string;
  search?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Tipos para autenticación
export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido?: string;
  rol: "admin" | "usuario";
  createdAt?: string;
  updatedAt?: string;
}

// Versión minimalista para localStorage
export interface MinimalUser {
  id: number;
  nombre: string;
  email: string;
  rol: "admin" | "usuario";
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

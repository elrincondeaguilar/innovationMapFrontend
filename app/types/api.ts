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
  
  // 🆕 NUEVOS CAMPOS EXTENDIDOS
  enlace?: string; // URL/enlace de la convocatoria
  clasificacion?: string; // Clasificación de la convocatoria
  lineaOportunidad?: string; // Línea de oportunidad (Transversal, Medio Ambiente, etc.)
  palabrasClave?: string; // Palabras clave relacionadas
  fechaApertura?: string; // Fecha de apertura
  fechaCierre?: string; // Fecha de cierre
  
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
  
  // 🆕 NUEVOS CAMPOS EXTENDIDOS
  tipoActor?: string; // Tipo de actor de innovación
  ciudad?: string; // Ciudad específica
  direccion?: string; // Dirección física
  contacto?: string; // Información de contacto
  latitud?: number; // Coordenada de latitud para mapeo preciso
  longitud?: number; // Coordenada de longitud para mapeo preciso
}

export interface AnalisisConvocatoria {
  estado: "activa" | "cerrada" | "no_especificada";
  justificacion: string;
  fechasEncontradas?: {
    inicio?: string;
    fin?: string;
    apertura?: string; // 🆕 Fecha de apertura
    cierre?: string; // 🆕 Fecha de cierre
  };
  confianza: number; // 0-100
}

// 🆕 NUEVAS ENTIDADES DEL BACKEND

export interface Promotor {
  id: number;
  medio?: string; // Medio de promoción (max 200 chars)
  descripcion?: string; // Descripción del promotor
  enlace?: string; // Enlace/URL del promotor
  createdAt: string; // Fecha de creación
  updatedAt: string; // Fecha de actualización
}

export interface Articulador {
  id: number;
  nombre: string; // Nombre del articulador (requerido, max 200 chars)
  tipo?: string; // Tipo de articulador (max 100 chars)
  region?: string; // Región de operación (max 100 chars)
  contacto?: string; // Información de contacto
  createdAt: string; // Fecha de creación
  updatedAt: string; // Fecha de actualización
}

export interface PortafolioArco {
  id: number;
  anio?: number; // Año del portafolio
  entidad?: string; // Entidad responsable (max 200 chars)
  instrumento?: string; // Instrumento utilizado (max 200 chars)
  tipoApoyo?: string; // Tipo de apoyo brindado (max 200 chars)
  objetivo?: string; // Objetivo del portafolio
  cobertura?: string; // Cobertura geográfica (max 200 chars)
  departamento?: string; // Departamento (max 100 chars)
  enlace?: string; // Enlace/URL relacionado
  createdAt: string; // Fecha de creación
  updatedAt: string; // Fecha de actualización
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
  
  // 🆕 NUEVOS CAMPOS EXTENDIDOS
  enlace?: string;
  clasificacion?: string;
  lineaOportunidad?: string;
  palabrasClave?: string;
  fechaApertura?: string;
  fechaCierre?: string;
}

export interface CreateEmpresaRequest {
  name: string;
  url: string;
  logoUrl?: string;
  sector: string;
  department: string;
  description: string;
  
  // 🆕 NUEVOS CAMPOS EXTENDIDOS
  tipoActor?: string;
  ciudad?: string;
  direccion?: string;
  contacto?: string;
  latitud?: number;
  longitud?: number;
}

// 🆕 NUEVOS TIPOS DE REQUEST PARA LAS NUEVAS ENTIDADES

export interface CreatePromotorRequest {
  medio?: string;
  descripcion?: string;
  enlace?: string;
}

export interface CreateArticuladorRequest {
  nombre: string; // Requerido
  tipo?: string;
  region?: string;
  contacto?: string;
}

export interface CreatePortafolioArcoRequest {
  anio?: number;
  entidad?: string;
  instrumento?: string;
  tipoApoyo?: string;
  objetivo?: string;
  cobertura?: string;
  departamento?: string;
  enlace?: string;
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

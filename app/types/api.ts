// 🆕 INTERFACE ECOSISTEMA UNIFICADO (Nuevo)
export interface EcosystemMapItem {
  id: number;
  nombre: string;
  tipo:
    | "Company"
    | "Promotor"
    | "Articulador"
    | "PortafolioArco"
    | "Convocatoria";
  descripcion?: string;
  ciudad?: string;
  departamento?: string;
  latitud?: number;
  longitud?: number;
  // Campos específicos por tipo
  industry?: string; // Para Company
  fundada?: number; // Para Company
  tipoPromotor?: string; // Para Promotor
  experiencia?: string; // Para Articulador
  areasExperiencia?: string; // Para Articulador
  objetivos?: string; // Para PortafolioArco
  publico?: string; // Para PortafolioArco
  categoria?: string; // Para Convocatoria
  entidad?: string; // Para Convocatoria
  fechaInicio?: string; // Para Convocatoria
  fechaFin?: string; // Para Convocatoria
  estado?: string; // Para Convocatoria
}

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
  company?: Company; // Información completa de la empresa del backend
  // Relaciones con PortafolioArco
  portfolioArcos?: PortafolioArco[];
  // Relaciones con Articuladores
  articuladorConvocatorias?: ArticuladorConvocatoria[];
}

// 🆕 ACTUALIZADA - Company con campos geográficos
export interface Company {
  id: number;
  name: string;
  description?: string;
  industry?: string;
  founded?: number;
  website?: string;
  // Nuevos campos geográficos
  ciudad?: string;
  departamento?: string;
  latitud?: number;
  longitud?: number;
  // Campos legacy mantenidos por compatibilidad
  url?: string;
  logoUrl?: string;
  sector?: string;
  department?: string;
  createdAt?: string;
  tipoActor?: string;
  direccion?: string;
  contacto?: string;
}

// 🆕 ACTUALIZADA - Promotor con campos geográficos
export interface Promotor {
  id: number;
  medio?: string; // StringLength(200) - corresponde al campo Medio del backend
  descripcion?: string; // corresponde al campo Descripcion del backend
  enlace?: string; // corresponde al campo Enlace del backend
  ciudad?: string; // StringLength(100) - corresponde al campo Ciudad del backend
  departamento?: string; // StringLength(100) - corresponde al campo Departamento del backend
  latitud?: number; // decimal? - corresponde al campo Latitud del backend
  longitud?: number; // decimal? - corresponde al campo Longitud del backend
  // Relación
  companyId?: number; // int? - corresponde al campo CompanyId del backend
  company?: Company; // corresponde a la relación Company del backend
  // Campos de auditoría
  createdAt?: string; // DateTime - corresponde al campo CreatedAt del backend
  updatedAt?: string; // DateTime - corresponde al campo UpdatedAt del backend
}

// 🆕 ACTUALIZADA - Articulador con campos geográficos
export interface Articulador {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo?: string;
  experiencia?: string;
  areasExperiencia?: string;
  contacto?: string;
  ciudad?: string;
  departamento?: string;
  latitud?: number;
  longitud?: number;
  // Relaciones
  articuladorCompanies?: ArticuladorCompany[];
  articuladorConvocatorias?: ArticuladorConvocatoria[];
  // Campos legacy
  region?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 🆕 ACTUALIZADA - PortafolioArco con campos geográficos
export interface PortafolioArco {
  id: number;
  nombre: string;
  descripcion?: string;
  objetivos?: string;
  publico?: string;
  fechaInicio?: string;
  fechaFin?: string;
  ciudad?: string;
  departamento?: string;
  latitud?: number;
  longitud?: number;
  // Relación
  convocatoriaId?: number;
  convocatoria?: Convocatoria;
  // Campos legacy
  anio?: number;
  entidad?: string;
  instrumento?: string;
  tipoApoyo?: string;
  objetivo?: string;
  cobertura?: string;
  enlace?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 🆕 TIPOS DE RELACIONES
export interface ArticuladorCompany {
  articuladorId: number;
  companyId: number;
  fechaInicio: string;
  fechaFin?: string;
  notas?: string;
  tipoColaboracion?: string;
  activa: boolean;
  articulador?: Articulador;
  company?: Company;
}

export interface ArticuladorConvocatoria {
  articuladorId: number;
  convocatoriaId: number;
  rol?: string;
  fechaAsignacion: string;
  responsabilidades?: string;
  activo: boolean;
  articulador?: Articulador;
  convocatoria?: Convocatoria;
}

// Alias para compatibilidad con código existente
export type Empresa = Company;

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
  medio?: string; // StringLength(200) - opcional según tu modelo
  descripcion?: string; // opcional según tu modelo
  enlace?: string; // opcional según tu modelo
  ciudad?: string; // StringLength(100) - opcional según tu modelo
  departamento?: string; // StringLength(100) - opcional según tu modelo
  latitud?: number; // decimal? - opcional según tu modelo
  longitud?: number; // decimal? - opcional según tu modelo
  companyId?: number; // int? - opcional según tu modelo
}

export interface CreateArticuladorRequest {
  nombre: string; // Requerido
  tipo?: string;
  region?: string;
  contacto?: string;
}

export interface CreatePortafolioArcoRequest {
  nombre: string; // Requerido
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

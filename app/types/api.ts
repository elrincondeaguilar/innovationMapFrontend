// 🆕 INTERFACE ECOSISTEMA UNIFICADO (Nuevo)
export interface EcosystemMapItem {
  id: number;
  nombre: string;
  tipo: "Company" | "Articulador" | "Convocatoria";
  descripcion?: string;
  ciudad?: string;
  departamento?: string;
  latitud?: number;
  longitud?: number;
  // Campos específicos por tipo
  industry?: string; // Para Company
  fundada?: number; // Para Company
  experiencia?: string; // Para Articulador
  areasExperiencia?: string; // Para Articulador
  categoria?: string; // Para Convocatoria
  entidad?: string; // Para Convocatoria
  fechaInicio?: string; // Para Convocatoria
  fechaFin?: string; // Para Convocatoria
  estado?: string; // Para Convocatoria
  // Agregado para mostrar enlaces de convocatorias en el mapa
  enlace?: string;
  // Agregado para empresas con url
  url?: string;
  contacto?: string;
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

export interface CreateArticuladorRequest {
  nombre: string;
  tipo?: string;
  region?: string;
  contacto?: string;

  Ciudad?: string;
  Departamento?: string;
  Latitud?: number;
  Longitud?: number;

  Anio?: number;
  Codigo?: string;
  Sector?: string;
  Entidad?: string;
  InstrumentosOfertados?: string;
  AntiguedadOferta?: number;
  Pagina?: string;
  Descripcion?: string;

  UsuariosEmprendedores?: string;
  UsuariosMiPymes?: string;
  UsuariosGrandesEmpresas?: string;
  UsuariosAcademia?: string;
  UsuariosEntidadesGobierno?: string;
  UsuariosOrganizacionesSoporte?: string;
  UsuariosPersonasNaturales?: string;

  ApoyoFinanciero?: boolean;
  AsistenciaTecnica?: boolean;
  FormacionTalentoHumano?: boolean;
  IncentivosTributarios?: boolean;
  Eventos?: boolean;
  CompraPublica?: boolean;
  RedesColaboracion?: boolean;
  BonosBouchers?: boolean;
  SistemasInformacion?: boolean;
  PremiosReconocimientos?: boolean;
  InstrumentosRegulatorios?: boolean;

  FechaApertura?: Date;
  FechaCierre?: Date;

  Cobertura?: string;
  DepartamentosMunicipios?: string;

  ObjetivoFormacionCapitalHumano?: string;
  PorcentajeFormacionCapitalHumano?: number;
  ObjetivoComercioElectronico?: string;
  PorcentajeComercioElectronico?: number;
  ObjetivoInnovacion?: string;
  PorcentajeInnovacion?: number;
  ObjetivoEmprendimiento?: string;
  PorcentajeEmprendimiento?: number;
  ObjetivoTransferenciaConocimientoTecnologia?: string;
  PorcentajeTransferenciaConocimientoTecnologia?: number;
  ObjetivoInvestigacion?: string;
  PorcentajeInvestigacion?: number;
  ObjetivoCalidad?: string;
  PorcentajeCalidad?: number;
  ObjetivoClusterEncadenamientos?: string;
  PorcentajeClusterEncadenamientos?: number;
  ObjetivoFinanciacion?: string;
  PorcentajeFinanciacion?: number;
  ObjetivoComercializacion?: string;
  PorcentajeComercializacion?: number;
  ObjetivoFormalizacion?: string;
  PorcentajeFormalizacion?: number;
  ObjetivoCrecimientoSostenible?: string;
  PorcentajeCrecimientoSostenible?: number;
  ObjetivoInclusionFinanciera?: string;
  PorcentajeInclusionFinanciera?: number;

  RecursosPGN?: number;
  RecursosCooperacion?: number;
  RecursosSGR?: number;
  RecursosEsfuerzoFiscal?: number;
  RecursosParafiscales?: number;
  RecursosOtros?: number;
  RecursosPrivado?: number;

  DisenadoPorLeyOJuez?: boolean;
  DisenadoPorPolitica?: boolean;
  DescritoDocumentoInterno?: boolean;
  OrigenInstrumento?: string;
  SolucionaFallaMercadoGobiernoArticulacion?: boolean;
  ExistenAlternativasInstrumento?: boolean;
  ObjetivosFormulacionInstrumento?: string;
  TieneMarcoLogico?: boolean;
  InsumosFormulacionImplementacion?: string;
  ActividadesFormulacionImplementacion?: string;
  ProductosGeneradosInstrumento?: string;
  ResultadosImpactosEsperados?: string;
  PoblacionObjetivo?: string;
  CriteriosFocalizacionBeneficiarios?: string;
  AdaptaDiferenciasTerritorios?: boolean;
  SeleccionBeneficiarios?: string;
  AccesoBeneficiarios?: string;
  TrazabilidadBeneficiarios?: boolean;
  DisponibilidadRecursos?: boolean;
  GestionOrganizativa?: string;
  PersonalApoyoFormulacionImplementacion?: string;
  GestionInformacionInstrumento?: string;
  MonitoreoEvaluacionInstrumento?: string;
  GestionAprendizajesInstrumento?: string;
  RelacionConOtrosInstrumentos?: string;
  ConsideraCoordinacionOtrasEntidades?: boolean;
  BarrerasFuncionamientoInstrumento?: string;
}

export interface UpdateConvocatoriaRequest
  extends Partial<CreateConvocatoriaRequest> {
  estado?: "activa" | "cerrada" | "pendiente"; // Actualizado para coincidir con el backend
}

// 🆕 ACTUALIZADA - Articulador con campos geográficos
export interface Articulador {
  id: number;
  nombre: string;
  tipo?: string;
  region?: string;
  contacto?: string;
  ciudad?: string;
  departamento?: string;
  latitud?: number;
  longitud?: number;
  createdAt?: string;
  updatedAt?: string;

  // --- CAMPOS EXTENDIDOS ---
  Anio?: number;
  Codigo?: string;
  Sector?: string;
  Entidad?: string;
  InstrumentosOfertados?: string;
  AntiguedadOferta?: number;
  Pagina?: string;
  Descripcion?: string;
  UsuariosEmprendedores?: string;
  UsuariosMiPymes?: string;
  UsuariosGrandesEmpresas?: string;
  UsuariosAcademia?: string;
  UsuariosEntidadesGobierno?: string;
  UsuariosOrganizacionesSoporte?: string;
  UsuariosPersonasNaturales?: string;
  // Tipos de apoyo
  ApoyoFinanciero: boolean;
  AsistenciaTecnica: boolean;
  FormacionTalentoHumano: boolean;
  IncentivosTributarios: boolean;
  Eventos: boolean;
  CompraPublica: boolean;
  RedesColaboracion: boolean;
  BonosBouchers: boolean;
  SistemasInformacion: boolean;
  PremiosReconocimientos: boolean;
  InstrumentosRegulatorios: boolean;
  // Fechas
  FechaApertura?: string;
  FechaCierre?: string;
  Cobertura?: string;
  DepartamentosMunicipios?: string;
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

// Tipo genérico para respuestas de servicios
export interface ServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  details?: string;
  error?: string;
}

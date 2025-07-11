import { Convocatoria, CreateConvocatoriaRequest } from "../../types/api";

/**
 * Utilidades para el mapeo entre el frontend y el backend .NET para Convocatorias
 *
 * Modelo Backend:
 * - Id: int
 * - Titulo: string (StringLength(200), Required)
 * - Descripcion: string (Required)
 * - FechaInicio: DateTime (Required)
 * - FechaFin: DateTime (Required)
 * - Categoria: string (StringLength(100), Required)
 * - Entidad: string (StringLength(100), Required)
 * - Presupuesto: decimal?
 * - Estado: string (StringLength(50), default: "activa") // activa, cerrada, pendiente
 * - Requisitos: List<string>
 * - CreatedAt: DateTime (default: DateTime.UtcNow)
 * - UpdatedAt: DateTime (default: DateTime.UtcNow)
 */

/**
 * Convierte una fecha del frontend (string ISO) al formato esperado por el backend
 * PostgreSQL requiere DateTime en UTC para campos 'timestamp with time zone'
 */
export const formatDateForBackend = (dateString: string): string => {
  if (!dateString) return dateString;

  try {
    // Crear una fecha desde el string de input (formato YYYY-MM-DD del input date)
    // Para inputs de fecha (sin hora), agregamos la hora para evitar problemas de zona horaria
    let dateToConvert: Date;

    if (dateString.includes("T")) {
      // Ya tiene información de hora
      dateToConvert = new Date(dateString);
    } else {
      // Solo fecha, agregar medianoche UTC para evitar problemas de zona horaria
      dateToConvert = new Date(dateString + "T00:00:00.000Z");
    }

    // Verificar que la fecha es válida
    if (isNaN(dateToConvert.getTime())) {
      console.warn("Invalid date string provided:", dateString);
      return dateString;
    }

    // Retornar en formato ISO UTC (termina en 'Z')
    return dateToConvert.toISOString();
  } catch (error) {
    console.error("Error formatting date for backend:", error);
    return dateString;
  }
};

/**
 * Convierte una fecha del backend al formato del frontend
 */
export const formatDateFromBackend = (dateString: string): string => {
  return dateString;
};

/**
 * Valida que una convocatoria tenga todos los campos requeridos según el modelo backend
 */
export const validateConvocatoriaForBackend = (
  convocatoria: CreateConvocatoriaRequest
): string[] => {
  const errors: string[] = [];

  // Validaciones requeridas por el backend
  if (!convocatoria.titulo || convocatoria.titulo.trim().length === 0) {
    errors.push("El título es requerido");
  } else if (convocatoria.titulo.length > 200) {
    errors.push("El título no puede exceder 200 caracteres");
  }

  if (
    !convocatoria.descripcion ||
    convocatoria.descripcion.trim().length === 0
  ) {
    errors.push("La descripción es requerida");
  }

  if (!convocatoria.fechaInicio) {
    errors.push("La fecha de inicio es requerida");
  }

  if (!convocatoria.fechaFin) {
    errors.push("La fecha de fin es requerida");
  }

  if (!convocatoria.categoria || convocatoria.categoria.trim().length === 0) {
    errors.push("La categoría es requerida");
  } else if (convocatoria.categoria.length > 100) {
    errors.push("La categoría no puede exceder 100 caracteres");
  }

  if (!convocatoria.entidad || convocatoria.entidad.trim().length === 0) {
    errors.push("La entidad es requerida");
  } else if (convocatoria.entidad.length > 100) {
    errors.push("La entidad no puede exceder 100 caracteres");
  }

  // Validar fechas
  if (convocatoria.fechaInicio && convocatoria.fechaFin) {
    const fechaInicio = new Date(convocatoria.fechaInicio);
    const fechaFin = new Date(convocatoria.fechaFin);

    if (fechaFin <= fechaInicio) {
      errors.push("La fecha de fin debe ser posterior a la fecha de inicio");
    }
  }

  // Validar estado
  if (
    convocatoria.estado &&
    !["activa", "cerrada", "pendiente"].includes(convocatoria.estado)
  ) {
    errors.push("El estado debe ser 'activa', 'cerrada' o 'pendiente'");
  }

  return errors;
};

/**
 * Prepara una convocatoria para envío al backend
 */
export const prepareConvocatoriaForBackend = (
  convocatoria: CreateConvocatoriaRequest
): CreateConvocatoriaRequest => {
  const formattedFechaInicio = formatDateForBackend(convocatoria.fechaInicio);
  const formattedFechaFin = formatDateForBackend(convocatoria.fechaFin);

  const result = {
    ...convocatoria,
    titulo: convocatoria.titulo.trim(),
    descripcion: convocatoria.descripcion.trim(),
    categoria: convocatoria.categoria.trim(),
    entidad: convocatoria.entidad.trim(),
    fechaInicio: formattedFechaInicio,
    fechaFin: formattedFechaFin,
    estado: convocatoria.estado || "activa", // Valor por defecto del backend
    estadoManual: convocatoria.estadoManual || false, // Incluir campo estadoManual
    requisitos: convocatoria.requisitos || [], // Lista vacía por defecto
    companyId: convocatoria.companyId, // Incluir companyId
    presupuesto: convocatoria.presupuesto, // Incluir presupuesto
  };

  return result;
};

/**
 * Procesa una convocatoria recibida del backend
 */
export const processConvocatoriaFromBackend = (
  convocatoria: Convocatoria
): Convocatoria => {
  return {
    ...convocatoria,
    fechaInicio: formatDateFromBackend(convocatoria.fechaInicio),
    fechaFin: formatDateFromBackend(convocatoria.fechaFin),
    createdAt: convocatoria.createdAt
      ? formatDateFromBackend(convocatoria.createdAt)
      : undefined,
    updatedAt: convocatoria.updatedAt
      ? formatDateFromBackend(convocatoria.updatedAt)
      : undefined,
  };
};

/**
 * Estados válidos para convocatorias según el modelo backend
 */
export const ESTADOS_CONVOCATORIA = {
  ACTIVA: "activa" as const,
  CERRADA: "cerrada" as const,
  PENDIENTE: "pendiente" as const,
} as const;

/**
 * Categorías comunes para convocatorias
 */
export const CATEGORIAS_CONVOCATORIA = [
  "Innovación",
  "Tecnología",
  "Emprendimiento",
  "Investigación",
  "Desarrollo",
  "Sostenibilidad",
  "Educación",
  "Salud",
] as const;

/**
 * Obtiene el color para el badge de estado
 */
export const getEstadoColor = (estado: string) => {
  switch (estado) {
    case ESTADOS_CONVOCATORIA.ACTIVA:
      return "bg-emerald-100 text-emerald-800";
    case ESTADOS_CONVOCATORIA.CERRADA:
      return "bg-red-100 text-red-800";
    case ESTADOS_CONVOCATORIA.PENDIENTE:
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/**
 * Obtiene el texto display para el estado
 */
export const getEstadoDisplayText = (estado: string) => {
  switch (estado) {
    case ESTADOS_CONVOCATORIA.ACTIVA:
      return "Activa";
    case ESTADOS_CONVOCATORIA.CERRADA:
      return "Cerrada";
    case ESTADOS_CONVOCATORIA.PENDIENTE:
      return "Pendiente";
    default:
      return estado;
  }
};

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "../../components/Navbar";
import {
  ConvocatoriaService,
  EmpresaService,
} from "../../services/backendService";
import {
  Convocatoria,
  CreateConvocatoriaRequest,
  Empresa,
} from "../../types/api";

// Lista de departamentos de Colombia (normalizada)
const DEPARTAMENTOS_COLOMBIA = [
  "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bolívar", "Boyacá", "Caldas", "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba", "Cundinamarca", "Guainía", "Guaviare", "Huila", "La Guajira", "Magdalena", "Meta", "Nariño", "Norte de Santander", "Putumayo", "Quindío", "Risaralda", "San Andrés y Providencia", "Santander", "Sucre", "Tolima", "Valle del Cauca", "Vaupés", "Vichada"
];

// Local utility functions and constants
const CATEGORIAS_CONVOCATORIA = [
  "Innovación",
  "Tecnología",
  "Emprendimiento",
  "Investigación",
  "Desarrollo",
  "Sostenibilidad",
  "Educación",
  "Salud",
] as const;

// Local validation function
const validateConvocatoriaForBackend = (
  data: CreateConvocatoriaRequest
): string[] => {
  const errors: string[] = [];

  if (!data.titulo?.trim()) errors.push("El título es requerido");
  if (!data.descripcion?.trim()) errors.push("La descripción es requerida");
  if (!data.fechaInicio) errors.push("La fecha de inicio es requerida");
  if (!data.fechaFin) errors.push("La fecha de fin es requerida");
  if (!data.categoria?.trim()) errors.push("La categoría es requerida");
  if (!data.entidad?.trim()) errors.push("La entidad es requerida");
  if (!data.departamento?.trim()) errors.push("El departamento es requerido");

  if (data.fechaInicio && data.fechaFin && data.fechaInicio >= data.fechaFin) {
    errors.push("La fecha de fin debe ser posterior a la fecha de inicio");
  }

  // Validate presupuesto range to prevent C# int32 overflow
  if (data.presupuesto !== undefined && data.presupuesto !== null) {
    if (data.presupuesto < 0) {
      errors.push("El presupuesto no puede ser negativo");
    } else if (data.presupuesto > 2147483647) {
      errors.push("El presupuesto es demasiado grande (máximo: 2,147,483,647)");
    }
  }

  return errors;
};

// Local preparation function
// Helper functions for estado management
const getEstadoColor = (estado: string): string => {
  switch (estado) {
    case "activa":
      return "bg-green-100 text-green-800";
    case "cerrada":
      return "bg-red-100 text-red-800";
    case "pendiente":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getEstadoDisplayText = (estado: string): string => {
  switch (estado) {
    case "activa":
      return "Activa";
    case "cerrada":
      return "Cerrada";
    case "pendiente":
      return "Pendiente";
    default:
      return estado;
  }
};

function safeToISOString(dateStr: string | undefined, fallback: Date): string {
  if (!dateStr || ["null", "No especificada", ""].includes(dateStr)) {
    return fallback.toISOString();
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? fallback.toISOString() : d.toISOString();
}

export default function ConvocatoriasPage() {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingConvocatoria, setEditingConvocatoria] =
    useState<Convocatoria | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>("todas");
  const [ordenamiento, setOrdenamiento] = useState<
    "recientes" | "antiguas" | "alfabetico" | "fecha-inicio"
  >("recientes");

  // Añadir latitud y longitud al estado inicial del formulario
  const [formData, setFormData] = useState<CreateConvocatoriaRequest>({
    titulo: "",
    descripcion: "",
    fechaInicio: "",
    fechaFin: "",
    categoria: "",
    entidad: "",
    estado: "pendiente", // Estado por defecto más lógico
    estadoManual: false, // Por defecto, el estado no es manual
    requisitos: [],
    presupuesto: undefined, // Incluir presupuesto en el estado inicial
    companyId: undefined, // Nuevo campo para la empresa
    enlace: "",
    departamento: "",
  });

  // Eliminar importación de MiniMap y dynamic

  // Función helper para formatear fechas de manera segura
  const formatearFecha = (fechaString: string): string => {
    try {
      // Si la fecha ya tiene información de tiempo, usarla directamente
      if (fechaString.includes("T")) {
        return new Date(fechaString).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }
      // Si solo es una fecha (YYYY-MM-DD), agregar tiempo local
      return new Date(fechaString + "T00:00:00").toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error al formatear fecha:", fechaString, error);
      return "Fecha inválida";
    }
  };

  useEffect(() => {
    cargarConvocatorias();
    cargarEmpresas();
  }, []);

  const cargarEmpresas = async () => {
    try {
      const resultado = await EmpresaService.obtenerEmpresas();
      if (resultado.success && resultado.data) {
        setEmpresas(resultado.data);
      }
    } catch (error) {
      console.error("Error al cargar empresas:", error);
    }
  };

  const cargarConvocatorias = async () => {
    try {
      setLoading(true);
      setError(null);
      const resultado = await ConvocatoriaService.obtenerConvocatorias();

      if (resultado.success && resultado.data) {
        setConvocatorias(resultado.data);
      } else {
        setError(resultado.message || "Error al cargar convocatorias");
      }
    } catch (error) {
      console.error("Error al cargar convocatorias:", error);
      setError("Error de conexión al cargar convocatorias");
    } finally {
      setLoading(false);
    }
  };

  // Función para filtrar y ordenar convocatorias
  const convocatoriasFiltradas = convocatorias
    .filter((convocatoria) => {
      if (filtroEstado === "todas") return true;
      return convocatoria.estado === filtroEstado;
    })
    .sort((a, b) => {
      switch (ordenamiento) {
        case "recientes":
          if (a.createdAt && b.createdAt) {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          }
          return (b.id || 0) - (a.id || 0);
        case "antiguas":
          if (a.createdAt && b.createdAt) {
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          }
          return (a.id || 0) - (b.id || 0);
        case "alfabetico":
          return a.titulo.localeCompare(b.titulo);
        case "fecha-inicio":
          return (
            new Date(a.fechaInicio).getTime() -
            new Date(b.fechaInicio).getTime()
          );
        default:
          return 0;
      }
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar datos antes de enviar
    const validationErrors = validateConvocatoriaForBackend(formData);
    if (validationErrors.length > 0) {
      alert("Errores de validación:\n" + validationErrors.join("\n"));
      return;
    }

    try {
      let resultado;

      if (editingConvocatoria) {
        // Editar convocatoria existente
        const payload = {
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          fechaInicio: safeToISOString(
            formData.fechaInicio,
            new Date()
          ),
          fechaFin: safeToISOString(
            formData.fechaFin,
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          ),
          categoria: formData.categoria,
          entidad: formData.entidad,
          enlace: formData.enlace || "", // siempre string
          estado: formData.estado,
          estadoManual: formData.estadoManual,
          requisitos: formData.requisitos,
          ...(typeof formData.companyId === 'number' && { companyId: formData.companyId }),
          ...(typeof formData.presupuesto === 'number' && { presupuesto: formData.presupuesto }),
          Ubicacion: formData.departamento,
        };
        resultado = await ConvocatoriaService.actualizarConvocatoria(editingConvocatoria.id!, payload);
      } else {
        // Crear nueva convocatoria
        const payload = {
          ...formData,
          Ubicacion: formData.departamento,
        };
        delete payload.departamento;
        resultado = await ConvocatoriaService.crearConvocatoria(payload);
      }

      if (resultado.success) {
        setShowForm(false);
        setEditingConvocatoria(null);
        setFormData({
          titulo: "",
          descripcion: "",
          fechaInicio: "",
          fechaFin: "",
          categoria: "",
          entidad: "",
          estado: "pendiente",
          estadoManual: false,
          requisitos: [],
          presupuesto: undefined,
          companyId: undefined,
          enlace: "",
          departamento: "",
        });
        cargarConvocatorias(); // Recargar la lista
      } else {
        alert(
          `Error al ${
            editingConvocatoria ? "actualizar" : "crear"
          } convocatoria: ` + resultado.message
        );
      }
    } catch (error) {
      console.error(
        `Error al ${
          editingConvocatoria ? "actualizar" : "crear"
        } convocatoria:`,
        error
      );
      alert(
        `Error al ${editingConvocatoria ? "actualizar" : "crear"} convocatoria`
      );
    }
  };

  const iniciarEdicion = (convocatoria: Convocatoria) => {
    setEditingConvocatoria(convocatoria);
    const formDataToSet = {
      titulo: convocatoria.titulo,
      descripcion: convocatoria.descripcion,
      fechaInicio: convocatoria.fechaInicio.split("T")[0], // Formato para input date
      fechaFin: convocatoria.fechaFin.split("T")[0], // Formato para input date
      categoria: convocatoria.categoria,
      entidad: convocatoria.entidad,
      estado: convocatoria.estado,
      estadoManual: convocatoria.estadoManual || false, // Incluir estadoManual
      requisitos: convocatoria.requisitos || [],
      presupuesto: convocatoria.presupuesto || undefined, // Incluir presupuesto
      companyId: convocatoria.companyId || undefined, // Incluir companyId
      enlace: convocatoria.enlace || "",
      departamento: convocatoria.Ubicacion || convocatoria.ubicacion || "",
    };

    setFormData(formDataToSet);
    setShowForm(true);
  };

  const cancelarEdicion = () => {
    setEditingConvocatoria(null);
    setFormData({
      titulo: "",
      descripcion: "",
      fechaInicio: "",
      fechaFin: "",
      categoria: "",
      entidad: "",
      estado: "pendiente", // Estado por defecto más lógico
      estadoManual: false, // Reset del campo estadoManual
      requisitos: [],
      presupuesto: undefined, // Incluir presupuesto en el reset
      companyId: undefined, // Incluir companyId en el reset
      enlace: "",
      departamento: "",
    });
    setShowForm(false);
  };

  const eliminarConvocatoria = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta convocatoria?")) {
      return;
    }

    try {
      const resultado = await ConvocatoriaService.eliminarConvocatoria(id);

      if (resultado.success) {
        cargarConvocatorias(); // Recargar la lista
      } else {
        alert("Error al eliminar convocatoria: " + resultado.message);
      }
    } catch (error) {
      console.error("Error al eliminar convocatoria:", error);
      alert("Error al eliminar convocatoria");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
        <Navbar />
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-400 rounded-full animate-spin animation-delay-150"></div>
            </div>
            <p className="mt-6 text-lg text-gray-600 font-medium">
              Cargando convocatorias...
            </p>
            <p className="text-sm text-gray-500">Conectando con el servidor</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
        <Navbar />
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-white/80 backdrop-blur-sm border border-red-200 shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.598 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Error al cargar convocatorias
              </h3>
              <p className="text-red-600 mb-6">{error}</p>
              <button
                onClick={cargarConvocatorias}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <svg
                  className="w-4 h-4 inline mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Convocatorias de Innovación
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre y gestiona oportunidades de financiación para proyectos
            innovadores
          </p>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                Filtrar:
              </span>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="bg-white text-gray-900 border border-gray-300 rounded-xl px-4 py-2 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
              >
                <option value="todas">Todas</option>
                <option value="activa">Activas</option>
                <option value="cerrada">Cerradas</option>
                <option value="pendiente">Pendientes</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                Ordenar:
              </span>
              <select
                value={ordenamiento}
                onChange={(e) =>
                  setOrdenamiento(
                    e.target.value as
                      | "recientes"
                      | "antiguas"
                      | "alfabetico"
                      | "fecha-inicio"
                  )
                }
                className="bg-white text-gray-900 border border-gray-300 rounded-xl px-4 py-2 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
              >
                <option value="recientes">Más recientes</option>
                <option value="antiguas">Más antiguas</option>
                <option value="alfabetico">Alfabético (A-Z)</option>
                <option value="fecha-inicio">Por fecha de inicio</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>
                {convocatoriasFiltradas.length} de {convocatorias.length}{" "}
                convocatorias
              </span>
            </div>

            <button
              onClick={() =>
                showForm ? cancelarEdicion() : setShowForm(!showForm)
              }
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-medium"
            >
              <svg
                className="w-5 h-5 inline mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    showForm
                      ? "M6 18L18 6M6 6l12 12"
                      : "M12 6v6m0 0v6m0-6h6m-6 0H6"
                  }
                />
              </svg>
              {showForm
                ? "Cancelar"
                : editingConvocatoria
                ? "Editar Convocatoria"
                : "Nueva Convocatoria"}
            </button>
          </div>
        </div>

        {/* Formulario para crear/editar convocatoria */}
        {showForm && (
          <div
            className={`bg-white/80 backdrop-blur-sm border shadow-2xl rounded-3xl p-8 mb-8 ${
              editingConvocatoria
                ? "border-blue-300 ring-2 ring-blue-200"
                : "border-white/20"
            }`}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <svg
                className={`w-6 h-6 mr-2 ${
                  editingConvocatoria ? "text-blue-600" : "text-purple-600"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    editingConvocatoria
                      ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      : "M12 6v6m0 0v6m0-6h6m-6 0H6"
                  }
                />
              </svg>
              {editingConvocatoria
                ? "Editar Convocatoria"
                : "Nueva Convocatoria"}
              {editingConvocatoria && (
                <span className="ml-3 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  Editando
                </span>
              )}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Título *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.titulo}
                      onChange={(e) =>
                        setFormData({ ...formData, titulo: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
                      placeholder="Nombre de la convocatoria"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Entidad/Empresa *
                  </label>
                  <select
                    value={formData.companyId || ""}
                    onChange={(e) => {
                      const selectedCompanyId = e.target.value
                        ? parseInt(e.target.value)
                        : undefined;
                      const selectedCompany = empresas.find(
                        (emp) => emp.id === selectedCompanyId
                      );
                      setFormData({
                        ...formData,
                        companyId: selectedCompanyId,
                        entidad: selectedCompany?.name || "",
                      });
                    }}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900"
                  >
                    <option value="">
                      Selecciona una empresa registrada (opcional)
                    </option>
                    {empresas.map((empresa) => (
                      <option key={empresa.id} value={empresa.id}>
                        {empresa.name}
                      </option>
                    ))}
                  </select>

                  {/* Preview de la empresa seleccionada */}
                  {formData.companyId && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {empresas.find((emp) => emp.id === formData.companyId)
                            ?.logoUrl && (
                            <Image
                              src={
                                empresas.find(
                                  (emp) => emp.id === formData.companyId
                                )!.logoUrl!
                              }
                              alt={`Logo de ${
                                empresas.find(
                                  (emp) => emp.id === formData.companyId
                                )!.name
                              }`}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {
                                empresas.find(
                                  (emp) => emp.id === formData.companyId
                                )?.name
                              }
                            </p>
                            <p className="text-xs text-gray-600">
                              {
                                empresas.find(
                                  (emp) => emp.id === formData.companyId
                                )?.sector
                              }
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              companyId: undefined,
                              entidad: "",
                            })
                          }
                          className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                          title="Deseleccionar empresa"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {formData.companyId
                        ? "Nombre de la empresa (automático)"
                        : "Nombre de la entidad *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.entidad}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          entidad: e.target.value,
                          // Si el usuario edita manualmente, limpiamos la selección de empresa
                          companyId:
                            formData.companyId &&
                            e.target.value !==
                              empresas.find(
                                (emp) => emp.id === formData.companyId
                              )?.name
                              ? undefined
                              : formData.companyId,
                        });
                      }}
                      disabled={!!formData.companyId}
                      className={`w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500 ${
                        formData.companyId
                          ? "bg-gray-100 cursor-not-allowed"
                          : "bg-white"
                      }`}
                      placeholder={
                        formData.companyId
                          ? "Empresa seleccionada"
                          : "Ingresa el nombre de la entidad convocante"
                      }
                    />
                    {formData.companyId && (
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Para editar el nombre manualmente, haz clic en ✕ para
                        deseleccionar la empresa
                      </p>
                    )}
                    {!formData.companyId && (
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Puedes seleccionar una empresa registrada arriba o
                        escribir el nombre manualmente
                      </p>
                    )}
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    required
                    value={formData.categoria}
                    onChange={(e) =>
                      setFormData({ ...formData, categoria: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900"
                  >
                    <option value="">Selecciona una categoría</option>
                    {CATEGORIAS_CONVOCATORIA.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Presupuesto
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="2147483647"
                    value={
                      formData.presupuesto !== undefined
                        ? formData.presupuesto
                        : ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        presupuesto:
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Presupuesto disponible (máx: 2,147,483,647)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Valor máximo permitido: $2,147,483,647
                  </p>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Estado{" "}
                    {formData.estadoManual && (
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full ml-2">
                        Manual
                      </span>
                    )}
                  </label>
                  <select
                    value={formData.estado || "pendiente"}
                    onChange={(e) => {
                      const newEstado = e.target.value as
                        | "activa"
                        | "cerrada"
                        | "pendiente";
                      setFormData({
                        ...formData,
                        estado: newEstado,
                      });
                    }}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="activa">Activa</option>
                    <option value="cerrada">Cerrada</option>
                  </select>

                  {/* Control para estado manual */}
                  <div className="mt-3 flex items-center">
                    <input
                      type="checkbox"
                      id="estadoManual"
                      checked={formData.estadoManual || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          estadoManual: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <label
                      htmlFor="estadoManual"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Establecer estado manualmente
                    </label>
                  </div>
                  {formData.estadoManual && (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ El estado manual anula la actualización automática
                      basada en fechas
                    </p>
                  )}

                  {/* Información adicional sobre estados */}
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700 font-medium mb-1">
                      ℹ️ Información sobre estados:
                    </p>
                    <ul className="text-xs text-blue-600 space-y-1">
                      <li>
                        • <strong>Pendiente:</strong> La convocatoria aún no ha
                        iniciado
                      </li>
                      <li>
                        • <strong>Activa:</strong> La convocatoria está en curso
                      </li>
                      <li>
                        • <strong>Cerrada:</strong> La convocatoria ha
                        finalizado
                      </li>
                    </ul>
                    {!formData.estadoManual && (
                      <p className="text-xs text-blue-600 mt-2">
                        💡 Sin estado manual, se actualiza automáticamente según
                        las fechas
                      </p>
                    )}
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fecha Inicio *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fechaInicio}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaInicio: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fecha Fin *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fechaFin}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaFin: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900"
                  />
                </div>
                {/* Eliminar latitud y longitud del formulario */}
                <div className="group col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Departamento *
                  </label>
                  <select
                    required
                    value={formData.departamento || ""}
                    onChange={e => setFormData({ ...formData, departamento: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900"
                  >
                    <option value="">Selecciona un departamento</option>
                    {DEPARTAMENTOS_COLOMBIA.map(dep => (
                      <option key={dep} value={dep}>{dep}</option>
                    ))}
                  </select>
                  {formData.departamento === "" ? (
                    <p className="text-xs text-red-600 mt-1">Debes seleccionar el departamento de la convocatoria</p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">Departamento: {formData.departamento}</p>
                  )}
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Enlace de la convocatoria (opcional)
                  </label>
                  <input
                    type="url"
                    value={formData.enlace || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, enlace: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="https://ejemplo.com/convocatoria"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-500 resize-none"
                  placeholder="Descripción detallada de la convocatoria..."
                />
              </div>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
                >
                  <svg
                    className="w-5 h-5 inline mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  {editingConvocatoria
                    ? "Actualizar Convocatoria"
                    : "Crear Convocatoria"}
                </button>
                <button
                  type="button"
                  onClick={() => cancelarEdicion()}
                  className="flex-1 sm:flex-none bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Empty State */}
        {convocatoriasFiltradas.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {convocatorias.length === 0
                ? "No hay convocatorias registradas"
                : "No hay convocatorias que coincidan con los filtros"}
            </h3>
            <p className="text-gray-500 mb-6">
              {convocatorias.length === 0
                ? "Comienza creando tu primera convocatoria"
                : "Intenta cambiar los filtros o crear una nueva convocatoria"}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              {convocatorias.length === 0
                ? "Crear Primera Convocatoria"
                : "Nueva Convocatoria"}
            </button>
          </div>
        ) : (
          /* Lista de convocatorias */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {convocatoriasFiltradas.map((convocatoria) => (
              <div
                key={convocatoria.id}
                className="group bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:bg-white/90"
              >
                {/* Header with status */}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300 line-clamp-2">
                    {convocatoria.titulo}
                  </h3>
                  {(convocatoria.Ubicacion || convocatoria.ubicacion) && (
                    <div className="flex items-center mt-1 mb-2">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 12.414a2 2 0 00-2.828 0l-4.243 4.243a8 8 0 1111.314 0z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      <span className="text-sm text-gray-600">
                        {convocatoria.Ubicacion || convocatoria.ubicacion}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${getEstadoColor(
                        convocatoria.estado
                      )}`}
                    >
                      {getEstadoDisplayText(convocatoria.estado)}
                    </span>
                    {convocatoria.estadoManual && (
                      <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full font-medium">
                        Manual
                      </span>
                    )}
                  </div>
                </div>
                {/* Description */}
                <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                  {convocatoria.descripcion}
                </p>
                {/* Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center">
                    {convocatoria.company?.logoUrl ? (
                      <Image
                        src={convocatoria.company.logoUrl}
                        alt={`Logo de ${convocatoria.company.name}`}
                        width={16}
                        height={16}
                        className="w-4 h-4 rounded mr-2 object-cover"
                        onError={(e) => {
                          // Fallback si la imagen no carga
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <svg
                        className="w-4 h-4 text-purple-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    )}
                    <span className="text-sm text-gray-600">
                      {convocatoria.company?.name || convocatoria.entidad}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-blue-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    <span className="text-sm text-gray-600">
                      {convocatoria.lineaOportunidad || "Sin línea"}
                    </span>
                  </div>

                  {/* Enlace de la convocatoria */}
                  {convocatoria.enlace && (
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 text-blue-400 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.828 10.172a4 4 0 010 5.656m-1.414-1.414a2 2 0 010-2.828m-2.828 2.828a4 4 0 010-5.656m1.414 1.414a2 2 0 010 2.828"
                        />
                      </svg>
                      <a
                        href={convocatoria.enlace}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline hover:text-blue-800 text-sm break-all"
                      >
                        Ver convocatoria
                      </a>
                    </div>
                  )}

                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm text-gray-600">
                      {formatearFecha(convocatoria.fechaInicio)} -{" "}
                      {formatearFecha(convocatoria.fechaFin)}
                    </span>
                  </div>

                  {convocatoria.presupuesto && (
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 text-yellow-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                      <span className="text-sm font-semibold text-gray-700">
                        ${convocatoria.presupuesto.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {convocatoria.createdAt && (
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 text-gray-400 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-xs text-gray-500">
                        Creada{" "}
                        {new Date(convocatoria.createdAt).toLocaleDateString(
                          "es-ES",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  )}
                </div>{" "}
                {/* Actions */}
                {convocatoria.id && (
                  <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => iniciarEdicion(convocatoria)}
                      className="group/btn flex items-center text-blue-600 hover:text-white text-sm border border-blue-300 hover:border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <svg
                        className="w-4 h-4 mr-2 group-hover/btn:animate-pulse"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Editar
                    </button>

                    <button
                      onClick={() => eliminarConvocatoria(convocatoria.id!)}
                      className="group/btn flex items-center text-red-600 hover:text-white text-sm border border-red-300 hover:border-red-600 px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <svg
                        className="w-4 h-4 mr-2 group-hover/btn:animate-pulse"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

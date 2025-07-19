"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "../../components/Navbar";
import Image from "next/image";
import { EmpresaService } from "@/app/services/backendService";
import { Empresa } from "@/app/types/api";

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresasOrdenadas, setEmpresasOrdenadas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ordenamiento, setOrdenamiento] = useState<
    "recientes" | "antiguas" | "alfabetico"
  >("recientes");

  // Estados para edición
  const [editandoEmpresa, setEditandoEmpresa] = useState<Empresa | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);

  useEffect(() => {
    cargarEmpresas();
  }, []);

  // Función para ordenar empresas
  const ordenarEmpresas = (
    empresasParam: Empresa[],
    tipoOrden: "recientes" | "antiguas" | "alfabetico"
  ) => {
    const empresasCopia = [...empresasParam];

    switch (tipoOrden) {
      case "recientes":
        // Priorizar 'createdAt' para un ordenamiento más preciso por fecha
        return empresasCopia.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          }
          // Fallback a 'id' si no existe 'createdAt'
          return (b.id || 0) - (a.id || 0);
        });
      case "antiguas":
        return empresasCopia.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          }
          // Fallback a 'id' si no existe 'createdAt'
          return (a.id || 0) - (b.id || 0);
        });
      case "alfabetico":
        return empresasCopia.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return empresasCopia;
    }
  };

  // Efecto para aplicar ordenamiento cuando cambian las empresas o el tipo de ordenamiento
  useEffect(() => {
    if (empresas.length > 0) {
      const empresasOrdenadas = ordenarEmpresas(empresas, ordenamiento);
      setEmpresasOrdenadas(empresasOrdenadas);
    }
  }, [empresas, ordenamiento]);

  const cargarEmpresas = async () => {
    try {
      setLoading(true);
      setError(null);
      const resultado = await EmpresaService.obtenerEmpresas();

      if (resultado.success && resultado.data) {
        setEmpresas(resultado.data);
      } else {
        setError(resultado.message || "Error al cargar empresas");
      }
    } catch (error) {
      console.error("Error al cargar empresas:", error);
      setError("Error de conexión al cargar empresas");
    } finally {
      setLoading(false);
    }
  };

  const eliminarEmpresa = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta empresa?")) {
      return;
    }

    try {
      const resultado = await EmpresaService.eliminarEmpresa(id);

      if (resultado.success) {
        cargarEmpresas(); // Recargar la lista
      } else {
        alert("Error al eliminar empresa: " + resultado.message);
      }
    } catch (error) {
      console.error("Error al eliminar empresa:", error);
      alert("Error al eliminar empresa");
    }
  };

  // Función para extraer el logo automáticamente
  const extractLogoFromUrl = useCallback(
    async (url: string) => {
      if (!url) return;

      try {
        setLogoLoading(true);

        // Asegurar que la URL tenga protocolo
        let formattedUrl = url;
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          formattedUrl = `https://${url}`;
        }

        // Extraer dominio
        const domain = new URL(formattedUrl).hostname;

        // Opciones de logos en orden de prioridad
        const logoOptions = [
          `https://logo.clearbit.com/${domain}`,
          `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
          `https://icons.duckduckgo.com/ip3/${domain}.ico`,
          `${formattedUrl}/favicon.ico`,
          `${formattedUrl}/assets/logo.png`,
          `${formattedUrl}/images/logo.png`,
        ];

        // Probar cada opción hasta encontrar una que funcione
        for (const logoUrl of logoOptions) {
          try {
            const response = await fetch(logoUrl, { method: "HEAD" });
            if (response.ok && editandoEmpresa) {
              setEditandoEmpresa((prev) =>
                prev ? { ...prev, logoUrl } : null
              );
              break;
            }
          } catch {
            continue;
          }
        }
      } catch (error) {
        console.error("Error extrayendo logo:", error);
      } finally {
        setLogoLoading(false);
      }
    },
    [editandoEmpresa]
  );

  // Función para iniciar la edición de una empresa
  const iniciarEdicion = (empresa: Empresa) => {
    setEditandoEmpresa({ ...empresa });
    setShowEditForm(true);
  };

  // Función para cancelar la edición
  const cancelarEdicion = () => {
    setEditandoEmpresa(null);
    setShowEditForm(false);
  };

  // Función para manejar cambios en el formulario de edición
  const handleEditChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (!editandoEmpresa) return;

    const { name, value } = e.target;
    setEditandoEmpresa((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  // Función para guardar los cambios
  const guardarCambios = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editandoEmpresa || !editandoEmpresa.id) return;

    try {
      // Validar URL
      if (editandoEmpresa.url && !editandoEmpresa.url.startsWith("http")) {
        setEditandoEmpresa((prev) =>
          prev ? { ...prev, url: `https://${prev.url}` } : null
        );
      }

      const resultado = await EmpresaService.actualizarEmpresa(
        editandoEmpresa.id,
        editandoEmpresa
      );

      if (resultado.success) {
        alert("Empresa actualizada con éxito");
        cancelarEdicion();
        cargarEmpresas(); // Recargar la lista
      } else {
        alert(
          `Error al actualizar empresa: ${
            resultado.message || "Error desconocido"
          }`
        );
      }
    } catch (error) {
      console.error("Error al actualizar empresa:", error);
      alert("Error de conexión al actualizar empresa");
    }
  };

  // Efecto para extraer logo cuando cambia la URL en edición
  useEffect(() => {
    if (editandoEmpresa?.url && editandoEmpresa.url.trim()) {
      const timeoutId = setTimeout(() => {
        if (editandoEmpresa.url) {
          extractLogoFromUrl(editandoEmpresa.url.trim());
        }
      }, 1500);

      return () => clearTimeout(timeoutId);
    }
  }, [editandoEmpresa?.url, extractLogoFromUrl]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Navbar />
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-indigo-400 rounded-full animate-spin animation-delay-150"></div>
            </div>
            <p className="mt-6 text-lg text-gray-600 font-medium">
              Cargando empresas...
            </p>
            <p className="text-sm text-gray-500">Conectando con el servidor</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
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
                Error al cargar empresas
              </h3>
              <p className="text-red-600 mb-6">{error}</p>
              <button
                onClick={cargarEmpresas}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full mb-4">
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Empresas Registradas
          </h1>
          <div className="flex items-center justify-center space-x-4 text-lg text-gray-600">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
              <span>{empresas.length} empresas activas</span>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        {empresas.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                Ordenar por:
              </span>
              <select
                value={ordenamiento}
                onChange={(e) =>
                  setOrdenamiento(
                    e.target.value as "recientes" | "antiguas" | "alfabetico"
                  )
                }
                className="bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-xl px-4 py-2 shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
              >
                <option value="recientes">Más recientes</option>
                <option value="antiguas">Más antiguas</option>
                <option value="alfabetico">Alfabético (A-Z)</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <svg
                className="w-4 h-4 text-emerald-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4"
                />
              </svg>
              <span>
                Mostrando {empresasOrdenadas.length} de {empresas.length}{" "}
                empresas
              </span>
            </div>
          </div>
        )}

        {/* Formulario de Edición */}
        {showEditForm && editandoEmpresa && (
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl rounded-3xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <svg
                className="w-6 h-6 text-emerald-600 mr-2"
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
              Editar Empresa: {editandoEmpresa.name}
            </h3>
            <form onSubmit={guardarCambios} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre de la empresa */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre de la empresa *
                  </label>
                  <input
                    name="name"
                    type="text"
                    value={editandoEmpresa.name}
                    onChange={handleEditChange}
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Ejemplo: Innovación Tech SAS"
                  />
                </div>

                {/* URL del sitio web */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL del sitio web *
                  </label>
                  <input
                    name="url"
                    type="url"
                    value={editandoEmpresa.url}
                    onChange={handleEditChange}
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="https://www.empresa.com"
                  />
                </div>

                {/* URL del logo */}
                <div className="group md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL del logo (opcional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {logoLoading ? (
                        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg
                          className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </div>
                    <input
                      name="logoUrl"
                      type="url"
                      value={editandoEmpresa.logoUrl || ""}
                      onChange={handleEditChange}
                      className="w-full pl-10 pr-32 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
                      placeholder={
                        logoLoading
                          ? "Extrayendo logo automáticamente..."
                          : "https://www.empresa.com/logo.png"
                      }
                    />
                    <button
                      type="button"
                      onClick={() => editandoEmpresa.url && extractLogoFromUrl(editandoEmpresa.url)}
                      disabled={!editandoEmpresa.url || logoLoading}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-600 hover:text-emerald-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                      title="Extraer logo automáticamente"
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
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </button>
                  </div>
                  {editandoEmpresa.logoUrl && (
                    <div className="mt-3 flex items-center space-x-3">
                      <span className="text-sm text-gray-600">
                        Vista previa:
                      </span>
                      <Image
                        src={editandoEmpresa.logoUrl}
                        alt="Logo preview"
                        width={32}
                        height={32}
                        className="w-8 h-8 object-contain rounded border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                        unoptimized
                      />
                    </div>
                  )}
                </div>

                {/* Sector */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sector *
                  </label>
                  <select
                    name="sector"
                    value={editandoEmpresa.sector}
                    onChange={handleEditChange}
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900"
                  >
                    <option value="">Selecciona un sector</option>
                    <option value="Tecnología">Tecnología</option>
                    <option value="Educación">Educación</option>
                    <option value="Salud">Salud</option>
                    <option value="Energía">Energía</option>
                    <option value="Fintech">Fintech</option>
                    <option value="Agroindustria">Agroindustria</option>
                    <option value="Manufactura">Manufactura</option>
                    <option value="Servicios">Servicios</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>

                {/* Departamento */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Departamento *
                  </label>
                  <select
                    name="department"
                    value={editandoEmpresa.department}
                    onChange={handleEditChange}
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900"
                  >
                    <option value="">Selecciona un departamento</option>
                    <option value="Amazonas">Amazonas</option>
                    <option value="Antioquia">Antioquia</option>
                    <option value="Arauca">Arauca</option>
                    <option value="Atlántico">Atlántico</option>
                    <option value="Bolívar">Bolívar</option>
                    <option value="Boyacá">Boyacá</option>
                    <option value="Caldas">Caldas</option>
                    <option value="Caquetá">Caquetá</option>
                    <option value="Casanare">Casanare</option>
                    <option value="Cauca">Cauca</option>
                    <option value="Cesar">Cesar</option>
                    <option value="Chocó">Chocó</option>
                    <option value="Córdoba">Córdoba</option>
                    <option value="Cundinamarca">Cundinamarca</option>
                    <option value="Guainía">Guainía</option>
                    <option value="Guaviare">Guaviare</option>
                    <option value="Huila">Huila</option>
                    <option value="La Guajira">La Guajira</option>
                    <option value="Magdalena">Magdalena</option>
                    <option value="Meta">Meta</option>
                    <option value="Nariño">Nariño</option>
                    <option value="Norte de Santander">
                      Norte de Santander
                    </option>
                    <option value="Putumayo">Putumayo</option>
                    <option value="Quindío">Quindío</option>
                    <option value="Risaralda">Risaralda</option>
                    <option value="San Andrés y Providencia">
                      San Andrés y Providencia
                    </option>
                    <option value="Santander">Santander</option>
                    <option value="Sucre">Sucre</option>
                    <option value="Tolima">Tolima</option>
                    <option value="Valle del Cauca">Valle del Cauca</option>
                    <option value="Vaupés">Vaupés</option>
                    <option value="Vichada">Vichada</option>
                  </select>
                </div>
              </div>

              {/* Descripción */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción de la empresa *
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={editandoEmpresa.description}
                  onChange={handleEditChange}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-500 resize-none"
                  placeholder="Describe brevemente los productos o servicios de tu empresa..."
                />
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={cancelarEdicion}
                  className="flex-1 sm:flex-none bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Empty State */}
        {empresas.length === 0 ? (
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No hay empresas registradas
            </h3>
            <p className="text-gray-500 mb-6">
              Comienza registrando tu primera empresa en el ecosistema
            </p>
            <a
              href="/registro"
              className="inline-flex items-center bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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
              Registrar Primera Empresa
            </a>
          </div>
        ) : (
          /* Lista de empresas */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {empresasOrdenadas.map((empresa) => (
              <div
                key={empresa.id}
                className="group bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:bg-white/90"
              >
                {/* Header with logo */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-emerald-600 transition-colors duration-300 line-clamp-2">
                      {empresa.name}
                    </h3>
                    <div className="flex items-center mt-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        {empresa.sector}
                      </span>
                    </div>
                  </div>
                  {empresa.logoUrl && (
                    <div className="flex-shrink-0 ml-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
                        <Image
                          src={empresa.logoUrl}
                          alt={`${empresa.name} logo`}
                          width={64}
                          height={64}
                          className="w-full h-full object-contain"
                          style={{ objectFit: "contain" }}
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.style.display = "none";
                          }}
                          unoptimized
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                  {empresa.description}
                </p>

                {/* Details */}
                <div className="space-y-3 mb-6">
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
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-sm text-gray-600">
                      {empresa.department}
                    </span>
                  </div>

                  {empresa.url && (
                    <div className="flex items-center">
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
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      <a
                        href={empresa.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-600 hover:text-purple-800 underline truncate max-w-40"
                      >
                        Visitar sitio web
                      </a>
                    </div>
                  )}

                  {empresa.createdAt && (
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-xs text-gray-500">
                        Registrada{" "}
                        {new Date(empresa.createdAt).toLocaleDateString(
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
                </div>

                {/* Actions */}
                {empresa.id && (
                  <div className="flex justify-between pt-4 border-t border-gray-100">
                    <button
                      onClick={() => iniciarEdicion(empresa)}
                      className="group/btn flex items-center text-emerald-600 hover:text-white text-sm border border-emerald-300 hover:border-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-600 transition-all duration-300 shadow-sm hover:shadow-md"
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
                      onClick={() => eliminarEmpresa(empresa.id!)}
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

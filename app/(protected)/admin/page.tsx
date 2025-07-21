"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { ArticuladorService } from "../../services/nuevasEntidadesService";
import { Articulador, CreateArticuladorRequest } from "../../types/api";

type TabType = "articuladores";

export default function AdminEntidadesPage() {
  const [activeTab, setActiveTab] = useState<TabType>("articuladores");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Estados para cada entidad
  const [articuladores, setArticuladores] = useState<Articulador[]>([]);

  // Estados para formularios
  const [nuevoArticulador, setNuevoArticulador] =
    useState<CreateArticuladorRequest>({
      nombre: "",
      tipo: "",
      region: "",
      contacto: "",
    });

  // Cargar datos
  const cargarDatos = async () => {
    setLoading(true);
    try {
      const articuladoresRes = await ArticuladorService.getAll();

      if (articuladoresRes.success && articuladoresRes.data) {
        setArticuladores(articuladoresRes.data);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
      setError("Error cargando datos del ecosistema");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Funciones para crear entidades
  const crearArticulador = async () => {
    if (!nuevoArticulador.nombre.trim()) {
      setError("El nombre es requerido");
      return;
    }

    setLoading(true);
    try {
      const resultado = await ArticuladorService.create(nuevoArticulador);
      if (resultado.success) {
        setSuccess("Articulador creado exitosamente");
        setNuevoArticulador({ nombre: "", tipo: "", region: "", contacto: "" });
        cargarDatos();
      } else {
        setError(resultado.message || "Error creando articulador");
      }
    } catch {
      setError("Error creando articulador");
    } finally {
      setLoading(false);
    }
  };

  // Funciones para eliminar entidades
  const eliminarArticulador = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este articulador?"))
      return;

    setLoading(true);
    try {
      const resultado = await ArticuladorService.delete(id);
      if (resultado.success) {
        setSuccess("Articulador eliminado exitosamente");
        cargarDatos();
      } else {
        setError(`Error eliminando articulador: ${resultado.message}`);
      }
    } catch (error) {
      setError(
        `Error inesperado: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Limpiar mensajes
  const limpiarMensajes = () => {
    setError("");
    setSuccess("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 flex items-center">
              <svg
                className="w-8 h-8 mr-3 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Panel de Administración
            </h1>
            <p className="text-gray-600">
              Administra articuladores del ecosistema INTEIA
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => {
                    setActiveTab("articuladores");
                    limpiarMensajes();
                  }}
                  className={`px-6 py-4 text-sm font-medium ${
                    activeTab === "articuladores"
                      ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  🤝 Articuladores ({articuladores.length})
                </button>
              </nav>
            </div>

            <div className="p-8">
              {/* Mensajes */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
              )}

              {/* Tab Content */}
              {activeTab === "articuladores" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Formulario para crear articulador */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Crear Nuevo Articulador
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre *
                          </label>
                          <input
                            type="text"
                            value={nuevoArticulador.nombre}
                            onChange={(e) =>
                              setNuevoArticulador({
                                ...nuevoArticulador,
                                nombre: e.target.value,
                              })
                            }
                            placeholder="Nombre del articulador"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo
                          </label>
                          <input
                            type="text"
                            value={nuevoArticulador.tipo}
                            onChange={(e) =>
                              setNuevoArticulador({
                                ...nuevoArticulador,
                                tipo: e.target.value,
                              })
                            }
                            placeholder="Tipo de articulador"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Región
                          </label>
                          <input
                            type="text"
                            value={nuevoArticulador.region}
                            onChange={(e) =>
                              setNuevoArticulador({
                                ...nuevoArticulador,
                                region: e.target.value,
                              })
                            }
                            placeholder="Región"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contacto
                          </label>
                          <input
                            type="text"
                            value={nuevoArticulador.contacto}
                            onChange={(e) =>
                              setNuevoArticulador({
                                ...nuevoArticulador,
                                contacto: e.target.value,
                              })
                            }
                            placeholder="Información de contacto"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <button
                          onClick={crearArticulador}
                          disabled={loading}
                          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200"
                        >
                          {loading ? "Creando..." : "Crear Articulador"}
                        </button>
                      </div>
                    </div>

                    {/* Lista de articuladores */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Articuladores Existentes
                      </h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {articuladores.map((articulador) => (
                          <div
                            key={articulador.id}
                            className="bg-white border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-800">
                                  {articulador.nombre}
                                </h4>
                                {articulador.tipo && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    Tipo: {articulador.tipo}
                                  </p>
                                )}
                                {articulador.region && (
                                  <p className="text-sm text-gray-600">
                                    Región: {articulador.region}
                                  </p>
                                )}
                                {articulador.contacto && (
                                  <p className="text-sm text-gray-600">
                                    Contacto: {articulador.contacto}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2 ml-4">
                                <button
                                  onClick={() =>
                                    eliminarArticulador(articulador.id)
                                  }
                                  disabled={loading}
                                  className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm rounded-lg transition-colors duration-200"
                                  title="Eliminar articulador"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {articuladores.length === 0 && (
                          <p className="text-gray-500 text-center py-4">
                            No hay articuladores registrados
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

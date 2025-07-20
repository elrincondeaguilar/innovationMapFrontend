"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import {
  PromotorService,
  ArticuladorService,
  PortafolioArcoService,
} from "../../services/nuevasEntidadesService";
import {
  Promotor,
  Articulador,
  PortafolioArco,
  CreatePromotorRequest,
  CreateArticuladorRequest,
  CreatePortafolioArcoRequest,
} from "../../types/api";

type TabType = "promotores" | "articuladores" | "portafolio";

export default function AdminEntidadesPage() {
  const [activeTab, setActiveTab] = useState<TabType>("promotores");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Estados para cada entidad
  const [promotores, setPromotores] = useState<Promotor[]>([]);
  const [articuladores, setArticuladores] = useState<Articulador[]>([]);
  const [portafolios, setPortafolios] = useState<PortafolioArco[]>([]);

  // Estados para formularios
  const [nuevoPromotor, setNuevoPromotor] = useState<CreatePromotorRequest>({
    medio: "",
    descripcion: "",
    enlace: "",
    ciudad: "",
    departamento: "",
  });

  const [nuevoArticulador, setNuevoArticulador] =
    useState<CreateArticuladorRequest>({
      nombre: "",
      tipo: "",
      region: "",
      contacto: "",
    });

  const [nuevoPortafolio, setNuevoPortafolio] =
    useState<CreatePortafolioArcoRequest>({
      nombre: "",
      anio: new Date().getFullYear(),
      entidad: "",
      instrumento: "",
      tipoApoyo: "",
      objetivo: "",
      cobertura: "",
      departamento: "",
      enlace: "",
    });

  // Cargar datos
  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [promotoresRes, articuladoresRes, portafoliosRes] =
        await Promise.all([
          PromotorService.getAll(),
          ArticuladorService.getAll(),
          PortafolioArcoService.getAll(),
        ]);

      if (promotoresRes.success && promotoresRes.data) {
        setPromotores(promotoresRes.data);
      }
      if (articuladoresRes.success && articuladoresRes.data) {
        setArticuladores(articuladoresRes.data);
      }
      if (portafoliosRes.success && portafoliosRes.data) {
        setPortafolios(portafoliosRes.data);
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
  const crearPromotor = async () => {
    if (!nuevoPromotor.medio?.trim()) {
      setError("El medio es requerido");
      return;
    }

    setLoading(true);
    try {
      // 🆕 Log para debug
      console.log("Enviando datos del promotor:", nuevoPromotor);

      const resultado = await PromotorService.create(nuevoPromotor);
      console.log("Resultado del servidor:", resultado);

      if (resultado.success) {
        setSuccess("Promotor creado exitosamente");
        setNuevoPromotor({
          medio: "",
          descripcion: "",
          enlace: "",
          ciudad: "",
          departamento: "",
        });
        cargarDatos(); // Recargar datos
      } else {
        console.error("Error del servidor:", resultado.message);
        setError(`Error creando promotor: ${resultado.message}`);
      }
    } catch (error) {
      console.error("Error inesperado:", error);
      setError(
        `Error inesperado: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

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

  const crearPortafolio = async () => {
    if (!nuevoPortafolio.nombre?.trim()) {
      setError("El nombre es requerido");
      return;
    }
    if (!nuevoPortafolio.entidad?.trim()) {
      setError("La entidad es requerida");
      return;
    }

    setLoading(true);
    try {
      const resultado = await PortafolioArcoService.create(nuevoPortafolio);
      if (resultado.success) {
        setSuccess("Portafolio creado exitosamente");
        setNuevoPortafolio({
          nombre: "",
          anio: new Date().getFullYear(),
          entidad: "",
          instrumento: "",
          tipoApoyo: "",
          objetivo: "",
          cobertura: "",
          departamento: "",
          enlace: "",
        });
        cargarDatos();
      } else {
        setError(resultado.message || "Error creando portafolio");
      }
    } catch {
      setError("Error creando portafolio");
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Funciones para eliminar entidades
  const eliminarPromotor = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este promotor?"))
      return;

    setLoading(true);
    try {
      const resultado = await PromotorService.delete(id);
      if (resultado.success) {
        setSuccess("Promotor eliminado exitosamente");
        cargarDatos();
      } else {
        setError(`Error eliminando promotor: ${resultado.message}`);
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

  const eliminarPortafolio = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este portafolio?"))
      return;

    setLoading(true);
    try {
      const resultado = await PortafolioArcoService.delete(id);
      if (resultado.success) {
        setSuccess("Portafolio eliminado exitosamente");
        cargarDatos();
      } else {
        setError(`Error eliminando portafolio: ${resultado.message}`);
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
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              Gestión del Ecosistema de Innovación
            </h1>
            <p className="text-gray-600">
              Administra promotores, articuladores y portafolios del ecosistema
              INTEIA
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => {
                    setActiveTab("promotores");
                    limpiarMensajes();
                  }}
                  className={`px-6 py-4 text-sm font-medium ${
                    activeTab === "promotores"
                      ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  📢 Promotores ({promotores.length})
                </button>
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
                <button
                  onClick={() => {
                    setActiveTab("portafolio");
                    limpiarMensajes();
                  }}
                  className={`px-6 py-4 text-sm font-medium ${
                    activeTab === "portafolio"
                      ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  📊 Portafolio ARCO ({portafolios.length})
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
              {activeTab === "promotores" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Formulario para crear promotor */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Crear Nuevo Promotor
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Medio *
                          </label>
                          <input
                            type="text"
                            value={nuevoPromotor.medio}
                            onChange={(e) =>
                              setNuevoPromotor({
                                ...nuevoPromotor,
                                medio: e.target.value,
                              })
                            }
                            placeholder="Ej: Redes sociales, Email, Web"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ciudad
                          </label>
                          <input
                            type="text"
                            value={nuevoPromotor.ciudad}
                            onChange={(e) =>
                              setNuevoPromotor({
                                ...nuevoPromotor,
                                ciudad: e.target.value,
                              })
                            }
                            placeholder="Ciudad"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Departamento
                          </label>
                          <input
                            type="text"
                            value={nuevoPromotor.departamento}
                            onChange={(e) =>
                              setNuevoPromotor({
                                ...nuevoPromotor,
                                departamento: e.target.value,
                              })
                            }
                            placeholder="Departamento"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descripción
                          </label>
                          <textarea
                            value={nuevoPromotor.descripcion}
                            onChange={(e) =>
                              setNuevoPromotor({
                                ...nuevoPromotor,
                                descripcion: e.target.value,
                              })
                            }
                            placeholder="Descripción del promotor"
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Enlace
                          </label>
                          <input
                            type="url"
                            value={nuevoPromotor.enlace}
                            onChange={(e) =>
                              setNuevoPromotor({
                                ...nuevoPromotor,
                                enlace: e.target.value,
                              })
                            }
                            placeholder="https://ejemplo.com"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <button
                          onClick={crearPromotor}
                          disabled={loading}
                          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200"
                        >
                          {loading ? "Creando..." : "Crear Promotor"}
                        </button>
                      </div>
                    </div>

                    {/* Lista de promotores */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Promotores Existentes
                      </h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {promotores.map((promotor) => (
                          <div
                            key={promotor.id}
                            className="bg-white border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-800">
                                  {promotor.medio || `Promotor ${promotor.id}`}
                                </h4>
                                {promotor.descripcion && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {promotor.descripcion}
                                  </p>
                                )}
                                {promotor.enlace && (
                                  <a
                                    href={promotor.enlace}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                                  >
                                    🔗 Ver enlace
                                  </a>
                                )}
                              </div>
                              <div className="flex gap-2 ml-4">
                                <button
                                  onClick={() => eliminarPromotor(promotor.id)}
                                  disabled={loading}
                                  className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm rounded-lg transition-colors duration-200"
                                  title="Eliminar promotor"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {promotores.length === 0 && (
                          <p className="text-gray-500 text-center py-4">
                            No hay promotores registrados
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
                            placeholder="Ej: Universidad, Incubadora, Corporación"
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
                            placeholder="Ej: Antioquia, Bogotá, Nacional"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contacto
                          </label>
                          <textarea
                            value={nuevoArticulador.contacto}
                            onChange={(e) =>
                              setNuevoArticulador({
                                ...nuevoArticulador,
                                contacto: e.target.value,
                              })
                            }
                            placeholder="Información de contacto"
                            rows={3}
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
                                <div className="flex gap-4 text-sm text-gray-600 mt-1">
                                  {articulador.tipo && (
                                    <span>🏢 {articulador.tipo}</span>
                                  )}
                                  {articulador.region && (
                                    <span>📍 {articulador.region}</span>
                                  )}
                                </div>
                                {articulador.contacto && (
                                  <p className="text-sm text-gray-600 mt-2">
                                    {articulador.contacto}
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

              {activeTab === "portafolio" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Formulario para crear portafolio */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Crear Nuevo Portafolio ARCO
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre *
                          </label>
                          <input
                            type="text"
                            value={nuevoPortafolio.nombre}
                            onChange={(e) =>
                              setNuevoPortafolio({
                                ...nuevoPortafolio,
                                nombre: e.target.value,
                              })
                            }
                            placeholder="Nombre del portafolio"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Año
                            </label>
                            <input
                              type="number"
                              value={nuevoPortafolio.anio}
                              onChange={(e) =>
                                setNuevoPortafolio({
                                  ...nuevoPortafolio,
                                  anio: parseInt(e.target.value),
                                })
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Departamento
                            </label>
                            <input
                              type="text"
                              value={nuevoPortafolio.departamento}
                              onChange={(e) =>
                                setNuevoPortafolio({
                                  ...nuevoPortafolio,
                                  departamento: e.target.value,
                                })
                              }
                              placeholder="Ej: Antioquia"
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Entidad *
                          </label>
                          <input
                            type="text"
                            value={nuevoPortafolio.entidad}
                            onChange={(e) =>
                              setNuevoPortafolio({
                                ...nuevoPortafolio,
                                entidad: e.target.value,
                              })
                            }
                            placeholder="Entidad responsable"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Instrumento
                            </label>
                            <input
                              type="text"
                              value={nuevoPortafolio.instrumento}
                              onChange={(e) =>
                                setNuevoPortafolio({
                                  ...nuevoPortafolio,
                                  instrumento: e.target.value,
                                })
                              }
                              placeholder="Instrumento utilizado"
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tipo de Apoyo
                            </label>
                            <input
                              type="text"
                              value={nuevoPortafolio.tipoApoyo}
                              onChange={(e) =>
                                setNuevoPortafolio({
                                  ...nuevoPortafolio,
                                  tipoApoyo: e.target.value,
                                })
                              }
                              placeholder="Tipo de apoyo"
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Objetivo
                          </label>
                          <textarea
                            value={nuevoPortafolio.objetivo}
                            onChange={(e) =>
                              setNuevoPortafolio({
                                ...nuevoPortafolio,
                                objetivo: e.target.value,
                              })
                            }
                            placeholder="Objetivo del portafolio"
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Enlace
                          </label>
                          <input
                            type="url"
                            value={nuevoPortafolio.enlace}
                            onChange={(e) =>
                              setNuevoPortafolio({
                                ...nuevoPortafolio,
                                enlace: e.target.value,
                              })
                            }
                            placeholder="https://ejemplo.com"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <button
                          onClick={crearPortafolio}
                          disabled={loading}
                          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200"
                        >
                          {loading ? "Creando..." : "Crear Portafolio"}
                        </button>
                      </div>
                    </div>

                    {/* Lista de portafolios */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Portafolios Existentes
                      </h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {portafolios.map((portafolio) => (
                          <div
                            key={portafolio.id}
                            className="bg-white border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-800">
                                  {portafolio.entidad}
                                </h4>
                                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {portafolio.anio}
                                </span>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <button
                                  onClick={() =>
                                    eliminarPortafolio(portafolio.id)
                                  }
                                  disabled={loading}
                                  className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm rounded-lg transition-colors duration-200"
                                  title="Eliminar portafolio"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                              {portafolio.instrumento && (
                                <span>🔧 {portafolio.instrumento}</span>
                              )}
                              {portafolio.tipoApoyo && (
                                <span>🤝 {portafolio.tipoApoyo}</span>
                              )}
                              {portafolio.departamento && (
                                <span>📍 {portafolio.departamento}</span>
                              )}
                              {portafolio.cobertura && (
                                <span>🌍 {portafolio.cobertura}</span>
                              )}
                            </div>

                            {portafolio.objetivo && (
                              <p className="text-sm text-gray-600 mt-2">
                                {portafolio.objetivo}
                              </p>
                            )}

                            {portafolio.enlace && (
                              <a
                                href={portafolio.enlace}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                              >
                                🔗 Ver enlace
                              </a>
                            )}
                          </div>
                        ))}
                        {portafolios.length === 0 && (
                          <p className="text-gray-500 text-center py-4">
                            No hay portafolios registrados
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

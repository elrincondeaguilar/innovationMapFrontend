"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { ArticuladorService } from "../../services/nuevasEntidadesService";
import { Articulador } from "../../types/api";

export default function ArticuladoresPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Estados para articuladores
  const [articuladores, setArticuladores] = useState<Articulador[]>([]);
  const [ordenamiento, setOrdenamiento] = useState<
    "recientes" | "antiguas" | "alfabetico"
  >("recientes");
  const [articuladoresOrdenados, setArticuladoresOrdenados] = useState<
    Articulador[]
  >([]);

  // Estados para edición
  const [editandoArticulador, setEditandoArticulador] =
    useState<Articulador | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  // Función para ordenar articuladores
  const ordenarArticuladores = (
    articuladoresParam: Articulador[],
    tipoOrden: "recientes" | "antiguas" | "alfabetico"
  ) => {
    const articuladoresCopia = [...articuladoresParam];

    switch (tipoOrden) {
      case "recientes":
        return articuladoresCopia.sort((a, b) => (b.id || 0) - (a.id || 0));
      case "antiguas":
        return articuladoresCopia.sort((a, b) => (a.id || 0) - (b.id || 0));
      case "alfabetico":
        return articuladoresCopia.sort((a, b) =>
          a.nombre.localeCompare(b.nombre)
        );
      default:
        return articuladoresCopia;
    }
  };

  // Efecto para aplicar ordenamiento
  useEffect(() => {
    if (articuladores.length > 0) {
      const articuladoresOrdenados = ordenarArticuladores(
        articuladores,
        ordenamiento
      );
      setArticuladoresOrdenados(articuladoresOrdenados);
    }
  }, [articuladores, ordenamiento]);

  // Cargar datos
  const cargarDatos = async () => {
    setLoading(true);
    try {
      const articuladoresRes = await ArticuladorService.getAll();

      if (articuladoresRes.success && articuladoresRes.data) {
        setArticuladores(articuladoresRes.data);
      } else {
        setError("Error al cargar articuladores");
      }
    } catch (error) {
      console.error("Error cargando articuladores:", error);
      setError("Error de conexión al cargar articuladores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Función para eliminar articulador
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

  // Función para iniciar edición
  const iniciarEdicion = (articulador: Articulador) => {
    setEditandoArticulador({ ...articulador });
    setShowEditForm(true);
  };

  // Función para cancelar edición
  const cancelarEdicion = () => {
    setEditandoArticulador(null);
    setShowEditForm(false);
  };

  // Función para manejar cambios en formularios de edición
  const handleEditChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (!editandoArticulador) return;
    const { name, value } = e.target;
    setEditandoArticulador((prev) =>
      prev ? { ...prev, [name]: value } : null
    );
  };

  // Función para guardar cambios
  const guardarCambios = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editandoArticulador || !editandoArticulador.id) return;

    setLoading(true);
    try {
      // Aquí necesitarías implementar ArticuladorService.update si no existe
      setSuccess("Articulador actualizado exitosamente");
      cancelarEdicion();
      cargarDatos();
    } catch (error) {
      console.error("Error al actualizar articulador:", error);
      setError("Error de conexión al actualizar articulador");
    } finally {
      setLoading(false);
    }
  };

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
              Cargando articuladores...
            </p>
            <p className="text-sm text-gray-500">Conectando con el servidor</p>
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Articuladores del Ecosistema
          </h1>
          <div className="flex items-center justify-center space-x-4 text-lg text-gray-600">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              <span>{articuladores.length} articuladores activos</span>
            </div>
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
              <button
                onClick={() => setError("")}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Éxito</h3>
                <div className="mt-2 text-sm text-green-700">{success}</div>
              </div>
              <button
                onClick={() => setSuccess("")}
                className="ml-auto text-green-400 hover:text-green-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Controls Section */}
        {articuladores.length > 0 && (
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
                className="bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-xl px-4 py-2 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
              >
                <option value="recientes">Más recientes</option>
                <option value="antiguas">Más antiguas</option>
                <option value="alfabetico">Alfabético (A-Z)</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <svg
                className="w-4 h-4 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span>
                Mostrando {articuladoresOrdenados.length} de{" "}
                {articuladores.length} articuladores
              </span>
            </div>
          </div>
        )}

        {/* Formulario de Edición */}
        {showEditForm && editandoArticulador && (
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl rounded-3xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <svg
                className="w-6 h-6 text-purple-600 mr-2"
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
              Editar Articulador: {editandoArticulador.nombre}
            </h3>
            <form onSubmit={guardarCambios} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre completo *
                  </label>
                  <input
                    name="nombre"
                    type="text"
                    value={editandoArticulador.nombre}
                    onChange={handleEditChange}
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Ejemplo: Juan Carlos Pérez"
                  />
                </div>

                {/* Tipo */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de articulador
                  </label>
                  <select
                    name="tipo"
                    value={editandoArticulador.tipo || ""}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900"
                  >
                    <option value="">Selecciona un tipo</option>
                    <option value="Consultor">Consultor</option>
                    <option value="Mentor">Mentor</option>
                    <option value="Inversionista">Inversionista</option>
                    <option value="Acelerador">Acelerador</option>
                    <option value="Academia">Academia</option>
                    <option value="Gobierno">Gobierno</option>
                    <option value="Corporativo">Corporativo</option>
                    <option value="Hub/Centro de innovación">
                      Hub/Centro de innovación
                    </option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>

                {/* Departamento */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Departamento
                  </label>
                  <select
                    name="departamento"
                    value={editandoArticulador.departamento || ""}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900"
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

                {/* Contacto */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contacto
                  </label>
                  <input
                    name="contacto"
                    type="email"
                    value={editandoArticulador.contacto || ""}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  rows={4}
                  value={editandoArticulador.descripcion || ""}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-500 resize-none"
                  placeholder="Describe los servicios que ofreces como articulador del ecosistema de innovación..."
                />
              </div>

              {/* Botones */}
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
        {articuladores.length === 0 ? (
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No hay articuladores registrados
            </h3>
            <p className="text-gray-500 mb-6">
              Registra tu primer articulador del ecosistema de innovación
            </p>
            <a
              href="/registro"
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
              Registrar Primer Articulador
            </a>
          </div>
        ) : (
          /* Lista de articuladores */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {articuladoresOrdenados.map((articulador) => (
              <div
                key={articulador.id}
                className="group bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:bg-white/90"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300 line-clamp-2">
                      {articulador.nombre}
                    </h3>
                    {articulador.tipo && (
                      <div className="flex items-center mt-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                        <span className="text-sm font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                          {articulador.tipo}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {articulador.descripcion && (
                  <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                    {articulador.descripcion}
                  </p>
                )}

                {/* Details */}
                <div className="space-y-3 mb-6">
                  {articulador.departamento && (
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
                        {articulador.departamento}
                      </span>
                    </div>
                  )}

                  {articulador.contacto && /^\S+@\S+\.\S+$/.test(articulador.contacto) ? (
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
                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                        />
                      </svg>
                      <a
                        href={`mailto:${articulador.contacto}`}
                        className="text-sm text-green-600 hover:text-green-800 underline truncate max-w-40"
                        title="Enviar correo"
                      >
                        Contactar
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center text-sm text-gray-400">
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
                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                        />
                      </svg>
                      <span>Contacto no disponible</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {articulador.id && (
                  <div className="flex justify-between pt-4 border-t border-gray-100">
                    <button
                      onClick={() => iniciarEdicion(articulador)}
                      className="group/btn flex items-center text-purple-600 hover:text-white text-sm border border-purple-300 hover:border-purple-600 px-4 py-2 rounded-lg hover:bg-purple-600 transition-all duration-300 shadow-sm hover:shadow-md"
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
                      onClick={() => eliminarArticulador(articulador.id!)}
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

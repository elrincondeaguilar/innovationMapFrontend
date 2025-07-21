"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { ArticuladorService } from "../../services/nuevasEntidadesService";
import { Articulador, CreateArticuladorRequest } from "../../types/api";

// Definir un tipo para los datos del scraping
interface ScrapedArticulador {
  instrumento: string;
  tipo_de_instrumento: string;
  cobertura: string;
  p_gina_web_del_instrumento: string;
  anio_corte: string;
  cod: string;
  sector: string;
  entidad_que_oferta_el_instrumento: string;
  instrumentos_ofertados: string;
  antiguedad_de_la_oferta: string;
  descripci_n_del_instrumento: string;
  usuarios_emprendedores: string;
  usuarios_mipymes: string;
  usuarios_grandes_empresas: string;
  usuarios_academia: string;
  usuarios_entidades_del_gobierno: string;
  usuarios_organizaciones_de_soporte: string;
  usuarios_personas_naturales: string;
  apoyo_financiero_recursos_monetarios: string;
  asistencia_t_cnica_asesor_a_acompa_amiento_consultor_a_o_mentor_a: string;
  formaci_n_del_talento_humano_capacitaci_n_entrenamiento_y_desarrollo_de_competencias: string;
  incentivos_tributarios: string;
  eventos_de_promoci_n_y_visibilizaci_n: string;
  compra_p_blica_para_la_innovaci_n: string;
  redes_de_colaboraci_n_y_networking: string;
  bonos_bouchers_para_servicios_de_innovaci_n: string;
  sistemas_de_informaci_n_y_vigilancia_tecnol_gica_e_inteligencia_de_negocios: string;
  premios_y_reconocimientos: string;
  instrumentos_regulatorios_y_normativos: string;
  fecha_de_apertura: string;
  fecha_de_cierre: string;
  departamentos_y_o_municipios_beneficiados: string;
}

type TabType = "articuladores" | "scraping";

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

  // Estados para scraping
  const [scrapingYear, setScrapingYear] = useState<string>("");
  const [scrapedData, setScrapedData] = useState<ScrapedArticulador[]>([]);
  const [scrapingLoading, setScrapingLoading] = useState(false);
  const [scrapingError, setScrapingError] = useState<string>("");

  // Cargar datos
  const cargarDatos = async () => {
    setLoading(true);
    try {
      const articuladoresRes = await ArticuladorService.getAll();

      if (articuladoresRes.success && articuladoresRes.data) {
        setArticuladores(articuladoresRes.data);
      }
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError("Error cargando datos del ecosistema");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "articuladores") {
      cargarDatos();
    }
  }, [activeTab]);

  // Funciones para crear entidades
  const crearArticulador = async (articuladorData: CreateArticuladorRequest) => {
    if (!articuladorData.nombre.trim()) {
      setError("El nombre es requerido");
      return;
    }

    setLoading(true);
    try {
      const resultado = await ArticuladorService.create(articuladorData);
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
    } catch (err) {
      setError(
        `Error inesperado: ${
          err instanceof Error ? err.message : "Error desconocido"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Funciones para scraping
  const handleScrape = async () => {
    setScrapingLoading(true);
    setScrapingError("");
    setScrapedData([]);
    try {
      const response = await fetch(`/api/scrape/arco?year=${scrapingYear}`);
      const result = await response.json();

      if (result.success) {
        setScrapedData(result.data);
      } else {
        setScrapingError(result.message || "Error en el scraping");
      }
    } catch {
      setScrapingError("Error de red o en el servidor");
    } finally {
      setScrapingLoading(false);
    }
  };

  const handleSaveScrapedArticulador = (scrapedItem: ScrapedArticulador) => {
    const newArticulador: CreateArticuladorRequest = {
      nombre: scrapedItem.instrumento,
      tipo: scrapedItem.tipo_de_instrumento,
      region: scrapedItem.cobertura,
      contacto: scrapedItem.p_gina_web_del_instrumento,
      // --- CAMPOS EXTENDIDOS ---
      Anio: parseInt(scrapedItem.anio_corte, 10),
      Codigo: scrapedItem.cod,
      Sector: scrapedItem.sector,
      Entidad: scrapedItem.entidad_que_oferta_el_instrumento,
      InstrumentosOfertados: scrapedItem.instrumentos_ofertados,
      AntiguedadOferta: parseInt(scrapedItem.antiguedad_de_la_oferta, 10),
      Pagina: scrapedItem.p_gina_web_del_instrumento,
      Descripcion: scrapedItem.descripci_n_del_instrumento,
      UsuariosEmprendedores: scrapedItem.usuarios_emprendedores,
      UsuariosMiPymes: scrapedItem.usuarios_mipymes,
      UsuariosGrandesEmpresas: scrapedItem.usuarios_grandes_empresas,
      UsuariosAcademia: scrapedItem.usuarios_academia,
      UsuariosEntidadesGobierno: scrapedItem.usuarios_entidades_del_gobierno,
      UsuariosOrganizacionesSoporte: scrapedItem.usuarios_organizaciones_de_soporte,
      UsuariosPersonasNaturales: scrapedItem.usuarios_personas_naturales,
      ApoyoFinanciero: scrapedItem.apoyo_financiero_recursos_monetarios === 'Sí',
      AsistenciaTecnica: scrapedItem.asistencia_t_cnica_asesor_a_acompa_amiento_consultor_a_o_mentor_a === 'Sí',
      FormacionTalentoHumano: scrapedItem.formaci_n_del_talento_humano_capacitaci_n_entrenamiento_y_desarrollo_de_competencias === 'Sí',
      IncentivosTributarios: scrapedItem.incentivos_tributarios === 'Sí',
      Eventos: scrapedItem.eventos_de_promoci_n_y_visibilizaci_n === 'Sí',
      CompraPublica: scrapedItem.compra_p_blica_para_la_innovaci_n === 'Sí',
      RedesColaboracion: scrapedItem.redes_de_colaboraci_n_y_networking === 'Sí',
      BonosBouchers: scrapedItem.bonos_bouchers_para_servicios_de_innovaci_n === 'Sí',
      SistemasInformacion: scrapedItem.sistemas_de_informaci_n_y_vigilancia_tecnol_gica_e_inteligencia_de_negocios === 'Sí',
      PremiosReconocimientos: scrapedItem.premios_y_reconocimientos === 'Sí',
      InstrumentosRegulatorios: scrapedItem.instrumentos_regulatorios_y_normativos === 'Sí',
      FechaApertura: scrapedItem.fecha_de_apertura ? new Date(scrapedItem.fecha_de_apertura) : undefined,
      FechaCierre: scrapedItem.fecha_de_cierre ? new Date(scrapedItem.fecha_de_cierre) : undefined,
      Cobertura: scrapedItem.cobertura,
      DepartamentosMunicipios: scrapedItem.departamentos_y_o_municipios_beneficiados,
    };
    crearArticulador(newArticulador);
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
                <button
                  onClick={() => {
                    setActiveTab("scraping");
                    limpiarMensajes();
                  }}
                  className={`px-6 py-4 text-sm font-medium ${
                    activeTab === "scraping"
                      ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  🔍 Scrape
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
                          onClick={() => crearArticulador(nuevoArticulador)}
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
              {activeTab === "scraping" && (
                <div className="space-y-8">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Scraping de Articuladores (ArCo)
                    </h3>
                    <div className="flex items-center space-x-4">
                      <input
                        type="number"
                        value={scrapingYear}
                        onChange={(e) => setScrapingYear(e.target.value)}
                        placeholder="Año"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                      />
                      <button
                        onClick={handleScrape}
                        disabled={scrapingLoading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200"
                      >
                        {scrapingLoading ? "Buscando..." : "Buscar"}
                      </button>
                    </div>
                  </div>

                  {scrapingError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-red-700 text-sm">{scrapingError}</p>
                    </div>
                  )}

                  {scrapedData.length > 0 && (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {scrapedData.map((item, index) => (
                        <div
                          key={index}
                          className="bg-white border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800">
                                {item.instrumento}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Entidad: {item.entidad_que_oferta_el_instrumento}
                              </p>
                              <p className="text-sm text-gray-600">
                                Cobertura: {item.cobertura}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => handleSaveScrapedArticulador(item)}
                                disabled={loading}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm rounded-lg transition-colors duration-200"
                                title="Guardar articulador"
                              >
                                Guardar
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState, useCallback } from "react";
import { backendService } from "../services/backendService";
import { PromotorService, ArticuladorService, PortafolioArcoService } from "../services/nuevasEntidadesService";
import { Empresa, Promotor, Articulador, PortafolioArco } from "../types/api";
import { useRouter } from "next/navigation";

// Configurar iconos por defecto de Leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Función para obtener coordenadas por departamento
const getCoordinatesByDepartment = (department: string): [number, number] => {
  const coordinates: Record<string, [number, number]> = {
    Antioquia: [6.2442, -75.5812],
    Cundinamarca: [4.711, -74.0721],
    "Valle del Cauca": [3.4516, -76.532],
    Atlántico: [10.7964, -74.7803],
    Santander: [7.1253, -73.1198],
    Bolívar: [10.391, -75.4794],
    Caldas: [5.07, -75.5138],
    Risaralda: [4.8087, -75.6906],
    Quindío: [4.4611, -75.6764],
    Boyacá: [5.4545, -73.3611],
    Tolima: [4.4389, -75.2322],
    Huila: [2.9273, -75.2819],
    Meta: [4.142, -73.6266],
    Nariño: [1.2136, -77.2811],
    Cauca: [2.4448, -76.6147],
    Córdoba: [8.748, -75.8814],
    Sucre: [9.3019, -75.3975],
    Magdalena: [10.4167, -74.4167],
    Cesar: [9.3333, -73.6667],
    "La Guajira": [11.5444, -72.9072],
    "Norte de Santander": [7.8939, -72.5078],
    Chocó: [5.6919, -76.6583],
    Caquetá: [1.6144, -75.6062],
    Putumayo: [0.8292, -76.2939],
    Casanare: [5.7597, -72.0378],
    Arauca: [7.0833, -70.7333],
    Vichada: [4.4269, -69.2411],
    Guainía: [2.5667, -67.8833],
    Vaupés: [1.25, -70.2333],
    Amazonas: [-1.0, -71.0],
    Guaviare: [2.5833, -72.6667],
    "San Andrés": [12.5847, -81.7006],
  };

  return coordinates[department] || [4.5709, -74.2973];
};

// Crear un icono personalizado con número
const createNumberedIcon = (count: number) => {
  return L.divIcon({
    html: `<div style="
      background: linear-gradient(135deg, #3B82F6, #1D4ED8);
      color: white;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 12px;
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">${count}</div>`,
    className: "numbered-marker",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

// Crear iconos personalizados para cada tipo de entidad
const createEntityIcon = (type: 'empresa' | 'promotor' | 'articulador' | 'portafolio', emoji: string, color: string) => {
  return L.divIcon({
    html: `<div style="
      background: ${color};
      color: white;
      border-radius: 50%;
      width: 35px;
      height: 35px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 16px;
      border: 3px solid white;
      box-shadow: 0 3px 10px rgba(0,0,0,0.3);
    ">${emoji}</div>`,
    className: `${type}-marker`,
    iconSize: [35, 35],
    iconAnchor: [17.5, 17.5],
  });
};

// Iconos específicos para cada tipo
const ENTITY_ICONS = {
  empresa: createEntityIcon('empresa', '🏢', 'linear-gradient(135deg, #3B82F6, #1D4ED8)'),
  promotor: createEntityIcon('promotor', '📢', 'linear-gradient(135deg, #EF4444, #DC2626)'),
  articulador: createEntityIcon('articulador', '🤝', 'linear-gradient(135deg, #10B981, #059669)'),
  portafolio: createEntityIcon('portafolio', '📊', 'linear-gradient(135deg, #8B5CF6, #7C3AED)'),
};

// Componente para controlar el mapa
function MapController({
  empresaEspecifica,
  soloEmpresaEspecifica,
}: {
  empresaEspecifica?: Empresa | null;
  soloEmpresaEspecifica?: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (empresaEspecifica && soloEmpresaEspecifica) {
      const coordinates = getCoordinatesByDepartment(
        empresaEspecifica.department
      );
      map.setView(coordinates, 10, { animate: true });
    } else {
      map.setView([4.5709, -74.2973], 6, { animate: true });
    }
  }, [empresaEspecifica, soloEmpresaEspecifica, map]);

  return null;
}

// Props para el componente
interface MapaProps {
  empresaEspecifica?: Empresa | null;
  soloEmpresaEspecifica?: boolean;
}

export default function MapaSimple({
  empresaEspecifica,
  soloEmpresaEspecifica,
}: MapaProps) {
  const router = useRouter();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresasFiltradas, setEmpresasFiltradas] = useState<Empresa[]>([]);
  
  // Estados para nuevas entidades
  const [promotores, setPromotores] = useState<Promotor[]>([]);
  const [articuladores, setArticuladores] = useState<Articulador[]>([]);
  const [portafolios, setPortafolios] = useState<PortafolioArco[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para filtros
  const [filtroSector, setFiltroSector] = useState<string>("");
  const [filtroDepartamento, setFiltroDepartamento] = useState<string>("");
  const [busquedaTexto, setBusquedaTexto] = useState<string>("");
  
  // Estados para filtros por tipo de entidad
  const [mostrarEmpresas, setMostrarEmpresas] = useState<boolean>(true);
  const [mostrarPromotores, setMostrarPromotores] = useState<boolean>(true);
  const [mostrarArticuladores, setMostrarArticuladores] = useState<boolean>(true);
  const [mostrarPortafolios, setMostrarPortafolios] = useState<boolean>(true);

  useEffect(() => {
    const cargarTodasLasEntidades = async () => {
      try {
        setLoading(true);
        
        // Cargar todas las entidades en paralelo
        const [
          resultadoEmpresas,
          resultadoPromotores,
          resultadoArticuladores,
          resultadoPortafolios
        ] = await Promise.all([
          backendService.get<Empresa[]>("companies"),
          PromotorService.getAll(),
          ArticuladorService.getAll(),
          PortafolioArcoService.getAll()
        ]);

        // Procesar resultados de empresas
        if (resultadoEmpresas.success && resultadoEmpresas.data) {
          setEmpresas(resultadoEmpresas.data);
          setEmpresasFiltradas(resultadoEmpresas.data);
        }

        // Procesar resultados de promotores
        if (resultadoPromotores.success && resultadoPromotores.data) {
          setPromotores(resultadoPromotores.data);
        }

        // Procesar resultados de articuladores
        if (resultadoArticuladores.success && resultadoArticuladores.data) {
          setArticuladores(resultadoArticuladores.data);
        }

        // Procesar resultados de portafolios
        if (resultadoPortafolios.success && resultadoPortafolios.data) {
          setPortafolios(resultadoPortafolios.data);
        }

        // Verificar si hubo errores
        const errors = [
          !resultadoEmpresas.success && resultadoEmpresas.message,
          !resultadoPromotores.success && resultadoPromotores.message,
          !resultadoArticuladores.success && resultadoArticuladores.message,
          !resultadoPortafolios.success && resultadoPortafolios.message,
        ].filter(Boolean);

        if (errors.length > 0) {
          console.warn("Algunos servicios fallaron:", errors);
          setError(`Advertencia: ${errors.join(", ")}`);
        }

      } catch (error) {
        console.error("Error cargando entidades:", error);
        setError("Error de conexión al cargar datos del ecosistema");
      } finally {
        setLoading(false);
      }
    };

    cargarTodasLasEntidades();
  }, []);

  // Función para aplicar filtros
  const aplicarFiltros = useCallback(() => {
    let filtered = [...empresas];

    if (filtroSector) {
      filtered = filtered.filter((empresa) =>
        empresa.sector.toLowerCase().includes(filtroSector.toLowerCase())
      );
    }

    if (filtroDepartamento) {
      filtered = filtered.filter((empresa) =>
        empresa.department
          .toLowerCase()
          .includes(filtroDepartamento.toLowerCase())
      );
    }

    if (busquedaTexto) {
      filtered = filtered.filter(
        (empresa) =>
          empresa.name.toLowerCase().includes(busquedaTexto.toLowerCase()) ||
          empresa.description
            ?.toLowerCase()
            .includes(busquedaTexto.toLowerCase())
      );
    }

    setEmpresasFiltradas(filtered);
  }, [empresas, filtroSector, filtroDepartamento, busquedaTexto]);

  // Efectos para manejar empresa específica
  useEffect(() => {
    if (empresaEspecifica && soloEmpresaEspecifica) {
      setEmpresasFiltradas([empresaEspecifica]);
      setFiltroDepartamento(empresaEspecifica.department);
      setFiltroSector("");
      setBusquedaTexto("");
    } else if (!soloEmpresaEspecifica) {
      aplicarFiltros();
    }
  }, [empresaEspecifica, soloEmpresaEspecifica, aplicarFiltros]);

  // Efecto para filtrar empresas
  useEffect(() => {
    if (!soloEmpresaEspecifica) {
      aplicarFiltros();
    }
  }, [aplicarFiltros, soloEmpresaEspecifica]);

  // Función para contar empresas por departamento
  const contarEmpresasPorDepartamento = () => {
    const contador: Record<string, number> = {};
    const empresasParaContar =
      soloEmpresaEspecifica && empresaEspecifica
        ? [empresaEspecifica]
        : empresasFiltradas;

    if (mostrarEmpresas) {
      empresasParaContar.forEach((empresa) => {
        contador[empresa.department] = (contador[empresa.department] || 0) + 1;
      });
    }
    return contador;
  };

  // Función para obtener marcadores de promotores  
  const getMarcadoresPromotores = () => {
    if (!mostrarPromotores) return [];
    
    // Para promotores, como no tienen ubicación específica, los distribuimos por Colombia
    const departamentosDistribucion = ['Antioquia', 'Cundinamarca', 'Valle del Cauca', 'Atlántico'];
    
    return promotores.map((promotor, index) => {
      const departamento = departamentosDistribucion[index % departamentosDistribucion.length];
      const baseCoords = getCoordinatesByDepartment(departamento);
      // Agregar un pequeño offset para evitar superposición
      const coords: [number, number] = [
        baseCoords[0] + (Math.random() - 0.5) * 0.1,
        baseCoords[1] + (Math.random() - 0.5) * 0.1
      ];
      
      return { ...promotor, coordinates: coords, type: 'promotor' as const };
    });
  };

  // Función para obtener marcadores de articuladores
  const getMarcadoresArticuladores = () => {
    if (!mostrarArticuladores) return [];
    
    return articuladores.map((articulador) => {
      // Usar la región si está disponible, sino usar un departamento por defecto
      const departamento = articulador.region || 'Cundinamarca';
      const baseCoords = getCoordinatesByDepartment(departamento);
      const coords: [number, number] = [
        baseCoords[0] + (Math.random() - 0.5) * 0.1,
        baseCoords[1] + (Math.random() - 0.5) * 0.1
      ];
      
      return { ...articulador, coordinates: coords, type: 'articulador' as const };
    });
  };

  // Función para obtener marcadores de portafolios ARCO
  const getMarcadoresPortafolios = () => {
    if (!mostrarPortafolios) return [];
    
    return portafolios.map((portafolio) => {
      const departamento = portafolio.departamento || 'Cundinamarca';
      const baseCoords = getCoordinatesByDepartment(departamento);
      const coords: [number, number] = [
        baseCoords[0] + (Math.random() - 0.5) * 0.1,
        baseCoords[1] + (Math.random() - 0.5) * 0.1
      ];
      
      return { ...portafolio, coordinates: coords, type: 'portafolio' as const };
    });
  };

  const empresasPorDepartamento = contarEmpresasPorDepartamento();

  // Obtener valores únicos para filtros
  const sectoresUnicos = [...new Set(empresas.map((e) => e.sector))].sort();
  const departamentosUnicos = [
    ...new Set(empresas.map((e) => e.department)),
  ].sort();

  const limpiarFiltros = () => {
    setFiltroSector("");
    setFiltroDepartamento("");
    setBusquedaTexto("");
    setMostrarEmpresas(true);
    setMostrarPromotores(true);
    setMostrarArticuladores(true);
    setMostrarPortafolios(true);
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando empresas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-6">
          <div className="text-red-600 mb-4">
            <svg
              className="w-12 h-12 mx-auto mb-2"
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
          <p className="text-red-600 font-medium">
            Error al cargar las empresas
          </p>
          <p className="text-gray-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Panel de filtros (solo si no es empresa específica) */}
      {!soloEmpresaEspecifica && (
        <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-white/20 shadow-xl overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Header del panel */}
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full text-blue-800 text-sm font-medium mb-3">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    clipRule="evenodd"
                  />
                </svg>
                Filtros Avanzados
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                Explorar Empresas
              </h3>
            </div>

            {/* Contador de resultados */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-800 mb-1">
                  {empresasFiltradas.length}
                </div>
                <div className="text-sm text-blue-600 mb-2">
                  de {empresas.length} empresas
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        empresas.length > 0
                          ? (empresasFiltradas.length / empresas.length) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                🔍 Buscar empresa
              </label>
              <input
                type="text"
                value={busquedaTexto}
                onChange={(e) => setBusquedaTexto(e.target.value)}
                placeholder="Nombre o descripción..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Filtro por sector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                🏢 Sector empresarial
              </label>
              <select
                value={filtroSector}
                onChange={(e) => setFiltroSector(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="">Todos los sectores</option>
                {sectoresUnicos.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por departamento */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📍 Ubicación geográfica
              </label>
              <select
                value={filtroDepartamento}
                onChange={(e) => setFiltroDepartamento(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="">Todos los departamentos</option>
                {departamentosUnicos.map((departamento) => (
                  <option key={departamento} value={departamento}>
                    {departamento}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtros de tipo de entidad */}
            <div className="bg-white/40 rounded-xl p-4 border border-white/60">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                🌐 Tipos de entidades visibles
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={mostrarEmpresas}
                    onChange={(e) => setMostrarEmpresas(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">🏢 Empresas ({empresas.length})</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={mostrarPromotores}
                    onChange={(e) => setMostrarPromotores(e.target.checked)}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">📢 Promotores ({promotores.length})</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={mostrarArticuladores}
                    onChange={(e) => setMostrarArticuladores(e.target.checked)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">🤝 Articuladores ({articuladores.length})</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={mostrarPortafolios}
                    onChange={(e) => setMostrarPortafolios(e.target.checked)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">📊 Portafolio ARCO ({portafolios.length})</span>
                </label>
              </div>
            </div>

            {/* Botón limpiar filtros */}
            <button
              onClick={limpiarFiltros}
              disabled={!filtroSector && !filtroDepartamento && !busquedaTexto}
              className="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 disabled:from-gray-50 disabled:to-gray-100 text-gray-700 disabled:text-gray-400 px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center disabled:cursor-not-allowed"
            >
              🗑️ Limpiar filtros
            </button>

            {/* Lista de empresas */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                📋 Empresas visibles ({empresasFiltradas.length})
              </h4>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {empresasFiltradas.map((empresa) => (
                  <div
                    key={empresa.id}
                    className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 hover:bg-white/80 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900 text-sm">
                          {empresa.name}
                        </h5>
                        <div className="flex items-center mt-1 space-x-2">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {empresa.sector}
                          </span>
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                            {empresa.department}
                          </span>
                        </div>
                        {empresa.description && (
                          <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                            {empresa.description}
                          </p>
                        )}

                        {/* Botón Ver en mapa */}
                        <div className="mt-3">
                          <button
                            onClick={() => {
                              const searchParams = new URLSearchParams();
                              searchParams.set(
                                "empresaId",
                                empresa.id?.toString() || ""
                              );
                              searchParams.set("empresaNombre", empresa.name);
                              searchParams.set("empresaSector", empresa.sector);
                              searchParams.set(
                                "empresaDepartamento",
                                empresa.department
                              );
                              if (empresa.description)
                                searchParams.set(
                                  "empresaDescripcion",
                                  empresa.description
                                );
                              if (empresa.url)
                                searchParams.set("empresaUrl", empresa.url);
                              router.push(`/mapa?${searchParams.toString()}`);
                            }}
                            className="inline-flex items-center text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors duration-200"
                          >
                            📍 Ver en mapa
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mapa */}
      <div className="flex-1 relative">
        <MapContainer
          center={[4.5709, -74.2973]}
          zoom={6}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <MapController
            empresaEspecifica={empresaEspecifica}
            soloEmpresaEspecifica={soloEmpresaEspecifica}
          />

          {soloEmpresaEspecifica && empresaEspecifica ? (
            // Modo empresa específica
            <Marker
              key={empresaEspecifica.id}
              position={getCoordinatesByDepartment(
                empresaEspecifica.department
              )}
            >
              <Popup>
                <div className="p-3 min-w-[250px]">
                  <div className="text-center mb-3">
                    <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium mb-2">
                      🎯 Empresa Seleccionada
                    </div>
                  </div>
                  <strong className="text-lg text-blue-900">
                    {empresaEspecifica.name}
                  </strong>
                  <br />
                  <span className="text-blue-600 font-medium">
                    {empresaEspecifica.sector}
                  </span>
                  <br />
                  <span className="text-gray-600">
                    {empresaEspecifica.department}
                  </span>
                  {empresaEspecifica.description && (
                    <>
                      <br />
                      <p className="mt-2 text-sm leading-relaxed">
                        {empresaEspecifica.description}
                      </p>
                    </>
                  )}
                  {empresaEspecifica.url && (
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <a
                        href={empresaEspecifica.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        🌐 Visitar sitio web
                      </a>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ) : (
            // Modo normal: marcadores con números por departamento
            Object.entries(empresasPorDepartamento).map(
              ([departamento, count]) => {
                const coordinates = getCoordinatesByDepartment(departamento);
                const empresasDelDepartamento = empresasFiltradas.filter(
                  (e) => e.department === departamento
                );

                return (
                  <Marker
                    key={departamento}
                    position={coordinates}
                    icon={createNumberedIcon(count)}
                  >
                    <Popup>
                      <div className="p-3 min-w-[280px]">
                        <div className="text-center mb-3">
                          <h3 className="text-lg font-bold text-gray-900">
                            {departamento}
                          </h3>
                          <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            🏢 {count} {count === 1 ? "empresa" : "empresas"}
                          </div>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {empresasDelDepartamento
                            .slice(0, 5)
                            .map((empresa) => (
                              <div
                                key={empresa.id}
                                className="p-2 bg-gray-50 rounded-lg border"
                              >
                                <div className="font-medium text-sm text-gray-900">
                                  {empresa.name}
                                </div>
                                <div className="text-xs text-blue-600">
                                  {empresa.sector}
                                </div>
                                {empresa.description && (
                                  <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                                    {empresa.description}
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>

                        {count > 5 && (
                          <div className="text-center mt-2 pt-2 border-t border-gray-200">
                            <span className="text-xs text-gray-500">
                              Y {count - 5} empresas más en este departamento
                            </span>
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              }
            )
          )}

          {/* Marcadores para Promotores */}
          {!soloEmpresaEspecifica && getMarcadoresPromotores().map((promotor) => (
            <Marker
              key={`promotor-${promotor.id}`}
              position={promotor.coordinates}
              icon={ENTITY_ICONS.promotor}
            >
              <Popup>
                <div className="p-3 min-w-[250px]">
                  <div className="text-center mb-3">
                    <div className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium mb-2">
                      📢 Promotor
                    </div>
                  </div>
                  <strong className="text-lg text-red-900">{promotor.medio}</strong>
                  
                  {promotor.descripcion && (
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                      {promotor.descripcion}
                    </p>
                  )}
                  
                  {promotor.enlace && (
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <a
                        href={promotor.enlace}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        🔗 Ver enlace
                      </a>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Marcadores para Articuladores */}
          {!soloEmpresaEspecifica && getMarcadoresArticuladores().map((articulador) => (
            <Marker
              key={`articulador-${articulador.id}`}
              position={articulador.coordinates}
              icon={ENTITY_ICONS.articulador}
            >
              <Popup>
                <div className="p-3 min-w-[250px]">
                  <div className="text-center mb-3">
                    <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium mb-2">
                      🤝 Articulador
                    </div>
                  </div>
                  <strong className="text-lg text-green-900">{articulador.nombre}</strong>
                  
                  <div className="flex gap-2 mt-2">
                    {articulador.tipo && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        🏢 {articulador.tipo}
                      </span>
                    )}
                    {articulador.region && (
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                        📍 {articulador.region}
                      </span>
                    )}
                  </div>
                  
                  {articulador.contacto && (
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                      📞 {articulador.contacto}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Marcadores para Portafolio ARCO */}
          {!soloEmpresaEspecifica && getMarcadoresPortafolios().map((portafolio) => (
            <Marker
              key={`portafolio-${portafolio.id}`}
              position={portafolio.coordinates}
              icon={ENTITY_ICONS.portafolio}
            >
              <Popup>
                <div className="p-3 min-w-[280px]">
                  <div className="text-center mb-3">
                    <div className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium mb-2">
                      📊 Portafolio ARCO
                    </div>
                  </div>
                  <strong className="text-lg text-purple-900">{portafolio.entidad}</strong>
                  
                  <div className="flex gap-1 mt-2 flex-wrap">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      📅 {portafolio.anio}
                    </span>
                    {portafolio.instrumento && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        🔧 {portafolio.instrumento}
                      </span>
                    )}
                    {portafolio.departamento && (
                      <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded-full">
                        📍 {portafolio.departamento}
                      </span>
                    )}
                  </div>
                  
                  {portafolio.tipoApoyo && (
                    <p className="mt-2 text-sm text-gray-600">
                      <strong>Tipo de apoyo:</strong> {portafolio.tipoApoyo}
                    </p>
                  )}
                  
                  {portafolio.objetivo && (
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                      <strong>Objetivo:</strong> {portafolio.objetivo.length > 100 
                        ? `${portafolio.objetivo.substring(0, 100)}...` 
                        : portafolio.objetivo}
                    </p>
                  )}
                  
                  {portafolio.enlace && (
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <a
                        href={portafolio.enlace}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-purple-600 hover:text-purple-800 text-sm font-medium"
                      >
                        🔗 Ver enlace
                      </a>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

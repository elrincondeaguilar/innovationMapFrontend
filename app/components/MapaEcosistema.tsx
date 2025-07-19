"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState, useCallback } from "react";
import { backendService, EmpresaService } from "../services/backendService";
import { 
  PromotorService, 
  ArticuladorService, 
  PortafolioArcoService 
} from "../services/nuevasEntidadesService";
import { 
  Empresa, 
  Promotor, 
  Articulador, 
  PortafolioArco 
} from "../types/api";
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

// Función para obtener coordenadas por región (para articuladores)
const getCoordinatesByRegion = (region: string): [number, number] => {
  const regionCoordinates: Record<string, [number, number]> = {
    Nacional: [4.5709, -74.2973], // Bogotá como centro nacional
    Bogotá: [4.711, -74.0721],
    Medellín: [6.2442, -75.5812],
    Cali: [3.4516, -76.532],
    Barranquilla: [10.7964, -74.7803],
    Bucaramanga: [7.1253, -73.1198],
    Cartagena: [10.391, -75.4794],
    Pereira: [4.8087, -75.6906],
    Manizales: [5.07, -75.5138],
    Armenia: [4.4611, -75.6764],
    Ibagué: [4.4389, -75.2322],
    Neiva: [2.9273, -75.2819],
    Villavicencio: [4.142, -73.6266],
    Pasto: [1.2136, -77.2811],
    Popayán: [2.4448, -76.6147],
    Montería: [8.748, -75.8814],
    Sincelejo: [9.3019, -75.3975],
    "Santa Marta": [11.2408, -74.1990],
    Valledupar: [10.4806, -73.2381],
    Riohacha: [11.5444, -72.9072],
    Cúcuta: [7.8939, -72.5078],
    Quibdó: [5.6919, -76.6583],
    Florencia: [1.6144, -75.6062],
    Mocoa: [1.1533, -76.6511],
    Yopal: [5.3475, -72.3958],
    Arauca: [7.0833, -70.7333],
  };

  return regionCoordinates[region] || getCoordinatesByDepartment(region);
};

// Crear iconos personalizados para cada tipo de entidad
const createCustomIcon = (type: 'empresa' | 'promotor' | 'articulador' | 'portafolio', count?: number) => {
  const configs = {
    empresa: { color: '#3B82F6', emoji: '🏢' },
    promotor: { color: '#10B981', emoji: '📢' },
    articulador: { color: '#8B5CF6', emoji: '🤝' },
    portafolio: { color: '#F59E0B', emoji: '📊' }
  };

  const config = configs[type];
  const displayText = count && count > 1 ? count.toString() : config.emoji;

  return L.divIcon({
    html: `<div style="
      background: ${config.color};
      color: white;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: ${count && count > 1 ? '12px' : '16px'};
      border: 3px solid white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    ">${displayText}</div>`,
    className: `${type}-marker`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

interface FiltrosActivos {
  empresas: boolean;
  promotores: boolean;
  articuladores: boolean;
  portafolio: boolean;
}

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
      map.setView(coordinates, 10);
    } else {
      // Vista general de Colombia
      map.setView([4.5709, -74.2973], 6);
    }
  }, [map, empresaEspecifica, soloEmpresaEspecifica]);

  return null;
}

interface MapaEcosistemaProps {
  empresaEspecifica?: Empresa | null;
  soloEmpresaEspecifica?: boolean;
  filtrosActivos: FiltrosActivos;
}

export default function MapaEcosistema({
  empresaEspecifica,
  soloEmpresaEspecifica,
  filtrosActivos,
}: MapaEcosistemaProps) {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [promotores, setPromotores] = useState<Promotor[]>([]);
  const [articuladores, setArticuladores] = useState<Articulador[]>([]);
  const [portafolios, setPortafolios] = useState<PortafolioArco[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Cargar datos del ecosistema
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [empresasRes, promotoresRes, articuladoresRes, portafoliosRes] = await Promise.all([
        EmpresaService.obtenerEmpresas(),
        PromotorService.getAll(),
        ArticuladorService.getAll(),
        PortafolioArcoService.getAll()
      ]);

      if (empresasRes.success && empresasRes.data) {
        setEmpresas(empresasRes.data);
      }
      
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
      console.error("Error cargando datos del ecosistema:", error);
      setError("Error al cargar los datos del ecosistema");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Agrupar entidades por ubicación para evitar solapamiento
  const agruparPorUbicacion = () => {
    const grupos: Record<string, {
      coords: [number, number];
      empresas: Empresa[];
      promotores: Promotor[];
      articuladores: Articulador[];
      portafolios: PortafolioArco[];
    }> = {};

    // Procesar empresas
    if (filtrosActivos.empresas) {
      const empresasAMostrar = soloEmpresaEspecifica && empresaEspecifica 
        ? [empresaEspecifica] 
        : empresas;

      empresasAMostrar.forEach(empresa => {
        const coords = getCoordinatesByDepartment(empresa.department);
        const key = `${coords[0]}_${coords[1]}`;
        
        if (!grupos[key]) {
          grupos[key] = {
            coords,
            empresas: [],
            promotores: [],
            articuladores: [],
            portafolios: []
          };
        }
        grupos[key].empresas.push(empresa);
      });
    }

    // Procesar promotores (ubicación genérica nacional)
    if (filtrosActivos.promotores) {
      promotores.forEach(promotor => {
        const coords: [number, number] = [4.5709, -74.2973]; // Bogotá como centro
        const key = `${coords[0]}_${coords[1]}_promotor`;
        
        if (!grupos[key]) {
          grupos[key] = {
            coords,
            empresas: [],
            promotores: [],
            articuladores: [],
            portafolios: []
          };
        }
        grupos[key].promotores.push(promotor);
      });
    }

    // Procesar articuladores
    if (filtrosActivos.articuladores) {
      articuladores.forEach(articulador => {
        const coords = getCoordinatesByRegion(articulador.region || 'Nacional');
        const key = `${coords[0]}_${coords[1]}_articulador`;
        
        if (!grupos[key]) {
          grupos[key] = {
            coords,
            empresas: [],
            promotores: [],
            articuladores: [],
            portafolios: []
          };
        }
        grupos[key].articuladores.push(articulador);
      });
    }

    // Procesar portafolios
    if (filtrosActivos.portafolio) {
      portafolios.forEach(portafolio => {
        const coords = getCoordinatesByDepartment(portafolio.departamento || 'Cundinamarca');
        const key = `${coords[0]}_${coords[1]}_portafolio`;
        
        if (!grupos[key]) {
          grupos[key] = {
            coords,
            empresas: [],
            promotores: [],
            articuladores: [],
            portafolios: []
          };
        }
        grupos[key].portafolios.push(portafolio);
      });
    }

    return grupos;
  };

  const grupos = agruparPorUbicacion();

  const handleEmpresaClick = (empresa: Empresa) => {
    router.push(`/empresas/${empresa.id}`);
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando ecosistema...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 font-semibold">Error al cargar el mapa</p>
          <p className="text-red-500 text-sm">{error}</p>
          <button 
            onClick={cargarDatos}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={[4.5709, -74.2973]}
      zoom={6}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapController
        empresaEspecifica={empresaEspecifica}
        soloEmpresaEspecifica={soloEmpresaEspecifica}
      />

      {/* Renderizar marcadores agrupados */}
      {Object.entries(grupos).map(([key, grupo]) => {
        const totalEntidades = 
          grupo.empresas.length + 
          grupo.promotores.length + 
          grupo.articuladores.length + 
          grupo.portafolios.length;

        if (totalEntidades === 0) return null;

        // Determinar el tipo principal para el icono
        let tipoIcon: 'empresa' | 'promotor' | 'articulador' | 'portafolio' = 'empresa';
        if (grupo.promotores.length > 0) tipoIcon = 'promotor';
        if (grupo.articuladores.length > 0) tipoIcon = 'articulador';
        if (grupo.portafolios.length > 0) tipoIcon = 'portafolio';
        if (grupo.empresas.length > 0) tipoIcon = 'empresa';

        return (
          <Marker
            key={key}
            position={grupo.coords}
            icon={createCustomIcon(tipoIcon, totalEntidades > 1 ? totalEntidades : undefined)}
          >
            <Popup className="custom-popup" maxWidth={400}>
              <div className="p-2">
                <h3 className="font-bold text-lg mb-3 text-gray-800">
                  Ecosistema de Innovación
                </h3>
                
                {/* Empresas */}
                {grupo.empresas.length > 0 && (
                  <div className="mb-3">
                    <h4 className="font-semibold text-blue-600 mb-2 flex items-center">
                      🏢 Empresas ({grupo.empresas.length})
                    </h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {grupo.empresas.map((empresa) => (
                        <div
                          key={empresa.id}
                          className="text-sm border-l-2 border-blue-300 pl-2 cursor-pointer hover:bg-blue-50 p-1 rounded"
                          onClick={() => handleEmpresaClick(empresa)}
                        >
                          <div className="font-medium text-blue-800">{empresa.name}</div>
                          <div className="text-gray-600 text-xs">
                            {empresa.sector} • {empresa.department}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Promotores */}
                {grupo.promotores.length > 0 && (
                  <div className="mb-3">
                    <h4 className="font-semibold text-green-600 mb-2 flex items-center">
                      📢 Promotores ({grupo.promotores.length})
                    </h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {grupo.promotores.map((promotor) => (
                        <div key={promotor.id} className="text-sm border-l-2 border-green-300 pl-2">
                          <div className="font-medium text-green-800">{promotor.medio}</div>
                          {promotor.descripcion && (
                            <div className="text-gray-600 text-xs">{promotor.descripcion}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Articuladores */}
                {grupo.articuladores.length > 0 && (
                  <div className="mb-3">
                    <h4 className="font-semibold text-purple-600 mb-2 flex items-center">
                      🤝 Articuladores ({grupo.articuladores.length})
                    </h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {grupo.articuladores.map((articulador) => (
                        <div key={articulador.id} className="text-sm border-l-2 border-purple-300 pl-2">
                          <div className="font-medium text-purple-800">{articulador.nombre}</div>
                          <div className="text-gray-600 text-xs">
                            {articulador.tipo} • {articulador.region}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Portafolios */}
                {grupo.portafolios.length > 0 && (
                  <div className="mb-3">
                    <h4 className="font-semibold text-orange-600 mb-2 flex items-center">
                      📊 Portafolio ARCO ({grupo.portafolios.length})
                    </h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {grupo.portafolios.map((portafolio) => (
                        <div key={portafolio.id} className="text-sm border-l-2 border-orange-300 pl-2">
                          <div className="font-medium text-orange-800">{portafolio.entidad}</div>
                          <div className="text-gray-600 text-xs">
                            {portafolio.anio} • {portafolio.departamento}
                          </div>
                          {portafolio.instrumento && (
                            <div className="text-gray-500 text-xs">{portafolio.instrumento}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

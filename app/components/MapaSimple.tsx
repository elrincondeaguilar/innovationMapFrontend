"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Company, EcosystemMapItem } from '../types/api';
import { EcosystemService } from '../services/nuevasEntidadesService';

// Props interface
interface MapaSimpleProps {
  empresaEspecifica?: Company | null;
  soloEmpresaEspecifica?: boolean;
}

// Configurar iconos de Leaflet
const defaultIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Iconos específicos para cada tipo de entidad
const iconMap = {
  Company: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  Promotor: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  Articulador: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  PortafolioArco: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  Convocatoria: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
};

// Hook para centrar el mapa cuando hay una empresa específica y manejar zoom
function MapController({ empresaEspecifica, onMapReady }: { 
  empresaEspecifica?: Company | null; 
  onMapReady?: (map: L.Map) => void;
}) {
  const map = useMap();
  
  useEffect(() => {
    if (onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);
  
  useEffect(() => {
    if (empresaEspecifica && empresaEspecifica.latitud && empresaEspecifica.longitud) {
      map.setView([empresaEspecifica.latitud, empresaEspecifica.longitud], 12);
    }
  }, [empresaEspecifica, map]);
  
  return null;
}

export default function MapaSimple({ 
  empresaEspecifica = null, 
  soloEmpresaEspecifica = false 
}: MapaSimpleProps) {
  const [ecosystemItems, setEcosystemItems] = useState<EcosystemMapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarLeyenda, setMostrarLeyenda] = useState(false);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  // Cargar datos del ecosistema
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        // Usar el servicio que incluye empresas
        const result = await EcosystemService.getAllEcosystemWithCompanies();
        if (result.success && result.data) {
          setEcosystemItems(result.data);
        } else {
          setError(result.message || 'Error al cargar datos');
        }
      } catch (error) {
        console.error('Error cargando datos del ecosistema:', error);
        setError('Error al cargar los datos del mapa');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Cerrar paneles móviles al hacer click en el mapa
  useEffect(() => {
    const handleMapClick = () => {
      setMostrarFiltros(false);
      setMostrarLeyenda(false);
    };

    if (mapInstance) {
      mapInstance.on('click', handleMapClick);
      return () => {
        mapInstance.off('click', handleMapClick);
      };
    }
  }, [mapInstance]);

  // Filtrar elementos si se especifica una empresa específica
  const elementosAMostrar = soloEmpresaEspecifica && empresaEspecifica
    ? ecosystemItems.filter(item => 
        item.tipo === 'Company' && item.id === empresaEspecifica.id
      )
    : ecosystemItems.filter(item => {
        // Aplicar filtro por tipo si está seleccionado
        if (filtroTipo && filtroTipo !== '') {
          return item.tipo === filtroTipo;
        }
        return true;
      });

  // Configuración del mapa
  const centroMapa: [number, number] = empresaEspecifica && empresaEspecifica.latitud && empresaEspecifica.longitud
    ? [empresaEspecifica.latitud, empresaEspecifica.longitud]
    : [6.2442, -75.5812]; // Medellín como centro por defecto

  const zoomInicial = empresaEspecifica ? 12 : 7;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center text-red-600">
          <p className="mb-2">⚠️ {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      {/* Botones de control móvil */}
      {!soloEmpresaEspecifica && (
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 sm:hidden">
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="bg-white rounded-lg shadow-lg p-2 border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Mostrar filtros"
          >
            🔍
          </button>
          <button
            onClick={() => setMostrarLeyenda(!mostrarLeyenda)}
            className="bg-white rounded-lg shadow-lg p-2 border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Mostrar leyenda"
          >
            📊
          </button>
        </div>
      )}

      {/* Panel de filtros - Responsive */}
      {!soloEmpresaEspecifica && (
        <div className={`absolute top-4 z-10 bg-white rounded-lg shadow-lg border border-gray-200 
          ${mostrarFiltros || filtroTipo ? 'block' : 'hidden sm:block'}
          left-4 sm:left-4 
          w-full sm:w-auto max-w-xs sm:max-w-xs
          mx-4 sm:mx-0
          transition-all duration-300 ease-in-out
          ${mostrarFiltros ? 'opacity-100 translate-y-0' : 'opacity-0 sm:opacity-100 translate-y-2 sm:translate-y-0'}
        `}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800 text-sm">Filtrar por tipo</h4>
              <button
                onClick={() => setMostrarFiltros(false)}
                className="sm:hidden text-gray-500 hover:text-gray-700"
                aria-label="Cerrar filtros"
              >
                ✕
              </button>
            </div>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 text-sm"
            >
              <option value="">🔍 Todos los tipos</option>
              <option value="Company">🏢 Empresas</option>
              <option value="Promotor">🎯 Promotores</option>
              <option value="Articulador">🤝 Articuladores</option>
              <option value="PortafolioArco">📋 Portafolio ARCO</option>
              <option value="Convocatoria">📢 Convocatorias</option>
            </select>
            {filtroTipo && (
              <button
                onClick={() => setFiltroTipo('')}
                className="mt-2 w-full px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
              >
                Limpiar filtro
              </button>
            )}
          </div>
        </div>
      )}

      <MapContainer
        center={centroMapa}
        zoom={zoomInicial}
        style={{ height: '100%', width: '100%' }}
        className="z-0 rounded-lg sm:rounded-none"
        zoomControl={false}
        scrollWheelZoom={true}
        touchZoom={true}
        doubleClickZoom={true}
        dragging={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapController 
          empresaEspecifica={empresaEspecifica} 
          onMapReady={setMapInstance}
        />
        
        {/* Renderizar markers para todos los elementos del ecosistema */}
        {elementosAMostrar.map((item) => {
          if (!item.latitud || !item.longitud) return null;

          const icon = iconMap[item.tipo as keyof typeof iconMap] || defaultIcon;

          return (
            <Marker
              key={`${item.tipo}-${item.id}`}
              position={[item.latitud, item.longitud]}
              icon={icon}
            >
              <Popup className="custom-popup" maxWidth={300} minWidth={200}>
                <div className="p-2 min-w-48 max-w-xs">
                  <div className="flex items-center mb-2">
                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                      item.tipo === 'Company' ? 'bg-blue-500' :
                      item.tipo === 'Promotor' ? 'bg-green-500' :
                      item.tipo === 'Articulador' ? 'bg-orange-500' :
                      item.tipo === 'Convocatoria' ? 'bg-purple-500' :
                      'bg-red-500'
                    }`}></span>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {item.tipo}
                    </span>
                  </div>
                  
                  <h4 className="font-bold text-gray-900 mb-1 text-sm sm:text-base leading-tight">
                    {item.nombre}
                  </h4>
                  
                  {item.descripcion && (
                    <p className="text-xs sm:text-sm text-gray-700 mb-2 leading-relaxed">
                      {item.descripcion.length > 80 
                        ? `${item.descripcion.substring(0, 80)}...` 
                        : item.descripcion
                      }
                    </p>
                  )}
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    {item.ciudad && (
                      <p className="flex items-start">
                        <span className="mr-1">📍</span>
                        <span>{item.ciudad}{item.departamento ? `, ${item.departamento}` : ''}</span>
                      </p>
                    )}
                    
                    {/* Información específica por tipo - Responsive */}
                    {item.tipo === 'Company' && item.industry && (
                      <p className="flex items-start">
                        <span className="mr-1">🏢</span>
                        <span>{item.industry}</span>
                      </p>
                    )}
                    {item.tipo === 'Company' && item.fundada && (
                      <p className="flex items-start">
                        <span className="mr-1">📅</span>
                        <span>Fundada: {item.fundada}</span>
                      </p>
                    )}
                    {item.tipo === 'Promotor' && item.tipoPromotor && (
                      <p className="flex items-start">
                        <span className="mr-1">🎯</span>
                        <span>{item.tipoPromotor}</span>
                      </p>
                    )}
                    {item.tipo === 'Articulador' && item.experiencia && (
                      <p className="flex items-start">
                        <span className="mr-1">💼</span>
                        <span>{item.experiencia}</span>
                      </p>
                    )}
                    {item.tipo === 'PortafolioArco' && item.objetivos && (
                      <p className="flex items-start">
                        <span className="mr-1">🎯</span>
                        <span>{item.objetivos.length > 50 ? `${item.objetivos.substring(0, 50)}...` : item.objetivos}</span>
                      </p>
                    )}
                    {item.tipo === 'Convocatoria' && item.categoria && (
                      <p className="flex items-start">
                        <span className="mr-1">📋</span>
                        <span>{item.categoria}</span>
                      </p>
                    )}
                    {item.tipo === 'Convocatoria' && item.entidad && (
                      <p className="flex items-start">
                        <span className="mr-1">🏛️</span>
                        <span>{item.entidad}</span>
                      </p>
                    )}
                    {item.tipo === 'Convocatoria' && item.estado && (
                      <p className="flex items-start">
                        <span className="mr-1">📊</span>
                        <span>Estado: {item.estado}</span>
                      </p>
                    )}
                    {item.tipo === 'Convocatoria' && item.fechaInicio && (
                      <p className="flex items-start">
                        <span className="mr-1">📅</span>
                        <span>Inicio: {new Date(item.fechaInicio).toLocaleDateString('es-ES')}</span>
                      </p>
                    )}
                    {item.tipo === 'Convocatoria' && item.fechaFin && (
                      <p className="flex items-start">
                        <span className="mr-1">⏰</span>
                        <span>Fin: {new Date(item.fechaFin).toLocaleDateString('es-ES')}</span>
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Controles de zoom personalizados para móvil */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2 sm:hidden">
        <button
          onClick={() => {
            if (mapInstance) mapInstance.zoomIn();
          }}
          className="bg-white rounded-lg shadow-lg p-3 border border-gray-200 hover:bg-gray-50 transition-colors text-lg font-bold"
          aria-label="Acercar"
        >
          +
        </button>
        <button
          onClick={() => {
            if (mapInstance) mapInstance.zoomOut();
          }}
          className="bg-white rounded-lg shadow-lg p-3 border border-gray-200 hover:bg-gray-50 transition-colors text-lg font-bold"
          aria-label="Alejar"
        >
          −
        </button>
      </div>

      {/* Leyenda - Responsive */}
      <div className={`absolute z-10 bg-white rounded-lg shadow-lg border border-gray-200 
        ${mostrarLeyenda ? 'block' : 'hidden sm:block'}
        top-4 right-4 sm:top-4 sm:right-4 
        w-full sm:w-auto max-w-48 sm:max-w-48
        mx-4 sm:mx-0
        transition-all duration-300 ease-in-out
        ${mostrarLeyenda ? 'opacity-100 translate-y-0' : 'opacity-0 sm:opacity-100 translate-y-2 sm:translate-y-0'}
      `}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800 text-sm">Leyenda</h4>
            <button
              onClick={() => setMostrarLeyenda(false)}
              className="sm:hidden text-gray-500 hover:text-gray-700"
              aria-label="Cerrar leyenda"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-gray-700 font-medium">Empresas</span>
              </div>
              <span className="text-gray-500 text-xs">
                {elementosAMostrar.filter(item => item.tipo === 'Company').length}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-700 font-medium">Promotores</span>
              </div>
              <span className="text-gray-500 text-xs">
                {elementosAMostrar.filter(item => item.tipo === 'Promotor').length}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                <span className="text-gray-700 font-medium">Articuladores</span>
              </div>
              <span className="text-gray-500 text-xs">
                {elementosAMostrar.filter(item => item.tipo === 'Articulador').length}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-gray-700 font-medium">Portafolio ARCO</span>
              </div>
              <span className="text-gray-500 text-xs">
                {elementosAMostrar.filter(item => item.tipo === 'PortafolioArco').length}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                <span className="text-gray-700 font-medium">Convocatorias</span>
              </div>
              <span className="text-gray-500 text-xs">
                {elementosAMostrar.filter(item => item.tipo === 'Convocatoria').length}
              </span>
            </div>
          </div>
          
          {elementosAMostrar.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                {elementosAMostrar.length} elementos mostrados
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
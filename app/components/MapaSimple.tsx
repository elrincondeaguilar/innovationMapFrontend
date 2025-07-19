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
  })
};

// Hook para centrar el mapa cuando hay una empresa específica
function MapController({ empresaEspecifica }: { empresaEspecifica?: Company | null }) {
  const map = useMap();
  
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

  // Cargar datos del ecosistema
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const result = await EcosystemService.getAllEcosystemItems();
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

  // Filtrar elementos si se especifica una empresa específica
  const elementosAMostrar = soloEmpresaEspecifica && empresaEspecifica
    ? ecosystemItems.filter(item => 
        item.tipo === 'Company' && item.id === empresaEspecifica.id
      )
    : ecosystemItems;

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
      <MapContainer
        center={centroMapa}
        zoom={zoomInicial}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapController empresaEspecifica={empresaEspecifica} />
        
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
              <Popup className="custom-popup">
                <div className="p-2 min-w-48">
                  <div className="flex items-center mb-2">
                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                      item.tipo === 'Company' ? 'bg-blue-500' :
                      item.tipo === 'Promotor' ? 'bg-green-500' :
                      item.tipo === 'Articulador' ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}></span>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {item.tipo}
                    </span>
                  </div>
                  
                  <h4 className="font-bold text-gray-900 mb-1">
                    {item.nombre}
                  </h4>
                  
                  {item.descripcion && (
                    <p className="text-sm text-gray-700 mb-2">
                      {item.descripcion.length > 100 
                        ? `${item.descripcion.substring(0, 100)}...` 
                        : item.descripcion
                      }
                    </p>
                  )}
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    {item.ciudad && (
                      <p>📍 {item.ciudad}{item.departamento ? `, ${item.departamento}` : ''}</p>
                    )}
                    
                    {/* Información específica por tipo */}
                    {item.tipo === 'Company' && item.industry && (
                      <p>🏢 {item.industry}</p>
                    )}
                    {item.tipo === 'Company' && item.fundada && (
                      <p>📅 Fundada: {item.fundada}</p>
                    )}
                    {item.tipo === 'Promotor' && item.tipoPromotor && (
                      <p>🎯 {item.tipoPromotor}</p>
                    )}
                    {item.tipo === 'Articulador' && item.experiencia && (
                      <p>💼 {item.experiencia}</p>
                    )}
                    {item.tipo === 'PortafolioArco' && item.objetivos && (
                      <p>🎯 {item.objetivos}</p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Leyenda */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10 max-w-48">
        <h4 className="font-semibold text-gray-800 mb-3 text-sm">Leyenda</h4>
        <div className="space-y-2">
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span>Empresas</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>Promotores</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
            <span>Articuladores</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>Portafolio ARCO</span>
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
  );
}
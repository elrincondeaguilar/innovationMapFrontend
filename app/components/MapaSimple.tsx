"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MarkerClusterGroup from 'react-leaflet-markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { Company, EcosystemMapItem } from "../types/api";
import { EcosystemService } from "../services/nuevasEntidadesService";
import { useSearchParams } from "next/navigation";

// Función para agrupar elementos por ubicación
function groupByLocation(
  items: EcosystemMapItem[]
): Map<string, EcosystemMapItem[]> {
  const grouped = new Map<string, EcosystemMapItem[]>();

  items.forEach((item) => {
    if (!item.latitud || !item.longitud) return;

    // Crear clave única para la ubicación (redondeada a 5 decimales)
    const locationKey = `${item.latitud.toFixed(5)}_${item.longitud.toFixed(
      5
    )}`;

    if (!grouped.has(locationKey)) {
      grouped.set(locationKey, []);
    }
    grouped.get(locationKey)!.push(item);
  });

  return grouped;
}

// Props interface
interface MapaSimpleProps {
  empresaEspecifica?: Company | null;
  soloEmpresaEspecifica?: boolean;
  setOcultarTitulo?: (v: boolean) => void;
}

// Configurar iconos de Leaflet
// Elimina la declaración de defaultIcon si no se usa

// Iconos específicos para cada tipo de entidad (modernos con divIcon)
const iconMap = {
  Company: L.divIcon({
    html: `<div style="background:#2563eb;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:20px;color:white;box-shadow:0 2px 8px rgba(0,0,0,0.15);">🏢</div>`,
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  }),
  Articulador: L.divIcon({
    html: `<div style="background:#f59e42;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:20px;color:white;box-shadow:0 2px 8px rgba(0,0,0,0.15);">🤝</div>`,
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  }),
  Convocatoria: L.divIcon({
    html: `<div style="background:#a259e6;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:20px;color:white;box-shadow:0 2px 8px rgba(0,0,0,0.15);">📢</div>`,
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  }),
};

// Icono de cluster con número y estilo moderno
function getClusterIcon(count: number, baseIcon: L.DivIcon, types: string[] = ["Company"]) {
  let bgColor = "#2563eb";
  const emojis = types.map(tipo => {
    if (tipo === "Company") return "🏢";
    if (tipo === "Articulador") return "🤝";
    if (tipo === "Convocatoria") return "📢";
    return "❓";
  }).join("");
  if (types.length === 1) {
    if (types[0] === "Articulador") bgColor = "#f59e42";
    else if (types[0] === "Convocatoria") bgColor = "#a259e6";
    else bgColor = "#2563eb";
  } else {
    // Azul con transparencia para agrupaciones de varios tipos
    bgColor = "rgba(37,99,235,0.5)";
  }
  return L.divIcon({
    html: `
      <div style=\"position: relative; display: flex; align-items: center; justify-content: center;\">
        <div style=\"background:${bgColor};border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:20px;color:white;box-shadow:0 2px 8px rgba(0,0,0,0.18);\">${emojis}</div>
        <span style=\"position: absolute; bottom: -6px; right: -6px; background: #fff; color: #2563eb; font-size: 14px; font-weight: bold; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border: 2px solid #2563eb; box-shadow: 0 1px 4px rgba(0,0,0,0.12);\">${count}</span>
      </div>
    `,
    className: "custom-cluster-icon",
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -44],
  });
}

// Hook para centrar el mapa cuando hay una empresa específica y manejar zoom
function MapController({
  empresaEspecifica,
  onMapReady,
}: {
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
    if (
      empresaEspecifica &&
      empresaEspecifica.latitud &&
      empresaEspecifica.longitud
    ) {
      map.setView([empresaEspecifica.latitud, empresaEspecifica.longitud], 12);
    }
  }, [empresaEspecifica, map]);

  return null;
}

export default function MapaSimple({
  empresaEspecifica = null,
  soloEmpresaEspecifica = false,
  setOcultarTitulo,
}: MapaSimpleProps) {
  const [ecosystemItems, setEcosystemItems] = useState<EcosystemMapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarLeyenda, setMostrarLeyenda] = useState(false);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<EcosystemMapItem | null>(null);
  const [entidadesEnUbicacion, setEntidadesEnUbicacion] = useState<EcosystemMapItem[]>([]);
  //recargar los datos
  const searchParams = useSearchParams();
  const lastUpdate = searchParams.get("lastUpdate");

  // useEffect para ocultar el título del mapa cuando el panel lateral esté abierto
  useEffect(() => {
    if (!setOcultarTitulo) return;
    if (empresaSeleccionada || entidadesEnUbicacion.length > 1) {
      setOcultarTitulo(true);
    } else {
      setOcultarTitulo(false);
    }
  }, [empresaSeleccionada, entidadesEnUbicacion.length, setOcultarTitulo]);

  // Cargar datos del ecosistema
  useEffect(() => {
    let isMounted = true;

    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);

        // Usar el servicio que incluye empresas
        const result = await EcosystemService.getAllEcosystemItems(); // Solo actualizar estado si el componente sigue montado
        if (isMounted) {
          if (result.success && result.data) {
            setEcosystemItems(result.data);
            if (process.env.NODE_ENV === "development") {
              console.log("🗺️ Ecosystem items loaded:", result.data.length);
              console.log("🗺️ Raw ecosystem data:", result.data);
              console.log("🗺️ Items by type:", {
                companies: result.data.filter(
                  (item: EcosystemMapItem) => item.tipo === "Company"
                ).length,
                articuladores: result.data.filter(
                  (item: EcosystemMapItem) => item.tipo === "Articulador"
                ).length,
                convocatorias: result.data.filter(
                  (item: EcosystemMapItem) => item.tipo === "Convocatoria"
                ).length,
              });

              // Debug de coordenadas
              const itemsWithCoords = result.data.filter(
                (item) => item.latitud && item.longitud
              );
              const itemsWithoutCoords = result.data.filter(
                (item) => !item.latitud || !item.longitud
              );
              console.log("🗺️ Items WITH coordinates:", itemsWithCoords.length);
              console.log(
                "🗺️ Items WITHOUT coordinates:",
                itemsWithoutCoords.length
              );
              console.log("🗺️ Items WITH coordinates:", itemsWithCoords);
              console.log("🗺️ Items WITHOUT coordinates:", itemsWithoutCoords);

              // LOG DETALLADO DE EMPRESAS NO MOSTRADAS
              const empresas = result.data.filter((item) => item.tipo === "Company");
              const empresasSinCoords = empresas.filter((item) => !item.latitud || !item.longitud);
              const empresasCoordsNulas = empresas.filter((item) => item.latitud === 0 || item.longitud === 0);
              const empresasConCoords = empresas.filter((item) => item.latitud && item.longitud && item.latitud !== 0 && item.longitud !== 0);
              console.log("🔎 Empresas totales:", empresas.length);
              console.log("❌ Empresas SIN coordenadas:", empresasSinCoords);
              console.log("⚠️ Empresas con coordenadas 0,0:", empresasCoordsNulas);
              console.log("✅ Empresas con coordenadas válidas:", empresasConCoords.length);
            }
          } else {
            setError(result.message || "Error al cargar datos");
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error cargando datos del ecosistema:", error);
          setError("Error al cargar los datos del mapa");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    cargarDatos();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [lastUpdate]); // Sin dependencias para evitar recargas innecesarias

  // Cerrar paneles móviles al hacer click en el mapa
  useEffect(() => {
    if (!mapInstance) return;

    const handleMapClick = () => {
      setMostrarFiltros(false);
      setMostrarLeyenda(false);
    };

    mapInstance.on("click", handleMapClick);

    return () => {
      mapInstance.off("click", handleMapClick);
    };
  }, [mapInstance]);

  // Filtrar elementos si se especifica una empresa específica
  const elementosAMostrar =
    soloEmpresaEspecifica && empresaEspecifica
      ? ecosystemItems.filter(
          (item) => item.tipo === "Company" && item.id === empresaEspecifica.id
        )
      : ecosystemItems.filter((item) => {
          // Aplicar filtro por tipo si está seleccionado
          if (filtroTipo && filtroTipo !== "") {
            return item.tipo === filtroTipo;
          }
          return true;
        });

  // Configuración del mapa
  const centroMapa: [number, number] =
    empresaEspecifica && empresaEspecifica.latitud && empresaEspecifica.longitud
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
        <div
          className={`absolute top-4 z-10 bg-white rounded-lg shadow-lg border border-gray-200 
          ${mostrarFiltros || filtroTipo ? "block" : "hidden sm:block"}
          left-4 sm:left-4 
          w-full sm:w-auto max-w-xs sm:max-w-xs
          mx-4 sm:mx-0
          transition-all duration-300 ease-in-out
          ${
            mostrarFiltros
              ? "opacity-100 translate-y-0"
              : "opacity-0 sm:opacity-100 translate-y-2 sm:translate-y-0"
          }
        `}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800 text-sm">
                Filtrar por tipo
              </h4>
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
              <option value="Articulador">🤝 Articuladores</option>
              <option value="Convocatoria">📢 Convocatorias</option>
            </select>
            {filtroTipo && (
              <button
                onClick={() => setFiltroTipo("")}
                className="mt-2 w-full px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
              >
                Limpiar filtro
              </button>
            )}
          </div>
        </div>
      )}

      {/* Panel lateral de detalles o selección de entidad - DISEÑO MEJORADO */}
      {(entidadesEnUbicacion.length > 1 || empresaSeleccionada) && (
        <div className="fixed sm:absolute top-0 right-0 sm:top-4 sm:right-4 z-30 w-full sm:w-96 max-w-full sm:max-w-sm h-full sm:h-auto bg-white rounded-none sm:rounded-2xl shadow-2xl border border-gray-200 p-0 sm:p-6 overflow-y-auto animate-fade-in">
          {/* Lista de entidades */}
          {entidadesEnUbicacion.length > 1 && !empresaSeleccionada && (
            <>
              <h3 className="font-bold text-xl mb-4 text-blue-700 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01" />
                </svg>
                Elementos en esta ubicación
              </h3>
              <ul className="divide-y divide-gray-100 max-h-72 overflow-y-auto pr-2">
                {entidadesEnUbicacion.map((entidad) => (
                  <li
                    key={entidad.id + '-' + entidad.tipo}
                    className="flex items-center gap-3 py-3 px-2 cursor-pointer rounded-lg hover:bg-blue-50 transition"
                    onClick={() => setEmpresaSeleccionada(entidad)}
                  >
                    <span className={`w-10 h-10 flex items-center justify-center rounded-full text-xl
                      ${entidad.tipo === "Company"
                        ? "bg-blue-100 text-blue-600"
                        : entidad.tipo === "Articulador"
                        ? "bg-orange-100 text-orange-600"
                        : entidad.tipo === "Convocatoria"
                        ? "bg-purple-100 text-purple-600"
                        : "bg-gray-200 text-gray-600"
                    }`}>
                      {entidad.tipo === "Company" && "🏢"}
                      {entidad.tipo === "Articulador" && "🤝"}
                      {entidad.tipo === "Convocatoria" && "📢"}
                    </span>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{entidad.nombre}</div>
                      <div className="text-xs text-gray-500">{entidad.tipo}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <button
                className="mt-4 w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
                onClick={() => {
                  setEntidadesEnUbicacion([]);
                  setEmpresaSeleccionada(null);
                }}
              >
                Cerrar
              </button>
            </>
          )}

          {/* Detalle de entidad */}
          {empresaSeleccionada && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <span className={`w-12 h-12 flex items-center justify-center rounded-full text-2xl
                  ${empresaSeleccionada.tipo === "Company"
                    ? "bg-blue-100 text-blue-600"
                    : empresaSeleccionada.tipo === "Articulador"
                    ? "bg-orange-100 text-orange-600"
                    : empresaSeleccionada.tipo === "Convocatoria"
                    ? "bg-purple-100 text-purple-600"
                    : "bg-gray-200 text-gray-600"
                  }`}>
                  {empresaSeleccionada.tipo === "Company" && "🏢"}
                  {empresaSeleccionada.tipo === "Articulador" && "🤝"}
                  {empresaSeleccionada.tipo === "Convocatoria" && "📢"}
                </span>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{empresaSeleccionada.nombre}</h3>
                  <div className="text-xs text-gray-500">{empresaSeleccionada.tipo}</div>
                </div>
              </div>
              {(empresaSeleccionada.departamento || empresaSeleccionada.Ubicacion || empresaSeleccionada.ubicacion) && (
                <div className="flex items-center text-xs text-gray-500 mb-1">
                  <span className="mr-2">📍</span>
                  <span>{empresaSeleccionada.departamento || empresaSeleccionada.Ubicacion || empresaSeleccionada.ubicacion}</span>
                </div>
              )}
              {empresaSeleccionada.descripcion && (
                <p className="text-sm text-gray-700 mb-2">{empresaSeleccionada.descripcion}</p>
              )}
              {empresaSeleccionada.tipo === "Company" && (
                <>
                  <div className="flex items-center text-xs text-gray-500 mb-1"><span className="mr-2">🏷️</span>Sector: {empresaSeleccionada.industry || '-'}</div>
                  <div className="flex items-center text-xs text-gray-500 mb-1"><span className="mr-2">📍</span>Departamento: {empresaSeleccionada.departamento || '-'}</div>
                </>
              )}
              {empresaSeleccionada.tipo === "Articulador" && (
                <>
                  <div className="flex items-center text-xs text-gray-500 mb-1"><span className="mr-2">💼</span>Experiencia: {empresaSeleccionada.experiencia}</div>
                  <div className="flex items-center text-xs text-gray-500 mb-1"><span className="mr-2">📍</span>Departamento: {empresaSeleccionada.departamento}</div>
                </>
              )}
              {empresaSeleccionada.tipo === "Convocatoria" && (
                <>
                  <div className="flex items-center text-xs text-gray-500 mb-1"><span className="mr-2">📋</span>Categoría: {empresaSeleccionada.categoria}</div>
                  <div className="flex items-center text-xs text-gray-500 mb-1"><span className="mr-2">🏛️</span>Entidad: {empresaSeleccionada.entidad}</div>
                  <div className="flex items-center text-xs text-gray-500 mb-1"><span className="mr-2">📊</span>Estado: {empresaSeleccionada.estado}</div>
                  <div className="flex items-center text-xs text-gray-500 mb-1"><span className="mr-2">📅</span>Fecha inicio: {empresaSeleccionada.fechaInicio && new Date(empresaSeleccionada.fechaInicio).toLocaleDateString("es-ES")}</div>
                  <div className="flex items-center text-xs text-gray-500 mb-1"><span className="mr-2">⏰</span>Fecha fin: {empresaSeleccionada.fechaFin && new Date(empresaSeleccionada.fechaFin).toLocaleDateString("es-ES")}</div>
                </>
              )}
              {empresaSeleccionada.tipo === "Company" && empresaSeleccionada.url && (
                <div className="flex items-center text-xs text-blue-600 mb-1">
                  <span className="mr-2">🔗</span>
                  <a
                    href={empresaSeleccionada.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-800 break-all"
                  >
                    Visitar sitio web
                  </a>
                </div>
              )}
              {empresaSeleccionada.tipo === "Convocatoria" && empresaSeleccionada.enlace && (
                <div className="flex items-center text-xs text-blue-600 mb-1">
                  <span className="mr-2">🔗</span>
                  <a
                    href={empresaSeleccionada.enlace}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-800 break-all"
                  >
                    Ver enlace
                  </a>
                </div>
              )}
              {empresaSeleccionada.tipo === "Articulador" && empresaSeleccionada.contacto && (
                <div className="flex items-center text-xs text-green-700 mb-1">
                  <span className="mr-2">✉️</span>
                  <span className="break-all">{empresaSeleccionada.contacto}</span>
                </div>
              )}
              <button
                className="mt-4 w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
                onClick={() => setEmpresaSeleccionada(null)}
              >
                Volver a la lista
              </button>
            </div>
          )}
        </div>
      )}

      <MapContainer
        center={centroMapa}
        zoom={zoomInicial}
        style={{ height: "100%", width: "100%" }}
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

        {/* Agrupación de marcadores con spiderfy */}
        <MarkerClusterGroup
          showCoverageOnHover={false}
          spiderfyOnMaxZoom={true}
          maxClusterRadius={40}
        >
          {(() => {
            // Agrupar elementos por ubicación
            const groupedByLocation = groupByLocation(elementosAMostrar);
            const markers: React.ReactElement[] = [];

            // Crear un marker por cada grupo de ubicación (no por cada item individual)
            Array.from(groupedByLocation.entries()).forEach(
              ([locationKey, items], groupIndex) => {
                if (!items.length || !items[0].latitud || !items[0].longitud)
                  return;

                // Usar la posición del primer elemento como posición base
                const basePosition: [number, number] = [
                  items[0].latitud,
                  items[0].longitud,
                ];

                const hasMultipleTypes = new Set(items.map((item) => item.tipo)).size > 1;
                const types = Array.from(new Set(items.map((item) => item.tipo)));
                let icon;
                if (items.length === 1) {
                  // Un solo item: icono simple del tipo
                  icon = iconMap[items[0].tipo as keyof typeof iconMap] || iconMap.Company;
                } else {
                  // Más de uno: icono con emojis de los tipos y número por tipo
                  const baseIcon = hasMultipleTypes
                    ? L.divIcon({
                        html: `<div style=\"background:#64748b;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:20px;color:white;box-shadow:0 2px 8px rgba(0,0,0,0.15);\">${types.map(tipo => tipo === "Company" ? "🏢" : tipo === "Articulador" ? "🤝" : tipo === "Convocatoria" ? "📢" : "❓").join("")}</div>`,
                        className: "",
                        iconSize: [36, 36],
                        iconAnchor: [18, 36],
                        popupAnchor: [0, -36],
                      })
                    : iconMap[items[0].tipo as keyof typeof iconMap] || iconMap.Company;
                  icon = getClusterIcon(items.length, baseIcon, types);
                }

                markers.push(
                  <Marker
                    key={`location-group-${groupIndex}-${locationKey}`}
                    position={basePosition}
                    icon={icon}
                    eventHandlers={{
                      click: () => {
                        if (items.length === 1) {
                          setEntidadesEnUbicacion(items);
                          setEmpresaSeleccionada(items[0]);
                        } else {
                          setEntidadesEnUbicacion(items);
                          setEmpresaSeleccionada(null);
                        }
                      }
                    }}
                  >
                    <Popup className="custom-popup" maxWidth={400} minWidth={300}>
                      <div className="p-2 max-w-sm">
                        {items.length > 1 && (
                          <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-xs text-blue-700 font-medium">
                              📍 {items.length} elementos en esta ubicación
                            </p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {items.map((item) => (
                                <span
                                  key={`${item.tipo}-${item.id}`}
                                  className={`text-xs px-2 py-1 rounded-full text-white ${
                                    item.tipo === "Company"
                                      ? "bg-blue-500"
                                      : item.tipo === "Articulador"
                                      ? "bg-orange-500"
                                      : item.tipo === "Convocatoria"
                                      ? "bg-purple-500"
                                      : "bg-red-500"
                                  }`}
                                >
                                  {item.tipo}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Mostrar TODOS los elementos en esta ubicación */}
                        <div className="space-y-4">
                          {items.map((item, itemIndex) => (
                            <div
                              key={`${item.tipo}-${item.id}-details`}
                              className={`${
                                itemIndex > 0
                                  ? "border-t border-gray-200 pt-3"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center mb-2">
                                <span
                                  className={`inline-block w-3 h-3 rounded-full mr-2 ${
                                    item.tipo === "Company"
                                      ? "bg-blue-500"
                                      : item.tipo === "Articulador"
                                      ? "bg-orange-500"
                                      : item.tipo === "Convocatoria"
                                      ? "bg-purple-500"
                                      : "bg-red-500"
                                  }`}
                                ></span>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  {item.tipo}
                                </span>
                              </div>

                              <h4 className="font-bold text-gray-900 mb-1 text-sm leading-tight">
                                {item.nombre}
                              </h4>

                              {item.descripcion && (
                                <p className="text-xs text-gray-700 mb-2 leading-relaxed">
                                  {item.descripcion.length > 100
                                    ? `${item.descripcion.substring(0, 100)}...`
                                    : item.descripcion}
                                </p>
                              )}

                              <div className="text-xs text-gray-500 space-y-1">
                                {item.ciudad && (
                                  <p className="flex items-start">
                                    <span className="mr-1">📍</span>
                                    <span>
                                      {item.ciudad}
                                      {item.departamento
                                        ? `, ${item.departamento}`
                                        : ""}
                                    </span>
                                  </p>
                                )}

                                {/* Información específica por tipo */}
                                {item.tipo === "Company" && item.industry && (
                                  <p className="flex items-start">
                                    <span className="mr-1">🏢</span>
                                    <span>{item.industry}</span>
                                  </p>
                                )}
                                {item.tipo === "Company" && item.fundada && (
                                  <p className="flex items-start">
                                    <span className="mr-1">📅</span>
                                    <span>Fundada: {item.fundada}</span>
                                  </p>
                                )}
                                {item.tipo === "Articulador" &&
                                  item.experiencia && (
                                    <p className="flex items-start">
                                      <span className="mr-1">💼</span>
                                      <span>{item.experiencia}</span>
                                    </p>
                                  )}
                                {item.tipo === "Convocatoria" &&
                                  item.categoria && (
                                    <p className="flex items-start">
                                      <span className="mr-1">📋</span>
                                      <span>{item.categoria}</span>
                                    </p>
                                  )}
                                {item.tipo === "Convocatoria" && item.entidad && (
                                  <p className="flex items-start">
                                    <span className="mr-1">🏛️</span>
                                    <span>{item.entidad}</span>
                                  </p>
                                )}
                                {item.tipo === "Convocatoria" && item.estado && (
                                  <p className="flex items-start">
                                    <span className="mr-1">📊</span>
                                    <span>Estado: {item.estado}</span>
                                  </p>
                                )}
                                {item.tipo === "Convocatoria" &&
                                  item.fechaInicio && (
                                    <p className="flex items-start">
                                      <span className="mr-1">📅</span>
                                      <span>
                                        Inicio:{" "}
                                        {new Date(
                                          item.fechaInicio
                                        ).toLocaleDateString("es-ES")}
                                      </span>
                                    </p>
                                  )}
                                {item.tipo === "Convocatoria" && item.fechaFin && (
                                  <p className="flex items-start">
                                    <span className="mr-1">⏰</span>
                                    <span>
                                      Fin:{" "}
                                      {new Date(
                                        item.fechaFin
                                      ).toLocaleDateString("es-ES")}
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              }
            );

            return markers;
          })()}
        </MarkerClusterGroup>
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
      <div
        className={`absolute z-10 bg-white rounded-lg shadow-lg border border-gray-200 
        ${mostrarLeyenda ? "block" : "hidden sm:block"}
        top-4 right-4 sm:top-4 sm:right-4 
        w-full sm:w-auto max-w-48 sm:max-w-48
        mx-4 sm:mx-0
        transition-all duration-300 ease-in-out
        ${
          mostrarLeyenda
            ? "opacity-100 translate-y-0"
            : "opacity-0 sm:opacity-100 translate-y-2 sm:translate-y-0"
        }
      `}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800 text-sm">
              Leyenda del Ecosistema
            </h4>
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
                <span className="text-gray-700 font-medium">🏢 Empresas</span>
              </div>
              <span className="text-gray-500 text-xs">
                {
                  elementosAMostrar.filter((item) => item.tipo === "Company")
                    .length
                }
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                <span className="text-gray-700 font-medium">
                  🤝 Articuladores
                </span>
              </div>
              <span className="text-gray-500 text-xs">
                {
                  elementosAMostrar.filter(
                    (item) => item.tipo === "Articulador"
                  ).length
                }
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                <span className="text-gray-700 font-medium">
                  📢 Convocatorias
                </span>
              </div>
              <span className="text-gray-500 text-xs">
                {
                  elementosAMostrar.filter(
                    (item) => item.tipo === "Convocatoria"
                  ).length
                }
              </span>
            </div>
          </div>

          {/* Línea separadora e información adicional */}
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
            <div className="flex items-center text-xs">
              <div className="w-3 h-3 border-2 border-blue-500 rounded-full mr-2"></div>
              <span className="text-gray-700">Ubicación aproximada</span>
            </div>
            <p className="text-xs text-gray-500">
              Usa los filtros para explorar el ecosistema de innovación
            </p>
          </div>

          {elementosAMostrar.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                <span className="font-medium">{elementosAMostrar.length}</span>{" "}
                elementos del ecosistema
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

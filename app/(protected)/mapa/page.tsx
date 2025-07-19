"use client";

import dynamic from "next/dynamic";
import Navbar from "../../components/Navbar";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Empresa } from "../../types/api";

const MapaSimple = dynamic(() => import("../../components/MapaSimple"), {
  ssr: false,
});

export default function MapaPage() {
  const searchParams = useSearchParams();

  // Construir empresa desde parámetros de URL si están presentes
  const empresaEspecifica = useMemo(() => {
    const empresaId = searchParams.get("empresaId");
    const empresaNombre = searchParams.get("empresaNombre");

    if (empresaId && empresaNombre) {
      const empresa: Empresa = {
        id: parseInt(empresaId),
        name: empresaNombre,
        sector: searchParams.get("empresaSector") || "",
        department: searchParams.get("empresaDepartamento") || "",
        description: searchParams.get("empresaDescripcion") || "",
        url: searchParams.get("empresaUrl") || "",
      };
      return empresa;
    }
    return null;
  }, [searchParams]);

  const soloEmpresaEspecifica = !!empresaEspecifica;
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />

      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob pointer-events-none"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>

      <main className="relative h-[calc(100vh-64px)]">
        {/* Header flotante - Oculto en móviles para mayor espacio de mapa */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1001] pointer-events-none hidden sm:block">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 px-6 py-3 pointer-events-auto">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">
                  {soloEmpresaEspecifica
                    ? `${empresaEspecifica?.name}`
                    : "Mapa de Innovación"}
                </h1>
                <p className="text-sm text-gray-600">
                  {soloEmpresaEspecifica
                    ? `${empresaEspecifica?.sector} • ${empresaEspecifica?.department}`
                    : "Ecosistema empresarial colombiano"}
                </p>
              </div>
              {soloEmpresaEspecifica && (
                <button
                  onClick={() => (window.location.href = "/mapa")}
                  className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Ver todas
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Leyenda flotante */}
        <div className="absolute bottom-4 right-4 z-[1001] bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-4 max-w-xs">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
            <svg
              className="w-4 h-4 mr-2 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Leyenda del Ecosistema
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
              <span className="text-gray-700">🏢 Empresas</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-gray-700">📢 Promotores</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-700">🤝 Articuladores</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-600 rounded-full mr-2"></div>
              <span className="text-gray-700">📊 Portafolio ARCO</span>
            </div>
            <div className="flex items-center mt-3 pt-2 border-t border-gray-200">
              <div className="w-3 h-3 border-2 border-blue-600 rounded-full mr-2"></div>
              <span className="text-gray-700">Ubicación aproximada</span>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-200">
              <p className="text-gray-500">
                Usa los filtros para explorar el ecosistema de innovación
              </p>
            </div>
          </div>
        </div>

        {/* Componente del mapa */}
        <div className="h-full rounded-t-3xl overflow-hidden shadow-2xl border border-white/20">
          <MapaSimple
            empresaEspecifica={empresaEspecifica}
            soloEmpresaEspecifica={soloEmpresaEspecifica}
          />
        </div>
      </main>
    </div>
  );
}

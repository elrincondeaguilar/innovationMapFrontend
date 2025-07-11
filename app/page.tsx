"use client";

import { useAuth } from "./hooks/useAuth";
import Link from "next/link";
import Navbar from "./components/Navbar";
import { useState, useEffect } from "react";
import { EmpresaService, ConvocatoriaService } from "./services/backendService";
import { Empresa, Convocatoria } from "./types/api";

export default function HomePage() {
  const { authState } = useAuth();

  // Estados para el dashboard
  const [dashboardData, setDashboardData] = useState({
    totalEmpresas: 0,
    totalConvocatorias: 0,
    convocatoriasActivas: 0,
    empresasPorSector: {} as Record<string, number>,
    empresasPorDepartamento: {} as Record<string, number>,
    loading: true,
    error: null as string | null,
  });

  // Cargar datos del dashboard
  useEffect(() => {
    const cargarDashboard = async () => {
      if (!authState.isAuthenticated) return;

      try {
        setDashboardData((prev) => ({ ...prev, loading: true, error: null }));

        // Cargar empresas y convocatorias en paralelo
        const [empresasResult, convocatoriasResult] = await Promise.all([
          EmpresaService.obtenerEmpresas(),
          ConvocatoriaService.obtenerConvocatorias(),
        ]);

        let totalEmpresas = 0;
        const empresasPorSector: Record<string, number> = {};
        const empresasPorDepartamento: Record<string, number> = {};

        if (empresasResult.success && empresasResult.data) {
          totalEmpresas = empresasResult.data.length;

          // Contar empresas por sector
          empresasResult.data.forEach((empresa: Empresa) => {
            empresasPorSector[empresa.sector] =
              (empresasPorSector[empresa.sector] || 0) + 1;
            empresasPorDepartamento[empresa.department] =
              (empresasPorDepartamento[empresa.department] || 0) + 1;
          });
        }

        let totalConvocatorias = 0;
        let convocatoriasActivas = 0;

        if (convocatoriasResult.success && convocatoriasResult.data) {
          totalConvocatorias = convocatoriasResult.data.length;

          // Contar convocatorias activas
          const fechaActual = new Date();
          convocatoriasActivas = convocatoriasResult.data.filter(
            (convocatoria: Convocatoria) => {
              if (convocatoria.estadoManual) {
                return convocatoria.estado === "activa";
              }
              const fechaInicio = new Date(convocatoria.fechaInicio);
              const fechaFin = new Date(convocatoria.fechaFin);
              return fechaActual >= fechaInicio && fechaActual <= fechaFin;
            }
          ).length;
        }

        setDashboardData({
          totalEmpresas,
          totalConvocatorias,
          convocatoriasActivas,
          empresasPorSector,
          empresasPorDepartamento,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error cargando dashboard:", error);
        setDashboardData((prev) => ({
          ...prev,
          loading: false,
          error: "Error al cargar los datos del dashboard",
        }));
      }
    };

    cargarDashboard();
  }, [authState.isAuthenticated]);

  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (authState.isAuthenticated) {
    // Dashboard para usuarios autenticados
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header del Dashboard */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                ¡Bienvenido, {authState.user?.nombre}! 👋
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Explora el ecosistema de innovación y encuentra las mejores
                oportunidades para tu empresa.
              </p>
            </div>

            {/* Dashboard de métricas */}
            {dashboardData.loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">
                  Cargando estadísticas...
                </span>
              </div>
            ) : dashboardData.error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-12">
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 text-red-600 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-red-800 font-medium">
                    {dashboardData.error}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mb-12">
                {/* Métricas principales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Total de empresas */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Total Empresas
                        </p>
                        <p className="text-3xl font-bold text-blue-600">
                          {dashboardData.totalEmpresas}
                        </p>
                      </div>
                      <div className="bg-blue-100 p-3 rounded-full">
                        <svg
                          className="w-8 h-8 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Link
                        href="/empresas"
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Ver todas las empresas →
                      </Link>
                    </div>
                  </div>

                  {/* Total de convocatorias */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Total Convocatorias
                        </p>
                        <p className="text-3xl font-bold text-purple-600">
                          {dashboardData.totalConvocatorias}
                        </p>
                      </div>
                      <div className="bg-purple-100 p-3 rounded-full">
                        <svg
                          className="w-8 h-8 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Link
                        href="/convocatorias"
                        className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                      >
                        Ver todas las convocatorias →
                      </Link>
                    </div>
                  </div>

                  {/* Convocatorias activas */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Convocatorias Activas
                        </p>
                        <p className="text-3xl font-bold text-green-600">
                          {dashboardData.convocatoriasActivas}
                        </p>
                      </div>
                      <div className="bg-green-100 p-3 rounded-full">
                        <svg
                          className="w-8 h-8 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="text-sm text-green-600 font-medium">
                        {dashboardData.convocatoriasActivas > 0
                          ? "¡Hay oportunidades disponibles!"
                          : "No hay convocatorias activas"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Distribución por sectores y departamentos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top sectores */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 text-blue-600 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      Top Sectores
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {Object.entries(dashboardData.empresasPorSector)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 8)
                        .map(([sector, count]) => (
                          <div
                            key={sector}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm text-gray-700 truncate flex-1 mr-2">
                              {sector}
                            </span>
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${Math.min(
                                      (count / dashboardData.totalEmpresas) *
                                        100,
                                      100
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold text-blue-600 min-w-[2rem] text-right">
                                {count}
                              </span>
                            </div>
                          </div>
                        ))}
                      {Object.keys(dashboardData.empresasPorSector).length ===
                        0 && (
                        <p className="text-sm text-gray-500 italic">
                          No hay datos de sectores disponibles
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Top departamentos */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 text-green-600 mr-2"
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
                      Top Departamentos
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {Object.entries(dashboardData.empresasPorDepartamento)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 8)
                        .map(([departamento, count]) => (
                          <div
                            key={departamento}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm text-gray-700 truncate flex-1 mr-2">
                              {departamento}
                            </span>
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${Math.min(
                                      (count / dashboardData.totalEmpresas) *
                                        100,
                                      100
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold text-green-600 min-w-[2rem] text-right">
                                {count}
                              </span>
                            </div>
                          </div>
                        ))}
                      {Object.keys(dashboardData.empresasPorDepartamento)
                        .length === 0 && (
                        <p className="text-sm text-gray-500 italic">
                          No hay datos de departamentos disponibles
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Información adicional */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">
                  ¿Necesitas ayuda para empezar?
                </h2>
                <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                  Nuestro sistema te permite explorar, analizar y conectar con
                  el ecosistema de innovación de manera intuitiva.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/mapa"
                    className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300"
                  >
                    Explorar Mapa
                  </Link>
                  <Link
                    href="/empresas"
                    className="px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors duration-300 border border-blue-500"
                  >
                    Ver Empresas
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Landing page para usuarios no autenticados
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Innovation
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Map
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">
              Descubre, conecta y potencia el ecosistema de innovación. Explora
              empresas, analiza datos y encuentra oportunidades únicas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/login"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/auth/register"
                className="px-8 py-4 bg-white text-gray-900 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-blue-300"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Qué puedes hacer con Innovation Map?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Una plataforma completa para explorar y potenciar el ecosistema de
              innovación
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="text-5xl mb-4">🗺️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Visualización Interactiva
              </h3>
              <p className="text-gray-600">
                Explora el mapa interactivo del ecosistema de innovación y
                descubre conexiones únicas.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Análisis Avanzado
              </h3>
              <p className="text-gray-600">
                Utiliza herramientas de análisis para obtener insights valiosos
                sobre el mercado.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Conexiones Estratégicas
              </h3>
              <p className="text-gray-600">
                Encuentra socios, proveedores y oportunidades de colaboración en
                el ecosistema.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              ¿Listo para explorar el futuro de la innovación?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Únete a nuestra plataforma y forma parte del ecosistema de
              innovación más dinámico.
            </p>
            <Link
              href="/auth/register"
              className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Comenzar Ahora
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { authState, logout } = useAuth();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl rounded-3xl p-8 max-w-md w-full text-center">
        {/* Icono de error */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-red-600"
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

        {/* Título y mensaje */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Acceso No Autorizado
        </h1>
        <p className="text-gray-600 mb-6">
          No tienes permisos para acceder a esta página.
          {authState.user && (
            <span className="block mt-2 text-sm">
              Conectado como: <strong>{authState.user.nombre}</strong> (
              {authState.user.rol})
            </span>
          )}
        </p>

        {/* Botones de acción */}
        <div className="space-y-3">
          <button
            onClick={handleGoHome}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
          >
            Ir al Inicio
          </button>

          <button
            onClick={handleGoBack}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
          >
            Volver
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Información adicional */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-sm text-yellow-800">
            Si crees que esto es un error, contacta al administrador del
            sistema.
          </p>
        </div>
      </div>
    </div>
  );
}

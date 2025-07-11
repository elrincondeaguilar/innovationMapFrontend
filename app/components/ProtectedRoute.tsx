"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "usuario";
  fallbackPath?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  fallbackPath = "/auth/login",
}: ProtectedRouteProps) {
  const { authState } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si está cargando, no hacer nada aún
    if (authState.isLoading) {
      return;
    }

    // Si no está autenticado, redirigir al login
    if (!authState.isAuthenticated) {
      router.push(fallbackPath);
      return;
    }

    // Si requiere un rol específico y el usuario no lo tiene
    if (requiredRole && authState.user?.rol !== requiredRole) {
      // Redirigir a una página de "no autorizado" o al dashboard
      router.push("/unauthorized");
      return;
    }
  }, [
    authState.isLoading,
    authState.isAuthenticated,
    authState.user,
    requiredRole,
    router,
    fallbackPath,
  ]);

  // Mostrar loading mientras se verifica la autenticación
  if (authState.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-400 rounded-full animate-spin animation-delay-150 mx-auto"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Verificando autenticación...
          </h3>
          <p className="text-sm text-gray-500">Por favor espere un momento</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado o no tiene el rol requerido, no mostrar el contenido
  if (
    !authState.isAuthenticated ||
    (requiredRole && authState.user?.rol !== requiredRole)
  ) {
    return null;
  }

  // Usuario autenticado y autorizado, mostrar contenido
  return <>{children}</>;
}

"use client";

import { useState, useEffect } from "react";

/**
 * Hook para detectar si hay datos de autenticación en localStorage
 * Se ejecuta del lado del cliente después de la hidratación
 */
export function useLocalStorageAuth() {
  const [hasAuthData, setHasAuthData] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthData = () => {
      try {
        if (
          typeof window === "undefined" ||
          typeof localStorage === "undefined"
        ) {
          setHasAuthData(false);
          setIsChecking(false);
          return;
        }

        const token = localStorage.getItem("auth_token");
        const user = localStorage.getItem("auth_user");

        setHasAuthData(!!(token && user));
        setIsChecking(false);
      } catch (error) {
        console.error("💥 Error checking localStorage auth data:", error);
        setHasAuthData(false);
        setIsChecking(false);
      }
    };

    // Check immediately and after a small delay
    checkAuthData();
    const timer = setTimeout(checkAuthData, 100);

    return () => clearTimeout(timer);
  }, []);

  return { hasAuthData, isChecking };
}

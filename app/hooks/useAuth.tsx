"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { AuthState, LoginCredentials, RegisterCredentials } from "../types/api";
import AuthService from "../services/authService";

interface AuthContextType {
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Contexto de autenticación
const AuthContext = createContext<AuthContextType | null>(null);

// Provider de autenticación
export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Efecto para inicializar la autenticación
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Verificar que estamos en el cliente
        if (typeof window === "undefined") {
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        // Verificar localStorage
        if (typeof localStorage === "undefined") {
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        // Obtener datos del localStorage
        const token = AuthService.getToken();
        const storedUser = AuthService.getStoredUser();

        if (token && storedUser) {
          // Establecer estado autenticado inmediatamente
          setAuthState({
            user: storedUser,
            token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Solo validar token si hay refresh token disponible (evitar errores 404)
          setTimeout(async () => {
            try {
              // Solo validar si tenemos refresh token para renovar en caso necesario
              const refreshToken = localStorage.getItem("auth_refresh_token");
              if (refreshToken) {
                const isValid = await AuthService.validateToken();

                if (!isValid) {
                  try {
                    const newToken = await AuthService.refreshToken();
                    if (newToken) {
                      const currentUser = await AuthService.getCurrentUser();
                      setAuthState((prev) => ({
                        ...prev,
                        user: currentUser || storedUser,
                        token: newToken,
                      }));
                    } else {
                      AuthService.clearAuthData();
                      setAuthState({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                      });
                    }
                  } catch {
                    // Background refresh failed
                  }
                } else {
                  // Token válido, actualizar usuario si es posible
                  try {
                    const currentUser = await AuthService.getCurrentUser();
                    if (currentUser) {
                      setAuthState((prev) => ({
                        ...prev,
                        user: currentUser,
                      }));
                    }
                  } catch {
                    // Could not update user in background
                  }
                }
              } else {
                // Token válido, continuar con la sesión
              }
            } catch {
              // Background validation error (keeping session)
            }
          }, 100);
        } else {
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("💥 Error during auth initialization:", error);
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    // Ejecutar inicialización inmediatamente
    initializeAuth();
  }, []); // Solo ejecutar una vez

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      const authResponse = await AuthService.login(credentials);

      setAuthState({
        user: authResponse.user,
        token: authResponse.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      const authResponse = await AuthService.register(credentials);

      setAuthState({
        user: authResponse.user,
        token: authResponse.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      await AuthService.logout();

      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error en logout:", error);
      // Asegurar que se limpie el estado local aunque falle el backend
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const user = await AuthService.getCurrentUser();
      if (user) {
        setAuthState((prev) => ({ ...prev, user }));
      }
    } catch (error) {
      console.error("Error al refrescar usuario:", error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar la autenticación
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }

  return context;
}

// Hook para operaciones de autenticación (compatible con tu ejemplo)
export function useAuthOperations() {
  const { login, register, logout } = useAuth();

  return {
    login,
    register,
    logout,
  };
}

export default useAuth;

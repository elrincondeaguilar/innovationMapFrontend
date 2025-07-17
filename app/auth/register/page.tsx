"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthOperations } from "../../hooks/useAuth";
import { RegisterCredentials } from "../../types/api";
import { 
  validateEmail, 
  validatePassword, 
  validateName, 
  validatePasswordConfirmation,
  getBackendErrorMessage 
} from "../../utils/validation";

export default function RegisterPage() {
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register } = useAuthOperations();
  const router = useRouter();

  const validateField = (name: string, value: string) => {
    let validation;
    
    switch (name) {
      case 'nombre':
        validation = validateName(value, 'nombre');
        break;
      case 'apellido':
        validation = validateName(value, 'apellido');
        break;
      case 'email':
        validation = validateEmail(value);
        break;
      case 'password':
        validation = validatePassword(value, true);
        break;
      case 'confirmPassword':
        validation = validatePasswordConfirmation(credentials.password, value);
        break;
      default:
        return;
    }

    setFieldErrors(prev => ({
      ...prev,
      [name]: validation.isValid ? '' : (validation.error || '')
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    // Validar todos los campos
    const nameValidation = validateName(credentials.nombre, 'nombre');
    const lastNameValidation = validateName(credentials.apellido, 'apellido');
    const emailValidation = validateEmail(credentials.email);
    const passwordValidation = validatePassword(credentials.password, true);
    const confirmPasswordValidation = validatePasswordConfirmation(credentials.password, credentials.confirmPassword);

    const newFieldErrors: {[key: string]: string} = {};
    
    if (!nameValidation.isValid && nameValidation.error) {
      newFieldErrors.nombre = nameValidation.error;
    }
    
    if (!lastNameValidation.isValid && lastNameValidation.error) {
      newFieldErrors.apellido = lastNameValidation.error;
    }
    
    if (!emailValidation.isValid && emailValidation.error) {
      newFieldErrors.email = emailValidation.error;
    }
    
    if (!passwordValidation.isValid && passwordValidation.error) {
      newFieldErrors.password = passwordValidation.error;
    }
    
    if (!confirmPasswordValidation.isValid && confirmPasswordValidation.error) {
      newFieldErrors.confirmPassword = confirmPasswordValidation.error;
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setLoading(false);
      return;
    }

    try {
      await register(credentials);
      router.push("/"); // Redirigir al dashboard principal
    } catch (error) {
      setError(getBackendErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Validar en tiempo real después de que el usuario deje de escribir
    setTimeout(() => validateField(name, value), 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl rounded-3xl p-8 w-full max-w-md">
        {/* Logo o título */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Crear Cuenta
          </h1>
          <p className="text-gray-600">Únete a Innovation Map</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-600 mr-2"
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
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre
            </label>
            <input
              type="text"
              name="nombre"
              required
              value={credentials.nombre}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
              placeholder="Tu nombre"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Apellido
            </label>
            <input
              type="text"
              name="apellido"
              required
              value={credentials.apellido}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
              placeholder="Tu apellido"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              required
              value={credentials.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
              placeholder="tu@email.com"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={credentials.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
                placeholder="Mínimo 6 caracteres"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {showPassword ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                required
                value={credentials.confirmPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
                placeholder="Repite tu contraseña"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {showConfirmPassword ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none font-semibold"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creando cuenta...
              </div>
            ) : (
              "Crear Cuenta"
            )}
          </button>
        </form>

        {/* Enlaces */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <Link
              href="/auth/login"
              className="text-purple-600 hover:text-purple-700 font-semibold"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

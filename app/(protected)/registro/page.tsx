"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { CreateEmpresaRequest } from "../../types/api";
import { EmpresaService } from "../../services/backendService";

export default function RegistroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);
  const [formData, setFormData] = useState<CreateEmpresaRequest>({
    name: "",
    url: "",
    logoUrl: "",
    sector: "",
    department: "",
    description: "",
  });

  // Función para extraer el logo automáticamente
  const extractLogoFromUrl = async (url: string) => {
    if (!url) return;

    try {
      setLogoLoading(true);

      // Asegurar que la URL tenga protocolo
      let formattedUrl = url;
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        formattedUrl = `https://${url}`;
      }

      // Extraer dominio
      const domain = new URL(formattedUrl).hostname;

      // Opciones de logos en orden de prioridad
      const logoOptions = [
        // Clearbit Logo API (gratis hasta cierto límite)
        `https://logo.clearbit.com/${domain}`,
        // Google Favicon API (más confiable para favicons)
        `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
        // DuckDuckGo Icons API
        `https://icons.duckduckgo.com/ip3/${domain}.ico`,
        // Favicon directo del sitio
        `${formattedUrl}/favicon.ico`,
        // Logo común en directorio assets
        `${formattedUrl}/assets/logo.png`,
        `${formattedUrl}/images/logo.png`,
      ];

      // Probar cada opción hasta encontrar una que funcione
      for (const logoUrl of logoOptions) {
        try {
          const response = await fetch(logoUrl, { method: "HEAD" });
          if (response.ok) {
            setFormData((prev) => ({ ...prev, logoUrl }));
            break;
          }
        } catch {
          // Continuar con la siguiente opción
          continue;
        }
      }
    } catch (error) {
      console.error("Error extrayendo logo:", error);
    } finally {
      setLogoLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Efecto para extraer logo automáticamente cuando cambia la URL
  useEffect(() => {
    if (formData.url && formData.url.trim()) {
      const timeoutId = setTimeout(() => {
        extractLogoFromUrl(formData.url.trim());
      }, 1500); // Esperar 1.5 segundos después de que deje de escribir

      return () => clearTimeout(timeoutId);
    }
  }, [formData.url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar URL
      if (formData.url && !formData.url.startsWith("http")) {
        setFormData((prev) => ({ ...prev, url: `https://${prev.url}` }));
      }

      const resultado = await EmpresaService.crearEmpresa(formData);

      if (resultado.success) {
        alert("Empresa registrada con éxito");
        router.push("/mapa");
      } else {
        console.error("Error del servidor:", resultado.message);
        alert(
          `Error al registrar empresa: ${
            resultado.message || "Error desconocido"
          }`
        );
      }
    } catch (error) {
      console.error("Error de conexión:", error);

      // Mensaje más específico según el tipo de error
      if (error instanceof TypeError && error.message.includes("fetch")) {
        alert(
          "Error de conexión: No se pudo conectar con el servidor. Verifica que tu backend esté ejecutándose."
        );
      } else {
        alert(
          `Error de conexión: ${
            error instanceof Error ? error.message : "Error desconocido"
          }`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4">
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Registrar Nueva Empresa
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Añade tu empresa al ecosistema de innovación colombiano
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre de la empresa */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre de la empresa *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors"
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
                <input
                  name="name"
                  type="text"
                  placeholder="Ejemplo: Innovación Tech SAS"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            {/* URL del sitio web */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                URL del sitio web *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </div>
                <input
                  name="url"
                  type="url"
                  placeholder="https://www.empresa.com"
                  value={formData.url}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            {/* URL del logo */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                URL del logo (opcional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {logoLoading ? (
                    <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg
                      className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </div>
                <input
                  name="logoUrl"
                  type="url"
                  placeholder={
                    logoLoading
                      ? "Extrayendo logo automáticamente..."
                      : "https://www.empresa.com/logo.png"
                  }
                  value={formData.logoUrl}
                  onChange={handleChange}
                  className="w-full pl-10 pr-32 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => extractLogoFromUrl(formData.url)}
                  disabled={!formData.url || logoLoading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-600 hover:text-purple-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  title="Extraer logo automáticamente"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>
              {formData.logoUrl && (
                <div className="mt-3 flex items-center space-x-3">
                  <span className="text-sm text-gray-600">Vista previa:</span>
                  <img
                    src={formData.logoUrl}
                    alt="Logo preview"
                    className="w-8 h-8 object-contain rounded border border-gray-200"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                💡 El logo se extraerá automáticamente cuando ingreses la URL de
                la empresa
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sector *
              </label>
              <select
                name="sector"
                value={formData.sector}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
              >
                <option value="">Selecciona un sector</option>
                <option value="Tecnología">Tecnología</option>
                <option value="Educación">Educación</option>
                <option value="Salud">Salud</option>
                <option value="Energía">Energía</option>
                <option value="Fintech">Fintech</option>
                <option value="Agroindustria">Agroindustria</option>
                <option value="Manufactura">Manufactura</option>
                <option value="Servicios">Servicios</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departamento *
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
              >
                <option value="">Selecciona un departamento</option>
                <option value="Amazonas">Amazonas</option>
                <option value="Antioquia">Antioquia</option>
                <option value="Arauca">Arauca</option>
                <option value="Atlántico">Atlántico</option>
                <option value="Bolívar">Bolívar</option>
                <option value="Boyacá">Boyacá</option>
                <option value="Caldas">Caldas</option>
                <option value="Caquetá">Caquetá</option>
                <option value="Casanare">Casanare</option>
                <option value="Cauca">Cauca</option>
                <option value="Cesar">Cesar</option>
                <option value="Chocó">Chocó</option>
                <option value="Córdoba">Córdoba</option>
                <option value="Cundinamarca">Cundinamarca</option>
                <option value="Guainía">Guainía</option>
                <option value="Guaviare">Guaviare</option>
                <option value="Huila">Huila</option>
                <option value="La Guajira">La Guajira</option>
                <option value="Magdalena">Magdalena</option>
                <option value="Meta">Meta</option>
                <option value="Nariño">Nariño</option>
                <option value="Norte de Santander">Norte de Santander</option>
                <option value="Putumayo">Putumayo</option>
                <option value="Quindío">Quindío</option>
                <option value="Risaralda">Risaralda</option>
                <option value="San Andrés y Providencia">
                  San Andrés y Providencia
                </option>
                <option value="Santander">Santander</option>
                <option value="Sucre">Sucre</option>
                <option value="Tolima">Tolima</option>
                <option value="Valle del Cauca">Valle del Cauca</option>
                <option value="Vaupés">Vaupés</option>
                <option value="Vichada">Vichada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción de la empresa *
              </label>
              <textarea
                name="description"
                rows={4}
                placeholder="Describe brevemente los productos o servicios de tu empresa..."
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 placeholder-gray-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 font-semibold text-lg"
            >
              <div className="flex items-center justify-center">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Registrando empresa...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-6 h-6 mr-2 group-hover:animate-pulse"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Registrar Empresa
                  </>
                )}
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

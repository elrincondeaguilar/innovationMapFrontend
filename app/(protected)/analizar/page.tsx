"use client";

import { useState } from "react";
import Navbar from "../../components/Navbar";

export default function AnalizarPage() {
  const [texto, setTexto] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [loading, setLoading] = useState(false);
  const [analisisRealizado, setAnalisisRealizado] = useState(false);

  const analizarConGemini = async () => {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `Analiza este texto de convocatoria y responde si está activa, cerrada o no especificada. Justifica tu respuesta:\n\n${texto}`,
      }),
    });

    const data = await res.json();
    return data.result;
  };

  const analizar = async () => {
    if (!texto.trim()) {
      setRespuesta(
        "Por favor, ingresa el texto de la convocatoria a analizar."
      );
      return;
    }

    setLoading(true);
    setRespuesta("");
    setAnalisisRealizado(false);

    try {
      const resultado = await analizarConGemini();
      setRespuesta(resultado);
      setAnalisisRealizado(true);
    } catch (error) {
      console.error("Error al analizar:", error);
      setRespuesta(
        `Error: ${error instanceof Error ? error.message : "Error desconocido"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const limpiarFormulario = () => {
    setTexto("");
    setRespuesta("");
    setAnalisisRealizado(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <Navbar />

      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-purple-800 text-sm font-medium mb-4">
            <svg
              className="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Análisis Inteligente
          </div>

          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Analizar Convocatoria
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Utiliza inteligencia artificial para analizar el estado de
            convocatorias, identificar fechas importantes y obtener insights
            valiosos
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Panel de entrada */}
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <svg
                  className="w-7 h-7 mr-3 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Texto de la Convocatoria
              </h2>

              {/* Área de texto */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Contenido de la convocatoria:
                </label>
                <textarea
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="Pega aquí el texto completo de la convocatoria que deseas analizar..."
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-500 resize-none"
                />
                <div className="text-sm text-gray-500 mt-2">
                  {texto.length > 0 && `${texto.length} caracteres`}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3">
                <button
                  onClick={analizar}
                  disabled={loading || !texto.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Analizando...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                      Analizar
                    </>
                  )}
                </button>

                <button
                  onClick={limpiarFormulario}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-300 flex items-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Limpiar
                </button>
              </div>
            </div>
          </div>

          {/* Panel de resultados */}
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <svg
                  className="w-7 h-7 mr-3 text-green-600"
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
                Resultado del Análisis
              </h2>

              {!respuesta && !loading && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">
                    Ingresa el texto de una convocatoria para comenzar el
                    análisis
                  </p>
                </div>
              )}

              {loading && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-gray-700 text-lg font-medium">
                    Analizando convocatoria con Gemini AI...
                  </p>
                </div>
              )}

              {respuesta && (
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-xl border-l-4 ${
                      respuesta.includes("Error")
                        ? "bg-red-50 border-red-500"
                        : analisisRealizado
                        ? "bg-green-50 border-green-500"
                        : "bg-blue-50 border-blue-500"
                    }`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-1 ${
                          respuesta.includes("Error")
                            ? "bg-red-100"
                            : analisisRealizado
                            ? "bg-green-100"
                            : "bg-blue-100"
                        }`}
                      >
                        <svg
                          className={`w-4 h-4 ${
                            respuesta.includes("Error")
                              ? "text-red-600"
                              : analisisRealizado
                              ? "text-green-600"
                              : "text-blue-600"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          {respuesta.includes("Error") ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          ) : (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          )}
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div
                          className={`text-sm font-medium mb-2 ${
                            respuesta.includes("Error")
                              ? "text-red-800"
                              : analisisRealizado
                              ? "text-green-800"
                              : "text-blue-800"
                          }`}
                        >
                          {respuesta.includes("Error")
                            ? "Error en el análisis"
                            : "Análisis completado"}
                        </div>
                        <pre
                          className={`text-sm whitespace-pre-wrap ${
                            respuesta.includes("Error")
                              ? "text-red-700"
                              : "text-gray-800"
                          }`}
                        >
                          {respuesta}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {analisisRealizado && !respuesta.includes("Error") && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                      <div className="flex items-center text-purple-800">
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="font-medium">
                          Análisis realizado con Gemini AI
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tips section */}
        <div className="mt-12 bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <svg
              className="w-6 h-6 mr-3 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Consejos para mejores resultados
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="flex items-start">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
              <span>
                Include el texto completo de la convocatoria, incluyendo fechas
                importantes
              </span>
            </div>
            <div className="flex items-start">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
              <span>
                Gemini AI ofrece análisis contextual y detallado de
                convocatorias
              </span>
            </div>
            <div className="flex items-start">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
              <span>
                Incluye información sobre requisitos y criterios de evaluación
              </span>
            </div>
            <div className="flex items-start">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
              <span>
                Revisa el resultado para verificar la precisión del análisis
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

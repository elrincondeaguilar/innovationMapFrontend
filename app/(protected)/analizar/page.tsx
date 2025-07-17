"use client";

import { useState } from "react";
import Navbar from "../../components/Navbar";
import { ConvocatoriaService } from "../../services/backendService";
import { AnalisisConvocatoria } from "../../types/api";

interface ConvocatoriaData {
  titulo: string;
  descripcion: string;
  categoria: string;
  entidad: string;
  requisitos: string[];
  presupuesto?: number;
}

export default function AnalizarPage() {
  const [url, setUrl] = useState("");
  const [texto, setTexto] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analisisData, setAnalisisData] = useState<AnalisisConvocatoria | null>(null);
  const [convocatoriaExtraida, setConvocatoriaExtraida] = useState<ConvocatoriaData | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Función para analizar con Gemini
  const analizarConGemini = async (textoCompleto: string) => {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `Analiza esta convocatoria y extrae la información en formato JSON válido. Responde ÚNICAMENTE con el JSON, sin texto adicional:

{
  "estado": "activa" | "cerrada" | "no_especificada",
  "justificacion": "explicación del estado",
  "fechasEncontradas": {
    "inicio": "YYYY-MM-DD o null",
    "fin": "YYYY-MM-DD o null"
  },
  "confianza": número entre 0-100,
  "datosConvocatoria": {
    "titulo": "título extraído",
    "descripcion": "descripción completa",
    "categoria": "categoría identificada",
    "entidad": "entidad convocante",
    "requisitos": ["req1", "req2", "req3"],
    "presupuesto": número o null
  }
}

IMPORTANTE: Responde SOLO el JSON válido, sin explicaciones adicionales.

Texto de la convocatoria:
${textoCompleto}`,
      }),
    });

    const data = await res.json();
    return data.result;
  };

  // Procesar URL para extraer y analizar automáticamente
  const procesarUrl = async () => {
    if (!url.trim()) {
      setError("Por favor, ingresa una URL válida");
      return;
    }

    setLoading(true);
    setError("");
    setRespuesta("");
    setAnalisisData(null);
    setConvocatoriaExtraida(null);

    try {
      // Extraer texto de la URL
      const response = await fetch('/api/scraper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Error al extraer el texto de la URL');
      }

      const data = await response.json();
      setTexto(data.text);
      
      // Analizar automáticamente el texto extraído
      await analizarTexto(data.text);
    } catch (error) {
      console.error("Error procesando URL:", error);
      setError('No se pudo extraer el texto de la URL proporcionada. Verifica que la URL sea válida y esté accesible.');
    } finally {
      setLoading(false);
    }
  };

  const analizarTexto = async (textoAAnalizar?: string) => {
    const textoCompleto = textoAAnalizar || texto;
    
    if (!textoCompleto.trim()) {
      setRespuesta("Por favor, ingresa el texto de la convocatoria a analizar.");
      return;
    }

    setLoading(true);
    setRespuesta("");
    setAnalisisData(null);
    setConvocatoriaExtraida(null);

    try {
      const resultado = await analizarConGemini(textoCompleto);
      
      // Limpiar el resultado para extraer solo el JSON
      let jsonString = resultado.trim();
      
      // Buscar el JSON en el resultado si viene con texto adicional
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }
      
      try {
        // Intentar parsear el JSON
        const analisisJSON = JSON.parse(jsonString);
        
        setAnalisisData(analisisJSON);
        setConvocatoriaExtraida(analisisJSON.datosConvocatoria);
        
        // Formatear la respuesta para mostrar
        const respuestaFormateada = `
✅ **Análisis completado**

**Estado de la convocatoria:** ${analisisJSON.estado === 'activa' ? '🟢 Activa' : analisisJSON.estado === 'cerrada' ? '🔴 Cerrada' : '⚫ No especificado'}
**Justificación:** ${analisisJSON.justificacion}
**Nivel de confianza:** ${analisisJSON.confianza}%

**Fechas encontradas:**
- Inicio: ${analisisJSON.fechasEncontradas?.inicio || 'No especificada'}
- Fin: ${analisisJSON.fechasEncontradas?.fin || 'No especificada'}

**Datos extraídos:**
- **Título:** ${analisisJSON.datosConvocatoria?.titulo || 'No especificado'}
- **Entidad:** ${analisisJSON.datosConvocatoria?.entidad || 'No especificada'}
- **Categoría:** ${analisisJSON.datosConvocatoria?.categoria || 'No especificada'}
- **Presupuesto:** ${analisisJSON.datosConvocatoria?.presupuesto ? `$${analisisJSON.datosConvocatoria.presupuesto.toLocaleString()}` : 'No especificado'}
- **Requisitos:** ${analisisJSON.datosConvocatoria?.requisitos?.length > 0 ? analisisJSON.datosConvocatoria.requisitos.join(', ') : 'No especificados'}
        `.trim();
        
        setRespuesta(respuestaFormateada);
        
        // Mostrar diálogo para agregar manualmente
        setShowConfirmDialog(true);
        
      } catch (parseError) {
        console.error("Error al parsear JSON:", parseError);
        setRespuesta(resultado);
        
        // Crear datos básicos para poder agregar manualmente
        const tituloExtraido = textoCompleto.split('\n')
          .find(line => line.trim().length > 10 && line.trim().length < 200)
          ?.trim() || "Convocatoria";
        
        const datosBasicos: ConvocatoriaData = {
          titulo: tituloExtraido,
          descripcion: textoCompleto.substring(0, 500) + "...",
          categoria: "Sin categorizar",
          entidad: "Por determinar",
          requisitos: ["Revisar documento completo"]
        };
        
        const analisisBasico: AnalisisConvocatoria = {
          estado: "no_especificada",
          justificacion: "Análisis manual requerido",
          fechasEncontradas: {},
          confianza: 50
        };
        
        setConvocatoriaExtraida(datosBasicos);
        setAnalisisData(analisisBasico);
        setShowConfirmDialog(true);
      }
      
    } catch (error) {
      console.error("Error en análisis:", error);
      setRespuesta(
        error instanceof Error ? error.message : "Error al analizar el texto"
      );
    } finally {
      setLoading(false);
    }
  };

  const agregarConvocatoria = async () => {
    if (!convocatoriaExtraida || !analisisData) return;

    setGuardando(true);
    try {
      await ConvocatoriaService.crearConvocatoria({
        ...convocatoriaExtraida,
        fechaInicio: analisisData.fechasEncontradas?.inicio || new Date().toISOString().split('T')[0],
        fechaFin: analisisData.fechasEncontradas?.fin || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        estado: analisisData.estado === 'activa' ? 'activa' : analisisData.estado === 'cerrada' ? 'cerrada' : 'pendiente'
      });
      
      setRespuesta(respuesta + "\n\n✅ ¡Convocatoria agregada exitosamente!");
      setShowConfirmDialog(false);
      
      // Limpiar el formulario después de agregar
      setTimeout(() => {
        limpiarFormulario();
      }, 2000);
      
    } catch (error) {
      console.error("Error agregando convocatoria:", error);
      setRespuesta(respuesta + "\n\n❌ Error al agregar la convocatoria. Por favor, intenta nuevamente.");
    } finally {
      setGuardando(false);
    }
  };

  const limpiarFormulario = () => {
    setUrl("");
    setTexto("");
    setRespuesta("");
    setError("");
    setAnalisisData(null);
    setConvocatoriaExtraida(null);
    setShowConfirmDialog(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Sección principal */}
          <div className="bg-white rounded-2xl shadow-2xl border border-purple-100 p-8 mb-8">
            <div className="max-w-2xl mx-auto">
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
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                Analizar Convocatoria por URL
              </h2>

              {/* Campo URL */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  URL de la convocatoria:
                </label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://ejemplo.com/convocatoria"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
                  />
                  <button
                    onClick={procesarUrl}
                    disabled={loading || !url.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 flex items-center justify-center"
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
                        Analizar URL
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Ingresa la URL de una convocatoria para extraer y analizar automáticamente su contenido
                </p>
              </div>

              {/* Mostrar error si existe */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Mostrar texto extraído si existe */}
              {texto && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl border">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Texto extraído:</h4>
                  <div className="text-xs text-gray-600 max-h-32 overflow-y-auto">
                    {texto.substring(0, 500)}...
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {texto.length} caracteres extraídos
                  </p>
                </div>
              )}

              <button
                onClick={limpiarFormulario}
                className="w-full mt-4 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center"
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

          {/* Mostrar respuesta */}
          {respuesta && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <svg
                  className="w-6 h-6 mr-3 text-green-600"
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
                Resultado del Análisis
              </h3>
              <div className="bg-gray-50 rounded-xl p-6 border">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                  {respuesta}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Diálogo de confirmación para agregar convocatoria */}
        {showConfirmDialog && convocatoriaExtraida && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  ¿Agregar Convocatoria?
                </h3>
                
                <div className="space-y-4 mb-8">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Título:</h4>
                    <p className="text-gray-700">{convocatoriaExtraida.titulo}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Entidad:</h4>
                    <p className="text-gray-700">{convocatoriaExtraida.entidad}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Categoría:</h4>
                    <p className="text-gray-700">{convocatoriaExtraida.categoria}</p>
                  </div>
                  
                  {analisisData && (
                    <div className="bg-blue-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Estado detectado:</h4>
                      <p className="text-gray-700">
                        {analisisData.estado === 'activa' ? '🟢 Activa' : 
                         analisisData.estado === 'cerrada' ? '🔴 Cerrada' : 
                         '⚫ No especificado'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={agregarConvocatoria}
                    disabled={guardando}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 flex items-center justify-center"
                  >
                    {guardando ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Agregando...
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
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        Sí, agregar convocatoria
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowConfirmDialog(false)}
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

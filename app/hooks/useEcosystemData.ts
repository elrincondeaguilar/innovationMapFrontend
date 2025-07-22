import { useState, useEffect, useCallback } from 'react';
import { EcosystemMapItem, ServiceResponse } from '../types/api';
import { EcosystemService } from '../services/nuevasEntidadesService';

interface UseEcosystemDataOptions {
  autoRefreshInterval?: number; // en milisegundos
  enableAutoRefresh?: boolean;
}

export function useEcosystemData(options: UseEcosystemDataOptions = {}) {
  const { autoRefreshInterval = 30000, enableAutoRefresh = false } = options;
  
  const [ecosystemItems, setEcosystemItems] = useState<EcosystemMapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result: ServiceResponse<EcosystemMapItem[]> = await EcosystemService.getAllEcosystemItems();
      
      if (result.success && result.data) {
        setEcosystemItems(result.data);
        setLastUpdate(new Date());
        
        if (process.env.NODE_ENV === "development") {
          console.log("🗺️ Ecosystem data updated:", {
            total: result.data.length,
            companies: result.data.filter(item => item.tipo === "Company").length,
            articuladores: result.data.filter(item => item.tipo === "Articulador").length,
            convocatorias: result.data.filter(item => item.tipo === "Convocatoria").length,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        setError(result.message || "Error al cargar datos");
      }
    } catch (error) {
      console.error("Error fetching ecosystem data:", error);
      setError("Error al cargar los datos del ecosistema");
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para refrescar manualmente
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Efecto inicial
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh si está habilitado
  useEffect(() => {
    if (!enableAutoRefresh || !autoRefreshInterval) return;

    const interval = setInterval(() => {
      if (!loading) { // Solo refrescar si no está cargando
        fetchData();
      }
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [enableAutoRefresh, autoRefreshInterval, loading, fetchData]);

  return {
    ecosystemItems,
    loading,
    error,
    lastUpdate,
    refresh,
    // Funciones de utilidad
    getItemsByType: useCallback((tipo: string) => 
      ecosystemItems.filter(item => item.tipo === tipo), [ecosystemItems]
    ),
    getTotalCount: useCallback(() => ecosystemItems.length, [ecosystemItems]),
    getCountByType: useCallback(() => {
      const counts = ecosystemItems.reduce((acc, item) => {
        acc[item.tipo] = (acc[item.tipo] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      return counts;
    }, [ecosystemItems])
  };
}

// Hook específico para el mapa con configuración optimizada
export function useMapEcosystemData() {
  return useEcosystemData({
    autoRefreshInterval: 60000, // 1 minuto
    enableAutoRefresh: false // Deshabilitado por defecto para evitar consumo excesivo
  });
}
import { 
  Promotor, 
  Articulador, 
  PortafolioArco,
  EcosystemMapItem,
  Company,
  Convocatoria
} from '../types/api';

// URL base del backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:7036/api';

console.log('🔗 API_BASE_URL configurada:', API_BASE_URL);

// Función auxiliar para manejar respuestas de la API
async function handleResponse<T>(response: Response): Promise<{ success: boolean; data?: T; message?: string }> {
  try {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      return {
        success: false,
        message: errorData.message || `Error ${response.status}: ${response.statusText}`
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error de conexión'
    };
  }
}

// 🆕 Servicio para Promotores
export const PromotorService = {
  // Obtener todos los promotores
  async getAll(): Promise<{ success: boolean; data?: Promotor[]; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/promotores`);
      return await handleResponse<Promotor[]>(response);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  },

  // Obtener promotor por ID
  async getById(id: number): Promise<{ success: boolean; data?: Promotor; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/promotores/${id}`);
      return await handleResponse<Promotor>(response);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  },

  // Crear nuevo promotor
  async create(promotor: Omit<Promotor, 'id'>): Promise<{ success: boolean; data?: Promotor; message?: string }> {
    try {
      // 🆕 Log para debug
      console.log('Sending promotor data:', JSON.stringify(promotor, null, 2));
      
      const response = await fetch(`${API_BASE_URL}/promotores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promotor),
      });
      
      // 🆕 Log de respuesta
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        return {
          success: false,
          message: `Error ${response.status}: ${errorText}`
        };
      }
      
      return await handleResponse<Promotor>(response);
    } catch (error) {
      console.error('Network error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  },

  // Actualizar promotor
  async update(id: number, promotor: Partial<Omit<Promotor, 'id'>>): Promise<{ success: boolean; data?: Promotor; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/promotores/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promotor),
      });
      return await handleResponse<Promotor>(response);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  },

  // Eliminar promotor
  async delete(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/promotores/${id}`, {
        method: 'DELETE',
      });
      return await handleResponse<void>(response);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  },

  // Health check
  async health(): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/promotores/health`);
      return await handleResponse<void>(response);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  }
};

// 🆕 Servicio para Articuladores
export const ArticuladorService = {
  // Obtener todos los articuladores
  async getAll(): Promise<{ success: boolean; data?: Articulador[]; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/articuladores`);
      return await handleResponse<Articulador[]>(response);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  },

  // Obtener articulador por ID
  async getById(id: number): Promise<{ success: boolean; data?: Articulador; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/articuladores/${id}`);
      return await handleResponse<Articulador>(response);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  },

  // Crear nuevo articulador
  async create(articulador: Omit<Articulador, 'id'>): Promise<{ success: boolean; data?: Articulador; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/articuladores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articulador),
      });
      return await handleResponse<Articulador>(response);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  },

  // Actualizar articulador
  async update(id: number, articulador: Partial<Omit<Articulador, 'id'>>): Promise<{ success: boolean; data?: Articulador; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/articuladores/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articulador),
      });
      return await handleResponse<Articulador>(response);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  },

  // Eliminar articulador
  async delete(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/articuladores/${id}`, {
        method: 'DELETE',
      });
      return await handleResponse<void>(response);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  },

  // Health check
  async health(): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/articuladores/health`);
      return await handleResponse<void>(response);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  }
};

// 🆕 Servicio para PortafolioArco
export const PortafolioArcoService = {
  // Obtener todos los portafolios
  async getAll(): Promise<{ success: boolean; data?: PortafolioArco[]; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/portafolioarco`);
      return await handleResponse<PortafolioArco[]>(response);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  },

  // Obtener portafolio por ID
  async getById(id: number): Promise<{ success: boolean; data?: PortafolioArco; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/portafolioarco/${id}`);
      return await handleResponse<PortafolioArco>(response);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  },

  // Crear nuevo portafolio
  async create(portafolio: Omit<PortafolioArco, 'id'>): Promise<{ success: boolean; data?: PortafolioArco; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/portafolioarco`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(portafolio),
      });
      return await handleResponse<PortafolioArco>(response);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  },

  // Actualizar portafolio
  async update(id: number, portafolio: Partial<Omit<PortafolioArco, 'id'>>): Promise<{ success: boolean; data?: PortafolioArco; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/portafolioarco/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(portafolio),
      });
      return await handleResponse<PortafolioArco>(response);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  },

  // Eliminar portafolio
  async delete(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/portafolioarco/${id}`, {
        method: 'DELETE',
      });
      return await handleResponse<void>(response);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  },

  // Health check
  async health(): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/portafolioarco/health`);
      return await handleResponse<void>(response);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  }
};

// 🆕 Servicio unificado para el ecosistema
export const EcosystemService = {
  // Obtener todos los elementos del ecosistema en formato unificado para el mapa
  async getAllEcosystemItems(): Promise<{ success: boolean; data?: EcosystemMapItem[]; message?: string }> {
    try {
      const [promotoressResult, articuladoresResult, portfoliosResult] = await Promise.all([
        PromotorService.getAll(),
        ArticuladorService.getAll(),
        PortafolioArcoService.getAll()
      ]);

      const ecosystemItems: EcosystemMapItem[] = [];

      // Convertir promotores
      if (promotoressResult.success && promotoressResult.data) {
        promotoressResult.data.forEach(promotor => {
          ecosystemItems.push({
            id: promotor.id,
            nombre: promotor.nombre,
            tipo: 'Promotor',
            descripcion: promotor.descripcion,
            ciudad: promotor.ciudad,
            departamento: promotor.departamento,
            latitud: promotor.latitud,
            longitud: promotor.longitud,
            tipoPromotor: promotor.tipoPromotor
          });
        });
      }

      // Convertir articuladores
      if (articuladoresResult.success && articuladoresResult.data) {
        articuladoresResult.data.forEach(articulador => {
          ecosystemItems.push({
            id: articulador.id,
            nombre: articulador.nombre,
            tipo: 'Articulador',
            descripcion: articulador.descripcion,
            ciudad: articulador.ciudad,
            departamento: articulador.departamento,
            latitud: articulador.latitud,
            longitud: articulador.longitud,
            experiencia: articulador.experiencia,
            areasExperiencia: articulador.areasExperiencia
          });
        });
      }

      // Convertir portafolios
      if (portfoliosResult.success && portfoliosResult.data) {
        portfoliosResult.data.forEach(portfolio => {
          ecosystemItems.push({
            id: portfolio.id,
            nombre: portfolio.nombre,
            tipo: 'PortafolioArco',
            descripcion: portfolio.descripcion,
            ciudad: portfolio.ciudad,
            departamento: portfolio.departamento,
            latitud: portfolio.latitud,
            longitud: portfolio.longitud,
            objetivos: portfolio.objetivos,
            publico: portfolio.publico
          });
        });
      }

      return { success: true, data: ecosystemItems };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error obteniendo elementos del ecosistema'
      };
    }
  },

  // Obtener empresas del ecosistema (desde el servicio de backend existente)
  async getCompaniesAsEcosystemItems(): Promise<{ success: boolean; data?: EcosystemMapItem[]; message?: string }> {
    try {
      // Usar el endpoint existente de companies
      const response = await fetch(`${API_BASE_URL}/companies`);
      const result = await handleResponse<Company[]>(response);

      if (result.success && result.data) {
        const companyItems: EcosystemMapItem[] = result.data.map(company => ({
          id: company.id,
          nombre: company.name,
          tipo: 'Company' as const,
          descripcion: company.description,
          ciudad: company.ciudad,
          departamento: company.departamento,
          latitud: company.latitud,
          longitud: company.longitud,
          industry: company.industry,
          fundada: company.founded
        }));

        return { success: true, data: companyItems };
      }

      return { success: false, message: result.message || 'No se pudieron obtener las empresas' };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error obteniendo empresas'
      };
    }
  },

  // Obtener convocatorias del ecosistema
  async getConvocatoriasAsEcosystemItems(): Promise<{ success: boolean; data?: EcosystemMapItem[]; message?: string }> {
    try {
      // Usar el endpoint existente de convocatorias
      const response = await fetch(`${API_BASE_URL}/convocatorias`);
      const result = await handleResponse<Convocatoria[]>(response);

      if (result.success && result.data) {
        const convocatoriaItems: EcosystemMapItem[] = result.data.map(convocatoria => ({
          id: convocatoria.id || 0,
          nombre: convocatoria.titulo,
          tipo: 'Convocatoria' as const,
          descripcion: convocatoria.descripcion,
          categoria: convocatoria.categoria,
          entidad: convocatoria.entidad,
          fechaInicio: convocatoria.fechaInicio,
          fechaFin: convocatoria.fechaFin,
          estado: convocatoria.estado
        }));

        return { success: true, data: convocatoriaItems };
      }

      return { success: false, message: result.message || 'No se pudieron obtener las convocatorias' };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error obteniendo convocatorias'
      };
    }
  },

  // Obtener todos los elementos del ecosistema incluyendo empresas y convocatorias
  async getAllEcosystemWithCompanies(): Promise<{ success: boolean; data?: EcosystemMapItem[]; message?: string }> {
    try {
      const [ecosystemResult, companiesResult, convocatoriasResult] = await Promise.all([
        this.getAllEcosystemItems(),
        this.getCompaniesAsEcosystemItems(),
        this.getConvocatoriasAsEcosystemItems()
      ]);

      const allItems: EcosystemMapItem[] = [];

      if (ecosystemResult.success && ecosystemResult.data) {
        allItems.push(...ecosystemResult.data);
      }

      if (companiesResult.success && companiesResult.data) {
        allItems.push(...companiesResult.data);
      }

      if (convocatoriasResult.success && convocatoriasResult.data) {
        allItems.push(...convocatoriasResult.data);
      }

      return { success: true, data: allItems };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error obteniendo todos los elementos del ecosistema'
      };
    }
  }
};

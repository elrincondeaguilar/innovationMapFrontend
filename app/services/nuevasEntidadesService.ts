import { 
  Promotor, 
  Articulador, 
  PortafolioArco,
  EcosystemMapItem,
  Company,
  Convocatoria
} from '../types/api';

// URL base del backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://backinovationmap.onrender.com/api';

// 🆕 Configuración para modo fallback
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// URLs para proxy (evita problemas de CORS en producción)
const PROXY_BASE_URL = IS_PRODUCTION ? '/api/proxy' : API_BASE_URL;

// Log configuration in development mode only
if (IS_DEVELOPMENT) {
  console.log('🔗 API Configuration:', {
    API_BASE_URL,
    PROXY_BASE_URL,
    USE_MOCK_DATA,
    IS_DEVELOPMENT,
    IS_PRODUCTION
  });
}

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
      const response = await fetch(`${PROXY_BASE_URL}/Promotores`);
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
      const response = await fetch(`${PROXY_BASE_URL}/Promotores/${id}`);
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
      const response = await fetch(`${PROXY_BASE_URL}/Promotores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promotor),
      });
      
      // 🆕 Log de respuesta
      if (!response.ok) {
        const errorText = await response.text();
        if (IS_DEVELOPMENT) {
          console.error('Backend error response:', errorText);
        }
        return {
          success: false,
          message: `Error ${response.status}: ${errorText}`
        };
      }
      
      return await handleResponse<Promotor>(response);
    } catch (error) {
      if (IS_DEVELOPMENT) {
        console.error('Network error:', error);
      }
      
      // 🆕 Detectar específicamente errores de CORS
      const errorMessage = error instanceof Error ? error.message : 'Error de conexión';
      
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('CORS') || errorMessage.includes('Access-Control-Allow-Origin')) {
        return {
          success: false,
          message: `Error CORS: El backend no permite conexiones desde este dominio. Contacta al administrador del backend para agregar: ${window.location.origin} a las políticas de CORS.`
        };
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  // Actualizar promotor
  async update(id: number, promotor: Partial<Omit<Promotor, 'id'>>): Promise<{ success: boolean; data?: Promotor; message?: string }> {
    try {
      const response = await fetch(`${PROXY_BASE_URL}/Promotores?id=${id}`, {
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
      const response = await fetch(`${PROXY_BASE_URL}/Promotores?id=${id}`, {
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
      const response = await fetch(`${PROXY_BASE_URL}/Promotores`);
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
      const response = await fetch(`${PROXY_BASE_URL}/articuladores`);
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
      const response = await fetch(`${PROXY_BASE_URL}/articuladores/${id}`);
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
      const response = await fetch(`${PROXY_BASE_URL}/articuladores`, {
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
      const response = await fetch(`${PROXY_BASE_URL}/articuladores/${id}`, {
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
      const response = await fetch(`${PROXY_BASE_URL}/articuladores?id=${id}`, {
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
      const response = await fetch(`${PROXY_BASE_URL}/articuladores`);
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
      const response = await fetch(`${PROXY_BASE_URL}/portafolioarco`);
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
      const response = await fetch(`${PROXY_BASE_URL}/portafolioarco/${id}`);
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
      const response = await fetch(`${PROXY_BASE_URL}/portafolioarco`, {
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
      const response = await fetch(`${PROXY_BASE_URL}/portafolioarco/${id}`, {
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
      const response = await fetch(`${PROXY_BASE_URL}/portafolioarco?id=${id}`, {
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
      const response = await fetch(`${PROXY_BASE_URL}/portafolioarco`);
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
  // 🆕 Verificar qué endpoints están disponibles
  async checkAvailableEndpoints(): Promise<{ available: string[]; unavailable: string[] }> {
    const endpointsToCheck = [
      '/Promotores',
      '/promotores',
      '/articuladores', 
      '/portafolioarco',
      '/api/Companies',
      '/companies',
      '/empresas',
      '/Company',
      '/Empresa', 
      '/convocatorias',
      '/Convocatorias',
      '/Convocatoria'
    ];

    const available: string[] = [];
    const unavailable: string[] = [];

    for (const endpoint of endpointsToCheck) {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'HEAD' });
        if (response.ok) {
          available.push(endpoint);
        } else {
          unavailable.push(`${endpoint} (${response.status})`);
        }
      } catch {
        unavailable.push(`${endpoint} (network error)`);
      }
    }
    
    return { available, unavailable };
  },

  // 🆕 Datos mock como fallback
  getMockCompanies(): EcosystemMapItem[] {
    return [
      {
        id: 1,
        nombre: "Tech Innovation SAS",
        tipo: 'Company' as const,
        descripcion: "Empresa de desarrollo de software y tecnología",
        ciudad: "Medellín",
        departamento: "Antioquia",
        latitud: 6.2442,
        longitud: -75.5812,
        industry: "Tecnología",
        fundada: 2020
      },
      {
        id: 2,
        nombre: "Green Solutions SA",
        tipo: 'Company' as const,
        descripcion: "Soluciones ambientales sostenibles",
        ciudad: "Bogotá",
        departamento: "Cundinamarca", 
        latitud: 4.6097,
        longitud: -74.0817,
        industry: "Medio Ambiente",
        fundada: 2019
      },
      {
        id: 3,
        nombre: "Digital Marketing Pro",
        tipo: 'Company' as const,
        descripcion: "Agencia de marketing digital y publicidad",
        ciudad: "Cali",
        departamento: "Valle del Cauca",
        latitud: 3.4516,
        longitud: -76.5320,
        industry: "Marketing",
        fundada: 2021
      }
    ];
  },

  getMockConvocatorias(): EcosystemMapItem[] {
    return [
      {
        id: 1,
        nombre: "Convocatoria de Innovación 2025",
        tipo: 'Convocatoria' as const,
        descripcion: "Programa de apoyo a emprendimientos innovadores",
        categoria: "Innovación",
        entidad: "MinCiencias",
        fechaInicio: "2025-02-01",
        fechaFin: "2025-04-30",
        estado: "Abierta",
        latitud: 4.6097,
        longitud: -74.0817
      },
      {
        id: 2,
        nombre: "Fondo Emprender Regional",
        tipo: 'Convocatoria' as const,
        descripcion: "Financiación para empresas del sector tecnológico",
        categoria: "Emprendimiento",
        entidad: "Cámara de Comercio",
        fechaInicio: "2025-01-15",
        fechaFin: "2025-03-15",
        estado: "Abierta",
        latitud: 6.2442,
        longitud: -75.5812
      }
    ];
  },
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
          // 🆕 Solo agregar si tiene coordenadas
          if (promotor.latitud && promotor.longitud) {
            ecosystemItems.push({
              id: promotor.id,
              nombre: promotor.medio || `Promotor ${promotor.id}`, // Usar 'medio' como nombre
              tipo: 'Promotor',
              descripcion: promotor.descripcion,
              ciudad: promotor.ciudad,
              departamento: promotor.departamento,
              latitud: promotor.latitud,
              longitud: promotor.longitud,
              tipoPromotor: promotor.medio // Usar 'medio' como tipo de promotor
            });
          }
        });
      }

      // Convertir articuladores
      if (articuladoresResult.success && articuladoresResult.data) {
        articuladoresResult.data.forEach(articulador => {
          // 🆕 Solo agregar si tiene coordenadas
          if (articulador.latitud && articulador.longitud) {
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
          }
        });
      }

      // Convertir portafolios
      if (portfoliosResult.success && portfoliosResult.data) {
        portfoliosResult.data.forEach(portfolio => {
          // 🆕 Solo agregar si tiene coordenadas
          if (portfolio.latitud && portfolio.longitud) {
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
          }
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
    // Si está configurado para usar mock data, devolver inmediatamente
    if (USE_MOCK_DATA) {
      const mockCompanies = this.getMockCompanies();
      return { 
        success: true, 
        data: mockCompanies,
        message: 'Usando datos de ejemplo (configurado)'
      };
    }

    try {
      
      // Lista de endpoints posibles para empresas
      const possibleEndpoints = [
        '/api/Companies',  // Endpoint correcto confirmado por el usuario
        '/companies',
        '/empresas', 
        '/Company',
        '/Empresa'
      ];

      let response: Response | null = null;
      let usedEndpoint = '';

      // Probar cada endpoint hasta encontrar uno que funcione
      for (const endpoint of possibleEndpoints) {
        try {
          const testUrl = `${API_BASE_URL}${endpoint}`;
          
          const testResponse = await fetch(testUrl);
          if (testResponse.ok) {
            response = testResponse;
            usedEndpoint = endpoint;
            break;
          }
        } catch {
          // Continúa al siguiente endpoint
        }
      }

      if (!response) {
        const mockCompanies = this.getMockCompanies();
        return { 
          success: true, 
          data: mockCompanies,
          message: 'Usando datos de ejemplo (no se encontró endpoint válido para empresas)'
        };
      }
      
      const result = await handleResponse<Company[]>(response);
      if (IS_DEVELOPMENT) {
        console.log(`🏢 Companies data received from ${usedEndpoint}:`, result);
      }

      if (result.success && result.data) {
        const companyItems: EcosystemMapItem[] = result.data.map((company, index) => ({
          id: company.id,
          nombre: company.name,
          tipo: 'Company' as const,
          descripcion: company.description,
          ciudad: company.ciudad || company.department, // Usar department si ciudad no existe
          departamento: company.department,
          // Usar coordenadas por defecto si no tiene (similar a convocatorias)
          latitud: company.latitud || (6.2442 + (index * 0.01)), // Medellín + offset
          longitud: company.longitud || (-75.5812 + (index * 0.01)),
          industry: company.industry || company.sector,
          fundada: company.founded
        }));

        if (IS_DEVELOPMENT) {
          console.log(`🏢 Companies loaded: ${companyItems.length}/${result.data.length}`);
        }
        return { success: true, data: companyItems };
      }

      return { success: false, message: result.message || 'No se pudieron obtener las empresas' };
    } catch (error) {
      if (IS_DEVELOPMENT) {
        console.error('🏢 Error fetching companies:', error);
      }
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error obteniendo empresas'
      };
    }
  },

  // Obtener convocatorias del ecosistema
  async getConvocatoriasAsEcosystemItems(): Promise<{ success: boolean; data?: EcosystemMapItem[]; message?: string }> {
    // Si está configurado para usar mock data, devolver inmediatamente
    if (USE_MOCK_DATA) {
      const mockConvocatorias = this.getMockConvocatorias();
      return { 
        success: true, 
        data: mockConvocatorias,
        message: 'Usando datos de ejemplo (configurado)'
      };
    }

    try {
      // Intentar usar el proxy primero
      let response: Response | null = null;
      
      try {
        response = await fetch(`${PROXY_BASE_URL}/convocatorias`);
        if (response.ok && IS_DEVELOPMENT) {
          console.log('✅ Convocatorias proxy working');
        }
      } catch {
        if (IS_DEVELOPMENT) {
          console.log('❌ Convocatorias proxy failed, trying direct endpoints');
        }
        response = null;
      }

      // Si el proxy falla, intentar endpoints directos
      if (!response || !response.ok) {
        const possibleEndpoints = [
          '/api/Convocatorias',
          '/Convocatorias', 
          '/convocatorias',
          '/api/convocatorias'
        ];

        for (const endpoint of possibleEndpoints) {
          try {
            const testUrl = `${API_BASE_URL}${endpoint}`;
            if (IS_DEVELOPMENT) {
              console.log(`🔍 Trying endpoint: ${testUrl}`);
            }
            
            const testResponse = await fetch(testUrl);
            if (testResponse.ok) {
              response = testResponse;
              if (IS_DEVELOPMENT) {
                console.log(`✅ Found working convocatorias endpoint: ${testUrl}`);
              }
              break;
            } else if (IS_DEVELOPMENT) {
              console.log(`❌ Failed endpoint ${testUrl}: ${testResponse.status}`);
            }
          } catch {
            if (IS_DEVELOPMENT) {
              console.log(`❌ Error with endpoint ${endpoint}`);
            }
          }
        }
      }

      if (!response || !response.ok) {
        if (IS_DEVELOPMENT) {
          console.error('❌ No working convocatorias endpoint found, using mock data');
        }
        const mockConvocatorias = this.getMockConvocatorias();
        return { 
          success: true, 
          data: mockConvocatorias,
          message: 'Usando datos de ejemplo (no se encontró endpoint válido para convocatorias)'
        };
      }
      
      const result = await handleResponse<Convocatoria[]>(response);

      if (result.success && result.data) {
        const convocatoriaItems: EcosystemMapItem[] = result.data.map((convocatoria, index) => ({
          id: convocatoria.id || 0,
          nombre: convocatoria.titulo,
          tipo: 'Convocatoria' as const,
          descripcion: convocatoria.descripcion,
          categoria: convocatoria.categoria,
          entidad: convocatoria.entidad,
          fechaInicio: convocatoria.fechaInicio,
          fechaFin: convocatoria.fechaFin,
          estado: convocatoria.estado,
          latitud: 4.6097 + (index * 0.01), // Bogotá + offset
          longitud: -74.0817 + (index * 0.01)
        }));

        return { success: true, data: convocatoriaItems };
      }

      return { success: false, message: result.message || 'No se pudieron obtener las convocatorias' };
    } catch (error) {
      if (IS_DEVELOPMENT) {
        console.error('📢 Error fetching convocatorias:', error);
      }
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error obteniendo convocatorias'
      };
    }
  },

  // Obtener todos los elementos del ecosistema incluyendo empresas y convocatorias
  async getAllEcosystemWithCompanies(): Promise<{ success: boolean; data?: EcosystemMapItem[]; message?: string }> {
    try {
      if (IS_DEVELOPMENT) {
        console.log('🚀 Starting to fetch all ecosystem data...');
      }
      
      const [ecosystemResult, companiesResult, convocatoriasResult] = await Promise.all([
        this.getAllEcosystemItems(),
        this.getCompaniesAsEcosystemItems(),
        this.getConvocatoriasAsEcosystemItems()
      ]);

      const allItems: EcosystemMapItem[] = [];

      if (ecosystemResult.success && ecosystemResult.data) {
        if (IS_DEVELOPMENT) {
          console.log(`🎯 Ecosystem items loaded: ${ecosystemResult.data.length}`);
        }
        allItems.push(...ecosystemResult.data);
      }

      if (companiesResult.success && companiesResult.data) {
        if (IS_DEVELOPMENT) {
          console.log(`🏢 Companies loaded: ${companiesResult.data.length}`);
        }
        allItems.push(...companiesResult.data);
      }

      if (convocatoriasResult.success && convocatoriasResult.data) {
        if (IS_DEVELOPMENT) {
          console.log(`📢 Convocatorias loaded: ${convocatoriasResult.data.length}`);
        }
        allItems.push(...convocatoriasResult.data);
      }

      if (IS_DEVELOPMENT) {
        console.log(`📊 Total ecosystem items: ${allItems.length}`);
        console.log('📊 Items by type:', {
          companies: allItems.filter(item => item.tipo === 'Company').length,
          promotores: allItems.filter(item => item.tipo === 'Promotor').length,
          articuladores: allItems.filter(item => item.tipo === 'Articulador').length,
          portfolios: allItems.filter(item => item.tipo === 'PortafolioArco').length,
          convocatorias: allItems.filter(item => item.tipo === 'Convocatoria').length
        });
      }

      return { success: true, data: allItems };
    } catch (error) {
      if (IS_DEVELOPMENT) {
        console.error('❌ Error in getAllEcosystemWithCompanies:', error);
      }
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error obteniendo todos los elementos del ecosistema'
      };
    }
  }
};

import { 
  Promotor, 
  Articulador, 
  PortafolioArco,
  CreatePromotorRequest,
  CreateArticuladorRequest,
  CreatePortafolioArcoRequest 
} from '../types/api';

// URL base del backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7036/api';

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
  async create(promotor: CreatePromotorRequest): Promise<{ success: boolean; data?: Promotor; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/promotores`, {
        method: 'POST',
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

  // Actualizar promotor
  async update(id: number, promotor: Partial<CreatePromotorRequest>): Promise<{ success: boolean; data?: Promotor; message?: string }> {
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
  async create(articulador: CreateArticuladorRequest): Promise<{ success: boolean; data?: Articulador; message?: string }> {
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
  async update(id: number, articulador: Partial<CreateArticuladorRequest>): Promise<{ success: boolean; data?: Articulador; message?: string }> {
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
  async create(portafolio: CreatePortafolioArcoRequest): Promise<{ success: boolean; data?: PortafolioArco; message?: string }> {
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
  async update(id: number, portafolio: Partial<CreatePortafolioArcoRequest>): Promise<{ success: boolean; data?: PortafolioArco; message?: string }> {
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

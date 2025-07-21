import {
  Articulador,
  CreateArticuladorRequest,
  ServiceResponse,
  EcosystemMapItem,
  Convocatoria,
} from "../types/api";

// Servicio para el ecosistema unificado
export class EcosystemService {
  static async getAllEcosystemItems(): Promise<ServiceResponse<EcosystemMapItem[]>> {
    try {
      // Obtener datos de articuladores y convocatorias
      const [articuladoresRes, convocatoriasRes] = await Promise.all([
        ArticuladorService.getAll(),
        fetch("/api/proxy/convocatorias").then(res => res.json())
      ]);

      const ecosystemItems: EcosystemMapItem[] = [];

      // Procesar articuladores
      if (articuladoresRes.success && articuladoresRes.data) {
        articuladoresRes.data.forEach(art => {
          ecosystemItems.push({
            id: art.id || 0,
            nombre: art.nombre,
            tipo: "Articulador",
            descripcion: art.contacto,
            ciudad: undefined,
            departamento: art.region,
            latitud: undefined,
            longitud: undefined,
            experiencia: art.tipo,
            areasExperiencia: art.tipo
          });
        });
      }

      // Procesar convocatorias (assuming we have them)
      if (Array.isArray(convocatoriasRes)) {
        convocatoriasRes.forEach((conv: Convocatoria) => {
          ecosystemItems.push({
            id: conv.id || 0,
            nombre: conv.titulo,
            tipo: "Convocatoria",
            descripcion: conv.descripcion,
            categoria: conv.categoria,
            entidad: conv.entidad,
            fechaInicio: conv.fechaInicio,
            fechaFin: conv.fechaFin,
            estado: conv.estado
          });
        });
      }

      return { success: true, data: ecosystemItems };
    } catch (error) {
      console.error("Error fetching ecosystem data:", error);
      return {
        success: false,
        message: "Error de conexión",
      };
    }
  }
}

// Servicio para Articuladores
export class ArticuladorService {
  private static baseUrl = "/api/proxy/articuladores";

  static async getAll(): Promise<ServiceResponse<Articulador[]>> {
    try {
      const response = await fetch(this.baseUrl);
      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.error || `Error ${response.status}`,
        };
      }
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("Error fetching articuladores:", error);
      return {
        success: false,
        message: "Error de conexión",
      };
    }
  }

  static async create(
    articulador: CreateArticuladorRequest
  ): Promise<ServiceResponse<Articulador>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(articulador),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.error || `Error ${response.status}`,
        };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("Error creating articulador:", error);
      return {
        success: false,
        message: "Error de conexión",
      };
    }
  }

  static async delete(id: number): Promise<ServiceResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.error || `Error ${response.status}`,
        };
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting articulador:", error);
      return {
        success: false,
        message: "Error de conexión",
      };
    }
  }

  static async update(
    id: number,
    articulador: CreateArticuladorRequest
  ): Promise<ServiceResponse<Articulador>> {
    try {
      const response = await fetch(`${this.baseUrl}?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(articulador),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.error || `Error ${response.status}`,
        };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("Error updating articulador:", error);
      return {
        success: false,
        message: "Error de conexión",
      };
    }
  }
}

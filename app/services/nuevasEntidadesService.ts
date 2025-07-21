import {
  Articulador,
  CreateArticuladorRequest,
  ServiceResponse,
  EcosystemMapItem,
  Convocatoria,
  Company,
} from "../types/api";

// Servicio para el ecosistema unificado
export class EcosystemService {
  // Coordenadas por defecto para departamentos de Colombia
  private static readonly DEPARTAMENTO_COORDS: { [key: string]: { lat: number; lng: number } } = {
    "antioquia": { lat: 6.2442, lng: -75.5812 },
    "bogota": { lat: 4.7110, lng: -74.0721 },
    "cundinamarca": { lat: 4.7110, lng: -74.0721 },
    "valle del cauca": { lat: 3.4516, lng: -76.5320 },
    "atlantico": { lat: 10.9685, lng: -74.7813 },
    "santander": { lat: 7.1193, lng: -73.1227 },
    "bolivar": { lat: 10.3910, lng: -75.4794 },
    "cordoba": { lat: 8.7569, lng: -75.8814 },
    "tolima": { lat: 4.4389, lng: -75.2322 },
    "default": { lat: 4.5709, lng: -74.2973 } // Centro de Colombia
  };

  private static getCoordinatesForLocation(
    latitud?: number | null, 
    longitud?: number | null, 
    departamento?: string | null
  ): { latitud: number; longitud: number } {
    // Si tenemos coordenadas válidas, usarlas
    if (latitud && longitud && latitud !== 0 && longitud !== 0) {
      return { latitud, longitud };
    }

    // Si no, usar coordenadas por departamento
    const dept = (departamento || "").toLowerCase().trim();
    const coords = this.DEPARTAMENTO_COORDS[dept] || this.DEPARTAMENTO_COORDS["default"];
    
    // Agregar pequeña variación aleatoria para evitar superposición
    const randomOffset = () => (Math.random() - 0.5) * 0.01; // ±0.005 grados
    
    return {
      latitud: coords.lat + randomOffset(),
      longitud: coords.lng + randomOffset()
    };
  }

  static async getAllEcosystemItems(): Promise<ServiceResponse<EcosystemMapItem[]>> {
    try {
      // Obtener datos de articuladores, convocatorias y empresas
      const [articuladoresRes, convocatoriasRes, empresasRes] = await Promise.all([
        ArticuladorService.getAll(),
        fetch("/api/proxy/convocatorias").then(res => res.json()),
        fetch("/api/proxy/companies").then(res => res.json())
      ]);

      const ecosystemItems: EcosystemMapItem[] = [];

      // Procesar articuladores
      if (articuladoresRes.success && articuladoresRes.data) {
        articuladoresRes.data.forEach(art => {
          const coords = this.getCoordinatesForLocation(
            art.latitud, 
            art.longitud, 
            art.departamento || art.region
          );
          
          ecosystemItems.push({
            id: art.id || 0,
            nombre: art.nombre,
            tipo: "Articulador",
            descripcion: art.contacto,
            ciudad: art.ciudad,
            departamento: art.departamento || art.region,
            latitud: coords.latitud,
            longitud: coords.longitud,
            experiencia: art.tipo,
            areasExperiencia: art.tipo
          });
        });
      }

      // Procesar empresas
      if (Array.isArray(empresasRes)) {
        empresasRes.forEach((empresa: Company) => {
          // Skip empresas de test/dummy
          if (empresa.name === "string" || empresa.url === "string") return;
          
          const coords = this.getCoordinatesForLocation(
            empresa.latitud, 
            empresa.longitud, 
            empresa.departamento || empresa.department
          );

          ecosystemItems.push({
            id: empresa.id || 0,
            nombre: empresa.name,
            tipo: "Company",
            descripcion: empresa.description,
            ciudad: empresa.ciudad,
            departamento: empresa.departamento || empresa.department,
            latitud: coords.latitud,
            longitud: coords.longitud,
            industry: empresa.industry || empresa.sector,
            fundada: empresa.founded
          });
        });
      }

      // Procesar convocatorias
      if (Array.isArray(convocatoriasRes)) {
        convocatoriasRes.forEach((conv: Convocatoria) => {
          const coords = this.getCoordinatesForLocation(
            undefined, 
            undefined, 
            "antioquia" // Default para convocatorias
          );

          ecosystemItems.push({
            id: conv.id || 0,
            nombre: conv.titulo,
            tipo: "Convocatoria",
            descripcion: conv.descripcion,
            latitud: coords.latitud,
            longitud: coords.longitud,
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

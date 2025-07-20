# 🗺️ ROADMAP Innovation Map - Basado en Mapeo INTEIA

## 📋 Análisis del Gap basado en "Mapeo INTEIA- Insumo Reto Ecosistema de Innovación"

### 🎯 **Estado Actual vs Requerimientos INTEIA**

#### ✅ **Implementado:**

- Gestión básica de empresas
- Análisis manual de convocatorias por URL
- Visualización geográfica básica
- Sistema de autenticación

#### ❌ **FALTANTE CRÍTICO:**

## 🔍 **1. Sistema de Rastreo de Fuentes (PRIORIDAD ALTA)**

### Fuentes Identificadas en CSV (74 entidades):

- **Gubernamentales:** MinTIC, MinCiencias, MinAmbiente, DNP
- **Internacionales:** BID, CAF, Banco Mundial, GEF
- **Privadas:** Google.org, Microsoft Climate Fund
- **Locales:** Alcaldía Medellín, Ruta N, Creame

### Implementación Requerida:

```typescript
interface FuenteOportunidad {
  id: number;
  entidad: string;
  url: string;
  clasificacion: "Convocatorias" | "Licitaciones" | "Eventos" | "Financiación";
  lineaOportunidad:
    | "Transversal"
    | "Medio Ambiente"
    | "Movilidad"
    | "Gobernanza";
  palabrasClave: string[];
  ultimaRevision: Date;
  activa: boolean;
}
```

## 🏗️ **2. Gestión por Líneas de Oportunidad**

### Categorías del CSV:

- **Transversal:** 35+ fuentes
- **Medio Ambiente / Energía:** 22 fuentes
- **Movilidad inteligente:** 3 fuentes
- **Gobernanza inteligente:** 4 fuentes

## 🤖 **3. Motor de Palabras Clave Inteligente**

### Palabras clave críticas del CSV:

```typescript
const PALABRAS_CLAVE_INTEIA = {
  climateInnovation: [
    "climate emergency",
    "climate crisis",
    "sostenibilidad",
    "carbon credits",
    "green crowdfunding",
    "renewable energy",
  ],
  smartCities: [
    "Smart Cities",
    "Ciudad Inteligente",
    "Gobierno inteligente",
    "Govtech",
    "Transformación digital",
    "Movilidad inteligente",
  ],
  sustainability: [
    "reforestación",
    "sustentabilidad",
    "ODS",
    "carbon footprint",
    "sustainable solutions",
    "climate change",
  ],
};
```

---

## 🚀 **FASES DE DESARROLLO**

### **📍 FASE 1: Base de Fuentes (2-3 semanas)**

- [ ] Modelo de datos para las 74 fuentes del CSV
- [ ] Sistema CRUD para gestión de fuentes
- [ ] Importación masiva del CSV
- [ ] UI para administrar fuentes

### **🔍 FASE 2: Web Scraping Automático (3-4 semanas)**

- [ ] Web scraper configurable por fuente
- [ ] Scheduler para revisión automática
- [ ] Sistema de detección de nuevas oportunidades
- [ ] API para gestionar scrapers

### **🧠 FASE 3: Motor de Matching (2-3 semanas)**

- [ ] Sistema de palabras clave por categoría
- [ ] Algoritmo de matching inteligente
- [ ] Clasificación automática de oportunidades
- [ ] Score de relevancia

### **📊 FASE 4: Dashboard Analytics (2 semanas)**

- [ ] Métricas por línea de oportunidad
- [ ] Visualización de tendencias
- [ ] Reportes automáticos
- [ ] Exportación de datos

### **🔔 FASE 5: Sistema de Alertas (1-2 semanas)**

- [ ] Notificaciones por email/web
- [ ] Configuración de alertas personalizadas
- [ ] Calendar de fechas límite
- [ ] RSS feeds por categoría

---

## 📋 **COMPONENTES NUEVOS REQUERIDOS**

### 1. **Página de Fuentes** (`/fuentes`)

```tsx
// Gestión de las 74 fuentes del ecosistema
- Tabla con filtros por clasificación/línea
- Estados de cada fuente (activa/inactiva)
- Última revisión y próxima programada
- Configuración de scraping
```

### 2. **Dashboard de Oportunidades** (`/dashboard`)

```tsx
// Vista ejecutiva del ecosistema
- Métricas por línea de oportunidad
- Gráficos de tendencias temporales
- Alertas de oportunidades críticas
- KPIs del ecosistema
```

### 3. **Centro de Alertas** (`/alertas`)

```tsx
// Sistema de notificaciones inteligente
- Configuración de palabras clave
- Historial de alertas
- Configuración de frecuencia
- Integración con calendar
```

### 4. **Explorador de Oportunidades** (`/explorar`)

```tsx
// Búsqueda avanzada en el ecosistema
- Filtros por múltiples criterios
- Búsqueda semántica
- Exportación de resultados
- Guardado de búsquedas
```

---

## 💾 **ESTRUCTURA DE BD AMPLIADA**

```sql
-- Tabla de fuentes del ecosistema
CREATE TABLE fuentes_oportunidad (
  id SERIAL PRIMARY KEY,
  entidad VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  clasificacion fuente_tipo NOT NULL,
  linea_oportunidad linea_tipo NOT NULL,
  palabras_clave TEXT[],
  activa BOOLEAN DEFAULT true,
  ultima_revision TIMESTAMP,
  proxima_revision TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de oportunidades detectadas
CREATE TABLE oportunidades_detectadas (
  id SERIAL PRIMARY KEY,
  fuente_id INTEGER REFERENCES fuentes_oportunidad(id),
  titulo VARCHAR(500),
  descripcion TEXT,
  url_original TEXT,
  fecha_publicacion DATE,
  fecha_cierre DATE,
  relevancia_score INTEGER,
  palabras_clave_detectadas TEXT[],
  estado oportunidad_estado DEFAULT 'nueva'
);

-- Tabla de alertas configuradas
CREATE TABLE alertas_configuradas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER, -- Si hay sistema de usuarios
  palabras_clave TEXT[],
  lineas_interes linea_tipo[],
  frecuencia_notificacion INTEGER, -- días
  activa BOOLEAN DEFAULT true
);
```

---

## 🎯 **IMPACTO ESPERADO**

Al implementar estas funcionalidades, Innovation Map se convertirá en:

✅ **Centro neurálgico** del ecosistema de innovación INTEIA  
✅ **Sistema de early warning** para oportunidades críticas  
✅ **Plataforma de intelligence** para toma de decisiones  
✅ **Hub de conexión** entre actores del ecosistema

---

## 📈 **MÉTRICAS DE ÉXITO**

- **74 fuentes** monitoreadas automáticamente
- **4 líneas de oportunidad** con cobertura completa
- **Detección temprana** de oportunidades relevantes
- **Matching inteligente** basado en 100+ palabras clave
- **Dashboard ejecutivo** con KPIs del ecosistema

---

## 🚀 **SIGUIENTE PASO INMEDIATO**

**Implementar gestión de fuentes basada en el CSV:**

1. Crear modelo de datos para las 74 fuentes
2. Importar datos del CSV a la base de datos
3. Crear interfaz para gestión de fuentes
4. Configurar primer prototipo de web scraper

¿Quieres que comencemos con la **Fase 1: Base de Fuentes**?

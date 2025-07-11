# Innovation Map 🗺️

Una plataforma web completa para visualizar, gestionar y analizar el ecosistema de innovación empresarial. Permite explorar empresas, gestionar convocatorias y obtener insights valiosos sobre el mercado de innovación.

## 🌟 Características Principales

### 📊 Dashboard Interactivo

- **Métricas en tiempo real** de empresas registradas y convocatorias
- **Visualización de datos** por sectores y departamentos
- **Indicadores de convocatorias activas** y oportunidades disponibles

### 🗺️ Mapa Interactivo

- **Visualización geográfica** de empresas por departamentos
- **Marcadores numerados** que muestran la cantidad de empresas por región
- **Modo empresa específica** para enfocarse en una empresa particular
- **Filtros avanzados** por sector, departamento y texto
- **Panel lateral** con información detallada de empresas

### 🏢 Gestión de Empresas

- **Registro completo** de empresas con información detallada
- **Búsqueda y filtrado** por múltiples criterios
- **Visualización en lista** y en mapa
- **Navegación fluida** entre vistas

### 📢 Sistema de Convocatorias

- **Gestión completa** de convocatorias de innovación
- **Estados automáticos y manuales** basados en fechas
- **Categorización** por tipo de convocatoria
- **Asociación con empresas** registradas
- **Filtros y ordenamiento** avanzados

### 🔍 Análisis de Datos

- **Análisis asistido por IA** usando Gemini AI
- **Procesamiento de archivos** CSV para importación masiva
- **Generación de insights** automáticos
- **Reportes personalizados**

### 🔐 Sistema de Autenticación

- **Registro e inicio de sesión** seguro
- **Gestión de tokens** con renovación automática
- **Persistencia de sesión** en localStorage
- **Rutas protegidas** y navegación contextual

## 🛠️ Tecnologías Utilizadas

### Frontend

- **Next.js 15** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de estilos
- **React Leaflet** - Mapas interactivos
- **Lucide React** - Iconografía

### Backend Integration

- **API REST** - Comunicación con backend
- **JWT Authentication** - Autenticación segura
- **LocalStorage** - Persistencia de datos del cliente

### Herramientas de Desarrollo

- **ESLint** - Linting de código
- **PostCSS** - Procesamiento de CSS
- **TypeScript** - Tipado y validación

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- npm, yarn, pnpm o bun
- Acceso a internet para mapas y APIs

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd innovation-map

# Instalar dependencias
npm install
# o
yarn install
# o
pnpm install

# Configurar variables de entorno
cp .env.example .env.local
```

### Variables de Entorno

Crear un archivo `.env.local` con las siguientes variables:

```env
# API Backend URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Gemini AI (para análisis)
NEXT_PUBLIC_GEMINI_API_KEY=tu_gemini_api_key

# Configuración de la aplicación
NEXT_PUBLIC_APP_NAME=Innovation Map
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Ejecutar en Desarrollo

```bash
npm run dev
# o
yarn dev
# o
pnpm dev

# La aplicación estará disponible en http://localhost:3000
```

## 📁 Estructura del Proyecto

```
innovation-map/
├── app/                          # App Router de Next.js
│   ├── (protected)/             # Rutas protegidas
│   │   ├── analizar/            # Página de análisis de datos
│   │   ├── convocatorias/       # Gestión de convocatorias
│   │   ├── empresas/            # Lista de empresas
│   │   ├── mapa/               # Mapa interactivo
│   │   └── registro/           # Registro de empresas
│   ├── api/                    # API Routes (opcional)
│   ├── auth/                   # Páginas de autenticación
│   ├── components/             # Componentes reutilizables
│   │   ├── Mapa.tsx           # Componente de mapa (deprecado)
│   │   ├── MapaSimple.tsx     # Componente de mapa principal
│   │   └── Navbar.tsx         # Barra de navegación
│   ├── hooks/                  # React Hooks personalizados
│   │   ├── useAuth.tsx        # Hook de autenticación
│   │   └── useLocalStorageAuth.ts # Persistencia de auth
│   ├── lib/                    # Utilidades y configuraciones
│   ├── services/              # Servicios de API
│   │   ├── authService.ts     # Servicio de autenticación
│   │   └── backendService.ts  # Cliente HTTP principal
│   ├── types/                 # Definiciones de tipos TypeScript
│   ├── globals.css           # Estilos globales
│   ├── layout.tsx            # Layout principal
│   └── page.tsx              # Página de inicio con dashboard
├── public/                    # Archivos estáticos
├── .eslintrc.json            # Configuración ESLint
├── .gitignore               # Archivos ignorados por Git
├── next.config.ts           # Configuración Next.js
├── package.json             # Dependencias y scripts
├── postcss.config.mjs       # Configuración PostCSS
├── tailwind.config.ts       # Configuración Tailwind
└── tsconfig.json           # Configuración TypeScript
```

## 🎯 Funcionalidades Detalladas

### Dashboard Principal

- **Métricas principales**: Total de empresas, convocatorias y activas
- **Distribución por sectores**: Gráficos de barras interactivos
- **Distribución geográfica**: Top departamentos con mayor actividad
- **Enlaces rápidos**: Navegación directa a secciones principales

### Mapa Interactivo

- **Vista general**: Marcadores con números por departamento
- **Modo específico**: Enfoque en una empresa particular
- **Filtros laterales**: Por sector, departamento y búsqueda de texto
- **Navegación fluida**: Botones "Ver en mapa" desde listados
- **Popups informativos**: Detalles completos de empresas y regiones

### Gestión de Convocatorias

- **CRUD completo**: Crear, leer, actualizar y eliminar
- **Estados inteligentes**: Automáticos por fecha o manuales
- **Asociación con empresas**: Vinculación con empresas registradas
- **Filtros avanzados**: Por estado, fecha, categoría
- **Vista detallada**: Información completa con logos y enlaces

### Sistema de Autenticación

- **Registro seguro**: Validación de datos y confirmación
- **Persistencia de sesión**: Mantiene sesión entre visitas
- **Renovación automática**: Tokens JWT con refresh automático
- **Rutas protegidas**: Acceso controlado a funcionalidades

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run start        # Servidor de producción
npm run lint         # Verificar código con ESLint
npm run lint:fix     # Corregir errores de linting automáticamente

# Tipos TypeScript
npm run type-check   # Verificar tipos sin compilar
```

## 🌐 API Integration

### Endpoints Principales

```typescript
// Autenticación
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
GET  /api/auth/validate

// Empresas
GET    /api/companies
POST   /api/companies
PUT    /api/companies/:id
DELETE /api/companies/:id

// Convocatorias
GET    /api/convocatorias
POST   /api/convocatorias
PUT    /api/convocatorias/:id
DELETE /api/convocatorias/:id
```

### Estructura de Respuesta

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

## 🎨 Guía de Estilos

### Paleta de Colores

- **Primario**: Azul (#3B82F6) - Empresas y acciones principales
- **Secundario**: Púrpura (#8B5CF6) - Convocatorias
- **Éxito**: Verde (#10B981) - Estados activos y confirmaciones
- **Advertencia**: Amarillo (#F59E0B) - Estados pendientes
- **Error**: Rojo (#EF4444) - Errores y eliminaciones

### Componentes UI

- **Tarjetas**: Bordes redondeados con sombra sutil
- **Botones**: Gradientes con efectos hover y scale
- **Formularios**: Campos con focus states y validación visual
- **Navegación**: Sticky navbar con efectos de transparencia

## 🧪 Testing

```bash
# Ejecutar tests
npm run test

# Tests en modo watch
npm run test:watch

# Coverage de tests
npm run test:coverage
```

## 🚀 Deployment

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Build Manual

```bash
# Crear build de producción
npm run build

# Ejecutar en producción
npm run start
```

### Variables de Entorno en Producción

Asegúrate de configurar las siguientes variables en tu plataforma de deployment:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_GEMINI_API_KEY`

## 🤝 Contribución

### Proceso de Desarrollo

1. Fork del repositorio
2. Crear branch de feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit de cambios: `git commit -am 'Add nueva funcionalidad'`
4. Push del branch: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

### Estándares de Código

- **TypeScript**: Tipado estricto requerido
- **ESLint**: Seguir configuración del proyecto
- **Commits**: Usar conventional commits
- **Testing**: Incluir tests para nuevas funcionalidades

## 📋 Roadmap

### Próximas Funcionalidades

- [ ] **Notificaciones push** para nuevas convocatorias
- [ ] **Exportación de datos** en múltiples formatos
- [ ] **Sistema de favoritos** para empresas y convocatorias
- [ ] **Dashboard de analytics** avanzado
- [ ] **API GraphQL** como alternativa a REST
- [ ] **Modo offline** con sincronización
- [ ] **Tema oscuro** y personalización de UI

### Mejoras Técnicas

- [ ] **Server-side rendering** optimizado
- [ ] **Caching** avanzado con Redis
- [ ] **Microservicios** para escalabilidad
- [ ] **WebSockets** para actualizaciones en tiempo real
- [ ] **PWA** para experiencia móvil mejorada

## 🐛 Solución de Problemas

### Problemas Comunes

**Error de autenticación**

```bash
# Limpiar localStorage
localStorage.clear()
# Recargar página
```

**Mapas no cargan**

```bash
# Verificar conexión a internet
# Verificar que Leaflet CSS esté cargado
```

**Build falla**

```bash
# Limpiar cache
rm -rf .next
npm run build
```

## 📞 Soporte

Para soporte técnico o preguntas:

- **Email**: support@innovationmap.com
- **Issues**: GitHub Issues
- **Documentación**: Wiki del proyecto

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- **Next.js Team** por el excelente framework
- **Leaflet** por la biblioteca de mapas
- **Tailwind CSS** por el framework de estilos
- **Gemini AI** por las capacidades de análisis
- **Comunidad Open Source** por las herramientas y recursos

---

Desarrollado con ❤️ para el ecosistema de innovación empresarial.
#   i n n o v a t i o n M a p F r o n t e n d  
 
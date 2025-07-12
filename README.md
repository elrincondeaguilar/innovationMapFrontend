# 🚀 BackInovationMap

**API REST robusta para la gestión del ecosistema de innovación empresarial**, desarrollada con .NET 9 y conectada a **Supabase PostgreSQL** para lograr alto rendimiento, escalabilidad y seguridad.

---

## 🧩 Características Destacadas

- 🏢 CRUD completo para **Empresas**
- 📢 Gestión avanzada de **Convocatorias**
- 🔐 **Autenticación segura con JWT**
- ☁️ Base de datos **PostgreSQL en Supabase**
- 📚 **Swagger/OpenAPI** para documentación
- 🛡️ Validación y manejo de errores
- 🌐 **CORS** habilitado para frontend

---

## ⚙️ Stack Tecnológico

| Categoría     | Herramientas          |
| ------------- | --------------------- |
| **Backend**   | .NET 9, ASP.NET Core  |
| **ORM**       | Entity Framework Core |
| **DB**        | Supabase PostgreSQL   |
| **Seguridad** | JWT, BCrypt           |
| **Dev Tools** | Swagger, Npgsql       |

---

## 🚀 Instalación y Puesta en Marcha

### 🔧 Requisitos Previos

- [.NET 9 SDK](https://dotnet.microsoft.com/)
- Cuenta en [Supabase](https://supabase.com/)
- VS Code, Visual Studio o cualquier editor compatible

### 📦 Setup

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/BackInovationMap.git
cd BackInovationMap

# 2. Restaurar e iniciar la app
dotnet restore
dotnet build
dotnet ef database update
dotnet run
```

> 🟢 Visita [`http://localhost:5297/swagger`](http://localhost:5297/swagger) para la documentación interactiva.

---

## 🏗️ Estructura del Proyecto

```
BackInovationMap/
├── Controllers/           # API Controllers
├── Data/                  # DbContext
├── DTOs/                  # Data Transfer Objects
├── Models/                # Entidades principales
├── Services/              # Lógica de negocio
├── Migrations/            # Historial de migraciones
└── Program.cs             # Entry point y configuración
```

---

## 🔍 Documentación de Endpoints

### 🔐 Autenticación

| Método | Endpoint           | Descripción        | Requiere Auth |
| ------ | ------------------ | ------------------ | ------------- |
| POST   | `/register`        | Crear usuario      | ❌            |
| POST   | `/login`           | Iniciar sesión     | ❌            |
| GET    | `/profile`         | Ver perfil         | ✅            |
| PUT    | `/change-password` | Cambiar contraseña | ✅            |
| POST   | `/refresh-token`   | Refrescar JWT      | ✅            |
| GET    | `/validate`        | Validar token      | ✅            |

### 🏢 Empresas

| Método | Endpoint         | Descripción      | Auth |
| ------ | ---------------- | ---------------- | ---- |
| GET    | `/api/companies` | Listar empresas  | ❌   |
| GET    | `/{id}`          | Detalle por ID   | ❌   |
| POST   | `/`              | Crear empresa    | ✅   |
| PUT    | `/{id}`          | Editar empresa   | ✅   |
| DELETE | `/{id}`          | Eliminar empresa | ✅   |

### 📢 Convocatorias

| Método | Endpoint                  | Descripción           | Auth |
| ------ | ------------------------- | --------------------- | ---- |
| GET    | `/`                       | Listar convocatorias  | ❌   |
| POST   | `/`                       | Crear convocatoria    | ✅   |
| PUT    | `/{id}`                   | Editar convocatoria   | ✅   |
| DELETE | `/{id}`                   | Eliminar              | ✅   |
| GET    | `/categoria/{categoria}`  | Filtrar por categoría | ❌   |
| PUT    | `/{id}/estado`            | Cambiar estado manual | ✅   |
| PUT    | `/{id}/estado/automatico` | Revertir a automático | ✅   |

---

## 🧠 Estados Inteligentes

- 🔄 **Automático**: Cambia según fechas (`pendiente → activa → cerrada`)
- 🛠️ **Manual**: Estado fijo sin importar fechas
- 🔁 **Híbrido**: Posibilidad de alternar entre ambos

---

## 🔐 Seguridad y Buenas Prácticas

- 🔑 Contraseñas hasheadas con **BCrypt**
- 🧾 Tokens JWT con expiración y renovación
- 🛡️ Validaciones a nivel DTO y modelo
- 🧬 Errores consistentes sin fugas de datos sensibles
- 🌍 **CORS** correctamente configurado
- 🔒 Conexión cifrada a base de datos

---

## 💻 Pruebas y Monitoreo

```bash
# Verificar estado de API
curl http://localhost:5297/api/companies

# Validar autenticación
curl http://localhost:5297/api/auth/validate   -H "Authorization: Bearer tu_token"
```

- 📘 Swagger UI: [`http://localhost:5297/swagger`](http://localhost:5297/swagger)
- 📊 Logs en consola
- ⚙️ Health checks disponibles

---

## ☁️ Despliegue

### Producción

```bash
# Publicar build
dotnet publish -c Release -o ./publish

# Ejecutar
dotnet ./publish/BackInovationMap.dll
```

### Plataformas compatibles

- Azure App Service
- AWS Elastic Beanstalk
- Google Cloud Run
- Render, Railway, Fly.io

### Render (Recomendado)

```bash
# Comando de inicio en Render
dotnet BackInovationMap.dll
```

---

## 🧠 Base de Datos en Supabase

- 🔁 Migraciones con `dotnet ef`
- 🧩 Modelos: `Usuario`, `Empresa`, `Convocatoria`
- 🔍 Relación directa: Empresa ←→ Convocatoria
- 📋 Migraciones aplicadas: `InitialCreate`, `AddEstadoManualToConvocatoria`

---

## 📌 Roadmap & Estado

- ✅ API funcional
- ✅ CRUD completo
- ✅ JWT implementado
- ✅ Documentación Swagger
- ✅ Supabase operativo
- ✅ Listo para integración frontend

---

## 🤝 Contribuciones y Soporte

### 👨‍💻 Desarrollador

- Juan Fernando Aguilar Rincón
- Universidad EAFIT – Especialización
- Año: 2025

### 📫 Contacto

- Email: `jfaguilarr@eafit.edu.co`

---

## 🙌 Agradecimientos

- 👩‍🏫 **Prof. Marinellys Figueroa** – Por su guía, acompañamiento y aporte clave en el desarrollo de este proyecto
- 🏫 **EAFIT** – Formación académica y apoyo institucional

---

⭐ ¿Te fue útil? ¡Dale una estrella al repo! ⭐

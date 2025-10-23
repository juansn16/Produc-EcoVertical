# 🌱 EcoVertical - Sistema de Gestión de Huertos Verticales

## 📋 Descripción del Proyecto

EcoVertical es una aplicación web fullstack diseñada para la gestión integral de huertos verticales urbanos. El sistema permite a usuarios, técnicos y administradores gestionar huertos privados, públicos y comunitarios, con funcionalidades avanzadas de inventario, alertas de riego, estadísticas y comunicación en tiempo real.

## 🏗️ Arquitectura del Sistema

### Diseño Lógico General

El proyecto sigue una **arquitectura de microservicios** con separación clara entre frontend y backend:

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React SPA)                    │
├─────────────────────────────────────────────────────────────┤
│  • React 19 + Vite                                         │
│  • TailwindCSS + Lucide Icons                              │
│  • React Router DOM                                        │
│  • Socket.IO Client                                        │
│  • Context API + Custom Hooks                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js API)                   │
├─────────────────────────────────────────────────────────────┤
│  • Express.js 5.x                                          │
│  • MySQL2 con Pool de Conexiones                          │
│  • Socket.IO Server                                        │
│  • JWT Authentication                                      │
│  • Zod Validation                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ SQL Queries
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 BASE DE DATOS (MySQL)                      │
├─────────────────────────────────────────────────────────────┤
│  • MySQL 8.0+ / MariaDB 10.4+                            │
│  • InnoDB Engine                                           │
│  • UTF8MB4 Collation                                       │
│  • Soft Delete Pattern                                     │
└─────────────────────────────────────────────────────────────┘
```

### Patrón MVC - Análisis de Cumplimiento

**✅ SÍ CUMPLE CON EL PATRÓN MVC**, con algunas adaptaciones modernas:

#### Backend (API-Ecovertical)
- **Modelo**: Representado por las consultas SQL en `src/utils/queries.js` y la estructura de base de datos
- **Vista**: Las respuestas JSON de la API REST
- **Controlador**: Los archivos en `src/controllers/` que manejan la lógica de negocio

#### Frontend (FRONT)
- **Modelo**: Los hooks personalizados (`useInventory`, `useProviders`, etc.) y servicios API
- **Vista**: Los componentes React en `src/components/` y páginas en `src/pages/`
- **Controlador**: Los contextos (`AuthContext`, `EventContext`) y la lógica de estado

## 🗄️ Estructura de Base de Datos

### Tablas Principales

```sql
-- Usuarios del sistema
usuarios (id, nombre, cedula, email, password, rol, ubicacion_id, ...)

-- Ubicaciones geográficas
ubicaciones (id, nombre, calle, ciudad, estado, pais, latitud, longitud, ...)

-- Huertos verticales
huertos (id, nombre, tipo, ubicacion_id, usuario_creador, descripcion, ...)

-- Relación usuario-huerto
usuario_huerto (id, usuario_id, huerto_id, rol_en_huerto, ...)

-- Inventario de plantas
inventario (id, huerto_id, planta_id, cantidad, fecha_siembra, ...)

-- Proveedores
proveedores (id, nombre_empresa, contacto_principal, ubicacion_id, ...)

-- Sistema de alertas
alertas (id, titulo, tipo, huerto_id, fecha_programada, ...)

-- Alertas de riego programadas
alertas_programadas_riego (id, huerto_id, fecha_programada, ...)

-- Comentarios y registros
comentarios (id, huerto_id, usuario_id, contenido, tipo, ...)

-- Notificaciones
notificaciones (id, usuario_id, titulo, mensaje, tipo, ...)
```

### Características de la Base de Datos

- **Soft Delete**: Todas las tablas usan `is_deleted` para eliminación lógica
- **UUIDs**: Identificadores únicos universales para todas las entidades
- **Timestamps**: `created_at` y `updated_at` automáticos
- **Foreign Keys**: Relaciones bien definidas con cascada
- **Índices**: Optimizados para consultas frecuentes

## 🛠️ Stack Tecnológico

### Backend (API-Ecovertical)
```json
{
  "runtime": "Node.js 18+",
  "framework": "Express.js 5.x",
  "database": "MySQL2 3.x",
  "authentication": "JWT + bcryptjs",
  "validation": "Zod 3.x",
  "realtime": "Socket.IO 4.x",
  "email": "Nodemailer",
  "ai": "Google Generative AI",
  "security": "Helmet + CORS + Rate Limiting",
  "logging": "Morgan"
}
```

### Frontend (FRONT)
```json
{
  "framework": "React 19",
  "bundler": "Vite 5.x",
  "styling": "TailwindCSS 3.x",
  "routing": "React Router DOM 7.x",
  "state": "Context API + Custom Hooks",
  "http": "Axios 1.x",
  "realtime": "Socket.IO Client",
  "charts": "Chart.js + Recharts",
  "maps": "Leaflet + React Leaflet",
  "ui": "Lucide React + Radix UI",
  "notifications": "React Hot Toast"
}
```

### DevOps y Despliegue
```yaml
# Render.com Configuration
services:
  - api: Node.js Web Service
  - frontend: Static Site
database: External MySQL (PlanetScale/Railway)
```

## 📁 Estructura del Proyecto

```
EcoVertical/
├── 📁 API-Ecovertical/           # Backend Node.js
│   ├── 📁 src/
│   │   ├── 📁 controllers/       # Controladores MVC
│   │   ├── 📁 middleware/       # Middleware personalizado
│   │   ├── 📁 routes/           # Definición de rutas
│   │   ├── 📁 services/         # Lógica de negocio
│   │   ├── 📁 utils/            # Utilidades y consultas SQL
│   │   ├── 📁 validators/       # Validaciones Zod
│   │   ├── 📁 config/           # Configuración DB
│   │   └── 📁 models/           # Esquemas de BD
│   ├── 📁 migrations/           # Scripts de migración
│   └── 📁 scripts/              # Scripts de utilidad
│
├── 📁 FRONT/                     # Frontend React
│   ├── 📁 src/
│   │   ├── 📁 components/       # Componentes React
│   │   │   ├── 📁 auth/         # Autenticación
│   │   │   ├── 📁 catalog/      # Catálogo de plantas
│   │   │   ├── 📁 garden/        # Gestión de huertos
│   │   │   ├── 📁 inventory/    # Inventario
│   │   │   ├── 📁 layout/        # Layout y navegación
│   │   │   └── 📁 common/        # Componentes comunes
│   │   ├── 📁 contexts/          # Context API
│   │   ├── 📁 hooks/            # Custom Hooks
│   │   ├── 📁 pages/            # Páginas principales
│   │   ├── 📁 services/         # Servicios API
│   │   ├── 📁 routers/          # Configuración de rutas
│   │   └── 📁 utils/            # Utilidades
│   └── 📁 public/               # Assets estáticos
│
├── 📄 package.json              # Scripts de gestión del proyecto
├── 📄 render.yaml              # Configuración de despliegue
└── 📄 README.md                # Este archivo
```

## 🔧 Funcionalidades Principales

### 1. Sistema de Autenticación
- **Registro** con roles (administrador, técnico, residente, colaborador)
- **Login** con JWT y refresh tokens
- **Recuperación de contraseña** por email
- **Verificación de email**
- **Códigos de invitación** para residentes

### 2. Gestión de Huertos
- **Huertos privados**: Individuales por usuario
- **Huertos públicos**: Compartidos en la misma ubicación
- **Huertos comunitarios**: Gestión colaborativa
- **Mapas interactivos** con Leaflet
- **Selección de ubicación** geográfica

### 3. Sistema de Inventario
- **Catálogo de plantas** por categorías
- **Gestión de stock** y cantidades
- **Historial de siembra** y cosecha
- **Alertas de bajo stock**
- **Permisos granulares** por usuario

### 4. Sistema de Alertas
- **Alertas de riego** programadas
- **Notificaciones en tiempo real** con WebSocket
- **Recordatorios** de mantenimiento
- **Alertas de plagas** y enfermedades
- **Sistema de notificaciones** persistente

### 5. Estadísticas y Reportes
- **Dashboard** con métricas clave
- **Gráficos interactivos** con Chart.js
- **Análisis de rendimiento** de cultivos
- **Reportes exportables** en PDF
- **Integración con IA** (Gemini) para análisis

### 6. Gestión de Proveedores
- **Directorio de proveedores** por categoría
- **Información de contacto** y ubicación
- **Sistema de categorías** especializadas
- **Búsqueda y filtrado** avanzado

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- MySQL 8.0+ o MariaDB 10.4+
- npm 8.0+

### Instalación Rápida
```bash
# Clonar el repositorio
git clone <repository-url>
cd EcoVertical

# Instalar dependencias de ambos proyectos
npm run install:all

# Configurar variables de entorno
cp API-Ecovertical/env.example API-Ecovertical/.env
cp FRONT/env.example FRONT/.env

# Configurar base de datos
mysql -u root -p < API-Ecovertical/src/models/huertos\(6\).sql

# Ejecutar en modo desarrollo
npm run dev:all
```

### Variables de Entorno Requeridas

#### Backend (.env)
```env
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASS=tu_password
DB_NAME=huertos
DB_PORT=3306

# Servidor
PORT=3000
NODE_ENV=development

# JWT
ACCESS_TOKEN_SECRET=tu_secreto_access
REFRESH_TOKEN_SECRET=tu_secreto_refresh

# Email
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password

# IA
GEMINI_API_KEY=tu_api_key_gemini
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_ENV=development
```

## 📊 Características Técnicas Avanzadas

### Seguridad
- **Autenticación JWT** con refresh tokens
- **Rate limiting** para prevenir ataques
- **CORS** configurado correctamente
- **Helmet** para headers de seguridad
- **Validación de entrada** con Zod
- **Hash de contraseñas** con bcryptjs

### Rendimiento
- **Pool de conexiones** MySQL optimizado
- **Índices de base de datos** estratégicos
- **Lazy loading** de componentes React
- **Code splitting** con Vite
- **Caching** de consultas frecuentes

### Escalabilidad
- **Arquitectura modular** y desacoplada
- **Microservicios** preparados para separación
- **Base de datos** normalizada y optimizada
- **API RESTful** bien estructurada
- **WebSocket** para tiempo real

### Monitoreo y Logs
- **Morgan** para logging HTTP
- **Console logging** estructurado
- **Error handling** centralizado
- **Health checks** para monitoreo

## 🔄 Flujo de Datos

### Autenticación
```
Usuario → Frontend → API (/auth/login) → JWT → LocalStorage → Context
```

### Gestión de Huertos
```
Usuario → Componente → Hook → Service → API → Controller → DB → Response
```

### Tiempo Real
```
Evento → Socket.IO Server → WebSocket → Socket.IO Client → Hook → UI Update
```

## 📈 Métricas y KPIs

### Backend
- **Tiempo de respuesta** API < 200ms
- **Disponibilidad** > 99.9%
- **Throughput** > 1000 req/min
- **Memoria** < 512MB

### Frontend
- **First Contentful Paint** < 1.5s
- **Largest Contentful Paint** < 2.5s
- **Cumulative Layout Shift** < 0.1
- **Bundle size** < 500KB

## 🧪 Testing y Calidad

### Backend
- **Validación** con Zod schemas
- **Error handling** centralizado
- **Logging** estructurado
- **Health checks** implementados

### Frontend
- **ESLint** configurado
- **TypeScript** ready
- **Component testing** preparado
- **E2E testing** con Playwright (opcional)

## 🚀 Despliegue

### Render.com (Recomendado)
```bash
# El proyecto ya está configurado para Render
# Solo necesitas:
# 1. Conectar repositorio GitHub
# 2. Configurar variables de entorno
# 3. Desplegar automáticamente
```

### Otros Proveedores
- **Vercel** (Frontend)
- **Railway** (Fullstack)
- **Heroku** (Backend)
- **DigitalOcean** (VPS)

## 📚 Documentación Adicional

- [Guía de Producción Local](GUIA_PRODUCCION_LOCAL.md)
- [Guía de Despliegue](DEPLOYMENT_GUIDE.md)
- [API Documentation](API-Ecovertical/README.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 👥 Equipo de Desarrollo

- **Backend**: Node.js, Express, MySQL
- **Frontend**: React, Vite, TailwindCSS
- **DevOps**: Render.com, GitHub Actions
- **Base de Datos**: MySQL con optimizaciones

## 🆘 Soporte

Para soporte técnico o preguntas sobre el proyecto, contacta al equipo de desarrollo o crea un issue en el repositorio.

---

**EcoVertical** - Cultivando el futuro de la agricultura urbana 🌱


# EcoVertical 🌱

**Sistema de Administración de Huertos Verticales** para propiedades horizontales (condominios, conjuntos residenciales). Permite a administradores, técnicos y residentes gestionar huertos compartidos y privados de forma colaborativa.

> **Demo:** [https://demo-ecovertical.onrender.com/]
---

## Características

- **Autenticación y roles** — Registro como administrador (crea un condominio) o residente (mediante código de invitación). Roles: `administrador`, `tecnico`, `residente`, `colaborador`.
- **Gestión de huertos** — Crear, editar, asignar usuarios a huertos públicos o privados.
- **Inventario** — Control de insumos (herramientas, semillas, fertilizantes, macetas) con niveles de stock, alertas de bajo inventario e historial de uso.
- **Proveedores** — Registro de proveedores con datos de contacto, categorías y ubicación.
- **Alertas de riego** — Notificaciones en tiempo real vía WebSocket con programación recurrente.
- **Alertas generales** — Sistema de notificaciones para cosecha, mantenimiento, plagas y avisos generales.
- **Estadísticas e informes** — Dashboard con gráficos, análisis impulsado por **Google Gemini AI** y exportación a PDF.
- **Mapas** — Geolocalización de huertos con Leaflet.
- **Comentarios / bitácora** — Registro de actividades (riego, siembra, cosecha, fertilización, control de plagas, mantenimiento).
- **Tema oscuro/claro** — Alternancia con persistencia en localStorage.
- **Notificaciones en app** — Alertas de comentarios, recordatorios y eventos.

---

## Stack Tecnológico

| Capa           | Tecnología                                                  |
| -------------- | ----------------------------------------------------------- |
| **Frontend**   | React 19, Vite 5, React Router DOM v7, Tailwind CSS 3       |
| **Backend**    | Node.js, Express 5, Socket.IO 4                              |
| **Base de datos** | PostgreSQL 15+                                            |
| **Autenticación** | JWT (access + refresh tokens con rotación)                |
| **IA**         | Google Generative AI (Gemini 2.5 Flash)                      |
| **Tiempo real** | Socket.IO                                                   |
| **Mapas**      | Leaflet + react-leaflet                                      |
| **Gráficos**   | Chart.js 4, Recharts 3                                       |
| **Email**      | Nodemailer (Gmail SMTP)                                      |
| **Validación** | Zod + express-validator                                      |
| **Despliegue** | Render (backend), Vercel / Netlify (frontend)                |

---

## Requisitos Previos

- Node.js 18+
- npm 9+
- PostgreSQL 15+
- Git

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/ecovertical.git
cd ecovertical
```

### 2. Base de datos

Ejecuta el script SQL para crear las tablas necesarias:

```bash
psql -U tu_usuario -d tu_base_de_datos -f API-Ecovertical/src/models/huertos_postgresql.sql
```

### 3. Backend (`API-Ecovertical`)

```bash
cd API-Ecovertical

# Copiar variables de entorno
cp env.example .env

# Editar .env con tus credenciales (DB, JWT, Email, Gemini, etc.)
# ---

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

El servidor backend se ejecutará en `http://localhost:3000`.

### 4. Frontend (`FRONT`)

```bash
cd FRONT

# Copiar variables de entorno
cp env.example .env

# Editar .env (VITE_API_URL apunta al backend)
# VITE_API_URL=http://localhost:3000/api

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

El frontend se ejecutará en `http://localhost:5173`.

---

## Variables de Entorno

### Backend (`API-Ecovertical/.env`)

| Variable                  | Descripción                              | Ejemplo                          |
| ------------------------- | ---------------------------------------- | -------------------------------- |
| `DB_HOST`                 | Host de PostgreSQL                       | `localhost`                      |
| `DB_USER`                 | Usuario de PostgreSQL                    | `postgres`                       |
| `DB_PASS`                 | Contraseña de PostgreSQL                 |                                  |
| `DB_NAME`                 | Nombre de la base de datos               | `huertos`                        |
| `DB_PORT`                 | Puerto de PostgreSQL                     | `5432`                           |
| `PORT`                    | Puerto del servidor                      | `3000`                           |
| `NODE_ENV`                | Entorno                                  | `development`                    |
| `ACCESS_TOKEN_SECRET`     | Secreto para JWT access token            |                                   |
| `REFRESH_TOKEN_SECRET`    | Secreto para JWT refresh token           |                                   |
| `ACCESS_TOKEN_EXPIRES_IN` | Expiración del access token              | `7d`                             |
| `REFRESH_TOKEN_EXPIRES_IN`| Expiración del refresh token             | `7d`                             |
| `CORS_ORIGIN`             | Origen permitido por CORS                | `http://localhost:5173`          |
| `RATE_LIMIT_WINDOW_MS`    | Ventana de rate limiting (ms)            | `900000`                         |
| `RATE_LIMIT_MAX_REQUESTS` | Máximo de solicitudes por ventana        | `100`                            |
| `EMAIL_USER`              | Correo para envío de emails (Gmail)      | `tu_email@gmail.com`             |
| `EMAIL_PASS`              | App password de Gmail                    |                                   |
| `FRONTEND_URL`            | URL del frontend                         | `http://localhost:5173`          |
| `GEMINI_API_KEY`          | API Key de Google Gemini                 |                                   |
| `GEMINI_MODEL`            | Modelo de Gemini                         | `gemini-2.5-flash`               |
| `TZ`                      | Zona horaria                             | `America/Caracas`                |

### Frontend (`FRONT/.env`)

| Variable        | Descripción                        | Ejemplo                         |
| --------------- | ---------------------------------- | ------------------------------- |
| `VITE_API_URL`  | URL base de la API                 | `http://localhost:3000/api`     |
| `VITE_APP_ENV`  | Entorno de la aplicación           | `production`                    |
| `VITE_APP_VERSION` | Versión de la aplicación        | `1.0.0`                         |

---

## Comandos Disponibles

### Backend

| Comando                    | Descripción                              |
| -------------------------- | ---------------------------------------- |
| `npm run dev`              | Iniciar en desarrollo con nodemon        |
| `npm start`                | Iniciar en producción                    |
| `npm run start:prod`       | Iniciar con `NODE_ENV=production`        |
| `npm run dev:prod`         | Desarrollo usando `.env.local.production` |

### Frontend

| Comando                    | Descripción                              |
| -------------------------- | ---------------------------------------- |
| `npm run dev`              | Servidor de desarrollo (Vite)            |
| `npm run build`            | Compilar para producción                 |
| `npm run build:prod`       | Compilar en modo producción              |
| `npm run lint`             | Ejecutar ESLint                          |
| `npm run preview`          | Previsualizar build                      |
| `npm start`                | Servir build con `serve` en puerto 3000  |

---

## Estructura del Proyecto

```
ecovertical/
├── API-Ecovertical/           # Backend (Node.js + Express)
│   ├── src/
│   │   ├── server.js          # Punto de entrada
│   │   ├── app.js             # Configuración de Express
│   │   ├── config/            # Conexión a DB y variables de entorno
│   │   ├── routes/            # Rutas de la API (17 módulos)
│   │   ├── controllers/       # Controladores
│   │   ├── validators/        # Esquemas de validación (Zod)
│   │   ├── middleware/        # Auth, roles, errores, validación
│   │   ├── services/          # Lógica de negocio (WebSocket, notificaciones)
│   │   ├── models/            # Schema SQL
│   │   └── utils/             # JWT, email, queries, keep-alive
│   ├── env.example
│   └── package.json
│
├── FRONT/                     # Frontend (React + Vite)
│   ├── src/
│   │   ├── main.jsx           # Punto de entrada
│   │   ├── App.jsx            # Componente raíz
│   │   ├── routers/           # Definición de rutas
│   │   ├── pages/             # Páginas (18)
│   │   ├── components/        # Componentes reutilizables
│   │   ├── hooks/             # Custom hooks (12)
│   │   ├── services/          # Llamadas a la API
│   │   ├── contexts/          # Contextos (Auth, Theme, Event)
│   │   └── data/              # Datos de ejemplo y manuales
│   ├── public/                # Assets estáticos
│   ├── env.example
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## API - Endpoints Principales

Todos los endpoints están prefijados con `/api`.

| Grupo                | Rutas principales                                           |
| -------------------- | ----------------------------------------------------------- |
| **Salud**            | `GET /api/health`, `GET /api/ping`                          |
| **Auth**             | `POST /api/auth/register`, `/login`, `/refresh`, `/logout`  |
| **Usuarios**         | `GET/PUT /api/users/profile`, CRUD de administrador         |
| **Huertos**          | CRUD `/api/gardens`, asignar/remover residentes             |
| **Inventario**       | CRUD `/api/inventory`, stock, uso, alertas                  |
| **Proveedores**      | CRUD `/api/providers`                                       |
| **Comentarios**      | CRUD `/api/comments` (huertos e inventario)                 |
| **Estadísticas**     | `GET /api/statistics/*`                                     |
| **Alertas**          | CRUD `/api/alerts`, marcar como leídas                      |
| **Alertas de riego** | CRUD `/api/irrigation-alerts`, WebSocket en tiempo real     |
| **Reportes**         | `POST /api/reports/analyze` (Gemini AI), `GET /pdf`         |
| **Plantas**          | CRUD `/api/plants`, catálogo por categoría                  |
| **Códigos invitación**| Generar y validar códigos                                 |
| **Notificaciones**   | Preferencias de notificación del usuario                    |
| **Ubicaciones**      | CRUD `/api/locations`                                       |

---

## Despliegue

### Backend (Render)

1. Conecta el repositorio en Render.
2. Selecciona **Web Service**.
3. **Root Directory:** `API-Ecovertical`
4. **Build Command:** `npm install`
5. **Start Command:** `npm start`
6. Configura las variables de entorno en el panel de Render.

### Frontend (Vercel / Netlify)

**Vercel:**
- **Root Directory:** `FRONT`
- **Framework Preset:** Vite
- Variables de entorno desde el panel.

**Netlify:**
- **Base directory:** `FRONT`
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- Incluye el archivo `public/_redirects` para SPA routing.

---

## Licencia

ISC

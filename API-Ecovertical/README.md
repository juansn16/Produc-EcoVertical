# API EcoVertical - Gestión de Huertos Verticales

API REST para la gestión de huertos verticales urbanos, desarrollada con Node.js, Express y MySQL.

## 🚀 Características

- **Autenticación JWT** con refresh tokens
- **Gestión de usuarios** con roles y verificación de email
- **Gestión de huertos** privados, públicos y comunitarios
- **Inventario de plantas**
- **Sistema de alertas** para riego, cosecha y mantenimiento
- **Reportes y estadísticas** de huertos
- **Validación de datos** con Zod
- **Rate limiting** para protección contra ataques
- **Envío de emails** para verificación y recuperación de contraseñas

## 📋 Requisitos Previos

- Node.js 18+ 
- MySQL 8.0+
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd API-Ecovertical
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp env.example .env
   ```
   
   Editar `.env` con tus configuraciones:
   ```env
   DB_HOST=localhost
   DB_USER=tu_usuario
   DB_PASS=tu_password
   DB_NAME=ecov_db
   JWT_SECRET=tu_secreto_super_seguro
   ```

4. **Crear la base de datos**
   ```bash
   mysql -u root -p < src/models/schema.sql
   ```

5. **Ejecutar la aplicación**
   ```bash
   # Desarrollo
   npm run dev
   
   # Producción
   npm start
   ```

## 🗄️ Estructura de la Base de Datos

- **users**: Usuarios del sistema
- **gardens**: Huertos verticales
- **plants**: Catálogo de plantas
- **inventory**: Inventario de huertos
- **providers**: Proveedores
- **alerts**: Sistema de alertas
- **comments**: Comentarios y registros
- **reports**: Reportes del sistema
- **statistics**: Estadísticas de huertos

## 🔐 Endpoints de Autenticación

- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/refresh` - Renovación de token
- `POST /api/auth/password-reset-request` - Solicitud de recuperación
- `POST /api/auth/password-reset` - Restablecimiento de contraseña
- `POST /api/auth/password-reset` - Restablecimiento de contraseña
- `POST /api/auth/verify-email` - Verificación de email
- `POST /api/auth/resend-verification` - Reenvío de verificación

## 📚 Documentación de la API

La API incluye validación de datos con esquemas Zod y manejo de errores centralizado.

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén implementados)
npm test
```

## 📝 Licencia

ISC

## 👥 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 🆘 Soporte

Para soporte técnico, contacta al equipo de desarrollo.

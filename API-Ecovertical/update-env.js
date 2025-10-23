// Script para actualizar el archivo .env con configuración de PostgreSQL
import fs from 'fs';
import path from 'path';

const envContent = `# Configuración de la base de datos PostgreSQL
DB_HOST=localhost
DB_USER=postgres
DB_PASS=ubiquiti
DB_NAME=huertos
DB_PORT=5432

# Configuración del servidor
PORT=3000
#production
NODE_ENV=development

# Configuración JWT
ACCESS_TOKEN_SECRET=cambia_este_secreto_en_produccion
REFRESH_TOKEN_SECRET=cambia_este_secreto_refresh_en_produccion

# Duración de tokens JWT (7 días)
ACCESS_TOKEN_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=7d

# Configuración de CORS
CORS_ORIGIN=http://localhost:5173

# Configuración de rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Configuración de email (Gmail)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password_gmail

# URL del frontend
FRONTEND_URL=http://localhost:5173

GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash`;

try {
  fs.writeFileSync('.env', envContent);
  console.log('✅ Archivo .env actualizado con configuración de PostgreSQL');
  console.log('📋 Variables configuradas:');
  console.log('   DB_HOST=localhost');
  console.log('   DB_USER=postgres');
  console.log('   DB_PASS=ubiquiti');
  console.log('   DB_NAME=huertos');
  console.log('   DB_PORT=5432');
} catch (error) {
  console.error('❌ Error al actualizar .env:', error.message);
}

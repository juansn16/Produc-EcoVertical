import pkg from 'pg';
import dotenv from "dotenv";

const { Pool } = pkg;
dotenv.config();

const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'ubiquiti',
  database: process.env.DB_NAME || 'huertos',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Configurar zona horaria desde variable de entorno en PostgreSQL
db.on('connect', async (client) => {
  try {
    const timezone = process.env.TZ || 'America/Caracas';
    await client.query(`SET timezone = '${timezone}'`);
    console.log(`🌍 Zona horaria de PostgreSQL configurada: ${timezone}`);
  } catch (error) {
    console.error('❌ Error configurando zona horaria de PostgreSQL:', error.message);
  }
});

// Manejo de errores en el pool de conexiones
db.on('error', (err, client) => {
  console.error('⚠️ Error inesperado en el pool de conexiones de PostgreSQL:', err);
});

// Manejo de errores en clients individuales
db.on('acquire', () => {
  // Conexión adquirida del pool
});

db.on('remove', () => {
  // Conexión removida del pool
});

export default db;
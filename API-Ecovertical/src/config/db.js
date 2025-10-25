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
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Configurar zona horaria de Venezuela en PostgreSQL
db.on('connect', async (client) => {
  try {
    await client.query("SET timezone = 'America/Caracas'");
    console.log('🌍 Zona horaria de PostgreSQL configurada: America/Caracas');
  } catch (error) {
    console.error('❌ Error configurando zona horaria de PostgreSQL:', error.message);
  }
});

export default db;
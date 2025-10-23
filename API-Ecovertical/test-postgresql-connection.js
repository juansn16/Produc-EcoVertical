// Script de prueba para verificar la conexión a PostgreSQL
import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'huertos',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function testConnection() {
  try {
    console.log('🔄 Probando conexión a PostgreSQL...');
    console.log('📋 Configuración:');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   Puerto: ${process.env.DB_PORT || 5432}`);
    console.log(`   Usuario: ${process.env.DB_USER || 'postgres'}`);
    console.log(`   Base de datos: ${process.env.DB_NAME || 'huertos'}`);
    
    // Probar conexión básica
    const client = await db.connect();
    console.log('✅ Conexión establecida exitosamente');
    
    // Probar query básica
    const result = await client.query('SELECT version()');
    console.log('📊 Versión de PostgreSQL:', result.rows[0].version);
    
    // Probar query de la base de datos
    const dbResult = await client.query('SELECT current_database()');
    console.log('🗄️ Base de datos actual:', dbResult.rows[0].current_database);
    
    // Verificar si las tablas existen
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Tablas encontradas:', tablesResult.rows.length);
    tablesResult.rows.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    client.release();
    console.log('✅ Prueba de conexión completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error en la conexión:', error.message);
    console.error('💡 Asegúrate de que:');
    console.error('   1. PostgreSQL esté instalado y ejecutándose');
    console.error('   2. La base de datos "huertos" exista');
    console.error('   3. Las credenciales en el archivo .env sean correctas');
    console.error('   4. El usuario tenga permisos para acceder a la base de datos');
  } finally {
    await db.end();
    console.log('🔌 Conexión cerrada');
  }
}

testConnection();

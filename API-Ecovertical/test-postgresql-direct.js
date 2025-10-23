// Script de prueba para verificar la conexión a PostgreSQL con configuración específica
import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;

// Configurar variables de entorno específicas para PostgreSQL
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_USER = 'postgres';
process.env.DB_PASS = 'ubiquiti';
process.env.DB_NAME = 'huertos';

const db = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function testConnection() {
  try {
    console.log('🔄 Probando conexión a PostgreSQL...');
    console.log('📋 Configuración:');
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   Puerto: ${process.env.DB_PORT}`);
    console.log(`   Usuario: ${process.env.DB_USER}`);
    console.log(`   Base de datos: ${process.env.DB_NAME}`);
    
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
    if (tablesResult.rows.length > 0) {
      tablesResult.rows.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    } else {
      console.log('⚠️ No se encontraron tablas. Necesitas ejecutar el script SQL de migración.');
    }
    
    client.release();
    console.log('✅ Prueba de conexión completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error en la conexión:', error.message);
    console.error('💡 Asegúrate de que:');
    console.error('   1. PostgreSQL esté instalado y ejecutándose');
    console.error('   2. La base de datos "huertos" exista');
    console.error('   3. Las credenciales sean correctas');
    console.error('   4. El usuario tenga permisos para acceder a la base de datos');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Error de conexión: PostgreSQL no está ejecutándose');
    } else if (error.code === '28P01') {
      console.error('🔐 Error de autenticación: Usuario o contraseña incorrectos');
    } else if (error.code === '3D000') {
      console.error('🗄️ Error de base de datos: La base de datos "huertos" no existe');
    }
  } finally {
    await db.end();
    console.log('🔌 Conexión cerrada');
  }
}

testConnection();

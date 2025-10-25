/**
 * Script para verificar y corregir la tabla usuarios_conectados en producción
 * Ejecutar este script para diagnosticar problemas con usuarios conectados
 * 
 * IMPORTANTE: Este script se conecta a la base de datos de producción
 * Asegúrate de tener las variables de entorno correctas configuradas
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Crear conexión usando la misma configuración que el resto de la aplicación
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

// Si no hay variables de entorno, usar configuración por defecto
if (!process.env.DB_HOST) {
  console.log('⚠️ No se encontraron variables de entorno, usando configuración por defecto');
}

console.log('🔗 Conectando a la base de datos...');
console.log(`📍 Host: ${process.env.DB_HOST || 'localhost'}`);
console.log(`📍 Puerto: ${process.env.DB_PORT || 5432}`);
console.log(`📍 Usuario: ${process.env.DB_USER || 'postgres'}`);
console.log(`📍 Base de datos: ${process.env.DB_NAME || 'huertos'}`);
console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);

async function diagnoseConnectedUsersTable() {
  try {
    // Verificar conexión a la base de datos
    console.log('🔗 Verificando conexión a la base de datos...');
    const connectionTest = await db.query('SELECT NOW() as current_time');
    console.log(`✅ Conectado a la base de datos. Hora actual: ${connectionTest.rows[0].current_time}`);
    
    console.log('\n🔍 Diagnóstico de la tabla usuarios_conectados...\n');

    // 1. Verificar si la tabla existe
    console.log('1️⃣ Verificando existencia de la tabla...');
    const tableExists = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios_conectados'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ La tabla usuarios_conectados NO existe');
      console.log('🔧 Creando tabla...');
      
      await db.query(`
        CREATE TABLE usuarios_conectados (
          id UUID NOT NULL DEFAULT uuid_generate_v4(),
          usuario_id UUID NOT NULL,
          socket_id VARCHAR(255) NOT NULL,
          fecha_conexion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
          UNIQUE (usuario_id)
        );
      `);
      
      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_usuarios_conectados_socket ON usuarios_conectados(socket_id);
      `);
      
      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_usuarios_conectados_fecha ON usuarios_conectados(fecha_conexion);
      `);
      
      console.log('✅ Tabla usuarios_conectados creada exitosamente');
    } else {
      console.log('✅ La tabla usuarios_conectados existe');
    }

    // 2. Verificar estructura de la tabla
    console.log('\n2️⃣ Verificando estructura de la tabla...');
    const columns = await db.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'usuarios_conectados'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Columnas de la tabla:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // 3. Verificar registros actuales
    console.log('\n3️⃣ Verificando registros actuales...');
    const totalRecords = await db.query(`SELECT COUNT(*) as total FROM usuarios_conectados`);
    console.log(`📊 Total de registros: ${totalRecords.rows[0].total}`);

    if (totalRecords.rows[0].total > 0) {
      const recentRecords = await db.query(`
        SELECT uc.*, u.nombre, u.email, u.ubicacion_id
        FROM usuarios_conectados uc
        JOIN usuarios u ON uc.usuario_id = u.id
        ORDER BY uc.fecha_conexion DESC
        LIMIT 10
      `);
      
      console.log('📋 Últimos 10 registros:');
      recentRecords.rows.forEach(record => {
        console.log(`  - ${record.nombre} (${record.usuario_id}) - ${record.fecha_conexion}`);
      });
    }

    // 4. Verificar registros antiguos
    console.log('\n4️⃣ Verificando registros antiguos...');
    const oldRecords = await db.query(`
      SELECT COUNT(*) as total 
      FROM usuarios_conectados 
      WHERE fecha_conexion < NOW() - INTERVAL '1 HOUR'
    `);
    console.log(`📊 Registros antiguos (>1 hora): ${oldRecords.rows[0].total}`);

    // 5. Limpiar registros antiguos
    if (oldRecords.rows[0].total > 0) {
      console.log('🧹 Limpiando registros antiguos...');
      const deleteResult = await db.query(`
        DELETE FROM usuarios_conectados 
        WHERE fecha_conexion < NOW() - INTERVAL '1 HOUR'
      `);
      console.log(`✅ ${deleteResult.rowCount} registros antiguos eliminados`);
    }

    // 6. Verificar índices
    console.log('\n5️⃣ Verificando índices...');
    const indexes = await db.query(`
      SELECT indexname, indexdef
      FROM pg_indexes 
      WHERE tablename = 'usuarios_conectados'
    `);
    
    console.log('📋 Índices existentes:');
    indexes.rows.forEach(idx => {
      console.log(`  - ${idx.indexname}`);
    });

    console.log('\n✅ Diagnóstico completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error);
    console.error('📋 Detalles del error:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
  } finally {
    console.log('\n🔌 Cerrando conexión a la base de datos...');
    await db.end();
    console.log('✅ Conexión cerrada');
    process.exit(0);
  }
}

// Ejecutar diagnóstico
diagnoseConnectedUsersTable();

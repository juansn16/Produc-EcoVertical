import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3305,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'huertos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function checkAndFixDatabase() {
  try {
    console.log('🔍 Verificando estructura de la base de datos...');
    
    // Verificar si la tabla comentarios existe
    const [tables] = await db.execute("SHOW TABLES LIKE 'comentarios'");
    if (tables.length === 0) {
      console.log('❌ La tabla comentarios no existe. Necesitas ejecutar el script de inicialización completo.');
      return;
    }
    
    // Verificar estructura actual de la tabla
    const [columns] = await db.execute("DESCRIBE comentarios");
    console.log('📋 Columnas actuales en la tabla comentarios:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
    
    // Verificar si las nuevas columnas existen
    const columnNames = columns.map(col => col.Field);
    const hasCambioTierra = columnNames.includes('cambio_tierra');
    const hasHuertoSiembraId = columnNames.includes('huerto_siembra_id');
    
    console.log(`\n🔍 Verificación de nuevas columnas:`);
    console.log(`  - cambio_tierra: ${hasCambioTierra ? '✅ Existe' : '❌ No existe'}`);
    console.log(`  - huerto_siembra_id: ${hasHuertoSiembraId ? '✅ Existe' : '❌ No existe'}`);
    
    // Aplicar cambios si es necesario
    if (!hasCambioTierra || !hasHuertoSiembraId) {
      console.log('\n🔧 Aplicando cambios a la base de datos...');
      
      if (!hasCambioTierra) {
        console.log('  ➕ Agregando columna cambio_tierra...');
        await db.execute(`
          ALTER TABLE comentarios 
          ADD COLUMN cambio_tierra ENUM('si', 'por_encima') NULL 
          COMMENT 'Indica si se cambió la tierra completamente (si) o solo se agregó por encima (por_encima). Solo aplica para comentarios de tipo abono.'
        `);
        console.log('  ✅ Columna cambio_tierra agregada');
      }
      
      if (!hasHuertoSiembraId) {
        console.log('  ➕ Agregando columna huerto_siembra_id...');
        await db.execute(`
          ALTER TABLE comentarios 
          ADD COLUMN huerto_siembra_id CHAR(36) NULL 
          COMMENT 'ID de la siembra relacionada (fecha de creación de siembra). Se usa para todos los tipos excepto producción/cosecha.'
        `);
        console.log('  ✅ Columna huerto_siembra_id agregada');
        
        // Agregar índice
        console.log('  ➕ Agregando índice para huerto_siembra_id...');
        await db.execute(`
          CREATE INDEX idx_comentarios_huerto_siembra ON comentarios(huerto_siembra_id)
        `);
        console.log('  ✅ Índice agregado');
      }
      
      console.log('\n🎉 Cambios aplicados exitosamente!');
    } else {
      console.log('\n✅ La base de datos ya tiene todas las columnas necesarias.');
    }
    
    // Verificar estructura final
    console.log('\n📋 Estructura final de la tabla comentarios:');
    const [finalColumns] = await db.execute("DESCRIBE comentarios");
    finalColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
    
  } catch (error) {
    console.error('❌ Error al verificar/aplicar cambios:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('🔑 Error de acceso a MySQL. Verifica las credenciales en el archivo .env');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('🗄️ La base de datos "huertos" no existe. Ejecuta primero el script de inicialización.');
    }
  } finally {
    await db.end();
  }
}

// Ejecutar la verificación
checkAndFixDatabase();

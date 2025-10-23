import mysql from "mysql2/promise";
import dotenv from "dotenv";

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

async function checkAndAddColumns() {
  try {
    console.log('🔍 Verificando estructura de la tabla comentarios...');
    
    // Verificar si las columnas existen
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'comentarios' AND COLUMN_NAME IN ('cambio_tierra', 'huerto_siembra_id')
    `, [process.env.DB_NAME || 'huertos']);
    
    const existingColumns = columns.map(col => col.COLUMN_NAME);
    console.log('📋 Columnas existentes:', existingColumns);
    
    // Agregar cambio_tierra si no existe
    if (!existingColumns.includes('cambio_tierra')) {
      console.log('➕ Agregando columna cambio_tierra...');
      await db.execute(`
        ALTER TABLE comentarios 
        ADD COLUMN cambio_tierra ENUM('si', 'por_encima') NULL 
        COMMENT 'Indica si se cambió la tierra completamente (si) o solo se agregó por encima (por_encima). Solo aplica para comentarios de tipo abono.'
      `);
      console.log('✅ Columna cambio_tierra agregada exitosamente');
    } else {
      console.log('✅ Columna cambio_tierra ya existe');
    }
    
    // Agregar huerto_siembra_id si no existe
    if (!existingColumns.includes('huerto_siembra_id')) {
      console.log('➕ Agregando columna huerto_siembra_id...');
      await db.execute(`
        ALTER TABLE comentarios 
        ADD COLUMN huerto_siembra_id CHAR(36) NULL 
        COMMENT 'ID de la siembra relacionada (fecha de creación de siembra). Se usa para todos los tipos excepto producción/cosecha.'
      `);
      console.log('✅ Columna huerto_siembra_id agregada exitosamente');
    } else {
      console.log('✅ Columna huerto_siembra_id ya existe');
    }
    
    // Crear índice si no existe
    try {
      console.log('🔍 Verificando índice idx_comentarios_huerto_siembra...');
      await db.execute(`
        CREATE INDEX idx_comentarios_huerto_siembra ON comentarios(huerto_siembra_id)
      `);
      console.log('✅ Índice creado exitosamente');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('✅ Índice ya existe');
      } else {
        throw error;
      }
    }
    
    console.log('🎉 ¡Estructura de base de datos actualizada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error al actualizar la base de datos:', error);
    throw error;
  } finally {
    await db.end();
  }
}

// Ejecutar el script
checkAndAddColumns()
  .then(() => {
    console.log('✅ Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script falló:', error);
    process.exit(1);
  });

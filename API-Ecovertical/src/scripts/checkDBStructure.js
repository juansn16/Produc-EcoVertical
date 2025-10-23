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

async function checkDBStructure() {
  try {
    console.log('🔍 Verificando estructura de la tabla comentarios...');
    
    // Verificar estructura de la tabla
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'comentarios'
      ORDER BY ORDINAL_POSITION
    `, [process.env.DB_NAME || 'huertos']);
    
    console.log('📋 Estructura de la tabla comentarios:');
    columns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}) - ${col.COLUMN_COMMENT || 'Sin comentario'}`);
    });
    
    // Verificar si las nuevas columnas existen
    const newColumns = ['cambio_tierra', 'huerto_siembra_id'];
    const existingColumns = columns.map(col => col.COLUMN_NAME);
    
    console.log('\n🔍 Verificando nuevas columnas:');
    newColumns.forEach(colName => {
      if (existingColumns.includes(colName)) {
        console.log(`  ✅ ${colName}: EXISTE`);
      } else {
        console.log(`  ❌ ${colName}: NO EXISTE`);
      }
    });
    
    // Verificar algunos comentarios recientes
    console.log('\n📊 Verificando comentarios recientes:');
    const [recentComments] = await db.execute(`
      SELECT id, tipo_comentario, fecha_creacion, contenido
      FROM comentarios 
      WHERE is_deleted = 0 
      ORDER BY fecha_creacion DESC 
      LIMIT 5
    `);
    
    recentComments.forEach(comment => {
      console.log(`  - ID: ${comment.id}, Tipo: ${comment.tipo_comentario}, Fecha: ${comment.fecha_creacion}`);
    });
    
  } catch (error) {
    console.error('❌ Error al verificar la base de datos:', error);
    throw error;
  } finally {
    await db.end();
  }
}

// Ejecutar el script
checkDBStructure()
  .then(() => {
    console.log('✅ Verificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Verificación falló:', error);
    process.exit(1);
  });

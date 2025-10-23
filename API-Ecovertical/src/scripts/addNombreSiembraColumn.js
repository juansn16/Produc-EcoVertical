import db from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function addNombreSiembraColumn() {
  try {
    console.log('🔍 Verificando si la columna nombre_siembra existe en comentarios...');

    // Check if column exists
    const [rows] = await db.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'comentarios' AND COLUMN_NAME = 'nombre_siembra'`,
      [process.env.DB_NAME]
    );

    if (rows.length === 0) {
      console.log('➕ Columna nombre_siembra no encontrada. Agregándola a comentarios...');
      await db.execute(`
        ALTER TABLE comentarios 
        ADD COLUMN nombre_siembra VARCHAR(255) NULL 
        COMMENT 'Nombre descriptivo de la siembra para facilitar identificación'
      `);
      console.log('✅ Columna nombre_siembra agregada exitosamente a comentarios.');

      console.log('➕ Creando índice idx_comentarios_nombre_siembra...');
      await db.execute(`
        CREATE INDEX idx_comentarios_nombre_siembra ON comentarios(nombre_siembra)
      `);
      console.log('✅ Índice idx_comentarios_nombre_siembra creado exitosamente.');
    } else {
      console.log('☑️ La columna nombre_siembra ya existe en comentarios. No se requiere acción.');
    }

    // Verificar que la columna se agregó correctamente
    const [verifyRows] = await db.execute(
      `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_COMMENT 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'comentarios' AND COLUMN_NAME = 'nombre_siembra'`,
      [process.env.DB_NAME]
    );

    if (verifyRows.length > 0) {
      console.log('✅ Verificación exitosa. Columna nombre_siembra:');
      console.log('   - Tipo:', verifyRows[0].DATA_TYPE);
      console.log('   - Nullable:', verifyRows[0].IS_NULLABLE);
      console.log('   - Comentario:', verifyRows[0].COLUMN_COMMENT);
    }

  } catch (error) {
    console.error('❌ Error al agregar la columna:', error);
    throw error;
  } finally {
    await db.end();
  }
}

addNombreSiembraColumn()
  .then(() => console.log('✨ Script de migración finalizado.'))
  .catch((err) => console.error('❌ Script falló:', err));

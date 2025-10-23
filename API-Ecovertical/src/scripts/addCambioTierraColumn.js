import db from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function addCambioTierraColumn() {
  try {
    console.log('🔍 Verificando si la columna cambio_tierra existe en comentarios...');

    // Check if column exists
    const [rows] = await db.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'comentarios' AND COLUMN_NAME = 'cambio_tierra'`,
      [process.env.DB_NAME]
    );

    if (rows.length === 0) {
      console.log('➕ Columna cambio_tierra no encontrada. Agregándola a comentarios...');
      await db.execute(`
        ALTER TABLE comentarios 
        ADD COLUMN cambio_tierra ENUM('si', 'por_encima') NULL 
        COMMENT 'Indica si se cambió la tierra completamente (si) o se agregó por encima (por_encima)'
      `);
      console.log('✅ Columna cambio_tierra agregada exitosamente a comentarios.');
    } else {
      console.log('☑️ La columna cambio_tierra ya existe en comentarios. No se requiere acción.');
    }
  } catch (error) {
    console.error('❌ Error al agregar la columna:', error);
    throw error;
  } finally {
    await db.end();
  }
}

addCambioTierraColumn()
  .then(() => console.log('✨ Script de migración finalizado.'))
  .catch((err) => console.error('❌ Script falló:', err));

import db from '../config/db.js';

async function addAlertColumns() {
  try {
    console.log('Agregando columnas a la tabla alertas...');
    
    // Verificar si las columnas ya existen
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'alertas' 
      AND COLUMN_NAME IN ('hora_programada', 'duracion_minutos', 'notificar_antes_minutos')
    `);
    
    const existingColumns = columns.map(col => col.COLUMN_NAME);
    
    // Agregar hora_programada si no existe
    if (!existingColumns.includes('hora_programada')) {
      await db.execute(`
        ALTER TABLE alertas 
        ADD COLUMN hora_programada TIME NULL 
        AFTER fecha_programada
      `);
      console.log('✓ Columna hora_programada agregada');
    } else {
      console.log('✓ Columna hora_programada ya existe');
    }
    
    // Agregar duracion_minutos si no existe
    if (!existingColumns.includes('duracion_minutos')) {
      await db.execute(`
        ALTER TABLE alertas 
        ADD COLUMN duracion_minutos INT NULL 
        AFTER hora_programada
      `);
      console.log('✓ Columna duracion_minutos agregada');
    } else {
      console.log('✓ Columna duracion_minutos ya existe');
    }
    
    // Agregar notificar_antes_minutos si no existe
    if (!existingColumns.includes('notificar_antes_minutos')) {
      await db.execute(`
        ALTER TABLE alertas 
        ADD COLUMN notificar_antes_minutos INT NULL 
        AFTER duracion_minutos
      `);
      console.log('✓ Columna notificar_antes_minutos agregada');
    } else {
      console.log('✓ Columna notificar_antes_minutos ya existe');
    }
    
    console.log('✅ Migración completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  addAlertColumns()
    .then(() => {
      console.log('Migración finalizada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

export default addAlertColumns;


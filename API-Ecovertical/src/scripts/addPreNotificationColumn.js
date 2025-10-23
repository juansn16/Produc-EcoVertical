// Script para agregar la columna pre_notificacion_enviada a la tabla alertas_riego
import db from '../config/db.js';

async function addPreNotificationColumn() {
  try {
    console.log('🔧 Agregando columna pre_notificacion_enviada a alertas_riego...');
    
    // Verificar si la columna ya existe
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'alertas_riego' 
      AND COLUMN_NAME = 'pre_notificacion_enviada'
    `);
    
    if (columns.length > 0) {
      console.log('✅ La columna pre_notificacion_enviada ya existe');
      return;
    }
    
    // Agregar la columna
    await db.execute(`
      ALTER TABLE alertas_riego 
      ADD COLUMN pre_notificacion_enviada TINYINT(1) DEFAULT 0 
      COMMENT 'Indica si se ha enviado la pre-notificación (10 min antes)'
    `);
    
    console.log('✅ Columna pre_notificacion_enviada agregada exitosamente');
    
    // Actualizar todas las alertas existentes para que no tengan pre-notificación enviada
    const [result] = await db.execute(`
      UPDATE alertas_riego 
      SET pre_notificacion_enviada = 0 
      WHERE pre_notificacion_enviada IS NULL
    `);
    
    console.log(`✅ Actualizadas ${result.affectedRows} alertas existentes`);
    
  } catch (error) {
    console.error('❌ Error agregando columna:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  addPreNotificationColumn()
    .then(() => {
      console.log('🎉 Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error ejecutando script:', error);
      process.exit(1);
    });
}

export default addPreNotificationColumn;

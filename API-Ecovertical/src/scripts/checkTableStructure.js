// Script para verificar la estructura de la tabla alertas_riego
import db from '../config/db.js';

async function checkTableStructure() {
  try {
    console.log('🔍 Verificando estructura de la tabla alertas_riego...');
    
    const [columns] = await db.execute('DESCRIBE alertas_riego');
    
    console.log('Columnas en alertas_riego:');
    columns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    // Verificar específicamente si existe la columna pre_notificacion_enviada
    const hasPreNotificationColumn = columns.some(col => col.Field === 'pre_notificacion_enviada');
    
    if (hasPreNotificationColumn) {
      console.log('✅ La columna pre_notificacion_enviada existe');
    } else {
      console.log('❌ La columna pre_notificacion_enviada NO existe');
      console.log('🔧 Agregando la columna...');
      
      await db.execute(`
        ALTER TABLE alertas_riego 
        ADD COLUMN pre_notificacion_enviada TINYINT(1) DEFAULT 0 
        COMMENT 'Indica si se ha enviado la pre-notificación (10 min antes)'
      `);
      
      console.log('✅ Columna pre_notificacion_enviada agregada exitosamente');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// Ejecutar
checkTableStructure()
  .then(() => {
    console.log('🎉 Verificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error:', error);
    process.exit(1);
  });
import db from '../config/db.js';

async function migratePlagaColumns() {
  try {
    console.log('🔄 Iniciando migración para agregar columnas de plagas...');
    
    // Verificar si las columnas ya existen
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'huertos' 
      AND TABLE_NAME = 'huerto_data' 
      AND COLUMN_NAME IN ('plaga_especie', 'plaga_nivel')
    `);
    
    const existingColumns = columns.map(col => col.COLUMN_NAME);
    
    if (existingColumns.includes('plaga_especie') && existingColumns.includes('plaga_nivel')) {
      console.log('✅ Las columnas plaga_especie y plaga_nivel ya existen');
      return;
    }
    
    // Agregar columnas si no existen
    if (!existingColumns.includes('plaga_especie')) {
      console.log('➕ Agregando columna plaga_especie...');
      await db.execute(`
        ALTER TABLE huerto_data 
        ADD COLUMN plaga_especie VARCHAR(100) NULL COMMENT 'Especie de plaga detectada'
      `);
    }
    
    if (!existingColumns.includes('plaga_nivel')) {
      console.log('➕ Agregando columna plaga_nivel...');
      await db.execute(`
        ALTER TABLE huerto_data 
        ADD COLUMN plaga_nivel ENUM('pocos', 'medio', 'muchos') NULL COMMENT 'Nivel de incidencia de la plaga'
      `);
    }
    
    // Crear índices para mejorar el rendimiento
    try {
      await db.execute(`CREATE INDEX idx_plaga_especie ON huerto_data(plaga_especie)`);
      console.log('📊 Índice idx_plaga_especie creado');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('📊 Índice idx_plaga_especie ya existe');
      } else {
        throw error;
      }
    }
    
    try {
      await db.execute(`CREATE INDEX idx_plaga_nivel ON huerto_data(plaga_nivel)`);
      console.log('📊 Índice idx_plaga_nivel creado');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('📊 Índice idx_plaga_nivel ya existe');
      } else {
        throw error;
      }
    }
    
    console.log('✅ Migración completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  }
}

// Ejecutar la migración si se llama directamente
migratePlagaColumns()
  .then(() => {
    console.log('🎉 Migración finalizada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en la migración:', error);
    process.exit(1);
  });

export default migratePlagaColumns;

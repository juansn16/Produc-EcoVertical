import db from '../config/db.js';

export const addHuertoSiembraIdColumn = async (req, res) => {
  try {
    console.log('🔍 Verificando si la columna huerto_siembra_id existe en huerto_data...');
    
    // Verificar si la columna ya existe
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'huerto_data' AND COLUMN_NAME = 'huerto_siembra_id'
    `, [process.env.DB_NAME || 'huertos']);
    
    if (columns.length > 0) {
      console.log('✅ La columna huerto_siembra_id ya existe en huerto_data');
      return res.json({
        success: true,
        message: 'La columna huerto_siembra_id ya existe en huerto_data',
        alreadyExists: true
      });
    }
    
    console.log('➕ Agregando columna huerto_siembra_id a la tabla huerto_data...');
    
    // Agregar la columna
    await db.execute(`
      ALTER TABLE huerto_data 
      ADD COLUMN huerto_siembra_id CHAR(36) NULL 
      COMMENT 'ID de la siembra relacionada para todos los tipos de comentarios excepto siembra y cosecha'
    `);
    
    console.log('✅ Columna huerto_siembra_id agregada exitosamente');
    
    // Crear índice
    try {
      console.log('🔍 Creando índice para huerto_siembra_id...');
      await db.execute(`
        CREATE INDEX idx_huerto_data_huerto_siembra ON huerto_data(huerto_siembra_id)
      `);
      console.log('✅ Índice creado exitosamente');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('✅ Índice ya existe');
      } else {
        throw error;
      }
    }
    
    console.log('🎉 ¡Columna huerto_siembra_id agregada exitosamente a huerto_data!');
    
    return res.json({
      success: true,
      message: 'Columna huerto_siembra_id agregada exitosamente a huerto_data',
      alreadyExists: false
    });
    
  } catch (error) {
    console.error('❌ Error al agregar la columna:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al agregar la columna huerto_siembra_id',
      error: error.message
    });
  }
};

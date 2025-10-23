import db from '../config/db.js';
import { MigrationQueries } from '../utils/queries/index.js';

export const addHuertoSiembraIdColumn = async (req, res) => {
  try {
    console.log('🔍 Verificando si la columna huerto_siembra_id existe en huerto_data...');
    
    // Verificar si la columna ya existe
    const columnsResult = await db.query(MigrationQueries.checkColumnExists, [
      'public', // PostgreSQL usa 'public' como schema por defecto
      'huerto_data', 
      'huerto_siembra_id'
    ]);
    
    if (columnsResult.rows.length > 0) {
      console.log('✅ La columna huerto_siembra_id ya existe en huerto_data');
      return res.json({
        success: true,
        message: 'La columna huerto_siembra_id ya existe en huerto_data',
        alreadyExists: true
      });
    }
    
    console.log('➕ Agregando columna huerto_siembra_id a la tabla huerto_data...');
    
    // Agregar la columna
    await db.query(MigrationQueries.addHuertoSiembraIdColumn);
    
    // Agregar comentario a la columna
    await db.query(MigrationQueries.addColumnComment);
    
    console.log('✅ Columna huerto_siembra_id agregada exitosamente');
    
    // Crear índice
    try {
      console.log('🔍 Creando índice para huerto_siembra_id...');
      await db.query(MigrationQueries.createHuertoSiembraIdIndex);
      console.log('✅ Índice creado exitosamente');
    } catch (error) {
      if (error.code === '42P07') { // PostgreSQL error code for duplicate index
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

import db from '../config/db.js';

async function addUsuarioCreadorToInventario() {
  try {
    console.log('🔧 Agregando columna usuario_creador a la tabla inventario...');
    
    // Verificar si la columna ya existe
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'huertos' 
      AND TABLE_NAME = 'inventario' 
      AND COLUMN_NAME = 'usuario_creador'
    `);
    
    console.log('🔍 Columnas encontradas:', columns);
    
    if (columns.length > 0) {
      console.log('✅ La columna usuario_creador ya existe en la tabla inventario');
      return;
    }
    
    console.log('🔧 La columna no existe, procediendo a crearla...');
    
    // Agregar la columna usuario_creador
    await db.execute(`
      ALTER TABLE inventario 
      ADD COLUMN usuario_creador CHAR(36) NOT NULL COMMENT 'Usuario que creó el item de inventario'
    `);
    
    console.log('✅ Columna usuario_creador agregada exitosamente');
    
    // Agregar la foreign key
    await db.execute(`
      ALTER TABLE inventario 
      ADD FOREIGN KEY (usuario_creador) REFERENCES usuarios(id)
    `);
    
    console.log('✅ Foreign key agregada exitosamente');
    
    // Actualizar los registros existentes con el primer usuario administrador disponible
    const [adminUsers] = await db.execute(`
      SELECT id FROM usuarios WHERE rol = 'administrador' AND is_deleted = 0 LIMIT 1
    `);
    
    console.log('🔍 Usuarios administradores encontrados:', adminUsers);
    
    if (adminUsers.length > 0) {
      const adminId = adminUsers[0].id;
      console.log('🔧 Actualizando registros existentes con admin ID:', adminId);
      
      await db.execute(`
        UPDATE inventario 
        SET usuario_creador = ? 
        WHERE usuario_creador IS NULL OR usuario_creador = ''
      `, [adminId]);
      
      console.log('✅ Registros existentes actualizados con usuario administrador por defecto');
    } else {
      console.log('⚠️ No se encontraron usuarios administradores para actualizar registros existentes');
    }
    
  } catch (error) {
    console.error('❌ Error al agregar columna usuario_creador:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  addUsuarioCreadorToInventario()
    .then(() => {
      console.log('✅ Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el script:', error);
      process.exit(1);
    });
}

export default addUsuarioCreadorToInventario;

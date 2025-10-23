import db from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkInventoryPermissionsTable() {
  try {
    console.log('🔍 Verificando tabla de permisos de inventario...');

    // Verificar si existe la tabla inventario_permisos
    const [tables] = await db.execute(
      "SHOW TABLES LIKE 'inventario_permisos'"
    );

    if (tables.length > 0) {
      console.log('✅ Tabla inventario_permisos existe');
      
      // Verificar la estructura de la tabla
      const [columns] = await db.execute(
        "DESCRIBE inventario_permisos"
      );
      
      console.log('📋 Estructura de la tabla inventario_permisos:');
      columns.forEach(column => {
        console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${column.Key ? `(${column.Key})` : ''}`);
      });
      
      // Verificar si hay datos
      const [count] = await db.execute(
        "SELECT COUNT(*) as total FROM inventario_permisos"
      );
      
      console.log(`📊 Total de registros: ${count[0].total}`);
      
    } else {
      console.log('❌ Tabla inventario_permisos NO existe');
      console.log('🔧 Creando tabla inventario_permisos...');
      
      // Crear la tabla
      await db.execute(`
        CREATE TABLE inventario_permisos (
          id CHAR(36) PRIMARY KEY,
          inventario_id CHAR(36) NOT NULL,
          usuario_id CHAR(36) NOT NULL,
          permiso_tipo ENUM('editar', 'usar', 'ver_historial') NOT NULL,
          fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          asignado_por CHAR(36) NOT NULL,
          is_deleted TINYINT(1) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          
          UNIQUE KEY unique_permission (inventario_id, usuario_id, permiso_tipo)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      console.log('✅ Tabla inventario_permisos creada exitosamente');
    }

    // Verificar si existe la columna usuario_creador en inventario
    const [inventoryColumns] = await db.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'huertos' AND TABLE_NAME = 'inventario' AND COLUMN_NAME = 'usuario_creador'"
    );
    
    if (inventoryColumns.length > 0) {
      console.log('✅ Columna usuario_creador existe en tabla inventario');
    } else {
      console.log('❌ Columna usuario_creador NO existe en tabla inventario');
      console.log('🔧 Agregando columna usuario_creador...');
      
      await db.execute(`
        ALTER TABLE inventario 
        ADD COLUMN usuario_creador CHAR(36) NOT NULL COMMENT 'Usuario que creó el item de inventario'
      `);
      
      console.log('✅ Columna usuario_creador agregada exitosamente');
    }

    console.log('🎉 Verificación completada');
    
  } catch (error) {
    console.error('❌ Error verificando tabla de permisos:', error);
  } finally {
    await db.end();
  }
}

checkInventoryPermissionsTable();

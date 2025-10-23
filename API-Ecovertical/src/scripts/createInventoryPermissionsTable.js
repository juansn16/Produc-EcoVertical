import db from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function createInventoryPermissionsTable() {
  try {
    console.log('Iniciando creación de tabla de permisos de inventario...');

    // Crear tabla de permisos de inventario (sin claves foráneas por ahora)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS inventario_permisos (
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

    console.log('✅ Tabla inventario_permisos creada exitosamente.');

    // Crear índices para mejorar el rendimiento
    await db.execute(`
      CREATE INDEX idx_inventario_permisos_inventario_id ON inventario_permisos(inventario_id)
    `);
    
    await db.execute(`
      CREATE INDEX idx_inventario_permisos_usuario_id ON inventario_permisos(usuario_id)
    `);
    
    await db.execute(`
      CREATE INDEX idx_inventario_permisos_tipo ON inventario_permisos(permiso_tipo)
    `);

    console.log('✅ Índices creados exitosamente.');

    console.log('🎉 Script completado exitosamente.');
  } catch (error) {
    console.error('❌ Error en el script createInventoryPermissionsTable:', error);
  } finally {
    await db.end();
  }
}

createInventoryPermissionsTable();

import db from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function createCommentPermissionsTable() {
  try {
    console.log('🔧 Creando tabla de permisos para comentarios de inventario...');

    // Crear tabla de permisos de comentarios
    await db.execute(`
      CREATE TABLE IF NOT EXISTS comentario_inventario_permisos (
        id CHAR(36) PRIMARY KEY,
        comentario_id CHAR(36) NOT NULL,
        usuario_id CHAR(36) NOT NULL,
        permiso_tipo ENUM('editar', 'eliminar') NOT NULL,
        asignado_por CHAR(36) NOT NULL,
        fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (comentario_id) REFERENCES comentarios_inventario(id) ON DELETE CASCADE,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (asignado_por) REFERENCES usuarios(id) ON DELETE CASCADE,
        UNIQUE KEY unique_permission (comentario_id, usuario_id, permiso_tipo)
      )
    `);

    console.log('✅ Tabla comentario_inventario_permisos creada exitosamente');

    // Crear índices para mejor rendimiento
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_comentario_permisos_comentario 
      ON comentario_inventario_permisos(comentario_id)
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_comentario_permisos_usuario 
      ON comentario_inventario_permisos(usuario_id)
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_comentario_permisos_asignado_por 
      ON comentario_inventario_permisos(asignado_por)
    `);

    console.log('✅ Índices creados exitosamente');

  } catch (error) {
    console.error('❌ Error creando tabla de permisos:', error);
  } finally {
    await db.end();
  }
}

createCommentPermissionsTable();

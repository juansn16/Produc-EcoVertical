import db from '../config/db.js';

async function createNotificationsTable() {
  try {
    console.log('🔄 Creando tabla de notificaciones principal...');

    // Crear tabla notificaciones principal
    const createNotificationsTable = `
      CREATE TABLE IF NOT EXISTS notificaciones (
        id CHAR(36) PRIMARY KEY,
        usuario_id CHAR(36) NOT NULL,
        titulo VARCHAR(150) NOT NULL,
        mensaje TEXT NOT NULL,
        tipo ENUM('comentario', 'alerta', 'sistema', 'recordatorio', 'riego', 'plaga', 'tarea') NOT NULL DEFAULT 'sistema',
        huerto_id CHAR(36) NULL,
        huerto_nombre VARCHAR(100) NULL,
        datos_adicionales JSON NULL,
        leida TINYINT(1) DEFAULT 0,
        fecha_leida TIMESTAMP NULL,
        is_deleted TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (huerto_id) REFERENCES huertos(id) ON DELETE SET NULL,
        INDEX idx_usuario_no_leida (usuario_id, leida),
        INDEX idx_tipo (tipo),
        INDEX idx_huerto (huerto_id),
        INDEX idx_fecha_creacion (created_at)
      )
    `;

    console.log('📝 Creando tabla notificaciones...');
    await db.execute(createNotificationsTable);
    console.log('✅ Tabla notificaciones creada');

    console.log('🎉 ¡Tabla de notificaciones creada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando tabla de notificaciones:', error);
    process.exit(1);
  }
}

createNotificationsTable();


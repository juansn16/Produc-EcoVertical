import db from '../config/db.js';

async function createIrrigationAlertsTables() {
  try {
    console.log('🌱 Creando tablas para el sistema de alertas de riego...');

    // Tabla para alertas de riego
    const createAlertsTable = `
      CREATE TABLE IF NOT EXISTS alertas_riego (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        huerto_id CHAR(36) NOT NULL,
        descripcion TEXT NOT NULL,
        fecha_alerta DATE NOT NULL,
        hora_alerta TIME NOT NULL,
        creado_por CHAR(36) NOT NULL,
        estado ENUM('activa', 'completada', 'cancelada') DEFAULT 'activa',
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (huerto_id) REFERENCES huertos(id) ON DELETE CASCADE,
        FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE CASCADE,
        INDEX idx_fecha_hora (fecha_alerta, hora_alerta),
        INDEX idx_huerto (huerto_id),
        INDEX idx_estado (estado)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `;

    // Tabla para notificaciones de alertas
    const createNotificationsTable = `
      CREATE TABLE IF NOT EXISTS notificaciones_alertas (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        usuario_id CHAR(36) NOT NULL,
        alerta_id CHAR(36) NOT NULL,
        tipo ENUM('creacion', 'recordatorio', 'vencida') NOT NULL,
        mensaje TEXT NOT NULL,
        leida BOOLEAN DEFAULT FALSE,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_lectura TIMESTAMP NULL,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (alerta_id) REFERENCES alertas_riego(id) ON DELETE CASCADE,
        INDEX idx_usuario (usuario_id),
        INDEX idx_alerta (alerta_id),
        INDEX idx_leida (leida),
        INDEX idx_fecha_creacion (fecha_creacion)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `;

    // Tabla para usuarios conectados (para WebSocket)
    const createOnlineUsersTable = `
      CREATE TABLE IF NOT EXISTS usuarios_conectados (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        usuario_id CHAR(36) NOT NULL,
        socket_id VARCHAR(255) NOT NULL,
        ultima_conexion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        UNIQUE KEY unique_usuario (usuario_id),
        INDEX idx_socket (socket_id),
        INDEX idx_ultima_conexion (ultima_conexion)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `;

    // Ejecutar las consultas
    await db.execute(createAlertsTable);
    console.log('✅ Tabla alertas_riego creada');

    await db.execute(createNotificationsTable);
    console.log('✅ Tabla notificaciones_alertas creada');

    await db.execute(createOnlineUsersTable);
    console.log('✅ Tabla usuarios_conectados creada');

    console.log('🎉 Todas las tablas del sistema de alertas de riego han sido creadas exitosamente');

  } catch (error) {
    console.error('❌ Error creando tablas:', error);
  } finally {
    await db.end();
  }
}

createIrrigationAlertsTables();

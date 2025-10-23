import db from '../config/db.js';

async function createMissingTables() {
  try {
    console.log('🔍 Verificando conexión a la base de datos...');
    
    // Verificar conexión
    const [result] = await db.execute('SELECT 1 as test');
    console.log('✅ Conexión a la base de datos exitosa');

    // Verificar si existe la tabla alertas_programadas_riego
    const [tables1] = await db.execute("SHOW TABLES LIKE 'alertas_programadas_riego'");
    if (tables1.length === 0) {
      console.log('❌ Tabla alertas_programadas_riego NO existe, creándola...');
      
      const createTable1 = `
        CREATE TABLE IF NOT EXISTS alertas_programadas_riego (
          id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
          huerto_id CHAR(36) NOT NULL,
          titulo VARCHAR(255) NOT NULL,
          descripcion TEXT,
          fecha_programada DATE NOT NULL,
          hora_programada TIME NOT NULL,
          duracion_minutos INT DEFAULT 30,
          creado_por CHAR(36) NOT NULL,
          esta_activa BOOLEAN DEFAULT TRUE,
          notificacion_enviada BOOLEAN DEFAULT FALSE,
          fecha_notificacion_enviada TIMESTAMP NULL,
          is_deleted BOOLEAN DEFAULT FALSE,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (huerto_id) REFERENCES huertos(id) ON DELETE CASCADE,
          FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE CASCADE,
          INDEX idx_fecha_hora (fecha_programada, hora_programada),
          INDEX idx_huerto (huerto_id),
          INDEX idx_activa (esta_activa),
          INDEX idx_notificacion_enviada (notificacion_enviada),
          INDEX idx_is_deleted (is_deleted)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
      `;
      
      await db.execute(createTable1);
      console.log('✅ Tabla alertas_programadas_riego creada');
    } else {
      console.log('✅ Tabla alertas_programadas_riego ya existe');
    }

    // Verificar si existe la tabla alertas_riego
    const [tables2] = await db.execute("SHOW TABLES LIKE 'alertas_riego'");
    if (tables2.length === 0) {
      console.log('❌ Tabla alertas_riego NO existe, creándola...');
      
      const createTable2 = `
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
      
      await db.execute(createTable2);
      console.log('✅ Tabla alertas_riego creada');
    } else {
      console.log('✅ Tabla alertas_riego ya existe');
    }

    // Verificar si existe la tabla notificaciones_alertas_riego
    const [tables3] = await db.execute("SHOW TABLES LIKE 'notificaciones_alertas_riego'");
    if (tables3.length === 0) {
      console.log('❌ Tabla notificaciones_alertas_riego NO existe, creándola...');
      
      const createTable3 = `
        CREATE TABLE IF NOT EXISTS notificaciones_alertas_riego (
          id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
          alerta_programada_id CHAR(36) NOT NULL,
          usuario_id CHAR(36) NOT NULL,
          tipo_notificacion ENUM('recordatorio', 'vencida', 'completada') NOT NULL,
          mensaje TEXT NOT NULL,
          metodo_envio ENUM('email', 'sistema', 'push') DEFAULT 'sistema',
          enviada BOOLEAN DEFAULT FALSE,
          fecha_envio TIMESTAMP NULL,
          leida BOOLEAN DEFAULT FALSE,
          fecha_lectura TIMESTAMP NULL,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (alerta_programada_id) REFERENCES alertas_programadas_riego(id) ON DELETE CASCADE,
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
          INDEX idx_alerta_programada (alerta_programada_id),
          INDEX idx_usuario (usuario_id),
          INDEX idx_tipo (tipo_notificacion),
          INDEX idx_enviada (enviada),
          INDEX idx_leida (leida),
          INDEX idx_fecha_creacion (fecha_creacion)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
      `;
      
      await db.execute(createTable3);
      console.log('✅ Tabla notificaciones_alertas_riego creada');
    } else {
      console.log('✅ Tabla notificaciones_alertas_riego ya existe');
    }

    // Verificar si existe la tabla notificaciones_alertas
    const [tables4] = await db.execute("SHOW TABLES LIKE 'notificaciones_alertas'");
    if (tables4.length === 0) {
      console.log('❌ Tabla notificaciones_alertas NO existe, creándola...');
      
      const createTable4 = `
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
      
      await db.execute(createTable4);
      console.log('✅ Tabla notificaciones_alertas creada');
    } else {
      console.log('✅ Tabla notificaciones_alertas ya existe');
    }

    // Verificar si existe la tabla usuarios_conectados
    const [tables5] = await db.execute("SHOW TABLES LIKE 'usuarios_conectados'");
    if (tables5.length === 0) {
      console.log('❌ Tabla usuarios_conectados NO existe, creándola...');
      
      const createTable5 = `
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
      
      await db.execute(createTable5);
      console.log('✅ Tabla usuarios_conectados creada');
    } else {
      console.log('✅ Tabla usuarios_conectados ya existe');
    }

    console.log('\n🎉 Verificación completada. Todas las tablas necesarias están disponibles.');
    
    // Mostrar todas las tablas
    const [allTables] = await db.execute("SHOW TABLES");
    console.log('\n📋 Tablas en la base de datos:');
    allTables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

createMissingTables();





-- Migración para crear tablas del sistema de alertas de riego en PostgreSQL
-- Ejecutar este script en la base de datos de producción

-- Crear extensión para UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla para alertas de riego
CREATE TABLE IF NOT EXISTS alertas_riego (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  huerto_id UUID NOT NULL,
  descripcion TEXT NOT NULL,
  fecha_alerta DATE NOT NULL,
  hora_alerta TIME NOT NULL,
  estado VARCHAR(20) DEFAULT 'activa' CHECK (estado IN ('activa','completada','cancelada')),
  creado_por UUID NOT NULL,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (huerto_id) REFERENCES huertos(id) ON DELETE CASCADE,
  FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Crear índices para alertas_riego
CREATE INDEX IF NOT EXISTS idx_alertas_riego_fecha_hora ON alertas_riego(fecha_alerta, hora_alerta);
CREATE INDEX IF NOT EXISTS idx_alertas_riego_huerto ON alertas_riego(huerto_id);
CREATE INDEX IF NOT EXISTS idx_alertas_riego_estado ON alertas_riego(estado);

-- Tabla para notificaciones de alertas
CREATE TABLE IF NOT EXISTS notificaciones_alertas (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL,
  alerta_id UUID NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('creacion','recordatorio','vencida')),
  mensaje TEXT NOT NULL,
  leida BOOLEAN DEFAULT FALSE,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_lectura TIMESTAMP NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (alerta_id) REFERENCES alertas_riego(id) ON DELETE CASCADE
);

-- Crear índices para notificaciones_alertas
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones_alertas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_alerta ON notificaciones_alertas(alerta_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones_alertas(leida);
CREATE INDEX IF NOT EXISTS idx_notificaciones_fecha_creacion ON notificaciones_alertas(fecha_creacion);

-- Tabla para usuarios conectados (para WebSocket)
CREATE TABLE IF NOT EXISTS usuarios_conectados (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL,
  socket_id VARCHAR(255) NOT NULL,
  fecha_conexion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  UNIQUE (usuario_id)
);

-- Crear índices para usuarios_conectados
CREATE INDEX IF NOT EXISTS idx_usuarios_conectados_socket ON usuarios_conectados(socket_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_conectados_fecha ON usuarios_conectados(fecha_conexion);

-- Crear trigger para fecha_actualizacion en alertas_riego
CREATE OR REPLACE FUNCTION update_alertas_riego_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_alertas_riego_updated_at 
    BEFORE UPDATE ON alertas_riego 
    FOR EACH ROW EXECUTE FUNCTION update_alertas_riego_updated_at();

-- Verificar que las tablas se crearon correctamente
SELECT 'alertas_riego' as tabla, COUNT(*) as registros FROM alertas_riego
UNION ALL
SELECT 'notificaciones_alertas' as tabla, COUNT(*) as registros FROM notificaciones_alertas
UNION ALL
SELECT 'usuarios_conectados' as tabla, COUNT(*) as registros FROM usuarios_conectados;

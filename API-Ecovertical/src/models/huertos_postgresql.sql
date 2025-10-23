-- PostgreSQL Migration Script
-- Migrated from MySQL/MariaDB to PostgreSQL
-- Original file: huertos (para migrar).sql

-- Configuración inicial para PostgreSQL
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Crear extensión para UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla alertas
--

CREATE TABLE alertas (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  titulo VARCHAR(150) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('riego','cosecha','mantenimiento','plaga','general')),
  prioridad VARCHAR(20) DEFAULT 'media' CHECK (prioridad IN ('baja','media','alta','urgente')),
  huerto_id UUID NOT NULL,
  usuario_creador UUID NOT NULL,
  fecha_programada TIMESTAMP DEFAULT NULL,
  hora_programada TIME DEFAULT NULL,
  duracion_minutos INTEGER DEFAULT NULL,
  notificar_antes_minutos INTEGER DEFAULT NULL,
  fecha_vencimiento TIMESTAMP DEFAULT NULL,
  esta_activa BOOLEAN DEFAULT true,
  notas TEXT DEFAULT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla alertas_programadas_riego
--

CREATE TABLE alertas_programadas_riego (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  huerto_id UUID NOT NULL,
  usuario_creador UUID NOT NULL,
  titulo VARCHAR(150) NOT NULL DEFAULT 'Alerta Programada de Riego',
  descripcion TEXT DEFAULT NULL,
  fecha_programada TIMESTAMP NOT NULL,
  hora_programada TIME NOT NULL,
  duracion_minutos INTEGER DEFAULT 30,
  notificar_antes_minutos INTEGER DEFAULT 10,
  esta_activa BOOLEAN DEFAULT true,
  es_recurrente BOOLEAN DEFAULT false,
  frecuencia_recurrencia VARCHAR(20) DEFAULT NULL CHECK (frecuencia_recurrencia IN ('diaria','semanal','mensual')),
  dias_semana TEXT DEFAULT NULL, -- JSON array de días de la semana para recurrencia semanal
  fecha_fin_recurrencia DATE DEFAULT NULL,
  notificacion_enviada BOOLEAN DEFAULT false,
  fecha_notificacion_enviada TIMESTAMP DEFAULT NULL,
  notas TEXT DEFAULT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL
);

-- Crear trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_alertas_programadas_riego_updated_at 
    BEFORE UPDATE ON alertas_programadas_riego 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla alertas_riego
--

CREATE TABLE alertas_riego (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  huerto_id UUID NOT NULL,
  descripcion TEXT NOT NULL,
  fecha_alerta DATE NOT NULL,
  hora_alerta TIME NOT NULL,
  estado VARCHAR(20) DEFAULT 'activa' CHECK (estado IN ('activa','completada','cancelada')),
  creado_por UUID NOT NULL,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Crear trigger para fecha_actualizacion
CREATE TRIGGER update_alertas_riego_fecha_actualizacion 
    BEFORE UPDATE ON alertas_riego 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla alerta_destinatarios
--

CREATE TABLE alerta_destinatarios (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  alerta_id UUID NOT NULL,
  usuario_id UUID NOT NULL,
  leida BOOLEAN DEFAULT false,
  fecha_leida TIMESTAMP NULL DEFAULT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla auth_tokens
--

CREATE TABLE auth_tokens (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL,
  refresh_token VARCHAR(500) NOT NULL,
  expiracion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Crear trigger para expiracion
CREATE TRIGGER update_auth_tokens_expiracion 
    BEFORE UPDATE ON auth_tokens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla categorias
--

CREATE TABLE categorias (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

--
-- Volcado de datos para la tabla categorias
--

INSERT INTO categorias (id, nombre, descripcion, is_deleted, created_at) VALUES
('b323ecb8-4ce3-4a71-8019-bdd9dd8e1911', 'Sensores', 'Categoría para Sensores', false, '2025-09-30 14:04:47'),
('e5e9dd22-9bf5-11f0-a21f-3417ebc2e080', 'Semillas', 'Semillas de diferentes tipos de plantas', false, '2025-09-27 23:01:27'),
('e5e9eb50-9bf5-11f0-a21f-3417ebc2e080', 'Herramientas', 'Herramientas para jardinería y agricultura', false, '2025-09-27 23:01:27'),
('e5e9ebf6-9bf5-11f0-a21f-3417ebc2e080', 'Fertilizantes', 'Fertilizantes y abonos orgánicos', false, '2025-09-27 23:01:27'),
('e5e9ec4f-9bf5-11f0-a21f-3417ebc2e080', 'Macetas', 'Macetas y contenedores para plantas', false, '2025-09-27 23:01:27'),
('e5e9eca2-9bf5-11f0-a21f-3417ebc2e080', 'Riego', 'Sistemas de riego y accesorios', false, '2025-09-27 23:01:27'),
('e5e9ecf5-9bf5-11f0-a21f-3417ebc2e080', 'Protección', 'Productos para protección de plantas', false, '2025-09-27 23:01:27'),
('e5e9ed46-9bf5-11f0-a21f-3417ebc2e080', 'Decoración', 'Elementos decorativos para jardín', false, '2025-09-27 23:01:27');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla categorias_alertas
--

CREATE TABLE categorias_alertas (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  color VARCHAR(20) DEFAULT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

--
-- Volcado de datos para la tabla categorias_alertas
--

INSERT INTO categorias_alertas (id, nombre, descripcion, color, is_deleted, created_at) VALUES
('f6261f20-918e-11f0-8bda-dc1ba1b74868', 'Riego', 'Alertas relacionadas con el riego de plantas', '#3B82F6', false, '2025-09-14 17:19:24'),
('f6262f7b-918e-11f0-8bda-dc1ba1b74868', 'Cosecha', 'Recordatorios para la cosecha de cultivos', '#10B981', false, '2025-09-14 17:19:24'),
('f6262fef-918e-11f0-8bda-dc1ba1b74868', 'Mantenimiento', 'Tareas de mantenimiento del huerto', '#F59E0B', false, '2025-09-14 17:19:24'),
('f626301b-918e-11f0-8bda-dc1ba1b74868', 'Plagas', 'Alertas sobre plagas y enfermedades', '#EF4444', false, '2025-09-14 17:19:24'),
('f626303e-918e-11f0-8bda-dc1ba1b74868', 'General', 'Alertas generales del sistema', '#6B7280', false, '2025-09-14 17:19:24');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla categorias_productos
--

CREATE TABLE categorias_productos (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

--
-- Volcado de datos para la tabla categorias_productos
--

INSERT INTO categorias_productos (id, nombre, descripcion, is_deleted, created_at) VALUES
('f624ed6c-918e-11f0-8bda-dc1ba1b74868', 'Semillas', 'Semillas de diferentes tipos de plantas y cultivos', false, '2025-09-14 17:19:24'),
('f62502fb-918e-11f0-8bda-dc1ba1b74868', 'Fertilizantes', 'Productos para nutrir y mejorar el crecimiento de las plantas', false, '2025-09-14 17:19:24'),
('f625037d-918e-11f0-8bda-dc1ba1b74868', 'Herramientas', 'Herramientas manuales y eléctricas para el cuidado del huerto', false, '2025-09-14 17:19:24'),
('f62503a6-918e-11f0-8bda-dc1ba1b74868', 'Sustratos', 'Tierras, abonos orgánicos y mezclas para cultivo', false, '2025-09-14 17:19:24'),
('f62503c6-918e-11f0-8bda-dc1ba1b74868', 'Macetas', 'Contenedores y macetas de diferentes tamaños y materiales', false, '2025-09-14 17:19:24'),
('f62503e3-918e-11f0-8bda-dc1ba1b74868', 'Sistemas de Riego', 'Equipos y accesorios para el riego automático y manual', false, '2025-09-14 17:19:24'),
('f62503fe-918e-11f0-8bda-dc1ba1b74868', 'Iluminación', 'Lámparas y sistemas de iluminación para cultivos indoor', false, '2025-09-14 17:19:24'),
('f6250419-918e-11f0-8bda-dc1ba1b74868', 'Sensores', 'Dispositivos para monitorear humedad, temperatura y otros parámetros', false, '2025-09-14 17:19:24'),
('f625043f-918e-11f0-8bda-dc1ba1b74868', 'Protección', 'Productos para proteger plantas de plagas y enfermedades', false, '2025-09-14 17:19:24'),
('f625045a-918e-11f0-8bda-dc1ba1b74868', 'Otros', 'Otros productos y accesorios para el huerto', false, '2025-09-14 17:19:24');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla codigos_invitacion
--

CREATE TABLE codigos_invitacion (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  codigo VARCHAR(6) NOT NULL,
  administrador_id UUID NOT NULL,
  ubicacion_id UUID NOT NULL,
  esta_activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_expiracion TIMESTAMP NULL DEFAULT NULL,
  usado_por UUID DEFAULT NULL,
  fecha_uso TIMESTAMP NULL DEFAULT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL
);

-- Crear trigger para updated_at
CREATE TRIGGER update_codigos_invitacion_updated_at 
    BEFORE UPDATE ON codigos_invitacion 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla comentarios
--

CREATE TABLE comentarios (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  huerto_id UUID NOT NULL,
  usuario_id UUID NOT NULL,
  contenido TEXT NOT NULL,
  tipo_comentario VARCHAR(20) DEFAULT 'general' CHECK (tipo_comentario IN ('riego','siembra','cosecha','abono','plagas','general','mantenimiento')),
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NULL DEFAULT NULL,
  is_deleted BOOLEAN DEFAULT false,
  cambio_tierra VARCHAR(20) DEFAULT NULL CHECK (cambio_tierra IN ('si','por_encima')), -- Indica si se cambió la tierra completamente (si) o se agregó por encima (por_encima)
  nombre_siembra VARCHAR(255) DEFAULT NULL -- Nombre descriptivo de la siembra para facilitar identificación
);

-- Crear trigger para fecha_actualizacion
CREATE TRIGGER update_comentarios_fecha_actualizacion 
    BEFORE UPDATE ON comentarios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla comentarios_inventario
--

CREATE TABLE comentarios_inventario (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  inventario_id UUID NOT NULL,
  usuario_id UUID NOT NULL,
  contenido TEXT NOT NULL,
  tipo_comentario VARCHAR(20) DEFAULT 'uso' CHECK (tipo_comentario IN ('uso','mantenimiento','reposicion','general')),
  cantidad_usada INTEGER DEFAULT NULL,
  unidad_medida VARCHAR(50) DEFAULT NULL,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NULL DEFAULT NULL,
  is_deleted BOOLEAN DEFAULT false
);

-- Crear trigger para fecha_actualizacion
CREATE TRIGGER update_comentarios_inventario_fecha_actualizacion 
    BEFORE UPDATE ON comentarios_inventario 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla comentario_inventario_permisos
--

CREATE TABLE comentario_inventario_permisos (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  comentario_id UUID NOT NULL,
  usuario_id UUID NOT NULL,
  permiso_tipo VARCHAR(20) NOT NULL CHECK (permiso_tipo IN ('editar','eliminar')),
  fecha_asignacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  asignado_por UUID NOT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Crear trigger para updated_at
CREATE TRIGGER update_comentario_inventario_permisos_updated_at 
    BEFORE UPDATE ON comentario_inventario_permisos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla comentario_permisos
--

CREATE TABLE comentario_permisos (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  comentario_id UUID NOT NULL,
  usuario_id UUID NOT NULL,
  permiso_tipo VARCHAR(20) NOT NULL CHECK (permiso_tipo IN ('editar','eliminar')),
  fecha_asignacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  asignado_por UUID NOT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Crear trigger para updated_at
CREATE TRIGGER update_comentario_permisos_updated_at 
    BEFORE UPDATE ON comentario_permisos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla configuracion_alertas_usuario
--

CREATE TABLE configuracion_alertas_usuario (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL,
  recibir_alertas_riego BOOLEAN DEFAULT true,
  horario_notificaciones_inicio TIME DEFAULT '07:00:00',
  horario_notificaciones_fin TIME DEFAULT '20:00:00',
  notificar_fines_semana BOOLEAN DEFAULT true,
  recordatorio_minutos_antes INTEGER DEFAULT 15,
  max_recordatorios_dia INTEGER DEFAULT 3,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL
);

-- Crear trigger para updated_at
CREATE TRIGGER update_configuracion_alertas_usuario_updated_at 
    BEFORE UPDATE ON configuracion_alertas_usuario 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla huertos
--

CREATE TABLE huertos (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  tipo VARCHAR(20) NOT NULL DEFAULT 'privado' CHECK (tipo IN ('privado','publico')),
  superficie DECIMAL(10,2) DEFAULT NULL, -- Tamaño en metros cuadrados
  capacidad INTEGER DEFAULT NULL, -- Número máximo de plantas permitidos
  ubicacion_id UUID NOT NULL,
  usuario_creador UUID NOT NULL, -- Usuario que creó el huerto
  imagen_url VARCHAR(255) DEFAULT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla huerto_data
--

CREATE TABLE huerto_data (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  comentario_id UUID DEFAULT NULL,
  huerto_id UUID NOT NULL,
  fecha DATE DEFAULT NULL,
  cantidad_agua DECIMAL(10,2) DEFAULT NULL, -- Litros de agua utilizados
  unidad_agua VARCHAR(10) DEFAULT 'ml' CHECK (unidad_agua IN ('ml','l')),
  cantidad_siembra INTEGER DEFAULT NULL, -- Cantidad de plantas sembradas
  cantidad_cosecha INTEGER DEFAULT NULL, -- Cantidad cosechada
  fecha_inicio DATE DEFAULT NULL,
  fecha_final DATE DEFAULT NULL,
  total_dias INTEGER DEFAULT NULL,
  cantidad_abono DECIMAL(10,2) DEFAULT NULL, -- Kg de abono utilizado
  cantidad_plagas DECIMAL(10,2) DEFAULT NULL, -- Tratamiento aplicado
  usuario_registro UUID NOT NULL, -- Usuario que registró los datos
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  plaga_especie VARCHAR(100) DEFAULT NULL, -- Especie de plaga detectada
  plaga_nivel VARCHAR(20) DEFAULT NULL CHECK (plaga_nivel IN ('pocos','medio','muchos')), -- Nivel de incidencia de la plaga
  siembra_relacionada UUID DEFAULT NULL,
  huerto_siembra_id UUID DEFAULT NULL, -- ID de la siembra relacionada para todos los tipos de comentarios excepto siembra y cosecha
  cantidad_mantenimiento DECIMAL(10,2) DEFAULT NULL, -- Cantidad de tiempo de mantenimiento
  unidad_mantenimiento VARCHAR(20) DEFAULT 'minutos' CHECK (unidad_mantenimiento IN ('minutos','horas')), -- Unidad de tiempo para mantenimiento
  unidad_abono VARCHAR(10) DEFAULT 'kg' CHECK (unidad_abono IN ('kg','g')) -- Unidad de medida para abono
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla inventario
--

CREATE TABLE inventario (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  categoria_id UUID NOT NULL,
  cantidad_stock INTEGER DEFAULT 0,
  cantidad_minima INTEGER DEFAULT 5,
  precio_estimado DECIMAL(10,2) DEFAULT NULL,
  ubicacion_almacen VARCHAR(150) DEFAULT NULL,
  huerto_id UUID DEFAULT NULL,
  proveedor_id UUID DEFAULT NULL,
  imagen_url VARCHAR(255) DEFAULT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  usuario_creador UUID NOT NULL -- Usuario que creó el item de inventario
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla inventario_permisos
--

CREATE TABLE inventario_permisos (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  inventario_id UUID NOT NULL,
  usuario_id UUID NOT NULL,
  permiso_tipo VARCHAR(20) NOT NULL CHECK (permiso_tipo IN ('completo')),
  fecha_asignacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  asignado_por UUID NOT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Crear trigger para updated_at
CREATE TRIGGER update_inventario_permisos_updated_at 
    BEFORE UPDATE ON inventario_permisos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla notificaciones
--

CREATE TABLE notificaciones (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  mensaje TEXT NOT NULL,
  tipo VARCHAR(20) NOT NULL DEFAULT 'sistema' CHECK (tipo IN ('comentario','alerta','sistema','recordatorio','riego','plaga','tarea')),
  huerto_id UUID DEFAULT NULL,
  huerto_nombre VARCHAR(100) DEFAULT NULL,
  datos_adicionales JSONB DEFAULT NULL,
  leida BOOLEAN DEFAULT false,
  fecha_leida TIMESTAMP NULL DEFAULT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL
);

-- Crear trigger para updated_at
CREATE TRIGGER update_notificaciones_updated_at 
    BEFORE UPDATE ON notificaciones 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla notificaciones_alertas
--

CREATE TABLE notificaciones_alertas (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL,
  alerta_id UUID NOT NULL,
  mensaje TEXT NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('creacion','recordatorio','completada','cancelada')),
  leida BOOLEAN DEFAULT false,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_lectura TIMESTAMP NULL DEFAULT NULL
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla notificaciones_alertas_riego
--

CREATE TABLE notificaciones_alertas_riego (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  alerta_programada_id UUID NOT NULL,
  usuario_id UUID NOT NULL,
  tipo_notificacion VARCHAR(20) NOT NULL CHECK (tipo_notificacion IN ('recordatorio','alerta_inmediata')),
  mensaje TEXT NOT NULL,
  enviada BOOLEAN DEFAULT false,
  fecha_envio TIMESTAMP DEFAULT NULL,
  metodo_envio VARCHAR(20) DEFAULT 'sistema' CHECK (metodo_envio IN ('sistema','email','sms')),
  leida BOOLEAN DEFAULT false,
  fecha_leida TIMESTAMP DEFAULT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla password_reset_codes
--

CREATE TABLE password_reset_codes (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear trigger para updated_at
CREATE TRIGGER update_password_reset_codes_updated_at 
    BEFORE UPDATE ON password_reset_codes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla productos_proveedores
--

CREATE TABLE productos_proveedores (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  categoria_id UUID NOT NULL,
  proveedor_id UUID NOT NULL,
  precio DECIMAL(10,2) DEFAULT NULL,
  unidad_medida VARCHAR(20) DEFAULT 'unidad',
  etiquetas TEXT DEFAULT NULL,
  imagen_url VARCHAR(255) DEFAULT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla proveedores
--

CREATE TABLE proveedores (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  nombre_empresa VARCHAR(150) NOT NULL,
  contacto_principal VARCHAR(100) DEFAULT NULL,
  telefono VARCHAR(20) DEFAULT NULL,
  email VARCHAR(120) DEFAULT NULL,
  ubicacion_id UUID DEFAULT NULL,
  descripcion TEXT DEFAULT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  usuario_creador UUID DEFAULT NULL
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla proveedor_categorias
--

CREATE TABLE proveedor_categorias (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  proveedor_id UUID NOT NULL,
  categoria_id UUID NOT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla ubicaciones
--

CREATE TABLE ubicaciones (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  calle VARCHAR(150) DEFAULT NULL,
  ciudad VARCHAR(100) NOT NULL,
  estado VARCHAR(100) DEFAULT NULL,
  pais VARCHAR(100) DEFAULT 'Venezuela',
  latitud DECIMAL(5,2) DEFAULT NULL,
  longitud DECIMAL(6,2) DEFAULT NULL,
  descripcion TEXT DEFAULT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla usuarios
--

CREATE TABLE usuarios (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  cedula VARCHAR(20) NOT NULL,
  telefono VARCHAR(20) DEFAULT NULL,
  preferencias_cultivo VARCHAR(100) DEFAULT NULL,
  rol VARCHAR(20) NOT NULL CHECK (rol IN ('administrador','tecnico','residente','colaborador')),
  ubicacion_id UUID DEFAULT NULL,
  email VARCHAR(120) NOT NULL,
  password VARCHAR(255) NOT NULL,
  imagen_url VARCHAR(255) DEFAULT NULL,
  es_administrador_original BOOLEAN DEFAULT false, -- Indica si el usuario se registró como administrador original (checkbox marcado)
  codigo_invitacion_usado VARCHAR(6) DEFAULT NULL, -- Código de invitación que usó el usuario para registrarse como residente
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla usuarios_conectados
--

CREATE TABLE usuarios_conectados (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL,
  socket_id VARCHAR(255) NOT NULL,
  fecha_conexion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultima_actividad TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Crear trigger para ultima_actividad
CREATE TRIGGER update_usuarios_conectados_ultima_actividad 
    BEFORE UPDATE ON usuarios_conectados 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla usuario_huerto
--

CREATE TABLE usuario_huerto (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL,
  huerto_id UUID NOT NULL,
  rol VARCHAR(20) DEFAULT 'colaborador' CHECK (rol IN ('propietario','colaborador','visitante')),
  fecha_union TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla alertas
--
ALTER TABLE alertas ADD PRIMARY KEY (id);
CREATE INDEX idx_alertas_huerto_id ON alertas (huerto_id);
CREATE INDEX idx_alertas_usuario_creador ON alertas (usuario_creador);

--
-- Indices de la tabla alertas_programadas_riego
--
ALTER TABLE alertas_programadas_riego ADD PRIMARY KEY (id);
CREATE INDEX idx_huerto_activa ON alertas_programadas_riego (huerto_id, esta_activa);
CREATE INDEX idx_fecha_programada ON alertas_programadas_riego (fecha_programada);
CREATE INDEX idx_notificacion_pendiente ON alertas_programadas_riego (notificacion_enviada, fecha_programada);
CREATE INDEX idx_creador ON alertas_programadas_riego (usuario_creador);

--
-- Indices de la tabla alertas_riego
--
ALTER TABLE alertas_riego ADD PRIMARY KEY (id);
CREATE INDEX idx_alertas_riego_huerto_id ON alertas_riego (huerto_id);
CREATE INDEX idx_fecha_alerta ON alertas_riego (fecha_alerta);
CREATE INDEX idx_estado ON alertas_riego (estado);
CREATE INDEX idx_creado_por ON alertas_riego (creado_por);

--
-- Indices de la tabla alerta_destinatarios
--
ALTER TABLE alerta_destinatarios ADD PRIMARY KEY (id);
ALTER TABLE alerta_destinatarios ADD UNIQUE (alerta_id, usuario_id);
CREATE INDEX idx_alerta_destinatarios_usuario_id ON alerta_destinatarios (usuario_id);

--
-- Indices de la tabla auth_tokens
--
ALTER TABLE auth_tokens ADD PRIMARY KEY (id);
CREATE INDEX idx_auth_tokens_usuario_id ON auth_tokens (usuario_id);

--
-- Indices de la tabla categorias
--
ALTER TABLE categorias ADD PRIMARY KEY (id);
ALTER TABLE categorias ADD UNIQUE (nombre);

--
-- Indices de la tabla categorias_alertas
--
ALTER TABLE categorias_alertas ADD PRIMARY KEY (id);

--
-- Indices de la tabla categorias_productos
--
ALTER TABLE categorias_productos ADD PRIMARY KEY (id);

--
-- Indices de la tabla codigos_invitacion
--
ALTER TABLE codigos_invitacion ADD PRIMARY KEY (id);
ALTER TABLE codigos_invitacion ADD UNIQUE (codigo);
CREATE INDEX idx_codigos_invitacion_ubicacion_id ON codigos_invitacion (ubicacion_id);
CREATE INDEX idx_codigos_invitacion_usado_por ON codigos_invitacion (usado_por);
CREATE INDEX idx_codigo ON codigos_invitacion (codigo);
CREATE INDEX idx_administrador ON codigos_invitacion (administrador_id);
CREATE INDEX idx_activo ON codigos_invitacion (esta_activo);
CREATE INDEX idx_expiracion ON codigos_invitacion (fecha_expiracion);

--
-- Indices de la tabla comentarios
--
ALTER TABLE comentarios ADD PRIMARY KEY (id);
CREATE INDEX idx_comentarios_usuario_id ON comentarios (usuario_id);
CREATE INDEX idx_comentarios_huerto_id ON comentarios (huerto_id);
CREATE INDEX idx_comentarios_nombre_siembra ON comentarios (nombre_siembra);

--
-- Indices de la tabla comentarios_inventario
--
ALTER TABLE comentarios_inventario ADD PRIMARY KEY (id);
CREATE INDEX idx_comentarios_inventario_inventario_id ON comentarios_inventario (inventario_id);
CREATE INDEX idx_comentarios_inventario_usuario_id ON comentarios_inventario (usuario_id);
CREATE INDEX idx_comentarios_inventario_tipo ON comentarios_inventario (tipo_comentario);

--
-- Indices de la tabla comentario_inventario_permisos
--
ALTER TABLE comentario_inventario_permisos ADD PRIMARY KEY (id);
ALTER TABLE comentario_inventario_permisos ADD UNIQUE (comentario_id, usuario_id, permiso_tipo);
CREATE INDEX idx_comentario_permisos_comentario ON comentario_inventario_permisos (comentario_id);
CREATE INDEX idx_comentario_permisos_usuario ON comentario_inventario_permisos (usuario_id);
CREATE INDEX idx_comentario_permisos_asignado_por ON comentario_inventario_permisos (asignado_por);

--
-- Indices de la tabla comentario_permisos
--
ALTER TABLE comentario_permisos ADD PRIMARY KEY (id);
ALTER TABLE comentario_permisos ADD UNIQUE (comentario_id, usuario_id, permiso_tipo);

--
-- Indices de la tabla configuracion_alertas_usuario
--
ALTER TABLE configuracion_alertas_usuario ADD PRIMARY KEY (id);
ALTER TABLE configuracion_alertas_usuario ADD UNIQUE (usuario_id);

--
-- Indices de la tabla huertos
--
ALTER TABLE huertos ADD PRIMARY KEY (id);
CREATE INDEX idx_huertos_ubicacion_id ON huertos (ubicacion_id);
CREATE INDEX idx_huertos_usuario_creador ON huertos (usuario_creador);

--
-- Indices de la tabla huerto_data
--
ALTER TABLE huerto_data ADD PRIMARY KEY (id);
CREATE INDEX idx_huerto_data_huerto_id ON huerto_data (huerto_id);
CREATE INDEX idx_huerto_data_usuario_registro ON huerto_data (usuario_registro);
CREATE INDEX idx_plaga_especie ON huerto_data (plaga_especie);
CREATE INDEX idx_plaga_nivel ON huerto_data (plaga_nivel);
CREATE INDEX idx_huerto_data_comentario_id ON huerto_data (comentario_id);
CREATE INDEX idx_siembra_relacionada ON huerto_data (siembra_relacionada);
CREATE INDEX idx_huerto_data_huerto_siembra ON huerto_data (huerto_siembra_id);

--
-- Indices de la tabla inventario
--
ALTER TABLE inventario ADD PRIMARY KEY (id);
CREATE INDEX idx_inventario_categoria_id ON inventario (categoria_id);
CREATE INDEX idx_inventario_huerto_id ON inventario (huerto_id);
CREATE INDEX idx_inventario_proveedor_id ON inventario (proveedor_id);
CREATE INDEX idx_inventario_usuario_creador ON inventario (usuario_creador);

--
-- Indices de la tabla inventario_permisos
--
ALTER TABLE inventario_permisos ADD PRIMARY KEY (id);
ALTER TABLE inventario_permisos ADD UNIQUE (inventario_id, usuario_id, permiso_tipo);
CREATE INDEX idx_inventario_permisos_inventario_id ON inventario_permisos (inventario_id);
CREATE INDEX idx_inventario_permisos_usuario_id ON inventario_permisos (usuario_id);
CREATE INDEX idx_inventario_permisos_tipo ON inventario_permisos (permiso_tipo);

--
-- Indices de la tabla notificaciones
--
ALTER TABLE notificaciones ADD PRIMARY KEY (id);
CREATE INDEX idx_notificaciones_usuario_no_leida ON notificaciones (usuario_id, leida);
CREATE INDEX idx_tipo ON notificaciones (tipo);
CREATE INDEX idx_huerto ON notificaciones (huerto_id);
CREATE INDEX idx_notificaciones_fecha_creacion ON notificaciones (created_at);

--
-- Indices de la tabla notificaciones_alertas
--
ALTER TABLE notificaciones_alertas ADD PRIMARY KEY (id);
CREATE INDEX idx_notificaciones_usuario_id ON notificaciones_alertas (usuario_id);
CREATE INDEX idx_alerta_id ON notificaciones_alertas (alerta_id);
CREATE INDEX idx_leida ON notificaciones_alertas (leida);
CREATE INDEX idx_notificaciones_alertas_fecha_creacion ON notificaciones_alertas (fecha_creacion);

--
-- Indices de la tabla notificaciones_alertas_riego
--
ALTER TABLE notificaciones_alertas_riego ADD PRIMARY KEY (id);
CREATE INDEX idx_notificaciones_alertas_riego_usuario_no_leida ON notificaciones_alertas_riego (usuario_id, leida);
CREATE INDEX idx_alerta ON notificaciones_alertas_riego (alerta_programada_id);
CREATE INDEX idx_fecha_envio ON notificaciones_alertas_riego (fecha_envio);

--
-- Indices de la tabla password_reset_codes
--
CREATE INDEX idx_password_reset_codes_user_id ON password_reset_codes (user_id);

--
-- Indices de la tabla productos_proveedores
--
ALTER TABLE productos_proveedores ADD PRIMARY KEY (id);
CREATE INDEX idx_productos_proveedores_categoria_id ON productos_proveedores (categoria_id);
CREATE INDEX idx_productos_proveedores_proveedor_id ON productos_proveedores (proveedor_id);

--
-- Indices de la tabla proveedores
--
ALTER TABLE proveedores ADD PRIMARY KEY (id);
CREATE INDEX idx_proveedores_ubicacion_id ON proveedores (ubicacion_id);

--
-- Indices de la tabla proveedor_categorias
--
ALTER TABLE proveedor_categorias ADD PRIMARY KEY (id);
ALTER TABLE proveedor_categorias ADD UNIQUE (proveedor_id, categoria_id);
CREATE INDEX idx_proveedor_id ON proveedor_categorias (proveedor_id);
CREATE INDEX idx_categoria_id ON proveedor_categorias (categoria_id);

--
-- Indices de la tabla ubicaciones
--
ALTER TABLE ubicaciones ADD PRIMARY KEY (id);

--
-- Indices de la tabla usuarios
--
ALTER TABLE usuarios ADD PRIMARY KEY (id);
ALTER TABLE usuarios ADD UNIQUE (cedula);
ALTER TABLE usuarios ADD UNIQUE (email);
CREATE INDEX idx_usuarios_ubicacion_id ON usuarios (ubicacion_id);
CREATE INDEX idx_codigo_invitacion_usado ON usuarios (codigo_invitacion_usado);

--
-- Indices de la tabla usuarios_conectados
--
ALTER TABLE usuarios_conectados ADD PRIMARY KEY (id);
ALTER TABLE usuarios_conectados ADD UNIQUE (socket_id);
CREATE INDEX idx_usuarios_conectados_usuario_id ON usuarios_conectados (usuario_id);
CREATE INDEX idx_ultima_actividad ON usuarios_conectados (ultima_actividad);

--
-- Indices de la tabla usuario_huerto
--
ALTER TABLE usuario_huerto ADD PRIMARY KEY (id);
ALTER TABLE usuario_huerto ADD UNIQUE (usuario_id, huerto_id);
CREATE INDEX idx_usuario_huerto_huerto_id ON usuario_huerto (huerto_id);

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla alertas
--
ALTER TABLE alertas
  ADD CONSTRAINT alertas_huerto_id_fkey FOREIGN KEY (huerto_id) REFERENCES huertos (id),
  ADD CONSTRAINT alertas_usuario_creador_fkey FOREIGN KEY (usuario_creador) REFERENCES usuarios (id);

--
-- Filtros para la tabla alertas_programadas_riego
--
ALTER TABLE alertas_programadas_riego
  ADD CONSTRAINT alertas_programadas_riego_huerto_id_fkey FOREIGN KEY (huerto_id) REFERENCES huertos (id) ON DELETE CASCADE,
  ADD CONSTRAINT alertas_programadas_riego_usuario_creador_fkey FOREIGN KEY (usuario_creador) REFERENCES usuarios (id) ON DELETE CASCADE;

--
-- Filtros para la tabla alerta_destinatarios
--
ALTER TABLE alerta_destinatarios
  ADD CONSTRAINT alerta_destinatarios_alerta_id_fkey FOREIGN KEY (alerta_id) REFERENCES alertas (id),
  ADD CONSTRAINT alerta_destinatarios_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuarios (id);

--
-- Filtros para la tabla auth_tokens
--
ALTER TABLE auth_tokens
  ADD CONSTRAINT auth_tokens_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuarios (id);

--
-- Filtros para la tabla codigos_invitacion
--
ALTER TABLE codigos_invitacion
  ADD CONSTRAINT codigos_invitacion_administrador_id_fkey FOREIGN KEY (administrador_id) REFERENCES usuarios (id) ON DELETE CASCADE,
  ADD CONSTRAINT codigos_invitacion_ubicacion_id_fkey FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones (id) ON DELETE CASCADE,
  ADD CONSTRAINT codigos_invitacion_usado_por_fkey FOREIGN KEY (usado_por) REFERENCES usuarios (id) ON DELETE SET NULL;

--
-- Filtros para la tabla comentarios
--
ALTER TABLE comentarios
  ADD CONSTRAINT comentarios_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
  ADD CONSTRAINT comentarios_huerto_id_fkey FOREIGN KEY (huerto_id) REFERENCES huertos (id);

--
-- Filtros para la tabla comentarios_inventario
--
ALTER TABLE comentarios_inventario
  ADD CONSTRAINT comentarios_inventario_inventario_id_fkey FOREIGN KEY (inventario_id) REFERENCES inventario (id),
  ADD CONSTRAINT comentarios_inventario_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuarios (id);

--
-- Filtros para la tabla configuracion_alertas_usuario
--
ALTER TABLE configuracion_alertas_usuario
  ADD CONSTRAINT configuracion_alertas_usuario_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuarios (id);

--
-- Filtros para la tabla huertos
--
ALTER TABLE huertos
  ADD CONSTRAINT huertos_ubicacion_id_fkey FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones (id),
  ADD CONSTRAINT huertos_usuario_creador_fkey FOREIGN KEY (usuario_creador) REFERENCES usuarios (id);

--
-- Filtros para la tabla huerto_data
--
ALTER TABLE huerto_data
  ADD CONSTRAINT huerto_data_huerto_id_fkey FOREIGN KEY (huerto_id) REFERENCES huertos (id),
  ADD CONSTRAINT huerto_data_usuario_registro_fkey FOREIGN KEY (usuario_registro) REFERENCES usuarios (id),
  ADD CONSTRAINT huerto_data_comentario_id_fkey FOREIGN KEY (comentario_id) REFERENCES comentarios (id);

--
-- Filtros para la tabla inventario
--
ALTER TABLE inventario
  ADD CONSTRAINT inventario_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES categorias_productos (id),
  ADD CONSTRAINT inventario_huerto_id_fkey FOREIGN KEY (huerto_id) REFERENCES huertos (id),
  ADD CONSTRAINT inventario_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES proveedores (id),
  ADD CONSTRAINT inventario_usuario_creador_fkey FOREIGN KEY (usuario_creador) REFERENCES usuarios (id);

--
-- Filtros para la tabla notificaciones
--
ALTER TABLE notificaciones
  ADD CONSTRAINT notificaciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
  ADD CONSTRAINT notificaciones_huerto_id_fkey FOREIGN KEY (huerto_id) REFERENCES huertos (id) ON DELETE SET NULL;

--
-- Filtros para la tabla notificaciones_alertas_riego
--
ALTER TABLE notificaciones_alertas_riego
  ADD CONSTRAINT notificaciones_alertas_riego_alerta_programada_id_fkey FOREIGN KEY (alerta_programada_id) REFERENCES alertas_programadas_riego (id) ON DELETE CASCADE,
  ADD CONSTRAINT notificaciones_alertas_riego_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE;

--
-- Filtros para la tabla password_reset_codes
--
ALTER TABLE password_reset_codes
  ADD CONSTRAINT password_reset_codes_user_id_fkey FOREIGN KEY (user_id) REFERENCES usuarios (id) ON DELETE CASCADE;

--
-- Filtros para la tabla productos_proveedores
--
ALTER TABLE productos_proveedores
  ADD CONSTRAINT productos_proveedores_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES categorias_productos (id),
  ADD CONSTRAINT productos_proveedores_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES proveedores (id);

--
-- Filtros para la tabla proveedores
--
ALTER TABLE proveedores
  ADD CONSTRAINT proveedores_ubicacion_id_fkey FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones (id);

--
-- Filtros para la tabla usuarios
--
ALTER TABLE usuarios
  ADD CONSTRAINT usuarios_ubicacion_id_fkey FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones (id);

--
-- Filtros para la tabla usuario_huerto
--
ALTER TABLE usuario_huerto
  ADD CONSTRAINT usuario_huerto_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
  ADD CONSTRAINT usuario_huerto_huerto_id_fkey FOREIGN KEY (huerto_id) REFERENCES huertos (id);

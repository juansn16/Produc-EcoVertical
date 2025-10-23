-- =====================================================================
-- SCRIPT PARA AGREGAR NUEVOS CAMPOS A LA TABLA COMENTARIOS
-- EcoVertical - Sistema de Gestión de Huertos Verticales
-- =====================================================================
-- Este script agrega los nuevos campos solicitados:
-- 1. Campo "cambio_tierra" para comentarios de abono
-- 2. Campo "huerto_siembra_id" para relacionar con siembras (excepto producción)

USE huertos;

-- =========================
-- AGREGAR NUEVOS CAMPOS A COMENTARIOS
-- =========================

-- Campo para indicar si se cambió la tierra (solo para abono)
ALTER TABLE comentarios 
ADD COLUMN cambio_tierra ENUM('si', 'por_encima') NULL 
COMMENT 'Indica si se cambió la tierra completamente (si) o solo se agregó por encima (por_encima). Solo aplica para comentarios de tipo abono.';

-- Campo para relacionar con siembras (ID de la fecha de creación de siembra)
ALTER TABLE comentarios 
ADD COLUMN huerto_siembra_id CHAR(36) NULL 
COMMENT 'ID de la siembra relacionada (fecha de creación de siembra). Se usa para todos los tipos excepto producción/cosecha.';

-- Agregar índice para mejorar rendimiento en búsquedas por siembra
CREATE INDEX idx_comentarios_huerto_siembra ON comentarios(huerto_siembra_id);

-- =========================
-- COMENTARIOS DE DOCUMENTACIÓN
-- =========================
ALTER TABLE comentarios 
MODIFY COLUMN cambio_tierra ENUM('si', 'por_encima') NULL 
COMMENT 'Indica si se cambió la tierra completamente (si) o solo se agregó por encima (por_encima). Solo aplica para comentarios de tipo abono.';

ALTER TABLE comentarios 
MODIFY COLUMN huerto_siembra_id CHAR(36) NULL 
COMMENT 'ID de la siembra relacionada (fecha de creación de siembra). Se usa para todos los tipos excepto producción/cosecha.';

-- =========================
-- VERIFICACIÓN
-- =========================
-- Mostrar la nueva estructura de la tabla
DESCRIBE comentarios;

-- Mostrar los nuevos campos agregados
SELECT 
    COLUMN_NAME as 'Campo',
    DATA_TYPE as 'Tipo',
    IS_NULLABLE as 'Permite NULL',
    COLUMN_DEFAULT as 'Valor por Defecto',
    COLUMN_COMMENT as 'Comentario'
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'huertos' 
  AND TABLE_NAME = 'comentarios' 
  AND COLUMN_NAME IN ('cambio_tierra', 'huerto_siembra_id');

-- =========================
-- MENSAJE DE ÉXITO
-- =========================
SELECT 'Campos agregados exitosamente a la tabla comentarios' as mensaje;

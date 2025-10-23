-- Script SQL para agregar la columna pre_notificacion_enviada a la tabla alertas_riego
-- Ejecutar este script en tu base de datos MySQL

-- Verificar si la columna ya existe
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'alertas_riego' 
AND COLUMN_NAME = 'pre_notificacion_enviada';

-- Agregar la columna si no existe
ALTER TABLE alertas_riego 
ADD COLUMN pre_notificacion_enviada TINYINT(1) DEFAULT 0 
COMMENT 'Indica si se ha enviado la pre-notificación (10 min antes)';

-- Actualizar todas las alertas existentes para que no tengan pre-notificación enviada
UPDATE alertas_riego 
SET pre_notificacion_enviada = 0 
WHERE pre_notificacion_enviada IS NULL;

-- Verificar que la columna se agregó correctamente
DESCRIBE alertas_riego;

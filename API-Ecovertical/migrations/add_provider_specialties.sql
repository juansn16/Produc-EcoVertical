-- Migración para agregar soporte de múltiples especialidades a proveedores
-- Fecha: $(date)

-- 1. Crear tabla para especialidades de proveedores
CREATE TABLE IF NOT EXISTS `proveedor_especialidades` (
  `id` char(36) NOT NULL,
  `proveedor_id` char(36) NOT NULL,
  `especialidad` varchar(100) NOT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_proveedor_id` (`proveedor_id`),
  KEY `idx_especialidad` (`especialidad`),
  CONSTRAINT `fk_proveedor_especialidades_proveedor` 
    FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2. Migrar datos existentes de especialidad única a la nueva tabla
INSERT INTO `proveedor_especialidades` (`id`, `proveedor_id`, `especialidad`, `created_at`)
SELECT 
  UUID() as id,
  `id` as proveedor_id,
  `especialidad`,
  `created_at`
FROM `proveedores` 
WHERE `especialidad` IS NOT NULL 
  AND `especialidad` != '' 
  AND `is_deleted` = 0;

-- 3. Opcional: Mantener el campo especialidad en la tabla proveedores para compatibilidad
-- (Comentado para mantener compatibilidad con código existente)
-- ALTER TABLE `proveedores` DROP COLUMN `especialidad`;

-- 4. Crear índices adicionales para optimizar consultas
CREATE INDEX `idx_proveedor_especialidades_active` ON `proveedor_especialidades` (`proveedor_id`, `is_deleted`);
CREATE INDEX `idx_especialidad_active` ON `proveedor_especialidades` (`especialidad`, `is_deleted`);

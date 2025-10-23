-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 07-10-2025 a las 01:17:43
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `huertos`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alertas`
--

CREATE TABLE `alertas` (
  `id` char(36) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `tipo` enum('riego','cosecha','mantenimiento','plaga','general') NOT NULL,
  `prioridad` enum('baja','media','alta','urgente') DEFAULT 'media',
  `huerto_id` char(36) NOT NULL,
  `usuario_creador` char(36) NOT NULL,
  `fecha_programada` datetime DEFAULT NULL,
  `hora_programada` time DEFAULT NULL,
  `duracion_minutos` int(11) DEFAULT NULL,
  `notificar_antes_minutos` int(11) DEFAULT NULL,
  `fecha_vencimiento` datetime DEFAULT NULL,
  `esta_activa` tinyint(1) DEFAULT 1,
  `notas` text DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alertas_programadas_riego`
--

CREATE TABLE `alertas_programadas_riego` (
  `id` char(36) NOT NULL,
  `huerto_id` char(36) NOT NULL,
  `usuario_creador` char(36) NOT NULL,
  `titulo` varchar(150) NOT NULL DEFAULT 'Alerta Programada de Riego',
  `descripcion` text DEFAULT NULL,
  `fecha_programada` datetime NOT NULL,
  `hora_programada` time NOT NULL,
  `duracion_minutos` int(11) DEFAULT 30,
  `notificar_antes_minutos` int(11) DEFAULT 10,
  `esta_activa` tinyint(1) DEFAULT 1,
  `es_recurrente` tinyint(1) DEFAULT 0,
  `frecuencia_recurrencia` enum('diaria','semanal','mensual') DEFAULT NULL,
  `dias_semana` text DEFAULT NULL COMMENT 'JSON array de días de la semana para recurrencia semanal',
  `fecha_fin_recurrencia` date DEFAULT NULL,
  `notificacion_enviada` tinyint(1) DEFAULT 0,
  `fecha_notificacion_enviada` datetime DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Triggers para compatibilidad con versiones antiguas (manejo de created_at/updated_at)
DELIMITER $$
CREATE TRIGGER `apr_set_created_at`
BEFORE INSERT ON `alertas_programadas_riego`
FOR EACH ROW
BEGIN
  IF NEW.created_at IS NULL THEN
    SET NEW.created_at = CURRENT_TIMESTAMP;
  END IF;
END$$

CREATE TRIGGER `apr_set_updated_at_insert`
BEFORE INSERT ON `alertas_programadas_riego`
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER `apr_set_updated_at_update`
BEFORE UPDATE ON `alertas_programadas_riego`
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alertas_riego`
--

CREATE TABLE `alertas_riego` (
  `id` char(36) NOT NULL,
  `huerto_id` char(36) NOT NULL,
  `descripcion` text NOT NULL,
  `fecha_alerta` date NOT NULL,
  `hora_alerta` time NOT NULL,
  `estado` enum('activa','completada','cancelada') DEFAULT 'activa',
  `creado_por` char(36) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Triggers para manejo de fecha_actualizacion en alertas_riego
DELIMITER $$
CREATE TRIGGER `ar_set_fecha_actualizacion_insert`
BEFORE INSERT ON `alertas_riego`
FOR EACH ROW
BEGIN
  SET NEW.`fecha_actualizacion` = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER `ar_set_fecha_actualizacion_update`
BEFORE UPDATE ON `alertas_riego`
FOR EACH ROW
BEGIN
  SET NEW.`fecha_actualizacion` = CURRENT_TIMESTAMP;
END$$
DELIMITER ;

--
-- Volcado de datos para la tabla `alertas_riego`
--

INSERT INTO `alertas_riego` (`id`, `huerto_id`, `descripcion`, `fecha_alerta`, `hora_alerta`, `estado`, `creado_por`, `fecha_creacion`, `fecha_actualizacion`) VALUES
('2724e89f-9a5a-11f0-93e9-dc1ba1b74868', '31f8bc46-97af-11f0-a21b-025084b7a91d', 'AGUAAAAAAA', '2025-09-25', '17:55:00', 'completada', '81c0fdea-97ab-11f0-a21b-025084b7a91d', '2025-09-25 21:54:04', '2025-09-25 21:54:49'),
('529e9de2-9a5a-11f0-93e9-dc1ba1b74868', '31f8bc46-97af-11f0-a21b-025084b7a91d', 'AAGUITAAAA', '2025-09-25', '17:56:00', 'activa', '81c0fdea-97ab-11f0-a21b-025084b7a91d', '2025-09-25 21:55:17', '2025-09-25 21:55:17'),
('6693ce2f-9a62-11f0-93e9-dc1ba1b74868', '4d3f6e90-97ac-11f0-a21b-025084b7a91d', 'hola', '2025-09-25', '18:54:00', 'completada', '81c0fdea-97ab-11f0-a21b-025084b7a91d', '2025-09-25 22:53:06', '2025-09-25 22:54:22'),
('971d0f4b-9a5d-11f0-93e9-dc1ba1b74868', '4d3f6e90-97ac-11f0-a21b-025084b7a91d', 'miarma', '2025-09-25', '18:19:00', 'completada', '81c0fdea-97ab-11f0-a21b-025084b7a91d', '2025-09-25 22:18:40', '2025-09-25 22:19:39'),
('9c40af8a-9a5a-11f0-93e9-dc1ba1b74868', '31f8bc46-97af-11f0-a21b-025084b7a91d', 'Buenos dias mi gente', '2025-09-25', '17:58:00', 'activa', '81c0fdea-97ab-11f0-a21b-025084b7a91d', '2025-09-25 21:57:20', '2025-09-25 21:57:20'),
('b6aae907-9a69-11f0-93e9-dc1ba1b74868', '7c60f57a-97ad-11f0-a21b-025084b7a91d', 'lllll', '2025-09-25', '19:46:00', 'completada', '81c0fdea-97ab-11f0-a21b-025084b7a91d', '2025-09-25 23:45:27', '2025-09-25 23:46:05'),
('cd65e9a1-9a5d-11f0-93e9-dc1ba1b74868', '7b173ec0-97ac-11f0-a21b-025084b7a91d', 'WAOOOOOOO', '2025-09-25', '18:21:00', 'completada', '81c0fdea-97ab-11f0-a21b-025084b7a91d', '2025-09-25 22:20:11', '2025-09-25 22:21:39');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alerta_destinatarios`
--

CREATE TABLE `alerta_destinatarios` (
  `id` char(36) NOT NULL,
  `alerta_id` char(36) NOT NULL,
  `usuario_id` char(36) NOT NULL,
  `leida` tinyint(1) DEFAULT 0,
  `fecha_leida` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_tokens`
--

CREATE TABLE `auth_tokens` (
  `id` char(36) NOT NULL,
  `usuario_id` char(36) NOT NULL,
  `refresh_token` varchar(500) NOT NULL,
  `expiracion` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `auth_tokens`
--

INSERT INTO `auth_tokens` (`id`, `usuario_id`, `refresh_token`, `expiracion`, `is_deleted`, `created_at`) VALUES
('06995612-9d4a-11f0-8b6d-dc1ba1b74868', '06983d83-9d4a-11f0-8b6d-dc1ba1b74868', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjA2OTgzZDgzLTlkNGEtMTFmMC04YjZkLWRjMWJhMWI3NDg2OCIsInJvbGUiOiJyZXNpZGVudGUiLCJpYXQiOjE3NTkxNjAxNzEsImV4cCI6MTc1OTc2NDk3MX0.GAnMvffAbK7MSERHSpAvqikMOAqM0k3l6fa5BtTkSso', '2025-10-03 02:19:32', 1, '2025-09-29 15:36:11'),
('224fa7f6-9a38-11f0-93e9-dc1ba1b74868', '81c0fdea-97ab-11f0-a21b-025084b7a91d', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjgxYzBmZGVhLTk3YWItMTFmMC1hMjFiLTAyNTA4NGI3YTkxZCIsInJvbGUiOiJhZG1pbmlzdHJhZG9yIiwiaWF0IjoxNzU4ODIyNjMzLCJleHAiOjE3NTk0Mjc0MzN9.cB1T0HfbimBWCKh-hp2tjpSejQrqylCxBSODTihwH_0', '2025-10-02 17:50:33', 0, '2025-09-25 17:50:33'),
('37b40b2c-a004-11f0-8b88-c8f7500bc329', '37b1c1b8-a004-11f0-8b88-c8f7500bc329', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM3YjFjMWI4LWEwMDQtMTFmMC04Yjg4LWM4Zjc1MDBiYzMyOSIsInJvbGUiOiJhZG1pbmlzdHJhZG9yIiwiaWF0IjoxNzU5NDU5OTI2LCJleHAiOjE3NjAwNjQ3MjZ9.-MNhlQxyoc6Ncgk5CzylEmt1sZUuw0E60Ziy1YPrrX0', '2025-10-10 02:52:06', 0, '2025-10-03 02:52:06'),
('48481019-9ec2-11f0-8b88-c8f7500bc329', 'e256d1b5-9be8-11f0-a21f-3417ebc2e080', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUyNTZkMWI1LTliZTgtMTFmMC1hMjFmLTM0MTdlYmMyZTA4MCIsInJvbGUiOiJhZG1pbmlzdHJhZG9yIiwiaWF0IjoxNzU5MzIxNjY3LCJleHAiOjE3NTk5MjY0Njd9.aBCKuPh0HuCdId4FbHBewOt1qA8CDakb6nRA4xT_s5c', '2025-10-03 02:01:13', 1, '2025-10-01 12:27:47'),
('51eb1753-97d4-11f0-a21b-025084b7a91d', '81c0fdea-97ab-11f0-a21b-025084b7a91d', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjgxYzBmZGVhLTk3YWItMTFmMC1hMjFiLTAyNTA4NGI3YTkxZCIsInJvbGUiOiJhZG1pbmlzdHJhZG9yIiwiaWF0IjoxNzU4NTU5ODYxLCJleHAiOjE3NTkxNjQ2NjF9.YyE8OjaOjsInFSH8De9RemHRVOYSka6zRJ3PSfx4Rfs', '2025-09-29 16:51:01', 0, '2025-09-22 16:51:01'),
('7ad19aed-a05a-11f0-8b88-c8f7500bc329', '37b1c1b8-a004-11f0-8b88-c8f7500bc329', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM3YjFjMWI4LWEwMDQtMTFmMC04Yjg4LWM4Zjc1MDBiYzMyOSIsInJvbGUiOiJhZG1pbmlzdHJhZG9yIiwiaWF0IjoxNzU5NDk2OTY3LCJleHAiOjE3NjAxMDE3Njd9.8VihWK-lOKRwTM__ASWqnl_ebAm2wR3WBSaSNzI88yw', '2025-10-10 13:09:27', 0, '2025-10-03 13:09:27'),
('7d00b776-9ec0-11f0-8b88-c8f7500bc329', 'e256d1b5-9be8-11f0-a21f-3417ebc2e080', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUyNTZkMWI1LTliZTgtMTFmMC1hMjFmLTM0MTdlYmMyZTA4MCIsInJvbGUiOiJhZG1pbmlzdHJhZG9yIiwiaWF0IjoxNzU5MzIwODk2LCJleHAiOjE3NTk5MjU2OTZ9.F3XZO7syYt44vNa-l0t0zz84l5lyw06F__JL8Q8u9tI', '2025-10-03 02:01:13', 1, '2025-10-01 12:14:56'),
('81c25bc9-97ab-11f0-a21b-025084b7a91d', '81c0fdea-97ab-11f0-a21b-025084b7a91d', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjgxYzBmZGVhLTk3YWItMTFmMC1hMjFiLTAyNTA4NGI3YTkxZCIsInJvbGUiOiJhZG1pbmlzdHJhZG9yIiwiaWF0IjoxNzU4NTQyMzMyLCJleHAiOjE3NTkxNDcxMzJ9.aY30ecwsQa73yKYpGAfb1XWBplNIDKfTTHYHKr2MibY', '2025-09-29 11:58:52', 0, '2025-09-22 11:58:52'),
('9120335a-97d6-11f0-a21b-025084b7a91d', '81c0fdea-97ab-11f0-a21b-025084b7a91d', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjgxYzBmZGVhLTk3YWItMTFmMC1hMjFiLTAyNTA4NGI3YTkxZCIsInJvbGUiOiJhZG1pbmlzdHJhZG9yIiwiaWF0IjoxNzU4NTYwODI2LCJleHAiOjE3NTkxNjU2MjZ9.eLLGrCX3xzwnceoPvgzeu2bC_NI9sqZkfggaWm9Dggg', '2025-09-29 17:07:06', 0, '2025-09-22 17:07:06'),
('929090f1-97d4-11f0-a21b-025084b7a91d', '928f6ad3-97d4-11f0-a21b-025084b7a91d', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjkyOGY2YWQzLTk3ZDQtMTFmMC1hMjFiLTAyNTA4NGI3YTkxZCIsInJvbGUiOiJyZXNpZGVudGUiLCJpYXQiOjE3NTg1NTk5NjksImV4cCI6MTc1OTE2NDc2OX0.8jUUHt2zmnH0MWOFIgkk7FKX6Yin995ctNUGZQlTp-0', '2025-09-29 16:52:49', 0, '2025-09-22 16:52:49'),
('999a15a9-9808-11f0-a21b-025084b7a91d', '81c0fdea-97ab-11f0-a21b-025084b7a91d', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjgxYzBmZGVhLTk3YWItMTFmMC1hMjFiLTAyNTA4NGI3YTkxZCIsInJvbGUiOiJhZG1pbmlzdHJhZG9yIiwiaWF0IjoxNzU4NTgyMzE1LCJleHAiOjE3NTkxODcxMTV9._eVL8k-GHJUzd9Plt7E-9Hsl5_fHjegLa9Slecg_lao', '2025-09-29 23:05:15', 0, '2025-09-22 23:05:15'),
('a2e81314-9a60-11f0-93e9-dc1ba1b74868', '81c0fdea-97ab-11f0-a21b-025084b7a91d', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjgxYzBmZGVhLTk3YWItMTFmMC1hMjFiLTAyNTA4NGI3YTkxZCIsInJvbGUiOiJhZG1pbmlzdHJhZG9yIiwiaWF0IjoxNzU4ODQwMDI4LCJleHAiOjE3NTk0NDQ4Mjh9.U3tZm0rxer5iDM8U7by3aK3whbnElzAtlTknQzVI2vI', '2025-10-02 22:40:28', 0, '2025-09-25 22:40:28'),
('d78f31d8-97af-11f0-a21b-025084b7a91d', '81c0fdea-97ab-11f0-a21b-025084b7a91d', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjgxYzBmZGVhLTk3YWItMTFmMC1hMjFiLTAyNTA4NGI3YTkxZCIsInJvbGUiOiJhZG1pbmlzdHJhZG9yIiwiaWF0IjoxNzU4NTQ0MTk0LCJleHAiOjE3NTkxNDg5OTR9.-5dn5QXFzUpPw8EwSszL4PnkOV9JuTdMW2eFQd8oRRE', '2025-09-29 12:29:54', 0, '2025-09-22 12:29:54'),
('ddae9e7f-9a44-11f0-93e9-dc1ba1b74868', '81c0fdea-97ab-11f0-a21b-025084b7a91d', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjgxYzBmZGVhLTk3YWItMTFmMC1hMjFiLTAyNTA4NGI3YTkxZCIsInJvbGUiOiJhZG1pbmlzdHJhZG9yIiwiaWF0IjoxNzU4ODI4MTAxLCJleHAiOjE3NTk0MzI5MDF9.WJkpNAzFW_DMMAvfLwCbc4rrG0OqHT8kbKVf_egaMMk', '2025-10-02 19:21:41', 0, '2025-09-25 19:21:41'),
('e2711799-9be8-11f0-a21f-3417ebc2e080', 'e256d1b5-9be8-11f0-a21f-3417ebc2e080', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUyNTZkMWI1LTliZTgtMTFmMC1hMjFmLTM0MTdlYmMyZTA4MCIsInJvbGUiOiJhZG1pbmlzdHJhZG9yIiwiaWF0IjoxNzU5MDA4NDk4LCJleHAiOjE3NTk2MTMyOTh9.tCuMtraPM6EW5SySl-YhxIxAOWUR0jjLZWxRTWZz-AQ', '2025-10-03 02:01:13', 1, '2025-09-27 21:28:18');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id` char(36) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id`, `nombre`, `descripcion`, `is_deleted`, `created_at`) VALUES
('b323ecb8-4ce3-4a71-8019-bdd9dd8e1911', 'Sensores', 'Categoría para Sensores', 0, '2025-09-30 14:04:47'),
('e5e9dd22-9bf5-11f0-a21f-3417ebc2e080', 'Semillas', 'Semillas de diferentes tipos de plantas', 0, '2025-09-27 23:01:27'),
('e5e9eb50-9bf5-11f0-a21f-3417ebc2e080', 'Herramientas', 'Herramientas para jardinería y agricultura', 0, '2025-09-27 23:01:27'),
('e5e9ebf6-9bf5-11f0-a21f-3417ebc2e080', 'Fertilizantes', 'Fertilizantes y abonos orgánicos', 0, '2025-09-27 23:01:27'),
('e5e9ec4f-9bf5-11f0-a21f-3417ebc2e080', 'Macetas', 'Macetas y contenedores para plantas', 0, '2025-09-27 23:01:27'),
('e5e9eca2-9bf5-11f0-a21f-3417ebc2e080', 'Riego', 'Sistemas de riego y accesorios', 0, '2025-09-27 23:01:27'),
('e5e9ecf5-9bf5-11f0-a21f-3417ebc2e080', 'Protección', 'Productos para protección de plantas', 0, '2025-09-27 23:01:27'),
('e5e9ed46-9bf5-11f0-a21f-3417ebc2e080', 'Decoración', 'Elementos decorativos para jardín', 0, '2025-09-27 23:01:27');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias_alertas`
--

CREATE TABLE `categorias_alertas` (
  `id` char(36) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `color` varchar(20) DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias_alertas`
--

INSERT INTO `categorias_alertas` (`id`, `nombre`, `descripcion`, `color`, `is_deleted`, `created_at`) VALUES
('f6261f20-918e-11f0-8bda-dc1ba1b74868', 'Riego', 'Alertas relacionadas con el riego de plantas', '#3B82F6', 0, '2025-09-14 17:19:24'),
('f6262f7b-918e-11f0-8bda-dc1ba1b74868', 'Cosecha', 'Recordatorios para la cosecha de cultivos', '#10B981', 0, '2025-09-14 17:19:24'),
('f6262fef-918e-11f0-8bda-dc1ba1b74868', 'Mantenimiento', 'Tareas de mantenimiento del huerto', '#F59E0B', 0, '2025-09-14 17:19:24'),
('f626301b-918e-11f0-8bda-dc1ba1b74868', 'Plagas', 'Alertas sobre plagas y enfermedades', '#EF4444', 0, '2025-09-14 17:19:24'),
('f626303e-918e-11f0-8bda-dc1ba1b74868', 'General', 'Alertas generales del sistema', '#6B7280', 0, '2025-09-14 17:19:24');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias_productos`
--

CREATE TABLE `categorias_productos` (
  `id` char(36) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias_productos`
--

INSERT INTO `categorias_productos` (`id`, `nombre`, `descripcion`, `is_deleted`, `created_at`) VALUES
('f624ed6c-918e-11f0-8bda-dc1ba1b74868', 'Semillas', 'Semillas de diferentes tipos de plantas y cultivos', 0, '2025-09-14 17:19:24'),
('f62502fb-918e-11f0-8bda-dc1ba1b74868', 'Fertilizantes', 'Productos para nutrir y mejorar el crecimiento de las plantas', 0, '2025-09-14 17:19:24'),
('f625037d-918e-11f0-8bda-dc1ba1b74868', 'Herramientas', 'Herramientas manuales y eléctricas para el cuidado del huerto', 0, '2025-09-14 17:19:24'),
('f62503a6-918e-11f0-8bda-dc1ba1b74868', 'Sustratos', 'Tierras, abonos orgánicos y mezclas para cultivo', 0, '2025-09-14 17:19:24'),
('f62503c6-918e-11f0-8bda-dc1ba1b74868', 'Macetas', 'Contenedores y macetas de diferentes tamaños y materiales', 0, '2025-09-14 17:19:24'),
('f62503e3-918e-11f0-8bda-dc1ba1b74868', 'Sistemas de Riego', 'Equipos y accesorios para el riego automático y manual', 0, '2025-09-14 17:19:24'),
('f62503fe-918e-11f0-8bda-dc1ba1b74868', 'Iluminación', 'Lámparas y sistemas de iluminación para cultivos indoor', 0, '2025-09-14 17:19:24'),
('f6250419-918e-11f0-8bda-dc1ba1b74868', 'Sensores', 'Dispositivos para monitorear humedad, temperatura y otros parámetros', 0, '2025-09-14 17:19:24'),
('f625043f-918e-11f0-8bda-dc1ba1b74868', 'Protección', 'Productos para proteger plantas de plagas y enfermedades', 0, '2025-09-14 17:19:24'),
('f625045a-918e-11f0-8bda-dc1ba1b74868', 'Otros', 'Otros productos y accesorios para el huerto', 0, '2025-09-14 17:19:24');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `codigos_invitacion`
--

CREATE TABLE `codigos_invitacion` (
  `id` char(36) NOT NULL,
  `codigo` varchar(6) NOT NULL,
  `administrador_id` char(36) NOT NULL,
  `ubicacion_id` char(36) NOT NULL,
  `esta_activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` datetime DEFAULT NULL,
  `fecha_expiracion` timestamp NULL DEFAULT NULL,
  `usado_por` char(36) DEFAULT NULL,
  `fecha_uso` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabla para gestionar códigos de invitación generados por administradores';

-- Triggers para manejo de updated_at en codigos_invitacion
DELIMITER $$
CREATE TRIGGER `ci_set_updated_at_insert`
BEFORE INSERT ON `codigos_invitacion`
FOR EACH ROW
BEGIN
  IF NEW.`fecha_creacion` IS NULL THEN
    SET NEW.`fecha_creacion` = CURRENT_TIMESTAMP;
  END IF;
  SET NEW.`updated_at` = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER `ci_set_updated_at_update`
BEFORE UPDATE ON `codigos_invitacion`
FOR EACH ROW
BEGIN
  SET NEW.`updated_at` = CURRENT_TIMESTAMP;
END$$
DELIMITER ;

--
-- Volcado de datos para la tabla `codigos_invitacion`
--

INSERT INTO `codigos_invitacion` (`id`, `codigo`, `administrador_id`, `ubicacion_id`, `esta_activo`, `fecha_creacion`, `fecha_expiracion`, `usado_por`, `fecha_uso`, `is_deleted`, `created_at`, `updated_at`) VALUES
('302b9a8d-a2f8-42b4-8d5c-b6ef2d9cb4d6', '2XI4JX', '81c0fdea-97ab-11f0-a21b-025084b7a91d', '81c0513e-97ab-11f0-a21b-025084b7a91d', 1, '2025-09-22 16:52:27', '2025-09-29 16:52:27', NULL, NULL, 0, '2025-09-22 16:52:27', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comentarios`
--

CREATE TABLE `comentarios` (
  `id` char(36) NOT NULL,
  `huerto_id` char(36) NOT NULL,
  `usuario_id` char(36) NOT NULL,
  `contenido` text NOT NULL,
  `tipo_comentario` enum('riego','siembra','cosecha','abono','plagas','general','mantenimiento') DEFAULT 'general',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `cambio_tierra` enum('si','por_encima') DEFAULT NULL COMMENT 'Indica si se cambió la tierra completamente (si) o se agregó por encima (por_encima)',
  `nombre_siembra` varchar(255) DEFAULT NULL COMMENT 'Nombre descriptivo de la siembra para facilitar identificación'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Triggers para manejo de fecha_actualizacion en comentarios
DELIMITER $$
CREATE TRIGGER `c_set_fecha_actualizacion_insert`
BEFORE INSERT ON `comentarios`
FOR EACH ROW
BEGIN
  SET NEW.`fecha_actualizacion` = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER `c_set_fecha_actualizacion_update`
BEFORE UPDATE ON `comentarios`
FOR EACH ROW
BEGIN
  SET NEW.`fecha_actualizacion` = CURRENT_TIMESTAMP;
END$$
DELIMITER ;

--
-- Volcado de datos para la tabla `comentarios`
--

INSERT INTO `comentarios` (`id`, `huerto_id`, `usuario_id`, `contenido`, `tipo_comentario`, `fecha_creacion`, `fecha_actualizacion`, `is_deleted`, `cambio_tierra`, `nombre_siembra`) VALUES
('01d49051-0d25-449b-9286-f05a54a35c7c', '31f8bc46-97af-11f0-a21b-025084b7a91d', '81c0fdea-97ab-11f0-a21b-025084b7a91d', 'agua', 'riego', '2025-09-22 20:35:11', NULL, 0, NULL, NULL),
('031c9837-bd53-4756-b871-02d04056121c', 'cd57235a-a068-11f0-8b88-c8f7500bc329', '37b1c1b8-a004-11f0-8b88-c8f7500bc329', 'efeefe', 'plagas', '2025-10-04 01:10:53', NULL, 0, NULL, NULL),
('05b7e05d-9d01-49b9-9ac0-dee8803c8964', '430be19c-9be9-11f0-a21f-3417ebc2e080', 'e256d1b5-9be8-11f0-a21f-3417ebc2e080', 'kmkmkmk', 'riego', '2025-10-01 12:20:56', NULL, 0, NULL, NULL),
('17e251b4-4ac1-4d96-8950-2cf200bd4b64', '430be19c-9be9-11f0-a21f-3417ebc2e080', 'e256d1b5-9be8-11f0-a21f-3417ebc2e080', 'hola como estan feliz y bendecido dia\n', 'general', '2025-09-27 21:43:04', NULL, 0, NULL, NULL),
('2245bbf9-af46-40d4-9156-32e840ea72d3', 'cd57235a-a068-11f0-8b88-c8f7500bc329', '37b1c1b8-a004-11f0-8b88-c8f7500bc329', 'lechuga', 'siembra', '2025-10-04 01:08:15', NULL, 0, NULL, 'lechuga'),
('26c5fdf3-fe9d-4ec3-95a4-204ede59c620', '430be19c-9be9-11f0-a21f-3417ebc2e080', 'e256d1b5-9be8-11f0-a21f-3417ebc2e080', 'njnjnjknj', 'siembra', '2025-10-01 12:20:30', NULL, 0, NULL, 'algas'),
('28bd1311-7ad7-4fe1-8ca1-d9df1dbff505', 'cd57235a-a068-11f0-8b88-c8f7500bc329', '37b1c1b8-a004-11f0-8b88-c8f7500bc329', 'asddsasf', 'riego', '2025-10-04 01:08:42', NULL, 0, NULL, NULL),
('2aa7aae1-e412-4be5-a210-6ce9c7e494ff', '31f8bc46-97af-11f0-a21b-025084b7a91d', '81c0fdea-97ab-11f0-a21b-025084b7a91d', 'comienzo', 'siembra', '2025-09-22 20:34:43', NULL, 0, NULL, 'Aji'),
('2ccec533-171b-4a1a-8138-69258ced0de8', '31f8bc46-97af-11f0-a21b-025084b7a91d', '81c0fdea-97ab-11f0-a21b-025084b7a91d', 'vamo', 'riego', '2025-09-25 22:43:32', NULL, 0, NULL, NULL),
('3f20af62-6fd7-4293-8579-2baf54ceb511', '430be19c-9be9-11f0-a21f-3417ebc2e080', 'e256d1b5-9be8-11f0-a21f-3417ebc2e080', 'njnjnjnjn', 'cosecha', '2025-10-01 12:21:42', NULL, 0, NULL, NULL),
('576f15cb-ce91-40e2-a689-de0cb7e6561c', '31f8bc46-97af-11f0-a21b-025084b7a91d', '81c0fdea-97ab-11f0-a21b-025084b7a91d', 'Limpieza', 'mantenimiento', '2025-09-22 20:36:11', NULL, 0, NULL, NULL),
('62b48d27-2e4b-4635-974d-d998c900460b', '31f8bc46-97af-11f0-a21b-025084b7a91d', '81c0fdea-97ab-11f0-a21b-025084b7a91d', 'mm', 'plagas', '2025-09-22 20:35:52', NULL, 0, NULL, NULL),
('64e03ac2-057c-403e-8c36-a9ad43728703', 'cd57235a-a068-11f0-8b88-c8f7500bc329', '37b1c1b8-a004-11f0-8b88-c8f7500bc329', 'njnjnjcd', 'abono', '2025-10-04 01:10:34', NULL, 0, 'si', NULL),
('662af0bb-2cea-4180-a9dd-0da37ccbcb3c', '31f8bc46-97af-11f0-a21b-025084b7a91d', '81c0fdea-97ab-11f0-a21b-025084b7a91d', 'vv', 'cosecha', '2025-09-22 20:35:26', NULL, 0, NULL, NULL),
('7410a344-f46d-4f83-af20-bc0de3867546', '31f8bc46-97af-11f0-a21b-025084b7a91d', '81c0fdea-97ab-11f0-a21b-025084b7a91d', 'roberto', 'abono', '2025-09-25 22:46:03', NULL, 0, 'si', NULL),
('9e51efba-0e73-4b7b-889a-fe8ad9f52c04', 'cd57235a-a068-11f0-8b88-c8f7500bc329', '37b1c1b8-a004-11f0-8b88-c8f7500bc329', 'mucho', 'cosecha', '2025-10-04 01:08:55', NULL, 0, NULL, NULL),
('ebd8783f-2736-4c13-8ff6-71ffb918c704', 'cd57235a-a068-11f0-8b88-c8f7500bc329', '37b1c1b8-a004-11f0-8b88-c8f7500bc329', 'aaaaaaaaaaa', 'mantenimiento', '2025-10-04 01:11:08', NULL, 0, NULL, NULL),
('f0e8bfff-3d9d-4139-af9d-7be2970e5967', '31f8bc46-97af-11f0-a21b-025084b7a91d', '81c0fdea-97ab-11f0-a21b-025084b7a91d', 'hola', 'siembra', '2025-09-25 22:42:44', NULL, 0, NULL, 'Johan');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comentarios_inventario`
--

CREATE TABLE `comentarios_inventario` (
  `id` char(36) NOT NULL,
  `inventario_id` char(36) NOT NULL,
  `usuario_id` char(36) NOT NULL,
  `contenido` text NOT NULL,
  `tipo_comentario` enum('uso','mantenimiento','reposicion','general') DEFAULT 'uso',
  `cantidad_usada` int(11) DEFAULT NULL,
  `unidad_medida` varchar(50) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Triggers para manejo de fecha_actualizacion en comentarios_inventario
DELIMITER $$
CREATE TRIGGER `ci_set_fecha_actualizacion_insert`
BEFORE INSERT ON `comentarios_inventario`
FOR EACH ROW
BEGIN
  SET NEW.`fecha_actualizacion` = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER `ci_set_fecha_actualizacion_update`
BEFORE UPDATE ON `comentarios_inventario`
FOR EACH ROW
BEGIN
  SET NEW.`fecha_actualizacion` = CURRENT_TIMESTAMP;
END$$
DELIMITER ;

--
-- Volcado de datos para la tabla `comentarios_inventario`
--

INSERT INTO `comentarios_inventario` (`id`, `inventario_id`, `usuario_id`, `contenido`, `tipo_comentario`, `cantidad_usada`, `unidad_medida`, `fecha_creacion`, `fecha_actualizacion`, `is_deleted`) VALUES
('17595c25-f7fb-4b59-a035-b98eaafd501c', 'e907fc3f-97c9-11f0-a21b-025084b7a91d', '81c0fdea-97ab-11f0-a21b-025084b7a91d', 'Comentario manual sobre Saco de Abono. Este es un comentario que escribí manualmente para gestionar sus permisos.', 'general', NULL, NULL, '2025-09-22 22:04:16', NULL, 0),
('3d6e5d90-aa0f-4097-8ad7-199e4cbc0a70', 'e907fc3f-97c9-11f0-a21b-025084b7a91d', '81c0fdea-97ab-11f0-a21b-025084b7a91d', '**Uso registrado:** Se utilizaron 3 unidades de Saco de Abono.\n\n**Notas:** Para riego de plantas.', 'uso', 3, 'unidades', '2025-09-22 15:51:19', '2025-09-22 15:56:13', 0),
('4cb846b6-97cc-11f0-a21b-025084b7a91d', 'e907fc3f-97c9-11f0-a21b-025084b7a91d', '81c0fdea-97ab-11f0-a21b-025084b7a91d', '**Uso registrado:** Se utilizaron 3 unidades de Saco de Abono en el huerto.\n\n**Notas:** Lo preste al vecino', 'uso', 3, 'unidades', '2025-09-22 15:53:36', '2025-09-22 15:56:13', 0),
('86ba0524-5060-4b94-a312-e29a681951e6', 'e907fc3f-97c9-11f0-a21b-025084b7a91d', '81c0fdea-97ab-11f0-a21b-025084b7a91d', '**Uso registrado:** Se utilizaron 2 unidades de Saco de Abono en el huerto.', 'uso', 2, 'unidades', '2025-09-22 15:51:19', NULL, 0),
('ae09810d-995b-4ab3-87ab-37e037da33a9', '45bf0545-97cf-11f0-a21b-025084b7a91d', '81c0fdea-97ab-11f0-a21b-025084b7a91d', 'Comentario manual sobre Bombillos. Este es un comentario que escribí manualmente para gestionar sus permisos.', 'general', NULL, NULL, '2025-09-22 22:04:16', NULL, 0),
('c3bc181d-c1be-472a-86db-250deb382784', 'e907fc3f-97c9-11f0-a21b-025084b7a91d', '81c0fdea-97ab-11f0-a21b-025084b7a91d', '**Uso registrado:** Se utilizaron 5 unidades de Saco de Abono en el huerto.', 'uso', 5, 'unidades', '2025-09-22 15:51:19', NULL, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comentario_inventario_permisos`
--

CREATE TABLE `comentario_inventario_permisos` (
  `id` char(36) NOT NULL,
  `comentario_id` char(36) NOT NULL,
  `usuario_id` char(36) NOT NULL,
  `permiso_tipo` enum('editar','eliminar') NOT NULL,
  `fecha_asignacion` datetime DEFAULT NULL,
  `asignado_por` char(36) NOT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Triggers para manejo de updated_at en comentario_inventario_permisos
DELIMITER $$
CREATE TRIGGER `cip_set_updated_at_insert`
BEFORE INSERT ON `comentario_inventario_permisos`
FOR EACH ROW
BEGIN
  IF NEW.`fecha_asignacion` IS NULL THEN
    SET NEW.`fecha_asignacion` = CURRENT_TIMESTAMP;
  END IF;
  SET NEW.`updated_at` = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER `cip_set_updated_at_update`
BEFORE UPDATE ON `comentario_inventario_permisos`
FOR EACH ROW
BEGIN
  SET NEW.`updated_at` = CURRENT_TIMESTAMP;
END$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comentario_permisos`
--

CREATE TABLE `comentario_permisos` (
  `id` char(36) NOT NULL,
  `comentario_id` char(36) NOT NULL,
  `usuario_id` char(36) NOT NULL,
  `permiso_tipo` enum('editar','eliminar') NOT NULL,
  `fecha_asignacion` datetime DEFAULT NULL,
  `asignado_por` char(36) NOT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Triggers para manejo de updated_at en comentario_permisos
DELIMITER $$
CREATE TRIGGER `cp_set_updated_at_insert`
BEFORE INSERT ON `comentario_permisos`
FOR EACH ROW
BEGIN
  IF NEW.`fecha_asignacion` IS NULL THEN
    SET NEW.`fecha_asignacion` = CURRENT_TIMESTAMP;
  END IF;
  SET NEW.`updated_at` = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER `cp_set_updated_at_update`
BEFORE UPDATE ON `comentario_permisos`
FOR EACH ROW
BEGIN
  SET NEW.`updated_at` = CURRENT_TIMESTAMP;
END$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuracion_alertas_usuario`
--

CREATE TABLE `configuracion_alertas_usuario` (
  `id` char(36) NOT NULL,
  `usuario_id` char(36) NOT NULL,
  `recibir_alertas_riego` tinyint(1) DEFAULT 1,
  `horario_notificaciones_inicio` time DEFAULT '07:00:00',
  `horario_notificaciones_fin` time DEFAULT '20:00:00',
  `notificar_fines_semana` tinyint(1) DEFAULT 1,
  `recordatorio_minutos_antes` int(11) DEFAULT 15,
  `max_recordatorios_dia` int(11) DEFAULT 3,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Triggers para manejo de updated_at en configuracion_alertas_usuario
DELIMITER $$
CREATE TRIGGER `cau_set_updated_at_insert`
BEFORE INSERT ON `configuracion_alertas_usuario`
FOR EACH ROW
BEGIN
  SET NEW.`updated_at` = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER `cau_set_updated_at_update`
BEFORE UPDATE ON `configuracion_alertas_usuario`
FOR EACH ROW
BEGIN
  SET NEW.`updated_at` = CURRENT_TIMESTAMP;
END$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `huertos`
--

CREATE TABLE `huertos` (
  `id` char(36) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `tipo` enum('privado','publico') NOT NULL DEFAULT 'privado',
  `superficie` decimal(10,2) DEFAULT NULL COMMENT 'Tamaño en metros cuadrados',
  `capacidad` int(11) DEFAULT NULL COMMENT 'Número máximo de plantas permitidos',
  `ubicacion_id` char(36) NOT NULL,
  `usuario_creador` char(36) NOT NULL COMMENT 'Usuario que creó el huerto',
  `imagen_url` varchar(255) DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `huertos`
--

INSERT INTO `huertos` (`id`, `nombre`, `descripcion`, `tipo`, `superficie`, `capacidad`, `ubicacion_id`, `usuario_creador`, `imagen_url`, `is_deleted`, `created_at`) VALUES
('31f8bc46-97af-11f0-a21b-025084b7a91d', 'Pablito', 'Pablo', 'privado', 79.00, 10, '81c0513e-97ab-11f0-a21b-025084b7a91d', '81c0fdea-97ab-11f0-a21b-025084b7a91d', 'https://th.bing.com/th/id/R.1802147bf50f190d4d8d370fd3235b94?rik=YSZ7uFsZ22DLjA&riu=http%3a%2f%2fddragon.leagueoflegends.com%2fcdn%2fimg%2fchampion%2fsplash%2fThresh_5.jpg&ehk=eo6MaPS6AxvatHep5LJ0zKeSMOWDGUEAA%2fkGPzou3oY%3d&risl=&pid=ImgRaw&r=0', 0, '2025-09-22 12:25:16'),
('430be19c-9be9-11f0-a21f-3417ebc2e080', 'aguate', 'holaaa\n', 'privado', 23.00, 10, 'e252e937-9be8-11f0-a21f-3417ebc2e080', 'e256d1b5-9be8-11f0-a21f-3417ebc2e080', 'https://images.ctfassets.net/denf86kkcx7r/4IPlg4Qazd4sFRuCUHIJ1T/f6c71da7eec727babcd554d843a528b8/gatocomuneuropeo-97?fm=webp&w=612', 0, '2025-09-27 21:31:00'),
('4d3f6e90-97ac-11f0-a21b-025084b7a91d', 'Zanahorias', 'Creciendo poco a poco', 'publico', 4.00, 57, '81c0513e-97ab-11f0-a21b-025084b7a91d', '81c0fdea-97ab-11f0-a21b-025084b7a91d', NULL, 0, '2025-09-22 12:04:33'),
('71770ff7-9d56-11f0-8b6d-dc1ba1b74868', 'Tresh', 'Levántense hijos de la esperanza.', 'privado', 4.50, 10, '81c0513e-97ab-11f0-a21b-025084b7a91d', '06983d83-9d4a-11f0-8b6d-dc1ba1b74868', 'https://th.bing.com/th/id/R.2e38fc4e146d8487c6feca540fc706f4?rik=5%2bjUNrzhpwKCrw&riu=http%3a%2f%2fddragon.leagueoflegends.com%2fcdn%2fimg%2fchampion%2fsplash%2fThresh_6.jpg&ehk=lw%2b1uT%2fYdlQ8S2zHdbi%2fG7jbIlYlk23qMjZCcvIt3OQ%3d&risl=&pid=ImgRaw&r=0', 0, '2025-09-29 17:05:04'),
('7b173ec0-97ac-11f0-a21b-025084b7a91d', 'vbvvf', 'fffff', 'publico', 453.00, 10, '81c0513e-97ab-11f0-a21b-025084b7a91d', '81c0fdea-97ab-11f0-a21b-025084b7a91d', NULL, 0, '2025-09-22 12:05:50'),
('7c60f57a-97ad-11f0-a21b-025084b7a91d', 'Tomates', 'cosas al alazar', 'publico', 33.00, 10, '81c0513e-97ab-11f0-a21b-025084b7a91d', '81c0fdea-97ab-11f0-a21b-025084b7a91d', NULL, 0, '2025-09-22 12:13:02'),
('cd57235a-a068-11f0-8b88-c8f7500bc329', 'mi huerto', 'asdfasdfasf', 'publico', 23.00, 10, '37b0536a-a004-11f0-8b88-c8f7500bc329', '37b1c1b8-a004-11f0-8b88-c8f7500bc329', 'https://static.vecteezy.com/system/resources/thumbnails/017/047/854/small_2x/cute-cat-illustration-cat-kawaii-chibi-drawing-style-cat-cartoon-vector.jpg', 0, '2025-10-03 14:51:58'),
('e30dd62b-97d4-11f0-a21b-025084b7a91d', 'Ajis', 'Cuanto dura', 'privado', 28.00, 10, '81c0513e-97ab-11f0-a21b-025084b7a91d', '928f6ad3-97d4-11f0-a21b-025084b7a91d', NULL, 0, '2025-09-22 16:55:04');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `huerto_data`
--

CREATE TABLE `huerto_data` (
  `id` char(36) NOT NULL,
  `comentario_id` varchar(36) DEFAULT NULL,
  `huerto_id` char(36) NOT NULL,
  `fecha` date DEFAULT NULL,
  `cantidad_agua` decimal(10,2) DEFAULT NULL COMMENT 'Litros de agua utilizados',
  `unidad_agua` enum('ml','l') DEFAULT 'ml',
  `cantidad_siembra` int(11) DEFAULT NULL COMMENT 'Cantidad de plantas sembradas',
  `cantidad_cosecha` int(11) DEFAULT NULL COMMENT 'Cantidad cosechada',
  `fecha_inicio` date DEFAULT NULL,
  `fecha_final` date DEFAULT NULL,
  `total_dias` int(11) DEFAULT NULL,
  `cantidad_abono` decimal(10,2) DEFAULT NULL COMMENT 'Kg de abono utilizado',
  `cantidad_plagas` decimal(10,2) DEFAULT NULL COMMENT 'Tratamiento aplicado',
  `usuario_registro` char(36) NOT NULL COMMENT 'Usuario que registró los datos',
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `plaga_especie` varchar(100) DEFAULT NULL COMMENT 'Especie de plaga detectada',
  `plaga_nivel` enum('pocos','medio','muchos') DEFAULT NULL COMMENT 'Nivel de incidencia de la plaga',
  `siembra_relacionada` varchar(36) DEFAULT NULL,
  `huerto_siembra_id` char(36) DEFAULT NULL COMMENT 'ID de la siembra relacionada para todos los tipos de comentarios excepto siembra y cosecha',
  `cantidad_mantenimiento` decimal(10,2) DEFAULT NULL COMMENT 'Cantidad de tiempo de mantenimiento',
  `unidad_mantenimiento` enum('minutos','horas') DEFAULT 'minutos' COMMENT 'Unidad de tiempo para mantenimiento',
  `unidad_abono` enum('kg','g') DEFAULT 'kg' COMMENT 'Unidad de medida para abono'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `huerto_data`
--

INSERT INTO `huerto_data` (`id`, `comentario_id`, `huerto_id`, `fecha`, `cantidad_agua`, `unidad_agua`, `cantidad_siembra`, `cantidad_cosecha`, `fecha_inicio`, `fecha_final`, `total_dias`, `cantidad_abono`, `cantidad_plagas`, `usuario_registro`, `is_deleted`, `created_at`, `plaga_especie`, `plaga_nivel`, `siembra_relacionada`, `huerto_siembra_id`, `cantidad_mantenimiento`, `unidad_mantenimiento`, `unidad_abono`) VALUES
('03fa4e1a-ed34-47f0-b4e5-975d57acbb84', '26c5fdf3-fe9d-4ec3-95a4-204ede59c620', '430be19c-9be9-11f0-a21f-3417ebc2e080', '2025-10-01', 0.00, 'ml', 9, 0, NULL, NULL, NULL, 0.00, 0.00, 'e256d1b5-9be8-11f0-a21f-3417ebc2e080', 0, '2025-10-01 12:20:30', NULL, 'pocos', NULL, NULL, 0.00, 'minutos', 'kg'),
('0e7b5e0c-5305-4fdb-a640-0262168f2482', '2245bbf9-af46-40d4-9156-32e840ea72d3', 'cd57235a-a068-11f0-8b88-c8f7500bc329', '2025-10-04', 0.00, 'ml', 21, 0, NULL, NULL, NULL, 0.00, 0.00, '37b1c1b8-a004-11f0-8b88-c8f7500bc329', 0, '2025-10-04 01:08:15', NULL, 'pocos', NULL, NULL, 0.00, 'minutos', 'kg'),
('127d61a7-9552-4a22-ac0b-2c3bb3ab485c', '3f20af62-6fd7-4293-8579-2baf54ceb511', '430be19c-9be9-11f0-a21f-3417ebc2e080', '2025-10-01', 0.00, 'ml', 0, 87, NULL, NULL, NULL, 0.00, 0.00, 'e256d1b5-9be8-11f0-a21f-3417ebc2e080', 0, '2025-10-01 12:21:42', NULL, 'pocos', '26c5fdf3-fe9d-4ec3-95a4-204ede59c620', NULL, 0.00, 'minutos', 'kg'),
('2710854b-f8c0-4e2f-8432-5172fd257c5f', '2ccec533-171b-4a1a-8138-69258ced0de8', '31f8bc46-97af-11f0-a21b-025084b7a91d', '2025-09-25', 3.00, 'l', 0, 0, NULL, NULL, NULL, 0.00, 0.00, '81c0fdea-97ab-11f0-a21b-025084b7a91d', 0, '2025-09-25 22:43:32', NULL, 'pocos', NULL, 'f0e8bfff-3d9d-4139-af9d-7be2970e5967', 0.00, 'minutos', 'kg'),
('399e01e5-827b-471d-a36b-4084267537f8', '7410a344-f46d-4f83-af20-bc0de3867546', '31f8bc46-97af-11f0-a21b-025084b7a91d', '2025-09-25', 0.00, 'ml', 0, 0, NULL, NULL, NULL, 0.00, 0.00, '81c0fdea-97ab-11f0-a21b-025084b7a91d', 0, '2025-09-25 22:46:03', NULL, 'pocos', NULL, 'f0e8bfff-3d9d-4139-af9d-7be2970e5967', 0.00, 'minutos', 'kg'),
('3ec2d286-66cd-4b34-89a4-206c6c26221a', '576f15cb-ce91-40e2-a689-de0cb7e6561c', '31f8bc46-97af-11f0-a21b-025084b7a91d', '2025-09-22', 0.00, 'ml', 0, 0, NULL, NULL, NULL, 0.00, 0.00, '81c0fdea-97ab-11f0-a21b-025084b7a91d', 0, '2025-09-22 20:36:11', NULL, 'pocos', NULL, '2aa7aae1-e412-4be5-a210-6ce9c7e494ff', 5.00, 'minutos', 'kg'),
('49e56719-9834-4a14-a08a-d53e4a698374', '662af0bb-2cea-4180-a9dd-0da37ccbcb3c', '31f8bc46-97af-11f0-a21b-025084b7a91d', '2025-09-22', 0.00, 'ml', 0, 55, NULL, NULL, NULL, 0.00, 0.00, '81c0fdea-97ab-11f0-a21b-025084b7a91d', 0, '2025-09-22 20:35:26', NULL, 'pocos', '2aa7aae1-e412-4be5-a210-6ce9c7e494ff', NULL, 0.00, 'minutos', 'kg'),
('549deda2-1c1f-4890-91bf-e6585648c7fb', '01d49051-0d25-449b-9286-f05a54a35c7c', '31f8bc46-97af-11f0-a21b-025084b7a91d', '2025-09-22', 650.00, 'ml', 0, 0, NULL, NULL, NULL, 0.00, 0.00, '81c0fdea-97ab-11f0-a21b-025084b7a91d', 0, '2025-09-22 20:35:11', NULL, 'pocos', NULL, '2aa7aae1-e412-4be5-a210-6ce9c7e494ff', 0.00, 'minutos', 'kg'),
('964c8a3e-78e5-4ade-b64a-829b8c8a72bc', '2aa7aae1-e412-4be5-a210-6ce9c7e494ff', '31f8bc46-97af-11f0-a21b-025084b7a91d', '2025-09-22', 0.00, 'ml', 13, 0, NULL, NULL, NULL, 0.00, 0.00, '81c0fdea-97ab-11f0-a21b-025084b7a91d', 0, '2025-09-22 20:34:43', NULL, 'pocos', NULL, NULL, 0.00, 'minutos', 'kg'),
('9de1dbee-be21-41e7-a531-6e7cc1d1c59c', 'f0e8bfff-3d9d-4139-af9d-7be2970e5967', '31f8bc46-97af-11f0-a21b-025084b7a91d', '2025-09-25', 0.00, 'ml', 4, 0, NULL, NULL, NULL, 0.00, 0.00, '81c0fdea-97ab-11f0-a21b-025084b7a91d', 0, '2025-09-25 22:42:44', NULL, 'pocos', NULL, NULL, 0.00, 'minutos', 'kg'),
('c5eec606-5cca-4e12-b4d4-8e12df122792', '031c9837-bd53-4756-b871-02d04056121c', 'cd57235a-a068-11f0-8b88-c8f7500bc329', '2025-10-04', 0.00, 'ml', 0, 0, NULL, NULL, NULL, 0.00, 1.00, '37b1c1b8-a004-11f0-8b88-c8f7500bc329', 0, '2025-10-04 01:10:53', 'fefefe', 'pocos', NULL, '2245bbf9-af46-40d4-9156-32e840ea72d3', 0.00, 'minutos', 'kg'),
('dd7bc2c7-822e-4053-abdb-2825d48244f1', '9e51efba-0e73-4b7b-889a-fe8ad9f52c04', 'cd57235a-a068-11f0-8b88-c8f7500bc329', '2025-10-04', 0.00, 'ml', 0, 23, NULL, NULL, NULL, 0.00, 0.00, '37b1c1b8-a004-11f0-8b88-c8f7500bc329', 0, '2025-10-04 01:08:55', NULL, 'pocos', '2245bbf9-af46-40d4-9156-32e840ea72d3', NULL, 0.00, 'minutos', 'kg'),
('e214d86a-641b-4233-9f5d-3493f5bb73de', '62b48d27-2e4b-4635-974d-d998c900460b', '31f8bc46-97af-11f0-a21b-025084b7a91d', '2025-09-22', 0.00, 'ml', 0, 0, NULL, NULL, NULL, 0.00, 3.00, '81c0fdea-97ab-11f0-a21b-025084b7a91d', 0, '2025-09-22 20:35:52', 'gusano', 'muchos', NULL, '2aa7aae1-e412-4be5-a210-6ce9c7e494ff', 0.00, 'minutos', 'kg'),
('e672a5b8-33a1-4e2b-8a65-2c54d04b4501', '05b7e05d-9d01-49b9-9ac0-dee8803c8964', '430be19c-9be9-11f0-a21f-3417ebc2e080', '2025-10-01', 90.00, 'l', 0, 0, NULL, NULL, NULL, 0.00, 0.00, 'e256d1b5-9be8-11f0-a21f-3417ebc2e080', 0, '2025-10-01 12:20:56', NULL, 'pocos', NULL, '26c5fdf3-fe9d-4ec3-95a4-204ede59c620', 0.00, 'minutos', 'kg'),
('f42b65d9-067e-4f34-9a34-7a9f3cbe3199', '64e03ac2-057c-403e-8c36-a9ad43728703', 'cd57235a-a068-11f0-8b88-c8f7500bc329', '2025-10-04', 0.00, 'ml', 0, 0, NULL, NULL, NULL, 12.00, 0.00, '37b1c1b8-a004-11f0-8b88-c8f7500bc329', 0, '2025-10-04 01:10:34', NULL, 'pocos', NULL, '2245bbf9-af46-40d4-9156-32e840ea72d3', 0.00, 'minutos', 'kg'),
('f69b492b-1405-463d-9906-2d76fd5cc613', 'ebd8783f-2736-4c13-8ff6-71ffb918c704', 'cd57235a-a068-11f0-8b88-c8f7500bc329', '2025-10-04', 0.00, 'ml', 0, 0, NULL, NULL, NULL, 0.00, 0.00, '37b1c1b8-a004-11f0-8b88-c8f7500bc329', 0, '2025-10-04 01:11:08', NULL, 'pocos', NULL, '2245bbf9-af46-40d4-9156-32e840ea72d3', 10.00, 'minutos', 'kg'),
('fad7de4c-376a-4ca2-a264-5ae217a1d1a9', '28bd1311-7ad7-4fe1-8ca1-d9df1dbff505', 'cd57235a-a068-11f0-8b88-c8f7500bc329', '2025-10-04', 12.00, 'l', 0, 0, NULL, NULL, NULL, 0.00, 0.00, '37b1c1b8-a004-11f0-8b88-c8f7500bc329', 0, '2025-10-04 01:08:42', NULL, 'pocos', NULL, '2245bbf9-af46-40d4-9156-32e840ea72d3', 0.00, 'minutos', 'kg');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario`
--

CREATE TABLE `inventario` (
  `id` char(36) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `categoria_id` char(36) NOT NULL,
  `cantidad_stock` int(11) DEFAULT 0,
  `cantidad_minima` int(11) DEFAULT 5,
  `precio_estimado` decimal(10,2) DEFAULT NULL,
  `ubicacion_almacen` varchar(150) DEFAULT NULL,
  `huerto_id` char(36) DEFAULT NULL,
  `proveedor_id` char(36) DEFAULT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `usuario_creador` char(36) NOT NULL COMMENT 'Usuario que creó el item de inventario'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `inventario`
--

INSERT INTO `inventario` (`id`, `nombre`, `descripcion`, `categoria_id`, `cantidad_stock`, `cantidad_minima`, `precio_estimado`, `ubicacion_almacen`, `huerto_id`, `proveedor_id`, `imagen_url`, `is_deleted`, `created_at`, `usuario_creador`) VALUES
('05663485-9d5f-11f0-8b6d-dc1ba1b74868', 'Semillas de Tomate', 'Semillas para cultivar tomates', 'f624ed6c-918e-11f0-8bda-dc1ba1b74868', 50, 10, 5.50, 'Estante A-1', '31f8bc46-97af-11f0-a21b-025084b7a91d', NULL, NULL, 0, '2025-09-29 18:06:28', '81c0fdea-97ab-11f0-a21b-025084b7a91d'),
('1d1bcc01-c9ca-4d9c-be13-20228d962eb2', 'Skins de Leona', '', 'f625045a-918e-11f0-8bda-dc1ba1b74868', 5, 5, 7.00, '', NULL, NULL, 'https://www.onlinegambling.ca/images/marketing/female-video-game-characters-redesigned/characters/leona-league-of-legends-before.jpg', 0, '2025-09-30 15:50:11', '81c0fdea-97ab-11f0-a21b-025084b7a91d'),
('2995b808-980a-11f0-a21b-025084b7a91d', 'Macetas', '', 'f62503c6-918e-11f0-8bda-dc1ba1b74868', 23, 5, 5.00, 'Bodega', '31f8bc46-97af-11f0-a21b-025084b7a91d', NULL, NULL, 0, '2025-09-22 23:16:26', '81c0fdea-97ab-11f0-a21b-025084b7a91d'),
('2a1646d4-1c03-4448-9d28-900c5bf031df', 'Skins de Leona', 'Skines', 'f625045a-918e-11f0-8bda-dc1ba1b74868', 5, 5, 7.00, '', NULL, NULL, 'https://www.onlinegambling.ca/images/marketing/female-video-game-characters-redesigned/characters/leona-league-of-legends-before.jpg', 0, '2025-09-30 15:45:16', '81c0fdea-97ab-11f0-a21b-025084b7a91d'),
('45bf0545-97cf-11f0-a21b-025084b7a91d', 'Bombillos', 'Luces para mantener temperatura', 'f62503fe-918e-11f0-8bda-dc1ba1b74868', 35, 10, 35.00, 'Bodega', '31f8bc46-97af-11f0-a21b-025084b7a91d', NULL, 'https://th.bing.com/th/id/OIP.QIUTO_pRWQAzrli4L_QEEAHaHU?w=184&h=180&c=7&r=0&o=5&dpr=2.5&pid=1.7', 0, '2025-09-22 16:14:53', '81c0fdea-97ab-11f0-a21b-025084b7a91d'),
('5a192ca1-97cf-11f0-a21b-025084b7a91d', 'Bombillos', '', 'f62503fe-918e-11f0-8bda-dc1ba1b74868', 35, 5, 35.00, 'Bodega', '31f8bc46-97af-11f0-a21b-025084b7a91d', NULL, 'https://th.bing.com/th/id/OIP.QIUTO_pRWQAzrli4L_QEEAHaHU?w=184&h=180&c=7&r=0&o=5&dpr=2.5&pid=1.7', 1, '2025-09-22 16:15:27', '81c0fdea-97ab-11f0-a21b-025084b7a91d'),
('641f8385-9800-11f0-a21b-025084b7a91d', 'Saco de Abono', 'Vamosss', 'f62503a6-918e-11f0-8bda-dc1ba1b74868', 60, 5, 15.00, 'Bodega', '31f8bc46-97af-11f0-a21b-025084b7a91d', NULL, 'https://www.stock.com.py/images/thumbs/0206313.jpeg', 1, '2025-09-22 22:06:29', '81c0fdea-97ab-11f0-a21b-025084b7a91d'),
('6d230b4f-6cd0-442b-84e9-4acca5504852', 'Skins de pyke', '', 'f625045a-918e-11f0-8bda-dc1ba1b74868', 5, 5, 7.00, '', NULL, NULL, 'https://tse3.mm.bing.net/th/id/OIP.I_GBzUTo5EQYzOfuzKcqfAHaEK?rs=1&pid=ImgDetMain&o=7&rm=3', 0, '2025-09-30 15:51:48', '81c0fdea-97ab-11f0-a21b-025084b7a91d'),
('76b799ab-84d8-4a6c-8705-247f574af90b', 'Skins de Nautilus', '', 'f625045a-918e-11f0-8bda-dc1ba1b74868', 5, 5, 7.00, '', NULL, NULL, 'https://static.lolwallpapers.net/2015/01/Nautilus-Classic.jpg', 0, '2025-09-30 15:50:43', '81c0fdea-97ab-11f0-a21b-025084b7a91d'),
('77427ce3-9805-11f0-a21b-025084b7a91d', 'Saco de Abono', '', 'f62503a6-918e-11f0-8bda-dc1ba1b74868', 60, 5, 15.00, 'Bodega', '31f8bc46-97af-11f0-a21b-025084b7a91d', NULL, 'https://www.stock.com.py/images/thumbs/0206313.jpeg', 0, '2025-09-22 22:42:49', '81c0fdea-97ab-11f0-a21b-025084b7a91d'),
('8c733257-7ac7-45c7-b37b-19939aedd849', 'Skins de Nautilus', 'Skines', 'f625045a-918e-11f0-8bda-dc1ba1b74868', 5, 1, 7.00, '', NULL, NULL, 'https://static.lolwallpapers.net/2015/01/Nautilus-Classic.jpg', 0, '2025-09-30 15:44:20', '81c0fdea-97ab-11f0-a21b-025084b7a91d'),
('c288b04d-9d61-11f0-8b6d-dc1ba1b74868', 'Skins de Tresh', 'Ropaaaa', 'f625043f-918e-11f0-8bda-dc1ba1b74868', 7, 5, 8.00, 'Wild rift', '71770ff7-9d56-11f0-8b6d-dc1ba1b74868', NULL, 'https://i.redd.it/7nn653imxl971.png', 0, '2025-09-29 18:26:04', '06983d83-9d4a-11f0-8b6d-dc1ba1b74868'),
('e649f01d-9e13-11f0-8b6d-dc1ba1b74868', 'Skins de Nautilus', 'skines', 'f625045a-918e-11f0-8bda-dc1ba1b74868', 5, 1, 7.00, '', NULL, NULL, 'https://static.lolwallpapers.net/2015/01/Nautilus-Classic.jpg', 0, '2025-09-30 15:41:06', '81c0fdea-97ab-11f0-a21b-025084b7a91d'),
('e907fc3f-97c9-11f0-a21b-025084b7a91d', 'Saco de Abono', 'Saco que me quedo del ultimo mantenimiento.', 'f62502fb-918e-11f0-8bda-dc1ba1b74868', 5, 5, 25.00, 'Bodega', '31f8bc46-97af-11f0-a21b-025084b7a91d', NULL, 'https://www.stock.com.py/images/thumbs/0206313.jpeg', 0, '2025-09-22 15:36:30', '81c0fdea-97ab-11f0-a21b-025084b7a91d');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario_permisos`
--

CREATE TABLE `inventario_permisos` (
  `id` char(36) NOT NULL,
  `inventario_id` char(36) NOT NULL,
  `usuario_id` char(36) NOT NULL,
  `permiso_tipo` enum('completo') NOT NULL,
  `fecha_asignacion` datetime DEFAULT NULL,
  `asignado_por` char(36) NOT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Triggers para manejo de updated_at en inventario_permisos
DELIMITER $$
CREATE TRIGGER `ip_set_updated_at_insert`
BEFORE INSERT ON `inventario_permisos`
FOR EACH ROW
BEGIN
  IF NEW.`fecha_asignacion` IS NULL THEN
    SET NEW.`fecha_asignacion` = CURRENT_TIMESTAMP;
  END IF;
  SET NEW.`updated_at` = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER `ip_set_updated_at_update`
BEFORE UPDATE ON `inventario_permisos`
FOR EACH ROW
BEGIN
  SET NEW.`updated_at` = CURRENT_TIMESTAMP;
END$$
DELIMITER ;

--
-- Volcado de datos para la tabla `inventario_permisos`
--

INSERT INTO `inventario_permisos` (`id`, `inventario_id`, `usuario_id`, `permiso_tipo`, `fecha_asignacion`, `asignado_por`, `is_deleted`, `created_at`, `updated_at`) VALUES
('482a9af6-c803-406a-b700-943d418a5c1b', 'e907fc3f-97c9-11f0-a21b-025084b7a91d', '928f6ad3-97d4-11f0-a21b-025084b7a91d', 'completo', '2025-09-29 18:47:07', '81c0fdea-97ab-11f0-a21b-025084b7a91d', 0, '2025-09-29 18:47:07', '2025-09-29 18:47:07'),
('a18c3aed-2f9e-45a9-ac90-5057616829ba', 'c288b04d-9d61-11f0-8b6d-dc1ba1b74868', '928f6ad3-97d4-11f0-a21b-025084b7a91d', 'completo', '2025-09-29 18:57:15', '06983d83-9d4a-11f0-8b6d-dc1ba1b74868', 0, '2025-09-29 18:57:15', '2025-09-30 13:39:03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id` char(36) NOT NULL,
  `usuario_id` char(36) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `mensaje` text NOT NULL,
  `tipo` enum('comentario','alerta','sistema','recordatorio','riego','plaga','tarea') NOT NULL DEFAULT 'sistema',
  `huerto_id` char(36) DEFAULT NULL,
  `huerto_nombre` varchar(100) DEFAULT NULL,
  `datos_adicionales` longtext,
  `leida` tinyint(1) DEFAULT 0,
  `fecha_leida` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Triggers para manejo de updated_at en notificaciones
DELIMITER $$
CREATE TRIGGER `n_set_updated_at_insert`
BEFORE INSERT ON `notificaciones`
FOR EACH ROW
BEGIN
  SET NEW.`updated_at` = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER `n_set_updated_at_update`
BEFORE UPDATE ON `notificaciones`
FOR EACH ROW
BEGIN
  SET NEW.`updated_at` = CURRENT_TIMESTAMP;
END$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones_alertas`
--

CREATE TABLE `notificaciones_alertas` (
  `id` char(36) NOT NULL,
  `usuario_id` char(36) NOT NULL,
  `alerta_id` char(36) NOT NULL,
  `mensaje` text NOT NULL,
  `tipo` enum('creacion','recordatorio','completada','cancelada') NOT NULL,
  `leida` tinyint(1) DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_lectura` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `notificaciones_alertas`
--

INSERT INTO `notificaciones_alertas` (`id`, `usuario_id`, `alerta_id`, `mensaje`, `tipo`, `leida`, `fecha_creacion`, `fecha_lectura`) VALUES
('01ee69e5-9a5e-11f0-93e9-dc1ba1b74868', '81c0fdea-97ab-11f0-a21b-025084b7a91d', 'cd65e9a1-9a5d-11f0-93e9-dc1ba1b74868', 'Alerta de riego: vbvvf - WAOOOOOOO', 'recordatorio', 1, '2025-09-25 22:21:39', '2025-09-25 22:22:46'),
('2725efe3-9a5a-11f0-93e9-dc1ba1b74868', '81c0fdea-97ab-11f0-a21b-025084b7a91d', '0', 'Nueva alerta de riego programada para tu huerto: Pablito - AGUAAAAAAA', 'creacion', 1, '2025-09-25 21:54:04', '2025-09-25 21:56:41'),
('27274469-9a5a-11f0-93e9-dc1ba1b74868', '81c0fdea-97ab-11f0-a21b-025084b7a91d', '0', 'Nueva alerta de riego creada para el huerto: Pablito', 'creacion', 1, '2025-09-25 21:54:04', '2025-09-25 21:56:41'),
('529efe00-9a5a-11f0-93e9-dc1ba1b74868', '81c0fdea-97ab-11f0-a21b-025084b7a91d', '0', 'Nueva alerta de riego programada para tu huerto: Pablito - AAGUITAAAA', 'creacion', 1, '2025-09-25 21:55:17', '2025-09-25 21:56:40'),
('529f7bbf-9a5a-11f0-93e9-dc1ba1b74868', '81c0fdea-97ab-11f0-a21b-025084b7a91d', '0', 'Nueva alerta de riego creada para el huerto: Pablito', 'creacion', 1, '2025-09-25 21:55:17', '2025-09-25 21:56:41'),
('669474c8-9a62-11f0-93e9-dc1ba1b74868', '81c0fdea-97ab-11f0-a21b-025084b7a91d', '0', 'Nueva alerta de riego programada para tu huerto: Zanahorias - hola', 'creacion', 1, '2025-09-25 22:53:06', '2025-09-29 15:01:47'),
('66954d0c-9a62-11f0-93e9-dc1ba1b74868', '81c0fdea-97ab-11f0-a21b-025084b7a91d', '0', 'Nueva alerta de riego creada para el huerto: Zanahorias', 'creacion', 1, '2025-09-25 22:53:06', '2025-09-29 15:01:47'),
('93af7dae-9a62-11f0-93e9-dc1ba1b74868', '81c0fdea-97ab-11f0-a21b-025084b7a91d', '6693ce2f-9a62-11f0-93e9-dc1ba1b74868', 'Alerta de riego: Zanahorias - hola', 'recordatorio', 1, '2025-09-25 22:54:22', '2025-09-29 15:01:47'),
('971dba72-9a5d-11f0-93e9-dc1ba1b74868', '81c0fdea-97ab-11f0-a21b-025084b7a91d', '0', 'Nueva alerta de riego programada para tu huerto: Zanahorias - miarma', 'creacion', 1, '2025-09-25 22:18:40', '2025-09-25 22:18:59'),
('971f39fc-9a5d-11f0-93e9-dc1ba1b74868', '81c0fdea-97ab-11f0-a21b-025084b7a91d', '0', 'Nueva alerta de riego creada para el huerto: Zanahorias', 'creacion', 1, '2025-09-25 22:18:40', '2025-09-25 22:18:59'),
('9c412113-9a5a-11f0-93e9-dc1ba1b74868', '81c0fdea-97ab-11f0-a21b-025084b7a91d', '0', 'Nueva alerta de riego programada para tu huerto: Pablito - Buenos dias mi gente', 'creacion', 1, '2025-09-25 21:57:20', '2025-09-25 21:58:09'),
('9c425b3a-9a5a-11f0-93e9-dc1ba1b74868', '81c0fdea-97ab-11f0-a21b-025084b7a91d', '0', 'Nueva alerta de riego creada para el huerto: Pablito', 'creacion', 1, '2025-09-25 21:57:20', '2025-09-25 21:58:10'),
('b6ab77e0-9a69-11f0-93e9-dc1ba1b74868', '81c0fdea-97ab-11f0-a21b-025084b7a91d', '0', 'Nueva alerta de riego programada para tu huerto: Tomates - lllll', 'creacion', 1, '2025-09-25 23:45:27', '2025-09-29 15:01:47'),
('b6ac26d7-9a69-11f0-93e9-dc1ba1b74868', '81c0fdea-97ab-11f0-a21b-025084b7a91d', '0', 'Nueva alerta de riego creada para el huerto: Tomates', 'creacion', 1, '2025-09-25 23:45:27', '2025-09-29 15:01:47'),
('ba65c576-9a5d-11f0-93e9-dc1ba1b74868', '81c0fdea-97ab-11f0-a21b-025084b7a91d', '971d0f4b-9a5d-11f0-93e9-dc1ba1b74868', 'Alerta de riego: Zanahorias - miarma', 'recordatorio', 1, '2025-09-25 22:19:39', '2025-09-25 22:22:46'),
('cd668b34-9a5d-11f0-93e9-dc1ba1b74868', '81c0fdea-97ab-11f0-a21b-025084b7a91d', '0', 'Nueva alerta de riego programada para tu huerto: vbvvf - WAOOOOOOO', 'creacion', 1, '2025-09-25 22:20:11', '2025-09-25 22:22:46'),
('cd67ee4b-9a5d-11f0-93e9-dc1ba1b74868', '81c0fdea-97ab-11f0-a21b-025084b7a91d', '0', 'Nueva alerta de riego creada para el huerto: vbvvf', 'creacion', 1, '2025-09-25 22:20:11', '2025-09-25 22:22:46'),
('cd7670d4-9a69-11f0-93e9-dc1ba1b74868', '81c0fdea-97ab-11f0-a21b-025084b7a91d', 'b6aae907-9a69-11f0-93e9-dc1ba1b74868', 'Alerta de riego: Tomates - lllll', 'recordatorio', 1, '2025-09-25 23:46:05', '2025-09-29 15:01:47');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones_alertas_riego`
--

CREATE TABLE `notificaciones_alertas_riego` (
  `id` char(36) NOT NULL,
  `alerta_programada_id` char(36) NOT NULL,
  `usuario_id` char(36) NOT NULL,
  `tipo_notificacion` enum('recordatorio','alerta_inmediata') NOT NULL,
  `mensaje` text NOT NULL,
  `enviada` tinyint(1) DEFAULT 0,
  `fecha_envio` datetime DEFAULT NULL,
  `metodo_envio` enum('sistema','email','sms') DEFAULT 'sistema',
  `leida` tinyint(1) DEFAULT 0,
  `fecha_leida` datetime DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_reset_codes`
--

CREATE TABLE `password_reset_codes` (
  `id` int(11) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `code` varchar(6) NOT NULL,
  `code_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_used` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Triggers para manejo de updated_at en password_reset_codes
DELIMITER $$
CREATE TRIGGER `prc_set_updated_at_insert`
BEFORE INSERT ON `password_reset_codes`
FOR EACH ROW
BEGIN
  IF NEW.`created_at` IS NULL THEN
    SET NEW.`created_at` = CURRENT_TIMESTAMP;
  END IF;
  SET NEW.`updated_at` = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER `prc_set_updated_at_update`
BEFORE UPDATE ON `password_reset_codes`
FOR EACH ROW
BEGIN
  SET NEW.`updated_at` = CURRENT_TIMESTAMP;
END$$
DELIMITER ;

--
-- Volcado de datos para la tabla `password_reset_codes`
--

INSERT INTO `password_reset_codes` (`id`, `user_id`, `email`, `code`, `code_hash`, `expires_at`, `is_used`, `created_at`, `updated_at`) VALUES
(4, 'e256d1b5-9be8-11f0-a21f-3417ebc2e080', 'juansnuvaez@gmail.com', '613398', '17ae693f0c75cc3a12567b07704231379abc2f85de0887611af52a3a9c3f1ece', '2025-10-02 22:10:40', 1, '2025-10-02 22:00:40', '2025-10-02 22:00:49'),
(5, 'e256d1b5-9be8-11f0-a21f-3417ebc2e080', 'juansnuvaez@gmail.com', '652582', '9b020904986bda46f73af14b4f09b7364e50abca55ae768a8d4426fa0157cd78', '2025-10-02 22:10:49', 1, '2025-10-02 22:00:49', '2025-10-02 22:00:56'),
(6, 'e256d1b5-9be8-11f0-a21f-3417ebc2e080', 'juansnuvaez@gmail.com', '840459', 'ee8960a943ec704e217905073594227b35a2f2671b28e83785287a9ea0844706', '2025-10-02 22:11:13', 1, '2025-10-02 22:01:13', '2025-10-02 22:01:13'),
(7, 'e256d1b5-9be8-11f0-a21f-3417ebc2e080', 'juansnuvaez@gmail.com', '616713', '59de1a632574b179a38f3e8241a485cd05b947a54f8fd75cf87b07d40749f91c', '2025-10-02 22:16:51', 1, '2025-10-02 22:06:51', '2025-10-02 22:09:08'),
(8, 'e256d1b5-9be8-11f0-a21f-3417ebc2e080', 'juansnuvaez@gmail.com', '647791', '1588b5885ebbf1e1ebb58e09f01681093576ee74bbedd3640c68724554bd1386', '2025-10-02 22:19:08', 1, '2025-10-02 22:09:08', '2025-10-02 22:09:21'),
(9, 'e256d1b5-9be8-11f0-a21f-3417ebc2e080', 'juansnuvaez@gmail.com', '707200', '84890e8c62547f8d50a55de9bff38a210c715da22b7f1c721189ee0f7f32787e', '2025-10-02 22:19:33', 1, '2025-10-02 22:09:33', '2025-10-02 22:09:34'),
(10, '06983d83-9d4a-11f0-8b6d-dc1ba1b74868', 'eduardolaguna0616@gmail.com', '796108', 'a2d9073f4adb23e0b5fee9391425d7567e7c44df623a69e96bbf57c33b8ddc80', '2025-10-02 22:27:37', 1, '2025-10-02 22:17:37', '2025-10-02 22:19:18'),
(11, 'e256d1b5-9be8-11f0-a21f-3417ebc2e080', 'juansnuvaez@gmail.com', '314268', '2af98b6bb89bb61111b8a9359b5ce8ab31554831784734aedbeadc41d459bfd3', '2025-10-02 22:35:47', 1, '2025-10-02 22:25:47', '2025-10-02 22:25:51'),
(12, 'e256d1b5-9be8-11f0-a21f-3417ebc2e080', 'juansnuvaez@gmail.com', '428741', '8e425db0893a94a60be4efd22a88f011cebab12094d9a13b49328e9e2f5843ff', '2025-10-02 22:35:51', 1, '2025-10-02 22:25:51', '2025-10-02 22:25:57'),
(13, 'e256d1b5-9be8-11f0-a21f-3417ebc2e080', 'juansnuvaez@gmail.com', '289005', '6e8a9f9a803b3c0e84fd7e0dbafcace3acc32f0a96a8c3a57abce2505e832c44', '2025-10-02 22:35:57', 1, '2025-10-02 22:25:57', '2025-10-02 22:26:04'),
(14, 'e256d1b5-9be8-11f0-a21f-3417ebc2e080', 'juansnuvaez@gmail.com', '145488', '2979347d98d93627a697c609b7c06c82cfdeb1870b4bba23b5504e556d72a92c', '2025-10-02 22:36:04', 0, '2025-10-02 22:26:04', '2025-10-02 22:26:04');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos_proveedores`
--

CREATE TABLE `productos_proveedores` (
  `id` char(36) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `categoria_id` char(36) NOT NULL,
  `proveedor_id` char(36) NOT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `unidad_medida` varchar(20) DEFAULT 'unidad',
  `etiquetas` text DEFAULT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedores`
--

CREATE TABLE `proveedores` (
  `id` char(36) NOT NULL,
  `nombre_empresa` varchar(150) NOT NULL,
  `contacto_principal` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(120) DEFAULT NULL,
  `ubicacion_id` char(36) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `usuario_creador` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proveedores`
--

INSERT INTO `proveedores` (`id`, `nombre_empresa`, `contacto_principal`, `telefono`, `email`, `ubicacion_id`, `descripcion`, `is_deleted`, `created_at`, `usuario_creador`) VALUES
('128692c0-cb87-4c05-ad61-a1db8dbfdd8c', 'bhbhbhb', 'ytryur', '567876987', 'kk@gmail.com', '923ecb45-9c17-11f0-a21f-3417ebc2e080', 'google', 0, '2025-09-28 03:02:29', '81c0fdea-97ab-11f0-a21b-025084b7a91d'),
('33962b4c-bffa-4fb3-91dd-a4898662949a', 'jlkjjlkjl', 'fjhfjhfhg', '2347578898', 'h@gmail.com', '5d04d80b-9c17-11f0-a21f-3417ebc2e080', 'kjkjkjkjkjkjkjkjkj', 0, '2025-09-28 03:01:00', '81c0fdea-97ab-11f0-a21b-025084b7a91d'),
('4eb91aa6-43c6-4647-a2f9-df9aa91e29e1', 'Araguanei', 'jojojo', '4246358455', 'a@test.com', '958ded0d-9bed-11f0-a21f-3417ebc2e080', 'hola ', 0, '2025-09-27 22:01:56', '81c0fdea-97ab-11f0-a21b-025084b7a91d'),
('586e59fa-7e00-4350-9136-3cf80aebe397', 'hjklkjhl', 'njhgyu', '5647647685', 'n@gmail.com', '764909e9-9c17-11f0-a21f-3417ebc2e080', 'njnjhbhhb', 0, '2025-09-28 03:01:42', '81c0fdea-97ab-11f0-a21b-025084b7a91d'),
('5d0d906a-1cc0-445e-884b-288dac12bf52', 'Catemar', 'Pedro', '12312414313', '', '71dd06f5-9e06-11f0-8b6d-dc1ba1b74868', 'Vamos por ahi', 0, '2025-09-30 14:04:47', '81c0fdea-97ab-11f0-a21b-025084b7a91d'),
('e939f988-a151-4cce-83eb-33238efe156e', 'plant store', 'jkjkjk', '2222222234', 'p@test.com', 'fae1ce22-9bee-11f0-a21f-3417ebc2e080', 'sadfsafdafasfd', 0, '2025-09-27 22:11:55', '81c0fdea-97ab-11f0-a21b-025084b7a91d'),
('ea729335-ba5b-43eb-95ed-3a5f68cc4f21', 'Veplant', 'jp', '04124894321', 'a@gmail.com', '3a69039a-9c01-11f0-a21f-3417ebc2e080', 'poiuytrd', 0, '2025-09-28 00:22:33', '81c0fdea-97ab-11f0-a21b-025084b7a91d'),
('f53bf53e-fa03-4295-b2ab-3bdaf1500d6c', 'floristeria', 'lalalal', '4245687499', 'a@gmail.com', '747b134a-9bf1-11f0-a21f-3417ebc2e080', 'kokokokokokokk', 0, '2025-09-27 22:29:39', '81c0fdea-97ab-11f0-a21b-025084b7a91d');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedor_categorias`
--

CREATE TABLE `proveedor_categorias` (
  `id` char(36) NOT NULL,
  `proveedor_id` char(36) NOT NULL,
  `categoria_id` char(36) NOT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proveedor_categorias`
--

INSERT INTO `proveedor_categorias` (`id`, `proveedor_id`, `categoria_id`, `is_deleted`, `created_at`) VALUES
('5d3212fe-9c17-11f0-a21f-3417ebc2e080', '33962b4c-bffa-4fb3-91dd-a4898662949a', 'e5e9ed46-9bf5-11f0-a21f-3417ebc2e080', 0, '2025-09-28 03:01:00'),
('5d5c8a11-9c17-11f0-a21f-3417ebc2e080', '33962b4c-bffa-4fb3-91dd-a4898662949a', 'e5e9eca2-9bf5-11f0-a21f-3417ebc2e080', 0, '2025-09-28 03:01:00'),
('5d5cbd59-9c17-11f0-a21f-3417ebc2e080', '33962b4c-bffa-4fb3-91dd-a4898662949a', 'e5e9ecf5-9bf5-11f0-a21f-3417ebc2e080', 0, '2025-09-28 03:01:00'),
('71de973b-9e06-11f0-8b6d-dc1ba1b74868', '5d0d906a-1cc0-445e-884b-288dac12bf52', 'b323ecb8-4ce3-4a71-8019-bdd9dd8e1911', 0, '2025-09-30 14:04:47'),
('764a2631-9c17-11f0-a21f-3417ebc2e080', '586e59fa-7e00-4350-9136-3cf80aebe397', 'e5e9ecf5-9bf5-11f0-a21f-3417ebc2e080', 0, '2025-09-28 03:01:42'),
('764a7004-9c17-11f0-a21f-3417ebc2e080', '586e59fa-7e00-4350-9136-3cf80aebe397', 'e5e9ebf6-9bf5-11f0-a21f-3417ebc2e080', 0, '2025-09-28 03:01:42'),
('9254744f-9c17-11f0-a21f-3417ebc2e080', '128692c0-cb87-4c05-ad61-a1db8dbfdd8c', 'e5e9eb50-9bf5-11f0-a21f-3417ebc2e080', 0, '2025-09-28 03:02:29'),
('925c5f0f-9c17-11f0-a21f-3417ebc2e080', '128692c0-cb87-4c05-ad61-a1db8dbfdd8c', 'e5e9ecf5-9bf5-11f0-a21f-3417ebc2e080', 0, '2025-09-28 03:02:29'),
('df53e5eb-9c08-11f0-a21f-3417ebc2e080', 'ea729335-ba5b-43eb-95ed-3a5f68cc4f21', 'e5e9ebf6-9bf5-11f0-a21f-3417ebc2e080', 0, '2025-09-28 01:17:16'),
('df596f3c-9c08-11f0-a21f-3417ebc2e080', 'ea729335-ba5b-43eb-95ed-3a5f68cc4f21', 'e5e9ec4f-9bf5-11f0-a21f-3417ebc2e080', 0, '2025-09-28 01:17:16'),
('df59cec2-9c08-11f0-a21f-3417ebc2e080', 'ea729335-ba5b-43eb-95ed-3a5f68cc4f21', 'e5e9ecf5-9bf5-11f0-a21f-3417ebc2e080', 0, '2025-09-28 01:17:16'),
('e62cd2ae-9bf5-11f0-a21f-3417ebc2e080', '4eb91aa6-43c6-4647-a2f9-df9aa91e29e1', 'e5e9eb50-9bf5-11f0-a21f-3417ebc2e080', 0, '2025-09-27 23:01:27'),
('e630c2f8-9bf5-11f0-a21f-3417ebc2e080', 'e939f988-a151-4cce-83eb-33238efe156e', 'e5e9dd22-9bf5-11f0-a21f-3417ebc2e080', 0, '2025-09-27 23:01:27'),
('e634ccc6-9bf5-11f0-a21f-3417ebc2e080', 'f53bf53e-fa03-4295-b2ab-3bdaf1500d6c', 'e5e9dd22-9bf5-11f0-a21f-3417ebc2e080', 0, '2025-09-27 23:01:27');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ubicaciones`
--

CREATE TABLE `ubicaciones` (
  `id` char(36) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `calle` varchar(150) DEFAULT NULL,
  `ciudad` varchar(100) NOT NULL,
  `estado` varchar(100) DEFAULT NULL,
  `pais` varchar(100) DEFAULT 'Venezuela',
  `latitud` decimal(5,2) DEFAULT NULL,
  `longitud` decimal(6,2) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ubicaciones`
--

INSERT INTO `ubicaciones` (`id`, `nombre`, `calle`, `ciudad`, `estado`, `pais`, `latitud`, `longitud`, `descripcion`, `is_deleted`, `created_at`) VALUES
('37b0536a-a004-11f0-8b88-c8f7500bc329', 'Maracaibo-33333333', 'Calle Alegre', 'Maracaibo', 'Zulia', 'Venezuela', NULL, NULL, NULL, 0, '2025-10-03 02:52:06'),
('3a69039a-9c01-11f0-a21f-3417ebc2e080', 'Ubicación de Veplant', 'adasdfsaf', 'Zulia', 'FL', 'Estados Unidos', NULL, NULL, '', 0, '2025-09-28 00:22:33'),
('5d04d80b-9c17-11f0-a21f-3417ebc2e080', 'Ubicación de jlkjjlkjl', 'hghgjh', 'Zulia', 'FL', 'Estados Uni', NULL, NULL, '', 0, '2025-09-28 03:01:00'),
('71dd06f5-9e06-11f0-8b6d-dc1ba1b74868', 'Ubicación de Catemar', '', 'Maracaibo', 'Activo', 'Venezuela', NULL, NULL, '', 0, '2025-09-30 14:04:47'),
('747b134a-9bf1-11f0-a21f-3417ebc2e080', 'Ubicación de floristeria', 'lo quie ', 'Zulia', 'FL', 'Estados Unidos', NULL, NULL, '', 0, '2025-09-27 22:29:38'),
('764909e9-9c17-11f0-a21f-3417ebc2e080', 'Ubicación de hjklkjhl', 'cfcxdxdx', 'Zulia', 'FL', 'Estados', NULL, NULL, '', 0, '2025-09-28 03:01:42'),
('81c0513e-97ab-11f0-a21b-025084b7a91d', 'Maracaibo-29929652', 'Avenida El Palmar', 'Maracaibo', 'Activo', 'Venezuela', NULL, NULL, NULL, 0, '2025-09-22 11:58:52'),
('923ecb45-9c17-11f0-a21f-3417ebc2e080', 'Ubicación de bhbhbhb', 'jnjnjnjn', 'Zulia', 'FL', 'Estados Unidos', NULL, NULL, '', 0, '2025-09-28 03:02:29'),
('958ded0d-9bed-11f0-a21f-3417ebc2e080', 'Ubicación de Araguanei', 'lllllllll', 'Zulia', 'FL', 'Estados Unidos', NULL, NULL, '', 0, '2025-09-27 22:01:56'),
('e252e937-9be8-11f0-a21f-3417ebc2e080', 'Zulia-31116095', 'el mojan', 'Zulia', 'FL', 'Estados Unidos', NULL, NULL, NULL, 0, '2025-09-27 21:28:17'),
('fae1ce22-9bee-11f0-a21f-3417ebc2e080', 'Ubicación de plant store', 'aasdfasf', 'Zulia', 'FL', 'Estados Unidos', NULL, NULL, '', 0, '2025-09-27 22:11:55');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` char(36) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `cedula` varchar(20) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `preferencias_cultivo` varchar(100) DEFAULT NULL,
  `rol` enum('administrador','tecnico','residente','colaborador') NOT NULL,
  `ubicacion_id` char(36) DEFAULT NULL,
  `email` varchar(120) NOT NULL,
  `password` varchar(255) NOT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `es_administrador_original` tinyint(1) DEFAULT 0 COMMENT 'Indica si el usuario se registró como administrador original (checkbox marcado)',
  `codigo_invitacion_usado` varchar(6) DEFAULT NULL COMMENT 'Código de invitación que usó el usuario para registrarse como residente',
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `cedula`, `telefono`, `preferencias_cultivo`, `rol`, `ubicacion_id`, `email`, `password`, `imagen_url`, `es_administrador_original`, `codigo_invitacion_usado`, `is_deleted`, `created_at`) VALUES
('06983d83-9d4a-11f0-8b6d-dc1ba1b74868', 'Renger', '22153463', 'eduardolaguna0616@gm', 'legumbres', 'residente', '81c0513e-97ab-11f0-a21b-025084b7a91d', 'eduardolaguna0616@gmail.com', '$2b$12$7QEN0QGw9rYqnBBdCO0/W.z3mAgX0ygkUcvhVEaanB/wp3cUnVIqW', NULL, 0, '2XI4JX', 0, '2025-09-29 15:36:11'),
('37b1c1b8-a004-11f0-8b88-c8f7500bc329', 'Juan Antonio', '33333333', '04246953455', NULL, 'administrador', '37b0536a-a004-11f0-8b88-c8f7500bc329', 'montoyugi@gmail.com', '$2b$12$T0SJxlXRb23yh88OEw7x2OtcR5i.Aa/M2H5yMgz9tYa8ooVQA/7aG', NULL, 1, NULL, 0, '2025-10-03 02:52:06'),
('81c0fdea-97ab-11f0-a21b-025084b7a91d', 'Angel Rangel', '29929652', 'angel.rangel@urbe.ed', 'hortalizas', 'administrador', '81c0513e-97ab-11f0-a21b-025084b7a91d', 'angel.rangel@urbe.edu.ve', '$2b$12$kJfC3e46SVV0hGqE.CnI4Ok6.XeKaK3Z9MZ0E6XHliFvdhLs0TUl6', NULL, 1, NULL, 0, '2025-09-22 11:58:52'),
('928f6ad3-97d4-11f0-a21b-025084b7a91d', 'Eduardo Laguna', '29929650', 'rangelangel794@gmail', 'frutas', 'residente', '81c0513e-97ab-11f0-a21b-025084b7a91d', 'rangelangel794@gmail.com', '$2b$12$YSygY7tV9ZWjFvKfOk.AOu2DEziPcWaLcHPnZQo3f9wECWkms9V.2', NULL, 0, '2XI4JX', 0, '2025-09-22 16:52:49'),
('e256d1b5-9be8-11f0-a21f-3417ebc2e080', 'juan', '31116095', '04246953455', 'hortalizas', 'administrador', 'e252e937-9be8-11f0-a21f-3417ebc2e080', 'juansnuvaez@gmail.com', '$2b$12$7iF0.kG31RniJ8mf7MOTeeJkk1ql4FSPPTEfOIPGmrtdOnWYDhC/6', 'https://imgsrv.crunchyroll.com/cdn-cgi/image/fit=cover,format=auto,quality=85,width=1920/keyart/G9VHN9P43-backdrop_wide', 1, NULL, 0, '2025-09-27 21:28:17');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_conectados`
--

CREATE TABLE `usuarios_conectados` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `usuario_id` char(36) NOT NULL,
  `socket_id` varchar(255) NOT NULL,
  `fecha_conexion` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultima_actividad` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Triggers para manejo de ultima_actividad en usuarios_conectados
DELIMITER $$
CREATE TRIGGER `uc_set_ultima_actividad_insert`
BEFORE INSERT ON `usuarios_conectados`
FOR EACH ROW
BEGIN
  SET NEW.`ultima_actividad` = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER `uc_set_ultima_actividad_update`
BEFORE UPDATE ON `usuarios_conectados`
FOR EACH ROW
BEGIN
  SET NEW.`ultima_actividad` = CURRENT_TIMESTAMP;
END$$
DELIMITER ;

--
-- Volcado de datos para la tabla `usuarios_conectados`
--

INSERT INTO `usuarios_conectados` (`id`, `usuario_id`, `socket_id`, `fecha_conexion`, `ultima_actividad`) VALUES
('78cea3df-7898-443e-90c8-e30c991e6c4f', '928f6ad3-97d4-11f0-a21b-025084b7a91d', 'JJ9qr9CsEsxvaBWKAAcN', '2025-09-30 16:08:41', '2025-09-30 16:08:41'),
('917da5c4-abb1-4b29-b24a-eb1f7a523617', '81c0fdea-97ab-11f0-a21b-025084b7a91d', 'PjFIwcW6Pi9LniphAAiC', '2025-09-30 16:08:47', '2025-09-30 16:08:47'),
('eae599cd-fb99-455a-8610-6befb518ab2b', '06983d83-9d4a-11f0-8b6d-dc1ba1b74868', 'cTG6lSKvTtsNdAJ1AASJ', '2025-09-30 16:08:23', '2025-09-30 16:08:23'),
('ffc1fd6e-7931-4e95-a2d7-cfa389a23dcc', '37b1c1b8-a004-11f0-8b88-c8f7500bc329', 'al91gHHkeZvjvEnwAAAI', '2025-10-06 22:39:25', '2025-10-06 22:39:25');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario_huerto`
--

CREATE TABLE `usuario_huerto` (
  `id` char(36) NOT NULL,
  `usuario_id` char(36) NOT NULL,
  `huerto_id` char(36) NOT NULL,
  `rol` enum('propietario','colaborador','visitante') DEFAULT 'colaborador',
  `fecha_union` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario_huerto`
--

INSERT INTO `usuario_huerto` (`id`, `usuario_id`, `huerto_id`, `rol`, `fecha_union`, `is_deleted`, `created_at`) VALUES
('31f99671-97af-11f0-a21b-025084b7a91d', '81c0fdea-97ab-11f0-a21b-025084b7a91d', '31f8bc46-97af-11f0-a21b-025084b7a91d', 'propietario', '2025-09-22 12:25:16', 0, '2025-09-22 12:25:16'),
('4314b71c-9be9-11f0-a21f-3417ebc2e080', 'e256d1b5-9be8-11f0-a21f-3417ebc2e080', '430be19c-9be9-11f0-a21f-3417ebc2e080', 'propietario', '2025-09-27 21:31:00', 0, '2025-09-27 21:31:00'),
('4d4053c4-97ac-11f0-a21b-025084b7a91d', '81c0fdea-97ab-11f0-a21b-025084b7a91d', '4d3f6e90-97ac-11f0-a21b-025084b7a91d', 'propietario', '2025-09-22 12:04:33', 0, '2025-09-22 12:04:33'),
('7177864b-9d56-11f0-8b6d-dc1ba1b74868', '06983d83-9d4a-11f0-8b6d-dc1ba1b74868', '71770ff7-9d56-11f0-8b6d-dc1ba1b74868', 'propietario', '2025-09-29 17:05:04', 0, '2025-09-29 17:05:04'),
('7b1a5650-97ac-11f0-a21b-025084b7a91d', '81c0fdea-97ab-11f0-a21b-025084b7a91d', '7b173ec0-97ac-11f0-a21b-025084b7a91d', 'propietario', '2025-09-22 12:05:50', 0, '2025-09-22 12:05:50'),
('7c61565e-97ad-11f0-a21b-025084b7a91d', '81c0fdea-97ab-11f0-a21b-025084b7a91d', '7c60f57a-97ad-11f0-a21b-025084b7a91d', 'propietario', '2025-09-22 12:13:02', 0, '2025-09-22 12:13:02'),
('cd586dab-a068-11f0-8b88-c8f7500bc329', '37b1c1b8-a004-11f0-8b88-c8f7500bc329', 'cd57235a-a068-11f0-8b88-c8f7500bc329', 'propietario', '2025-10-03 14:51:58', 0, '2025-10-03 14:51:58'),
('e30e4b41-97d4-11f0-a21b-025084b7a91d', '928f6ad3-97d4-11f0-a21b-025084b7a91d', 'e30dd62b-97d4-11f0-a21b-025084b7a91d', 'propietario', '2025-09-22 16:55:04', 0, '2025-09-22 16:55:04');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `alertas`
--
ALTER TABLE `alertas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `huerto_id` (`huerto_id`),
  ADD KEY `usuario_creador` (`usuario_creador`);

--
-- Indices de la tabla `alertas_programadas_riego`
--
ALTER TABLE `alertas_programadas_riego`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_huerto_activa` (`huerto_id`,`esta_activa`),
  ADD KEY `idx_fecha_programada` (`fecha_programada`),
  ADD KEY `idx_notificacion_pendiente` (`notificacion_enviada`,`fecha_programada`),
  ADD KEY `idx_creador` (`usuario_creador`);

--
-- Indices de la tabla `alertas_riego`
--
ALTER TABLE `alertas_riego`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_huerto_id` (`huerto_id`),
  ADD KEY `idx_fecha_alerta` (`fecha_alerta`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_creado_por` (`creado_por`);

--
-- Indices de la tabla `alerta_destinatarios`
--
ALTER TABLE `alerta_destinatarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_alerta_usuario` (`alerta_id`,`usuario_id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `auth_tokens`
--
ALTER TABLE `auth_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_nombre` (`nombre`);

--
-- Indices de la tabla `categorias_alertas`
--
ALTER TABLE `categorias_alertas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `categorias_productos`
--
ALTER TABLE `categorias_productos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `codigos_invitacion`
--
ALTER TABLE `codigos_invitacion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `ubicacion_id` (`ubicacion_id`),
  ADD KEY `usado_por` (`usado_por`),
  ADD KEY `idx_codigo` (`codigo`),
  ADD KEY `idx_administrador` (`administrador_id`),
  ADD KEY `idx_activo` (`esta_activo`),
  ADD KEY `idx_expiracion` (`fecha_expiracion`);

--
-- Indices de la tabla `comentarios`
--
ALTER TABLE `comentarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `huerto_id` (`huerto_id`),
  ADD KEY `idx_comentarios_nombre_siembra` (`nombre_siembra`);

--
-- Indices de la tabla `comentarios_inventario`
--
ALTER TABLE `comentarios_inventario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_comentarios_inventario_inventario_id` (`inventario_id`),
  ADD KEY `idx_comentarios_inventario_usuario_id` (`usuario_id`),
  ADD KEY `idx_comentarios_inventario_tipo` (`tipo_comentario`);

--
-- Indices de la tabla `comentario_inventario_permisos`
--
ALTER TABLE `comentario_inventario_permisos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_inventory_comment_permission` (`comentario_id`,`usuario_id`,`permiso_tipo`),
  ADD KEY `idx_comentario_permisos_comentario` (`comentario_id`),
  ADD KEY `idx_comentario_permisos_usuario` (`usuario_id`),
  ADD KEY `idx_comentario_permisos_asignado_por` (`asignado_por`);

--
-- Indices de la tabla `comentario_permisos`
--
ALTER TABLE `comentario_permisos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_comment_permission` (`comentario_id`,`usuario_id`,`permiso_tipo`);

--
-- Indices de la tabla `configuracion_alertas_usuario`
--
ALTER TABLE `configuracion_alertas_usuario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_usuario_config` (`usuario_id`);

--
-- Indices de la tabla `huertos`
--
ALTER TABLE `huertos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ubicacion_id` (`ubicacion_id`),
  ADD KEY `usuario_creador` (`usuario_creador`);

--
-- Indices de la tabla `huerto_data`
--
ALTER TABLE `huerto_data`
  ADD PRIMARY KEY (`id`),
  ADD KEY `huerto_id` (`huerto_id`),
  ADD KEY `usuario_registro` (`usuario_registro`),
  ADD KEY `idx_plaga_especie` (`plaga_especie`),
  ADD KEY `idx_plaga_nivel` (`plaga_nivel`),
  ADD KEY `idx_huerto_data_comentario_id` (`comentario_id`),
  ADD KEY `idx_siembra_relacionada` (`siembra_relacionada`),
  ADD KEY `idx_huerto_data_huerto_siembra` (`huerto_siembra_id`);

--
-- Indices de la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoria_id` (`categoria_id`),
  ADD KEY `huerto_id` (`huerto_id`),
  ADD KEY `proveedor_id` (`proveedor_id`),
  ADD KEY `usuario_creador` (`usuario_creador`);

--
-- Indices de la tabla `inventario_permisos`
--
ALTER TABLE `inventario_permisos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_permission` (`inventario_id`,`usuario_id`,`permiso_tipo`),
  ADD KEY `idx_inventario_permisos_inventario_id` (`inventario_id`),
  ADD KEY `idx_inventario_permisos_usuario_id` (`usuario_id`),
  ADD KEY `idx_inventario_permisos_tipo` (`permiso_tipo`);

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario_no_leida` (`usuario_id`,`leida`),
  ADD KEY `idx_tipo` (`tipo`),
  ADD KEY `idx_huerto` (`huerto_id`),
  ADD KEY `idx_fecha_creacion` (`created_at`);

--
-- Indices de la tabla `notificaciones_alertas`
--
ALTER TABLE `notificaciones_alertas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario_id` (`usuario_id`),
  ADD KEY `idx_alerta_id` (`alerta_id`),
  ADD KEY `idx_leida` (`leida`),
  ADD KEY `idx_fecha_creacion` (`fecha_creacion`);

--
-- Indices de la tabla `notificaciones_alertas_riego`
--
ALTER TABLE `notificaciones_alertas_riego`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario_no_leida` (`usuario_id`,`leida`),
  ADD KEY `idx_alerta` (`alerta_programada_id`),
  ADD KEY `idx_fecha_envio` (`fecha_envio`);

--
-- Indices de la tabla `password_reset_codes`
--
ALTER TABLE `password_reset_codes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `productos_proveedores`
--
ALTER TABLE `productos_proveedores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoria_id` (`categoria_id`),
  ADD KEY `proveedor_id` (`proveedor_id`);

--
-- Indices de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ubicacion_id` (`ubicacion_id`);

--
-- Indices de la tabla `proveedor_categorias`
--
ALTER TABLE `proveedor_categorias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_proveedor_categoria` (`proveedor_id`,`categoria_id`),
  ADD KEY `idx_proveedor_id` (`proveedor_id`),
  ADD KEY `idx_categoria_id` (`categoria_id`);

--
-- Indices de la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cedula` (`cedula`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `ubicacion_id` (`ubicacion_id`),
  ADD KEY `idx_codigo_invitacion_usado` (`codigo_invitacion_usado`);

--
-- Indices de la tabla `usuarios_conectados`
--
ALTER TABLE `usuarios_conectados`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_socket_id` (`socket_id`),
  ADD KEY `idx_usuario_id` (`usuario_id`),
  ADD KEY `idx_ultima_actividad` (`ultima_actividad`);

--
-- Indices de la tabla `usuario_huerto`
--
ALTER TABLE `usuario_huerto`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_usuario_huerto` (`usuario_id`,`huerto_id`),
  ADD KEY `huerto_id` (`huerto_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `password_reset_codes`
--
ALTER TABLE `password_reset_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `alertas`
--
ALTER TABLE `alertas`
  ADD CONSTRAINT `alertas_ibfk_1` FOREIGN KEY (`huerto_id`) REFERENCES `huertos` (`id`),
  ADD CONSTRAINT `alertas_ibfk_2` FOREIGN KEY (`usuario_creador`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `alertas_programadas_riego`
--
ALTER TABLE `alertas_programadas_riego`
  ADD CONSTRAINT `alertas_programadas_riego_ibfk_1` FOREIGN KEY (`huerto_id`) REFERENCES `huertos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `alertas_programadas_riego_ibfk_2` FOREIGN KEY (`usuario_creador`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `alerta_destinatarios`
--
ALTER TABLE `alerta_destinatarios`
  ADD CONSTRAINT `alerta_destinatarios_ibfk_1` FOREIGN KEY (`alerta_id`) REFERENCES `alertas` (`id`),
  ADD CONSTRAINT `alerta_destinatarios_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `auth_tokens`
--
ALTER TABLE `auth_tokens`
  ADD CONSTRAINT `auth_tokens_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `codigos_invitacion`
--
ALTER TABLE `codigos_invitacion`
  ADD CONSTRAINT `codigos_invitacion_ibfk_1` FOREIGN KEY (`administrador_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `codigos_invitacion_ibfk_2` FOREIGN KEY (`ubicacion_id`) REFERENCES `ubicaciones` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `codigos_invitacion_ibfk_3` FOREIGN KEY (`usado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `comentarios`
--
ALTER TABLE `comentarios`
  ADD CONSTRAINT `comentarios_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `comentarios_ibfk_2` FOREIGN KEY (`huerto_id`) REFERENCES `huertos` (`id`);

--
-- Filtros para la tabla `comentarios_inventario`
--
ALTER TABLE `comentarios_inventario`
  ADD CONSTRAINT `comentarios_inventario_ibfk_1` FOREIGN KEY (`inventario_id`) REFERENCES `inventario` (`id`),
  ADD CONSTRAINT `comentarios_inventario_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `configuracion_alertas_usuario`
--
ALTER TABLE `configuracion_alertas_usuario`
  ADD CONSTRAINT `configuracion_alertas_usuario_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `huertos`
--
ALTER TABLE `huertos`
  ADD CONSTRAINT `huertos_ibfk_1` FOREIGN KEY (`ubicacion_id`) REFERENCES `ubicaciones` (`id`),
  ADD CONSTRAINT `huertos_ibfk_2` FOREIGN KEY (`usuario_creador`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `huerto_data`
--
ALTER TABLE `huerto_data`
  ADD CONSTRAINT `huerto_data_ibfk_1` FOREIGN KEY (`huerto_id`) REFERENCES `huertos` (`id`),
  ADD CONSTRAINT `huerto_data_ibfk_2` FOREIGN KEY (`usuario_registro`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD CONSTRAINT `inventario_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias_productos` (`id`),
  ADD CONSTRAINT `inventario_ibfk_2` FOREIGN KEY (`huerto_id`) REFERENCES `huertos` (`id`),
  ADD CONSTRAINT `inventario_ibfk_3` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`),
  ADD CONSTRAINT `inventario_ibfk_4` FOREIGN KEY (`usuario_creador`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notificaciones_ibfk_2` FOREIGN KEY (`huerto_id`) REFERENCES `huertos` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `notificaciones_alertas_riego`
--
ALTER TABLE `notificaciones_alertas_riego`
  ADD CONSTRAINT `notificaciones_alertas_riego_ibfk_1` FOREIGN KEY (`alerta_programada_id`) REFERENCES `alertas_programadas_riego` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notificaciones_alertas_riego_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `password_reset_codes`
--
ALTER TABLE `password_reset_codes`
  ADD CONSTRAINT `password_reset_codes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `productos_proveedores`
--
ALTER TABLE `productos_proveedores`
  ADD CONSTRAINT `productos_proveedores_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias_productos` (`id`),
  ADD CONSTRAINT `productos_proveedores_ibfk_2` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`);

--
-- Filtros para la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD CONSTRAINT `proveedores_ibfk_1` FOREIGN KEY (`ubicacion_id`) REFERENCES `ubicaciones` (`id`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`ubicacion_id`) REFERENCES `ubicaciones` (`id`);

--
-- Filtros para la tabla `usuario_huerto`
--
ALTER TABLE `usuario_huerto`
  ADD CONSTRAINT `usuario_huerto_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `usuario_huerto_ibfk_2` FOREIGN KEY (`huerto_id`) REFERENCES `huertos` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

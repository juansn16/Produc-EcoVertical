// ==================== ESTADÍSTICAS ====================

export const StatisticsQueries = {
  // ==================== VERIFICACIÓN DE HUERTOS ====================

  // Verificar que el huerto existe
  checkGardenExists: `
    SELECT * FROM huertos WHERE id = $1 AND is_deleted = false
  `,

  // ==================== ESTADÍSTICAS DE HUERTO ====================

  // Obtener estadísticas básicas del huerto
  getGardenBasicStats: `
    SELECT 
      COUNT(*) as total_registros,
      CAST(COALESCE(SUM(
        CASE 
          WHEN unidad_agua = 'ml' THEN cantidad_agua / 1000
          WHEN unidad_agua = 'l' THEN cantidad_agua
          ELSE cantidad_agua / 1000
        END
      ), 0) AS DECIMAL(10,3)) as total_agua,
      CAST(COALESCE(SUM(cantidad_siembra), 0) AS DECIMAL(10,3)) as total_siembra,
      CAST(COALESCE(SUM(cantidad_cosecha), 0) AS DECIMAL(10,3)) as total_cosecha,
      CAST(COALESCE(SUM(cantidad_abono), 0) AS DECIMAL(10,3)) as total_abono,
      CAST(COALESCE(SUM(cantidad_plagas), 0) AS DECIMAL(10,3)) as total_plagas,
      CAST(COALESCE(AVG(
        CASE 
          WHEN unidad_agua = 'ml' THEN cantidad_agua / 1000
          WHEN unidad_agua = 'l' THEN cantidad_agua
          ELSE cantidad_agua / 1000
        END
      ), 0) AS DECIMAL(10,3)) as promedio_agua,
      CAST(COALESCE(AVG(cantidad_siembra), 0) AS DECIMAL(10,3)) as promedio_siembra,
      CAST(COALESCE(AVG(cantidad_cosecha), 0) AS DECIMAL(10,3)) as promedio_cosecha
    FROM huerto_data 
    WHERE huerto_id = $1 AND is_deleted = false
  `,

  // Obtener datos de agua para gráficos
  getWaterData: `
    SELECT 
      hd.fecha,
      CAST(CASE 
        WHEN hd.unidad_agua = 'ml' THEN hd.cantidad_agua / 1000
        WHEN hd.unidad_agua = 'l' THEN hd.cantidad_agua
        ELSE hd.cantidad_agua / 1000
      END AS DECIMAL(10,3)) as cantidad,
      hd.cantidad_agua as cantidad_original,
      hd.unidad_agua,
      cs.nombre_siembra
    FROM huerto_data hd
    LEFT JOIN comentarios c ON hd.comentario_id = c.id
    LEFT JOIN comentarios cs ON hd.huerto_siembra_id = cs.id AND cs.tipo_comentario = 'siembra'
    WHERE hd.huerto_id = $1 AND c.tipo_comentario = 'riego' AND hd.cantidad_agua > 0 AND hd.is_deleted = false AND c.is_deleted = false AND hd.fecha IS NOT NULL
    ORDER BY hd.fecha DESC, hd.created_at DESC
    LIMIT 30
  `,

  // Obtener datos de siembra y cosecha
  getPlantingData: `
    SELECT 
      hd.fecha,
      hd.cantidad_siembra,
      hd.cantidad_cosecha,
      hd.comentario_id,
      hd.siembra_relacionada,
      c.tipo_comentario,
      c.fecha_creacion,
      c.contenido,
      c.nombre_siembra
    FROM huerto_data hd
    INNER JOIN comentarios c ON hd.comentario_id = c.id
    WHERE hd.huerto_id = $1 
      AND (hd.cantidad_siembra > 0 OR hd.cantidad_cosecha > 0)
      AND hd.is_deleted = false 
      AND c.is_deleted = false 
      AND hd.fecha IS NOT NULL
      AND c.tipo_comentario IN ('siembra', 'cosecha')
    ORDER BY c.fecha_creacion DESC
    LIMIT 50
  `,

  // Obtener datos de abono
  getFertilizerData: `
    SELECT 
      hd.fecha,
      c.cambio_tierra,
      cs.nombre_siembra,
      COALESCE(SUM(hd.cantidad_abono), 0) as cantidad_abono,
      hd.unidad_abono,
      COUNT(*) as registros
    FROM huerto_data hd
    LEFT JOIN comentarios c ON hd.comentario_id = c.id
    LEFT JOIN comentarios cs ON hd.huerto_siembra_id = cs.id AND cs.tipo_comentario = 'siembra'
    WHERE hd.huerto_id = $1 AND c.tipo_comentario = 'abono' AND hd.is_deleted = false AND c.is_deleted = false AND hd.fecha IS NOT NULL
    GROUP BY hd.fecha, c.cambio_tierra, cs.nombre_siembra, hd.unidad_abono
    ORDER BY hd.fecha DESC
    LIMIT 30
  `,

  // Obtener datos de plagas
  getPestData: `
    SELECT 
      hd.fecha,
      hd.plaga_especie,
      hd.plaga_nivel,
      hd.cantidad_plagas,
      cs.nombre_siembra,
      hd.created_at
    FROM huerto_data hd
    LEFT JOIN comentarios c ON hd.comentario_id = c.id
    LEFT JOIN comentarios cs ON hd.huerto_siembra_id = cs.id AND cs.tipo_comentario = 'siembra'
    WHERE hd.huerto_id = $1 AND c.tipo_comentario = 'plagas' AND hd.is_deleted = false AND c.is_deleted = false AND hd.fecha IS NOT NULL
    ORDER BY hd.fecha DESC, hd.created_at DESC
    LIMIT 30
  `,

  // Obtener comentarios del huerto
  getGardenComments: `
    SELECT 
      tipo_comentario,
      fecha_creacion as fecha,
      contenido
    FROM comentarios 
    WHERE huerto_id = $1 AND is_deleted = false
    ORDER BY fecha_creacion DESC
    LIMIT 100
  `,

  // Obtener comentarios de mantenimiento
  getMaintenanceComments: `
    SELECT 
      DATE(c.fecha_creacion) as fecha,
      c.contenido,
      cs.nombre_siembra,
      hd.cantidad_mantenimiento,
      hd.unidad_mantenimiento
    FROM comentarios c
    LEFT JOIN huerto_data hd ON c.id = hd.comentario_id
    LEFT JOIN comentarios cs ON hd.huerto_siembra_id = cs.id AND cs.tipo_comentario = 'siembra'
    WHERE c.huerto_id = $1 AND c.is_deleted = false AND c.tipo_comentario = 'mantenimiento'
    ORDER BY c.fecha_creacion DESC
    LIMIT 100
  `,

  // ==================== ESTADÍSTICAS DE USUARIO ====================

  // Obtener huertos del usuario
  getUserGardens: `
    SELECT h.* FROM huertos h
    INNER JOIN usuario_huerto uh ON h.id = uh.huerto_id
    WHERE uh.usuario_id = $1 AND h.is_deleted = false
  `,

  // Obtener estadísticas generales del usuario
  getUserStats: `
    SELECT 
      COUNT(DISTINCT h.id) as total_huertos,
      SUM(hd.cantidad_agua) as total_agua_usada,
      SUM(hd.cantidad_siembra) as total_plantas_sembradas,
      SUM(hd.cantidad_cosecha) as total_cosechado,
      SUM(hd.cantidad_abono) as total_abono_usado,
      SUM(hd.cantidad_plagas) as total_tratamientos_plagas
    FROM huertos h
    INNER JOIN usuario_huerto uh ON h.id = uh.huerto_id
    LEFT JOIN huerto_data hd ON h.id = hd.huerto_id AND hd.is_deleted = false
    WHERE uh.usuario_id = $1 AND h.is_deleted = false
  `,

  // Obtener actividad reciente del usuario
  getUserRecentActivity: `
    SELECT 
      hd.*,
      h.nombre as nombre_huerto
    FROM huerto_data hd
    INNER JOIN huertos h ON hd.huerto_id = h.id
    INNER JOIN usuario_huerto uh ON h.id = uh.huerto_id
    WHERE uh.usuario_id = $1 AND hd.is_deleted = false
    ORDER BY hd.created_at DESC
    LIMIT 10
  `,

  // ==================== ESTADÍSTICAS DEL SISTEMA ====================

  // Obtener estadísticas generales del sistema
  getSystemStats: `
    SELECT 
      (SELECT COUNT(*) FROM usuarios WHERE is_deleted = false) as total_usuarios,
      (SELECT COUNT(*) FROM huertos WHERE is_deleted = false) as total_huertos,
      (SELECT COUNT(*) FROM ubicaciones WHERE is_deleted = false) as total_ubicaciones,
      (SELECT COUNT(*) FROM proveedores WHERE is_deleted = false) as total_proveedores,
      (SELECT COUNT(*) FROM inventario WHERE is_deleted = false) as total_inventario
  `,

  // Obtener estadísticas de actividad del sistema
  getSystemActivityStats: `
    SELECT 
      DATE(created_at) as fecha,
      COUNT(*) as registros
    FROM huerto_data 
    WHERE is_deleted = false
    GROUP BY DATE(created_at)
    ORDER BY fecha DESC
    LIMIT 30
  `,

  // Obtener top huertos por actividad
  getTopGardensByActivity: `
    SELECT 
      h.nombre,
      h.ubicacion_id,
      COUNT(hd.id) as total_registros,
      SUM(hd.cantidad_agua) as total_agua,
      SUM(hd.cantidad_siembra) as total_siembra,
      SUM(hd.cantidad_cosecha) as total_cosecha
    FROM huertos h
    LEFT JOIN huerto_data hd ON h.id = hd.huerto_id AND hd.is_deleted = false
    WHERE h.is_deleted = false
    GROUP BY h.id, h.nombre, h.ubicacion_id
    ORDER BY total_registros DESC
    LIMIT 10
  `,

  // ==================== ESTADÍSTICAS DE CRECIMIENTO ====================

  // Obtener datos de crecimiento específicos
  getGrowthData: `
    SELECT 
      hd.*,
      DATE(hd.fecha) as fecha_medicion
    FROM huerto_data hd
    WHERE hd.huerto_id = $1 AND hd.is_deleted = false
    ORDER BY hd.fecha ASC
  `,

  // ==================== ESTADÍSTICAS DE COSECHA ====================

  // Obtener estadísticas de cosecha por huerto
  getHarvestStats: `
    SELECT 
      DATE(fecha) as fecha,
      SUM(cantidad_cosecha) as cosecha_diaria,
      COUNT(*) as registros
    FROM huerto_data 
    WHERE huerto_id = $1 AND cantidad_cosecha > 0 AND is_deleted = false
    GROUP BY DATE(fecha)
    ORDER BY fecha DESC
    LIMIT 90
  `,

  // ==================== ESTADÍSTICAS DE RIEGO ====================

  // Obtener estadísticas de riego por huerto
  getWateringStats: `
    SELECT 
      DATE(fecha) as fecha,
      SUM(
        CASE 
          WHEN unidad_agua = 'ml' THEN cantidad_agua / 1000
          WHEN unidad_agua = 'l' THEN cantidad_agua
          ELSE cantidad_agua / 1000
        END
      ) as agua_diaria,
      COUNT(*) as registros
    FROM huerto_data 
    WHERE huerto_id = $1 AND cantidad_agua > 0 AND is_deleted = false
    GROUP BY DATE(fecha)
    ORDER BY fecha DESC
    LIMIT 90
  `,

  // ==================== ESTADÍSTICAS ESPECÍFICAS ====================

  // Obtener datos de abono con información detallada
  getDetailedFertilizerData: `
    SELECT 
      hd.fecha,
      c.cambio_tierra,
      cs.nombre_siembra,
      COALESCE(SUM(hd.cantidad_abono), 0) as cantidad_abono,
      hd.unidad_abono,
      COUNT(*) as registros
    FROM huerto_data hd
    LEFT JOIN comentarios c ON hd.comentario_id = c.id
    LEFT JOIN comentarios cs ON hd.huerto_siembra_id = cs.id AND cs.tipo_comentario = 'siembra'
    WHERE hd.huerto_id = $1 AND c.tipo_comentario = 'abono' AND hd.is_deleted = false AND c.is_deleted = false AND hd.fecha IS NOT NULL
    GROUP BY hd.fecha, c.cambio_tierra, cs.nombre_siembra, hd.unidad_abono
    ORDER BY hd.fecha DESC
    LIMIT 50
  `,

  // Obtener datos de plagas con información detallada
  getDetailedPestData: `
    SELECT 
      hd.fecha,
      hd.plaga_especie,
      hd.plaga_nivel,
      hd.cantidad_plagas,
      cs.nombre_siembra,
      hd.created_at
    FROM huerto_data hd
    LEFT JOIN comentarios c ON hd.comentario_id = c.id
    LEFT JOIN comentarios cs ON hd.huerto_siembra_id = cs.id AND cs.tipo_comentario = 'siembra'
    WHERE hd.huerto_id = $1 AND c.tipo_comentario = 'plagas' AND hd.is_deleted = false AND c.is_deleted = false AND hd.fecha IS NOT NULL
    ORDER BY hd.fecha DESC, hd.created_at DESC
    LIMIT 50
  `,

  // Obtener datos de agua con información detallada
  getDetailedWaterData: `
    SELECT 
      hd.fecha,
      CAST(CASE 
        WHEN hd.unidad_agua = 'ml' THEN hd.cantidad_agua / 1000
        WHEN hd.unidad_agua = 'l' THEN hd.cantidad_agua
        ELSE hd.cantidad_agua / 1000
      END AS DECIMAL(10,3)) as cantidad,
      hd.cantidad_agua as cantidad_original,
      hd.unidad_agua,
      cs.nombre_siembra
    FROM huerto_data hd
    LEFT JOIN comentarios c ON hd.comentario_id = c.id
    LEFT JOIN comentarios cs ON hd.huerto_siembra_id = cs.id AND cs.tipo_comentario = 'siembra'
    WHERE hd.huerto_id = $1 AND c.tipo_comentario = 'riego' AND hd.cantidad_agua > 0 AND hd.is_deleted = false AND c.is_deleted = false AND hd.fecha IS NOT NULL
    ORDER BY hd.fecha DESC, hd.created_at DESC
    LIMIT 50
  `,

  // ==================== ANÁLISIS CON GEMINI ====================

  // Obtener datos de agua para análisis con Gemini
  getWaterDataForAnalysis: `
    SELECT 
      hd.fecha,
      CAST(CASE 
        WHEN hd.unidad_agua = 'ml' THEN hd.cantidad_agua / 1000
        WHEN hd.unidad_agua = 'l' THEN hd.cantidad_agua
        ELSE hd.cantidad_agua / 1000
      END AS DECIMAL(10,3)) as cantidad,
      hd.unidad_agua,
      cs.nombre_siembra,
      c.contenido as comentario_riego
    FROM huerto_data hd
    LEFT JOIN comentarios c ON hd.comentario_id = c.id
    LEFT JOIN comentarios cs ON hd.huerto_siembra_id = cs.id AND cs.tipo_comentario = 'siembra'
    WHERE hd.huerto_id = $1 AND c.tipo_comentario = 'riego' AND hd.cantidad_agua > 0 AND hd.is_deleted = false AND c.is_deleted = false AND hd.fecha IS NOT NULL
    ORDER BY hd.fecha DESC
    LIMIT 30
  `,

  // Obtener información de siembras actuales
  getCurrentPlantings: `
    SELECT DISTINCT cs.nombre_siembra, cs.fecha_creacion
    FROM comentarios cs
    WHERE cs.huerto_id = $1 AND cs.tipo_comentario = 'siembra' AND cs.is_deleted = false
    ORDER BY cs.fecha_creacion DESC
    LIMIT 10
  `,

  // Obtener datos de abono para análisis con Gemini
  getFertilizerDataForAnalysis: `
    SELECT 
      hd.fecha,
      c.cambio_tierra,
      cs.nombre_siembra,
      COALESCE(SUM(hd.cantidad_abono), 0) as cantidad_abono,
      hd.unidad_abono,
      COUNT(*) as registros,
      c.contenido as comentario_abono
    FROM huerto_data hd
    LEFT JOIN comentarios c ON hd.comentario_id = c.id
    LEFT JOIN comentarios cs ON hd.huerto_siembra_id = cs.id AND cs.tipo_comentario = 'siembra'
    WHERE hd.huerto_id = $1 AND c.tipo_comentario = 'abono' AND hd.is_deleted = false AND c.is_deleted = false AND hd.fecha IS NOT NULL
    GROUP BY hd.fecha, c.cambio_tierra, cs.nombre_siembra, hd.unidad_abono, c.contenido
    ORDER BY hd.fecha DESC
    LIMIT 30
  `,

  // Obtener datos de plagas para análisis con Gemini
  getPestDataForAnalysis: `
    SELECT 
      hd.fecha,
      hd.plaga_especie,
      hd.plaga_nivel,
      hd.cantidad_plagas,
      cs.nombre_siembra,
      hd.created_at,
      c.contenido as comentario_plaga
    FROM huerto_data hd
    LEFT JOIN comentarios c ON hd.comentario_id = c.id
    LEFT JOIN comentarios cs ON hd.huerto_siembra_id = cs.id AND cs.tipo_comentario = 'siembra'
    WHERE hd.huerto_id = $1 AND c.tipo_comentario = 'plagas' AND hd.is_deleted = false AND c.is_deleted = false AND hd.fecha IS NOT NULL
    ORDER BY hd.fecha DESC, hd.created_at DESC
    LIMIT 30
  `,

  // Obtener datos de siembra y cosecha para análisis con Gemini
  getPlantingDataForAnalysis: `
    SELECT 
      hd.fecha,
      hd.cantidad_siembra,
      hd.cantidad_cosecha,
      hd.comentario_id,
      hd.siembra_relacionada,
      c.tipo_comentario,
      c.fecha_creacion,
      c.contenido,
      c.nombre_siembra
    FROM huerto_data hd
    INNER JOIN comentarios c ON hd.comentario_id = c.id
    WHERE hd.huerto_id = $1 
      AND (hd.cantidad_siembra > 0 OR hd.cantidad_cosecha > 0)
      AND hd.is_deleted = false 
      AND c.is_deleted = false 
      AND hd.fecha IS NOT NULL
      AND c.tipo_comentario IN ('siembra', 'cosecha')
    ORDER BY c.fecha_creacion DESC
    LIMIT 50
  `
};


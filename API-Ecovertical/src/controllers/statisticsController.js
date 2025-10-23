import db from '../config/db.js';

export const getGardenStatistics = async (req, res) => {
  try {
    const { gardenId } = req.params;
    
    console.log('🔍 Obteniendo estadísticas para huerto:', gardenId);
    
    // Verificar que el huerto existe
    const [garden] = await db.execute(
      'SELECT * FROM huertos WHERE id = ? AND is_deleted = 0',
      [gardenId]
    );

    if (garden.length === 0) {
      return res.status(404).json({ message: 'Huerto no encontrado' });
    }

    console.log('✅ Huerto encontrado:', garden[0].nombre);

    // Obtener estadísticas del huerto con manejo de NULL y conversión de unidades de agua
    const [stats] = await db.execute(`
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
      WHERE huerto_id = ? AND is_deleted = 0
    `, [gardenId]);

    console.log('📊 Estadísticas básicas obtenidas:', stats[0]);

    // Obtener datos de agua para gráficos (convertidos a litros) - cada registro por separado
    const [waterData] = await db.execute(`
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
      WHERE hd.huerto_id = ? AND c.tipo_comentario = 'riego' AND hd.cantidad_agua > 0 AND hd.is_deleted = 0 AND c.is_deleted = 0 AND hd.fecha IS NOT NULL
      ORDER BY hd.fecha DESC, hd.created_at DESC
      LIMIT 30
    `, [gardenId]);

    console.log('💧 Datos de agua obtenidos:', waterData.length, 'registros');

    // SISTEMA SIMPLIFICADO: Obtener datos directamente sin filtros complejos
    const [plantingData] = await db.execute(`
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
      WHERE hd.huerto_id = ? 
        AND (hd.cantidad_siembra > 0 OR hd.cantidad_cosecha > 0)
        AND hd.is_deleted = 0 
        AND c.is_deleted = 0 
        AND hd.fecha IS NOT NULL
        AND c.tipo_comentario IN ('siembra', 'cosecha')
      ORDER BY c.fecha_creacion DESC
      LIMIT 50
    `, [gardenId]);

    console.log('🌱 Datos obtenidos:', plantingData.length, 'registros');

    // Procesar datos: separar siembras y cosechas, luego combinarlas
    const siembras = plantingData.filter(item => item.tipo_comentario === 'siembra');
    const cosechas = plantingData.filter(item => item.tipo_comentario === 'cosecha');

    console.log('🌱 Siembras encontradas:', siembras.length);
    console.log('✂️ Cosechas encontradas:', cosechas.length);

    // Crear datos combinados
    const combinedPlantingData = siembras.map(siembra => {
      // Buscar cosecha relacionada
      const cosechaRelacionada = cosechas.find(cosecha => 
        cosecha.siembra_relacionada === siembra.comentario_id
      );

      const result = {
        fecha: siembra.fecha,
        siembra: siembra.cantidad_siembra,
        cosecha: cosechaRelacionada ? cosechaRelacionada.cantidad_cosecha : 0,
        siembra_id: siembra.comentario_id,
        cantidad_siembra_individual: siembra.cantidad_siembra,
        cantidad_cosecha_individual: cosechaRelacionada ? cosechaRelacionada.cantidad_cosecha : 0,
        siembra_relacionada: cosechaRelacionada ? cosechaRelacionada.siembra_relacionada : null,
        fecha_cosecha: cosechaRelacionada ? cosechaRelacionada.fecha : null,
        nombre_siembra: siembra.nombre_siembra || null
      };
      
      return result;
    });

    // Obtener datos de abono con información de cambio de tierra y nombre de siembra
    const [fertilizerData] = await db.execute(`
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
      WHERE hd.huerto_id = ? AND c.tipo_comentario = 'abono' AND hd.is_deleted = 0 AND c.is_deleted = 0 AND hd.fecha IS NOT NULL
      GROUP BY hd.fecha, c.cambio_tierra, cs.nombre_siembra, hd.unidad_abono
      ORDER BY hd.fecha DESC
      LIMIT 30
    `, [gardenId]);

    console.log('🌿 Datos de abono obtenidos:', fertilizerData.length, 'registros');

    // Obtener datos de plagas con información detallada (solo de comentarios de plagas)
    const [pestData] = await db.execute(`
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
      WHERE hd.huerto_id = ? AND c.tipo_comentario = 'plagas' AND hd.is_deleted = 0 AND c.is_deleted = 0 AND hd.fecha IS NOT NULL
      ORDER BY hd.fecha DESC, hd.created_at DESC
      LIMIT 30
    `, [gardenId]);

    console.log('🐛 Datos de plagas obtenidos:', pestData.length, 'registros');

    // Obtener datos de comentarios
    console.log('🔍 Buscando comentarios para huerto_id:', gardenId);
    const [commentData] = await db.execute(`
      SELECT 
        tipo_comentario,
        fecha_creacion as fecha,
        contenido
      FROM comentarios 
      WHERE huerto_id = ? AND is_deleted = 0
      ORDER BY fecha_creacion DESC
      LIMIT 100
    `, [gardenId]);
    
    console.log('📊 Comentarios encontrados:', commentData.length);

    // Obtener comentarios de mantenimiento con nombre_siembra y tiempo de mantenimiento
    const [maintenanceComments] = await db.execute(`
      SELECT 
        DATE(c.fecha_creacion) as fecha,
        c.contenido,
        cs.nombre_siembra,
        hd.cantidad_mantenimiento,
        hd.unidad_mantenimiento
      FROM comentarios c
      LEFT JOIN huerto_data hd ON c.id = hd.comentario_id
      LEFT JOIN comentarios cs ON hd.huerto_siembra_id = cs.id AND cs.tipo_comentario = 'siembra'
      WHERE c.huerto_id = ? AND c.is_deleted = 0 AND c.tipo_comentario = 'mantenimiento'
      ORDER BY c.fecha_creacion DESC
      LIMIT 100
    `, [gardenId]);

    // Preparar datos de mantenimiento individuales (no agregados por fecha)
    const maintenanceData = maintenanceComments.map(item => ({
      fecha: new Date(item.fecha).toISOString().split('T')[0],
      contenido: item.contenido || null,
      nombre_siembra: item.nombre_siembra || null,
      cantidad_mantenimiento: item.cantidad_mantenimiento || null,
      unidad_mantenimiento: item.unidad_mantenimiento || null,
      fechaSort: new Date(item.fecha)
    }));

    // Procesar comentarios para generar estadísticas
    console.log('⚙️ Procesando comentarios...');
    const processedData = processCommentData(commentData, waterData, combinedPlantingData, fertilizerData, pestData, stats[0]);
    
    console.log('✅ Datos procesados exitosamente');

    res.json({
      success: true,
      data: {
        garden: garden[0],
        summary: processedData.summary,
        waterData: processedData.waterData,
        plantingData: processedData.plantingData,
        fertilizerData: processedData.fertilizerData,
        pestData: processedData.pestData,
        maintenanceData
      }
    });
  } catch (error) {
    console.error('❌ Error en getGardenStatistics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

export const getUserStatistics = async (req, res) => {
  try {
    const userId = req.user.id; // Asumiendo que tienes middleware de autenticación
    
    // Obtener huertos del usuario
    const [userGardens] = await db.execute(`
      SELECT h.* FROM huertos h
      INNER JOIN usuario_huerto uh ON h.id = uh.huerto_id
      WHERE uh.usuario_id = ? AND h.is_deleted = 0
    `, [userId]);

    // Obtener estadísticas generales del usuario
    const [userStats] = await db.execute(`
      SELECT 
        COUNT(DISTINCT h.id) as total_huertos,
        SUM(hd.cantidad_agua) as total_agua_usada,
        SUM(hd.cantidad_siembra) as total_plantas_sembradas,
        SUM(hd.cantidad_cosecha) as total_cosechado,
        SUM(hd.cantidad_abono) as total_abono_usado,
        SUM(hd.cantidad_plagas) as total_tratamientos_plagas
      FROM huertos h
      INNER JOIN usuario_huerto uh ON h.id = uh.huerto_id
      LEFT JOIN huerto_data hd ON h.id = hd.huerto_id AND hd.is_deleted = 0
      WHERE uh.usuario_id = ? AND h.is_deleted = 0
    `, [userId]);

    // Obtener actividad reciente del usuario
    const [recentActivity] = await db.execute(`
      SELECT 
        hd.*,
        h.nombre as nombre_huerto
      FROM huerto_data hd
      INNER JOIN huertos h ON hd.huerto_id = h.id
      INNER JOIN usuario_huerto uh ON h.id = uh.huerto_id
      WHERE uh.usuario_id = ? AND hd.is_deleted = 0
      ORDER BY hd.created_at DESC
      LIMIT 10
    `, [userId]);

    res.json({
      success: true,
      data: {
        userGardens,
        summary: userStats[0],
        recentActivity: recentActivity.map(item => ({
          ...item,
          fecha: item.fecha ? item.fecha.toISOString().split('T')[0] : null,
          fecha_inicio: item.fecha_inicio ? item.fecha_inicio.toISOString().split('T')[0] : null,
          fecha_final: item.fecha_final ? item.fecha_final.toISOString().split('T')[0] : null
        }))
      }
    });
  } catch (error) {
    console.error('Error en getUserStatistics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

export const getSystemStatistics = async (req, res) => {
  try {
    // Estadísticas generales del sistema
    const [systemStats] = await db.execute(`
      SELECT 
        (SELECT COUNT(*) FROM usuarios WHERE is_deleted = 0) as total_usuarios,
        (SELECT COUNT(*) FROM huertos WHERE is_deleted = 0) as total_huertos,
        (SELECT COUNT(*) FROM ubicaciones WHERE is_deleted = 0) as total_ubicaciones,
        (SELECT COUNT(*) FROM proveedores WHERE is_deleted = 0) as total_proveedores,
        (SELECT COUNT(*) FROM inventario WHERE is_deleted = 0) as total_inventario
    `);

    // Estadísticas de actividad del sistema
    const [activityStats] = await db.execute(`
      SELECT 
        DATE(created_at) as fecha,
        COUNT(*) as registros
      FROM huerto_data 
      WHERE is_deleted = 0
      GROUP BY DATE(created_at)
      ORDER BY fecha DESC
      LIMIT 30
    `);

    // Top huertos por actividad
    const [topGardens] = await db.execute(`
      SELECT 
        h.nombre,
        h.ubicacion_id,
        COUNT(hd.id) as total_registros,
        SUM(hd.cantidad_agua) as total_agua,
        SUM(hd.cantidad_siembra) as total_siembra,
        SUM(hd.cantidad_cosecha) as total_cosecha
      FROM huertos h
      LEFT JOIN huerto_data hd ON h.id = hd.huerto_id AND hd.is_deleted = 0
      WHERE h.is_deleted = 0
      GROUP BY h.id, h.nombre, h.ubicacion_id
      ORDER BY total_registros DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        systemOverview: systemStats[0],
        activityTrend: activityStats.map(item => ({
          ...item,
          fecha: item.fecha.toISOString().split('T')[0]
        })),
        topGardens
      }
    });
  } catch (error) {
    console.error('Error en getSystemStatistics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

export const getGrowthStatistics = async (req, res) => {
  try {
    const { gardenId, plantId } = req.params;
    
    // Obtener datos de crecimiento específicos de una planta en un huerto
    const [growthData] = await db.execute(`
      SELECT 
        hd.*,
        DATE(hd.fecha) as fecha_medicion
      FROM huerto_data hd
      WHERE hd.huerto_id = ? AND hd.is_deleted = 0
      ORDER BY hd.fecha ASC
    `, [gardenId]);

    // Calcular métricas de crecimiento
    const growthMetrics = growthData.map((item, index) => {
      if (index === 0) return { ...item, crecimiento: 0, tasa_crecimiento: 0 };
      
      const previous = growthData[index - 1];
      const crecimiento = (item.cantidad_siembra || 0) - (previous.cantidad_siembra || 0);
      const tasa_crecimiento = previous.cantidad_siembra > 0 ? 
        ((crecimiento / previous.cantidad_siembra) * 100) : 0;
      
      return {
        ...item,
        crecimiento,
        tasa_crecimiento: Math.round(tasa_crecimiento * 100) / 100
      };
    });

    res.json({
      success: true,
      data: {
        gardenId,
        plantId,
        growthData: growthMetrics.map(item => ({
          ...item,
          fecha: item.fecha ? item.fecha.toISOString().split('T')[0] : null,
          fecha_medicion: item.fecha_medicion.toISOString().split('T')[0]
        }))
      }
    });
  } catch (error) {
    console.error('Error en getGrowthStatistics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

export const getHarvestStatistics = async (req, res) => {
  try {
    const { gardenId } = req.params;
    
    // Obtener estadísticas de cosecha por huerto
    const [harvestData] = await db.execute(`
      SELECT 
        DATE(fecha) as fecha,
        SUM(cantidad_cosecha) as cosecha_diaria,
        COUNT(*) as registros
      FROM huerto_data 
      WHERE huerto_id = ? AND cantidad_cosecha > 0 AND is_deleted = 0
      GROUP BY DATE(fecha)
      ORDER BY fecha DESC
      LIMIT 90
    `, [gardenId]);

    // Calcular totales y promedios
    const totalCosecha = harvestData.reduce((sum, item) => sum + item.cosecha_diaria, 0);
    const promedioCosecha = harvestData.length > 0 ? totalCosecha / harvestData.length : 0;
    const maxCosecha = Math.max(...harvestData.map(item => item.cosecha_diaria));

    res.json({
      success: true,
      data: {
        gardenId,
        harvestData: harvestData.map(item => ({
          ...item,
          fecha: item.fecha.toISOString().split('T')[0]
        })),
        summary: {
          totalCosecha,
          promedioCosecha: Math.round(promedioCosecha * 100) / 100,
          maxCosecha,
          totalDias: harvestData.length
        }
      }
    });
  } catch (error) {
    console.error('Error en getHarvestStatistics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

export const getWateringStatistics = async (req, res) => {
  try {
    const { gardenId } = req.params;
    
    // Obtener estadísticas de riego por huerto (convertidos a litros)
    const [wateringData] = await db.execute(`
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
      WHERE huerto_id = ? AND cantidad_agua > 0 AND is_deleted = 0
      GROUP BY DATE(fecha)
      ORDER BY fecha DESC
      LIMIT 90
    `, [gardenId]);

    // Calcular totales y promedios
    const totalAgua = wateringData.reduce((sum, item) => sum + item.agua_diaria, 0);
    const promedioAgua = wateringData.length > 0 ? totalAgua / wateringData.length : 0;
    const maxAgua = Math.max(...wateringData.map(item => item.agua_diaria));

    // Calcular frecuencia de riego
    const frecuenciaRiego = wateringData.length > 0 ? 90 / wateringData.length : 0;

    res.json({
      success: true,
      data: {
        gardenId,
        wateringData: wateringData.map(item => ({
          ...item,
          fecha: item.fecha.toISOString().split('T')[0],
          aguaFormateada: `${item.agua_diaria} L`
        })),
        summary: {
          totalAgua,
          promedioAgua: Math.round(promedioAgua * 100) / 100,
          maxAgua,
          frecuenciaRiego: Math.round(frecuenciaRiego * 100) / 100,
          totalDias: wateringData.length
        }
      }
    });
  } catch (error) {
    console.error('Error en getWateringStatistics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// Función para procesar comentarios y convertirlos en estadísticas
const processCommentData = (commentData, waterData, plantingData, fertilizerData, pestData, initialSummary) => {
  console.log('🔄 Iniciando procesamiento de comentarios...');
  
  // Asegurar que los datos de entrada son arrays válidos
  const safeCommentData = Array.isArray(commentData) ? commentData : [];
  const safeWaterData = Array.isArray(waterData) ? waterData : [];
  const safePlantingData = Array.isArray(plantingData) ? plantingData : [];
  const safeFertilizerData = Array.isArray(fertilizerData) ? fertilizerData : [];
  const safePestData = Array.isArray(pestData) ? pestData : [];
  const safeInitialSummary = initialSummary || {};
  
  console.log('📊 Datos de entrada:', {
    commentDataLength: safeCommentData.length,
    waterDataLength: safeWaterData.length,
    plantingDataLength: safePlantingData.length,
    fertilizerDataLength: safeFertilizerData.length,
    pestDataLength: safePestData.length
  });
  
  // Agrupar comentarios por tipo y fecha
  const commentsByType = {};
  const commentsByDate = {};
  
  safeCommentData.forEach(comment => {
    if (!comment || !comment.tipo_comentario || !comment.fecha) return;
    
    const tipo = comment.tipo_comentario;
    const fecha = new Date(comment.fecha).toISOString().split('T')[0];
    
    if (!commentsByType[tipo]) {
      commentsByType[tipo] = [];
    }
    if (!commentsByDate[fecha]) {
      commentsByDate[fecha] = [];
    }
    
    commentsByType[tipo].push(comment);
    commentsByDate[fecha].push(comment);
  });
  
  console.log('📋 Comentarios agrupados por tipo:', Object.keys(commentsByType));

  // Procesar datos de agua basados en comentarios de riego
  const processedWaterData = processWaterDataFromComments(commentsByType['riego'] || [], safeWaterData);
  
  // Procesar datos de siembra basados en comentarios de siembra
  const processedPlantingData = processPlantingDataFromComments(commentsByType['siembra'] || [], safePlantingData);
  
  // Procesar datos de abono basados en comentarios de abono
  const processedFertilizerData = processFertilizerDataFromComments(commentsByType['abono'] || [], safeFertilizerData);
  
  // Procesar datos de plagas basados en comentarios de plagas
  const processedPestData = processPestDataFromComments(commentsByType['plagas'] || [], safePestData);

  // Usar directamente las estadísticas del backend sin procesamiento adicional
  const summary = {
    total_registros: parseFloat(safeInitialSummary.total_registros) || 0,
    total_agua: parseFloat(safeInitialSummary.total_agua) || 0,
    total_siembra: parseFloat(safeInitialSummary.total_siembra) || 0,
    total_cosecha: parseFloat(safeInitialSummary.total_cosecha) || 0,
    total_abono: parseFloat(safeInitialSummary.total_abono) || 0,
    total_plagas: parseFloat(safeInitialSummary.total_plagas) || 0,
    promedio_agua: parseFloat(safeInitialSummary.promedio_agua) || 0,
    promedio_siembra: parseFloat(safeInitialSummary.promedio_siembra) || 0,
    promedio_cosecha: parseFloat(safeInitialSummary.promedio_cosecha) || 0
  };

  console.log('📈 Resumen final calculado');
  console.log('💧 Datos de agua procesados:', processedWaterData.length);
  console.log('🌱 Datos de siembra procesados:', processedPlantingData.length);
  console.log('🌿 Datos de abono procesados:', processedFertilizerData.length);
  console.log('🐛 Datos de plagas procesados:', processedPestData.length);
  
  const result = {
    summary,
    waterData: processedWaterData,
    plantingData: processedPlantingData,
    fertilizerData: processedFertilizerData,
    pestData: processedPestData
  };
  
  return result;
};

// Función para procesar datos de agua desde comentarios
const processWaterDataFromComments = (riegoComments, existingWaterData) => {
  // Retornar directamente los datos existentes sin procesar comentarios
  // Los datos ya vienen correctamente del backend con registros individuales
  if (Array.isArray(existingWaterData)) {
    return existingWaterData.map(item => ({
      fecha: new Date(item.fecha).toISOString().split('T')[0],
      cantidad: parseFloat(item.cantidad) || 0,
      cantidadFormateada: `${parseFloat(item.cantidad) || 0} L`,
      nombre_siembra: item.nombre_siembra || null,
      fechaSort: new Date(item.fecha)
    })).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }
  
  return [];
};

// Función para procesar datos de siembra desde comentarios
const processPlantingDataFromComments = (siembraComments, existingPlantingData) => {
  // RETORNAR DIRECTAMENTE LOS DATOS EXISTENTES SIN NINGÚN PROCESAMIENTO
  // Los datos ya vienen correctamente del backend
  if (Array.isArray(existingPlantingData) && existingPlantingData.length > 0) {
    return existingPlantingData;
  }
  
  // Si no hay datos existentes, retornar array vacío
  return [];
};

// Función para procesar datos de abono desde comentarios
const processFertilizerDataFromComments = (abonoComments, existingFertilizerData) => {
  // Usar datos existentes directamente ya que vienen del backend con la estructura correcta
  if (Array.isArray(existingFertilizerData) && existingFertilizerData.length > 0) {
    return existingFertilizerData.map(item => ({
      fecha: new Date(item.fecha).toISOString().split('T')[0],
      cambio_tierra: item.cambio_tierra || null,
      nombre_siembra: item.nombre_siembra || null,
      cantidad_abono: parseFloat(item.cantidad_abono) || 0,
      unidad_abono: item.unidad_abono || 'kg',
      registros: parseInt(item.registros) || 1,
      fechaSort: new Date(item.fecha)
    }));
  }
  
  // Si no hay datos existentes, procesar comentarios
  if (!Array.isArray(abonoComments) || abonoComments.length === 0) {
    return [];
  }
  
  const fertilizerDataMap = new Map();
  
  // Procesar comentarios de abono
  abonoComments.forEach(comment => {
    if (!comment || !comment.fecha) return;
    const fecha = new Date(comment.fecha).toISOString().split('T')[0];
    const existing = fertilizerDataMap.get(fecha) || { 
      fecha: fecha, 
      cambio_tierra: null,
      nombre_siembra: null,
      cantidad_abono: 0, 
      registros: 0,
      fechaSort: new Date(fecha) 
    };
    
    existing.registros += 1;
    
    // Extraer cantidad de abono del contenido del comentario
    if (comment.contenido) {
      const abonoMatch = comment.contenido.match(/(\d+(?:\.\d+)?)\s*(?:kg|g|gramos?|kilos?)/i);
      if (abonoMatch) {
        const cantidad = parseFloat(abonoMatch[1]);
        existing.cantidad_abono += cantidad;
      } else {
        existing.cantidad_abono += 2; // 2kg por defecto
      }
    }
    
    fertilizerDataMap.set(fecha, existing);
  });
  
  return Array.from(fertilizerDataMap.values()).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
};

// Función para procesar datos de plagas desde comentarios
const processPestDataFromComments = (plagasComments, existingPestData) => {
  // Usar datos existentes directamente ya que vienen del backend con la estructura correcta
  if (Array.isArray(existingPestData) && existingPestData.length > 0) {
    return existingPestData.map(item => ({
      fecha: new Date(item.fecha).toISOString().split('T')[0],
      plaga_especie: item.plaga_especie || 'No especificada',
      plaga_nivel: item.plaga_nivel || 'No especificado',
      cantidad_plagas: parseFloat(item.cantidad_plagas) || 0,
      nombre_siembra: item.nombre_siembra || null,
      incidencias: 1, // Cada registro es una incidencia
      fechaSort: new Date(item.fecha)
    }));
  }
  
  // Si no hay datos existentes, procesar comentarios
  if (!Array.isArray(plagasComments) || plagasComments.length === 0) {
    return [];
  }
  
  const pestDataMap = new Map();
  
  // Procesar comentarios de plagas
  plagasComments.forEach(comment => {
    if (!comment || !comment.fecha) return;
    const fecha = new Date(comment.fecha).toISOString().split('T')[0];
    const existing = pestDataMap.get(fecha) || { 
      fecha: fecha, 
      plaga_especie: 'No especificada',
      plaga_nivel: 'No especificado',
      cantidad_plagas: 0,
      nombre_siembra: null,
      incidencias: 0,
      fechaSort: new Date(fecha) 
    };
    
    // Contar incidencias de plagas
    existing.incidencias += 1;
    existing.cantidad_plagas += 1;
    
    pestDataMap.set(fecha, existing);
  });
  
  return Array.from(pestDataMap.values()).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
};

// GET /api/statistics/fertilizer/:gardenId - Datos de abono con cambio de tierra y nombre de siembra
export const getFertilizerStatistics = async (req, res) => {
  try {
    const { gardenId } = req.params;
    
    console.log('🌿 Obteniendo estadísticas de abono para huerto:', gardenId);
    
    // Verificar que el huerto existe
    const [garden] = await db.execute(
      'SELECT * FROM huertos WHERE id = ? AND is_deleted = 0',
      [gardenId]
    );

    if (garden.length === 0) {
      return res.status(404).json({ message: 'Huerto no encontrado' });
    }

    // Obtener datos de abono con información de cambio de tierra y nombre de siembra
    const [fertilizerData] = await db.execute(`
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
      WHERE hd.huerto_id = ? AND c.tipo_comentario = 'abono' AND hd.is_deleted = 0 AND c.is_deleted = 0 AND hd.fecha IS NOT NULL
      GROUP BY hd.fecha, c.cambio_tierra, cs.nombre_siembra, hd.unidad_abono
      ORDER BY hd.fecha DESC
      LIMIT 50
    `, [gardenId]);

    console.log('🌿 Datos de abono obtenidos:', fertilizerData.length, 'registros');

    // Procesar datos para el frontend
    const processedData = fertilizerData.map(item => ({
      fecha: new Date(item.fecha).toISOString().split('T')[0],
      cambio_tierra: item.cambio_tierra || null,
      nombre_siembra: item.nombre_siembra || null,
      cantidad_abono: parseFloat(item.cantidad_abono) || 0,
      unidad_abono: item.unidad_abono || 'kg',
      registros: parseInt(item.registros) || 1,
      fechaSort: new Date(item.fecha)
    }));

    res.json({
      success: true,
      data: {
        garden: garden[0],
        fertilizerData: processedData,
        total: processedData.length
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener estadísticas de abono:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// GET /api/statistics/pests/:gardenId - Datos de plagas con nombre de siembra
export const getPestStatistics = async (req, res) => {
  try {
    const { gardenId } = req.params;
    
    console.log('🐛 Obteniendo estadísticas de plagas para huerto:', gardenId);
    
    // Verificar que el huerto existe
    const [garden] = await db.execute(
      'SELECT * FROM huertos WHERE id = ? AND is_deleted = 0',
      [gardenId]
    );

    if (garden.length === 0) {
      return res.status(404).json({ message: 'Huerto no encontrado' });
    }

    // Obtener datos de plagas con información detallada
    const [pestData] = await db.execute(`
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
      WHERE hd.huerto_id = ? AND c.tipo_comentario = 'plagas' AND hd.is_deleted = 0 AND c.is_deleted = 0 AND hd.fecha IS NOT NULL
      ORDER BY hd.fecha DESC, hd.created_at DESC
      LIMIT 50
    `, [gardenId]);

    console.log('🐛 Datos de plagas obtenidos:', pestData.length, 'registros');

    // Procesar datos para el frontend
    const processedData = pestData.map(item => ({
      fecha: new Date(item.fecha).toISOString().split('T')[0],
      plaga_especie: item.plaga_especie || 'No especificada',
      plaga_nivel: item.plaga_nivel || 'No especificado',
      cantidad_plagas: parseFloat(item.cantidad_plagas) || 0,
      nombre_siembra: item.nombre_siembra || null,
      incidencias: 1,
      fechaSort: new Date(item.fecha)
    }));

    res.json({
      success: true,
      data: {
        garden: garden[0],
        pestData: processedData,
        total: processedData.length
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener estadísticas de plagas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// GET /api/statistics/water/:gardenId - Datos de agua con nombre de siembra
export const getWaterStatistics = async (req, res) => {
  try {
    const { gardenId } = req.params;
    
    console.log('💧 Obteniendo estadísticas de agua para huerto:', gardenId);
    
    // Verificar que el huerto existe
    const [garden] = await db.execute(
      'SELECT * FROM huertos WHERE id = ? AND is_deleted = 0',
      [gardenId]
    );

    if (garden.length === 0) {
      return res.status(404).json({ message: 'Huerto no encontrado' });
    }

    // Obtener datos de agua con nombre de siembra
    const [waterData] = await db.execute(`
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
      WHERE hd.huerto_id = ? AND c.tipo_comentario = 'riego' AND hd.cantidad_agua > 0 AND hd.is_deleted = 0 AND c.is_deleted = 0 AND hd.fecha IS NOT NULL
      ORDER BY hd.fecha DESC, hd.created_at DESC
      LIMIT 50
    `, [gardenId]);

    console.log('💧 Datos de agua obtenidos:', waterData.length, 'registros');

    // Procesar datos para el frontend
    const processedData = waterData.map((item, index) => ({
      fecha: new Date(item.fecha).toISOString().split('T')[0],
      cantidad: parseFloat(item.cantidad) || 0,
      cantidadMl: Math.round(((parseFloat(item.cantidad) || 0) * 1000)),
      cantidadFormateada: `${Math.round(((parseFloat(item.cantidad) || 0) * 1000))} mL`,
      nombre_siembra: item.nombre_siembra || null,
      fechaSort: new Date(item.fecha),
      id: `${item.fecha}_${index}_${item.cantidad}`
    }));

    res.json({
      success: true,
      data: {
        garden: garden[0],
        waterData: processedData,
        total: processedData.length
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener estadísticas de agua:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// --- NUEVOS ENDPOINTS PARA ANÁLISIS INDIVIDUALES CON GEMINI ---

// POST /api/statistics/water/:gardenId/analyze - Análisis específico de agua con Gemini
export const analyzeWaterStatistics = async (req, res) => {
  try {
    const { gardenId } = req.params;
    console.log('🤖 Analizando estadísticas de agua para huerto:', gardenId);
    
    // Verificar que el huerto existe
    const [garden] = await db.execute(
      'SELECT * FROM huertos WHERE id = ? AND is_deleted = 0',
      [gardenId]
    );

    if (garden.length === 0) {
      return res.status(404).json({ message: 'Huerto no encontrado' });
    }

    // Obtener datos de agua con información detallada
    const [waterData] = await db.execute(`
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
      WHERE hd.huerto_id = ? AND c.tipo_comentario = 'riego' AND hd.cantidad_agua > 0 AND hd.is_deleted = 0 AND c.is_deleted = 0 AND hd.fecha IS NOT NULL
      ORDER BY hd.fecha DESC
      LIMIT 30
    `, [gardenId]);

    // Obtener información de siembras actuales
    const [currentPlantings] = await db.execute(`
      SELECT DISTINCT cs.nombre_siembra, cs.fecha_creacion
      FROM comentarios cs
      WHERE cs.huerto_id = ? AND cs.tipo_comentario = 'siembra' AND cs.is_deleted = 0
      ORDER BY cs.fecha_creacion DESC
      LIMIT 10
    `, [gardenId]);

    // Calcular estadísticas básicas
    const totalAgua = waterData.reduce((sum, item) => sum + parseFloat(item.cantidad), 0);
    const promedioAgua = waterData.length > 0 ? totalAgua / waterData.length : 0;
    const frecuenciaRiego = waterData.length > 0 ? 30 / waterData.length : 0;

    // Preparar datos para Gemini
    const geminiData = {
      huerto: {
        nombre: garden[0].nombre,
        ubicacion: garden[0].ubicacion_id
      },
      siembras_actuales: currentPlantings.map(p => p.nombre_siembra),
      estadisticas_riego: {
        total_registros: waterData.length,
        total_agua_litros: totalAgua.toFixed(2),
        promedio_por_riego: promedioAgua.toFixed(2),
        frecuencia_dias: frecuenciaRiego.toFixed(1),
        ultimos_registros: waterData.slice(0, 10).map(item => ({
          fecha: new Date(item.fecha).toISOString().split('T')[0],
          cantidad_litros: parseFloat(item.cantidad).toFixed(2),
          unidad_original: item.unidad_agua,
          siembra: item.nombre_siembra || 'No especificada',
          comentario: item.comentario_riego || 'Sin comentario'
        }))
      }
    };

    // Consultar a Gemini
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ message: 'GEMINI_API_KEY no configurado' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });

    const prompt = `Analiza estos datos de riego de un huerto urbano y proporciona un análisis específico sobre el uso del agua:

HUERTO: ${geminiData.huerto.nombre}
SIEMBRAS ACTUALES: ${geminiData.siembras_actuales.join(', ') || 'No hay siembras registradas'}

ESTADÍSTICAS DE RIEGO:
- Total de registros: ${geminiData.estadisticas_riego.total_registros}
- Total de agua usada: ${geminiData.estadisticas_riego.total_agua_litros} litros
- Promedio por riego: ${geminiData.estadisticas_riego.promedio_por_riego} litros
- Frecuencia de riego: cada ${geminiData.estadisticas_riego.frecuencia_dias} días

ÚLTIMOS REGISTROS:
${JSON.stringify(geminiData.estadisticas_riego.ultimos_registros, null, 2)}

Por favor proporciona:
1. **Análisis del patrón de riego** (regularidad, cantidad adecuada)
2. **Eficiencia del uso del agua** (comparado con las siembras actuales)
3. **Recomendaciones específicas** para optimizar el riego
4. **Alertas importantes** sobre el uso del agua
5. **Sugerencias de mejora** basadas en las plantas sembradas

Responde en español de manera clara y práctica, enfocándote específicamente en el riego.`;

    console.log('🤖 Enviando análisis de agua a Gemini...');
    const response = await model.generateContent(prompt);
    const analysis = response.response.text();

    res.json({
      success: true,
      data: {
        garden: garden[0],
        statistics: geminiData.estadisticas_riego,
        analysis: analysis.trim(),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error en análisis de agua:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al analizar estadísticas de agua',
      error: error.message 
    });
  }
};

// POST /api/statistics/fertilizer/:gardenId/analyze - Análisis específico de abono con Gemini
export const analyzeFertilizerStatistics = async (req, res) => {
  try {
    const { gardenId } = req.params;
    console.log('🤖 Analizando estadísticas de abono para huerto:', gardenId);
    
    // Verificar que el huerto existe
    const [garden] = await db.execute(
      'SELECT * FROM huertos WHERE id = ? AND is_deleted = 0',
      [gardenId]
    );

    if (garden.length === 0) {
      return res.status(404).json({ message: 'Huerto no encontrado' });
    }

    // Obtener datos de abono con información detallada
    const [fertilizerData] = await db.execute(`
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
      WHERE hd.huerto_id = ? AND c.tipo_comentario = 'abono' AND hd.is_deleted = 0 AND c.is_deleted = 0 AND hd.fecha IS NOT NULL
      GROUP BY hd.fecha, c.cambio_tierra, cs.nombre_siembra, hd.unidad_abono, c.contenido
      ORDER BY hd.fecha DESC
      LIMIT 30
    `, [gardenId]);

    // Obtener información de siembras actuales
    const [currentPlantings] = await db.execute(`
      SELECT DISTINCT cs.nombre_siembra, cs.fecha_creacion
      FROM comentarios cs
      WHERE cs.huerto_id = ? AND cs.tipo_comentario = 'siembra' AND cs.is_deleted = 0
      ORDER BY cs.fecha_creacion DESC
      LIMIT 10
    `, [gardenId]);

    // Calcular estadísticas básicas
    const totalAbono = fertilizerData.reduce((sum, item) => sum + parseFloat(item.cantidad_abono), 0);
    const promedioAbono = fertilizerData.length > 0 ? totalAbono / fertilizerData.length : 0;
    const cambiosTierra = fertilizerData.filter(item => item.cambio_tierra === 1).length;

    // Preparar datos para Gemini
    const geminiData = {
      huerto: {
        nombre: garden[0].nombre,
        ubicacion: garden[0].ubicacion_id
      },
      siembras_actuales: currentPlantings.map(p => p.nombre_siembra),
      estadisticas_abono: {
        total_registros: fertilizerData.length,
        total_abono: totalAbono.toFixed(2),
        promedio_por_aplicacion: promedioAbono.toFixed(2),
        cambios_tierra: cambiosTierra,
        ultimos_registros: fertilizerData.slice(0, 10).map(item => ({
          fecha: new Date(item.fecha).toISOString().split('T')[0],
          cantidad: parseFloat(item.cantidad_abono).toFixed(2),
          unidad: item.unidad_abono,
          siembra: item.nombre_siembra || 'No especificada',
          cambio_tierra: item.cambio_tierra ? 'Sí' : 'No',
          comentario: item.comentario_abono || 'Sin comentario'
        }))
      }
    };

    // Consultar a Gemini
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ message: 'GEMINI_API_KEY no configurado' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });

    const prompt = `Analiza estos datos de fertilización de un huerto urbano y proporciona un análisis específico sobre el uso de abonos:

HUERTO: ${geminiData.huerto.nombre}
SIEMBRAS ACTUALES: ${geminiData.siembras_actuales.join(', ') || 'No hay siembras registradas'}

ESTADÍSTICAS DE FERTILIZACIÓN:
- Total de aplicaciones: ${geminiData.estadisticas_abono.total_registros}
- Total de abono usado: ${geminiData.estadisticas_abono.total_abono} ${fertilizerData[0]?.unidad_abono || 'kg'}
- Promedio por aplicación: ${geminiData.estadisticas_abono.promedio_por_aplicacion} ${fertilizerData[0]?.unidad_abono || 'kg'}
- Cambios de tierra realizados: ${geminiData.estadisticas_abono.cambios_tierra}

ÚLTIMOS REGISTROS:
${JSON.stringify(geminiData.estadisticas_abono.ultimos_registros, null, 2)}

Por favor proporciona:
1. **Análisis del programa de fertilización** (frecuencia, cantidades)
2. **Eficiencia del uso de abonos** (relación con las plantas sembradas)
3. **Evaluación de los cambios de tierra** (si son necesarios o excesivos)
4. **Recomendaciones específicas** para cada tipo de planta
5. **Calendario sugerido** de fertilización basado en las siembras actuales
6. **Alertas sobre sobrefertilización** o deficiencias nutricionales

Responde en español de manera clara y práctica, enfocándote específicamente en la fertilización.`;

    console.log('🤖 Enviando análisis de abono a Gemini...');
    const response = await model.generateContent(prompt);
    const analysis = response.response.text();

    res.json({
      success: true,
      data: {
        garden: garden[0],
        statistics: geminiData.estadisticas_abono,
        analysis: analysis.trim(),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error en análisis de abono:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al analizar estadísticas de abono',
      error: error.message 
    });
  }
};

// POST /api/statistics/pests/:gardenId/analyze - Análisis específico de plagas con Gemini
export const analyzePestStatistics = async (req, res) => {
  try {
    const { gardenId } = req.params;
    console.log('🤖 Analizando estadísticas de plagas para huerto:', gardenId);
    
    // Verificar que el huerto existe
    const [garden] = await db.execute(
      'SELECT * FROM huertos WHERE id = ? AND is_deleted = 0',
      [gardenId]
    );

    if (garden.length === 0) {
      return res.status(404).json({ message: 'Huerto no encontrado' });
    }

    // Obtener datos de plagas con información detallada
    const [pestData] = await db.execute(`
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
      WHERE hd.huerto_id = ? AND c.tipo_comentario = 'plagas' AND hd.is_deleted = 0 AND c.is_deleted = 0 AND hd.fecha IS NOT NULL
      ORDER BY hd.fecha DESC, hd.created_at DESC
      LIMIT 30
    `, [gardenId]);

    // Obtener información de siembras actuales
    const [currentPlantings] = await db.execute(`
      SELECT DISTINCT cs.nombre_siembra, cs.fecha_creacion
      FROM comentarios cs
      WHERE cs.huerto_id = ? AND cs.tipo_comentario = 'siembra' AND cs.is_deleted = 0
      ORDER BY cs.fecha_creacion DESC
      LIMIT 10
    `, [gardenId]);

    // Calcular estadísticas básicas
    const totalIncidencias = pestData.length;
    const plagasPorEspecie = pestData.reduce((acc, item) => {
      const especie = item.plaga_especie || 'No especificada';
      acc[especie] = (acc[especie] || 0) + 1;
      return acc;
    }, {});

    // Preparar datos para Gemini
    const geminiData = {
      huerto: {
        nombre: garden[0].nombre,
        ubicacion: garden[0].ubicacion_id
      },
      siembras_actuales: currentPlantings.map(p => p.nombre_siembra),
      estadisticas_plagas: {
        total_incidencias: totalIncidencias,
        especies_detectadas: Object.keys(plagasPorEspecie),
        plagas_por_especie: plagasPorEspecie,
        ultimos_registros: pestData.slice(0, 10).map(item => ({
          fecha: new Date(item.fecha).toISOString().split('T')[0],
          especie: item.plaga_especie || 'No especificada',
          nivel: item.plaga_nivel || 'No especificado',
          cantidad: item.cantidad_plagas,
          siembra: item.nombre_siembra || 'No especificada',
          comentario: item.comentario_plaga || 'Sin comentario'
        }))
      }
    };

    // Consultar a Gemini
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ message: 'GEMINI_API_KEY no configurado' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });

    const prompt = `Analiza estos datos de plagas de un huerto urbano y proporciona un análisis específico sobre el control de plagas:

HUERTO: ${geminiData.huerto.nombre}
SIEMBRAS ACTUALES: ${geminiData.siembras_actuales.join(', ') || 'No hay siembras registradas'}

ESTADÍSTICAS DE PLAGAS:
- Total de incidencias: ${geminiData.estadisticas_plagas.total_incidencias}
- Especies detectadas: ${geminiData.estadisticas_plagas.especies_detectadas.join(', ') || 'Ninguna'}
- Distribución por especie: ${JSON.stringify(geminiData.estadisticas_plagas.plagas_por_especie)}

ÚLTIMOS REGISTROS:
${JSON.stringify(geminiData.estadisticas_plagas.ultimos_registros, null, 2)}

Por favor proporciona:
1. **Análisis del patrón de plagas** (frecuencia, especies más comunes)
2. **Evaluación del nivel de riesgo** para cada tipo de planta sembrada
3. **Recomendaciones de prevención** específicas para las plantas actuales
4. **Tratamientos sugeridos** para las plagas detectadas
5. **Calendario de monitoreo** basado en las siembras actuales
6. **Alertas importantes** sobre plagas que afectan específicamente a las plantas sembradas
7. **Métodos orgánicos** de control recomendados

Responde en español de manera clara y práctica, enfocándote específicamente en el control de plagas.`;

    console.log('🤖 Enviando análisis de plagas a Gemini...');
    const response = await model.generateContent(prompt);
    const analysis = response.response.text();

    res.json({
      success: true,
      data: {
        garden: garden[0],
        statistics: geminiData.estadisticas_plagas,
        analysis: analysis.trim(),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error en análisis de plagas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al analizar estadísticas de plagas',
      error: error.message 
    });
  }
};

// POST /api/statistics/planting/:gardenId/analyze - Análisis específico de siembra/cosecha con Gemini
export const analyzePlantingStatistics = async (req, res) => {
  try {
    const { gardenId } = req.params;
    console.log('🤖 Analizando estadísticas de siembra/cosecha para huerto:', gardenId);
    
    // Verificar que el huerto existe
    const [garden] = await db.execute(
      'SELECT * FROM huertos WHERE id = ? AND is_deleted = 0',
      [gardenId]
    );

    if (garden.length === 0) {
      return res.status(404).json({ message: 'Huerto no encontrado' });
    }

    // Obtener datos de siembra y cosecha
    const [plantingData] = await db.execute(`
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
      WHERE hd.huerto_id = ? 
        AND (hd.cantidad_siembra > 0 OR hd.cantidad_cosecha > 0)
        AND hd.is_deleted = 0 
        AND c.is_deleted = 0 
        AND hd.fecha IS NOT NULL
        AND c.tipo_comentario IN ('siembra', 'cosecha')
      ORDER BY c.fecha_creacion DESC
      LIMIT 50
    `, [gardenId]);

    // Procesar datos: separar siembras y cosechas
    const siembras = plantingData.filter(item => item.tipo_comentario === 'siembra');
    const cosechas = plantingData.filter(item => item.tipo_comentario === 'cosecha');

    // Crear datos combinados
    const combinedData = siembras.map(siembra => {
      const cosechaRelacionada = cosechas.find(cosecha => 
        cosecha.siembra_relacionada === siembra.comentario_id
      );

      return {
        fecha_siembra: new Date(siembra.fecha).toISOString().split('T')[0],
        fecha_cosecha: cosechaRelacionada ? new Date(cosechaRelacionada.fecha).toISOString().split('T')[0] : null,
        nombre_siembra: siembra.nombre_siembra || 'No especificada',
        cantidad_sembrada: siembra.cantidad_siembra,
        cantidad_cosechada: cosechaRelacionada ? cosechaRelacionada.cantidad_cosecha : 0,
        comentario_siembra: siembra.contenido || 'Sin comentario',
        comentario_cosecha: cosechaRelacionada ? cosechaRelacionada.contenido : null,
        dias_crecimiento: cosechaRelacionada ? 
          Math.ceil((new Date(cosechaRelacionada.fecha) - new Date(siembra.fecha)) / (1000 * 60 * 60 * 24)) : null
      };
    });

    // Calcular estadísticas básicas
    const totalSiembras = siembras.length;
    const totalCosechas = cosechas.length;
    const plantasSembradas = siembras.reduce((sum, item) => sum + item.cantidad_siembra, 0);
    const plantasCosechadas = cosechas.reduce((sum, item) => sum + item.cantidad_cosecha, 0);
    const eficienciaCosecha = plantasSembradas > 0 ? (plantasCosechadas / plantasSembradas * 100).toFixed(1) : 0;

    // Preparar datos para Gemini
    const geminiData = {
      huerto: {
        nombre: garden[0].nombre,
        ubicacion: garden[0].ubicacion_id
      },
      estadisticas_siembra: {
        total_siembras: totalSiembras,
        total_cosechas: totalCosechas,
        plantas_sembradas: plantasSembradas,
        plantas_cosechadas: plantasCosechadas,
        eficiencia_cosecha: eficienciaCosecha + '%',
        datos_combinados: combinedData.slice(0, 15)
      }
    };

    // Consultar a Gemini
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ message: 'GEMINI_API_KEY no configurado' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });

    const prompt = `Analiza estos datos de siembra y cosecha de un huerto urbano y proporciona un análisis específico sobre la productividad:

HUERTO: ${geminiData.huerto.nombre}

ESTADÍSTICAS DE SIEMBRA Y COSECHA:
- Total de siembras: ${geminiData.estadisticas_siembra.total_siembras}
- Total de cosechas: ${geminiData.estadisticas_siembra.total_cosechas}
- Plantas sembradas: ${geminiData.estadisticas_siembra.plantas_sembradas}
- Plantas cosechadas: ${geminiData.estadisticas_siembra.plantas_cosechadas}
- Eficiencia de cosecha: ${geminiData.estadisticas_siembra.eficiencia_cosecha}

DATOS DETALLADOS:
${JSON.stringify(geminiData.estadisticas_siembra.datos_combinados, null, 2)}

Por favor proporciona:
1. **Análisis de la productividad** del huerto (eficiencia de cosecha)
2. **Evaluación de las plantas sembradas** (variedades, rendimiento)
3. **Recomendaciones de siembra** basadas en el rendimiento histórico
4. **Calendario óptimo** de siembra y cosecha
5. **Sugerencias de rotación** de cultivos
6. **Identificación de plantas más productivas** para este huerto
7. **Recomendaciones de mejoras** en técnicas de cultivo
8. **Alertas sobre problemas** de crecimiento o cosecha

Responde en español de manera clara y práctica, enfocándote específicamente en la productividad y eficiencia del cultivo.`;

    console.log('🤖 Enviando análisis de siembra/cosecha a Gemini...');
    const response = await model.generateContent(prompt);
    const analysis = response.response.text();

    res.json({
      success: true,
      data: {
        garden: garden[0],
        statistics: geminiData.estadisticas_siembra,
        analysis: analysis.trim(),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error en análisis de siembra/cosecha:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al analizar estadísticas de siembra/cosecha',
      error: error.message 
    });
  }
};
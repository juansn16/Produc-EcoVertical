import db from '../config/db.js';
import { StatisticsQueries } from '../utils/queries/index.js';

export const getGardenStatistics = async (req, res) => {
  try {
    const { gardenId } = req.params;
    
    console.log('🔍 Obteniendo estadísticas para huerto:', gardenId);
    
    // Verificar que el huerto existe
    const gardenResult = await db.query(StatisticsQueries.checkGardenExists, [gardenId]);

    if (gardenResult.rows.length === 0) {
      return res.status(404).json({ message: 'Huerto no encontrado' });
    }

    console.log('✅ Huerto encontrado:', gardenResult.rows[0].nombre);

    // Obtener estadísticas del huerto con manejo de NULL y conversión de unidades de agua
    const statsResult = await db.query(StatisticsQueries.getGardenBasicStats, [gardenId]);

    console.log('📊 Estadísticas básicas obtenidas:', statsResult.rows[0]);

    // Obtener datos de agua para gráficos (convertidos a litros) - cada registro por separado
    const waterDataResult = await db.query(StatisticsQueries.getWaterData, [gardenId]);

    console.log('💧 Datos de agua obtenidos:', waterDataResult.rows.length, 'registros');

    // SISTEMA SIMPLIFICADO: Obtener datos directamente sin filtros complejos
    const plantingDataResult = await db.query(StatisticsQueries.getPlantingData, [gardenId]);

    console.log('🌱 Datos obtenidos:', plantingDataResult.rows.length, 'registros');

    // Procesar datos: separar siembras y cosechas, luego combinarlas
    const siembras = plantingDataResult.rows.filter(item => item.tipo_comentario === 'siembra');
    const cosechas = plantingDataResult.rows.filter(item => item.tipo_comentario === 'cosecha');

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
    const fertilizerDataResult = await db.query(StatisticsQueries.getFertilizerData, [gardenId]);

    console.log('🌿 Datos de abono obtenidos:', fertilizerDataResult.rows.length, 'registros');

    // Obtener datos de plagas con información detallada (solo de comentarios de plagas)
    const pestDataResult = await db.query(StatisticsQueries.getPestData, [gardenId]);

    console.log('🐛 Datos de plagas obtenidos:', pestDataResult.rows.length, 'registros');

    // Obtener datos de comentarios
    console.log('🔍 Buscando comentarios para huerto_id:', gardenId);
    const commentDataResult = await db.query(StatisticsQueries.getGardenComments, [gardenId]);
    
    console.log('📊 Comentarios encontrados:', commentDataResult.rows.length);

    // Obtener comentarios de mantenimiento con nombre_siembra y tiempo de mantenimiento
    const maintenanceCommentsResult = await db.query(StatisticsQueries.getMaintenanceComments, [gardenId]);

    // Preparar datos de mantenimiento individuales (no agregados por fecha)
    const maintenanceData = maintenanceCommentsResult.rows.map(item => ({
      fecha: new Date(item.fecha).toISOString().split('T')[0],
      contenido: item.contenido || null,
      nombre_siembra: item.nombre_siembra || null,
      cantidad_mantenimiento: item.cantidad_mantenimiento || null,
      unidad_mantenimiento: item.unidad_mantenimiento || null,
      fechaSort: new Date(item.fecha)
    }));

    // Procesar comentarios para generar estadísticas
    console.log('⚙️ Procesando comentarios...');
    const processedData = processCommentData(commentDataResult.rows, waterDataResult.rows, combinedPlantingData, fertilizerDataResult.rows, pestDataResult.rows, statsResult.rows[0]);
    
    console.log('✅ Datos procesados exitosamente');

    res.json({
      success: true,
      data: {
        garden: gardenResult.rows[0],
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
    const userGardensResult = await db.query(StatisticsQueries.getUserGardens, [userId]);

    // Obtener estadísticas generales del usuario
    const userStatsResult = await db.query(StatisticsQueries.getUserStats, [userId]);

    // Obtener actividad reciente del usuario
    const recentActivityResult = await db.query(StatisticsQueries.getUserRecentActivity, [userId]);

    res.json({
      success: true,
      data: {
        userGardens: userGardensResult.rows,
        summary: userStatsResult.rows[0],
        recentActivity: recentActivityResult.rows.map(item => ({
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
    const systemStatsResult = await db.query(StatisticsQueries.getSystemStats);

    // Estadísticas de actividad del sistema
    const activityStatsResult = await db.query(StatisticsQueries.getSystemActivityStats);

    // Top huertos por actividad
    const topGardensResult = await db.query(StatisticsQueries.getTopGardensByActivity);

    res.json({
      success: true,
      data: {
        systemOverview: systemStatsResult.rows[0],
        activityTrend: activityStatsResult.rows.map(item => ({
          ...item,
          fecha: item.fecha.toISOString().split('T')[0]
        })),
        topGardens: topGardensResult.rows
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
    const growthDataResult = await db.query(StatisticsQueries.getGrowthData, [gardenId]);

    // Calcular métricas de crecimiento
    const growthMetrics = growthDataResult.rows.map((item, index) => {
      if (index === 0) return { ...item, crecimiento: 0, tasa_crecimiento: 0 };
      
      const previous = growthDataResult.rows[index - 1];
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
    const harvestDataResult = await db.query(StatisticsQueries.getHarvestStats, [gardenId]);

    // Calcular totales y promedios
    const totalCosecha = harvestDataResult.rows.reduce((sum, item) => sum + item.cosecha_diaria, 0);
    const promedioCosecha = harvestDataResult.rows.length > 0 ? totalCosecha / harvestDataResult.rows.length : 0;
    const maxCosecha = Math.max(...harvestDataResult.rows.map(item => item.cosecha_diaria));

    res.json({
      success: true,
      data: {
        gardenId,
        harvestData: harvestDataResult.rows.map(item => ({
          ...item,
          fecha: item.fecha.toISOString().split('T')[0]
        })),
        summary: {
          totalCosecha,
          promedioCosecha: Math.round(promedioCosecha * 100) / 100,
          maxCosecha,
          totalDias: harvestDataResult.rows.length
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
    const wateringDataResult = await db.query(StatisticsQueries.getWateringStats, [gardenId]);

    // Calcular totales y promedios
    const totalAgua = wateringDataResult.rows.reduce((sum, item) => sum + item.agua_diaria, 0);
    const promedioAgua = wateringDataResult.rows.length > 0 ? totalAgua / wateringDataResult.rows.length : 0;
    const maxAgua = Math.max(...wateringDataResult.rows.map(item => item.agua_diaria));

    // Calcular frecuencia de riego
    const frecuenciaRiego = wateringDataResult.rows.length > 0 ? 90 / wateringDataResult.rows.length : 0;

    res.json({
      success: true,
      data: {
        gardenId,
        wateringData: wateringDataResult.rows.map(item => ({
          ...item,
          fecha: item.fecha.toISOString().split('T')[0],
          aguaFormateada: `${item.agua_diaria} L`
        })),
        summary: {
          totalAgua,
          promedioAgua: Math.round(promedioAgua * 100) / 100,
          maxAgua,
          frecuenciaRiego: Math.round(frecuenciaRiego * 100) / 100,
          totalDias: wateringDataResult.rows.length
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
    const gardenResult = await db.query(StatisticsQueries.checkGardenExists, [gardenId]);

    if (gardenResult.rows.length === 0) {
      return res.status(404).json({ message: 'Huerto no encontrado' });
    }

    // Obtener datos de abono con información de cambio de tierra y nombre de siembra
    const fertilizerDataResult = await db.query(StatisticsQueries.getDetailedFertilizerData, [gardenId]);

    console.log('🌿 Datos de abono obtenidos:', fertilizerDataResult.rows.length, 'registros');

    // Procesar datos para el frontend
    const processedData = fertilizerDataResult.rows.map(item => ({
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
        garden: gardenResult.rows[0],
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
    const gardenResult = await db.query(StatisticsQueries.checkGardenExists, [gardenId]);

    if (gardenResult.rows.length === 0) {
      return res.status(404).json({ message: 'Huerto no encontrado' });
    }

    // Obtener datos de plagas con información detallada
    const pestDataResult = await db.query(StatisticsQueries.getDetailedPestData, [gardenId]);

    console.log('🐛 Datos de plagas obtenidos:', pestDataResult.rows.length, 'registros');

    // Procesar datos para el frontend
    const processedData = pestDataResult.rows.map(item => ({
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
        garden: gardenResult.rows[0],
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
    const gardenResult = await db.query(StatisticsQueries.checkGardenExists, [gardenId]);

    if (gardenResult.rows.length === 0) {
      return res.status(404).json({ message: 'Huerto no encontrado' });
    }

    // Obtener datos de agua con nombre de siembra
    const waterDataResult = await db.query(StatisticsQueries.getDetailedWaterData, [gardenId]);

    console.log('💧 Datos de agua obtenidos:', waterDataResult.rows.length, 'registros');

    // Procesar datos para el frontend
    const processedData = waterDataResult.rows.map((item, index) => ({
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
        garden: gardenResult.rows[0],
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
    const gardenResult = await db.query(StatisticsQueries.checkGardenExists, [gardenId]);

    if (gardenResult.rows.length === 0) {
      return res.status(404).json({ message: 'Huerto no encontrado' });
    }

    // Obtener datos de agua con información detallada
    const waterDataResult = await db.query(StatisticsQueries.getWaterDataForAnalysis, [gardenId]);

    // Obtener información de siembras actuales
    const currentPlantingsResult = await db.query(StatisticsQueries.getCurrentPlantings, [gardenId]);

    // Calcular estadísticas básicas
    const totalAgua = waterDataResult.rows.reduce((sum, item) => sum + parseFloat(item.cantidad), 0);
    const promedioAgua = waterDataResult.rows.length > 0 ? totalAgua / waterDataResult.rows.length : 0;
    const frecuenciaRiego = waterDataResult.rows.length > 0 ? 30 / waterDataResult.rows.length : 0;

    // Preparar datos para Gemini
    const geminiData = {
      huerto: {
        nombre: gardenResult.rows[0].nombre,
        ubicacion: gardenResult.rows[0].ubicacion_id
      },
      siembras_actuales: currentPlantingsResult.rows.map(p => p.nombre_siembra),
      estadisticas_riego: {
        total_registros: waterDataResult.rows.length,
        total_agua_litros: totalAgua.toFixed(2),
        promedio_por_riego: promedioAgua.toFixed(2),
        frecuencia_dias: frecuenciaRiego.toFixed(1),
        ultimos_registros: waterDataResult.rows.slice(0, 10).map(item => ({
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
        garden: gardenResult.rows[0],
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
    const gardenResult = await db.query(StatisticsQueries.checkGardenExists, [gardenId]);

    if (gardenResult.rows.length === 0) {
      return res.status(404).json({ message: 'Huerto no encontrado' });
    }

    // Obtener datos de abono con información detallada
    const fertilizerDataResult = await db.query(StatisticsQueries.getFertilizerDataForAnalysis, [gardenId]);

    // Obtener información de siembras actuales
    const currentPlantingsResult = await db.query(StatisticsQueries.getCurrentPlantings, [gardenId]);

    // Calcular estadísticas básicas
    const totalAbono = fertilizerDataResult.rows.reduce((sum, item) => sum + parseFloat(item.cantidad_abono), 0);
    const promedioAbono = fertilizerDataResult.rows.length > 0 ? totalAbono / fertilizerDataResult.rows.length : 0;
    const cambiosTierra = fertilizerDataResult.rows.filter(item => item.cambio_tierra === true).length;

    // Preparar datos para Gemini
    const geminiData = {
      huerto: {
        nombre: gardenResult.rows[0].nombre,
        ubicacion: gardenResult.rows[0].ubicacion_id
      },
      siembras_actuales: currentPlantingsResult.rows.map(p => p.nombre_siembra),
      estadisticas_abono: {
        total_registros: fertilizerDataResult.rows.length,
        total_abono: totalAbono.toFixed(2),
        promedio_por_aplicacion: promedioAbono.toFixed(2),
        cambios_tierra: cambiosTierra,
        ultimos_registros: fertilizerDataResult.rows.slice(0, 10).map(item => ({
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
        garden: gardenResult.rows[0],
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
    const gardenResult = await db.query(StatisticsQueries.checkGardenExists, [gardenId]);

    if (gardenResult.rows.length === 0) {
      return res.status(404).json({ message: 'Huerto no encontrado' });
    }

    // Obtener datos de plagas con información detallada
    const pestDataResult = await db.query(StatisticsQueries.getPestDataForAnalysis, [gardenId]);

    // Obtener información de siembras actuales
    const currentPlantingsResult = await db.query(StatisticsQueries.getCurrentPlantings, [gardenId]);

    // Calcular estadísticas básicas
    const totalIncidencias = pestDataResult.rows.length;
    const plagasPorEspecie = pestDataResult.rows.reduce((acc, item) => {
      const especie = item.plaga_especie || 'No especificada';
      acc[especie] = (acc[especie] || 0) + 1;
      return acc;
    }, {});

    // Preparar datos para Gemini
    const geminiData = {
      huerto: {
        nombre: gardenResult.rows[0].nombre,
        ubicacion: gardenResult.rows[0].ubicacion_id
      },
      siembras_actuales: currentPlantingsResult.rows.map(p => p.nombre_siembra),
      estadisticas_plagas: {
        total_incidencias: totalIncidencias,
        especies_detectadas: Object.keys(plagasPorEspecie),
        plagas_por_especie: plagasPorEspecie,
        ultimos_registros: pestDataResult.rows.slice(0, 10).map(item => ({
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
        garden: gardenResult.rows[0],
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
    const gardenResult = await db.query(StatisticsQueries.checkGardenExists, [gardenId]);

    if (gardenResult.rows.length === 0) {
      return res.status(404).json({ message: 'Huerto no encontrado' });
    }

    // Obtener datos de siembra y cosecha
    const plantingDataResult = await db.query(StatisticsQueries.getPlantingDataForAnalysis, [gardenId]);

    // Procesar datos: separar siembras y cosechas
    const siembras = plantingDataResult.rows.filter(item => item.tipo_comentario === 'siembra');
    const cosechas = plantingDataResult.rows.filter(item => item.tipo_comentario === 'cosecha');

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
        nombre: gardenResult.rows[0].nombre,
        ubicacion: gardenResult.rows[0].ubicacion_id
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
        garden: gardenResult.rows[0],
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
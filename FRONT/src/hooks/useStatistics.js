import { useState, useEffect, useCallback } from 'react';
import statisticsService from '../services/statisticsService.js';
import { gardensAPI } from '../services/apiService.js';
import { debugStatistics } from '../utils/debugStatistics.js';

export const useStatistics = (gardenId = null) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    aguaData: [],
    siembraData: [],
    abonoData: [],
    plagasData: [],
    mantenimientoData: [],
    summary: {},
    garden: {}
  });

  // Cargar estadísticas del huerto
  const loadGardenStatistics = useCallback(async (id) => {
    console.log('🔍 loadGardenStatistics called with id:', id);
    if (!id) {
      console.log('❌ No gardenId provided, skipping load');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('📡 Calling statisticsService.getCompleteGardenStatistics with id:', id);
      const stats = await statisticsService.getCompleteGardenStatistics(id);
      console.log('✅ Statistics loaded successfully:', stats);
      console.log('📊 Data breakdown:', {
        aguaData: stats.aguaData?.length || 0,
        siembraData: stats.siembraData?.length || 0,
        abonoData: stats.abonoData?.length || 0,
        plagasData: stats.plagasData?.length || 0,
        mantenimientoData: stats.mantenimientoData?.length || 0,
        garden: stats.garden
      });
      
      // Si no tenemos información del huerto, obtenerla por separado
      if (!stats.garden || !stats.garden.nombre) {
        try {
          console.log('🏡 Getting garden info separately...');
          const gardenResponse = await gardensAPI.getGardenById(id);
          if (gardenResponse.data.success) {
            stats.garden = gardenResponse.data.data;
            console.log('✅ Garden info obtained:', stats.garden);
          }
        } catch (gardenError) {
          console.warn('⚠️ No se pudo obtener información del huerto:', gardenError);
          // Usar información básica del huerto
          stats.garden = { id, nombre: `Huerto ${id}` };
        }
      }
      
      setData(stats);
      console.log('💾 Data set successfully in state');
    } catch (err) {
      console.error('❌ Error cargando estadísticas del huerto:', err);
      setError(err.message || 'Error al cargar estadísticas del huerto');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar estadísticas del usuario
  const loadUserStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const stats = await statisticsService.getFormattedUserStatistics();
      setData({
        ...data,
        userStats: stats
      });
    } catch (err) {
      setError(err.message || 'Error al cargar estadísticas del usuario');
      console.error('Error cargando estadísticas del usuario:', err);
    } finally {
      setLoading(false);
    }
  }, [data]);

  // Cargar estadísticas del sistema
  const loadSystemStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const stats = await statisticsService.getFormattedSystemStatistics();
      setData({
        ...data,
        systemStats: stats
      });
    } catch (err) {
      setError(err.message || 'Error al cargar estadísticas del sistema');
      console.error('Error cargando estadísticas del sistema:', err);
    } finally {
      setLoading(false);
    }
  }, [data]);

  // Recargar datos
  const refresh = useCallback(() => {
    if (gardenId) {
      statisticsService.clearGardenCache(gardenId);
      loadGardenStatistics(gardenId);
    }
  }, [gardenId, loadGardenStatistics]);

  // Limpiar cache
  const clearCache = useCallback(() => {
    if (gardenId) {
      statisticsService.clearGardenCache(gardenId);
    } else {
      statisticsService.clearCache();
    }
  }, [gardenId]);

  // Cargar datos iniciales
  useEffect(() => {
    if (gardenId) {
      loadGardenStatistics(gardenId);
    }
  }, [gardenId, loadGardenStatistics]);

  // Función para filtrar datos por fecha
  const filterDataByDate = useCallback((dataArray, fechaInicio, fechaFin) => {
    console.log('🔍 filterDataByDate called with:', {
      dataArrayLength: dataArray?.length || 0,
      fechaInicio,
      fechaFin,
      firstItem: dataArray?.[0]
    });
    
    if (!fechaInicio && !fechaFin) return dataArray;

    // Crear fechas de comparación sin problemas de zona horaria
    const inicio = fechaInicio ? new Date(fechaInicio) : new Date("1900-01-01");
    const fin = fechaFin ? new Date(fechaFin) : new Date("2100-12-31");
    
    // Normalizar a medianoche para evitar problemas de zona horaria
    inicio.setHours(0, 0, 0, 0);
    fin.setHours(23, 59, 59, 999);

    console.log('📅 Rango de fechas:', {
      inicio: inicio.toISOString(),
      fin: fin.toISOString(),
      inicioLocal: inicio.toLocaleDateString(),
      finLocal: fin.toLocaleDateString()
    });

    const filtered = dataArray.filter((item) => {
      // Intentar diferentes nombres de propiedades para la fecha
      const fechaItem = item.fechaSort || item.fecha || item.fechaInicio || item.created_at;
      
      if (!fechaItem) {
        console.warn('⚠️ Item sin fecha encontrado:', item);
        return false;
      }
      
      // Crear fecha del item
      const fechaItemDate = new Date(fechaItem);
      
      // Verificar que la fecha es válida
      if (isNaN(fechaItemDate.getTime())) {
        console.warn('⚠️ Fecha inválida encontrada:', fechaItem);
        return false;
      }
      
      // Normalizar la fecha del item a medianoche para comparación
      fechaItemDate.setHours(0, 0, 0, 0);
      
      const isInRange = fechaItemDate >= inicio && fechaItemDate <= fin;
      
      console.log('📅 Filtrando item:', {
        fechaItem,
        fechaItemDate: fechaItemDate.toISOString(),
        inicio: inicio.toISOString(),
        fin: fin.toISOString(),
        isInRange
      });
      
      return isInRange;
    });
    
    console.log('✅ filterDataByDate result:', {
      originalLength: dataArray.length,
      filteredLength: filtered.length,
      filteredItems: filtered.map(item => ({
        fecha: item.fechaSort || item.fecha || item.fechaInicio || item.created_at,
        item: item
      }))
    });
    
    return filtered;
  }, []);

  // Obtener datos filtrados
  const getFilteredData = useCallback((fechaInicio, fechaFin) => {
    return {
      aguaData: filterDataByDate(data.aguaData, fechaInicio, fechaFin),
      siembraData: filterDataByDate(data.siembraData, fechaInicio, fechaFin),
      abonoData: filterDataByDate(data.abonoData, fechaInicio, fechaFin),
      plagasData: filterDataByDate(data.plagasData, fechaInicio, fechaFin),
      mantenimientoData: filterDataByDate(data.mantenimientoData, fechaInicio, fechaFin)
    };
  }, [data, filterDataByDate]);

  // Calcular estadísticas resumidas
  const calculateSummary = useCallback((filteredData) => {
    console.log('🔍 calculateSummary called with:', filteredData);
    
    const { aguaData, siembraData, abonoData, plagasData, mantenimientoData } = filteredData;
    
    console.log('📊 Datos recibidos:', {
      aguaDataLength: aguaData?.length || 0,
      siembraDataLength: siembraData?.length || 0,
      abonoDataLength: abonoData?.length || 0,
      plagasDataLength: plagasData?.length || 0,
      mantenimientoDataLength: mantenimientoData?.length || 0,
      aguaDataFirst: aguaData?.[0],
      siembraDataFirst: siembraData?.[0]
    });
    
    // Calcular total de agua en litros (sumando todos los datos convertidos)
    const totalAguaLitros = aguaData.reduce((sum, item) => {
      // Intentar diferentes nombres de propiedades para cantidad de agua
      const cantidad = parseFloat(item.cantidadMl || item.cantidad_ml || item.cantidad || 0);
      console.log('💧 Item agua:', { item, cantidad });
      return sum + cantidad;
    }, 0);
    
    console.log('💧 Total agua calculado:', totalAguaLitros);
    
    // Determinar si mostrar en L o mL basado en el total
    const totalAgua = totalAguaLitros >= 1 ? 
      Math.round(totalAguaLitros * 100) / 100 : // Redondear a 2 decimales para L
      Math.round(totalAguaLitros * 1000); // Redondear a entero para mL
    const unidadAgua = totalAguaLitros >= 1 ? 'L' : 'mL';
    
    const summary = {
      // Mostrar total de agua en L si es >= 1L, sino en mL
      totalAgua: totalAgua,
      unidadAgua: unidadAgua,
      totalSiembra: siembraData.reduce((sum, item) => {
        // Intentar diferentes nombres de propiedades para cantidad de siembra
        const cantidad = parseInt(item.cantidad_siembra || item.siembra || item.cantidad || 0);
        console.log('🌱 Item siembra:', { item, cantidad });
        return sum + cantidad;
      }, 0),
      totalCosecha: siembraData.reduce((sum, item) => {
        // Intentar diferentes nombres de propiedades para cantidad de cosecha
        const cantidad = parseInt(item.cantidad_cosecha || item.cosecha || item.cantidad || 0);
        console.log('🌾 Item cosecha:', { item, cantidad });
        return sum + cantidad;
      }, 0),
      // Para plagas, contamos incidencias (registros), no cantidades
      totalPlagas: plagasData.reduce((sum, item) => {
        // Intentar diferentes nombres de propiedades para cantidad de plagas
        const cantidad = parseInt(item.cantidad_plagas || item.incidencias || item.cantidad || 1);
        console.log('🐛 Item plagas:', { item, cantidad });
        return sum + cantidad;
      }, 0),
      // Estadísticas específicas de plagas
      plagasPorEspecie: plagasData.reduce((acc, item) => {
        const especie = item.plaga_especie || 'No especificada';
        const cantidad = parseInt(item.cantidad_plagas || item.incidencias || 1);
        acc[especie] = (acc[especie] || 0) + cantidad;
        return acc;
      }, {}),
      plagasPorNivel: plagasData.reduce((acc, item) => {
        const nivel = item.plaga_nivel || 'No especificado';
        const cantidad = parseInt(item.cantidad_plagas || item.incidencias || 1);
        acc[nivel] = (acc[nivel] || 0) + cantidad;
        return acc;
      }, {}),
      totalAbono: abonoData.reduce((sum, item) => {
        // Intentar diferentes nombres de propiedades para cantidad de abono
        const cantidad = parseFloat(item.cantidad_abono || item.cantidadAbono || item.cantidad || 0);
        console.log('🌿 Item abono:', { item, cantidad });
        return sum + cantidad;
      }, 0),
      totalMantenimiento: mantenimientoData.reduce((sum, item) => {
        // Intentar diferentes nombres de propiedades para cantidad de mantenimiento
        const cantidad = parseInt(item.cantidad_mantenimiento || item.acciones || item.cantidad || 1);
        console.log('🔧 Item mantenimiento:', { item, cantidad });
        return sum + cantidad;
      }, 0)
    };
    
    console.log('📊 Summary calculado:', summary);
    
    return summary;
  }, []);

  // Cargar estadísticas específicas con las nuevas rutas (sin afectar el estado principal)
  const loadSpecificStatistics = useCallback(async (id, type) => {
    console.log(`🔍 loadSpecificStatistics called with id: ${id}, type: ${type}`);
    if (!id || !type) {
      console.log('❌ No gardenId or type provided, skipping load');
      return null;
    }
    
    try {
      let stats;
      switch (type) {
        case 'fertilizer':
          stats = await statisticsService.getFertilizerStatistics(id);
          if (debugStatistics.isEnabled()) {
            debugStatistics.debugAPIResponse(stats, `/api/statistics/fertilizer/${id}`);
            if (stats?.data?.fertilizerData) {
              debugStatistics.debugAbonoData(stats.data.fertilizerData, 'API Response');
            }
          }
          break;
        case 'pests':
          stats = await statisticsService.getPestStatistics(id);
          if (debugStatistics.isEnabled()) {
            debugStatistics.debugAPIResponse(stats, `/api/statistics/pests/${id}`);
            if (stats?.data?.pestData) {
              debugStatistics.debugPlagasData(stats.data.pestData, 'API Response');
            }
          }
          break;
        case 'water':
          stats = await statisticsService.getWaterStatistics(id);
          if (debugStatistics.isEnabled()) {
            debugStatistics.debugAPIResponse(stats, `/api/statistics/water/${id}`);
            if (stats?.data?.waterData) {
              debugStatistics.debugAguaData(stats.data.waterData, 'API Response');
            }
          }
          break;
        default:
          throw new Error(`Tipo de estadística no válido: ${type}`);
      }
      
      console.log(`✅ ${type} statistics loaded successfully:`, stats);
      
      // Retornar los datos para que el componente los use
      return stats.data;
      
    } catch (err) {
      console.error(`❌ Error cargando estadísticas de ${type}:`, err);
      if (debugStatistics.isEnabled()) {
        console.error(`🔍 Debug - Error details for ${type}:`, {
          error: err,
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
      }
      return null;
    }
  }, []);

  return {
    // Estado
    loading,
    error,
    data,
    
    // Acciones
    loadGardenStatistics,
    loadUserStatistics,
    loadSystemStatistics,
    loadSpecificStatistics,
    refresh,
    clearCache,
    
    // Utilidades
    filterDataByDate,
    getFilteredData,
    calculateSummary
  };
};

export default useStatistics;


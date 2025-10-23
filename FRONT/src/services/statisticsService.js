import { statisticsAPI } from './apiService.js';

class StatisticsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  // Obtener token de autenticación
  getToken() {
    return localStorage.getItem('token');
  }

  // Limpiar cache expirado
  _cleanExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }

  // Obtener datos del cache o de la API
  async _getCachedData(key, apiCall) {
    console.log(`_getCachedData called with key: ${key}`);
    this._cleanExpiredCache();
    
    if (this.cache.has(key)) {
      const cached = this.cache.get(key);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log(`Returning cached data for key: ${key}`);
        return cached.data;
      }
    }

    try {
      console.log(`Making API call for key: ${key}`);
      const response = await apiCall();
      console.log(`API response for ${key}:`, response);
      if (response.data.success) {
        this.cache.set(key, {
          data: response.data.data,
          timestamp: Date.now()
        });
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Error al obtener datos');
      }
    } catch (error) {
      console.error(`Error en ${key}:`, error);
      throw error;
    }
  }

  // Obtener estadísticas de un huerto específico
  async getGardenStatistics(gardenId) {
    console.log('getGardenStatistics called with gardenId:', gardenId);
    return this._getCachedData(
      `garden_${gardenId}`,
      () => {
        console.log('Calling statisticsAPI.getGardenStats with gardenId:', gardenId);
        return statisticsAPI.getGardenStats(gardenId);
      }
    );
  }

  // Obtener estadísticas del usuario actual
  async getUserStatistics() {
    return this._getCachedData(
      'user_stats',
      () => statisticsAPI.getUserStats()
    );
  }

  // Obtener estadísticas del sistema
  async getSystemStatistics() {
    return this._getCachedData(
      'system_stats',
      () => statisticsAPI.getSystemStats()
    );
  }

  // Obtener datos de crecimiento
  async getGrowthStatistics(gardenId, plantId) {
    return this._getCachedData(
      `growth_${gardenId}_${plantId}`,
      () => statisticsAPI.getGrowthData(gardenId, plantId)
    );
  }

  // Obtener estadísticas de cosecha
  async getHarvestStatistics(gardenId) {
    return this._getCachedData(
      `harvest_${gardenId}`,
      () => statisticsAPI.getHarvestData(gardenId)
    );
  }

  // Obtener estadísticas de riego
  async getWateringStatistics(gardenId) {
    return this._getCachedData(
      `watering_${gardenId}`,
      () => statisticsAPI.getWateringData(gardenId)
    );
  }

  // Nuevas funciones para estadísticas específicas con nombre_siembra
  async getFertilizerStatistics(gardenId) {
    return this._getCachedData(
      `fertilizer_${gardenId}`,
      () => statisticsAPI.getFertilizerData(gardenId)
    );
  }

  async getPestStatistics(gardenId) {
    return this._getCachedData(
      `pests_${gardenId}`,
      () => statisticsAPI.getPestData(gardenId)
    );
  }

  async getWaterStatistics(gardenId) {
    return this._getCachedData(
      `water_${gardenId}`,
      () => statisticsAPI.getWaterData(gardenId)
    );
  }

  // Formatear datos para gráficos (compatibilidad con datos existentes)
  formatWaterData(waterData) {
    if (!waterData || !Array.isArray(waterData)) return [];
    
    return waterData.map((item, index) => ({
      fecha: this._formatDate(item.fecha),
      fechaCompleta: item.fecha, // Mantener fecha original para ordenamiento
      cantidad: parseFloat(item.cantidad) || 0,
      cantidadMl: Math.round(((parseFloat(item.cantidad) || 0) * 1000)), // Redondear mL
      cantidadFormateada: `${Math.round(((parseFloat(item.cantidad) || 0) * 1000))} mL`, // Mostrar en mL redondeado
      nombre_siembra: item.nombre_siembra || null,
      fechaSort: new Date(item.fecha),
      // Agregar identificador único para evitar duplicados en gráficos
      id: `${item.fecha}_${index}_${item.cantidad}`
    }));
  }

  formatPlantingData(plantingData) {
    if (!plantingData || !Array.isArray(plantingData)) return [];
    
    return plantingData.map(item => ({
      fecha: this._formatDate(item.fecha),
      siembra: parseInt(item.siembra) || 0,
      cosecha: parseInt(item.cosecha) || 0,
      fechaFinal: item.fecha_cosecha ? this._formatDate(item.fecha_cosecha) : null,
      fecha_cosecha: item.fecha_cosecha ? this._formatDate(item.fecha_cosecha) : null,
      nombre_siembra: item.nombre_siembra || null,
      fechaSort: new Date(item.fecha)
    }));
  }

  formatFertilizerData(fertilizerData) {
    if (!fertilizerData || !Array.isArray(fertilizerData)) return [];
    
    return fertilizerData.map(item => ({
      fecha: this._formatDate(item.fecha),
      fechaInicio: this._formatDate(item.fecha_inicio),
      fechaFinal: this._formatDate(item.fecha_final),
      totalDias: parseInt(item.total_dias) || 0,
      cantidadAbono: parseFloat(item.cantidad_abono) || 0,
      cantidad_abono: parseFloat(item.cantidad_abono) || 0,
      unidad_abono: item.unidad_abono || 'kg',
      cambio_tierra: item.cambio_tierra || null,
      nombre_siembra: item.nombre_siembra || null,
      fechaSort: new Date(item.fecha || item.fecha_inicio)
    }));
  }

  formatPestData(pestData) {
    if (!pestData || !Array.isArray(pestData)) return [];
    
    return pestData.map(item => ({
      fecha: this._formatDate(item.fecha),
      plaga_especie: item.plaga_especie || 'No especificada',
      plaga_nivel: item.plaga_nivel || 'No especificado',
      cantidad_plagas: parseFloat(item.cantidad_plagas) || 0,
      incidencias: parseInt(item.incidencias) || 1,
      nombre_siembra: item.nombre_siembra || null,
      fechaSort: new Date(item.fecha)
    }));
  }

  formatMaintenanceData(maintenanceData) {
    if (!maintenanceData || !Array.isArray(maintenanceData)) return [];
    return maintenanceData.map(item => ({
      fecha: this._formatDate(item.fecha),
      contenido: item.contenido || null,
      acciones: item.acciones || 0, // Mantener para compatibilidad
      cantidad_mantenimiento: item.cantidad_mantenimiento || null,
      unidad_mantenimiento: item.unidad_mantenimiento || null,
      nombre_siembra: item.nombre_siembra || null,
      fechaSort: new Date(item.fecha)
    }));
  }

  // Formatear fecha para compatibilidad
  _formatDate(dateString) {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  // Limpiar cache manualmente
  clearCache() {
    this.cache.clear();
  }

  // Limpiar cache de un huerto específico
  clearGardenCache(gardenId) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.includes(`garden_${gardenId}`) || 
          key.includes(`growth_${gardenId}`) || 
          key.includes(`harvest_${gardenId}`) || 
          key.includes(`watering_${gardenId}`) ||
          key.includes(`fertilizer_${gardenId}`) ||
          key.includes(`pests_${gardenId}`) ||
          key.includes(`water_${gardenId}`)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    console.log(`🗑️ Cache limpiado para huerto ${gardenId}. Claves eliminadas:`, keysToDelete);
  }

  // Obtener estadísticas completas de un huerto (formateadas)
  async getCompleteGardenStatistics(gardenId) {
    try {
      console.log('🔍 getCompleteGardenStatistics called with gardenId:', gardenId);
      const gardenStats = await this.getGardenStatistics(gardenId);
      console.log('📊 Raw garden stats received:', gardenStats);
      
      const formattedStats = {
        aguaData: this.formatWaterData(gardenStats.waterData),
        siembraData: this.formatPlantingData(gardenStats.plantingData),
        abonoData: this.formatFertilizerData(gardenStats.fertilizerData),
        plagasData: this.formatPestData(gardenStats.pestData),
        mantenimientoData: this.formatMaintenanceData(gardenStats.maintenanceData),
        summary: gardenStats.summary,
        garden: gardenStats.garden
      };
      
      console.log('✅ Formatted stats:', {
        aguaData: formattedStats.aguaData.length,
        siembraData: formattedStats.siembraData.length,
        abonoData: formattedStats.abonoData.length,
        plagasData: formattedStats.plagasData.length,
        summary: formattedStats.summary,
        garden: formattedStats.garden
      });
      
      return formattedStats;
    } catch (error) {
      console.error('❌ Error al obtener estadísticas completas:', error);
      // Retornar datos vacíos en caso de error
      return {
        aguaData: [],
        siembraData: [],
        abonoData: [],
        plagasData: [],
        mantenimientoData: [],
        summary: {},
        garden: {}
      };
    }
  }

  // Obtener estadísticas del usuario con formato
  async getFormattedUserStatistics() {
    try {
      const userStats = await this.getUserStatistics();
      
      return {
        gardens: userStats.userGardens || [],
        summary: userStats.summary || {},
        recentActivity: userStats.recentActivity || []
      };
    } catch (error) {
      console.error('Error al obtener estadísticas del usuario:', error);
      return {
        gardens: [],
        summary: {},
        recentActivity: []
      };
    }
  }

  // Obtener estadísticas del sistema con formato
  async getFormattedSystemStatistics() {
    try {
      const systemStats = await this.getSystemStatistics();
      
      return {
        overview: systemStats.systemOverview || {},
        activityTrend: systemStats.activityTrend || [],
        topGardens: systemStats.topGardens || []
      };
    } catch (error) {
      console.error('Error al obtener estadísticas del sistema:', error);
      return {
        overview: {},
        activityTrend: [],
        topGardens: []
      };
    }
  }

  // --- NUEVOS MÉTODOS PARA ANÁLISIS INDIVIDUALES CON GEMINI ---

  // Análisis específico de agua con Gemini
  async analyzeWaterStatistics(gardenId) {
    try {
      console.log('🤖 Solicitando análisis de agua para huerto:', gardenId);
      
      const response = await fetch(`${this.baseURL}/statistics/water/${gardenId}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Análisis de agua recibido:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Error al obtener análisis de agua:', error);
      throw error;
    }
  }

  // Análisis específico de abono con Gemini
  async analyzeFertilizerStatistics(gardenId) {
    try {
      console.log('🤖 Solicitando análisis de abono para huerto:', gardenId);
      
      const response = await fetch(`${this.baseURL}/statistics/fertilizer/${gardenId}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Análisis de abono recibido:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Error al obtener análisis de abono:', error);
      throw error;
    }
  }

  // Análisis específico de plagas con Gemini
  async analyzePestStatistics(gardenId) {
    try {
      console.log('🤖 Solicitando análisis de plagas para huerto:', gardenId);
      
      const response = await fetch(`${this.baseURL}/statistics/pests/${gardenId}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Análisis de plagas recibido:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Error al obtener análisis de plagas:', error);
      throw error;
    }
  }

  // Análisis específico de siembra/cosecha con Gemini
  async analyzePlantingStatistics(gardenId) {
    try {
      console.log('🤖 Solicitando análisis de siembra/cosecha para huerto:', gardenId);
      
      const response = await fetch(`${this.baseURL}/statistics/planting/${gardenId}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Análisis de siembra/cosecha recibido:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Error al obtener análisis de siembra/cosecha:', error);
      throw error;
    }
  }
}

// Crear instancia singleton
const statisticsService = new StatisticsService();

export default statisticsService;


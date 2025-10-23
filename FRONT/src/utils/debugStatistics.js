// Depurador para estadísticas - Frontend
export const debugStatistics = {
  
  // Depurar datos de abono
  debugAbonoData: (data, source = 'unknown') => {
    console.log(`🔍 === DEBUG ABONO DATA (${source}) ===`);
    console.log('📊 Datos recibidos:', data);
    
    if (Array.isArray(data)) {
      console.log(`📈 Total registros: ${data.length}`);
      data.forEach((item, index) => {
        console.log(`\n${index + 1}. Registro:`);
        console.log(`   Fecha: ${item.fecha}`);
        console.log(`   Cantidad Abono: ${item.cantidad_abono}`);
        console.log(`   Cambio Tierra: ${item.cambio_tierra || 'NULL'}`);
        console.log(`   Nombre Siembra: "${item.nombre_siembra || 'NULL'}"`);
        console.log(`   Objeto completo:`, item);
      });
    } else {
      console.log('❌ Los datos no son un array:', typeof data);
    }
    console.log('=== FIN DEBUG ABONO ===\n');
  },

  // Depurar datos de agua
  debugAguaData: (data, source = 'unknown') => {
    console.log(`🔍 === DEBUG AGUA DATA (${source}) ===`);
    console.log('📊 Datos recibidos:', data);
    
    if (Array.isArray(data)) {
      console.log(`📈 Total registros: ${data.length}`);
      data.forEach((item, index) => {
        console.log(`\n${index + 1}. Registro:`);
        console.log(`   Fecha: ${item.fecha}`);
        console.log(`   Cantidad: ${item.cantidadMl || item.cantidad || 'N/A'}`);
        console.log(`   Nombre Siembra: "${item.nombre_siembra || 'NULL'}"`);
        console.log(`   Objeto completo:`, item);
      });
    } else {
      console.log('❌ Los datos no son un array:', typeof data);
    }
    console.log('=== FIN DEBUG AGUA ===\n');
  },

  // Depurar datos de plagas
  debugPlagasData: (data, source = 'unknown') => {
    console.log(`🔍 === DEBUG PLAGAS DATA (${source}) ===`);
    console.log('📊 Datos recibidos:', data);
    
    if (Array.isArray(data)) {
      console.log(`📈 Total registros: ${data.length}`);
      data.forEach((item, index) => {
        console.log(`\n${index + 1}. Registro:`);
        console.log(`   Fecha: ${item.fecha}`);
        console.log(`   Plaga: ${item.plaga_especie || 'N/A'}`);
        console.log(`   Nivel: ${item.plaga_nivel || 'N/A'}`);
        console.log(`   Nombre Siembra: "${item.nombre_siembra || 'NULL'}"`);
        console.log(`   Objeto completo:`, item);
      });
    } else {
      console.log('❌ Los datos no son un array:', typeof data);
    }
    console.log('=== FIN DEBUG PLAGAS ===\n');
  },

  // Depurar respuesta de API
  debugAPIResponse: (response, endpoint = 'unknown') => {
    console.log(`🔍 === DEBUG API RESPONSE (${endpoint}) ===`);
    console.log('📡 Endpoint:', endpoint);
    console.log('📊 Response status:', response?.status);
    console.log('📊 Response data:', response?.data);
    
    if (response?.data?.data) {
      console.log('📊 Response data.data:', response.data.data);
      
      if (response.data.data.fertilizerData) {
        console.log('🌿 Fertilizer data length:', response.data.data.fertilizerData.length);
        console.log('🌿 First fertilizer item:', response.data.data.fertilizerData[0]);
      }
      
      if (response.data.data.pestData) {
        console.log('🐛 Pest data length:', response.data.data.pestData.length);
        console.log('🐛 First pest item:', response.data.data.pestData[0]);
      }
      
      if (response.data.data.waterData) {
        console.log('💧 Water data length:', response.data.data.waterData.length);
        console.log('💧 First water item:', response.data.data.waterData[0]);
      }
    }
    console.log('=== FIN DEBUG API RESPONSE ===\n');
  },

  // Depurar estado del hook
  debugHookState: (state, hookName = 'useStatistics') => {
    console.log(`🔍 === DEBUG HOOK STATE (${hookName}) ===`);
    console.log('📊 Loading:', state.loading);
    console.log('📊 Error:', state.error);
    console.log('📊 Data:', state.data);
    
    if (state.data) {
      console.log('📊 Garden:', state.data.garden);
      console.log('📊 Agua data length:', state.data.aguaData?.length || 0);
      console.log('📊 Abono data length:', state.data.abonoData?.length || 0);
      console.log('📊 Plagas data length:', state.data.plagasData?.length || 0);
    }
    console.log('=== FIN DEBUG HOOK STATE ===\n');
  },

  // Depurar datos filtrados
  debugFilteredData: (filteredData, filters = {}) => {
    console.log(`🔍 === DEBUG FILTERED DATA ===`);
    console.log('📊 Filtros aplicados:', filters);
    console.log('📊 Datos filtrados:', filteredData);
    
    if (filteredData) {
      console.log('📊 Agua data:', filteredData.aguaData?.length || 0);
      console.log('📊 Abono data:', filteredData.abonoData?.length || 0);
      console.log('📊 Plagas data:', filteredData.plagasData?.length || 0);
    }
    console.log('=== FIN DEBUG FILTERED DATA ===\n');
  },

  // Función para activar/desactivar debug
  enable: () => {
    window.debugStatistics = true;
    console.log('🔍 Debug de estadísticas ACTIVADO');
  },

  disable: () => {
    window.debugStatistics = false;
    console.log('🔍 Debug de estadísticas DESACTIVADO');
  },

  // Verificar si debug está activo
  isEnabled: () => {
    return window.debugStatistics === true;
  }
};

// Auto-activar debug en desarrollo
if (import.meta.env.DEV) {
  debugStatistics.enable();
}

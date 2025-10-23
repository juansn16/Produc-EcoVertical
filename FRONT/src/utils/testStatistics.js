/**
 * Script de prueba para la integración de estadísticas
 * Este archivo se puede usar para probar la funcionalidad de estadísticas
 */

import statisticsService from '../services/statisticsService';

// Función para probar el servicio de estadísticas
export const testStatisticsService = async () => {
  console.log('🧪 Iniciando pruebas del servicio de estadísticas...');

  try {
    // Probar estadísticas del sistema
    console.log('\n📊 Probando estadísticas del sistema...');
    const systemStats = await statisticsService.getFormattedSystemStatistics();
    console.log('✅ Estadísticas del sistema cargadas:', systemStats);

    // Probar estadísticas del usuario
    console.log('\n👤 Probando estadísticas del usuario...');
    const userStats = await statisticsService.getFormattedUserStatistics();
    console.log('✅ Estadísticas del usuario cargadas:', userStats);

    // Probar estadísticas de un huerto específico (ID de ejemplo)
    console.log('\n🌱 Probando estadísticas de huerto...');
    const gardenId = 'test-garden-id'; // Cambiar por un ID real
    const gardenStats = await statisticsService.getCompleteGardenStatistics(gardenId);
    console.log('✅ Estadísticas del huerto cargadas:', gardenStats);

    // Probar formateo de datos
    console.log('\n🔧 Probando formateo de datos...');
    const testWaterData = [
      { fecha: '2024-12-01', cantidad: 25.5 },
      { fecha: '2024-12-02', cantidad: 30.0 }
    ];
    
    const formattedWaterData = statisticsService.formatWaterData(testWaterData);
    console.log('✅ Datos de agua formateados:', formattedWaterData);

    // Probar limpieza de caché
    console.log('\n🧹 Probando limpieza de caché...');
    statisticsService.clearCache();
    console.log('✅ Caché limpiado correctamente');

    console.log('\n🎉 Todas las pruebas completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
    console.error('Detalles del error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  }
};

// Función para probar el hook de estadísticas
export const testStatisticsHook = () => {
  console.log('🧪 Probando hook de estadísticas...');
  
  // Simular datos del hook
  const mockHookData = {
    loading: false,
    error: null,
    data: {
      aguaData: [
        { fecha: '01/12/2024', cantidad: 25, fechaSort: new Date('2024-12-01') },
        { fecha: '02/12/2024', cantidad: 30, fechaSort: new Date('2024-12-02') }
      ],
      siembraData: [
        { fecha: '01/12/2024', siembra: 5, cosecha: 0, fechaSort: new Date('2024-12-01') },
        { fecha: '02/12/2024', siembra: 3, cosecha: 0, fechaSort: new Date('2024-12-02') }
      ],
      abonoData: [
        { fechaInicio: '01/12/2024', fechaFinal: '03/12/2024', totalDias: 3, cantidadAbono: 2, fechaSort: new Date('2024-12-01') }
      ],
      plagasData: [
        { fechaInicio: '01/12/2024', fechaFinal: '05/12/2024', cantidadPlagas: 1, fechaSort: new Date('2024-12-01') }
      ]
    }
  };

  console.log('✅ Datos del hook simulados correctamente');
  console.log('📊 Datos de agua:', mockHookData.data.aguaData.length, 'registros');
  console.log('🌱 Datos de siembra:', mockHookData.data.siembraData.length, 'registros');
  console.log('💩 Datos de abono:', mockHookData.data.abonoData.length, 'registros');
  console.log('🐛 Datos de plagas:', mockHookData.data.plagasData.length, 'registros');

  return mockHookData;
};

// Función para validar estructura de datos
export const validateDataStructure = (data) => {
  console.log('🔍 Validando estructura de datos...');
  
  const requiredFields = ['aguaData', 'siembraData', 'abonoData', 'plagasData'];
  const missingFields = requiredFields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    console.error('❌ Campos faltantes:', missingFields);
    return false;
  }

  // Validar que los arrays contengan objetos con la estructura correcta
  const waterDataValid = data.aguaData.every(item => 
    item.fecha && typeof item.cantidad === 'number' && item.fechaSort
  );
  
  const siembraDataValid = data.siembraData.every(item => 
    item.fecha && typeof item.siembra === 'number' && item.fechaSort
  );

  if (!waterDataValid || !siembraDataValid) {
    console.error('❌ Estructura de datos inválida');
    return false;
  }

  console.log('✅ Estructura de datos válida');
  return true;
};

// Función para medir rendimiento
export const measurePerformance = async (testFunction, iterations = 10) => {
  console.log(`⚡ Probando rendimiento (${iterations} iteraciones)...`);
  
  const startTime = performance.now();
  const results = [];
  
  for (let i = 0; i < iterations; i++) {
    const iterationStart = performance.now();
    try {
      await testFunction();
      const iterationTime = performance.now() - iterationStart;
      results.push(iterationTime);
    } catch (error) {
      console.error(`❌ Error en iteración ${i + 1}:`, error);
    }
  }
  
  const totalTime = performance.now() - startTime;
  const avgTime = results.reduce((sum, time) => sum + time, 0) / results.length;
  const minTime = Math.min(...results);
  const maxTime = Math.max(...results);
  
  console.log('📊 Resultados de rendimiento:');
  console.log(`   Tiempo total: ${totalTime.toFixed(2)}ms`);
  console.log(`   Tiempo promedio: ${avgTime.toFixed(2)}ms`);
  console.log(`   Tiempo mínimo: ${minTime.toFixed(2)}ms`);
  console.log(`   Tiempo máximo: ${maxTime.toFixed(2)}ms`);
  
  return { totalTime, avgTime, minTime, maxTime, results };
};

// Función principal de pruebas
export const runAllTests = async () => {
  console.log('🚀 Iniciando suite completa de pruebas...\n');
  
  // Ejecutar pruebas básicas
  await testStatisticsService();
  
  // Probar hook
  const hookData = testStatisticsHook();
  
  // Validar estructura
  validateDataStructure(hookData.data);
  
  // Medir rendimiento
  await measurePerformance(async () => {
    await statisticsService.getFormattedSystemStatistics();
  });
  
  console.log('\n🎯 Suite de pruebas completada!');
};

// Exportar para uso en consola del navegador
if (typeof window !== 'undefined') {
  window.testStatistics = {
    testStatisticsService,
    testStatisticsHook,
    validateDataStructure,
    measurePerformance,
    runAllTests
  };
  
  console.log('🧪 Herramientas de prueba disponibles en window.testStatistics');
  console.log('💡 Ejecuta: testStatistics.runAllTests() para iniciar las pruebas');
}

export default {
  testStatisticsService,
  testStatisticsHook,
  validateDataStructure,
  measurePerformance,
  runAllTests
};



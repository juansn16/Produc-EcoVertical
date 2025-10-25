import { Pool } from 'pg';

const db = new Pool({
  connectionString: 'postgresql://huertos_user:Z4MBJlvnx7d4cAig4MQ44apsMwml8Nog@dpg-d3tslsbipnbc738hc1n0-a.oregon-postgres.render.com/huertos',
  ssl: { rejectUnauthorized: false }
});

async function simulateControllerValidation() {
  try {
    console.log('🔍 Simulando validación del controlador...\n');
    
    // Simular exactamente lo que hace el controlador
    const simulateValidation = (fecha_alerta, hora_alerta) => {
      console.log(`\n📝 Simulando validación para: ${fecha_alerta} ${hora_alerta}`);
      
      // Esto es exactamente lo que hace el controlador
      const alertDateTime = new Date(`${fecha_alerta}T${hora_alerta}:00`);
      const now = new Date();
      
      console.log(`📅 alertDateTime: ${alertDateTime.toISOString()}`);
      console.log(`⏰ now: ${now.toISOString()}`);
      console.log(`🔍 alertDateTime <= now: ${alertDateTime <= now}`);
      
      if (alertDateTime <= now) {
        return {
          valid: false,
          message: 'La fecha y hora de la alerta no pueden ser en el pasado'
        };
      }
      
      return {
        valid: true,
        message: 'Fecha válida'
      };
    };
    
    // Probar con diferentes casos
    const testCases = [
      { fecha: '2025-10-25', hora: '23:00' }, // Debería ser válido
      { fecha: '2025-10-25', hora: '22:30' }, // Debería ser válido
      { fecha: '2025-10-25', hora: '22:00' }, // Debería ser válido
      { fecha: '2025-10-25', hora: '21:00' }, // Podría ser pasado
      { fecha: '2025-10-25', hora: '20:00' }, // Probablemente pasado
      { fecha: '2025-10-26', hora: '08:00' }, // Definitivamente futuro
    ];
    
    console.log('🧪 Probando diferentes casos...');
    testCases.forEach((testCase, index) => {
      const result = simulateValidation(testCase.fecha, testCase.hora);
      console.log(`\n${index + 1}. ${testCase.fecha} ${testCase.hora}: ${result.valid ? '✅' : '❌'} ${result.message}`);
    });
    
    // Verificar la hora actual exacta
    console.log('\n⏰ Hora actual exacta:');
    const now = new Date();
    console.log(`  - UTC: ${now.toISOString()}`);
    console.log(`  - Local: ${now.toString()}`);
    console.log(`  - Timestamp: ${now.getTime()}`);
    
    // Verificar qué hora sería "ahora mismo" en formato de entrada
    const nowLocal = new Date();
    const nowDateStr = nowLocal.toISOString().split('T')[0];
    const nowTimeStr = nowLocal.toTimeString().split(' ')[0].substring(0, 5);
    
    console.log(`\n📅 Si alguien ingresara "ahora mismo":`);
    console.log(`  - Fecha: ${nowDateStr}`);
    console.log(`  - Hora: ${nowTimeStr}`);
    
    const nowInput = simulateValidation(nowDateStr, nowTimeStr);
    console.log(`  - Resultado: ${nowInput.valid ? '✅' : '❌'} ${nowInput.message}`);
    
    // Probar con 1 minuto en el futuro
    const futureTime = new Date(now.getTime() + 60000);
    const futureDateStr = futureTime.toISOString().split('T')[0];
    const futureTimeStr = futureTime.toTimeString().split(' ')[0].substring(0, 5);
    
    console.log(`\n📅 Si alguien ingresara "1 minuto en el futuro":`);
    console.log(`  - Fecha: ${futureDateStr}`);
    console.log(`  - Hora: ${futureTimeStr}`);
    
    const futureInput = simulateValidation(futureDateStr, futureTimeStr);
    console.log(`  - Resultado: ${futureInput.valid ? '✅' : '❌'} ${futureInput.message}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.end();
    console.log('\n🔌 Conexión cerrada');
  }
}

simulateControllerValidation();

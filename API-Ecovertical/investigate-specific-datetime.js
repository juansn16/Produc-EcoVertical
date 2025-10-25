import { Pool } from 'pg';

const db = new Pool({
  connectionString: 'postgresql://huertos_user:Z4MBJlvnx7d4cAig4MQ44apsMwml8Nog@dpg-d3tslsbipnbc738hc1n0-a.oregon-postgres.render.com/huertos',
  ssl: { rejectUnauthorized: false }
});

async function investigateSpecificDateTimeIssue() {
  try {
    console.log('🔍 Investigando problema específico de fechas...\n');
    
    // 1. Verificar la hora exacta actual
    console.log('1️⃣ Hora exacta actual...');
    const nowResult = await db.query('SELECT NOW() as db_now, CURRENT_TIMESTAMP as db_current');
    console.log(`⏰ BD NOW(): ${nowResult.rows[0].db_now}`);
    console.log(`⏰ BD CURRENT_TIMESTAMP: ${nowResult.rows[0].db_current}`);
    
    const serverNow = new Date();
    console.log(`⏰ Servidor Node.js: ${serverNow.toISOString()}`);
    console.log(`⏰ Servidor Node.js (local): ${serverNow.toString()}`);
    
    // 2. Probar con fecha de HOY y hora específica
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const testTime = '23:00'; // Una hora futura
    
    console.log(`\n2️⃣ Probando con fecha de HOY...`);
    console.log(`📅 Fecha de hoy: ${todayStr}`);
    console.log(`🕐 Hora de prueba: ${testTime}`);
    
    // Crear fecha como lo hace el código
    const alertDateTime = new Date(`${todayStr}T${testTime}:00`);
    console.log(`📅 Fecha creada: ${alertDateTime.toISOString()}`);
    console.log(`📅 Fecha creada (local): ${alertDateTime.toString()}`);
    
    console.log(`\n🔍 Comparación:`);
    console.log(`  - alertDateTime: ${alertDateTime.toISOString()}`);
    console.log(`  - serverNow: ${serverNow.toISOString()}`);
    console.log(`  - alertDateTime > serverNow: ${alertDateTime > serverNow}`);
    console.log(`  - Diferencia en minutos: ${Math.round((alertDateTime.getTime() - serverNow.getTime()) / (1000 * 60))}`);
    
    // 3. Verificar qué pasa en PostgreSQL con la misma fecha
    console.log(`\n3️⃣ Verificando en PostgreSQL...`);
    const pgTest = await db.query(`
      SELECT 
        '${todayStr} ${testTime}:00'::timestamp as test_timestamp,
        NOW() as current_timestamp,
        '${todayStr} ${testTime}:00'::timestamp > NOW() as is_future,
        EXTRACT(EPOCH FROM ('${todayStr} ${testTime}:00'::timestamp - NOW())) as diff_seconds
    `);
    
    console.log(`📅 PostgreSQL test timestamp: ${pgTest.rows[0].test_timestamp}`);
    console.log(`⏰ PostgreSQL current: ${pgTest.rows[0].current_timestamp}`);
    console.log(`🔍 Es futuro según PostgreSQL: ${pgTest.rows[0].is_future}`);
    console.log(`⏱️ Diferencia en segundos: ${pgTest.rows[0].diff_seconds}`);
    
    // 4. Probar con diferentes horas para encontrar el problema
    console.log(`\n4️⃣ Probando diferentes horas...`);
    const hours = ['22:30', '22:45', '23:00', '23:15', '23:30'];
    
    for (const hour of hours) {
      const testDateTime = new Date(`${todayStr}T${hour}:00`);
      const isFuture = testDateTime > serverNow;
      const diffMinutes = Math.round((testDateTime.getTime() - serverNow.getTime()) / (1000 * 60));
      
      console.log(`🕐 ${hour}: ${isFuture ? '✅ Futuro' : '❌ Pasado'} (${diffMinutes} min)`);
    }
    
    // 5. Verificar si hay diferencia entre servidor y BD
    console.log(`\n5️⃣ Verificando diferencia servidor vs BD...`);
    const serverTime = new Date();
    const dbTime = await db.query('SELECT NOW() as db_time');
    
    console.log(`⏰ Servidor: ${serverTime.toISOString()}`);
    console.log(`⏰ BD: ${dbTime.rows[0].db_time}`);
    
    // Convertir BD time a Date para comparar
    const dbTimeAsDate = new Date(dbTime.rows[0].db_time);
    const diffMs = Math.abs(serverTime.getTime() - dbTimeAsDate.getTime());
    console.log(`⏱️ Diferencia: ${diffMs} ms`);
    
    // 6. Probar con fecha de mañana para confirmar que funciona
    console.log(`\n6️⃣ Probando con fecha de mañana...`);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const tomorrowTime = '08:00';
    
    const tomorrowDateTime = new Date(`${tomorrowStr}T${tomorrowTime}:00`);
    console.log(`📅 Mañana: ${tomorrowStr} ${tomorrowTime}`);
    console.log(`📅 Fecha creada: ${tomorrowDateTime.toISOString()}`);
    console.log(`🔍 Es futuro: ${tomorrowDateTime > serverNow}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.end();
    console.log('\n🔌 Conexión cerrada');
  }
}

investigateSpecificDateTimeIssue();

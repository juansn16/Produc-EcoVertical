import { Pool } from 'pg';

const db = new Pool({
  connectionString: 'postgresql://huertos_user:Z4MBJlvnx7d4cAig4MQ44apsMwml8Nog@dpg-d3tslsbipnbc738hc1n0-a.oregon-postgres.render.com/huertos',
  ssl: { rejectUnauthorized: false }
});

async function investigateDateTimeIssue() {
  try {
    console.log('🔍 Investigando problema de fechas en producción...\n');
    
    // 1. Verificar zona horaria del servidor de base de datos
    console.log('1️⃣ Verificando zona horaria de la base de datos...');
    const timezoneResult = await db.query('SELECT NOW() as db_time, current_setting(\'timezone\') as timezone');
    console.log(`⏰ Hora actual de la BD: ${timezoneResult.rows[0].db_time}`);
    console.log(`🌍 Zona horaria de la BD: ${timezoneResult.rows[0].timezone}`);
    
    // 2. Verificar zona horaria del servidor de aplicación (simulando)
    console.log('\n2️⃣ Verificando zona horaria del servidor de aplicación...');
    const serverTime = new Date();
    console.log(`⏰ Hora del servidor Node.js: ${serverTime.toISOString()}`);
    console.log(`🌍 Zona horaria del servidor: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
    
    // 3. Probar diferentes formatos de fecha
    console.log('\n3️⃣ Probando diferentes formatos de fecha...');
    
    const testDate = '2025-10-25';
    const testTime = '20:00';
    
    console.log(`📅 Fecha de prueba: ${testDate}`);
    console.log(`🕐 Hora de prueba: ${testTime}`);
    
    // Crear fecha como lo hace el código
    const alertDateTime = new Date(`${testDate}T${testTime}:00`);
    console.log(`📅 Fecha creada por JavaScript: ${alertDateTime.toISOString()}`);
    console.log(`📅 Fecha creada por JavaScript (local): ${alertDateTime.toString()}`);
    
    // Comparar con hora actual
    const now = new Date();
    console.log(`⏰ Hora actual del servidor: ${now.toISOString()}`);
    console.log(`⏰ Hora actual del servidor (local): ${now.toString()}`);
    
    console.log(`\n🔍 Comparación:`);
    console.log(`  - alertDateTime: ${alertDateTime.toISOString()}`);
    console.log(`  - now: ${now.toISOString()}`);
    console.log(`  - alertDateTime > now: ${alertDateTime > now}`);
    console.log(`  - Diferencia en minutos: ${(alertDateTime.getTime() - now.getTime()) / (1000 * 60)}`);
    
    // 4. Verificar cómo PostgreSQL interpreta las fechas
    console.log('\n4️⃣ Verificando interpretación de PostgreSQL...');
    const pgTest = await db.query(`
      SELECT 
        '${testDate} ${testTime}:00'::timestamp as pg_timestamp,
        NOW() as pg_now,
        '${testDate} ${testTime}:00'::timestamp > NOW() as is_future
    `);
    
    console.log(`📅 PostgreSQL timestamp: ${pgTest.rows[0].pg_timestamp}`);
    console.log(`⏰ PostgreSQL NOW(): ${pgTest.rows[0].pg_now}`);
    console.log(`🔍 Es futuro según PostgreSQL: ${pgTest.rows[0].is_future}`);
    
    // 5. Verificar configuración de zona horaria del cliente
    console.log('\n5️⃣ Verificando configuración de zona horaria...');
    const timezoneConfig = await db.query(`
      SELECT 
        current_setting('timezone') as db_timezone,
        current_setting('log_timezone') as log_timezone,
        current_setting('timezone_abbreviations') as timezone_abbrev
    `);
    
    console.log(`🌍 Zona horaria de BD: ${timezoneConfig.rows[0].db_timezone}`);
    console.log(`📝 Zona horaria de logs: ${timezoneConfig.rows[0].log_timezone}`);
    
    // 6. Probar con diferentes zonas horarias
    console.log('\n6️⃣ Probando con diferentes zonas horarias...');
    const timezones = ['UTC', 'America/Caracas', 'America/New_York'];
    
    for (const tz of timezones) {
      try {
        await db.query(`SET timezone = '${tz}'`);
        const tzTest = await db.query(`
          SELECT 
            NOW() as current_time,
            '${testDate} ${testTime}:00'::timestamp as test_time,
            '${testDate} ${testTime}:00'::timestamp > NOW() as is_future
        `);
        
        console.log(`\n🌍 Zona horaria: ${tz}`);
        console.log(`  - Hora actual: ${tzTest.rows[0].current_time}`);
        console.log(`  - Hora de prueba: ${tzTest.rows[0].test_time}`);
        console.log(`  - Es futuro: ${tzTest.rows[0].is_future}`);
      } catch (error) {
        console.log(`❌ Error con zona horaria ${tz}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.end();
    console.log('\n🔌 Conexión cerrada');
  }
}

investigateDateTimeIssue();

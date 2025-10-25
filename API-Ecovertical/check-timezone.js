import { Pool } from 'pg';

const db = new Pool({
  connectionString: 'postgresql://huertos_user:Z4MBJlvnx7d4cAig4MQ44apsMwml8Nog@dpg-d3tslsbipnbc738hc1n0-a.oregon-postgres.render.com/huertos',
  ssl: { rejectUnauthorized: false }
});

async function checkAndFixTimezone() {
  try {
    console.log('🔍 Verificando y corrigiendo zona horaria...\n');
    
    // 1. Verificar zona horaria actual del servidor
    console.log('1️⃣ Zona horaria actual del servidor...');
    const serverTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log(`🌍 Zona horaria del servidor Node.js: ${serverTz}`);
    
    // 2. Verificar zona horaria de la base de datos
    console.log('\n2️⃣ Zona horaria de la base de datos...');
    const dbTz = await db.query('SELECT current_setting(\'timezone\') as timezone');
    console.log(`🌍 Zona horaria de PostgreSQL: ${dbTz.rows[0].timezone}`);
    
    // 3. Mostrar hora actual en diferentes zonas
    console.log('\n3️⃣ Hora actual en diferentes zonas...');
    const now = new Date();
    console.log(`⏰ UTC: ${now.toISOString()}`);
    console.log(`⏰ Local (${serverTz}): ${now.toString()}`);
    
    // 4. Probar con zona horaria de Venezuela
    console.log('\n4️⃣ Probando con zona horaria de Venezuela...');
    
    // Configurar zona horaria de Venezuela en PostgreSQL
    await db.query("SET timezone = 'America/Caracas'");
    
    const venezuelaTime = await db.query('SELECT NOW() as venezuela_time');
    console.log(`⏰ Hora en Venezuela (BD): ${venezuelaTime.rows[0].venezuela_time}`);
    
    // 5. Probar validación con zona horaria correcta
    console.log('\n5️⃣ Probando validación con zona horaria correcta...');
    
    const testDate = '2025-10-25';
    const testTime = '20:00';
    
    // Crear fecha considerando zona horaria de Venezuela
    const alertDateTime = new Date(`${testDate}T${testTime}:00-04:00`); // GMT-4
    const nowVenezuela = new Date();
    
    console.log(`📅 Fecha de prueba: ${testDate} ${testTime}`);
    console.log(`📅 alertDateTime (Venezuela): ${alertDateTime.toISOString()}`);
    console.log(`⏰ now (Venezuela): ${nowVenezuela.toISOString()}`);
    console.log(`🔍 Es futuro: ${alertDateTime > nowVenezuela}`);
    
    // 6. Verificar qué pasa si usamos UTC en el servidor
    console.log('\n6️⃣ Comparando con UTC...');
    
    // Restaurar UTC
    await db.query("SET timezone = 'UTC'");
    const utcTime = await db.query('SELECT NOW() as utc_time');
    console.log(`⏰ Hora UTC (BD): ${utcTime.rows[0].utc_time}`);
    
    // Crear fecha en UTC
    const alertDateTimeUTC = new Date(`${testDate}T${testTime}:00Z`);
    console.log(`📅 alertDateTime (UTC): ${alertDateTimeUTC.toISOString()}`);
    console.log(`🔍 Es futuro (UTC): ${alertDateTimeUTC > nowVenezuela}`);
    
    // 7. Recomendación
    console.log('\n7️⃣ Recomendación...');
    console.log('💡 El problema es que el servidor de Render está en UTC');
    console.log('💡 Pero los usuarios están en Venezuela (GMT-4)');
    console.log('💡 Cuando ingresan "20:00", esperan que sea 20:00 hora de Venezuela');
    console.log('💡 Pero el servidor lo interpreta como 20:00 UTC');
    
    console.log('\n🔧 Soluciones posibles:');
    console.log('1. Configurar el servidor para usar zona horaria de Venezuela');
    console.log('2. Ajustar la validación para considerar la zona horaria del usuario');
    console.log('3. Usar UTC en toda la aplicación y convertir en el frontend');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.end();
    console.log('\n🔌 Conexión cerrada');
  }
}

checkAndFixTimezone();

import { Pool } from 'pg';

console.log('🔗 Iniciando conexión a base de datos de producción...');

const db = new Pool({
  connectionString: 'postgresql://huertos_user:Z4MBJlvnx7d4cAig4MQ44apsMwml8Nog@dpg-d3tslsbipnbc738hc1n0-a.oregon-postgres.render.com/huertos',
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    console.log('🔗 Probando conexión...');
    const result = await db.query('SELECT NOW() as current_time');
    console.log('✅ Conexión exitosa!');
    console.log('⏰ Hora actual de la BD:', result.rows[0].current_time);
    
    // Verificar si existe la tabla usuarios_conectados
    console.log('\n🔍 Verificando tabla usuarios_conectados...');
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios_conectados'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ La tabla usuarios_conectados existe');
      
      // Contar registros
      const countResult = await db.query('SELECT COUNT(*) as total FROM usuarios_conectados');
      console.log(`📊 Total registros: ${countResult.rows[0].total}`);
      
      // Mostrar registros recientes
      if (countResult.rows[0].total > 0) {
        const recentRecords = await db.query(`
          SELECT uc.*, u.nombre, u.email, u.ubicacion_id
          FROM usuarios_conectados uc
          JOIN usuarios u ON uc.usuario_id = u.id
          ORDER BY uc.fecha_conexion DESC
          LIMIT 5
        `);
        
        console.log('\n📋 Últimos 5 registros:');
        recentRecords.rows.forEach(record => {
          console.log(`  - ${record.nombre} (${record.usuario_id}) - ${record.fecha_conexion}`);
        });
      }
    } else {
      console.log('❌ La tabla usuarios_conectados NO existe');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.end();
    console.log('🔌 Conexión cerrada');
  }
}

testConnection();

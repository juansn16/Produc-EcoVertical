import { Pool } from 'pg';

const db = new Pool({
  connectionString: 'postgresql://huertos_user:Z4MBJlvnx7d4cAig4MQ44apsMwml8Nog@dpg-d3tslsbipnbc738hc1n0-a.oregon-postgres.render.com/huertos',
  ssl: { rejectUnauthorized: false }
});

async function fixTableStructure() {
  try {
    console.log('🔧 Corrigiendo estructura de la tabla usuarios_conectados...\n');
    
    // 1. Verificar usuarios disponibles
    console.log('1️⃣ Usuarios disponibles en producción:');
    const users = await db.query(`
      SELECT id, nombre, email, rol, ubicacion_id 
      FROM usuarios 
      ORDER BY created_at DESC
    `);
    
    users.rows.forEach(user => {
      console.log(`  - ${user.nombre} (${user.email}) - Rol: ${user.rol}`);
    });
    
    // 2. Corregir la estructura de la tabla usuarios_conectados
    console.log('\n2️⃣ Corrigiendo estructura de la tabla...');
    
    // Eliminar la columna ultima_actividad si existe
    try {
      await db.query('ALTER TABLE usuarios_conectados DROP COLUMN IF EXISTS ultima_actividad');
      console.log('✅ Columna ultima_actividad eliminada');
    } catch (error) {
      console.log('ℹ️ Columna ultima_actividad no existe o ya fue eliminada');
    }
    
    // 3. Verificar estructura final
    console.log('\n3️⃣ Estructura final de la tabla:');
    const columns = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'usuarios_conectados'
      ORDER BY ordinal_position;
    `);
    
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // 4. Probar inserción de un usuario de prueba
    console.log('\n4️⃣ Probando inserción de usuario de prueba...');
    const testUser = users.rows[0]; // Usar el primer usuario disponible
    
    try {
      await db.query(`
        INSERT INTO usuarios_conectados (usuario_id, socket_id, fecha_conexion) 
        VALUES ($1, $2, NOW())
        ON CONFLICT (usuario_id) DO UPDATE SET 
          socket_id = EXCLUDED.socket_id,
          fecha_conexion = NOW()
      `, [testUser.id, 'test-socket-123']);
      
      console.log(`✅ Usuario de prueba insertado: ${testUser.nombre}`);
      
      // Verificar que se insertó
      const count = await db.query('SELECT COUNT(*) as total FROM usuarios_conectados');
      console.log(`📊 Total registros ahora: ${count.rows[0].total}`);
      
    } catch (error) {
      console.error('❌ Error insertando usuario de prueba:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.end();
    console.log('\n🔌 Conexión cerrada');
  }
}

fixTableStructure();

import { Pool } from 'pg';

const db = new Pool({
  connectionString: 'postgresql://huertos_user:Z4MBJlvnx7d4cAig4MQ44apsMwml8Nog@dpg-d3tslsbipnbc738hc1n0-a.oregon-postgres.render.com/huertos',
  ssl: { rejectUnauthorized: false }
});

async function fixUniqueConstraint() {
  try {
    console.log('🔧 Corrigiendo restricción UNIQUE...\n');
    
    // 1. Agregar restricción UNIQUE en usuario_id
    console.log('1️⃣ Agregando restricción UNIQUE en usuario_id...');
    try {
      await db.query(`
        ALTER TABLE usuarios_conectados 
        ADD CONSTRAINT usuarios_conectados_usuario_id_unique 
        UNIQUE (usuario_id)
      `);
      console.log('✅ Restricción UNIQUE agregada');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️ Restricción UNIQUE ya existe');
      } else {
        console.error('❌ Error agregando restricción:', error.message);
      }
    }
    
    // 2. Probar inserción con ON CONFLICT
    console.log('\n2️⃣ Probando inserción con ON CONFLICT...');
    const users = await db.query('SELECT id, nombre, email FROM usuarios LIMIT 1');
    const testUser = users.rows[0];
    
    try {
      await db.query(`
        INSERT INTO usuarios_conectados (usuario_id, socket_id, fecha_conexion) 
        VALUES ($1, $2, NOW())
        ON CONFLICT (usuario_id) DO UPDATE SET 
          socket_id = EXCLUDED.socket_id,
          fecha_conexion = NOW()
      `, [testUser.id, 'test-socket-789']);
      
      console.log(`✅ Usuario insertado/actualizado: ${testUser.nombre}`);
      
      // Verificar resultado
      const result = await db.query(`
        SELECT uc.*, u.nombre 
        FROM usuarios_conectados uc
        JOIN usuarios u ON uc.usuario_id = u.id
        WHERE uc.usuario_id = $1
      `, [testUser.id]);
      
      if (result.rows.length > 0) {
        const record = result.rows[0];
        console.log(`📊 Registro: ${record.nombre} - Socket: ${record.socket_id} - Fecha: ${record.fecha_conexion}`);
      }
      
    } catch (error) {
      console.error('❌ Error en inserción:', error.message);
    }
    
    // 3. Verificar total de registros
    const count = await db.query('SELECT COUNT(*) as total FROM usuarios_conectados');
    console.log(`\n📊 Total registros en usuarios_conectados: ${count.rows[0].total}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.end();
    console.log('\n🔌 Conexión cerrada');
  }
}

fixUniqueConstraint();

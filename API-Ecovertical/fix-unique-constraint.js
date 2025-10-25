import { Pool } from 'pg';

const db = new Pool({
  connectionString: 'postgresql://huertos_user:Z4MBJlvnx7d4cAig4MQ44apsMwml8Nog@dpg-d3tslsbipnbc738hc1n0-a.oregon-postgres.render.com/huertos',
  ssl: { rejectUnauthorized: false }
});

async function fixUniqueConstraint() {
  try {
    console.log('🔧 Corrigiendo restricción UNIQUE...\n');
    
    // 1. Verificar restricciones actuales
    console.log('1️⃣ Verificando restricciones actuales...');
    const constraints = await db.query(`
      SELECT constraint_name, constraint_type, column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu 
        ON tc.constraint_name = ccu.constraint_name
      WHERE tc.table_name = 'usuarios_conectados'
    `);
    
    console.log('📋 Restricciones existentes:');
    constraints.rows.forEach(constraint => {
      console.log(`  - ${constraint.constraint_name}: ${constraint.constraint_type} (${constraint.column_name})`);
    });
    
    // 2. Agregar restricción UNIQUE si no existe
    console.log('\n2️⃣ Agregando restricción UNIQUE en usuario_id...');
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
    
    // 3. Probar inserción con ON CONFLICT
    console.log('\n3️⃣ Probando inserción con ON CONFLICT...');
    const users = await db.query('SELECT id, nombre, email FROM usuarios LIMIT 1');
    const testUser = users.rows[0];
    
    try {
      await db.query(`
        INSERT INTO usuarios_conectados (usuario_id, socket_id, fecha_conexion) 
        VALUES ($1, $2, NOW())
        ON CONFLICT (usuario_id) DO UPDATE SET 
          socket_id = EXCLUDED.socket_id,
          fecha_conexion = NOW()
      `, [testUser.id, 'test-socket-456']);
      
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
    
    // 4. Verificar total de registros
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

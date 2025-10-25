import { Pool } from 'pg';

const db = new Pool({
  connectionString: 'postgresql://huertos_user:Z4MBJlvnx7d4cAig4MQ44apsMwml8Nog@dpg-d3tslsbipnbc738hc1n0-a.oregon-postgres.render.com/huertos',
  ssl: { rejectUnauthorized: false }
});

async function investigateUsers() {
  try {
    console.log('🔍 Investigando usuarios y estructura...\n');
    
    // 1. Verificar usuarios en la tabla usuarios
    console.log('1️⃣ Verificando usuarios en la tabla usuarios...');
    const usersResult = await db.query('SELECT COUNT(*) as total FROM usuarios');
    console.log(`📊 Total usuarios: ${usersResult.rows[0].total}`);
    
    if (usersResult.rows[0].total > 0) {
      const users = await db.query(`
        SELECT id, nombre, email, rol, ubicacion_id 
        FROM usuarios 
        ORDER BY created_at DESC 
        LIMIT 5
      `);
      
      console.log('\n📋 Últimos 5 usuarios:');
      users.rows.forEach(user => {
        console.log(`  - ${user.nombre} (${user.email}) - Rol: ${user.rol} - Ubicación: ${user.ubicacion_id}`);
      });
    }
    
    // 2. Verificar estructura de usuarios_conectados
    console.log('\n2️⃣ Verificando estructura de usuarios_conectados...');
    const columns = await db.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'usuarios_conectados'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Columnas de usuarios_conectados:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // 3. Verificar si hay algún usuario específico (el tuyo)
    console.log('\n3️⃣ Buscando usuario específico...');
    const specificUser = await db.query(`
      SELECT id, nombre, email, rol, ubicacion_id 
      FROM usuarios 
      WHERE email = 'juansnuvaez@gmail.com'
    `);
    
    if (specificUser.rows.length > 0) {
      const user = specificUser.rows[0];
      console.log(`✅ Usuario encontrado: ${user.nombre} (${user.id})`);
      console.log(`   - Rol: ${user.rol}`);
      console.log(`   - Ubicación: ${user.ubicacion_id}`);
      
      // Verificar si tiene registros en usuarios_conectados
      const userConnections = await db.query(`
        SELECT * FROM usuarios_conectados WHERE usuario_id = $1
      `, [user.id]);
      
      console.log(`   - Conexiones en usuarios_conectados: ${userConnections.rows.length}`);
    } else {
      console.log('❌ Usuario juansnuvaez@gmail.com no encontrado');
    }
    
    // 4. Verificar índices y restricciones
    console.log('\n4️⃣ Verificando índices...');
    const indexes = await db.query(`
      SELECT indexname, indexdef
      FROM pg_indexes 
      WHERE tablename = 'usuarios_conectados'
    `);
    
    console.log('📋 Índices existentes:');
    indexes.rows.forEach(idx => {
      console.log(`  - ${idx.indexname}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.end();
    console.log('\n🔌 Conexión cerrada');
  }
}

investigateUsers();

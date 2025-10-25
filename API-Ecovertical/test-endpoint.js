import { Pool } from 'pg';

const db = new Pool({
  connectionString: 'postgresql://huertos_user:Z4MBJlvnx7d4cAig4MQ44apsMwml8Nog@dpg-d3tslsbipnbc738hc1n0-a.oregon-postgres.render.com/huertos',
  ssl: { rejectUnauthorized: false }
});

async function testConnectedUsersEndpoint() {
  try {
    console.log('🔍 Probando endpoint de usuarios conectados...\n');
    
    // Simular la consulta que hace el endpoint
    const userLocationId = '1010eef2-d88e-4754-bf6e-7fb107f66d48'; // Condominio de los usuarios
    
    console.log(`📍 Condominio: ${userLocationId}`);
    
    const query = `
      SELECT uc.usuario_id, uc.socket_id, uc.fecha_conexion,
             u.nombre, u.rol, u.email, u.ubicacion_id
      FROM usuarios_conectados uc
      JOIN usuarios u ON uc.usuario_id = u.id
      WHERE uc.fecha_conexion >= NOW() - INTERVAL '1 HOUR'
      AND u.ubicacion_id = $1
      ORDER BY uc.fecha_conexion DESC
    `;
    
    console.log('📝 Query ejecutada:', query);
    console.log('📝 Parámetros:', [userLocationId]);
    
    const result = await db.query(query, [userLocationId]);
    const users = result.rows;
    
    console.log(`\n📊 Usuarios encontrados: ${users.length}`);
    
    if (users.length > 0) {
      console.log('\n📋 Usuarios conectados:');
      users.forEach(user => {
        console.log(`  - ${user.nombre} (${user.email}) - Rol: ${user.rol}`);
        console.log(`    Socket: ${user.socket_id} - Fecha: ${user.fecha_conexion}`);
      });
      
      // Simular respuesta del endpoint
      const response = {
        success: true,
        data: {
          connectedUsers: users.map(user => ({
            usuario_id: user.usuario_id,
            nombre: user.nombre,
            rol: user.rol,
            email: user.email,
            ubicacion_id: user.ubicacion_id,
            socket_id: user.socket_id,
            fecha_conexion: user.fecha_conexion,
            isOnline: true,
            currentSocketId: user.socket_id,
            connectionStatus: 'active'
          })),
          totalConnections: users.length,
          uniqueUsers: users.length,
          condominio: userLocationId,
          timestamp: new Date().toISOString()
        }
      };
      
      console.log('\n✅ Respuesta del endpoint:');
      console.log(JSON.stringify(response, null, 2));
      
    } else {
      console.log('❌ No se encontraron usuarios conectados');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.end();
    console.log('\n🔌 Conexión cerrada');
  }
}

testConnectedUsersEndpoint();

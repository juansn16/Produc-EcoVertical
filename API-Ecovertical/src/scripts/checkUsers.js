import db from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuarios en la base de datos...');

    const [users] = await db.execute(
      'SELECT id, nombre, email, rol FROM usuarios WHERE is_deleted = 0'
    );

    console.log('👥 Usuarios encontrados:', users.length);
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.nombre} (${user.email}) - Rol: ${user.rol} - ID: ${user.id}`);
    });

    if (users.length > 0) {
      console.log('\n🔑 Usando el primer usuario para generar token de prueba...');
      const testUser = users[0];
      
      // Generar token para el usuario existente
      const jwt = await import('jsonwebtoken');
      const token = jwt.default.sign(
        { 
          id: testUser.id, 
          role: testUser.rol
        }, 
        'dev_access_secret_change_in_production', 
        { expiresIn: '1h' }
      );
      
      console.log('✅ Token generado para:', testUser.nombre);
      console.log('🔐 Token:', token);
    }

  } catch (error) {
    console.error('❌ Error al verificar usuarios:', error);
  } finally {
    await db.end();
  }
}

checkUsers()
  .then(() => console.log('✅ Verificación completada'))
  .catch((err) => console.error('❌ Error en verificación:', err));

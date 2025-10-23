import db from '../config/db.js';

async function checkGardens() {
  try {
    console.log('🔍 Verificando huertos en la base de datos...');

    // Verificar todos los huertos
    const [allGardens] = await db.execute(
      'SELECT id, nombre, tipo FROM huertos WHERE is_deleted = 0'
    );

    console.log('📋 Todos los huertos:');
    allGardens.forEach(garden => {
      console.log(`  - ${garden.nombre} (${garden.tipo}) - ID: ${garden.id}`);
    });

    // Verificar huertos públicos específicamente
    const [publicGardens] = await db.execute(
      'SELECT id, nombre, tipo FROM huertos WHERE tipo = "publico" AND is_deleted = 0'
    );

    console.log('\n🏛️ Huertos públicos:');
    if (publicGardens.length === 0) {
      console.log('  ❌ No hay huertos públicos en la base de datos');
    } else {
      publicGardens.forEach(garden => {
        console.log(`  - ${garden.nombre} (${garden.tipo}) - ID: ${garden.id}`);
      });
    }

    // Verificar si hay usuarios asociados a huertos
    const [userGardens] = await db.execute(
      'SELECT uh.huerto_id, h.nombre as huerto_nombre, uh.usuario_id, u.nombre as usuario_nombre, uh.rol FROM usuario_huerto uh JOIN huertos h ON uh.huerto_id = h.id JOIN usuarios u ON uh.usuario_id = u.id WHERE uh.is_deleted = 0'
    );

    console.log('\n👥 Asociaciones usuario-huerto:');
    if (userGardens.length === 0) {
      console.log('  ❌ No hay asociaciones usuario-huerto');
    } else {
      userGardens.forEach(assoc => {
        console.log(`  - Usuario: ${assoc.usuario_nombre} -> Huerto: ${assoc.huerto_nombre} (${assoc.rol})`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error verificando huertos:', error);
    process.exit(1);
  }
}

checkGardens();

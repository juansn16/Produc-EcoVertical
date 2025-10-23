import db from '../config/db.js';

async function checkTables() {
  try {
    console.log('🔍 Verificando tablas...');

    // Verificar si existe la tabla alertas_programadas_riego
    const [tables] = await db.execute(
      "SHOW TABLES LIKE 'alertas_programadas_riego'"
    );

    if (tables.length > 0) {
      console.log('✅ Tabla alertas_programadas_riego existe');
    } else {
      console.log('❌ Tabla alertas_programadas_riego NO existe');
    }

    // Verificar si existe la tabla notificaciones_alertas_riego
    const [notifTables] = await db.execute(
      "SHOW TABLES LIKE 'notificaciones_alertas_riego'"
    );

    if (notifTables.length > 0) {
      console.log('✅ Tabla notificaciones_alertas_riego existe');
    } else {
      console.log('❌ Tabla notificaciones_alertas_riego NO existe');
    }

    // Mostrar todas las tablas
    const [allTables] = await db.execute("SHOW TABLES");
    console.log('\n📋 Todas las tablas en la base de datos:');
    allTables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error verificando tablas:', error);
    process.exit(1);
  }
}

checkTables();


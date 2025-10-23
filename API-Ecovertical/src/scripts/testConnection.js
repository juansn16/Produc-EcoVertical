import mysql from "mysql2/promise";

async function testConnection() {
  let connection;
  try {
    console.log('🔍 Probando conexión a la base de datos...');
    
    // Configuración de conexión (ajusta según tu configuración)
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'huertos'
    });

    console.log('✅ Conexión exitosa a la base de datos');

    // Verificar tablas existentes
    const [tables] = await connection.execute("SHOW TABLES");
    console.log('\n📋 Tablas existentes:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });

    // Verificar si las tablas problemáticas existen
    const [alertasProgramadas] = await connection.execute("SHOW TABLES LIKE 'alertas_programadas_riego'");
    const [alertasRiego] = await connection.execute("SHOW TABLES LIKE 'alertas_riego'");
    
    console.log('\n🔍 Estado de las tablas problemáticas:');
    console.log(`  - alertas_programadas_riego: ${alertasProgramadas.length > 0 ? '✅ Existe' : '❌ No existe'}`);
    console.log(`  - alertas_riego: ${alertasRiego.length > 0 ? '✅ Existe' : '❌ No existe'}`);

    if (alertasProgramadas.length === 0 || alertasRiego.length === 0) {
      console.log('\n⚠️  Algunas tablas faltan. Necesitas ejecutar los scripts de migración.');
    }

  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.log('\n💡 Posibles soluciones:');
    console.log('  1. Verifica que MySQL esté ejecutándose');
    console.log('  2. Verifica la configuración de conexión (host, puerto, usuario, contraseña)');
    console.log('  3. Verifica que la base de datos "huertos" exista');
    console.log('  4. Crea un archivo .env con la configuración correcta');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testConnection();





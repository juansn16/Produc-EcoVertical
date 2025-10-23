import mysql from "mysql2/promise";

async function diagnoseDatabaseConnection() {
  console.log('🔍 Diagnosticando conexión a la base de datos...\n');
  
  // Configuraciones comunes para probar
  const configs = [
    { host: 'localhost', port: 3306, user: 'root', password: '', database: 'huertos', name: 'MySQL puerto 3306 (estándar)' },
    { host: 'localhost', port: 3305, user: 'root', password: '', database: 'huertos', name: 'MySQL puerto 3305 (XAMPP/WAMP)' },
    { host: '127.0.0.1', port: 3306, user: 'root', password: '', database: 'huertos', name: 'MySQL 127.0.0.1 puerto 3306' },
    { host: '127.0.0.1', port: 3305, user: 'root', password: '', database: 'huertos', name: 'MySQL 127.0.0.1 puerto 3305' }
  ];

  for (const config of configs) {
    try {
      console.log(`🔄 Probando: ${config.name}...`);
      
      const connection = await mysql.createConnection({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        connectTimeout: 5000 // 5 segundos timeout
      });

      // Probar la conexión
      await connection.execute('SELECT 1 as test');
      
      console.log(`✅ ¡Conexión exitosa con ${config.name}!`);
      
      // Verificar si la base de datos existe
      const [databases] = await connection.execute('SHOW DATABASES');
      const dbExists = databases.some(db => Object.values(db)[0] === 'huertos');
      
      if (dbExists) {
        console.log('✅ Base de datos "huertos" existe');
        
        // Verificar tablas existentes
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`📋 Tablas existentes (${tables.length}):`);
        tables.forEach(table => {
          console.log(`  - ${Object.values(table)[0]}`);
        });
        
        // Verificar tablas problemáticas
        const [alertasProgramadas] = await connection.execute("SHOW TABLES LIKE 'alertas_programadas_riego'");
        const [alertasRiego] = await connection.execute("SHOW TABLES LIKE 'alertas_riego'");
        
        console.log('\n🔍 Estado de las tablas problemáticas:');
        console.log(`  - alertas_programadas_riego: ${alertasProgramadas.length > 0 ? '✅ Existe' : '❌ No existe'}`);
        console.log(`  - alertas_riego: ${alertasRiego.length > 0 ? '✅ Existe' : '❌ No existe'}`);
        
        if (alertasProgramadas.length === 0 || alertasRiego.length === 0) {
          console.log('\n⚠️  Necesitas crear las tablas faltantes.');
          console.log('💡 Configuración correcta encontrada:');
          console.log(`   DB_HOST=${config.host}`);
          console.log(`   DB_PORT=${config.port}`);
          console.log(`   DB_USER=${config.user}`);
          console.log(`   DB_PASS=${config.password}`);
          console.log(`   DB_NAME=${config.database}`);
        }
        
      } else {
        console.log('❌ Base de datos "huertos" no existe');
        console.log('💡 Necesitas crear la base de datos primero');
      }
      
      await connection.end();
      return; // Si encontramos una conexión exitosa, salimos
      
    } catch (error) {
      console.log(`❌ Falló: ${error.message}`);
    }
  }
  
  console.log('\n❌ No se pudo conectar con ninguna configuración');
  console.log('\n💡 Posibles soluciones:');
  console.log('  1. Verifica que MySQL esté instalado y ejecutándose');
  console.log('  2. Si usas XAMPP/WAMP, asegúrate de que esté iniciado');
  console.log('  3. Verifica que el puerto no esté siendo usado por otro servicio');
  console.log('  4. Crea la base de datos "huertos" si no existe');
  console.log('  5. Verifica las credenciales de usuario (usuario/contraseña)');
}

diagnoseDatabaseConnection();





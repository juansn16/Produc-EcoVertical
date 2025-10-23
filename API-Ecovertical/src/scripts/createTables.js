import fs from 'fs';
import path from 'path';
import db from '../config/db.js';

async function createTables() {
  try {
    console.log('🔄 Creando tablas de alertas programadas de riego...');

    // Leer el archivo SQL
    const sqlPath = path.join(process.cwd(), 'src', 'models', 'alertas_programadas_riego.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Dividir el contenido en consultas individuales
    const queries = sqlContent
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0 && !query.startsWith('--'));

    // Ejecutar cada consulta
    for (const query of queries) {
      if (query.trim()) {
        console.log(`📝 Ejecutando: ${query.substring(0, 50)}...`);
        await db.execute(query);
      }
    }

    console.log('✅ Tablas creadas exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando tablas:', error);
    process.exit(1);
  }
}

createTables();


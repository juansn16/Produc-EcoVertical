import db from './src/config/db.js';
import fs from 'fs';
import path from 'path';

async function createIrrigationAlertsTables() {
  try {
    console.log('🌱 Creando tablas para el sistema de alertas de riego en PostgreSQL...');

    // Leer el archivo SQL
    const sqlPath = path.join(process.cwd(), 'migrations', 'create_irrigation_alerts_tables_postgresql.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Dividir el contenido en consultas individuales
    const queries = sqlContent
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0 && !query.startsWith('--'));

    // Ejecutar cada consulta
    for (const query of queries) {
      if (query.trim()) {
        try {
          await db.query(query);
          console.log('✅ Consulta ejecutada:', query.substring(0, 50) + '...');
        } catch (error) {
          if (error.message.includes('already exists')) {
            console.log('⚠️ Ya existe:', query.substring(0, 50) + '...');
          } else {
            console.error('❌ Error ejecutando consulta:', error.message);
            console.error('Consulta:', query);
          }
        }
      }
    }

    // Verificar que las tablas existen
    console.log('\n🔍 Verificando tablas creadas...');
    
    const tables = ['alertas_riego', 'notificaciones_alertas', 'usuarios_conectados'];
    
    for (const tableName of tables) {
      try {
        const result = await db.query(`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_name = $1 AND table_schema = 'public'
        `, [tableName]);
        
        if (result.rows[0].count > 0) {
          console.log(`✅ Tabla ${tableName} existe`);
          
          // Contar registros
          const countResult = await db.query(`SELECT COUNT(*) as count FROM ${tableName}`);
          console.log(`   📊 Registros: ${countResult.rows[0].count}`);
        } else {
          console.log(`❌ Tabla ${tableName} NO existe`);
        }
      } catch (error) {
        console.error(`❌ Error verificando tabla ${tableName}:`, error.message);
      }
    }

    console.log('\n🎉 Migración completada!');

  } catch (error) {
    console.error('❌ Error en la migración:', error);
  } finally {
    await db.end();
  }
}

// Ejecutar la migración
createIrrigationAlertsTables();

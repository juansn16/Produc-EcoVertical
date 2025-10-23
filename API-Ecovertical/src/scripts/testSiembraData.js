import db from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function testSiembraData() {
  try {
    console.log('🔍 Verificando datos de siembra en la base de datos...');

    // Obtener todos los huertos
    const [gardens] = await db.execute(
      'SELECT id, nombre FROM huertos WHERE is_deleted = 0'
    );

    console.log('🏡 Huertos encontrados:', gardens.length);
    gardens.forEach(garden => {
      console.log(`  - ${garden.nombre} (ID: ${garden.id})`);
    });

    if (gardens.length === 0) {
      console.log('❌ No hay huertos en la base de datos');
      return;
    }

    // Probar con el primer huerto
    const testGardenId = gardens[0].id;
    console.log(`\n🧪 Probando con huerto: ${gardens[0].nombre} (${testGardenId})`);

    // Verificar comentarios de siembra
    const [siembraComments] = await db.execute(`
      SELECT 
        c.id,
        c.tipo_comentario,
        c.fecha_creacion,
        c.contenido,
        hd.cantidad_siembra,
        hd.fecha
      FROM comentarios c
      LEFT JOIN huerto_data hd ON c.id = hd.comentario_id AND hd.is_deleted = 0
      WHERE c.huerto_id = ? 
        AND c.tipo_comentario = 'siembra' 
        AND c.is_deleted = 0
      ORDER BY c.fecha_creacion DESC
    `, [testGardenId]);

    console.log(`\n🌱 Comentarios de siembra encontrados: ${siembraComments.length}`);
    siembraComments.forEach((comment, index) => {
      console.log(`  ${index + 1}. Fecha: ${comment.fecha_creacion}`);
      console.log(`     Contenido: ${comment.contenido}`);
      console.log(`     Cantidad siembra: ${comment.cantidad_siembra || 'No especificada'}`);
      console.log(`     Fecha huerto_data: ${comment.fecha || 'No especificada'}`);
      console.log('');
    });

    // Verificar datos en huerto_data
    const [huertoData] = await db.execute(`
      SELECT 
        hd.id,
        hd.fecha,
        hd.cantidad_siembra,
        hd.cantidad_cosecha,
        c.tipo_comentario,
        c.contenido
      FROM huerto_data hd
      INNER JOIN comentarios c ON hd.comentario_id = c.id
      WHERE hd.huerto_id = ? 
        AND hd.is_deleted = 0 
        AND c.is_deleted = 0
        AND (hd.cantidad_siembra > 0 OR hd.cantidad_cosecha > 0)
      ORDER BY hd.fecha DESC
    `, [testGardenId]);

    console.log(`\n📊 Datos en huerto_data: ${huertoData.length}`);
    huertoData.forEach((data, index) => {
      console.log(`  ${index + 1}. Fecha: ${data.fecha}`);
      console.log(`     Tipo: ${data.tipo_comentario}`);
      console.log(`     Siembra: ${data.cantidad_siembra || 0}`);
      console.log(`     Cosecha: ${data.cantidad_cosecha || 0}`);
      console.log(`     Contenido: ${data.contenido}`);
      console.log('');
    });

    // Probar la consulta que usa el controlador de estadísticas
    console.log('\n🔍 Probando consulta del controlador de estadísticas...');
    const [plantingData] = await db.execute(`
      SELECT 
        hd.fecha,
        hd.cantidad_siembra,
        hd.cantidad_cosecha,
        hd.comentario_id,
        hd.siembra_relacionada,
        c.tipo_comentario,
        c.fecha_creacion,
        c.contenido
      FROM huerto_data hd
      INNER JOIN comentarios c ON hd.comentario_id = c.id
      WHERE hd.huerto_id = ? 
        AND (hd.cantidad_siembra > 0 OR hd.cantidad_cosecha > 0)
        AND hd.is_deleted = 0 
        AND c.is_deleted = 0 
        AND hd.fecha IS NOT NULL
        AND c.tipo_comentario IN ('siembra', 'cosecha')
      ORDER BY c.fecha_creacion DESC
      LIMIT 50
    `, [testGardenId]);

    console.log(`📈 Datos de siembra/cosecha para estadísticas: ${plantingData.length}`);
    plantingData.forEach((data, index) => {
      console.log(`  ${index + 1}. Fecha: ${data.fecha}`);
      console.log(`     Tipo: ${data.tipo_comentario}`);
      console.log(`     Siembra: ${data.cantidad_siembra || 0}`);
      console.log(`     Cosecha: ${data.cantidad_cosecha || 0}`);
      console.log(`     Siembra relacionada: ${data.siembra_relacionada || 'No'}`);
      console.log('');
    });

    // Verificar si hay datos de otros tipos de comentarios
    const [otherComments] = await db.execute(`
      SELECT 
        c.tipo_comentario,
        COUNT(*) as count
      FROM comentarios c
      WHERE c.huerto_id = ? AND c.is_deleted = 0
      GROUP BY c.tipo_comentario
      ORDER BY count DESC
    `, [testGardenId]);

    console.log('\n📋 Resumen de comentarios por tipo:');
    otherComments.forEach(comment => {
      console.log(`  - ${comment.tipo_comentario}: ${comment.count} comentarios`);
    });

  } catch (error) {
    console.error('❌ Error al verificar datos de siembra:', error);
  } finally {
    await db.end();
  }
}

testSiembraData()
  .then(() => console.log('✅ Verificación completada'))
  .catch((err) => console.error('❌ Error en verificación:', err));

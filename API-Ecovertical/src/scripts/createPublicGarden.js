import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

async function createPublicGarden() {
  try {
    console.log('🌱 Creando huerto público...');

    const gardenId = uuidv4();
    const userId = '95b0d4af-91a3-11f0-8bda-dc1ba1b74868'; // ID del usuario Angel Rangel

    // Crear huerto público
    await db.execute(
      `INSERT INTO huertos (id, nombre, tipo, descripcion, superficie, capacidad, is_deleted, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        gardenId,
        'Huerto Comunitario Central',
        'publico',
        'Huerto público para uso comunitario del condominio',
        50.0, // 50 m²
        20,   // capacidad para 20 personas
        0
      ]
    );

    console.log('✅ Huerto público creado:', gardenId);

    // Asociar el usuario como propietario del huerto público
    await db.execute(
      `INSERT INTO usuario_huerto (id, usuario_id, huerto_id, rol, is_deleted, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        uuidv4(),
        userId,
        gardenId,
        'propietario',
        0
      ]
    );

    console.log('✅ Usuario asociado al huerto público');

    // Verificar que se creó correctamente
    const [garden] = await db.execute(
      'SELECT id, nombre, tipo FROM huertos WHERE id = ?',
      [gardenId]
    );

    console.log('🎉 Huerto público creado exitosamente:');
    console.log(`  - ID: ${garden[0].id}`);
    console.log(`  - Nombre: ${garden[0].nombre}`);
    console.log(`  - Tipo: ${garden[0].tipo}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando huerto público:', error);
    process.exit(1);
  }
}

createPublicGarden();

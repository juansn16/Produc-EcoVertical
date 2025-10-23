import db from '../config/db.js';

async function checkDuplicateUsers() {
  try {
    console.log('🔍 Verificando usuarios duplicados...\n');

    // Verificar usuarios por email
    const [emailDuplicates] = await db.query(`
      SELECT email, COUNT(*) as count, GROUP_CONCAT(id) as ids, GROUP_CONCAT(nombre) as nombres
      FROM usuarios 
      WHERE is_deleted = 0 
      GROUP BY email 
      HAVING COUNT(*) > 1
    `);

    if (emailDuplicates.length > 0) {
      console.log('❌ Usuarios duplicados por EMAIL:');
      emailDuplicates.forEach(dup => {
        console.log(`  Email: ${dup.email}`);
        console.log(`  Cantidad: ${dup.count}`);
        console.log(`  IDs: ${dup.ids}`);
        console.log(`  Nombres: ${dup.nombres}`);
        console.log('  ---');
      });
    } else {
      console.log('✅ No hay usuarios duplicados por email');
    }

    // Verificar usuarios por cédula
    const [cedulaDuplicates] = await db.query(`
      SELECT cedula, COUNT(*) as count, GROUP_CONCAT(id) as ids, GROUP_CONCAT(nombre) as nombres
      FROM usuarios 
      WHERE is_deleted = 0 
      GROUP BY cedula 
      HAVING COUNT(*) > 1
    `);

    if (cedulaDuplicates.length > 0) {
      console.log('\n❌ Usuarios duplicados por CÉDULA:');
      cedulaDuplicates.forEach(dup => {
        console.log(`  Cédula: ${dup.cedula}`);
        console.log(`  Cantidad: ${dup.count}`);
        console.log(`  IDs: ${dup.ids}`);
        console.log(`  Nombres: ${dup.nombres}`);
        console.log('  ---');
      });
    } else {
      console.log('\n✅ No hay usuarios duplicados por cédula');
    }

    // Mostrar todos los usuarios activos
    const [allUsers] = await db.query(`
      SELECT id, nombre, email, cedula, rol, created_at
      FROM usuarios 
      WHERE is_deleted = 0 
      ORDER BY created_at DESC
    `);

    console.log(`\n📊 Total de usuarios activos: ${allUsers.length}`);
    console.log('\n👥 Lista de usuarios:');
    allUsers.forEach(user => {
      console.log(`  ID: ${user.id}`);
      console.log(`  Nombre: ${user.nombre}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Cédula: ${user.cedula}`);
      console.log(`  Rol: ${user.rol}`);
      console.log(`  Creado: ${user.created_at}`);
      console.log('  ---');
    });

  } catch (error) {
    console.error('❌ Error al verificar usuarios:', error);
  } finally {
    process.exit(0);
  }
}

// Función para limpiar usuarios duplicados (mantener el más reciente)
async function cleanDuplicateUsers() {
  try {
    console.log('🧹 Limpiando usuarios duplicados...\n');

    // Limpiar duplicados por email (mantener el más reciente)
    const [emailDuplicates] = await db.query(`
      SELECT email, GROUP_CONCAT(id ORDER BY created_at DESC) as ids
      FROM usuarios 
      WHERE is_deleted = 0 
      GROUP BY email 
      HAVING COUNT(*) > 1
    `);

    for (const dup of emailDuplicates) {
      const ids = dup.ids.split(',');
      const keepId = ids[0]; // El más reciente
      const deleteIds = ids.slice(1); // Los más antiguos

      console.log(`📧 Limpiando duplicados de email: ${dup.email}`);
      console.log(`  Manteniendo: ${keepId}`);
      console.log(`  Eliminando: ${deleteIds.join(', ')}`);

      for (const deleteId of deleteIds) {
        await db.query('UPDATE usuarios SET is_deleted = 1 WHERE id = ?', [deleteId]);
      }
    }

    // Limpiar duplicados por cédula (mantener el más reciente)
    const [cedulaDuplicates] = await db.query(`
      SELECT cedula, GROUP_CONCAT(id ORDER BY created_at DESC) as ids
      FROM usuarios 
      WHERE is_deleted = 0 
      GROUP BY cedula 
      HAVING COUNT(*) > 1
    `);

    for (const dup of cedulaDuplicates) {
      const ids = dup.ids.split(',');
      const keepId = ids[0]; // El más reciente
      const deleteIds = ids.slice(1); // Los más antiguos

      console.log(`🆔 Limpiando duplicados de cédula: ${dup.cedula}`);
      console.log(`  Manteniendo: ${keepId}`);
      console.log(`  Eliminando: ${deleteIds.join(', ')}`);

      for (const deleteId of deleteIds) {
        await db.query('UPDATE usuarios SET is_deleted = 1 WHERE id = ?', [deleteId]);
      }
    }

    console.log('\n✅ Limpieza completada');

  } catch (error) {
    console.error('❌ Error al limpiar usuarios:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar según el argumento
const action = process.argv[2];

if (action === 'clean') {
  cleanDuplicateUsers();
} else {
  checkDuplicateUsers();
}

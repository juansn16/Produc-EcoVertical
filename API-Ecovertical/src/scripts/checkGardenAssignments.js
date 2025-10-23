import db from '../config/db.js';

async function checkGardenAssignments() {
  try {
    console.log('🔍 Verificando asignaciones de residentes a huertos...\n');

    // Verificar todas las asignaciones activas
    const [assignments] = await db.query(`
      SELECT 
        uh.id as assignment_id,
        uh.usuario_id,
        uh.huerto_id,
        uh.rol as assignment_role,
        uh.fecha_union,
        uh.is_deleted,
        u.nombre as usuario_nombre,
        u.email as usuario_email,
        u.rol as usuario_rol,
        h.nombre as huerto_nombre,
        h.tipo as huerto_tipo,
        h.usuario_creador,
        uc.nombre as creador_nombre
      FROM usuario_huerto uh
      LEFT JOIN usuarios u ON uh.usuario_id = u.id
      LEFT JOIN huertos h ON uh.huerto_id = h.id
      LEFT JOIN usuarios uc ON h.usuario_creador = uc.id
      WHERE uh.is_deleted = 0
      ORDER BY uh.fecha_union DESC
    `);

    console.log(`📊 Total de asignaciones activas: ${assignments.length}\n`);

    if (assignments.length > 0) {
      console.log('👥 Asignaciones de residentes a huertos:');
      assignments.forEach(assignment => {
        console.log(`  🆔 ID Asignación: ${assignment.assignment_id}`);
        console.log(`  👤 Usuario: ${assignment.usuario_nombre} (${assignment.usuario_email})`);
        console.log(`  🏠 Huerto: ${assignment.huerto_nombre} (${assignment.huerto_tipo})`);
        console.log(`  👑 Creador: ${assignment.creador_nombre}`);
        console.log(`  🎭 Rol en huerto: ${assignment.assignment_role}`);
        console.log(`  📅 Fecha de unión: ${assignment.fecha_union}`);
        console.log(`  🗑️ Eliminado: ${assignment.is_deleted ? 'Sí' : 'No'}`);
        console.log('  ---');
      });
    } else {
      console.log('❌ No hay asignaciones de residentes a huertos');
    }

    // Verificar huertos sin asignaciones
    const [gardensWithoutAssignments] = await db.query(`
      SELECT 
        h.id,
        h.nombre,
        h.tipo,
        h.usuario_creador,
        uc.nombre as creador_nombre,
        COUNT(uh.usuario_id) as total_assignments
      FROM huertos h
      LEFT JOIN usuarios uc ON h.usuario_creador = uc.id
      LEFT JOIN usuario_huerto uh ON h.id = uh.huerto_id AND uh.is_deleted = 0
      WHERE h.is_deleted = 0
      GROUP BY h.id
      HAVING total_assignments = 0
      ORDER BY h.created_at DESC
    `);

    console.log(`\n📊 Huertos sin asignaciones: ${gardensWithoutAssignments.length}`);
    if (gardensWithoutAssignments.length > 0) {
      console.log('\n🏠 Huertos sin residentes asignados:');
      gardensWithoutAssignments.forEach(garden => {
        console.log(`  🆔 ID: ${garden.id}`);
        console.log(`  🏠 Nombre: ${garden.nombre}`);
        console.log(`  📋 Tipo: ${garden.tipo}`);
        console.log(`  👑 Creador: ${garden.creador_nombre}`);
        console.log('  ---');
      });
    }

    // Verificar residentes sin asignaciones
    const [residentsWithoutAssignments] = await db.query(`
      SELECT 
        u.id,
        u.nombre,
        u.email,
        u.rol,
        COUNT(uh.huerto_id) as total_assignments
      FROM usuarios u
      LEFT JOIN usuario_huerto uh ON u.id = uh.usuario_id AND uh.is_deleted = 0
      WHERE u.rol = 'residente' AND u.is_deleted = 0
      GROUP BY u.id
      HAVING total_assignments = 0
      ORDER BY u.created_at DESC
    `);

    console.log(`\n📊 Residentes sin asignaciones: ${residentsWithoutAssignments.length}`);
    if (residentsWithoutAssignments.length > 0) {
      console.log('\n👤 Residentes sin huertos asignados:');
      residentsWithoutAssignments.forEach(resident => {
        console.log(`  🆔 ID: ${resident.id}`);
        console.log(`  👤 Nombre: ${resident.nombre}`);
        console.log(`  📧 Email: ${resident.email}`);
        console.log(`  🎭 Rol: ${resident.rol}`);
        console.log('  ---');
      });
    }

  } catch (error) {
    console.error('❌ Error al verificar asignaciones:', error);
  } finally {
    process.exit(0);
  }
}

// Función para crear una asignación de prueba
async function createTestAssignment() {
  try {
    console.log('🧪 Creando asignación de prueba...\n');

    // Obtener un residente y un huerto
    const [residents] = await db.query(`
      SELECT id, nombre, email FROM usuarios 
      WHERE rol = 'residente' AND is_deleted = 0 
      LIMIT 1
    `);

    const [gardens] = await db.query(`
      SELECT id, nombre FROM huertos 
      WHERE is_deleted = 0 
      LIMIT 1
    `);

    if (residents.length === 0) {
      console.log('❌ No hay residentes disponibles');
      return;
    }

    if (gardens.length === 0) {
      console.log('❌ No hay huertos disponibles');
      return;
    }

    const resident = residents[0];
    const garden = gardens[0];

    console.log(`👤 Residente: ${resident.nombre} (${resident.email})`);
    console.log(`🏠 Huerto: ${garden.nombre}`);

    // Verificar si ya existe la asignación
    const [existingAssignment] = await db.query(`
      SELECT id FROM usuario_huerto 
      WHERE usuario_id = ? AND huerto_id = ? AND is_deleted = 0
    `, [resident.id, garden.id]);

    if (existingAssignment.length > 0) {
      console.log('⚠️ La asignación ya existe');
      return;
    }

    // Crear la asignación
    const [result] = await db.query(`
      INSERT INTO usuario_huerto (id, usuario_id, huerto_id, rol, fecha_union, is_deleted, created_at, updated_at)
      VALUES (UUID(), ?, ?, 'residente', NOW(), 0, NOW(), NOW())
    `, [resident.id, garden.id]);

    console.log('✅ Asignación creada exitosamente');

  } catch (error) {
    console.error('❌ Error al crear asignación de prueba:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar según el argumento
const action = process.argv[2];

if (action === 'create-test') {
  createTestAssignment();
} else {
  checkGardenAssignments();
}

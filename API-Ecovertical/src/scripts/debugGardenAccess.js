import db from '../config/db.js';

async function debugGardenAccess() {
  try {
    console.log('🔍 Diagnóstico de acceso a huertos para colaboradores...\n');

    // 1. Verificar todas las asignaciones activas
    console.log('📊 1. Asignaciones activas de usuario-huerto:');
    const [assignments] = await db.query(`
      SELECT uh.id, uh.usuario_id, uh.huerto_id, uh.rol, uh.fecha_union, uh.is_deleted,
             u.nombre as user_name, u.email, u.rol as user_role,
             h.nombre as garden_name, h.tipo as garden_type, h.usuario_creador,
             uc.nombre as creator_name
      FROM usuario_huerto uh
      JOIN usuarios u ON uh.usuario_id = u.id
      JOIN huertos h ON uh.huerto_id = h.id
      LEFT JOIN usuarios uc ON h.usuario_creador = uc.id
      WHERE uh.is_deleted = 0 AND h.is_deleted = 0
      ORDER BY uh.fecha_union DESC
    `);

    console.log(`   Total asignaciones: ${assignments.length}`);
    assignments.forEach(assignment => {
      console.log(`   👤 ${assignment.user_name} (${assignment.user_email})`);
      console.log(`   🏠 Huerto: ${assignment.garden_name} (${assignment.garden_type})`);
      console.log(`   👑 Creador: ${assignment.creator_name}`);
      console.log(`   🎭 Rol en huerto: ${assignment.rol}`);
      console.log(`   📅 Fecha: ${assignment.fecha_union}`);
      console.log('   ---');
    });

    // 2. Verificar específicamente el usuario Renger
    console.log('\n📊 2. Verificación específica del usuario Renger:');
    const [rengerUser] = await db.query(`
      SELECT id, nombre, email, rol, ubicacion_id
      FROM usuarios 
      WHERE email = '0897@gmail.com' AND is_deleted = 0
    `);

    if (rengerUser.length > 0) {
      const user = rengerUser[0];
      console.log(`   👤 Usuario: ${user.nombre} (ID: ${user.id})`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🎭 Rol: ${user.rol}`);
      console.log(`   📍 Ubicación: ${user.ubicacion_id}`);

      // Verificar sus asignaciones
      const [rengerAssignments] = await db.query(`
        SELECT uh.*, h.nombre as garden_name, h.tipo, h.usuario_creador
        FROM usuario_huerto uh
        JOIN huertos h ON uh.huerto_id = h.id
        WHERE uh.usuario_id = ? AND uh.is_deleted = 0 AND h.is_deleted = 0
      `, [user.id]);

      console.log(`   🏠 Huertos asignados: ${rengerAssignments.length}`);
      rengerAssignments.forEach(assignment => {
        console.log(`     - ${assignment.garden_name} (${assignment.tipo}) - Rol: ${assignment.rol}`);
      });

      // 3. Simular la consulta que hace listGardens para Renger
      console.log('\n📊 3. Simulación de consulta listGardens para Renger:');
      const userId = user.id;
      const userLocationId = user.ubicacion_id;
      const userRole = user.rol;

      const query = `
        SELECT h.*, u.nombre as ubicacion_nombre, uc.nombre as creador_nombre,
               COUNT(uh.usuario_id) as usuarios_asignados,
               CASE 
                 WHEN uh_assigned.usuario_id IS NOT NULL THEN 'asignado'
                 WHEN h.usuario_creador = ? THEN 'propietario'
                 ELSE 'admin'
               END as access_type
        FROM huertos h
        LEFT JOIN ubicaciones u ON h.ubicacion_id = u.id
        LEFT JOIN usuarios uc ON h.usuario_creador = uc.id
        LEFT JOIN usuario_huerto uh ON h.id = uh.huerto_id AND uh.is_deleted = 0
        LEFT JOIN usuario_huerto uh_assigned ON h.id = uh_assigned.huerto_id AND uh_assigned.usuario_id = ? AND uh_assigned.is_deleted = 0
        WHERE h.is_deleted = 0
        AND (
          -- Huertos privados: 
          --   * Creados por el usuario actual
          --   * O todos los privados del condominio si es admin/técnico
          --   * O huertos donde el usuario está asignado como residente
          (h.tipo = 'privado' AND (
            h.usuario_creador = ? 
            OR (h.ubicacion_id = ? AND ? IN ('administrador', 'tecnico'))
            OR uh_assigned.usuario_id IS NOT NULL
          ))
          OR
          -- Huertos públicos: solo los del mismo condominio
          (h.tipo = 'publico' AND h.ubicacion_id = ?)
        )
        GROUP BY h.id
        ORDER BY h.created_at DESC
      `;

      const params = [userId, userId, userId, userLocationId, userRole, userLocationId];
      const [gardens] = await db.query(query, params);

      console.log(`   🏠 Huertos que debería ver: ${gardens.length}`);
      gardens.forEach(garden => {
        console.log(`     - ${garden.nombre} (${garden.tipo}) - Acceso: ${garden.access_type}`);
        console.log(`       Creador: ${garden.creador_nombre} (ID: ${garden.usuario_creador})`);
        console.log(`       Ubicación: ${garden.ubicacion_nombre} (ID: ${garden.ubicacion_id})`);
        console.log(`       Usuarios asignados: ${garden.usuarios_asignados}`);
      });

    } else {
      console.log('   ❌ Usuario Renger no encontrado');
    }

    // 4. Verificar el huerto específico "pablo"
    console.log('\n📊 4. Verificación del huerto "pablo":');
    const [pabloGarden] = await db.query(`
      SELECT h.*, u.nombre as ubicacion_nombre, uc.nombre as creador_nombre
      FROM huertos h
      LEFT JOIN ubicaciones u ON h.ubicacion_id = u.id
      LEFT JOIN usuarios uc ON h.usuario_creador = uc.id
      WHERE h.nombre = 'pablo' AND h.is_deleted = 0
    `);

    if (pabloGarden.length > 0) {
      const garden = pabloGarden[0];
      console.log(`   🏠 Huerto: ${garden.nombre} (ID: ${garden.id})`);
      console.log(`   📍 Tipo: ${garden.tipo}`);
      console.log(`   👑 Creador: ${garden.creador_nombre} (ID: ${garden.usuario_creador})`);
      console.log(`   📍 Ubicación: ${garden.ubicacion_nombre} (ID: ${garden.ubicacion_id})`);

      // Verificar asignaciones a este huerto
      const [pabloAssignments] = await db.query(`
        SELECT uh.*, u.nombre as user_name, u.email
        FROM usuario_huerto uh
        JOIN usuarios u ON uh.usuario_id = u.id
        WHERE uh.huerto_id = ? AND uh.is_deleted = 0
      `, [garden.id]);

      console.log(`   👥 Asignaciones: ${pabloAssignments.length}`);
      pabloAssignments.forEach(assignment => {
        console.log(`     - ${assignment.user_name} (${assignment.user_email}) - Rol: ${assignment.rol}`);
      });
    } else {
      console.log('   ❌ Huerto "pablo" no encontrado');
    }

  } catch (error) {
    console.error('Error en diagnóstico:', error);
  } finally {
    process.exit();
  }
}

debugGardenAccess();

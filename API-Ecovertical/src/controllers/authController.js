import bcryptjs from "bcryptjs";
import db from "../config/db.js";
import { UsuarioQueries, AuthTokenQueries, UbicacionQueries } from "../utils/queries.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { sendPasswordResetCodeEmail } from "../utils/sendEmail.js";
import crypto from "crypto";

// Helper para no enviar contraseña y mapear a nombres consistentes
const safeUser = (u) => {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
};

export const register = async (req, res, next) => {
  try {
    const { 
      nombre, 
      cedula, 
      telefono, 
      preferencias_cultivo, 
      calle, 
      ciudad, 
      estado, 
      pais, 
      latitud, 
      longitud, 
      email, 
      password,
      quiere_ser_administrador = false,
      codigo_invitacion = null
    } = req.body;

    // Verificar si el usuario ya existe por email
    const [existingUsers] = await db.query(UsuarioQueries.getByEmail, [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ success: false, message: "El email ya está registrado" });
    }

    // Verificar si el usuario ya existe por cédula
    const [existingCedula] = await db.query(UsuarioQueries.getByCedula, [cedula]);
    if (existingCedula.length > 0) {
      return res.status(409).json({ success: false, message: "La cédula ya está registrada" });
    }

    // Hash de la contraseña
    const hashedPassword = await bcryptjs.hash(password, 12);

    // NUEVA LÓGICA DE ASIGNACIÓN DE ROLES
    let ubicacionId;
    let rol;
    let esAdministradorOriginal = false;
    let codigoInvitacionUsado = null;

    if (quiere_ser_administrador) {
      // Usuario quiere ser administrador - crear nueva ubicación
      console.log('Usuario quiere ser administrador, creando nueva ubicación...');
      
      // Redondear coordenadas a 2 decimales
      const latRounded = latitud ? Math.round(parseFloat(latitud) * 100) / 100 : null;
      const lngRounded = longitud ? Math.round(parseFloat(longitud) * 100) / 100 : null;
      
      const nombreUbicacion = `${ciudad}-${cedula}`.slice(0, 100);
      await db.query(UbicacionQueries.create, [
        nombreUbicacion,
        calle,
        ciudad,
        estado ?? null,
        pais ?? null,
        latRounded,
        lngRounded,
        null
      ]);
      
      const [createdUbic] = await db.query(UbicacionQueries.getByAddress, [
        calle,
        ciudad,
        estado ?? null,
        pais ?? null
      ]);
      ubicacionId = createdUbic[0].id;
      rol = 'administrador';
      esAdministradorOriginal = true;
      
      console.log('Nueva ubicación creada para administrador:', { id: ubicacionId });
      
    } else {
      // Usuario quiere ser residente - validar código de invitación
      if (!codigo_invitacion) {
        return res.status(400).json({ 
          success: false, 
          message: "Código de invitación requerido para registrarse como residente" 
        });
      }

      // Validar código de invitación
      const [codigoRows] = await db.query(
        `SELECT ci.id, ci.codigo, ci.administrador_id, ci.ubicacion_id, ci.fecha_expiracion,
                u.nombre as admin_nombre, u.email as admin_email,
                ub.nombre as ubicacion_nombre, ub.ciudad, ub.estado
         FROM codigos_invitacion ci
         JOIN usuarios u ON ci.administrador_id = u.id
         JOIN ubicaciones ub ON ci.ubicacion_id = ub.id
         WHERE ci.codigo = ? AND ci.esta_activo = 1 AND ci.is_deleted = 0`,
        [codigo_invitacion]
      );

      if (!codigoRows.length) {
        return res.status(400).json({
          success: false,
          message: "Código de invitación no válido o no encontrado"
        });
      }

      const codigoData = codigoRows[0];
      const ahora = new Date();
      const estaExpirado = codigoData.fecha_expiracion && new Date(codigoData.fecha_expiracion) < ahora;

      if (estaExpirado) {
        return res.status(400).json({
          success: false,
          message: "El código de invitación ha expirado"
        });
      }

      // El código puede ser usado múltiples veces hasta que expire
      // No validamos usado_por ya que permitimos múltiples usos

      ubicacionId = codigoData.ubicacion_id;
      rol = 'residente';
      codigoInvitacionUsado = codigo_invitacion;
      
      console.log('Código de invitación válido, asignando a ubicación:', { 
        ubicacionId, 
        admin: codigoData.admin_nombre 
      });
    }
        
    // Crear usuario con los nuevos campos
    const [userResult] = await db.query(
      `INSERT INTO usuarios 
       (id, nombre, cedula, telefono, preferencias_cultivo, rol, ubicacion_id, email, password, es_administrador_original, codigo_invitacion_usado) 
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        cedula,
        telefono ?? null,
        preferencias_cultivo ?? null,
        rol,
        ubicacionId,
        email,
        hashedPassword,
        esAdministradorOriginal,
        codigoInvitacionUsado
      ]
    );
    
    console.log('Usuario insertado, resultado:', userResult);

    // Obtener el id del usuario recién creado
    const [rows] = await db.query(UsuarioQueries.getByEmail, [email]);
    console.log('Consulta para recuperar usuario:', { email, rowsCount: rows.length });
    
    if (!rows.length) {
      throw new Error('Error al crear usuario: no se pudo recuperar después de la inserción');
    }
    
    const user = rows[0];
    console.log('Usuario creado:', { id: user.id, email: user.email, rol: user.rol });

    // Si es residente, solo guardamos el código usado en el usuario
    // No marcamos el código como usado ya que permite múltiples usos
    if (rol === 'residente' && codigoInvitacionUsado) {
      console.log('Usuario registrado con código de invitación:', codigoInvitacionUsado);
    }

    // Generar tokens JWT y guardar refresh token
    console.log('Generando tokens para:', { id: user.id, role: user.rol });
    
    const accessToken = signAccessToken({ id: user.id, role: user.rol });
    const refreshToken = signRefreshToken({ id: user.id, role: user.rol });
    
    console.log('Tokens generados:', { 
      accessToken: !!accessToken, 
      refreshToken: !!refreshToken,
      accessTokenLength: accessToken?.length,
      refreshTokenLength: refreshToken?.length
    });
    
    // Calcular expiración (7 días desde ahora)
    const expiracion = new Date(Date.now() + 7 * 24 * 3600 * 1000);
    console.log('Guardando refresh token en BD...');
    await db.query(AuthTokenQueries.create, [user.id, refreshToken, expiracion]);
    console.log('Refresh token guardado exitosamente');

    const responseData = {
      success: true,
      message: "Usuario registrado exitosamente",
      user: safeUser({ id: user.id, nombre, email, rol, telefono, ubicacion_id: ubicacionId, preferencias_cultivo, calle, ciudad, estado, pais, latitud, longitud }),
      accessToken,
      refreshToken
    };
    
    console.log('Enviando respuesta:', { 
      success: responseData.success, 
      hasUser: !!responseData.user, 
      hasAccessToken: !!responseData.accessToken, 
      hasRefreshToken: !!responseData.refreshToken 
    });
    
    res.status(201).json(responseData);
  } catch (error) {
    console.error('Error en registro:', error);
    
    // Manejar errores específicos de MySQL
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.sqlMessage.includes('cedula')) {
        return res.status(409).json({
          success: false,
          message: "La cédula ya está registrada en el sistema",
          error: "DUPLICATE_CEDULA"
        });
      } else if (error.sqlMessage.includes('email')) {
        return res.status(409).json({
          success: false,
          message: "El email ya está registrado en el sistema",
          error: "DUPLICATE_EMAIL"
        });
      } else {
        return res.status(409).json({
          success: false,
          message: "Ya existe un registro con estos datos",
          error: "DUPLICATE_ENTRY"
        });
      }
    }
    
    // Para otros errores, usar el middleware de manejo de errores
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log('Login intentado para:', { email, hasPassword: !!password });

    // Buscar usuario por email (no eliminado)
    const [users] = await db.query(UsuarioQueries.getByEmail, [email]);
    console.log('Usuarios encontrados:', { count: users.length });
    
    if (users.length === 0) {
      console.log('Usuario no encontrado, enviando error 401');
      return res.status(401).json({ 
        success: false, 
        message: "Credenciales inválidas",
        timestamp: new Date().toISOString()
      });
    }

    const user = users[0];
    console.log('Usuario encontrado:', { id: user.id, email: user.email, rol: user.rol });

    // Verificar contraseña
    const isValidPassword = await bcryptjs.compare(password, user.password);
    console.log('Verificación de contraseña:', { isValid: isValidPassword });
    
    if (!isValidPassword) {
      console.log('Contraseña incorrecta, enviando error 401');
      return res.status(401).json({ 
        success: false, 
        message: "Credenciales inválidas",
        timestamp: new Date().toISOString()
      });
    }

    // Generar tokens y guardar refresh token
    console.log('Generando tokens para usuario:', { id: user.id, role: user.rol });
    
    const accessToken = signAccessToken({ id: user.id, role: user.rol });
    const refreshToken = signRefreshToken({ id: user.id, role: user.rol });
    
    console.log('Tokens generados en login:', { 
      accessToken: !!accessToken, 
      refreshToken: !!refreshToken,
      accessTokenLength: accessToken?.length,
      refreshTokenLength: refreshToken?.length
    });
    
    // Calcular expiración (7 días desde ahora)
    const expiracion = new Date(Date.now() + 7 * 24 * 3600 * 1000);
    console.log('Guardando refresh token en BD...');
    await db.query(AuthTokenQueries.create, [user.id, refreshToken, expiracion]);
    console.log('Refresh token guardado exitosamente');

    const responseData = {
      success: true,
      message: "Login exitoso",
      user: safeUser({ 
        id: user.id, 
        nombre: user.nombre, 
        email: user.email, 
        rol: user.rol, 
        telefono: user.telefono, 
        ubicacion_id: user.ubicacion_id, 
        preferencias_cultivo: user.preferencias_cultivo 
      }),
      accessToken,
      refreshToken,
      timestamp: new Date().toISOString()
    };

    console.log('Enviando respuesta de login exitoso:', { 
      success: responseData.success, 
      hasUser: !!responseData.user, 
      hasAccessToken: !!responseData.accessToken, 
      hasRefreshToken: !!responseData.refreshToken 
    });

    res.json(responseData);
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "Token de refresco requerido" });
    }

    console.log('Refresh token recibido:', { tokenLength: token?.length });

    // Validar token criptográficamente
    let payload;
    try {
      payload = verifyRefreshToken(token);
      console.log('Token verificado, payload:', payload);
    } catch (jwtError) {
      console.error('Error verificando refresh token:', jwtError);
      if (jwtError.name === 'JsonWebTokenError' || jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: "Token inválido o expirado" });
      }
      throw jwtError;
    }

    // Verificar existencia en BD
    const [rows] = await db.query(AuthTokenQueries.getByToken, [token]);
    console.log('Token encontrado en BD:', { found: rows.length > 0 });
    
    if (!rows.length) {
      return res.status(401).json({ success: false, message: "Token no encontrado en BD" });
    }

    // Rotar refresh token: invalidar el antiguo y crear uno nuevo
    await db.query(AuthTokenQueries.deleteToken, [token]);
    console.log('Token antiguo invalidado');

    const newRefreshToken = signRefreshToken({ id: payload.id, role: payload.role });
    const accessToken = signAccessToken({ id: payload.id, role: payload.role });
    
    console.log('Nuevos tokens generados:', { 
      accessToken: !!accessToken, 
      refreshToken: !!newRefreshToken,
      accessTokenLength: accessToken?.length,
      refreshTokenLength: newRefreshToken?.length
    });
    
    // Calcular expiración (7 días desde ahora)
    const expiracion = new Date(Date.now() + 7 * 24 * 3600 * 1000);
    await db.query(AuthTokenQueries.create, [payload.id, newRefreshToken, expiracion]);
    console.log('Nuevo refresh token guardado en BD');

    const responseData = {
      success: true,
      message: "Token refrescado exitosamente",
      accessToken,
      refreshToken: newRefreshToken
    };

    console.log('Enviando respuesta de refresh:', { 
      success: responseData.success, 
      hasAccessToken: !!responseData.accessToken, 
      hasRefreshToken: !!responseData.refreshToken 
    });

    res.json(responseData);
  } catch (error) {
    console.error('Error en refreshToken:', error);
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await db.query(AuthTokenQueries.deleteToken, [refreshToken]);
    }
    res.json({ success: true, message: "Logout exitoso" });
  } catch (error) {
    next(error);
  }
};

// Endpoint de prueba para verificar JWT
export const testJWT = async (req, res, next) => {
  try {
    const testPayload = { id: 'test-123', role: 'test' };
    const accessToken = signAccessToken(testPayload);
    const refreshToken = signRefreshToken(testPayload);
    
    res.json({
      success: true,
      message: "Test JWT exitoso",
      accessToken,
      refreshToken,
      testPayload
    });
  } catch (error) {
    console.error('Error en testJWT:', error);
    res.status(500).json({
      success: false,
      message: "Error en test JWT",
      error: error.message
    });
  }
};

// Endpoint de prueba para verificar autenticación
export const testAuth = async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: "Autenticación exitosa",
      user: req.user,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en testAuth:', error);
    res.status(500).json({
      success: false,
      message: "Error en test de autenticación",
      error: error.message
    });
  }
};

// Endpoint de prueba para login sin rate limiting
export const testLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log('Test login recibido:', { email, hasPassword: !!password });

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email y contraseña son requeridos",
        received: { email: !!email, password: !!password }
      });
    }

    // Simular respuesta simple
    res.json({
      success: true,
      message: "Test login recibido correctamente",
      received: { email, hasPassword: !!password },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en testLogin:', error);
    res.status(500).json({
      success: false,
      message: "Error en test login",
      error: error.message
    });
  }
};

// Endpoint de prueba para restablecimiento de contraseña
export const testPasswordReset = async (req, res, next) => {
  try {
    console.log('🧪 Test password reset endpoint llamado');
    const { email } = req.body;
    console.log('📧 Email recibido:', email);

    res.json({
      success: true,
      message: 'Test endpoint funcionando',
      email: email,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error en testPasswordReset:', error);
    res.status(500).json({
      success: false,
      message: 'Error en test endpoint',
      error: error.message
    });
  }
};

// Endpoint para verificar si una cédula ya existe
export const checkCedula = async (req, res, next) => {
  try {
    const { cedula } = req.query;
    
    if (!cedula) {
      return res.status(400).json({
        success: false,
        message: "La cédula es requerida",
        exists: false
      });
    }

    // Buscar usuario por cédula
    const [rows] = await db.query(UsuarioQueries.getByCedula, [cedula]);
    
    const exists = rows.length > 0;
    
    res.json({
      success: true,
      exists,
      message: exists 
        ? "Esta cédula ya está registrada en el sistema" 
        : "Cédula disponible",
      user: exists ? rows[0] : null
    });
    
  } catch (error) {
    console.error('Error en checkCedula:', error);
    res.status(500).json({
      success: false,
      message: "Error al verificar cédula",
      error: error.message,
      exists: false
    });
  }
};

// Endpoint temporal para verificar usuario por email
export const checkEmail = async (req, res, next) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "El email es requerido",
        exists: false
      });
    }

    // Buscar usuario por email
    const [rows] = await db.query(UsuarioQueries.getByEmail, [email]);
    
    const exists = rows.length > 0;
    
    res.json({
      success: true,
      exists,
      message: exists 
        ? "Este email ya está registrado en el sistema" 
        : "Email disponible",
      user: exists ? rows[0] : null
    });
    
  } catch (error) {
    console.error('Error en checkEmail:', error);
    res.status(500).json({
      success: false,
      message: "Error al verificar email",
      error: error.message,
      exists: false
    });
  }
};

// Endpoint para validar código de invitación
export const validateInvitationCode = async (req, res, next) => {
  try {
    const { codigo } = req.body;

    if (!codigo || codigo.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'El código debe tener exactamente 6 caracteres'
      });
    }

    const [rows] = await db.query(
      `SELECT ci.id, ci.codigo, ci.administrador_id, ci.ubicacion_id, ci.fecha_expiracion,
              u.nombre as admin_nombre, u.email as admin_email,
              ub.nombre as ubicacion_nombre, ub.ciudad, ub.estado
       FROM codigos_invitacion ci
       JOIN usuarios u ON ci.administrador_id = u.id
       JOIN ubicaciones ub ON ci.ubicacion_id = ub.id
       WHERE ci.codigo = ? AND ci.esta_activo = 1 AND ci.is_deleted = 0`,
      [codigo]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Código de invitación no válido o no encontrado'
      });
    }

    const codigoData = rows[0];
    const ahora = new Date();
    const estaExpirado = codigoData.fecha_expiracion && new Date(codigoData.fecha_expiracion) < ahora;

    if (estaExpirado) {
      return res.status(400).json({
        success: false,
        message: 'El código de invitación ha expirado'
      });
    }

    // El código puede ser usado múltiples veces hasta que expire
    // No validamos usado_por ya que permitimos múltiples usos

    res.json({
      success: true,
      message: 'Código de invitación válido',
      data: {
        codigo: codigoData.codigo,
        administrador: {
          nombre: codigoData.admin_nombre,
          email: codigoData.admin_email
        },
        ubicacion: {
          nombre: codigoData.ubicacion_nombre,
          ciudad: codigoData.ciudad,
          estado: codigoData.estado
        },
        fecha_expiracion: codigoData.fecha_expiracion
      }
    });

  } catch (error) {
    console.error('Error validando código de invitación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar código de invitación',
      error: error.message
    });
  }
};

// ==================== FUNCIONES DE RESTABLECIMIENTO DE CONTRASEÑA ====================

// Generar código de 6 dígitos
const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash del código para almacenamiento seguro
const hashResetCode = (code) => {
  return crypto.createHash('sha256').update(code).digest('hex');
};

// Solicitar código de restablecimiento
export const requestPasswordReset = async (req, res, next) => {
  try {
    console.log('🔍 Iniciando requestPasswordReset...');
    const { email } = req.body;
    console.log('📧 Email recibido:', email);

    if (!email) {
      console.log('❌ Email no proporcionado');
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico es requerido'
      });
    }

    console.log('🔍 Buscando usuario en BD...');
    // Verificar que el email existe en la base de datos
    const [users] = await db.query(UsuarioQueries.getByEmail, [email]);
    console.log('👥 Usuarios encontrados:', users.length);
    
    if (users.length === 0) {
      // Email no existe en la base de datos
      console.log('⚠️ Email no encontrado en la base de datos');
      return res.status(404).json({
        success: false,
        message: 'No existe una cuenta registrada con este correo electrónico. Verifica el email o regístrate primero.'
      });
    }

    const user = users[0];
    console.log('✅ Usuario encontrado:', { id: user.id, email: user.email, nombre: user.nombre });

    console.log('🔑 Generando código...');
    // Generar código de 6 dígitos
    const resetCode = generateResetCode();
    const hashedCode = hashResetCode(resetCode);
    console.log('🔑 Código generado:', resetCode);
    
    // Expiración: 10 minutos
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    console.log('⏰ Expira en:', expiresAt);
    
    console.log('🗑️ Invalidando códigos anteriores...');
    // Invalidar códigos anteriores del usuario
    await db.query(
      'UPDATE password_reset_codes SET is_used = TRUE WHERE user_id = ? AND email = ?',
      [user.id, email]
    );

    console.log('💾 Guardando nuevo código...');
    console.log('📋 Datos a insertar:', {
      user_id: user.id,
      email: email,
      code: resetCode,
      code_hash: hashedCode,
      expires_at: expiresAt
    });
    
    // Guardar nuevo código
    const [insertResult] = await db.query(
      `INSERT INTO password_reset_codes (user_id, email, code, code_hash, expires_at) 
       VALUES (?, ?, ?, ?, ?)`,
      [user.id, email, resetCode, hashedCode, expiresAt]
    );

    console.log('🔑 CÓDIGO DE DESARROLLO:', resetCode);
    console.log('📊 Resultado de inserción:', insertResult);
    console.log('✅ Código guardado exitosamente');
    
    // Verificar que se guardó correctamente
    const [verification] = await db.query(
      'SELECT * FROM password_reset_codes WHERE email = ? ORDER BY created_at DESC LIMIT 1',
      [email]
    );
    console.log('🔍 Verificación en BD:', verification);

    // Enviar email con el código
    try {
      console.log('📧 Enviando email de restablecimiento...');
      await sendPasswordResetCodeEmail(email, user.nombre, resetCode);
      console.log('✅ Email enviado exitosamente');
    } catch (emailError) {
      console.error('❌ Error enviando email:', emailError);
      // No fallar la operación si el email falla, pero devolver el código para desarrollo
      console.log('⚠️ Continuando sin email...');
    }

    res.json({
      success: true,
      message: 'Código de verificación enviado. Revisa tu bandeja de entrada.',
      email: email, // Para mostrar en el frontend
      debugCode: resetCode // Solo para desarrollo
    });

  } catch (error) {
    console.error('❌ Error en requestPasswordReset:', error);
    console.error('📋 Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message || 'Error desconocido'
    });
  }
};

// Verificar código de restablecimiento
export const verifyResetCode = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    console.log('Verificación de código para:', { email, codeLength: code?.length });

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico y el código son requeridos'
      });
    }

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: 'El código debe tener exactamente 6 dígitos'
      });
    }

    // Buscar código válido
    const [rows] = await db.query(
      `SELECT prc.*, u.nombre 
       FROM password_reset_codes prc
       JOIN usuarios u ON prc.user_id = u.id
       WHERE prc.email = ? AND prc.is_used = FALSE AND prc.expires_at > NOW()
       ORDER BY prc.created_at DESC
       LIMIT 1`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El código no es válido o ha expirado. Por favor, solicita un nuevo código.'
      });
    }

    const resetData = rows[0];
    const hashedInputCode = hashResetCode(code);

    // Verificar que el código coincida
    if (hashedInputCode !== resetData.code_hash) {
      return res.status(400).json({
        success: false,
        message: 'El código no es válido o ha expirado. Por favor, solicita un nuevo código.'
      });
    }

    // Marcar código como usado
    await db.query(
      'UPDATE password_reset_codes SET is_used = TRUE WHERE id = ?',
      [resetData.id]
    );

    console.log('Código verificado exitosamente para:', email);

    res.json({
      success: true,
      message: 'Código validado. Procede a establecer la nueva contraseña.',
      email: email,
      user: {
        id: resetData.user_id,
        nombre: resetData.nombre
      }
    });

  } catch (error) {
    console.error('Error en verifyResetCode:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Restablecer contraseña
export const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;
    console.log('Restablecimiento de contraseña para:', { email });

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Las contraseñas no coinciden'
      });
    }

    // Validar requisitos de contraseña
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres'
      });
    }

    // Verificar que el usuario existe
    const [users] = await db.query(UsuarioQueries.getByEmail, [email]);
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const user = users[0];

    // Verificar que hay un código válido reciente
    const [recentCodes] = await db.query(
      `SELECT * FROM password_reset_codes 
       WHERE email = ? AND is_used = TRUE AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
       ORDER BY created_at DESC
       LIMIT 1`,
      [email]
    );

    if (recentCodes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debes verificar tu código antes de restablecer la contraseña'
      });
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcryptjs.hash(newPassword, 12);

    // Actualizar contraseña
    await db.query(UsuarioQueries.updatePassword, [hashedPassword, user.id]);

    // Invalidar todos los tokens de sesión del usuario
    await db.query(AuthTokenQueries.deleteByUserId, [user.id]);

    console.log('Contraseña restablecida exitosamente para:', email);

    res.json({
      success: true,
      message: 'Contraseña restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.'
    });

  } catch (error) {
    console.error('Error en resetPassword:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

export const notFound = (req, res, next) => {
	res.status(404).json({ message: 'Ruta no encontrada' });
};

export const errorHandler = (err, req, res, next) => {
	console.error('❌ [ErrorHandler] Error capturado:', {
		message: err.message,
		code: err.code,
		stack: err.stack,
		url: req.url,
		method: req.method
	});
	
	// Manejar errores de conexión a la base de datos
	if (err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND' || err.code === '28000') {
		console.error('⚠️ Error de conexión a la base de datos:', err.code);
		
		// Mensaje específico para error de SSL
		if (err.code === '28000') {
			return res.status(503).json({
				success: false,
				message: "Error de configuración de conexión segura con la base de datos",
				error: "DATABASE_SSL_ERROR",
				code: err.code
			});
		}
		
		return res.status(503).json({
			success: false,
			message: "Error temporal de conexión con la base de datos",
			error: "DATABASE_CONNECTION_ERROR",
			code: err.code
		});
	}
	
	// Manejar errores específicos de PostgreSQL
	if (err.code === '23505') { // UNIQUE VIOLATION
		if (err.detail?.includes('cedula')) {
			return res.status(409).json({
				success: false,
				message: "La cédula ya está registrada en el sistema",
				error: "DUPLICATE_CEDULA"
			});
		} else if (err.detail?.includes('email')) {
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
	
	// Manejar errores de referencia de PostgreSQL
	if (err.code === '23503') { // FOREIGN KEY VIOLATION
		return res.status(400).json({
			success: false,
			message: "Referencia inválida en la base de datos",
			error: "FOREIGN_KEY_CONSTRAINT"
		});
	}
	
	// Manejar errores de sintaxis SQL
	if (err.code === '42601' || err.code === '42703') {
		console.error('❌ [ErrorHandler] Error de SQL:', err);
		return res.status(500).json({
			success: false,
			message: "Error en la consulta a la base de datos",
			error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno',
			details: process.env.NODE_ENV === 'development' ? {
				code: err.code,
				detail: err.detail,
				position: err.position
			} : undefined
		});
	}
	
	// Manejar errores de MySQL (legacy)
	if (err.code === 'ER_DUP_ENTRY') {
		if (err.sqlMessage?.includes('cedula')) {
			return res.status(409).json({
				success: false,
				message: "La cédula ya está registrada en el sistema",
				error: "DUPLICATE_CEDULA"
			});
		} else if (err.sqlMessage?.includes('email')) {
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
	
	// Manejar otros errores de MySQL
	if (err.code === 'ER_NO_REFERENCED_ROW_2') {
		return res.status(400).json({
			success: false,
			message: "Referencia inválida en la base de datos",
			error: "FOREIGN_KEY_CONSTRAINT"
		});
	}
	
	// Error por defecto
	console.error('❌ [ErrorHandler] Error no manejado:', err);
	res.status(err.status || 500).json({ 
		success: false,
		message: err.message || 'Error interno del servidor',
		error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor',
		details: process.env.NODE_ENV === 'development' ? {
			code: err.code,
			stack: err.stack
		} : undefined
	});
};

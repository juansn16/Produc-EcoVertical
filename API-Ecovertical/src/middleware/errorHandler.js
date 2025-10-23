export const notFound = (req, res, next) => {
	res.status(404).json({ message: 'Ruta no encontrada' });
};

export const errorHandler = (err, req, res, next) => {
	console.error('Error capturado por middleware:', err);
	
	// Manejar errores específicos de MySQL
	if (err.code === 'ER_DUP_ENTRY') {
		if (err.sqlMessage.includes('cedula')) {
			return res.status(409).json({
				success: false,
				message: "La cédula ya está registrada en el sistema",
				error: "DUPLICATE_CEDULA"
			});
		} else if (err.sqlMessage.includes('email')) {
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
	res.status(err.status || 500).json({ 
		success: false,
		message: err.message || 'Error interno del servidor',
		error: process.env.NODE_ENV === 'development' ? err.stack : undefined
	});
};

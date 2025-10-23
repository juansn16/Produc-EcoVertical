import db from '../config/db.js';

const createPasswordResetTable = async () => {
  try {
    console.log('Creando tabla password_reset_codes...');
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS password_reset_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        code_hash VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_email (user_id, email),
        INDEX idx_code_hash (code_hash),
        INDEX idx_expires_at (expires_at),
        FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✅ Tabla password_reset_codes creada exitosamente');
    
    // Limpiar códigos expirados
    await db.query(`
      DELETE FROM password_reset_codes 
      WHERE expires_at < NOW() OR is_used = TRUE
    `);
    
    console.log('✅ Códigos expirados eliminados');
    
  } catch (error) {
    console.error('❌ Error creando tabla password_reset_codes:', error);
    throw error;
  }
};

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createPasswordResetTable()
    .then(() => {
      console.log('✅ Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en script:', error);
      process.exit(1);
    });
}

export default createPasswordResetTable;

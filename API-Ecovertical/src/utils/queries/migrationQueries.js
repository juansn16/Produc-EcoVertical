// ==================== MIGRACIONES DE BASE DE DATOS ====================

export const MigrationQueries = {
  // ==================== VERIFICACIÓN DE COLUMNAS ====================

  // Verificar si una columna existe en PostgreSQL
  checkColumnExists: `
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_schema = $1 AND table_name = $2 AND column_name = $3
  `,

  // ==================== MODIFICACIÓN DE TABLAS ====================

  // Agregar columna huerto_siembra_id a huerto_data
  addHuertoSiembraIdColumn: `
    ALTER TABLE huerto_data 
    ADD COLUMN huerto_siembra_id UUID NULL
  `,

  // Agregar comentario a la columna (PostgreSQL usa COMMENT ON)
  addColumnComment: `
    COMMENT ON COLUMN huerto_data.huerto_siembra_id IS 'ID de la siembra relacionada para todos los tipos de comentarios excepto siembra y cosecha'
  `,

  // ==================== ÍNDICES ====================

  // Crear índice para huerto_siembra_id
  createHuertoSiembraIdIndex: `
    CREATE INDEX idx_huerto_data_huerto_siembra ON huerto_data(huerto_siembra_id)
  `,

  // Verificar si un índice existe
  checkIndexExists: `
    SELECT indexname 
    FROM pg_indexes 
    WHERE schemaname = $1 AND tablename = $2 AND indexname = $3
  `
};


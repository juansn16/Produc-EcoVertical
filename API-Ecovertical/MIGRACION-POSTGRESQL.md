# Migración de MySQL a PostgreSQL - EcoVertical

## ✅ Cambios Completados

### 1. Dependencias Actualizadas
- ❌ Removido: `mysql2`
- ✅ Agregado: `pg` (PostgreSQL driver)

### 2. Configuración de Base de Datos
- ✅ Actualizado `src/config/db.js` para usar PostgreSQL Pool
- ✅ Actualizado `env.example` con variables de PostgreSQL

### 3. Queries Migradas
- ✅ Todas las queries en `src/utils/queries/` ya estaban migradas a PostgreSQL
- ✅ Migrado `src/utils/queries.js` de MySQL a PostgreSQL
- ✅ Actualizado controlador de inventario

### 4. Cambios Principales en las Queries
- ✅ Parámetros: `?` → `$1, $2, $3...`
- ✅ Booleanos: `0/1` → `true/false`
- ✅ Fechas: `NOW()` → `CURRENT_TIMESTAMP`
- ✅ UUID: `UUID()` → `uuid_generate_v4()`
- ✅ Resultados: `result[0]` → `result.rows[0]`
- ✅ GROUP_CONCAT: `GROUP_CONCAT()` → `STRING_AGG()`

## 🚀 Pasos para Completar la Migración

### 1. Instalar PostgreSQL
```bash
# Windows (usando Chocolatey)
choco install postgresql

# O descargar desde: https://www.postgresql.org/download/windows/
```

### 2. Crear la Base de Datos
```sql
-- Conectar a PostgreSQL como superusuario
psql -U postgres

-- Crear base de datos
CREATE DATABASE huertos;

-- Crear usuario (opcional)
CREATE USER ecovertical_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE huertos TO ecovertical_user;
```

### 3. Ejecutar el Script de Base de Datos
```bash
# Ejecutar el script SQL de PostgreSQL
psql -U postgres -d huertos -f src/models/huertos_postgresql.sql
```

### 4. Configurar Variables de Entorno
```bash
# Copiar el archivo de ejemplo
cp env.example .env

# Editar .env con tus credenciales de PostgreSQL
DB_HOST=localhost
DB_USER=postgres
DB_PASS=tu_password
DB_NAME=huertos
DB_PORT=5432
```

### 5. Instalar Dependencias
```bash
# Remover mysql2 e instalar pg
npm uninstall mysql2
npm install pg

# O simplemente ejecutar
npm install
```

### 6. Probar la Conexión
```bash
# Ejecutar el script de prueba
node test-postgresql-connection.js
```

### 7. Iniciar la Aplicación
```bash
npm run dev
```

## 🔍 Verificación

### Script de Prueba Incluido
Se ha creado `test-postgresql-connection.js` que verifica:
- ✅ Conexión a PostgreSQL
- ✅ Versión de la base de datos
- ✅ Tablas existentes
- ✅ Permisos de acceso

### Comandos Útiles
```bash
# Verificar conexión
node test-postgresql-connection.js

# Ver logs de la aplicación
npm run dev

# Verificar estado de PostgreSQL (Windows)
sc query postgresql-x64-14

# Iniciar PostgreSQL (Windows)
net start postgresql-x64-14
```

## 📋 Notas Importantes

1. **Backup**: Asegúrate de hacer backup de tus datos antes de migrar
2. **Puerto**: PostgreSQL usa puerto 5432 por defecto (MySQL usa 3306)
3. **Extensiones**: El script SQL incluye la extensión `uuid-ossp` para UUIDs
4. **Triggers**: Se han migrado todos los triggers para `updated_at`
5. **Índices**: Todos los índices han sido preservados

## 🆘 Solución de Problemas

### Error de Conexión
```
❌ Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solución**: Verificar que PostgreSQL esté ejecutándose

### Error de Base de Datos
```
❌ Error: database "huertos" does not exist
```
**Solución**: Crear la base de datos con `CREATE DATABASE huertos;`

### Error de Permisos
```
❌ Error: password authentication failed
```
**Solución**: Verificar credenciales en el archivo `.env`

### Error de Extensión UUID
```
❌ Error: extension "uuid-ossp" does not exist
```
**Solución**: Ejecutar `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

## ✅ Migración Completada

Una vez completados todos los pasos, tu aplicación EcoVertical estará ejecutándose completamente con PostgreSQL en lugar de MySQL.

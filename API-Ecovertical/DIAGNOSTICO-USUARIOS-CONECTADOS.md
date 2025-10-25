# 🔧 Script de Diagnóstico de Usuarios Conectados

## 📋 Descripción
Este script se conecta directamente a la base de datos de producción en Render para diagnosticar problemas con la tabla `usuarios_conectados`.

## ⚠️ IMPORTANTE
- **Este script se conecta a la base de datos de PRODUCCIÓN**
- Asegúrate de tener las variables de entorno correctas
- No ejecutes este script en horarios de alta actividad

## 🚀 Cómo Ejecutar

### Opción 1: Desde tu máquina local
```bash
# 1. Asegúrate de tener las variables de entorno de producción
# 2. Ejecuta el script
cd API-Ecovertical
node src/scripts/diagnoseConnectedUsers.js
```

### Opción 2: Desde Render (recomendado)
```bash
# 1. Ve a tu dashboard de Render
# 2. Abre la consola de tu servicio
# 3. Ejecuta:
node src/scripts/diagnoseConnectedUsers.js
```

## 🔍 Qué hace el script

1. **Verifica conexión** a la base de datos de producción
2. **Comprueba existencia** de la tabla `usuarios_conectados`
3. **Crea la tabla** si no existe (con estructura correcta)
4. **Verifica estructura** de columnas e índices
5. **Muestra registros** actuales en la tabla
6. **Limpia registros** antiguos (>1 hora)
7. **Muestra estadísticas** detalladas

## 📊 Información que obtendrás

- ✅ Estado de la tabla `usuarios_conectados`
- 📋 Estructura de columnas
- 📊 Cantidad de registros actuales
- 🧹 Registros limpiados
- 📋 Índices existentes
- 🔍 Últimos 10 registros de usuarios

## 🛠️ Variables de Entorno Requeridas

```bash
DATABASE_URL=postgresql://usuario:password@host:port/database
NODE_ENV=production
```

## 📝 Ejemplo de Salida

```
🔗 Conectando a la base de datos de producción...
📍 URL: Configurada
🌍 Entorno: production
🔗 Verificando conexión a la base de datos...
✅ Conectado a la base de datos. Hora actual: 2025-10-25T01:30:00.000Z

🔍 Diagnóstico de la tabla usuarios_conectados...

1️⃣ Verificando existencia de la tabla...
✅ La tabla usuarios_conectados existe

2️⃣ Verificando estructura de la tabla...
📋 Columnas de la tabla:
  - id: uuid (nullable: NO)
  - usuario_id: uuid (nullable: NO)
  - socket_id: character varying (nullable: NO)
  - fecha_conexion: timestamp without time zone (nullable: NO)

3️⃣ Verificando registros actuales...
📊 Total de registros: 2
📋 Últimos 10 registros:
  - Juan SN (3d191da8-dc23-4bec-97a5-fc4d76370b52) - 2025-10-25T01:29:28.851Z

4️⃣ Verificando registros antiguos...
📊 Registros antiguos (>1 hora): 0

5️⃣ Verificando índices...
📋 Índices existentes:
  - usuarios_conectados_pkey
  - idx_usuarios_conectados_socket
  - idx_usuarios_conectados_fecha

✅ Diagnóstico completado exitosamente
```

## 🔧 Solución de Problemas

### Error de conexión
- Verifica que `DATABASE_URL` esté configurada correctamente
- Asegúrate de que la base de datos esté accesible

### Error de permisos
- Verifica que el usuario de la base de datos tenga permisos de escritura
- Asegúrate de que las tablas relacionadas existan

### Error de SSL
- El script maneja automáticamente SSL para producción
- Si hay problemas, verifica la configuración SSL de tu base de datos

## 📞 Soporte
Si encuentras problemas, revisa los logs detallados que proporciona el script y compártelos para análisis.

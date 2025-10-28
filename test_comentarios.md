# 🧪 Test de Editar/Eliminar Comentarios

## ✅ Código subido y desplegado

Los cambios han sido subidos exitosamente a Render. La API responde correctamente (status 200 en /health).

## 🔐 Para probar, necesito:

1. **Token de autenticación** que estás usando en el frontend
   - O tus credenciales (email/contraseña) para hacer login

2. **ID de un comentario** que pueda editar/eliminar

## 📋 Comandos para probar manualmente:

### 1. Obtener token (si tienes credenciales):
```bash
curl -X POST "https://api-ecovertical.onrender.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"tu-email\",\"password\":\"tu-password\"}"
```

### 2. Editar comentario:
```bash
curl -X PUT "https://api-ecovertical.onrender.com/api/comments/ID-DEL-COMENTARIO" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU-TOKEN" \
  -d "{\"contenido\":\"Comentario actualizado\"}"
```

### 3. Eliminar comentario:
```bash
curl -X DELETE "https://api-ecovertical.onrender.com/api/comments/ID-DEL-COMENTARIO" \
  -H "Authorization: Bearer TU-TOKEN"
```

## 🎯 O simplemente prueba desde el frontend:

La API está funcionando. Solo abre tu frontend y prueba editar/eliminar un comentario. Si hay error, los logs en Render mostrarán exactamente qué está pasando.

## 📊 Para ver logs en Render:

1. Ve a https://dashboard.render.com
2. Selecciona tu servicio API-Ecovertical  
3. Click en "Logs"
4. Intenta editar/eliminar un comentario
5. Busca los logs que empiezan con:
   - `🔄 [updateComment]`
   - `🗑️ [deleteComment]`
   - `❌ [ErrorHandler]`


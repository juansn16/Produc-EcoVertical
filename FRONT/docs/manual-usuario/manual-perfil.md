# Mi Perfil

La página de perfil te permite gestionar tu información personal, cambiar tu contraseña y, si eres administrador, administrar roles de usuarios y códigos de invitación para tu condominio.

---

## 1) Información del Perfil

### **Vista General:**
- **Nombre completo**: Tu nombre como aparece en el sistema
- **Email**: Dirección de correo electrónico asociada a tu cuenta
- **Teléfono**: Número de contacto registrado
- **Rol**: Tu rol actual en el sistema (Administrador, Técnico, Residente)
- **Imagen de perfil**: Foto o avatar personalizado

### **Indicador de Rol:**
- **Administrador**: Botón rojo con ícono de corona
- **Técnico**: Botón azul con ícono de herramientas
- **Residente**: Botón verde con ícono de usuario

---

## 2) Editar Perfil

### **Acceso:**
- Pulsa el botón **"Editar Perfil"** en la sección principal
- El botón cambia a **"Cancelar"** cuando estás editando

### **Campos Editables:**
- **Nombre Completo**: Puedes modificar tu nombre completo
- **Email**: Actualizar tu dirección de correo electrónico
- **Teléfono**: Cambiar tu número de contacto
- **Imagen de Perfil**: Actualizar tu foto o avatar

### **Actualizar Imagen:**
1. **Pulsa en el área de la imagen** (círculo con tu foto o "Sin imagen")
2. **Introduce la URL** de la nueva imagen
3. **Pulsa "Actualizar Imagen"** para aplicar los cambios
4. **Pulsa "Cancelar"** para cerrar sin cambios

### **Guardar Cambios:**
- **Botón "Guardar"**: Confirma y guarda todos los cambios
- **Botón "Cancelar"**: Descarta los cambios y vuelve a la vista normal
- **Notificación**: Recibirás confirmación cuando los cambios se guarden exitosamente

---

## 3) Cambiar Contraseña

### **Acceso:**
- Pulsa el botón **"Cambiar Contraseña"** en la sección correspondiente
- El botón cambia a **"Ocultar"** cuando el formulario está visible

### **Campos Requeridos:**
- **Contraseña Actual**: Tu contraseña actual para verificación
- **Nueva Contraseña**: La nueva contraseña que deseas usar
- **Confirmar Nueva Contraseña**: Repite la nueva contraseña

### **Validaciones:**
- **Mínimo 6 caracteres** para la nueva contraseña
- **Las contraseñas deben coincidir** (nueva y confirmación)
- **Contraseña actual correcta** para autorizar el cambio

### **Proceso:**
1. **Completa los tres campos** requeridos
2. **Pulsa "Cambiar Contraseña"** para confirmar
3. **Recibe notificación** de éxito o error
4. **El formulario se limpia** automáticamente tras el éxito

---

## 4) Gestión de Roles (Solo Administradores)

### **Acceso:**
- Solo visible para usuarios con rol **"Administrador"**
- Pulsa **"Gestionar Roles"** en la sección correspondiente

### **Funcionalidades:**

#### **Ver Usuarios del Condominio:**
- **Lista completa** de todos los usuarios de tu ubicación
- **Información mostrada**: Nombre, email, rol actual, fecha de registro
- **Búsqueda**: Puedes buscar usuarios por nombre o email

#### **Asignar Rol de Técnico:**
- **A quién**: Solo usuarios con rol "Residente"
- **Proceso**: Pulsa "Asignar Técnico" junto al usuario
- **Confirmación**: Se solicita confirmación antes de cambiar el rol
- **Resultado**: El usuario pasa de "Residente" a "Técnico"

#### **Quitar Rol de Técnico:**
- **A quién**: Solo usuarios con rol "Técnico"
- **Proceso**: Pulsa "Quitar Técnico" junto al usuario
- **Confirmación**: Se solicita confirmación antes de cambiar el rol
- **Resultado**: El usuario pasa de "Técnico" a "Residente"

### **Restricciones:**
- **No puedes cambiar** el rol de otros administradores
- **Solo puedes gestionar** usuarios de tu misma ubicación
- **Los cambios son inmediatos** y afectan los permisos del usuario

---

## 5) Códigos de Invitación (Solo Administradores)

### **Acceso:**
- Solo visible para usuarios con rol **"Administrador"**
- Pulsa **"Gestionar Códigos"** en la sección correspondiente

### **Funcionalidades:**

#### **Ver Código Actual:**
- **Código activo**: Si existe un código válido, se muestra
- **Fecha de expiración**: Cuándo expira el código
- **Estado**: Activo o expirado
- **Usos**: Cuántas veces se ha usado el código

#### **Generar Nuevo Código:**
- **Botón "Generar Nuevo"**: Crea un código de invitación
- **Expiración**: Por defecto, 7 días desde la generación
- **Formato**: Código alfanumérico único
- **Reutilizable**: El mismo código puede usarse múltiples veces

#### **Eliminar Código Actual:**
- **Botón "Eliminar"**: Invalida el código actual
- **Confirmación**: Se solicita confirmación antes de eliminar
- **Efecto**: El código ya no puede usarse para registros

### **Uso de Códigos:**
- **Para nuevos residentes**: Comparte el código con personas que quieran unirse
- **En el registro**: Los nuevos usuarios ingresan este código al registrarse
- **Asignación automática**: Se les asigna automáticamente el rol "Residente"
- **Ubicación**: Se les asigna a tu misma ubicación/condominio

---

## 6) Notificaciones y Estados

### **Notificaciones de Éxito:**
- **Perfil actualizado**: Cuando guardas cambios en tu información
- **Contraseña cambiada**: Cuando cambias tu contraseña exitosamente
- **Rol asignado**: Cuando cambias el rol de un usuario
- **Código generado**: Cuando creas un nuevo código de invitación

### **Notificaciones de Error:**
- **Error de validación**: Cuando faltan campos requeridos
- **Contraseña incorrecta**: Cuando la contraseña actual no es válida
- **Contraseñas no coinciden**: Cuando las nuevas contraseñas no son iguales
- **Error de conexión**: Cuando hay problemas de red

### **Estados de Carga:**
- **Guardando**: Durante la actualización del perfil
- **Cambiando contraseña**: Durante el cambio de contraseña
- **Cargando usuarios**: Al cargar la lista de usuarios del condominio
- **Generando código**: Al crear un nuevo código de invitación

---

## 7) Consejos y Mejores Prácticas

### **Para la Información del Perfil:**
- **Mantén datos actualizados**: Especialmente email y teléfono
- **Usa imagen profesional**: Para mejor identificación en el sistema
- **Verifica cambios**: Revisa que la información se guarde correctamente

### **Para la Contraseña:**
- **Usa contraseñas seguras**: Mínimo 8 caracteres con números y símbolos
- **No compartas contraseñas**: Mantén la seguridad de tu cuenta
- **Cambia regularmente**: Especialmente si sospechas compromiso

### **Para Gestión de Roles (Administradores):**
- **Asigna técnicos cuidadosamente**: Solo a usuarios confiables
- **Documenta cambios**: Mantén registro de cambios de roles
- **Comunica cambios**: Informa a los usuarios sobre cambios en sus roles

### **Para Códigos de Invitación (Administradores):**
- **Comparte códigos seguramente**: Solo con personas autorizadas
- **Renueva códigos regularmente**: Para mantener la seguridad
- **Monitorea el uso**: Revisa quién se registra con tus códigos

### **Solución de Problemas:**
- **No puedo editar**: Verifica que tengas permisos de usuario
- **Error al guardar**: Revisa que todos los campos requeridos estén completos
- **No veo gestión de roles**: Solo administradores pueden acceder a esta función
- **Código no funciona**: Verifica que no haya expirado y que sea el correcto

---

## 8) Integración con Otros Módulos

El perfil se integra con:
- **Sistema de autenticación**: Para cambios de contraseña y datos
- **Gestión de usuarios**: Para administración de roles
- **Sistema de registro**: Para códigos de invitación
- **Notificaciones**: Para alertas sobre cambios importantes

Esta página es el centro de control de tu cuenta personal y, si eres administrador, también de la gestión de usuarios en tu condominio.

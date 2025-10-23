# Queries Centralizadas

Este directorio contiene todas las queries SQL organizadas por módulos para facilitar el mantenimiento y la migración de MySQL a PostgreSQL.

## Estructura

```
utils/queries/
├── index.js                    # Archivo índice que exporta todas las queries
├── alertQueries.js             # Queries específicas para alertas
├── alertNotificationQueries.js  # Queries específicas para notificaciones de alertas
├── authQueries.js              # Queries específicas para autenticación de usuarios
├── invitationQueries.js         # Queries específicas para códigos de invitación
├── passwordResetQueries.js     # Queries específicas para restablecimiento de contraseñas
├── categoryQueries.js          # Queries específicas para categorías (productos y alertas)
├── commentQueries.js           # Queries específicas para comentarios y datos de huertos
├── gardenQueries.js            # Queries específicas para huertos
├── inventoryQueries.js         # Queries específicas para inventario y permisos
├── invitationCodeQueries.js    # Queries específicas para códigos de invitación
├── irrigationAlertQueries.js   # Queries específicas para alertas de riego
├── locationQueries.js          # Queries específicas para ubicaciones
├── migrationQueries.js        # Queries específicas para migraciones de base de datos
├── notificationQueries.js     # Queries específicas para notificaciones
├── providerQueries.js         # Queries específicas para proveedores
├── statisticsQueries.js      # Queries específicas para estadísticas
├── userQueries.js            # Queries específicas para gestión de usuarios
└── README.md                   # Este archivo
```

## Migración a PostgreSQL

### Cambios principales:

1. **Parámetros**: Cambio de `?` (MySQL) a `$1, $2, $3...` (PostgreSQL)
2. **Booleanos**: Cambio de `0/1` a `true/false`
3. **Fechas**: Cambio de `CURDATE()` a `CURRENT_DATE`
4. **UUID**: Cambio de `UUID()` a `uuid_generate_v4()`
5. **Resultados**: Acceso a `result.rows` en lugar de `result[0]`

### Ejemplo de migración:

**MySQL (antes):**
```javascript
const [result] = await db.execute(
  'SELECT * FROM alertas WHERE id = ? AND is_deleted = 0', 
  [alertId]
);
const alert = result[0];
```

**PostgreSQL (después):**
```javascript
const result = await db.query(
  'SELECT * FROM alertas WHERE id = $1 AND is_deleted = false', 
  [alertId]
);
const alert = result.rows[0];
```

## Uso

```javascript
import { 
  AlertQueries, 
  AlertNotificationQueries, 
  AuthQueries, 
  InvitationQueries, 
  PasswordResetQueries,
  CategoryQueries,
  CommentQueries,
  GardenQueries,
  InventoryQueries,
  UserQueries
} from '../utils/queries/index.js';

// Usar las queries de alertas
const result = await db.query(AlertQueries.getById, [alertId]);
const alert = result.rows[0];

// Usar las queries de notificaciones de alertas
const notifications = await db.query(AlertNotificationQueries.getUserAlertNotifications, [userId, null, 10, 0]);
const notificationList = notifications.rows;

// Usar las queries de autenticación
const user = await db.query(AuthQueries.getByEmail, [email]);
const userData = user.rows[0];

// Usar las queries de códigos de invitación
const invitation = await db.query(InvitationQueries.getByCode, [code]);
const invitationData = invitation.rows[0];

// Usar las queries de restablecimiento de contraseñas
const resetCode = await db.query(PasswordResetQueries.getValidByEmail, [email]);
const codeData = resetCode.rows[0];

// Usar las queries de categorías
const categories = await db.query(CategoryQueries.getAllProductCategories);
const categoryList = categories.rows;

// Usar las queries de comentarios
const comments = await db.query(CommentQueries.getByGarden, [huertoId, 10, 0]);
const commentList = comments.rows;

// Usar las queries de huertos
const gardens = await db.query(GardenQueries.listWithAccess, [userId, locationId, userRole]);
const gardenList = gardens.rows;

// Usar las queries de inventario
const inventory = await db.query(InventoryQueries.listWithFilters, [categoryId, gardenId, providerId, lowStock, locationId]);
const inventoryList = inventory.rows;

// Usar las queries de usuarios
const user = await db.query(UserQueries.getMyProfile, [userId]);
const userData = user.rows[0];
```

## Beneficios

1. **Centralización**: Todas las queries en un lugar organizado
2. **Reutilización**: Las queries pueden ser reutilizadas en diferentes controladores
3. **Mantenimiento**: Fácil actualización y corrección de queries
4. **Migración**: Proceso sistemático de migración a PostgreSQL
5. **Testing**: Queries más fáciles de testear independientemente

## Próximos pasos

- Migrar otros controladores siguiendo el mismo patrón
- Crear archivos de queries para cada módulo (usuarios, huertos, inventario, etc.)
- Actualizar el archivo índice con todas las queries
- Implementar tests para las queries
- Migrar controladores relacionados con notificaciones generales
- Migrar controladores de gestión de huertos e inventario
- Migrar controladores de proveedores y productos
- Migrar controladores de comentarios de inventario

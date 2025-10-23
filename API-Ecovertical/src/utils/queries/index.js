// index.js
// Archivo índice para exportar todas las queries organizadas por módulos

// Importar queries de alertas
export { AlertQueries } from './alertQueries.js';

// Importar queries de notificaciones de alertas
export { AlertNotificationQueries } from './alertNotificationQueries.js';

// Importar queries de autenticación
export { AuthQueries } from './authQueries.js';

// Importar queries de tokens de autenticación
export { AuthTokenQueries } from './authTokenQueries.js';

// Importar queries de códigos de invitación
export { InvitationQueries } from './invitationQueries.js';

// Importar queries de restablecimiento de contraseñas
export { PasswordResetQueries } from './passwordResetQueries.js';

// Importar queries de categorías
export { CategoryQueries } from './categoryQueries.js';

// Importar queries de comentarios
export { CommentQueries } from './commentQueries.js';

// Importar queries de huertos
export { GardenQueries } from './gardenQueries.js';

// Importar queries de inventario
export { InventoryQueries } from './inventoryQueries.js';

// Importar queries de códigos de invitación
export { InvitationCodeQueries } from './invitationCodeQueries.js';

// Importar queries de alertas de riego
export { IrrigationAlertQueries } from './irrigationAlertQueries.js';

// Importar queries de ubicaciones
export { LocationQueries } from './locationQueries.js';

// Importar queries de ubicaciones (alias para compatibilidad)
export { UbicacionQueries } from '../queries.js';

// Importar queries de migraciones
export { MigrationQueries } from './migrationQueries.js';

// Importar queries de notificaciones
export { NotificationQueries } from './notificationQueries.js';

// Importar queries de proveedores
export { ProviderQueries } from './providerQueries.js';

// Importar queries de estadísticas
export { StatisticsQueries } from './statisticsQueries.js';

// Importar queries de usuarios
export { UserQueries } from './userQueries.js';

// Aquí se pueden agregar más imports de queries cuando se migren otros controladores
// export { PlantQueries } from './plantQueries.js';
// etc.

import { server } from "./app.js";
import dotenv from "dotenv";
import notificationService from "./services/notificationService.js";
import notificationScheduler from "./services/notificationScheduler.js";
import irrigationAlertService from "./services/irrigationAlertService.js";
import keepAliveService from "./utils/keepAlive.js";

dotenv.config();

// Configurar zona horaria desde variable de entorno
if (process.env.TZ) {
  console.log(`🌍 Zona horaria configurada: ${process.env.TZ}`);
} else {
  process.env.TZ = 'America/Caracas';
  console.log(`🌍 Zona horaria por defecto: ${process.env.TZ}`);
}

const PORT = process.env.PORT || 3000;

// Iniciar el servidor HTTP (para API REST)
server.listen(PORT, () => {
  console.log(`🚀 Servidor Express en http://localhost:${PORT}`);
  
  // Iniciar servicio de notificaciones
  notificationService.start();
  console.log(`🔔 Servicio de notificaciones iniciado`);
  
  // Iniciar programador de notificaciones de alertas
  notificationScheduler.start();
  console.log(`⏰ Programador de alertas iniciado`);
  
  // Inicializar servicio de alertas de riego con WebSocket
  irrigationAlertService.initialize(server);
  console.log(`💧 Servicio de alertas de riego iniciado`);
  
  // Iniciar servicio keep-alive para Render
  keepAliveService.start();
  console.log(`💓 Servicio keep-alive iniciado`);
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor...');
  notificationService.stop();
  notificationScheduler.stop();
  irrigationAlertService.stop();
  keepAliveService.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Cerrando servidor...');
  notificationService.stop();
  notificationScheduler.stop();
  irrigationAlertService.stop();
  keepAliveService.stop();
  process.exit(0);
});


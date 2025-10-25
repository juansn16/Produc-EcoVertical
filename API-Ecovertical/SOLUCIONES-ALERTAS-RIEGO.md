# 🛠️ Soluciones para Problemas de Alertas de Riego en Producción

## 📋 Resumen de Problemas Identificados

### 1. **Problema con WebSockets en Render (Plan Gratuito)**
- **Causa**: Render en plan gratuito tiene limitaciones severas con WebSockets
- **Síntomas**: 
  - Conexiones se desconectan después de 5 minutos de inactividad
  - Servicios se suspenden después de 15 minutos sin actividad
  - Usuarios conectados no se muestran correctamente

### 2. **Problema de Validación de Fechas**
- **Causa**: Diferencias de zona horaria entre cliente y servidor
- **Síntomas**: 
  - Errores de "fecha y hora no válidas" a pesar de ser válidas
  - Problemas de sincronización entre frontend y backend

## 🔧 Soluciones Implementadas

### **Solución 1: Optimización de WebSockets para Render**

#### **Backend (API-Ecovertical)**

**Archivo**: `src/services/irrigationAlertService.js`

```javascript
// Configuración optimizada para Render
this.io = new Server(server, {
  cors: { /* configuración CORS */ },
  transports: ['polling', 'websocket'], // Polling primero para mejor compatibilidad
  allowEIO3: true,
  pingTimeout: 20000, // Reducido para detectar desconexiones más rápido
  pingInterval: 10000, // Ping más frecuente para mantener conexión activa
  upgradeTimeout: 10000, // Timeout más corto para upgrades
  maxHttpBufferSize: 1e6, // Buffer más pequeño para mejor rendimiento
  serveClient: false, // No servir cliente para reducir carga
  allowUpgrades: true,
  perMessageDeflate: false // Deshabilitar compresión para mejor rendimiento
});
```

**Sistema de Heartbeat**:
```javascript
// Configurar heartbeat para mantener conexión activa en Render
socket.heartbeatInterval = setInterval(() => {
  if (socket.connected) {
    socket.emit('ping');
    console.log(`💓 Heartbeat enviado a ${socket.id}`);
  }
}, 30000); // Cada 30 segundos
```

**Manejo de Pong**:
```javascript
socket.on('pong', () => {
  console.log(`💓 Pong recibido de ${socket.id}`);
});
```

#### **Frontend (FRONT)**

**Archivo**: `src/hooks/useWebSocket.js`

```javascript
// Configuración optimizada para Render
const connectionOptions = {
  transports: ['polling', 'websocket'], // Polling primero para mejor compatibilidad con Render
  timeout: 30000, // 30 segundos para conexión inicial
  forceNew: true,
  reconnection: true,
  reconnectionAttempts: 10, // Más intentos para Render
  reconnectionDelay: 2000, // 2 segundos entre intentos
  reconnectionDelayMax: 10000, // Máximo 10 segundos
  autoConnect: true,
  upgrade: true,
  rememberUpgrade: false,
  pingTimeout: 20000,
  pingInterval: 10000
};
```

**Manejo de Heartbeat**:
```javascript
// Manejar heartbeat del servidor
socketRef.current.on('ping', () => {
  console.log('💓 Ping recibido del servidor');
  socketRef.current.emit('pong');
});
```

### **Solución 2: Mejora de Validación de Fechas**

#### **Backend**

**Archivo**: `src/controllers/irrigationAlertController.js`

```javascript
// Validar que la fecha y hora no sean en el pasado
const alertDateTime = new Date(`${fecha_alerta}T${hora_alerta}:00`);
const now = new Date();

// Agregar margen de 1 minuto para evitar problemas de sincronización
const marginTime = new Date(now.getTime() + 60000); // 1 minuto

console.log('🕐 Validación de fecha:', {
  fecha_alerta,
  hora_alerta,
  alertDateTime: alertDateTime.toISOString(),
  now: now.toISOString(),
  marginTime: marginTime.toISOString(),
  isValid: alertDateTime > marginTime
});

if (alertDateTime <= marginTime) {
  return res.status(400).json({
    success: false,
    message: 'La fecha y hora de la alerta no pueden ser en el pasado o muy próximas al momento actual'
  });
}
```

#### **Frontend**

**Archivo**: `src/components/irrigation/CreateIrrigationAlertModal.jsx`

```javascript
// Validar que la fecha y hora no sean en el pasado
const alertDateTime = new Date(`${formData.fecha_alerta}T${formData.hora_alerta}:00`);
const now = new Date();

// Agregar margen de 2 minutos para evitar problemas de sincronización
const marginTime = new Date(now.getTime() + 120000); // 2 minutos

console.log('🕐 Validación frontend:', {
  fecha_alerta: formData.fecha_alerta,
  hora_alerta: formData.hora_alerta,
  alertDateTime: alertDateTime.toISOString(),
  now: now.toISOString(),
  marginTime: marginTime.toISOString(),
  isValid: alertDateTime > marginTime
});

if (alertDateTime <= marginTime) {
  setError('La fecha y hora de la alerta no pueden ser en el pasado o muy próximas al momento actual');
  return false;
}
```

**Función getMinDateTime mejorada**:
```javascript
const getMinDateTime = () => {
  const now = new Date();
  // Agregar 2 minutos para evitar problemas de sincronización
  const minTime = new Date(now.getTime() + 120000);
  
  // Si es muy temprano en el día, usar el día actual con hora mínima
  // Si no, usar el día siguiente
  const isEarlyDay = now.getHours() < 6;
  const targetDate = isEarlyDay ? now : new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  const hours = String(minTime.getHours()).padStart(2, '0');
  const minutes = String(minTime.getMinutes()).padStart(2, '0');
  
  return {
    date: `${year}-${month}-${day}`,
    time: isEarlyDay ? `${hours}:${minutes}` : '08:00'
  };
};
```

### **Solución 3: Servicio Keep-Alive para Render**

#### **Nuevo Archivo**: `src/utils/keepAlive.js`

```javascript
class KeepAliveService {
  constructor() {
    this.interval = null;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    
    // Solo ejecutar en producción (Render)
    if (process.env.NODE_ENV !== 'production') return;

    this.interval = setInterval(async () => {
      try {
        const response = await fetch(`${process.env.API_URL || 'http://localhost:3000'}/api/ping`);
        if (response.ok) {
          console.log('💓 Keep-alive ping exitoso');
        }
      } catch (error) {
        console.error('❌ Error en keep-alive ping:', error.message);
      }
    }, 10 * 60 * 1000); // Cada 10 minutos

    this.isRunning = true;
    console.log('💓 Servicio keep-alive iniciado (cada 10 minutos)');
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.isRunning = false;
      console.log('🛑 Servicio keep-alive detenido');
    }
  }
}
```

#### **Integración en el Servidor**

**Archivo**: `src/server.js`

```javascript
import keepAliveService from "./utils/keepAlive.js";

// En el inicio del servidor
keepAliveService.start();
console.log(`💓 Servicio keep-alive iniciado`);

// En el cierre graceful
process.on('SIGINT', () => {
  keepAliveService.stop();
  // ... otros servicios
});
```

### **Solución 4: Endpoints de Monitoreo**

#### **Archivo**: `src/app.js`

```javascript
// Endpoint de salud mejorado
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "API EcoVertical funcionando correctamente",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    websocket: {
      connected: irrigationAlertService ? irrigationAlertService.getStats().connectedSockets : 0,
      onlineUsers: irrigationAlertService ? irrigationAlertService.getStats().onlineUsers : 0
    }
  });
});

// Endpoint de ping para mantener servicio activo en Render
app.get("/api/ping", (req, res) => {
  res.json({ 
    status: "pong", 
    timestamp: new Date().toISOString()
  });
});
```

## 🚀 Beneficios de las Soluciones

### **WebSockets**
- ✅ Conexiones más estables en Render
- ✅ Mejor detección de desconexiones
- ✅ Reconexión automática más robusta
- ✅ Heartbeat para mantener conexiones activas

### **Validación de Fechas**
- ✅ Margen de tiempo para evitar problemas de sincronización
- ✅ Mejor manejo de zonas horarias
- ✅ Validación más precisa en frontend y backend
- ✅ Logs detallados para debugging

### **Keep-Alive**
- ✅ Previene suspensión del servicio en Render
- ✅ Mantiene el servicio activo automáticamente
- ✅ Solo se ejecuta en producción

### **Monitoreo**
- ✅ Endpoints de salud para verificar estado
- ✅ Información detallada del sistema
- ✅ Estadísticas de WebSocket en tiempo real

## 📝 Instrucciones de Despliegue

1. **Desplegar los cambios**:
   ```bash
   git add .
   git commit -m "Fix: Solucionar problemas de WebSocket y validación de fechas en producción"
   git push origin main
   ```

2. **Verificar el despliegue**:
   - Revisar logs en Render para confirmar que los servicios se inician correctamente
   - Probar el endpoint `/api/health` para verificar el estado
   - Probar la creación de alertas de riego

3. **Monitorear**:
   - Verificar que el servicio keep-alive esté funcionando
   - Revisar logs de WebSocket para confirmar conexiones estables
   - Probar la funcionalidad de usuarios conectados

## 🔍 Troubleshooting

### **Si los WebSockets siguen fallando**:
1. Verificar que el servicio keep-alive esté ejecutándose
2. Revisar logs de conexión en Render
3. Considerar actualizar a un plan de pago de Render

### **Si las fechas siguen fallando**:
1. Verificar logs de validación en el backend
2. Confirmar que el frontend esté enviando fechas correctas
3. Revisar la zona horaria del servidor

### **Si el servicio se suspende**:
1. Verificar que el endpoint `/api/ping` esté funcionando
2. Confirmar que el servicio keep-alive esté activo
3. Revisar logs de keep-alive en Render

## 📊 Métricas de Éxito

- ✅ Conexiones WebSocket estables por más de 5 minutos
- ✅ Usuarios conectados se muestran correctamente
- ✅ Alertas de riego se crean sin errores de fecha
- ✅ Servicio no se suspende por inactividad
- ✅ Reconexión automática funciona correctamente

---

**Nota**: Estas soluciones están optimizadas específicamente para Render en plan gratuito. Si decides actualizar a un plan de pago, algunas de estas optimizaciones pueden no ser necesarias.

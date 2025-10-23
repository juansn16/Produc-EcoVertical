import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Wifi, WifiOff } from 'lucide-react';

const ApiStatusChecker = ({ children }) => {
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking', 'online', 'offline'
  const [lastCheck, setLastCheck] = useState(null);

  const checkApiStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });
      
      if (response.ok) {
        setApiStatus('online');
      } else {
        setApiStatus('offline');
      }
    } catch (error) {
      setApiStatus('offline');
    }
    
    setLastCheck(new Date());
  };

  useEffect(() => {
    checkApiStatus();
    
    // Verificar cada 30 segundos
    const interval = setInterval(checkApiStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (apiStatus === 'checking') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando conexión con el servidor...</p>
        </div>
      </div>
    );
  }

  if (apiStatus === 'offline') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <WifiOff className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-800 mb-4">
              Servidor No Disponible
            </h2>
            <p className="text-red-700 mb-6">
              No se pudo conectar con el servidor de la API. Esto puede deberse a:
            </p>
            <ul className="text-left text-red-700 mb-6 space-y-2">
              <li>• El servidor de la API no está ejecutándose</li>
              <li>• Problemas de conexión a internet</li>
              <li>• El servidor está en mantenimiento</li>
            </ul>
            <div className="space-y-4">
              <button
                onClick={checkApiStatus}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reintentar Conexión
              </button>
              <div className="text-sm text-red-600">
                Última verificación: {lastCheck ? lastCheck.toLocaleTimeString() : 'Nunca'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ApiStatusChecker;

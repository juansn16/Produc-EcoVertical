import React, { useState, useEffect } from 'react';
import { api } from '@/services/apiService';

const ApiStatus = () => {
  const [status, setStatus] = useState('checking');
  const [lastCheck, setLastCheck] = useState(null);

  const checkApiStatus = async () => {
    try {
      setStatus('checking');
      const response = await api.get('/health');
      setStatus('online');
      setLastCheck(new Date());
    } catch (error) {
      setStatus('offline');
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    checkApiStatus();
    
    // Verificar estado cada 30 segundos
    const interval = setInterval(checkApiStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'text-green-600 bg-green-100';
      case 'offline':
        return 'text-red-600 bg-red-100';
      case 'checking':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'API Conectada';
      case 'offline':
        return 'API Desconectada';
      case 'checking':
        return 'Verificando...';
      default:
        return 'Estado Desconocido';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'online':
        return '🟢';
      case 'offline':
        return '🔴';
      case 'checking':
        return '🟡';
      default:
        return '⚪';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div 
        className={`px-3 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 cursor-pointer transition-all duration-300 ${getStatusColor()}`}
        onClick={checkApiStatus}
        title="Haz clic para verificar el estado de la API"
      >
        <span className="text-lg">{getStatusIcon()}</span>
        <span>{getStatusText()}</span>
      </div>
      
      {lastCheck && (
        <div className="text-xs text-gray-500 mt-1 text-center">
          Última verificación: {lastCheck.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default ApiStatus; 
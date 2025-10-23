import React from 'react';
import useWebSocket from '../hooks/useWebSocket';

const WebSocketStatus = () => {
  const { isConnected, error, isDisabled, connect, disconnect } = useWebSocket();

  if (isDisabled) {
    return (
      <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg shadow-lg z-50">
        <div className="flex items-center space-x-2">
          <span className="text-yellow-600">⚠️</span>
          <span className="text-sm font-medium">
            WebSocket temporalmente deshabilitado debido a errores de conexión
          </span>
          <button
            onClick={connect}
            className="ml-2 bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!isConnected && error) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
        <div className="flex items-center space-x-2">
          <span className="text-red-600">❌</span>
          <span className="text-sm font-medium">
            Error de conexión WebSocket: {error}
          </span>
          <button
            onClick={connect}
            className="ml-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
          >
            Reconectar
          </button>
        </div>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50">
        <div className="flex items-center space-x-2">
          <span className="text-green-600">✅</span>
          <span className="text-sm font-medium">
            WebSocket conectado
          </span>
          <button
            onClick={disconnect}
            className="ml-2 bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
          >
            Desconectar
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default WebSocketStatus;

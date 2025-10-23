import React, { useState } from "react";
import MapaSelector from "./SelectorUbicacion";

const MapaTest = () => {
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState(null);
  const [mostrarInstrucciones, setMostrarInstrucciones] = useState(true);

  const handleUbicacionSeleccionada = (ubicacion) => {
    console.log("Ubicación seleccionada:", ubicacion);
    setUbicacionSeleccionada(ubicacion);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-huertotech-green-dark">
        🗺️ Prueba del Mapa - EcoVertical
      </h2>
      
      {/* Información de la ubicación seleccionada */}
      {ubicacionSeleccionada && (
        <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg shadow-lg">
          <h3 className="font-bold text-green-800 mb-3 text-lg">
            ✅ Ubicación Seleccionada Exitosamente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div><strong>📍 Calle:</strong> {ubicacionSeleccionada.calle || 'No especificada'}</div>
              <div><strong>🏙️ Ciudad:</strong> {ubicacionSeleccionada.ciudad || 'No especificada'}</div>
              <div><strong>🏛️ Estado:</strong> {ubicacionSeleccionada.estado || 'No especificado'}</div>
            </div>
            <div className="space-y-2">
              <div><strong>🌍 País:</strong> {ubicacionSeleccionada.pais || 'No especificado'}</div>
              <div><strong>📐 Latitud:</strong> {parseFloat(ubicacionSeleccionada.latitud).toFixed(2)}</div>
              <div><strong>📐 Longitud:</strong> {parseFloat(ubicacionSeleccionada.longitud).toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Contenedor del mapa */}
      <div className="h-96 w-full border border-gray-300 rounded-lg overflow-hidden shadow-xl">
        <MapaSelector
          onUbicacionSeleccionada={handleUbicacionSeleccionada}
          mostrarControles={true}
        />
      </div>

      {/* Instrucciones expandibles */}
      <div className="mt-6">
        <button
          onClick={() => setMostrarInstrucciones(!mostrarInstrucciones)}
          className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-left font-medium transition-colors"
        >
          {mostrarInstrucciones ? '📖 Ocultar Instrucciones' : '📖 Mostrar Instrucciones'}
        </button>
        
        {mostrarInstrucciones && (
          <div className="mt-4 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-bold text-blue-800 mb-4 text-lg">📋 Instrucciones de Uso</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-700 mb-2">🚀 Funcionalidades Automáticas</h4>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li>• <strong>Geolocalización automática:</strong> Al cargar, solicita permisos de ubicación</li>
                  <li>• <strong>Posicionamiento inteligente:</strong> Si aceptas, se posiciona en tu ubicación</li>
                  <li>• <strong>Detección de edificios:</strong> Identifica edificios cercanos automáticamente</li>
                  <li>• <strong>Normalización de coordenadas:</strong> Coordenadas consistentes para consistencia</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-blue-700 mb-2">🎯 Funcionalidades Manuales</h4>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li>• <strong>Selección manual:</strong> Haz clic en cualquier punto del mapa</li>
                  <li>• <strong>Botón de ubicación:</strong> "📍 Mi ubicación" para obtener ubicación manualmente</li>
                  <li>• <strong>Controles de zoom:</strong> Botones + y - en la esquina superior derecha</li>
                  <li>• <strong>Información en tiempo real:</strong> Coordenadas y dirección actualizadas</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">💡 Consejos de Uso</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Permisos denegados:</strong> No te preocupes, puedes usar selección manual</li>
                <li>• <strong>Precisión:</strong> Las coordenadas se normalizan a 5 decimales para consistencia</li>
                <li>• <strong>Edificios:</strong> Haz clic cerca de edificios para obtener coordenadas más precisas</li>
                <li>• <strong>Navegación:</strong> Usa el mouse para arrastrar y hacer zoom en el mapa</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Estado del sistema */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">🔧 Estado del Sistema</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <div>• <strong>Mapa:</strong> {ubicacionSeleccionada ? '✅ Funcionando' : '⏳ Esperando selección'}</div>
          <div>• <strong>Geolocalización:</strong> {navigator.geolocation ? '✅ Soportada' : '❌ No soportada'}</div>
          <div>• <strong>Permisos:</strong> {navigator.permissions ? '✅ API disponible' : '❌ API no disponible'}</div>
          <div>• <strong>Coordenadas:</strong> {ubicacionSeleccionada ? '✅ Capturadas' : '⏳ Pendientes'}</div>
        </div>
      </div>
    </div>
  );
};

export default MapaTest;

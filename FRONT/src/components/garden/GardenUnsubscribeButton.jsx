import React, { useState } from 'react';
import { LogOut, AlertTriangle, CheckCircle } from 'lucide-react';
import { unsubscribeFromGarden } from '../../services/gardenResidentService';

/**
 * Componente para que los residentes se den de baja de un huerto
 * Solo visible y funcional para residentes asignados
 */
export default function GardenUnsubscribeButton({ gardenId, gardenName, currentUser, onUnsubscribe }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verificar que el usuario es residente
  if (currentUser?.rol !== 'residente') {
    return null;
  }

  const handleUnsubscribe = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await unsubscribeFromGarden(gardenId);
      
      // Notificar al componente padre
      if (onUnsubscribe) {
        onUnsubscribe();
      }
      
      setShowConfirmModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón de darse de baja */}
      <button
        onClick={() => setShowConfirmModal(true)}
        className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors"
        title="Darse de baja del huerto"
      >
        <LogOut size={18} />
        Darse de baja
      </button>

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              {/* Icono de advertencia */}
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>

              {/* Título */}
              <h4 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Confirmar baja del huerto
              </h4>

              {/* Mensaje */}
              <p className="text-gray-600 text-center mb-6">
                ¿Estás seguro de que quieres darte de baja del huerto <strong>{gardenName}</strong>?
              </p>

              {/* Consecuencias */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h5 className="font-medium text-yellow-800 mb-2">Consecuencias:</h5>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Ya no podrás crear comentarios en este huerto</li>
                  <li>• No podrás editar o eliminar tus comentarios existentes</li>
                  <li>• Seguirás pudiendo ver los comentarios del huerto</li>
                  <li>• Podrás volver a ser asignado por un administrador</li>
                </ul>
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUnsubscribe}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <LogOut size={16} />
                      Confirmar baja
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

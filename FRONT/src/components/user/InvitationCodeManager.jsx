import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

function InvitationCodeManager() {
  const { user, token } = useAuth();
  const { isDarkMode } = useTheme();
  const [currentCode, setCurrentCode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Verificar si el usuario es administrador (usar tanto 'role' como 'rol' para compatibilidad)
  const userRole = user?.role || user?.rol;
  if (!user || userRole !== 'administrador') {
    console.log('Acceso denegado - Usuario:', user, 'Rol:', userRole);
    return (
      <div className={`border rounded-lg p-4 ${
        isDarkMode 
          ? 'bg-red-900/20 border-red-700' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center">
          <svg className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-red-400' : 'text-red-400'}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className={`font-medium ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>Acceso denegado</span>
        </div>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
          Solo los administradores pueden gestionar códigos de invitación.
        </p>
        <p className={`text-xs mt-2 ${isDarkMode ? 'text-red-500' : 'text-red-600'}`}>
          Debug: Usuario={user ? 'Sí' : 'No'}, Rol={userRole || 'No definido'}
        </p>
      </div>
    );
  }

  // Cargar código actual
  const loadCurrentCode = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/invitation-codes/current`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCurrentCode(data.data);
      } else {
        setError(data.message || 'Error al cargar el código actual');
      }
    } catch (error) {
      console.error('Error cargando código actual:', error);
      setError('Error de conexión al cargar el código');
    } finally {
      setIsLoading(false);
    }
  };

  // Generar nuevo código
  const generateNewCode = async () => {
    try {
      setIsGenerating(true);
      setError('');
      setSuccess('');
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/invitation-codes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expiracion_dias: 7
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCurrentCode(data.data);
        setSuccess('Código de invitación generado exitosamente');
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(data.message || 'Error al generar el código');
      }
    } catch (error) {
      console.error('Error generando código:', error);
      setError('Error de conexión al generar el código');
    } finally {
      setIsGenerating(false);
    }
  };

  // Eliminar código actual
  const deleteCurrentCode = async () => {
    if (!currentCode) return;
    
    try {
      setIsDeleting(true);
      setError('');
      setSuccess('');
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/invitation-codes/${currentCode.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCurrentCode(null);
        setSuccess('Código de invitación eliminado exitosamente');
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(data.message || 'Error al eliminar el código');
      }
    } catch (error) {
      console.error('Error eliminando código:', error);
      setError('Error de conexión al eliminar el código');
    } finally {
      setIsDeleting(false);
    }
  };

  // Copiar código al portapapeles
  const copyToClipboard = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setSuccess('Código copiado al portapapeles');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error copiando código:', error);
      setError('Error al copiar el código');
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Verificar si el código está expirado
  const isCodeExpired = (expirationDate) => {
    if (!expirationDate) return false;
    return new Date(expirationDate) < new Date();
  };

  useEffect(() => {
    loadCurrentCode();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-mountain-meadow"></div>
        <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cargando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Gestión de Códigos de Invitación</h2>
        <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Genera y gestiona códigos para que nuevos residentes se unan a tu condominio
        </p>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div className={`border rounded-lg p-4 ${
          isDarkMode 
            ? 'bg-red-900/20 border-red-700' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center">
            <svg className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-red-400' : 'text-red-400'}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className={`font-medium ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>Error</span>
          </div>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>{error}</p>
        </div>
      )}

      {success && (
        <div className={`border rounded-lg p-4 ${
          isDarkMode 
            ? 'bg-green-900/20 border-green-700' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center">
            <svg className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-green-400' : 'text-green-400'}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className={`font-medium ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>Éxito</span>
          </div>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>{success}</p>
        </div>
      )}

      {/* Código actual */}
      {currentCode ? (
        <div className={`border rounded-lg p-6 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Código Actual</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => copyToClipboard(currentCode.codigo)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  isDarkMode 
                    ? 'bg-blue-900/20 text-blue-300 hover:bg-blue-900/30' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                Copiar
              </button>
              <button
                onClick={deleteCurrentCode}
                disabled={isDeleting}
                className={`px-3 py-1 text-sm rounded-md transition-colors disabled:opacity-50 ${
                  isDarkMode 
                    ? 'bg-red-900/20 text-red-300 hover:bg-red-900/30' 
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {/* Código */}
            <div>
              <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Código</label>
              <div className={`mt-1 p-3 border rounded-md ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <span className={`text-2xl font-mono font-bold tracking-wider ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {currentCode.codigo}
                </span>
              </div>
            </div>

            {/* Estado */}
            <div>
              <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Estado</label>
              <div className="mt-1">
                {isCodeExpired(currentCode.fecha_expiracion) ? (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isDarkMode 
                      ? 'bg-red-900/20 text-red-300' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    Expirado
                  </span>
                ) : currentCode.usado_por ? (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isDarkMode 
                      ? 'bg-yellow-900/20 text-yellow-300' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    Usado
                  </span>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isDarkMode 
                      ? 'bg-green-900/20 text-green-300' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    Activo
                  </span>
                )}
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fecha de Creación</label>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  {formatDate(currentCode.fecha_creacion)}
                </p>
              </div>
              <div>
                <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fecha de Expiración</label>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  {formatDate(currentCode.fecha_expiracion)}
                </p>
              </div>
            </div>

            {/* Días restantes */}
            {currentCode.dias_restantes !== null && (
              <div>
                <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Días Restantes</label>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  {currentCode.dias_restantes > 0 
                    ? `${currentCode.dias_restantes} días` 
                    : 'Expirado'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={`border rounded-lg p-6 text-center ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <svg className={`mx-auto h-12 w-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <h3 className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No hay código activo</h3>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Genera un nuevo código de invitación para permitir que nuevos residentes se unan.
          </p>
        </div>
      )}

      {/* Botón para generar nuevo código */}
      <div className="flex justify-center">
        <button
          onClick={generateNewCode}
          disabled={isGenerating || (currentCode && !isCodeExpired(currentCode.fecha_expiracion) && !currentCode.usado_por)}
          className="px-6 py-3 bg-gradient-to-r from-eco-mountain-meadow to-eco-mountain-meadow-dark text-white font-medium rounded-lg hover:from-eco-mountain-meadow-dark hover:to-eco-mountain-meadow transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isGenerating ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Generando...</span>
            </div>
          ) : (
            currentCode ? 'Generar Nuevo Código' : 'Generar Código de Invitación'
          )}
        </button>
      </div>

      {/* Información adicional */}
      <div className={`border rounded-lg p-4 ${
        isDarkMode 
          ? 'bg-blue-900/20 border-blue-700' 
          : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex">
          <svg className={`h-5 w-5 mr-2 mt-0.5 ${isDarkMode ? 'text-blue-400' : 'text-blue-400'}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>Información importante</h4>
            <ul className={`mt-1 text-sm space-y-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
              <li>• Solo puedes tener un código activo a la vez</li>
              <li>• Los códigos expiran después de 7 días</li>
              <li>• El código puede ser usado múltiples veces hasta que expire</li>
              <li>• Comparte el código con todos los residentes que quieras invitar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvitationCodeManager;

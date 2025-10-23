import React from 'react';
import { Calendar, Clock, MapPin, User, MoreVertical, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const IrrigationAlertsList = ({ 
  alerts, 
  pagination, 
  onUpdateStatus, 
  onDelete, 
  onPageChange, 
  canDelete,
  isDarkMode = false
}) => {
  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'activa':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'completada':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelada':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'activa':
        return isDarkMode ? 'bg-blue-900/30 text-blue-300 border-blue-700/50' : 'bg-blue-100 text-blue-800';
      case 'completada':
        return isDarkMode ? 'bg-green-900/30 text-green-300 border-green-700/50' : 'bg-green-100 text-green-800';
      case 'cancelada':
        return isDarkMode ? 'bg-red-900/30 text-red-300 border-red-700/50' : 'bg-red-100 text-red-800';
      default:
        return isDarkMode ? 'bg-gray-700/30 text-gray-300 border-gray-600/50' : 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (fecha, hora) => {
    try {
      // Debug: mostrar datos originales
      console.log('🔍 Datos originales:', { fecha, hora, tipoFecha: typeof fecha, tipoHora: typeof hora });
      
      // Asegurar que la fecha y hora estén en el formato correcto
      const dateStr = fecha ? fecha.toString().trim() : '';
      const timeStr = hora ? hora.toString().trim() : '';
      
      if (!dateStr || !timeStr) {
        console.log('❌ Datos faltantes:', { dateStr, timeStr });
        return {
          date: 'Fecha no disponible',
          time: 'Hora no disponible'
        };
      }

      // Manejar diferentes formatos de fecha
      let formattedDate;
      let formattedTime;
      
      // Si la fecha viene como string en formato YYYY-MM-DD
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        formattedDate = dateStr;
      } 
      // Si viene como objeto Date
      else if (fecha instanceof Date) {
        formattedDate = fecha.toISOString().split('T')[0];
      }
      // Si viene como timestamp
      else if (typeof fecha === 'number' || (typeof fecha === 'string' && !isNaN(Date.parse(fecha)))) {
        const dateObj = new Date(fecha);
        formattedDate = dateObj.toISOString().split('T')[0];
      }
      else {
        console.log('❌ Formato de fecha no reconocido:', dateStr);
        return {
          date: 'Formato de fecha inválido',
          time: 'Formato de hora inválido'
        };
      }

      // Manejar diferentes formatos de hora
      if (timeStr.match(/^\d{2}:\d{2}$/)) {
        formattedTime = timeStr;
      } else if (timeStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
        formattedTime = timeStr.substring(0, 5); // Tomar solo HH:MM
      } else {
        console.log('❌ Formato de hora no reconocido:', timeStr);
        return {
          date: 'Formato de fecha inválido',
          time: 'Formato de hora inválido'
        };
      }

      // Crear fecha combinando fecha y hora
      const date = new Date(`${formattedDate}T${formattedTime}:00`);
      
      // Verificar que la fecha sea válida
      if (isNaN(date.getTime())) {
        console.log('❌ Fecha inválida después de combinar:', { formattedDate, formattedTime });
        return {
          date: 'Fecha inválida',
          time: 'Hora inválida'
        };
      }

      const result = {
        date: date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        time: date.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      console.log('✅ Fecha formateada correctamente:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Error formateando fecha y hora:', error, { fecha, hora });
      return {
        date: 'Error en fecha',
        time: 'Error en hora'
      };
    }
  };

  const handleStatusChange = async (alertId, newStatus) => {
    const result = await onUpdateStatus(alertId, newStatus);
    if (!result.success) {
      alert(result.message);
    }
  };

  const handleDelete = async (alertId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta alerta?')) {
      const result = await onDelete(alertId);
      if (!result.success) {
        alert(result.message);
      }
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className={`w-12 h-12 ${isDarkMode ? 'text-white' : 'text-gray-400'} mx-auto mb-4`} />
        <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
          No hay alertas programadas
        </h3>
        <p className={`${isDarkMode ? 'text-white' : 'text-gray-500'}`}>
          Crea tu primera alerta de riego para comenzar
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Lista de alertas */}
      <div className="space-y-4">
        {alerts.map((alert) => {
          const { date, time } = formatDateTime(alert.fecha_alerta, alert.hora_alerta);
          
          // Debug: mostrar datos de la alerta
          console.log('Datos de alerta:', {
            id: alert.id,
            fecha_alerta: alert.fecha_alerta,
            hora_alerta: alert.hora_alerta,
            formatted: { date, time }
          });
          
          return (
            <div
              key={alert.id}
              className={`${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border hover:shadow-sm transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header de la alerta */}
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(alert.estado)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(alert.estado)}`}>
                      {alert.estado.charAt(0).toUpperCase() + alert.estado.slice(1)}
                    </span>
                    <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-500'}`}>
                      Creada el {new Date(alert.fecha_creacion).toLocaleDateString('es-ES')}
                    </span>
                  </div>

                  {/* Información del huerto */}
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className={`w-4 h-4 ${isDarkMode ? 'text-white' : 'text-gray-500'}`} />
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{alert.huerto_nombre}</span>
                  </div>

                  {/* Descripción */}
                  <p className={`${isDarkMode ? 'text-white' : 'text-gray-700'} mb-3`}>{alert.descripcion}</p>

                  {/* Fecha y hora */}
                  <div className={`flex items-center gap-4 text-sm ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{time}</span>
                    </div>
                  </div>

                  {/* Creador */}
                  <div className={`flex items-center gap-1 mt-2 text-sm ${isDarkMode ? 'text-white' : 'text-gray-500'}`}>
                    <User className="w-4 h-4" />
                    <span>Creado por: {alert.creado_por_nombre}</span>
                  </div>
                </div>

                {/* Menú de acciones */}
                <div className="flex items-center gap-2">
                  {alert.estado === 'activa' && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleStatusChange(alert.id, 'completada')}
                        className={`px-3 py-1 text-xs rounded transition-colors ${
                          isDarkMode 
                            ? 'bg-green-900/30 text-white hover:bg-green-900/50 border border-green-700/50' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        title="Marcar como completada"
                      >
                        Completar
                      </button>
                      <button
                        onClick={() => handleStatusChange(alert.id, 'cancelada')}
                        className={`px-3 py-1 text-xs rounded transition-colors ${
                          isDarkMode 
                            ? 'bg-red-900/30 text-white hover:bg-red-900/50 border border-red-700/50' 
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                        title="Cancelar alerta"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                  
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(alert.id)}
                      className={`p-1 transition-colors ${
                        isDarkMode 
                          ? 'text-white hover:text-red-400' 
                          : 'text-gray-400 hover:text-red-600'
                      }`}
                      title="Eliminar alerta"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginación */}
      {pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
            {pagination.total} alertas
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`px-3 py-1 text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isDarkMode 
                  ? 'bg-slate-700 text-white hover:bg-slate-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Anterior
            </button>
            
            <span className={`px-3 py-1 text-sm rounded ${
              isDarkMode 
                ? 'bg-green-900/30 text-white border border-green-700/50' 
                : 'bg-green-100 text-green-700'
            }`}>
              {pagination.page} de {pagination.pages}
            </span>
            
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className={`px-3 py-1 text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isDarkMode 
                  ? 'bg-slate-700 text-white hover:bg-slate-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IrrigationAlertsList;

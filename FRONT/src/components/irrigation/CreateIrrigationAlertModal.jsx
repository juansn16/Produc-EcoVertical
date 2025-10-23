import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, FileText } from 'lucide-react';
import { getAllGardensForAdmin } from '../../services/gardenService';
import { useTheme } from '../../contexts/ThemeContext';

const CreateIrrigationAlertModal = ({ onClose, onSubmit, refreshTrigger }) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    huerto_id: '',
    descripcion: '',
    fecha_alerta: '',
    hora_alerta: ''
  });
  const [gardens, setGardens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGardens();
  }, []);

  // Recargar huertos cuando cambie el trigger de actualización
  useEffect(() => {
    if (refreshTrigger) {
      loadGardens();
    }
  }, [refreshTrigger]);

  const loadGardens = async () => {
    try {
      setLoading(true);
      const response = await getAllGardensForAdmin();
      if (response.success) {
        setGardens(response.data.gardens || []);
      }
    } catch (err) {
      console.error('Error cargando huertos:', err);
      setError('Error cargando lista de huertos');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error al cambiar valores
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.huerto_id) {
      setError('Debes seleccionar un huerto');
      return false;
    }
    
    if (!formData.descripcion.trim()) {
      setError('La descripción es requerida');
      return false;
    }
    
    if (!formData.fecha_alerta) {
      setError('La fecha es requerida');
      return false;
    }
    
    if (!formData.hora_alerta) {
      setError('La hora es requerida');
      return false;
    }

    // Validar que la fecha y hora no sean en el pasado
    const alertDateTime = new Date(`${formData.fecha_alerta}T${formData.hora_alerta}:00`);
    const now = new Date();
    
    if (alertDateTime <= now) {
      setError('La fecha y hora de la alerta no pueden ser en el pasado');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const result = await onSubmit(formData);
      
      if (result.success) {
        // Recargar lista de huertos para incluir nuevos
        await loadGardens();
        
        // Limpiar formulario
        setFormData({
          huerto_id: '',
          descripcion: '',
          fecha_alerta: '',
          hora_alerta: ''
        });
        onClose();
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error enviando formulario:', err);
      setError('Error inesperado al crear la alerta');
    } finally {
      setSubmitting(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`
    };
  };

  const minDateTime = getMinDateTime();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-theme-secondary dark:bg-theme-primary rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-eco-pear/20 dark:border-eco-pear/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-eco-mountain-meadow/20 dark:bg-eco-mountain-meadow/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-eco-mountain-meadow" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-theme-primary">
                Nueva Alerta de Riego
              </h3>
              <p className="text-sm text-theme-secondary">
                Programa una alerta de riego para un huerto
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-theme-secondary hover:text-theme-primary transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Selección de huerto */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-theme-secondary mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Huerto
            </label>
            {loading ? (
              <div className="flex items-center gap-2 text-theme-secondary">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-eco-mountain-meadow"></div>
                <span>Cargando huertos...</span>
              </div>
            ) : (
              <select
                name="huerto_id"
                value={formData.huerto_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-eco-pear/30 dark:border-eco-pear/50 rounded-lg focus:ring-2 focus:ring-eco-mountain-meadow focus:border-eco-mountain-meadow bg-theme-secondary dark:bg-theme-tertiary text-theme-primary"
                required
              >
                <option value="">Selecciona un huerto</option>
                {gardens.map((garden) => (
                  <option key={garden.id} value={garden.id}>
                    {garden.creador_nombre} - {garden.tipo === 'privado' ? 'Privado' : 'Público'}: {garden.nombre}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Descripción */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-theme-secondary mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              placeholder="Describe la tarea de riego a realizar..."
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'border-gray-300'
              }`}
              required
            />
          </div>

          {/* Fecha y hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-theme-secondary mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Fecha de la alerta
              </label>
              <input
                type="date"
                name="fecha_alerta"
                value={formData.fecha_alerta}
                onChange={handleInputChange}
                min={minDateTime.date}
                className="w-full px-3 py-2 border border-eco-pear/30 dark:border-eco-pear/50 rounded-lg focus:ring-2 focus:ring-eco-mountain-meadow focus:border-eco-mountain-meadow bg-theme-secondary dark:bg-theme-tertiary text-theme-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-theme-secondary mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Hora de la alerta
              </label>
              <input
                type="time"
                name="hora_alerta"
                value={formData.hora_alerta}
                onChange={handleInputChange}
                min={formData.fecha_alerta === minDateTime.date ? minDateTime.time : undefined}
                className="w-full px-3 py-2 border border-eco-pear/30 dark:border-eco-pear/50 rounded-lg focus:ring-2 focus:ring-eco-mountain-meadow focus:border-eco-mountain-meadow bg-theme-secondary dark:bg-theme-tertiary text-theme-primary"
                required
              />
            </div>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-600 rounded-lg">
              <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-theme-secondary bg-theme-tertiary dark:bg-theme-secondary rounded-lg hover:bg-theme-secondary dark:hover:bg-theme-tertiary transition-colors border border-eco-pear/30 dark:border-eco-pear/50"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald text-white rounded-lg hover:from-eco-mountain-meadow-dark hover:to-eco-emerald-dark transition-all duration-300 flex items-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creando...
                </>
              ) : (
                'Crear Alerta'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateIrrigationAlertModal;

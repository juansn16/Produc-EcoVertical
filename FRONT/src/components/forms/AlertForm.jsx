import React, { useState, useEffect } from 'react';
import { useForm } from '@/hooks/useForm';
import { alertsAPI, gardensAPI, handleAPIError } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const AlertForm = ({ onAlertCreated, editMode = false, alertData = null }) => {
  const { user } = useAuth();
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [gardens, setGardens] = useState([]);
  const [loading, setLoading] = useState(false);

  const initialValues = editMode && alertData ? {
    title: alertData.title || '',
    description: alertData.description || '',
    type: alertData.type || 'info',
    priority: alertData.priority || 'medium',
    gardenId: alertData.gardenId || '',
    targetUsers: alertData.targetUsers || ['all'],
    scheduledDate: alertData.scheduledDate || '',
    isActive: alertData.isActive !== undefined ? alertData.isActive : true,
    notes: alertData.notes || ''
  } : {
    title: '',
    description: '',
    type: 'info',
    priority: 'medium',
    gardenId: '',
    targetUsers: ['all'],
    scheduledDate: '',
    isActive: true,
    notes: ''
  };

  const { values, errors, isSubmitting, handleChange, handleSubmit, resetForm, setFieldValue } = useForm(initialValues);

  // Cargar huertos al montar el componente
  useEffect(() => {
    const loadGardens = async () => {
      try {
        setLoading(true);
        const response = await gardensAPI.getAllGardens();
        setGardens(response.data);
        
        // Si no estamos en modo edición, establecer el huerto actual como pre-seleccionado
        if (!editMode) {
          const selectedGardenId = localStorage.getItem('selectedGardenId');
          if (selectedGardenId) {
            setFieldValue('gardenId', selectedGardenId);
          }
        }
      } catch (error) {
        console.error('Error cargando huertos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGardens();
  }, [editMode, setFieldValue]);

  const onSubmit = async (formData) => {
    try {
      setSubmitError('');
      setSubmitSuccess('');

      const alertData = {
        ...formData,
        createdBy: user.id,
        status: formData.isActive ? 'active' : 'inactive'
      };

      let response;
      if (editMode && alertData.id) {
        response = await alertsAPI.updateAlert(alertData.id, alertData);
        setSubmitSuccess('Alerta actualizada exitosamente');
      } else {
        response = await alertsAPI.createAlert(alertData);
        setSubmitSuccess('Alerta creada exitosamente');
      }
      
      resetForm();
      
      // Notificar al componente padre
      if (onAlertCreated) {
        onAlertCreated(response.data);
      }

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSubmitSuccess(''), 3000);
    } catch (error) {
      const errorMessage = handleAPIError(error);
      setSubmitError(errorMessage);
    }
  };

  const alertTypes = [
    { value: 'info', label: 'Información', icon: 'ℹ️' },
    { value: 'warning', label: 'Advertencia', icon: '⚠️' },
    { value: 'error', label: 'Error', icon: '❌' },
    { value: 'success', label: 'Éxito', icon: '✅' },
    { value: 'maintenance', label: 'Mantenimiento', icon: '🔧' },
    { value: 'watering', label: 'Riego', icon: '💧' },
    { value: 'harvest', label: 'Cosecha', icon: '🌾' },
    { value: 'pest', label: 'Plagas', icon: '🐛' }
  ];

  const priorities = [
    { value: 'low', label: 'Baja', color: 'text-green-600' },
    { value: 'medium', label: 'Media', color: 'text-yellow-600' },
    { value: 'high', label: 'Alta', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgente', color: 'text-red-600' }
  ];

  const targetUserOptions = [
    { value: 'all', label: 'Todos los usuarios' },
    { value: 'residents', label: 'Solo residentes' },
    { value: 'technicians', label: 'Solo técnicos' },
    { value: 'admins', label: 'Solo administradores' }
  ];

  const handleTargetUsersChange = (e) => {
    const value = e.target.value;
    if (value === 'all') {
      setFieldValue('targetUsers', ['all']);
    } else {
      setFieldValue('targetUsers', [value]);
    }
  };

  return (
    <ProtectedRoute requiredPermission="create_alerts">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {editMode ? 'Editar Alerta' : 'Crear Nueva Alerta'}
        </h3>

        {submitError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {submitError}
          </div>
        )}

        {submitSuccess && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {submitSuccess}
          </div>
        )}

        <form onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(onSubmit);
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Título de la Alerta *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={values.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent"
                placeholder="Ej: Mantenimiento programado del sistema de riego"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                id="description"
                name="description"
                value={values.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent"
                placeholder="Describe detalladamente la alerta..."
                required
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Alerta *
              </label>
              <select
                id="type"
                name="type"
                value={values.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent"
                required
              >
                {alertTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad *
              </label>
              <select
                id="priority"
                name="priority"
                value={values.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent"
                required
              >
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="gardenId" className="block text-sm font-medium text-gray-700 mb-2">
                Huerto (Opcional)
              </label>
              <select
                id="gardenId"
                name="gardenId"
                value={values.gardenId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent"
              >
                <option value="">Todos los huertos</option>
                {loading ? (
                  <option disabled>Cargando huertos...</option>
                ) : (
                  gardens.map(garden => (
                    <option key={garden.id} value={garden.id}>
                      {garden.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label htmlFor="targetUsers" className="block text-sm font-medium text-gray-700 mb-2">
                Usuarios Objetivo *
              </label>
              <select
                id="targetUsers"
                name="targetUsers"
                value={values.targetUsers[0]}
                onChange={handleTargetUsersChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent"
                required
              >
                {targetUserOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Programada
              </label>
              <input
                type="datetime-local"
                id="scheduledDate"
                name="scheduledDate"
                value={values.scheduledDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={values.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-eco-mountain-meadow focus:ring-eco-mountain-meadow border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Alerta activa
              </label>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notas Adicionales
              </label>
              <textarea
                id="notes"
                name="notes"
                value={values.notes}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent"
                placeholder="Instrucciones adicionales, enlaces, etc..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !values.title.trim() || !values.description.trim()}
              className="px-4 py-2 bg-eco-mountain-meadow text-white rounded-md hover:bg-eco-mountain-meadow-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Guardando...' : (editMode ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
};

export default AlertForm; 
import React, { useState, useEffect } from 'react';
import { useForm } from '@/hooks/useForm';
import { inventoryAPI, providersAPI, handleAPIError } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const InventoryForm = ({ onItemAdded, editMode = false, itemData = null }) => {
  const { user } = useAuth();
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);

  const initialValues = editMode && itemData ? {
    name: itemData.name || '',
    description: itemData.description || '',
    category: itemData.category || 'herramientas',
    quantity: itemData.quantity || 1,
    unit: itemData.unit || 'unidad',
    minStock: itemData.minStock || 1,
    currentStock: itemData.currentStock || 1,
    location: itemData.location || '',
    providerId: itemData.providerId || '',
    cost: itemData.cost || '',
    status: itemData.status || 'active',
    notes: itemData.notes || ''
  } : {
    name: '',
    description: '',
    category: 'herramientas',
    quantity: 1,
    unit: 'unidad',
    minStock: 1,
    currentStock: 1,
    location: '',
    providerId: '',
    cost: '',
    status: 'active',
    notes: ''
  };

  const { values, errors, isSubmitting, handleChange, handleSubmit, resetForm } = useForm(initialValues);

  // Cargar proveedores al montar el componente
  useEffect(() => {
    const loadProviders = async () => {
      try {
        setLoading(true);
        const response = await providersAPI.getAllProviders();
        setProviders(response.data);
      } catch (error) {
        console.error('Error cargando proveedores:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProviders();
  }, []);

  const onSubmit = async (formData) => {
    try {
      setSubmitError('');
      setSubmitSuccess('');

      const inventoryData = {
        ...formData,
        managedBy: user.id
      };

      let response;
      if (editMode && itemData?.id) {
        response = await inventoryAPI.updateItem(itemData.id, inventoryData);
        setSubmitSuccess('Item del inventario actualizado exitosamente');
      } else {
        response = await inventoryAPI.createItem(inventoryData);
        setSubmitSuccess('Item agregado al inventario exitosamente');
      }
      
      resetForm();
      
      // Notificar al componente padre
      if (onItemAdded) {
        onItemAdded(response.data);
      }

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSubmitSuccess(''), 3000);
    } catch (error) {
      const errorMessage = handleAPIError(error);
      setSubmitError(errorMessage);
    }
  };

  const categories = [
    { value: 'herramientas', label: 'Herramientas' },
    { value: 'fertilizantes', label: 'Fertilizantes' },
    { value: 'semillas', label: 'Semillas' },
    { value: 'macetas', label: 'Macetas y Contenedores' },
    { value: 'sustratos', label: 'Sustratos' },
    { value: 'riego', label: 'Sistemas de Riego' },
    { value: 'iluminacion', label: 'Iluminación' },
    { value: 'monitoreo', label: 'Sensores y Monitoreo' },
    { value: 'proteccion', label: 'Protección de Plantas' },
    { value: 'otros', label: 'Otros' }
  ];

  const units = [
    { value: 'unidad', label: 'Unidad' },
    { value: 'kg', label: 'Kilogramos' },
    { value: 'g', label: 'Gramos' },
    { value: 'l', label: 'Litros' },
    { value: 'ml', label: 'Mililitros' },
    { value: 'm', label: 'Metros' },
    { value: 'cm', label: 'Centímetros' },
    { value: 'paquete', label: 'Paquete' },
    { value: 'caja', label: 'Caja' },
    { value: 'rollo', label: 'Rollo' },
    { value: 'set', label: 'Set' }
  ];

  const statuses = [
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
    { value: 'maintenance', label: 'En Mantenimiento' },
    { value: 'retired', label: 'Retirado' }
  ];

  return (
    <ProtectedRoute requiredPermission="manage_inventory">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {editMode ? 'Editar Item del Inventario' : 'Agregar Nuevo Item al Inventario'}
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Item *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={values.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent"
                placeholder="Ej: Tijeras de podar"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                value={values.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent"
                placeholder="Describe el item..."
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                id="category"
                name="category"
                value={values.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent"
                required
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                id="status"
                name="status"
                value={values.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent"
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad *
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={values.quantity}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
                Unidad
              </label>
              <select
                id="unit"
                name="unit"
                value={values.unit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent"
              >
                {units.map(unit => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="currentStock" className="block text-sm font-medium text-gray-700 mb-2">
                Stock Actual *
              </label>
              <input
                type="number"
                id="currentStock"
                name="currentStock"
                value={values.currentStock}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="minStock" className="block text-sm font-medium text-gray-700 mb-2">
                Stock Mínimo *
              </label>
              <input
                type="number"
                id="minStock"
                name="minStock"
                value={values.minStock}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-2">
                Costo Unitario
              </label>
              <input
                type="number"
                id="cost"
                name="cost"
                value={values.cost}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={values.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent"
                placeholder="Ej: Estante A, Nivel 2"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="providerId" className="block text-sm font-medium text-gray-700 mb-2">
                Proveedor
              </label>
              <select
                id="providerId"
                name="providerId"
                value={values.providerId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent"
              >
                <option value="">Seleccionar proveedor</option>
                {loading ? (
                  <option disabled>Cargando proveedores...</option>
                ) : (
                  providers.map(provider => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))
                )}
              </select>
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
                placeholder="Información adicional, instrucciones de uso, etc..."
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
              disabled={isSubmitting || !values.name.trim()}
              className="px-4 py-2 bg-eco-mountain-meadow text-white rounded-md hover:bg-eco-mountain-meadow-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Guardando...' : (editMode ? 'Actualizar' : 'Agregar')}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
};

export default InventoryForm; 
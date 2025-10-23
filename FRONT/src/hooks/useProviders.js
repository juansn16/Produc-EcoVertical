import { useState, useEffect, useCallback } from 'react';
import { providersAPI, handleAPIError } from '@/services/apiService';
import { showSuccess, showError } from '@/utils/toast';

export const useProviders = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  // Cargar todos los proveedores
  const loadProviders = useCallback(async (newFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await providersAPI.getAllProviders(newFilters);
      setProviders(response.data.data || []);
      setFilters(newFilters);
    } catch (err) {
      const errorMessage = handleAPIError(err);
      
      if (err.response?.status === 403) {
        setError('No tienes permisos para acceder a los proveedores. Contacta al administrador.');
        await showError('No tienes permisos para acceder a los proveedores');
      } else if (err.response?.status === 401) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        await showError('Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else {
        setError(errorMessage);
        await showError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar proveedores
  const searchProviders = useCallback(async (query) => {
    setLoading(true);
    try {
      const response = await providersAPI.searchProviders(query);
      setProviders(response.data.data || []);
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      await showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nuevo proveedor
  const createProvider = useCallback(async (providerData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Enviando datos del proveedor:', providerData);
      const response = await providersAPI.createProvider(providerData);
      console.log('Respuesta del servidor:', response);
      
      if (response.data.success) {
        const newProvider = response.data.data;
        setProviders(prev => [newProvider, ...prev]);
        showSuccess('Proveedor creado exitosamente'); // Sin await para evitar delay
        return newProvider;
      } else {
        throw new Error(response.data.message || 'Error al crear proveedor');
      }
    } catch (err) {
      console.error('Error completo al crear proveedor:', err);
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      showError(errorMessage); // Sin await para evitar delay
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar proveedor
  const updateProvider = useCallback(async (id, providerData) => {
    setLoading(true);
    try {
      const response = await providersAPI.updateProvider(id, providerData);
      const updatedProvider = response.data.data;
      setProviders(prev => 
        prev.map(provider => 
          provider.id === id ? updatedProvider : provider
        )
      );
      await showSuccess('Proveedor actualizado exitosamente');
      return updatedProvider;
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      await showError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar proveedor
  const deleteProvider = useCallback(async (id) => {
    setLoading(true);
    try {
      await providersAPI.deleteProvider(id);
      setProviders(prev => prev.filter(provider => provider.id !== id));
      await showSuccess('Proveedor eliminado exitosamente');
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      await showError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener proveedor por ID
  const getProviderById = useCallback(async (id) => {
    try {
      const response = await providersAPI.getProviderById(id);
      return response.data.data;
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      await showError(errorMessage);
      throw err;
    }
  }, []);

  // Cargar proveedores al montar el componente
  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  return {
    providers,
    loading,
    error,
    filters,
    loadProviders,
    searchProviders,
    createProvider,
    updateProvider,
    deleteProvider,
    getProviderById,
    setError
  };
};

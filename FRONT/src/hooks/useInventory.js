import { useState, useEffect, useCallback } from 'react';
import { inventoryAPI, commentsAPI, handleAPIError } from '@/services/apiService';
import { showSuccess, showError } from '@/utils/toast';

export const useInventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [lowStockItems, setLowStockItems] = useState([]);

  // Cargar todos los ítems de inventario
  const loadItems = useCallback(async (newFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryAPI.getAllItems(newFilters);
      setItems(response.data.data || []);
      setFilters(newFilters);
    } catch (err) {
      const errorMessage = handleAPIError(err);
      
      // Si es un error 403, mostrar mensaje específico
      if (err.response?.status === 403) {
        setError('No tienes permisos para acceder al inventario. Contacta al administrador.');
        await showError('No tienes permisos para acceder al inventario');
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

  // Cargar ítems con bajo stock
  const loadLowStockItems = useCallback(async () => {
    try {
      const response = await inventoryAPI.getLowStockItems();
      setLowStockItems(response.data.data || []);
    } catch (err) {
      // No mostrar error para low stock si es 403, solo log
      if (err.response?.status !== 403) {
        const errorMessage = handleAPIError(err);
        await showError(errorMessage);
      }
    }
  }, []);

  // Crear nuevo ítem
  const createItem = useCallback(async (itemData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Enviando datos a la API para crear inventario:', itemData);
      const response = await inventoryAPI.createItem(itemData);
      const newItem = response.data.data;
      setItems(prev => [newItem, ...prev]);
      await showSuccess('Ítem agregado al inventario exitosamente');
      return newItem;
    } catch (err) {
      console.error('❌ Error completo al crear inventario:', err);
      console.error('❌ Error response:', err.response);
      console.error('❌ Error data:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      await showError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar ítem existente
  const updateItem = useCallback(async (id, itemData) => {
    setLoading(true);
    try {
      const response = await inventoryAPI.updateItem(id, itemData);
      const updatedItem = response.data.data;
      setItems(prev => prev.map(item => 
        item.id === id ? updatedItem : item
      ));
      await showSuccess('Ítem actualizado exitosamente');
      return updatedItem;
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      await showError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar ítem
  const deleteItem = useCallback(async (id) => {
    setLoading(true);
    try {
      await inventoryAPI.deleteItem(id);
      setItems(prev => prev.filter(item => item.id !== id));
      await showSuccess('Ítem eliminado exitosamente');
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      await showError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar stock de un ítem
  const updateStock = useCallback(async (id, stockData) => {
    setLoading(true);
    try {
      const response = await inventoryAPI.updateItemStock(id, stockData);
      const updatedItem = response.data.data;
      setItems(prev => prev.map(item => 
        item.id === id ? updatedItem : item
      ));
      await showSuccess('Stock actualizado exitosamente');
      return updatedItem;
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      await showError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Generar comentario automático sobre el uso de stock
  const generateUsageComment = useCallback(async (itemId, itemName, cantidadUsada, stockRestante, notas, huertoId) => {
    console.log('🚀 [generateUsageComment] INICIO');
    console.log('📋 Parámetros:', { itemId, itemName, cantidadUsada, stockRestante, notas, huertoId });
    
    try {
      // Obtener el usuario actual del localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const selectedGardenId = huertoId || localStorage.getItem('selectedGardenId');
      
      console.log('🔍 Debug huerto:', {
        huertoId_recibido: huertoId,
        selectedGardenId_final: selectedGardenId,
        localStorage_GardenId: localStorage.getItem('selectedGardenId')
      });
      
      // Si no hay huerto seleccionado, no crear el comentario
      if (!selectedGardenId || selectedGardenId === 'undefined' || selectedGardenId === 'null') {
        console.warn('⚠️ No hay huerto seleccionado, se omite la creación del comentario automático');
        return;
      }
      
      // Crear el contenido del comentario
      const commentContent = `📦 **Uso de Inventario Registrado**
      
**Producto:** ${itemName}
**Cantidad Utilizada:** ${cantidadUsada} unidades
**Stock Restante:** ${stockRestante} unidades
**Fecha:** ${new Date().toLocaleDateString('es-ES', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}

${notas ? `**Notas:** ${notas}` : ''}

Este comentario se generó automáticamente al registrar el uso del producto en el inventario.`;

      // Crear el comentario
      // Nota: usuario_id se obtiene del token JWT en el backend, no hay que enviarlo
      const commentData = {
        contenido: commentContent,
        tipo_comentario: 'mantenimiento',
        etiquetas: ['inventario', 'uso', 'stock', 'automático']
      };

      console.log('🔄 [generateUsageComment] Enviando comentario...');
      console.log('📍 URL: /comments/garden/' + selectedGardenId);
      console.log('📦 Datos:', commentData);

      await commentsAPI.createComment(selectedGardenId, commentData);
      console.log('✅ Comentario automático generado exitosamente');
    } catch (error) {
      console.error('Error al generar comentario automático:', error);
      // No mostrar error al usuario, solo log
    }
  }, []);

  // Registrar uso de un ítem
  const recordUsage = useCallback(async (id, usageData) => {
    setLoading(true);
    try {
      console.log('🔄 [recordUsage] Iniciando registro de uso');
      console.log('📦 [recordUsage] id:', id);
      console.log('📦 [recordUsage] usageData:', usageData);
      
      const response = await inventoryAPI.recordItemUsage(id, usageData);
      const updatedItem = response.data.data;
      
      console.log('✅ [recordUsage] Uso registrado exitosamente');
      
      // Actualizar el estado local
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, cantidad_stock: updatedItem.stock_restante } : item
      ));
      
      // Generar comentario automático
      const item = items.find(item => item.id === id);
      console.log('🔍 [recordUsage] Item encontrado:', item);
      console.log('🌱 [recordUsage] usageData.huerto_id:', usageData.huerto_id);
      
      if (item) {
        await generateUsageComment(
          id,
          item.nombre,
          usageData.cantidad_usada,
          updatedItem.stock_restante,
          usageData.notas,
          usageData.huerto_id
        );
      }
      
      await showSuccess('Uso de ítem registrado exitosamente');
      return updatedItem;
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      await showError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [items, generateUsageComment]);

  // Obtener historial de un ítem
  const getItemHistory = useCallback(async (id) => {
    try {
      const response = await inventoryAPI.getItemHistory(id);
      return response.data.data;
    } catch (err) {
      const errorMessage = handleAPIError(err);
      await showError(errorMessage);
      throw err;
    }
  }, []);

  // Obtener detalles de un ítem
  const getItemById = useCallback(async (id) => {
    try {
      const response = await inventoryAPI.getItemById(id);
      return response.data.data;
    } catch (err) {
      const errorMessage = handleAPIError(err);
      await showError(errorMessage);
      throw err;
    }
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadItems();
    loadLowStockItems();
  }, []); // Solo ejecutar una vez al montar

  return {
    items,
    loading,
    error,
    filters,
    lowStockItems,
    loadItems,
    loadLowStockItems,
    createItem,
    updateItem,
    deleteItem,
    updateStock,
    recordUsage,
    getItemHistory,
    getItemById,
    setError
  };
};

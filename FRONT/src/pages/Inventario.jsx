import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { SearchBar } from '@/components/catalog/SearchBar';
import { FilterControls } from '@/components/catalog/FilterControls';
import { ActiveFilters } from '@/components/catalog/ActiveFilters';
import InventoryGrid from '@/components/catalog/InventoryGrid';
import AddInventoryModal from '@/components/catalog/AddInventoryModal';
import InventoryUsageHistory from '@/components/catalog/InventoryUsageHistory';
import InventoryPermissionsManager from '@/components/inventory/InventoryPermissionsManager';
import InventoryCommentsManagementModal from '@/components/inventory/InventoryCommentsManagementModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import PermissionNotification from '@/components/common/PermissionNotification';
import { useInventory } from '@/hooks/useInventory';
import useContentFilter from '@/hooks/useContentFilter';
import { usePagination } from '@/hooks/usePagination';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getAllInventoryComments } from '@/services/inventoryService';
import { Package, Plus, AlertTriangle, TrendingUp, TrendingDown, X, MessageSquare } from 'lucide-react';

function Inventario() {
  const { canAccess, user: currentUser } = useAuth();
  const { isDarkMode } = useTheme();
  const {
    items,
    loading,
    error,
    lowStockItems,
    createItem,
    updateItem,
    deleteItem,
    updateStock,
    recordUsage,
    loadItems,
    setError
  } = useInventory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPermissionsManager, setShowPermissionsManager] = useState(false);
  const [selectedItemForPermissions, setSelectedItemForPermissions] = useState(null);
  
  // Estados para gestión de comentarios de inventario
  const [showInventoryCommentsManager, setShowInventoryCommentsManager] = useState(false);
  const [inventoryComments, setInventoryComments] = useState([]);
  const [loadingInventoryComments, setLoadingInventoryComments] = useState(false);
  
  
  // Estados para notificaciones
  const [notification, setNotification] = useState({
    isVisible: false,
    type: 'success',
    message: ''
  });

  const {
    searchTerm,
    setSearchTerm,
    activeFilters,
    toggleFilter,
    sortBy,
    setSortBy,
    filteredData,
    clearAllFilters
  } = useContentFilter(Array.isArray(items) ? items : []);

  // Paginación para inventarios
  const {
    paginatedData,
    currentPage,
    totalPages,
    goToPage,
    goToNextPage,
    goToPrevPage,
    resetPagination
  } = usePagination(filteredData, 8); // 8 ítems por página

  // Aplicar filtros de búsqueda y ordenamiento
  useEffect(() => {
    const filters = {};
    if (activeFilters.category) filters.category = activeFilters.category;
    if (activeFilters.lowStock) filters.lowStock = 'true';
    if (activeFilters.gardenId) filters.gardenId = activeFilters.gardenId;
    if (activeFilters.providerId) filters.providerId = activeFilters.providerId;
    
    loadItems(filters);
  }, [activeFilters]);

  // Resetear paginación cuando cambien los filtros
  useEffect(() => {
    resetPagination();
  }, [searchTerm, activeFilters, resetPagination]);

  const handleAddInventory = async (newItem) => {
    try {
      console.log('🔍 handleAddInventory - Datos recibidos:', newItem);
      await createItem(newItem);
      setIsModalOpen(false);
    } catch (error) {
      console.error('❌ Error al crear ítem:', error);
    }
  };

  const handleUpdateInventory = async (id, updatedItem) => {
    try {
      await updateItem(id, updatedItem);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error al actualizar ítem:', error);
    }
  };

  const handleDeleteInventory = (id) => {
    const item = items.find(item => item.id === id);
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteItem(itemToDelete.id);
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error al eliminar ítem:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
    setIsDeleting(false);
  };

  const openPermissionsManager = (item) => {
    setSelectedItemForPermissions(item);
    setShowPermissionsManager(true);
  };

  const closePermissionsManager = () => {
    setShowPermissionsManager(false);
    setSelectedItemForPermissions(null);
  };

  const handlePermissionChange = () => {
    // Recargar los items para reflejar cambios en permisos
    loadItems();
  };

  const handleUpdateStock = async (id, stockData) => {
    try {
      await updateStock(id, stockData);
      setIsStockModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error al actualizar stock:', error);
    }
  };

  const handleRecordUsage = async (id, usageData) => {
    try {
      await recordUsage(id, usageData);
      setIsUsageModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error al registrar uso:', error);
    }
  };

  const openUsageModal = (item) => {
    setSelectedItem(item);
    setIsUsageModalOpen(true);
  };

  const openStockModal = (item) => {
    setSelectedItem(item);
    setIsStockModalOpen(true);
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const openHistoryModal = (item) => {
    setSelectedItem(item);
    setIsHistoryModalOpen(true);
  };

  // Funciones para gestión de comentarios de inventario
  const openInventoryCommentsManager = async () => {
    setLoadingInventoryComments(true);
    try {
      // Cargar TODOS los comentarios de inventario (no solo del usuario actual)
      const response = await getAllInventoryComments(); // Obtener todos los comentarios
      console.log('📡 Respuesta completa del backend:', response);
      const comments = response.data || [];
      
      console.log('📝 Todos los comentarios de inventario cargados:', comments);
      console.log('📝 Número de comentarios:', comments.length);
      
      setInventoryComments(comments);
      setShowInventoryCommentsManager(true);
    } catch (error) {
      console.error('Error cargando comentarios:', error);
      setInventoryComments([]);
      setShowInventoryCommentsManager(true);
    } finally {
      setLoadingInventoryComments(false);
    }
  };

  const closeInventoryCommentsManager = () => {
    setShowInventoryCommentsManager(false);
    setInventoryComments([]);
  };


  const handleCommentPermissionChange = (permission) => {
    console.log('Permiso de comentario cambiado:', permission);
    
    // Mostrar notificación según la acción
    if (permission.action === 'assign') {
      setNotification({
        isVisible: true,
        type: 'success',
        message: `Permiso "${permission.permissionType}" asignado exitosamente`
      });
    } else if (permission.action === 'revoke') {
      setNotification({
        isVisible: true,
        type: 'success',
        message: `Permiso "${permission.permission.permiso_tipo}" revocado exitosamente`
      });
    }
  };

  const showNotification = (type, message) => {
    setNotification({
      isVisible: true,
      type,
      message
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  // Calcular estadísticas
  const totalItems = items.length;
  const totalStock = items.reduce((sum, item) => sum + (item.cantidad_stock || 0), 0);
  const lowStockCount = items.filter(item => (item.cantidad_stock || 0) <= (item.cantidad_minima || 5)).length;
  const outOfStockCount = items.filter(item => (item.cantidad_stock || 0) === 0).length;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Header type='Administrador' />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-500" size={24} />
              <h3 className="text-lg font-semibold text-red-800">Error al cargar inventario</h3>
            </div>
            <p className="text-red-700 mt-2">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-theme-primary' : 'bg-gradient-to-br from-eco-scotch-mist via-white to-eco-pear/10'}`}>
      <Header type='Administrador' />
      
      <main className="max-w-7xl mx-auto px-6 py-8 pt-24">
        {/* Header */}
        <div className="bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald rounded-3xl shadow-strong p-8 mb-8 text-white relative overflow-hidden">
          {/* Patrón decorativo de fondo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute top-40 right-20 w-24 h-24 bg-white rounded-full"></div>
            <div className="absolute bottom-20 left-20 w-16 h-16 bg-white rounded-full"></div>
            <div className="absolute bottom-40 right-10 w-20 h-20 bg-white rounded-full"></div>
          </div>
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-lg flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                  <Package className="w-8 h-8 text-white" />
                </div>
                Inventario
              </h1>
              <p className="text-white/90 text-xl font-medium">
                Gestiona herramientas, semillas, fertilizantes y otros materiales del huerto
              </p>
            </div>
            {canAccess('create_inventory') && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-6 sm:mt-0 inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl hover:bg-white/30 transition-all duration-300 font-bold flex items-center gap-3 shadow-lg hover:shadow-xl border border-white/30 hover:scale-105"
              >
                <Plus size={20} />
                Agregar Ítem
              </button>
            )}
          </div>
        </div>

        {/* Botón para gestionar permisos globales */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-theme-primary">Gestión de Inventario</h2>
            <p className="text-theme-primary/70 text-lg font-medium">Gestiona tu inventario y asigna permisos a otros usuarios</p>
          </div>
          <button
            onClick={openInventoryCommentsManager}
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-2xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 flex items-center gap-3 font-bold shadow-lg hover:shadow-xl hover:scale-105"
          >
            <MessageSquare size={18} />
            Gestión de Comentarios
          </button>
        </div>

        {/* Estadísticas Mejoradas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Tarjeta Total de Ítems */}
          <div className="bg-gradient-to-br from-bg-theme-secondary to-bg-theme-tertiary dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg border border-blue-200 dark:border-blue-600 p-6 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Package className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-theme-primary/60 dark:text-gray-400 uppercase tracking-wide">Total de Ítems</p>
                  <p className="text-2xl font-bold text-theme-primary dark:text-white">{totalItems}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta Stock Total */}
          <div className="bg-gradient-to-br from-bg-theme-secondary to-bg-theme-tertiary dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg border border-green-200 dark:border-green-600 p-6 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-theme-primary/60 dark:text-gray-400 uppercase tracking-wide">Stock Total</p>
                  <p className="text-2xl font-bold text-theme-primary dark:text-white">{totalStock}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta Bajo Stock */}
          <div className="bg-gradient-to-br from-bg-theme-secondary to-bg-theme-tertiary dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg border border-yellow-200 dark:border-yellow-600 p-6 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-theme-primary/60 dark:text-gray-400 uppercase tracking-wide">Bajo Stock</p>
                  <p className="text-2xl font-bold text-theme-primary dark:text-white">{lowStockCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta Sin Stock */}
          <div className="bg-gradient-to-br from-bg-theme-secondary to-bg-theme-tertiary dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg border border-red-200 dark:border-red-600 p-6 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <TrendingDown className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-theme-primary/60 dark:text-gray-400 uppercase tracking-wide">Sin Stock</p>
                  <p className="text-2xl font-bold text-theme-primary dark:text-white">{outOfStockCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gestión de Permisos de Inventario */}
        {showPermissionsManager && selectedItemForPermissions && (
          <div className="mb-8">
            <InventoryPermissionsManager 
              inventoryId={selectedItemForPermissions.id}
              inventoryName={selectedItemForPermissions.nombre}
              currentUser={currentUser}
              onPermissionChange={handlePermissionChange}
              itemOwnerId={selectedItemForPermissions.usuario_creador}
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={closePermissionsManager}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cerrar Gestión de Permisos
              </button>
            </div>
          </div>
        )}

        {/* Controles de búsqueda y filtros */}
        {!loading && items.length > 0 && (
          <div className="mb-8 space-y-6">
            <SearchBar 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Buscar en inventario, herramientas, semillas..."
            />

            <FilterControls
              activeFilters={activeFilters}
              onToggleFilter={toggleFilter}
              onClearFilters={clearAllFilters}
              sortBy={sortBy}
              onSortChange={setSortBy}
              searchTerm={searchTerm}
              data={items}
            />
          </div>
        )}

        {/* Filtros activos */}
        {!loading && items.length > 0 && (
          <ActiveFilters 
            activeFilters={activeFilters}
            onRemoveFilter={toggleFilter}
          />
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        )}

        {/* Empty state - solo mostrar botón de agregar si tiene permisos */}
        {!loading && items.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 text-gray-300 dark:text-gray-500">
              <Package className="w-full h-full" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Inventario Vacío</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              No hay elementos en el inventario. {canAccess('create_inventory') ? 'Comienza agregando herramientas, semillas o fertilizante.' : 'Contacta al técnico para agregar elementos al inventario.'}
            </p>
            {canAccess('create_inventory') && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={20} />
                Agregar Primer Ítem
              </button>
            )}
          </div>
        )}

        {/* Grid de inventario */}
        {!loading && items.length > 0 && (
          <>
            <InventoryGrid 
              data={paginatedData}
              onClearFilters={clearAllFilters}
              onEdit={canAccess('edit_inventory') ? openEditModal : null}
              onDelete={canAccess('delete_inventory') ? handleDeleteInventory : null}
              onUpdateStock={canAccess('update_stock') ? openStockModal : null}
              onRecordUsage={canAccess('record_usage') ? openUsageModal : null}
              onShowHistory={openHistoryModal}
              canEdit={canAccess('edit_inventory')}
              canDelete={canAccess('delete_inventory')}
              canUpdateStock={canAccess('update_stock')}
              canRecordUsage={canAccess('record_usage')}
            />

            {/* Controles de Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Anterior
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal para agregar/editar inventario */}
      <AddInventoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
        onSubmit={selectedItem ? handleUpdateInventory : handleAddInventory}
        item={selectedItem}
      />

      {/* Modal para actualizar stock */}
      {isStockModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Actualizar Stock</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleUpdateStock(selectedItem.id, {
                cantidad_stock: parseInt(formData.get('stock'))
              });
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nuevo Stock
                </label>
                <input
                  type="number"
                  name="stock"
                  defaultValue={selectedItem.cantidad_stock}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Actualizar
                </button>
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para registrar uso */}
      {isUsageModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Registrar Uso de Stock</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const selectedGardenId = localStorage.getItem('selectedGardenId');
              
              handleRecordUsage(selectedItem.id, {
                cantidad_usada: parseInt(formData.get('cantidad')),
                notas: formData.get('notas'),
                huerto_id: selectedGardenId
              });
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad Usada
                </label>
                <input
                  type="number"
                  name="cantidad"
                  min="1"
                  max={selectedItem.cantidad_stock}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Stock disponible: {selectedItem.cantidad_stock} unidades
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  name="notas"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Describe para qué se usó el producto, en qué actividad, etc..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Esta información se incluirá en el comentario automático generado.
                </p>
              </div>
              
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 text-blue-500 mt-0.5">ℹ️</div>
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Comentario Automático</p>
                    <p>Al registrar el uso, se generará automáticamente un comentario en el huerto con:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Producto utilizado</li>
                      <li>Cantidad usada</li>
                      <li>Stock restante</li>
                      <li>Fecha y hora</li>
                      <li>Tus notas (si las agregas)</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Registrar Uso
                </button>
                <button
                  type="button"
                  onClick={() => setIsUsageModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de historial de uso */}
      {isHistoryModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <InventoryUsageHistory
                itemId={selectedItem.id}
                itemName={selectedItem.nombre}
                onClose={() => setIsHistoryModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}



      {/* Modal para gestión de comentarios de inventario */}
      {showInventoryCommentsManager && (
        <InventoryCommentsManagementModal
          items={items}
          loading={loading}
          onClose={closeInventoryCommentsManager}
          onManagePermissions={openPermissionsManager}
        />
      )}

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmDialog
        isVisible={isDeleteDialogOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Eliminar Item de Inventario"
        message={`¿Estás seguro de que quieres eliminar "${itemToDelete?.nombre}" del inventario?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="delete"
        itemName={itemToDelete?.nombre}
        isLoading={isDeleting}
      />

      {/* Notificación de permisos */}
      <PermissionNotification
        isVisible={notification.isVisible}
        onClose={hideNotification}
        type={notification.type}
        message={notification.message}
        duration={4000}
      />
    </div>
  );
}

export default Inventario;
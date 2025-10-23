import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { SearchBar } from '@/components/catalog/SearchBar';
import { FilterControls } from '@/components/catalog/FilterControls';
import { ActiveFilters } from '@/components/catalog/ActiveFilters';
import ProvidersGrid from '@/components/catalog/ProvidersGrid';
import AddProviderModal from '@/components/catalog/AddProviderModal';
import Pagination from '@/components/catalog/Pagination';
import { useProviders } from '@/hooks/useProviders';
import useContentFilter from '@/hooks/useContentFilter';
import { usePagination } from '@/hooks/usePagination';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Plus, AlertTriangle, Clock, CheckCircle, XCircle, X, ArrowUpDown, Calendar, MapPin, Info, Tag, Building2 } from 'lucide-react';
import Boton from '@/components/layout/Boton';
import '@/styles/modal.css';

function Proveedores() {
  const { canAccess } = useAuth();
  const { isDarkMode } = useTheme();
  const {
    providers,
    loading,
    error,
    createProvider,
    updateProvider,
    deleteProvider,
    getProviderById,
    loadProviders,
    searchProviders,
    setError
  } = useProviders();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const {
    searchTerm,
    setSearchTerm,
    activeFilters,
    toggleFilter,
    sortBy,
    setSortBy,
    filteredData,
    clearAllFilters
  } = useContentFilter(providers);

  // Paginación
  const {
    currentPage,
    totalPages,
    paginatedData,
    totalItems,
    itemsPerPage,
    goToPage,
    resetPagination
  } = usePagination(filteredData, 6);


  const handlePageChange = (page) => {
    goToPage(page);
  };

  // Cargar todos los proveedores al inicio
  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  // Resetear paginación cuando cambien los filtros o búsqueda
  useEffect(() => {
    resetPagination();
  }, [searchTerm, activeFilters]);

  const handleAddProvider = async (newProvider) => {
    // Cerrar modal inmediatamente para mejor UX
    setIsModalOpen(false);
    
    try {
      await createProvider(newProvider);
    } catch (error) {
      console.error('Error al crear proveedor:', error);
      // Si hay error, volver a abrir el modal para que el usuario pueda intentar de nuevo
      setIsModalOpen(true);
    }
  };

  const handleUpdateProvider = async (id, updatedProvider) => {
    // Cerrar modal inmediatamente para mejor UX
    setSelectedProvider(null);
    setIsModalOpen(false);
    
    try {
      await updateProvider(id, updatedProvider);
    } catch (error) {
      console.error('Error al actualizar proveedor:', error);
      // Si hay error, volver a abrir el modal para que el usuario pueda intentar de nuevo
      setSelectedProvider(updatedProvider);
      setIsModalOpen(true);
    }
  };

  const handleDeleteProvider = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este proveedor?')) {
      try {
        await deleteProvider(id);
      } catch (error) {
        console.error('Error al eliminar proveedor:', error);
      }
    }
  };

  const handleEditProvider = (provider) => {
    setSelectedProvider(provider);
    setIsModalOpen(true);
  };

  const handleViewDetails = async (provider) => {
    try {
      const fullProvider = await getProviderById(provider.id);
      setSelectedProvider(fullProvider);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error('Error al cargar detalles del proveedor:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProvider(null);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedProvider(null);
  };


  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-theme-primary' : 'bg-gradient-to-br from-eco-scotch-mist via-white to-eco-pear/10'}`}>
      <Header type="Administrador" />
      
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header de la página con diseño mejorado */}
          <div className="bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald rounded-3xl shadow-strong p-8 mb-8 text-white relative overflow-hidden">
            {/* Patrón decorativo de fondo */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
              <div className="absolute top-40 right-20 w-24 h-24 bg-white rounded-full"></div>
              <div className="absolute bottom-20 left-20 w-16 h-16 bg-white rounded-full"></div>
              <div className="absolute bottom-40 right-10 w-20 h-20 bg-white rounded-full"></div>
            </div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-lg flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  Proveedores
                </h1>
                <p className="text-white/90 text-xl font-medium">
                  Gestiona tus proveedores para huertos verticales
                </p>
              </div>
              
               <div className="flex gap-4">
                 {canAccess('create_providers') && (
                   <Boton
                     texto="Agregar Proveedor"
                     onClick={() => {
                       console.log('Abriendo modal...');
                       setIsModalOpen(true);
                     }}
                     variant="primary"
                     icono={<Plus className="w-5 h-5" />}
                   />
                 )}
               </div>
            </div>
          </div>

          {/* Estadísticas rápidas con nueva paleta */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className={`${isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600' : 'bg-gradient-to-br from-white to-eco-scotch-mist/30 border-eco-pear/20'} rounded-3xl shadow-strong border p-8 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105`}>
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald rounded-2xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div className="ml-6">
                  <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-300' : 'text-theme-primary/70'}`}>Total Proveedores</p>
                  <p className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-theme-primary'}`}>{providers.length}</p>
                </div>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600' : 'bg-gradient-to-br from-white to-eco-scotch-mist/30 border-eco-pear/20'} rounded-3xl shadow-strong border p-8 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105`}>
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gradient-to-r from-eco-emerald to-eco-pear rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div className="ml-6">
                  <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-300' : 'text-theme-primary/70'}`}>Con Email</p>
                  <p className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-theme-primary'}`}>
                    {providers.filter(p => p.email).length}
                  </p>
                </div>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600' : 'bg-gradient-to-br from-white to-eco-scotch-mist/30 border-eco-pear/20'} rounded-3xl shadow-strong border p-8 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105`}>
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gradient-to-r from-eco-pear to-yellow-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div className="ml-6">
                  <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-300' : 'text-theme-primary/70'}`}>Recientes</p>
                  <p className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-theme-primary'}`}>
                    {providers.filter(p => {
                      const date = new Date(p.created_at);
                      const now = new Date();
                      const diffDays = (now - date) / (1000 * 60 * 60 * 24);
                      return diffDays <= 30;
                    }).length}
                  </p>
                </div>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600' : 'bg-gradient-to-br from-white to-eco-scotch-mist/30 border-eco-pear/20'} rounded-3xl shadow-strong border p-8 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105`}>
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <div className="ml-6">
                  <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-300' : 'text-theme-primary/70'}`}>Sin Ubicación</p>
                  <p className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-theme-primary'}`}>
                    {providers.filter(p => !p.ubicacion).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Controles de búsqueda y filtros con nueva paleta */}
          <div className={`${isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600' : 'bg-gradient-to-br from-white to-eco-scotch-mist/30 border-eco-pear/20'} rounded-3xl shadow-strong border p-8 mb-8 backdrop-blur-sm`}>
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <div className="flex-1">
                <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  placeholder="Buscar proveedores por nombre, contacto, especialidad..."
                  isDarkMode={isDarkMode}
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('nombre')}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 border ${
                    sortBy === 'nombre'
                      ? 'bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald text-white border-eco-mountain-meadow shadow-md'
                      : isDarkMode 
                        ? 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600 hover:border-eco-mountain-meadow'
                        : 'bg-white text-theme-primary border-eco-pear hover:bg-eco-pear/10 hover:border-eco-mountain-meadow'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4" />
                    Nombre
                  </div>
                </button>
                
                <button
                  onClick={() => setSortBy('created_at')}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 border ${
                    sortBy === 'created_at'
                      ? 'bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald text-white border-eco-mountain-meadow shadow-md'
                      : isDarkMode 
                        ? 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600 hover:border-eco-mountain-meadow'
                        : 'bg-white text-theme-primary border-eco-pear hover:bg-eco-pear/10 hover:border-eco-mountain-meadow'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Fecha
                  </div>
                </button>
                
                <button
                  onClick={() => setSortBy('ubicacion')}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 border ${
                    sortBy === 'ubicacion'
                      ? 'bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald text-white border-eco-mountain-meadow shadow-md'
                      : isDarkMode 
                        ? 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600 hover:border-eco-mountain-meadow'
                        : 'bg-white text-theme-primary border-eco-pear hover:bg-eco-pear/10 hover:border-eco-mountain-meadow'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Ubicación
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Mensaje de error con nueva paleta */}
          {error && (
            <div className={`mb-8 ${isDarkMode ? 'bg-gradient-to-r from-red-900/30 to-red-800/20 border-2 border-red-700/50' : 'bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200'} rounded-3xl p-6 shadow-lg`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
                <p className={`${isDarkMode ? 'text-red-200' : 'text-red-800'} font-bold text-lg`}>{error}</p>
              </div>
            </div>
          )}

          {/* Grilla de proveedores */}
          <div className={`${isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600' : 'bg-gradient-to-br from-bg-theme-primary to-eco-scotch-mist/20 border-theme-primary'} rounded-3xl shadow-strong border p-8 backdrop-blur-sm`}>
            <ProvidersGrid
              providers={paginatedData}
              loading={loading}
              onEdit={canAccess('edit_providers') ? handleEditProvider : null}
              onDelete={canAccess('delete_providers') ? handleDeleteProvider : null}
              onViewDetails={handleViewDetails}
              searchTerm={searchTerm}
              canEdit={canAccess('edit_providers')}
              canDelete={canAccess('delete_providers')}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Paginación */}
          {totalItems > 0 && (
            <div className="mt-6">
              
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                isDarkMode={isDarkMode}
              />
            </div>
          )}
        </div>
      </main>

      {/* Modal para agregar/editar proveedor */}
      <AddProviderModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={selectedProvider ? 
          (data) => handleUpdateProvider(selectedProvider.id, data) : 
          handleAddProvider
        }
        provider={selectedProvider}
        loading={selectedProvider ? loading : false}
        isDarkMode={isDarkMode}
      />

      {/* Modal de detalles del proveedor */}
      {isDetailsModalOpen && selectedProvider && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col border overflow-hidden`}>
            {/* Header fijo */}
            <div className={`flex items-center justify-between p-8 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald rounded-t-3xl flex-shrink-0`}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-8 h-8 text-eco-mountain-meadow" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">
                    {selectedProvider.nombre_empresa}
                  </h2>
                  <p className="text-lg text-white/90 font-medium">
                    Información completa del proveedor
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseDetailsModal}
                className="p-3 hover:bg-white/20 rounded-2xl transition-all duration-300 hover:scale-105"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto modal-scroll-container">
              <div className="p-8 space-y-8 modal-content">
              {/* Información básica */}
              <div className="space-y-6">
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} flex items-center gap-3`}>
                  <div className="w-8 h-8 bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald rounded-xl flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  Información Básica
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-2xl p-6 border hover:shadow-md transition-shadow`}>
                    <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Empresa</label>
                    <p className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{selectedProvider.nombre_empresa}</p>
                  </div>
                  <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-2xl p-6 border hover:shadow-md transition-shadow`}>
                    <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Contacto Principal</label>
                    <p className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{selectedProvider.contacto_principal || 'No especificado'}</p>
                  </div>
                  <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-2xl p-6 border hover:shadow-md transition-shadow`}>
                    <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Teléfono</label>
                    <p className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{selectedProvider.telefono || 'No especificado'}</p>
                  </div>
                  <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-2xl p-6 border hover:shadow-md transition-shadow`}>
                    <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Email</label>
                    <p className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{selectedProvider.email || 'No especificado'}</p>
                  </div>
                </div>

                {/* Especialidades/Categorías */}
                <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-2xl p-6 border hover:shadow-md transition-shadow`}>
                  <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-3 flex items-center gap-2`}>
                    <Tag className="w-4 h-4 text-eco-mountain-meadow" />
                    Especialidades
                  </label>
                  {(() => {
                    // Determinar qué especialidades mostrar
                    let especialidadesToShow = [];
                    
                    if (selectedProvider.categorias && Array.isArray(selectedProvider.categorias) && selectedProvider.categorias.length > 0) {
                      // Usar categorías múltiples si están disponibles
                      especialidadesToShow = selectedProvider.categorias.filter(cat => cat && cat.trim() !== '');
                    } else if (selectedProvider.especialidades && Array.isArray(selectedProvider.especialidades) && selectedProvider.especialidades.length > 0) {
                      // Fallback a especialidades si categorías no están disponibles
                      especialidadesToShow = selectedProvider.especialidades.filter(esp => esp && esp.trim() !== '');
                    } else if (selectedProvider.especialidad && selectedProvider.especialidad.trim() !== '') {
                      // Fallback a especialidad singular
                      especialidadesToShow = [selectedProvider.especialidad];
                    }
                    
                    if (especialidadesToShow.length > 0) {
                      return (
                        <div className="flex flex-wrap gap-3">
                          {especialidadesToShow.map((especialidad, index) => (
                            <div
                              key={index}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald text-white shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                            >
                              <Tag className="w-3 h-3" />
                              {especialidad}
                            </div>
                          ))}
                        </div>
                      );
                    } else {
                      return (
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} italic`}>No se han especificado especialidades</p>
                      );
                    }
                  })()}
                </div>

                {/* Descripción - Siempre mostrar */}
                <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-2xl p-6 border hover:shadow-md transition-shadow`}>
                  <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-3 flex items-center gap-2`}>
                    <div className="w-4 h-4 bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">i</span>
                    </div>
                    Descripción
                  </label>
                  {selectedProvider.descripcion ? (
                    <p className={`text-lg ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} leading-relaxed`}>{selectedProvider.descripcion}</p>
                  ) : (
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} italic`}>No se ha proporcionado una descripción</p>
                  )}
                </div>
              </div>

              {/* Ubicación */}
              {selectedProvider.ubicacion && (
                <div className="space-y-6">
                  <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} flex items-center gap-3`}>
                    <div className="w-8 h-8 bg-gradient-to-r from-eco-emerald to-eco-pear rounded-xl flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    Ubicación
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-2xl p-6 border hover:shadow-md transition-shadow`}>
                      <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Ciudad</label>
                      <p className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{selectedProvider.ubicacion.ciudad || 'No especificada'}</p>
                    </div>
                    <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-2xl p-6 border hover:shadow-md transition-shadow`}>
                      <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Estado</label>
                      <p className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{selectedProvider.ubicacion.estado || 'No especificado'}</p>
                    </div>
                    <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-2xl p-6 border hover:shadow-md transition-shadow`}>
                      <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Calle</label>
                      <p className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{selectedProvider.ubicacion.calle || 'No especificada'}</p>
                    </div>
                    <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-2xl p-6 border hover:shadow-md transition-shadow`}>
                      <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>País</label>
                      <p className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{selectedProvider.ubicacion.pais || 'No especificado'}</p>
                    </div>
                  </div>
                  {selectedProvider.ubicacion.descripcion && (
                    <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-2xl p-6 border hover:shadow-md transition-shadow`}>
                      <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Descripción de la Ubicación</label>
                      <p className="text-lg text-gray-800 leading-relaxed">{selectedProvider.ubicacion.descripcion}</p>
                    </div>
                  )}
                </div>
              )}

              </div>
            </div>

            <div className={`flex items-center justify-end gap-4 p-8 border-t ${isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-gray-50'} rounded-b-3xl`}>
              <Boton
                texto="Cerrar"
                onClick={handleCloseDetailsModal}
                variant="secondary"
                isDarkMode={isDarkMode}
              />
              <Boton
                texto="Editar Proveedor"
                onClick={() => {
                  handleCloseDetailsModal();
                  handleEditProvider(selectedProvider);
                }}
                variant="primary"
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Proveedores;

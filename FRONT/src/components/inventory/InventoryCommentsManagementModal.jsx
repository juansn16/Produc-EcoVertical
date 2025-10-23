import React, { useState } from 'react';
import { Package, Users, X, Edit, TrendingUp, TrendingDown, Shield, Trash2, DollarSign, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const InventoryCommentsManagementModal = ({ items, loading, onClose, onManagePermissions }) => {
  const { user: currentUser } = useAuth();
  const [selectedItem, setSelectedItem] = useState(null);

  // Filtrar ítems según el rol del usuario
  const getFilteredItems = () => {
    if (!currentUser || !items) return [];
    
    const userRole = currentUser.rol || currentUser.role;
    
    // Administradores y técnicos ven todos los ítems
    if (['administrador', 'tecnico'].includes(userRole)) {
      return items;
    }
    
    // Residentes solo ven sus propios ítems
    if (userRole === 'residente') {
      return items.filter(item => item.usuario_creador === currentUser.id);
    }
    
    return items;
  };

  const filteredItems = getFilteredItems();

  const handleManagePermissions = (item) => {
    setSelectedItem(item);
    onManagePermissions(item);
    onClose(); // Cerrar este modal cuando se abre el de permisos
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden bg-theme-secondary dark:bg-theme-primary">
          <div className="p-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
              <span className="ml-2 text-theme-primary">Cargando inventario...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden bg-theme-secondary dark:bg-theme-primary">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-theme-tertiary dark:bg-theme-secondary flex items-center justify-center">
                <Users className="w-5 h-5 text-theme-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-theme-primary">Gestión de Comentarios</h3>
                <p className="text-sm text-theme-secondary">Gestiona permisos específicos para cada ítem de inventario</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-theme-secondary hover:text-theme-primary transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Grid de inventario */}
          <div className="max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-theme-secondary dark:bg-theme-tertiary rounded-lg shadow-sm border border-eco-pear/30 dark:border-eco-pear/50 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-eco-mountain-meadow/20 flex items-center justify-center">
                          {item.imagen_url ? (
                            <img 
                              alt={item.nombre} 
                              className="w-full h-full object-cover" 
                              src={item.imagen_url}
                            />
                          ) : (
                            <Package className="w-5 h-5 text-eco-mountain-meadow" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-theme-primary line-clamp-2">{item.nombre}</h3>
                          <p className="text-sm text-theme-secondary">{item.usuario_creador_nombre || 'Usuario'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Descripción si existe */}
                    {item.descripcion && (
                      <p className="text-sm text-theme-secondary mb-4 line-clamp-2">{item.descripcion}</p>
                    )}

                    {/* Información del stock */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-theme-secondary" />
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            item.cantidad_stock <= item.cantidad_minima 
                              ? 'bg-eco-pear/30 dark:bg-eco-pear/50 text-theme-primary' 
                              : 'bg-eco-mountain-meadow/20 dark:bg-eco-mountain-meadow/30 text-eco-mountain-meadow-dark dark:text-eco-mountain-meadow'
                          }`}>
                            {item.cantidad_stock <= item.cantidad_minima ? 'Stock Bajo' : 'Disponible'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-eco-mountain-meadow" />
                          <span className="text-sm font-semibold text-eco-mountain-meadow">
                            ${item.precio_unitario || '0.00'}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-theme-secondary">Stock actual:</span>
                        <span className="font-medium text-theme-primary">{item.cantidad_stock} unidades</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-theme-secondary">Stock mínimo:</span>
                        <span className="font-medium text-theme-primary">{item.cantidad_minima} unidades</span>
                      </div>
                    </div>

                    {/* Categoría y ubicación */}
                    <div className="flex gap-2 mb-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-theme-tertiary dark:bg-theme-secondary text-theme-primary">
                        {item.categoria_nombre || 'Sin categoría'}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-theme-secondary">
                        <MapPin className="w-3 h-3" />
                        <span>{item.huerto_nombre || 'Bodega'}</span>
                      </div>
                    </div>

                    {/* Botón de permisos */}
                    <div className="pt-4 border-t border-eco-pear/30 dark:border-eco-pear/50">
                      <button
                        onClick={() => handleManagePermissions(item)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        Permisos
                      </button>
                    </div>

                    {/* Fecha de creación */}
                    <div className="mt-3 text-xs text-theme-secondary">
                      Creado: {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto mb-4 text-theme-secondary" />
                <h3 className="text-lg font-medium text-theme-primary mb-2">No hay ítems de inventario</h3>
                <p className="text-theme-secondary">
                  {currentUser?.rol === 'residente' || currentUser?.role === 'residente' 
                    ? 'No tienes ítems de inventario para gestionar permisos.' 
                    : 'No se encontraron ítems para gestionar permisos.'}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-theme-tertiary dark:bg-theme-secondary text-theme-primary rounded-lg hover:bg-theme-secondary dark:hover:bg-theme-tertiary transition-colors border border-eco-pear/30 dark:border-eco-pear/50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryCommentsManagementModal;

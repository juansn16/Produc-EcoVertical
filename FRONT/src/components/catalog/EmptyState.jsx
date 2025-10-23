import React from 'react';
import { Search, Package, Store } from 'lucide-react';

const EmptyState = ({ 
  icon, 
  title, 
  description, 
  actionText, 
  onAction, 
  type = 'default' 
}) => {
  // Iconos por defecto según el tipo
  const getDefaultIcon = () => {
    switch (type) {
      case 'inventory':
        return <Package className="w-8 h-8 text-gray-400 dark:text-gray-500" />;
      case 'supplies':
        return <Store className="w-8 h-8 text-gray-400 dark:text-gray-500" />;
      default:
        return <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />;
    }
  };

  // Títulos por defecto según el tipo
  const getDefaultTitle = () => {
    switch (type) {
      case 'inventory':
        return 'Inventario Vacío';
      case 'supplies':
        return 'Sin Proveedores';
      default:
        return 'No se encontraron resultados';
    }
  };

  // Descripciones por defecto según el tipo
  const getDefaultDescription = () => {
    switch (type) {
      case 'inventory':
        return 'No hay elementos en el inventario. Comienza agregando herramientas, semillas o fertilizantes.';
      case 'supplies':
        return 'No hay proveedores registrados. Comienza agregando proveedores para el huerto.';
      default:
        return 'Intenta ajustar los filtros o términos de búsqueda para encontrar lo que buscas.';
    }
  };

  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
        {icon || getDefaultIcon()}
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {title || getDefaultTitle()}
      </h3>
      <p className="text-gray-500 dark:text-gray-300 mb-4">
        {description || getDefaultDescription()}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
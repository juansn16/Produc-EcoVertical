import React from 'react';
import ProviderCard from './ProviderCard';
import EmptyState from './EmptyState';
import { Store } from 'lucide-react';

const ProvidersGrid = ({ 
  providers, 
  loading, 
  onEdit, 
  onDelete, 
  onViewDetails,
  searchTerm = '',
  isDarkMode = false
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-6 animate-pulse`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-lg`}></div>
              <div className="flex-1">
                <div className={`h-4 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded mb-2`}></div>
                <div className={`h-3 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded w-2/3`}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className={`h-3 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded`}></div>
              <div className={`h-3 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded w-4/5`}></div>
              <div className={`h-3 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded w-3/5`}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <EmptyState
        icon={<Store className={`w-12 h-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />}
        title={searchTerm ? "No se encontraron proveedores" : "No hay proveedores registrados"}
        description={
          searchTerm 
            ? "Intenta con otros términos de búsqueda o agrega un nuevo proveedor."
            : "Comienza agregando tu primer proveedor para gestionar tus recursos."
        }
        actionText="Agregar Proveedor"
        showAction={!searchTerm}
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {providers.map((provider) => (
        <ProviderCard
          key={provider.id}
          provider={provider}
          onEdit={() => onEdit(provider)}
          onDelete={() => onDelete(provider.id)}
          onViewDetails={() => onViewDetails(provider)}
          isDarkMode={isDarkMode}
        />
      ))}
    </div>
  );
};

export default ProvidersGrid;

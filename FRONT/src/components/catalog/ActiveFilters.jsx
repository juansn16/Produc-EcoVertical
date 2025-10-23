import React from 'react';

export const ActiveFilters = ({ 
  activeFilters, 
  onRemoveFilter,
  isDarkMode = false
}) => {
  if (!activeFilters || activeFilters.length === 0) return null;

  // Función para obtener colores de categorías (similar a FilterButton)
  const getCategoryColor = (categoryId) => {
    const colors = {
      '1': { hex: '#16a34a', name: 'Semillas' },
      '2': { hex: '#84cc16', name: 'Fertilizantes' },
      '3': { hex: '#374151', name: 'Herramientas' },
      '4': { hex: '#059669', name: 'Sustratos' },
      '5': { hex: '#f59e0b', name: 'Otros' },
      '6': { hex: '#059669', name: 'Macetas' },
      '7': { hex: '#0891b2', name: 'Sistemas de Riego' },
      '8': { hex: '#7c3aed', name: 'Iluminación' },
      '9': { hex: '#dc2626', name: 'Sensores' },
      '10': { hex: '#f59e0b', name: 'Protección' }
    };
    
    return colors[categoryId] || { hex: '#6b7280', name: 'Categoría' };
  };

  // Mapeo de categorías para proveedores (fallback para IDs antiguos)
  const categoryLabels = {
    'dark': 'Herramientas',
    'green-dark': 'Macetas',
    'green-medium': 'Semillas',
    'green-light': 'Fertilizantes',
    'cream': 'Pesticidas'
  };

  return (
    <div className="mb-6 flex items-center space-x-2">
      <span className="text-sm text-gray-600">Filtros activos:</span>
      {activeFilters.map(filter => {
        // Intentar obtener color de la nueva función
        const categoryColor = getCategoryColor(filter);
        const label = categoryLabels[filter] || categoryColor.name || filter;
        
        // Determinar si es un color claro para el texto
        const isLightColor = categoryColor.hex === '#84cc16' || categoryColor.hex === '#f59e0b';
        
        return (
          <span
            key={filter}
            className="px-3 py-1 rounded-full text-xs font-medium flex items-center"
            style={{ 
              backgroundColor: categoryColor.hex,
              color: isDarkMode ? '#FFFFFF' : (isLightColor ? '#1F2937' : '#FFFFFF')
            }}
          >
            {label}
            <button
              onClick={() => onRemoveFilter(filter)}
              className="ml-2 hover:bg-white/20 rounded-full p-0.5 transition-colors"
              aria-label={`Remover filtro ${label}`}
            >
              ×
            </button>
          </span>
        );
      })}
    </div>
  );
};
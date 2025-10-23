import React from 'react';

export const FilterButton = ({ 
  category, 
  isActive, 
  count, 
  onClick,
  children,
  isDarkMode = false
}) => {
  // Colores por defecto para categorías
  const getCategoryColor = (categoryId) => {
    const colors = {
      '1': { hex: '#16a34a', name: 'Semillas' },      // Semillas
      '2': { hex: '#84cc16', name: 'Fertilizantes' },  // Fertilizantes
      '3': { hex: '#374151', name: 'Herramientas' },   // Herramientas
      '4': { hex: '#059669', name: 'Sustratos' },      // Sustratos
      '5': { hex: '#f59e0b', name: 'Otros' },          // Otros
      '6': { hex: '#059669', name: 'Macetas' },        // Macetas
      '7': { hex: '#0891b2', name: 'Sistemas de Riego' }, // Sistemas de Riego
      '8': { hex: '#7c3aed', name: 'Iluminación' },    // Iluminación
      '9': { hex: '#dc2626', name: 'Sensores' },       // Sensores
      '10': { hex: '#f59e0b', name: 'Protección' }     // Protección
    };
    
    return colors[categoryId] || { hex: '#6b7280', name: 'Categoría' };
  };

  const categoryColor = getCategoryColor(category);
  const isLightColor = categoryColor.hex === '#84cc16' || categoryColor.hex === '#f59e0b';

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 border-2 whitespace-nowrap min-w-fit ${
        isActive 
          ? 'text-white shadow-lg'
          : isDarkMode 
            ? 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-200' 
            : 'bg-white hover:bg-gray-50 border-gray-200'
      }`}
      style={{
        backgroundColor: isActive ? categoryColor.hex : undefined,
        borderColor: isActive ? categoryColor.hex : undefined,
        color: isActive ? (isDarkMode ? '#FFFFFF' : (isLightColor ? '#1F2937' : '#FFFFFF')) : undefined
      }}
    >
      <span className="flex items-center gap-2">
        <span>{children || categoryColor.name}</span>
        <span className="text-xs opacity-75">({count})</span>
      </span>
    </button>
  );
};
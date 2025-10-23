import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  itemsPerPage,
  className = "",
  isDarkMode = false
}) => {
  // Calcular el rango de páginas a mostrar
  const getVisiblePages = () => {
    if (totalPages <= 7) {
      // Si hay 7 páginas o menos, mostrar todas
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const delta = 2; // Número de páginas a mostrar a cada lado de la página actual
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);


  if (totalItems <= 0) {
    return null;
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-6 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-2xl border shadow-sm ${className}`}>
      {/* Información de elementos */}
      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        Mostrando <span className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{startItem}</span> a{' '}
        <span className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{endItem}</span> de{' '}
        <span className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{totalItems}</span> proveedores
      </div>

      {/* Controles de paginación */}
      <div className="flex items-center gap-2">
        {/* Botón anterior */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            currentPage === 1
              ? 'text-gray-400 cursor-not-allowed'
              : isDarkMode 
                ? 'text-gray-300 hover:bg-gray-700 hover:text-gray-100' 
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </button>

        {/* Números de página */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <div className={`px-2 py-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  <MoreHorizontal className="w-4 h-4" />
                </div>
              ) : (
                <button
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    page === currentPage
                      ? 'bg-eco-mountain-meadow text-white shadow-md'
                      : isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-gray-100' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Botón siguiente */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            currentPage === totalPages
              ? 'text-gray-400 cursor-not-allowed'
              : isDarkMode 
                ? 'text-gray-300 hover:bg-gray-700 hover:text-gray-100' 
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          Siguiente
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

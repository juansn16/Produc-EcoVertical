import { useState, useMemo, useEffect, useCallback } from 'react';

export const usePagination = (data, itemsPerPage = 12) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Validar que data sea un array válido
  const validData = Array.isArray(data) ? data : [];

  const paginatedData = useMemo(() => {
    if (validData.length === 0) return [];
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const result = validData.slice(startIndex, endIndex);
    
    
    return result;
  }, [validData, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(validData.length / itemsPerPage));
  

  const goToPage = (page) => {
    // Validar que la página esté en el rango válido
    const validPage = Math.max(1, Math.min(totalPages, Math.floor(page) || 1));
    
    if (validPage !== currentPage) {
      setCurrentPage(validPage);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // Ajustar automáticamente la página actual si está fuera de rango
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      console.log('🔄 Ajustando página actual de', currentPage, 'a', totalPages);
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return {
    currentPage,
    totalPages,
    paginatedData,
    totalItems: validData.length,
    itemsPerPage,
    goToPage,
    goToNextPage,
    goToPrevPage: goToPreviousPage, // Alias para compatibilidad
    goToPreviousPage,
    resetPagination,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1
  };
};

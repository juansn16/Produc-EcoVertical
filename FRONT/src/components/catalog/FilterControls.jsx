import React, { useState, useEffect } from 'react';
import { Filter, ArrowUpDown } from 'lucide-react';
import { FilterButton } from './FilterButton';
import { categoryAPI } from '@/services/categoryService';

export const FilterControls = ({
  activeFilters,
  onToggleFilter,
  onClearFilters,
  sortBy,
  onSortChange,
  searchTerm,
  data = [],
  isDarkMode = false
}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Detectar si estamos trabajando con datos de proveedores o inventario
  const isProveedores = data.length > 0 && data[0].hasOwnProperty('nombreProducto');
  
  // Cargar categorías reales desde la API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryAPI.getAll();
        const categoriesResponse = response.success ? response : { data: [] };
        setCategories(categoriesResponse.data || []);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
        // Fallback a categorías básicas si la API falla
        setCategories([
          { id: '1', nombre: 'Semillas' },
          { id: '2', nombre: 'Fertilizantes' },
          { id: '3', nombre: 'Herramientas' },
          { id: '4', nombre: 'Sustratos' },
          { id: '5', nombre: 'Otros' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const getCategoryCount = (categoryId) => {
    return data.filter(item => {
      const category = item.category || item.categoria || item.categoria_id;
      return category === categoryId;
    }).length;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
        <span className="ml-2 text-sm text-gray-600">Cargando categorías...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className={`flex items-center space-x-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <Filter className="w-4 h-4" />
          <span>Filtrar por categoría:</span>
        </div>
        
        {categories.map((category) => {
          const isActive = activeFilters.includes(category.id);
          const count = getCategoryCount(category.id);
          
          return (
            <FilterButton
              key={category.id}
              category={category.id}
              isActive={isActive}
              count={count}
              onClick={() => onToggleFilter(category.id)}
              isDarkMode={isDarkMode}
            >
              {category.nombre}
            </FilterButton>
          );
        })}
      </div>

      <div className="flex items-center space-x-3">
        {(activeFilters.length > 0 || searchTerm) && (
          <button
            onClick={onClearFilters}
            className={`px-4 py-2 text-sm transition-colors ${
              isDarkMode 
                ? 'text-gray-300 hover:text-gray-100' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Limpiar todo
          </button>
        )}
        
        <div className="flex items-center space-x-2">
          <ArrowUpDown className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className={`text-sm border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-100' 
                : 'bg-white border-gray-200 text-gray-900'
            }`}
          >
            <option value="date">Ordenar por Fecha</option>
            <option value="title">Ordenar por Nombre</option>
          </select>
        </div>
      </div>
    </div>
  );
};
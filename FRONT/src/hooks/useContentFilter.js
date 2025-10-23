import { useState, useMemo } from 'react';

const useContentFilter = (data) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [sortBy, setSortBy] = useState('nombre');

  const filteredData = useMemo(() => {
    // Verificaciones más robustas para los datos
    if (!data) return [];
    if (!Array.isArray(data)) {
      console.warn('useContentFilter: data no es un array:', data);
      return [];
    }
    if (data.length === 0) return [];
    
    let filtered = data.filter(item => {
      // Verificar que el ítem existe y es un objeto válido
      if (!item || typeof item !== 'object') {
        console.warn('useContentFilter: ítem inválido encontrado:', item);
        return false;
      }
      
      // Búsqueda por múltiples campos específicos para proveedores
      const searchFields = [
        item.nombre_empresa,
        item.contacto_principal,
        item.descripcion,
        item.especialidad,
        item.telefono,
        item.email,
        item.ubicacion?.ciudad,
        item.ubicacion?.estado,
        item.ubicacion?.pais,
        // También buscar en categorías múltiples si existen
        ...(Array.isArray(item.categorias) ? item.categorias : []),
        ...(Array.isArray(item.especialidades) ? item.especialidades : [])
      ].filter(field => field !== undefined && field !== null && field !== ''); // Remover valores undefined/null/vacíos
      
      const matchesSearch = searchTerm === '' || 
        searchFields.some(field => 
          field.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Filtros por especialidad/categoría para proveedores
      const matchesFilter = 
        activeFilters.length === 0 || 
        activeFilters.some(filter => {
          // Verificar si el ítem coincide con algún filtro activo
          return item.especialidad === filter ||
                 item.categoria === filter ||
                 item.categoria_id === filter ||
                 item.categoria_nombre === filter ||
                 (Array.isArray(item.categorias) && item.categorias.includes(filter)) ||
                 (Array.isArray(item.especialidades) && item.especialidades.includes(filter));
        });

      return matchesSearch && matchesFilter;
    });

    // Ordenamiento específico para proveedores
    const sorted = filtered.sort((a, b) => {
      if (sortBy === 'nombre') {
        const nombreA = (a?.nombre_empresa || '').toString();
        const nombreB = (b?.nombre_empresa || '').toString();
        return nombreA.localeCompare(nombreB);
      } else if (sortBy === 'created_at') {
        const fechaA = new Date(a?.created_at || 0);
        const fechaB = new Date(b?.created_at || 0);
        return fechaB - fechaA;
      } else if (sortBy === 'ubicacion') {
        const ubicacionA = (a?.ubicacion?.ciudad || a?.ubicacion?.estado || '').toString();
        const ubicacionB = (b?.ubicacion?.ciudad || b?.ubicacion?.estado || '').toString();
        return ubicacionA.localeCompare(ubicacionB);
      }
      return 0;
    });
    
    return sorted;
  }, [searchTerm, activeFilters, sortBy, data]);

  const toggleFilter = (category) => {
    setActiveFilters(prev => 
      prev.includes(category) 
        ? prev.filter(f => f !== category)
        : [...prev, category]
    );
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setSearchTerm('');
  };

  return {
    searchTerm,
    setSearchTerm,
    activeFilters,
    toggleFilter,
    sortBy,
    setSortBy,
    filteredData,
    clearAllFilters
  };
};

export default useContentFilter;
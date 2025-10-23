import { useState, useEffect, useCallback } from 'react';

export const useGardenContext = () => {
  const [selectedGardenId, setSelectedGardenId] = useState(null);
  const [selectedGardenName, setSelectedGardenName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener el huerto seleccionado del localStorage al inicializar
  useEffect(() => {
    const gardenId = localStorage.getItem('selectedGardenId');
    const gardenName = localStorage.getItem('selectedGardenName');
    
    if (gardenId) {
      setSelectedGardenId(gardenId);
      setSelectedGardenName(gardenName || `Huerto ${gardenId}`);
    }
    
    setIsLoading(false);
  }, []);

  // Función para cambiar el huerto seleccionado
  const changeGarden = useCallback((gardenId, gardenName = '') => {
    if (gardenId) {
      localStorage.setItem('selectedGardenId', gardenId);
      localStorage.setItem('selectedGardenName', gardenName);
      setSelectedGardenId(gardenId);
      setSelectedGardenName(gardenName || `Huerto ${gardenId}`);
    } else {
      localStorage.removeItem('selectedGardenId');
      localStorage.removeItem('selectedGardenName');
      setSelectedGardenId(null);
      setSelectedGardenName('');
    }
  }, []);

  // Función para verificar si hay un huerto seleccionado
  const hasSelectedGarden = useCallback(() => {
    return !!selectedGardenId;
  }, [selectedGardenId]);

  // Función para obtener el contexto del huerto para las consultas de API
  const getGardenContext = useCallback(() => {
    return {
      huerto_id: selectedGardenId,
      huerto_nombre: selectedGardenName
    };
  }, [selectedGardenId, selectedGardenName]);

  return {
    selectedGardenId,
    selectedGardenName,
    isLoading,
    error,
    changeGarden,
    hasSelectedGarden,
    getGardenContext
  };
};



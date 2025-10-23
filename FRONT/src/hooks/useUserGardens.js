import { useState, useEffect, useCallback } from 'react';
import { gardensAPI, handleAPIError } from '@/services/apiService';

export const useUserGardens = () => {
  const [gardens, setGardens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar huertos del usuario
  const loadUserGardens = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await gardensAPI.getUserGardens();
      setGardens(response.data.data || []);
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      console.error('Error al cargar huertos del usuario:', errorMessage);
      // Si hay error, establecer un array vacío para evitar problemas
      setGardens([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    loadUserGardens();
  }, [loadUserGardens]);

  return {
    gardens,
    loading,
    error,
    loadUserGardens,
    setError
  };
};

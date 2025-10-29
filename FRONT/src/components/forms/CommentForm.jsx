import React, { useState } from 'react';
import { useForm } from '@/hooks/useForm';
import { commentsAPI, handleAPIError } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';

const CommentForm = ({ 
  resourceType, 
  resourceId, 
  onCommentAdded, 
  placeholder = "Escribe tu comentario..." 
}) => {
  const { user } = useAuth();
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const { values, errors, isSubmitting, handleChange, handleSubmit, resetForm } = useForm({
    content: '',
    rating: 5
  });

  const onSubmit = async (formData) => {
    try {
      setSubmitError('');
      setSubmitSuccess('');

      // Nota: userId se obtiene del token JWT en el backend
      const commentData = {
        contenido: formData.content,
        tipo_comentario: 'general'
      };

      // Si es un comentario de huerto, necesitamos el huertoId
      let response;
      if (resourceType === 'garden') {
        response = await commentsAPI.createComment(resourceId, commentData);
      } else {
        // Para otros tipos de comentarios, revisar si existe una ruta específica
        console.warn('resourceType no soportado:', resourceType);
        throw new Error('Tipo de recurso no soportado');
      }
      
      setSubmitSuccess('Comentario agregado exitosamente');
      resetForm();
      
      // Notificar al componente padre que se agregó un comentario
      if (onCommentAdded) {
        onCommentAdded(response.data);
      }

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSubmitSuccess(''), 3000);
    } catch (error) {
      const errorMessage = handleAPIError(error);
      setSubmitError(errorMessage);
    }
  };

  return (
    <div className="bg-theme-secondary dark:bg-theme-primary rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-theme-primary mb-4">
        Agregar Comentario
      </h3>

      {submitError && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded">
          {submitError}
        </div>
      )}

      {submitSuccess && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 rounded">
          {submitSuccess}
        </div>
      )}

      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(onSubmit);
      }}>
        <div className="mb-4">
          <label htmlFor="rating" className="block text-sm font-medium text-theme-secondary mb-2">
            Calificación
          </label>
          <select
            id="rating"
            name="rating"
            value={values.rating}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-eco-pear/30 dark:border-eco-pear/50 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent bg-theme-secondary dark:bg-theme-tertiary text-theme-primary"
          >
            <option value={5}>⭐⭐⭐⭐⭐ Excelente</option>
            <option value={4}>⭐⭐⭐⭐ Muy bueno</option>
            <option value={3}>⭐⭐⭐ Bueno</option>
            <option value={2}>⭐⭐ Regular</option>
            <option value={1}>⭐ Malo</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-theme-secondary mb-2">
            Comentario
          </label>
          <textarea
            id="content"
            name="content"
            value={values.content}
            onChange={handleChange}
            placeholder={placeholder}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent bg-theme-secondary dark:bg-theme-tertiary text-theme-primary ${
              errors.content ? 'border-red-500 dark:border-red-400' : 'border-eco-pear/30 dark:border-eco-pear/50'
            }`}
            required
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content}</p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 text-theme-secondary bg-theme-tertiary dark:bg-theme-secondary rounded-md hover:bg-theme-secondary dark:hover:bg-theme-tertiary transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !values.content.trim()}
            className="px-4 py-2 bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald text-white rounded-md hover:from-eco-mountain-meadow-dark hover:to-eco-emerald-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Comentario'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentForm; 
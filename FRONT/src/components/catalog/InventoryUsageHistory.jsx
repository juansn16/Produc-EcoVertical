import React, { useState, useEffect, useRef } from 'react';
import { Package, Calendar, User, Tag, TrendingDown, Shield, AlertTriangle, Edit, Trash2, X } from 'lucide-react';
import { commentsAPI } from '@/services/apiService';
import { useInventoryCommentPermissions } from '@/hooks/useInventoryCommentPermissions';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

const InventoryUsageHistory = ({ itemId, itemName, onClose }) => {
  const { user: currentUser } = useAuth();
  const { isDarkMode } = useTheme();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const firstCommentRef = useRef(null);
  
  // Hook para permisos de comentarios de inventario
  const { permissions, loading: permissionsLoading, canEditComment, canDeleteComment } = useInventoryCommentPermissions(currentUser);

  // Función helper para convertir markdown básico a HTML
  const renderMarkdownToHTML = (text) => {
    if (!text) return '';
    // Convertir **texto** a <strong>texto</strong>
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  // Manejo de teclado para cerrar modal con ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Focus management: enfocar el botón de cerrar cuando se carga el modal
  useEffect(() => {
    if (closeButtonRef.current && !loading && comments.length > 0) {
      closeButtonRef.current.focus();
    }
  }, [loading, comments.length]);

  // Cargar comentarios (todos pueden ver)
  useEffect(() => {
    console.log('🔄 useEffect ejecutado para itemId:', itemId);
    if (!itemId) return;

    const loadComments = async () => {
      try {
        setLoading(true);
        console.log('📡 Iniciando carga de comentarios para itemId:', itemId);
        
        // Buscar comentarios relacionados con este ítem
        const response = await commentsAPI.getComments('inventory', itemId);
        const allComments = response.data.data || [];
        
        console.log('🔍 Comentarios recibidos del backend:', allComments);
        console.log('🔍 Número de comentarios:', allComments.length);
        
        // El backend ya filtra por tipo 'uso', así que usamos directamente los datos
        setComments(allComments);
      } catch (error) {
        console.error('❌ Error al cargar comentarios:', error);
        setError('Error al cargar el historial');
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [itemId]);

  // Funciones para manejar comentarios
  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setEditContent(comment.contenido);
  };

  const handleSaveEdit = async () => {
    if (!editingComment || !editContent.trim()) return;

    try {
      // Aquí implementarías la llamada a la API para actualizar el comentario
      console.log('Guardando comentario editado:', editingComment.id, editContent);
      // await commentsAPI.updateComment(editingComment.id, { contenido: editContent });
      
      setEditingComment(null);
      setEditContent('');
      // Recargar comentarios
      const response = await commentsAPI.getComments('inventory', itemId);
      setComments(response.data.data || []);
    } catch (error) {
      console.error('Error al guardar comentario:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) return;

    try {
      // Aquí implementarías la llamada a la API para eliminar el comentario
      console.log('Eliminando comentario:', commentId);
      // await commentsAPI.deleteComment(commentId);
      
      // Recargar comentarios
      const response = await commentsAPI.getComments('inventory', itemId);
      setComments(response.data.data || []);
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
    }
  };

  if (loading) {
    return (
      <div 
        className="flex justify-center items-center py-8"
        role="status"
        aria-live="polite"
        aria-label="Cargando historial de uso"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" aria-hidden="true"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-300">Cargando historial...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="text-center py-8"
        role="alert"
        aria-live="assertive"
      >
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          isDarkMode ? 'bg-red-900/30' : 'bg-red-100'
        }`}>
          <Package className={`w-8 h-8 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} aria-hidden="true" />
        </div>
        <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Error al cargar historial
        </h3>
        <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{error}</p>
        <button
          onClick={onClose}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isDarkMode
              ? 'bg-gray-600 text-white hover:bg-gray-500'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
          aria-label="Cerrar modal de error"
        >
          Cerrar
        </button>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div 
        className="text-center py-8"
        role="region"
        aria-label="Sin historial de uso"
      >
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <TrendingDown className={`w-8 h-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} aria-hidden="true" />
        </div>
        <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Sin historial de uso
        </h3>
        <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
          No se ha registrado uso de este producto aún.
        </p>
        <button
          onClick={onClose}
          ref={closeButtonRef}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isDarkMode
              ? 'bg-gray-600 text-white hover:bg-gray-500'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
          aria-label="Cerrar modal"
        >
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <div 
      className="space-y-4"
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-title"
      aria-describedby="history-description"
    >
      <div className={`flex items-center justify-between border-b pb-4 ${
        isDarkMode ? 'border-gray-600' : 'border-gray-200'
      }`}>
        <div>
          <h3 
            id="history-title"
            className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Historial de Uso - {itemName}
          </h3>
          <p 
            id="history-description"
            className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
          >
            Comentarios automáticos generados al usar el inventario
          </p>
        </div>
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className={`p-2 rounded-lg transition-colors ${
            isDarkMode
              ? 'hover:bg-gray-600 text-gray-300 hover:text-white'
              : 'hover:bg-gray-100 text-gray-600'
          }`}
          aria-label="Cerrar historial de uso"
          title="Cerrar (ESC)"
        >
          <X size={20} aria-hidden="true" />
          <span className="sr-only">Cerrar modal</span>
        </button>
      </div>

      <div 
        className="space-y-4 max-h-96 overflow-y-auto"
        role="list"
        aria-label={`Lista de ${comments.length} usos registrados`}
      >
        {comments.map((comment, index) => (
          <article 
            key={`${comment.id}-${index}-${comment.fecha_creacion}`}
            ref={index === 0 ? firstCommentRef : null}
            className={`rounded-lg p-4 border ${
              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}
            role="listitem"
            aria-labelledby={`comment-title-${comment.id}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
                  }`}
                  aria-hidden="true"
                >
                  <Package className={`w-4 h-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <div>
                  <h4 
                    id={`comment-title-${comment.id}`}
                    className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    Uso Automático de Inventario
                  </h4>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {comment.usuario_nombre ? (
                      <>
                        Por: <span className="font-semibold">{comment.usuario_nombre}</span>
                      </>
                    ) : (
                      'Generado automáticamente'
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <time 
                  className={`flex items-center gap-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                  dateTime={new Date(comment.fecha_creacion).toISOString()}
                  aria-label={`Fecha y hora: ${new Date(comment.fecha_creacion).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}`}
                >
                  <Calendar className="w-3 h-3" aria-hidden="true" />
                  <span>
                    {new Date(comment.fecha_creacion).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </time>
                
                {/* Botones de editar/eliminar basados en permisos */}
                {(canEditComment(comment) || canDeleteComment(comment)) && (
                  <div 
                    className="flex items-center gap-1"
                    role="group"
                    aria-label="Acciones del comentario"
                  >
                    {canEditComment(comment) && (
                      <button
                        onClick={() => handleEditComment(comment)}
                        className={`p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          isDarkMode
                            ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/30 focus:ring-offset-gray-700'
                            : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 focus:ring-offset-white'
                        }`}
                        aria-label={`Editar comentario del ${new Date(comment.fecha_creacion).toLocaleDateString('es-ES')}`}
                        title="Editar comentario"
                      >
                        <Edit size={14} aria-hidden="true" />
                      </button>
                    )}
                    {canDeleteComment(comment) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className={`p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                          isDarkMode
                            ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30 focus:ring-offset-gray-700'
                            : 'text-gray-400 hover:text-red-600 hover:bg-red-50 focus:ring-offset-white'
                        }`}
                        aria-label={`Eliminar comentario del ${new Date(comment.fecha_creacion).toLocaleDateString('es-ES')}`}
                        title="Eliminar comentario"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="prose prose-sm max-w-none">
              {editingComment && editingComment.id === comment.id ? (
                <form 
                  className="space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveEdit();
                  }}
                  aria-label="Formulario de edición de comentario"
                >
                  <label htmlFor={`edit-textarea-${comment.id}`} className="sr-only">
                    Editar descripción del uso de inventario
                  </label>
                  <textarea
                    id={`edit-textarea-${comment.id}`}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:ring-offset-gray-700'
                        : 'border-gray-300 focus:ring-offset-white'
                    }`}
                    rows={4}
                    placeholder="Editar comentario..."
                    aria-label="Descripción del uso de inventario"
                    aria-required="true"
                  />
                  <div className="flex gap-2" role="group" aria-label="Acciones del formulario">
                    <button
                      type="submit"
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      aria-label="Guardar cambios"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingComment(null);
                        setEditContent('');
                      }}
                      className={`px-3 py-1 text-white text-sm rounded transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${
                        isDarkMode
                          ? 'bg-gray-600 hover:bg-gray-500 focus:ring-offset-gray-700'
                          : 'bg-gray-500 hover:bg-gray-600 focus:ring-offset-white'
                      }`}
                      aria-label="Cancelar edición"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div 
                  className={`whitespace-pre-line ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  role="region"
                  aria-label="Descripción del uso de inventario"
                >
                  {comment.contenido ? (
                    <div
                      dangerouslySetInnerHTML={{ 
                        __html: renderMarkdownToHTML(comment.contenido)
                      }}
                    />
                  ) : (
                    <p className="italic text-sm opacity-75">
                      Sin descripción disponible
                    </p>
                  )}
                </div>
              )}
            </div>

            {comment.etiquetas && comment.etiquetas.length > 0 && (
              <div 
                className={`flex items-center gap-2 mt-3 pt-3 border-t ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-200'
                }`}
                role="group"
                aria-label="Etiquetas del comentario"
              >
                <Tag 
                  className={`w-3 h-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                  aria-hidden="true"
                />
                <div className="flex flex-wrap gap-1" role="list" aria-label="Lista de etiquetas">
                  {comment.etiquetas.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className={`px-2 py-1 text-xs rounded-full ${
                        isDarkMode
                          ? 'bg-blue-900/30 text-blue-300'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                      role="listitem"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>
        ))}
      </div>

      <footer className={`border-t pt-4 ${
        isDarkMode ? 'border-gray-600' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <p 
            className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
            aria-live="polite"
            aria-atomic="true"
          >
            Total de usos registrados: <strong>{comments.length}</strong>
          </p>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${
              isDarkMode
                ? 'bg-gray-600 text-white hover:bg-gray-500 focus:ring-offset-gray-800'
                : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-offset-white'
            }`}
            aria-label="Cerrar historial de uso"
          >
            Cerrar
          </button>
        </div>
      </footer>
    </div>
  );
};

export default InventoryUsageHistory;



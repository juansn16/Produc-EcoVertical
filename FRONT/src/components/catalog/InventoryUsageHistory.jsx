import React, { useState, useEffect } from 'react';
import { Package, Calendar, User, Tag, TrendingDown, Shield, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { commentsAPI } from '@/services/apiService';
import { useInventoryCommentPermissions } from '@/hooks/useInventoryCommentPermissions';
import { useAuth } from '@/contexts/AuthContext';

const InventoryUsageHistory = ({ itemId, itemName, onClose }) => {
  const { user: currentUser } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  
  // Hook para permisos de comentarios de inventario
  const { permissions, loading: permissionsLoading, canEditComment, canDeleteComment } = useInventoryCommentPermissions(currentUser);

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
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando historial...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar historial</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Cerrar
        </button>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingDown className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Sin historial de uso</h3>
        <p className="text-gray-500 mb-4">
          No se ha registrado uso de este producto aún.
        </p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Historial de Uso - {itemName}
          </h3>
          <p className="text-sm text-gray-600">
            Comentarios automáticos generados al usar el inventario
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span className="sr-only">Cerrar</span>
          ×
        </button>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {comments.map((comment, index) => (
          <div key={`${comment.id}-${index}-${comment.fecha_creacion}`} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Package className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Uso Automático de Inventario
                  </p>
                  <p className="text-xs text-gray-500">
                    {comment.usuario_nombre ? `Por: ${comment.usuario_nombre}` : 'Generado automáticamente'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {new Date(comment.fecha_creacion).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                
                {/* Botones de editar/eliminar basados en permisos */}
                {(canEditComment(comment) || canDeleteComment(comment)) && (
                  <div className="flex items-center gap-1">
                    {canEditComment(comment) && (
                      <button
                        onClick={() => handleEditComment(comment)}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Editar comentario"
                      >
                        <Edit size={14} />
                      </button>
                    )}
                    {canDeleteComment(comment) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar comentario"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="prose prose-sm max-w-none">
              {editingComment && editingComment.id === comment.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                    placeholder="Editar comentario..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => {
                        setEditingComment(null);
                        setEditContent('');
                      }}
                      className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  className="text-gray-700 whitespace-pre-line"
                  dangerouslySetInnerHTML={{ 
                    __html: comment.contenido.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                  }}
                />
              )}
            </div>

            {comment.etiquetas && comment.etiquetas.length > 0 && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                <Tag className="w-3 h-3 text-gray-400" />
                <div className="flex flex-wrap gap-1">
                  {comment.etiquetas.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Total de usos registrados: {comments.length}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryUsageHistory;



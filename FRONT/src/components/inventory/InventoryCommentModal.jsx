import React, { useState } from 'react';
import { X, MessageSquare, Package } from 'lucide-react';

const InventoryCommentModal = ({ isOpen, onClose, item, onSubmit }) => {
  const [content, setContent] = useState('');
  const [commentType, setCommentType] = useState('general');
  const [loading, setLoading] = useState(false);

  const commentTypes = [
    { value: 'general', label: 'General', description: 'Comentario general sobre el item' },
    { value: 'mantenimiento', label: 'Mantenimiento', description: 'Comentario sobre mantenimiento' },
    { value: 'reposicion', label: 'Reposición', description: 'Comentario sobre reposición de stock' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      await onSubmit({
        itemId: item.id,
        content: content.trim(),
        commentType: commentType
      });
      
      setContent('');
      setCommentType('general');
      onClose();
    } catch (error) {
      console.error('Error al crear comentario:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Comentario de Inventario</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400">Agregar comentario sobre {item?.nombre}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo de comentario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de comentario
              </label>
              <select
                value={commentType}
                onChange={(e) => setCommentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {commentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {commentTypes.find(t => t.value === commentType)?.description}
              </p>
            </div>

            {/* Contenido del comentario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comentario
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Escribe tu comentario sobre este item de inventario..."
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Este comentario será visible para otros usuarios y podrás gestionar sus permisos.
              </p>
            </div>

            {/* Información del item */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Item: {item?.nombre}</span>
              </div>
              {item?.descripcion && (
                <p className="text-xs text-gray-600 dark:text-gray-400">{item.descripcion}</p>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!content.trim() || loading}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creando...' : 'Crear Comentario'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InventoryCommentModal;

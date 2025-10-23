import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

const ConfirmDialog = ({ 
  isVisible, 
  onClose, 
  onConfirm, 
  title = "Confirmar Acción", 
  message = "¿Estás seguro de que quieres realizar esta acción?", 
  confirmText = "Confirmar", 
  cancelText = "Cancelar", 
  type = "warning",
  isLoading = false,
  itemName = ""
}) => {
  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'delete':
        return {
          icon: <Trash2 className="w-8 h-8 text-red-500" />,
          iconBg: 'bg-red-100',
          titleColor: 'text-red-800',
          confirmBg: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
          confirmText: 'text-white',
          borderColor: 'border-red-200',
          bgGradient: 'bg-gradient-to-br from-red-50 to-red-100'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-orange-500" />,
          iconBg: 'bg-orange-100',
          titleColor: 'text-orange-800',
          confirmBg: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
          confirmText: 'text-white',
          borderColor: 'border-orange-200',
          bgGradient: 'bg-gradient-to-br from-orange-50 to-orange-100'
        };
      default:
        return {
          icon: <AlertTriangle className="w-8 h-8 text-blue-500" />,
          iconBg: 'bg-blue-100',
          titleColor: 'text-blue-800',
          confirmBg: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
          confirmText: 'text-white',
          borderColor: 'border-blue-200',
          bgGradient: 'bg-gradient-to-br from-blue-50 to-blue-100'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-[fadeIn_0.3s_ease]">
      <div className={`${styles.bgGradient} rounded-3xl shadow-2xl max-w-md w-full border-2 ${styles.borderColor} animate-[slideIn_0.3s_ease]`}>
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 ${styles.iconBg} rounded-2xl flex items-center justify-center shadow-lg`}>
                {styles.icon}
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${styles.titleColor} mb-1`}>
                  {title}
                </h3>
                <p className="text-gray-600 text-sm font-medium">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/20 rounded-xl transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 text-lg font-medium leading-relaxed">
              {message}
            </p>
            {itemName && (
              <div className="mt-3 p-3 bg-white/50 rounded-xl border border-white/30">
                <p className="text-gray-600 text-sm font-medium">
                  <span className="font-bold">Elemento:</span> {itemName}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-white/20 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white/30 transition-all duration-300 font-bold border border-white/30 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-6 py-3 ${styles.confirmBg} ${styles.confirmText} rounded-xl transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Procesando...
                </>
              ) : (
                <>
                  {type === 'delete' && <Trash2 className="w-5 h-5" />}
                  {confirmText}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
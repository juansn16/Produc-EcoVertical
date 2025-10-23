import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, X, Sparkles, Users, MapPin } from 'lucide-react';

const SuccessNotification = ({ 
  isVisible, 
  onClose, 
  title = "¡Éxito!", 
  message, 
  type = "garden",
  duration = 5000 
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!mounted || !isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'garden':
        return <Users className="w-8 h-8 text-white" />;
      case 'plant':
        return <Sparkles className="w-8 h-8 text-white" />;
      case 'location':
        return <MapPin className="w-8 h-8 text-white" />;
      default:
        return <CheckCircle className="w-8 h-8 text-white" />;
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'garden':
        return 'from-eco-mountain-meadow to-eco-emerald';
      case 'plant':
        return 'from-eco-emerald to-eco-pear';
      case 'location':
        return 'from-eco-mountain-meadow to-eco-cape-cod';
      default:
        return 'from-eco-mountain-meadow to-eco-emerald';
    }
  };

  const notificationContent = (
    <div className="fixed top-4 right-4 z-[9999] animate-fade-in-up">
      <div className={`
        bg-gradient-to-r ${getGradient()} 
        text-white rounded-xl shadow-strong
        p-4 min-w-[320px] max-w-[400px]
        border border-white/30
        backdrop-blur-sm
        relative overflow-hidden
        opacity-100
        notification-enhanced
      `}>
        {/* Fondo sólido para mejor legibilidad */}
        <div className="absolute inset-0 bg-black/20 rounded-xl"></div>
        
        {/* Efecto de brillo animado */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-pulse"></div>
        
        {/* Contenido principal */}
        <div className="relative flex items-start gap-3 z-10">
          {/* Icono con fondo circular */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
              {getIcon()}
            </div>
          </div>
          
          {/* Texto */}
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-lg mb-1 text-white drop-shadow-lg notification-title-enhanced">
              {title}
            </h4>
            <p className="text-white text-sm leading-relaxed drop-shadow-md notification-text-enhanced">
              {message}
            </p>
          </div>
          
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="flex-shrink-0 w-6 h-6 bg-white/30 hover:bg-white/40 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm border border-white/30"
          >
            <X className="w-4 h-4 text-white drop-shadow-sm" />
          </button>
        </div>
        
        {/* Barra de progreso */}
        {duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-b-xl">
            <div 
              className="h-full bg-white/90 animate-pulse rounded-b-xl"
              style={{
                animation: `shrink ${duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(notificationContent, document.body);
};

// Estilos CSS para la animación de la barra de progreso
const style = document.createElement('style');
style.textContent = `
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
`;
document.head.appendChild(style);

export default SuccessNotification;

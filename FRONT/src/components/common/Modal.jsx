import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Componente Modal base reutilizable con portal
 * Soluciona problemas de z-index y overlay de pantalla completa
 * Incluye mejoras de accesibilidad completas
 */
export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className = '',
  overlayClassName = '',
  showCloseButton = true,
  closeOnOverlayClick = true,
  maxWidth = 'max-w-md',
  ariaLabel,
  ariaDescribedBy,
  initialFocusRef
}) {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);
  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      // Guardar el elemento que tenía el foco antes de abrir el modal
      previousActiveElement.current = document.activeElement;
    } else {
      document.body.classList.remove('modal-open');
    }

    // Cleanup al desmontar
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  // Manejar escape key y navegación por teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'Tab':
          // Trap focus dentro del modal
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          if (!focusableElements || focusableElements.length === 0) return;
          
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          
          if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Manejar foco inicial y restauración
  useEffect(() => {
    if (isOpen) {
      // Pequeño delay para asegurar que el modal esté renderizado
      const timer = setTimeout(() => {
        if (initialFocusRef?.current) {
          initialFocusRef.current.focus();
        } else {
          // Buscar el primer elemento enfocable
          const firstFocusable = modalRef.current?.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (firstFocusable) {
            firstFocusable.focus();
          }
        }
      }, 100);

      return () => clearTimeout(timer);
    } else {
      // Restaurar foco al elemento anterior cuando se cierra el modal
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen, initialFocusRef]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div 
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center modal-overlay p-4 ${overlayClassName}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={ariaDescribedBy}
      aria-label={ariaLabel}
    >
      <div 
        ref={modalRef}
        className={`bg-theme-secondary dark:bg-theme-primary rounded-3xl shadow-3xl w-full ${maxWidth} border border-eco-pear/20 dark:border-eco-pear/30 animate-[slideIn_0.3s_ease] ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-eco-pear/20 dark:border-eco-pear/30">
            <h3 
              id="modal-title"
              className="text-xl font-bold text-theme-primary"
            >
              {title}
            </h3>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-eco-pear/20 dark:hover:bg-eco-pear/30 rounded-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:ring-offset-2"
                aria-label="Cerrar modal"
                type="button"
              >
                <X size={20} className="text-theme-primary" />
              </button>
            )}
          </div>
        )}
        
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );

  // Renderizar en portal para evitar problemas de z-index
  return createPortal(modalContent, document.body);
}

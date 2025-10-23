import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ToggleTheme = ({ className = '', size = 'default' }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-10 h-10',
    large: 'w-12 h-12'
  };

  const iconSizes = {
    small: 16,
    default: 20,
    large: 24
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]}
        relative overflow-hidden rounded-xl
        bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald
        hover:from-eco-mountain-meadow-dark hover:to-eco-emerald-dark
        transition-all duration-300 ease-in-out
        shadow-lg hover:shadow-xl
        hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:ring-offset-2
        ${className}
      `}
      aria-label={`Cambiar a modo ${isDarkMode ? 'claro' : 'oscuro'}`}
      title={`Cambiar a modo ${isDarkMode ? 'claro' : 'oscuro'} (Actual: ${isDarkMode ? 'Oscuro' : 'Claro'})`}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Icono del sol */}
        <Sun
          size={iconSizes[size]}
          className={`
            absolute transition-all duration-300 ease-in-out
            ${isDarkMode 
              ? 'opacity-0 rotate-180 scale-0' 
              : 'opacity-100 rotate-0 scale-100'
            }
            text-white
          `}
        />
        
        {/* Icono de la luna */}
        <Moon
          size={iconSizes[size]}
          className={`
            absolute transition-all duration-300 ease-in-out
            ${isDarkMode 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-180 scale-0'
            }
            text-white
          `}
        />
      </div>
      
      {/* Efecto de brillo */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
    </button>
  );
};

export default ToggleTheme;

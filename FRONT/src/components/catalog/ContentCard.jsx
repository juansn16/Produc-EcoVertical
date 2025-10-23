import React from 'react';
import { Calendar, User, Tag } from 'lucide-react';

export const ContentCard = ({ item, index }) => {
  // Función para obtener colores de categorías (similar a FilterButton)
  const getCategoryColor = (categoryId) => {
    const colors = {
      '1': { 
        hex: '#16a34a', 
        name: 'Semillas',
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-900',
        accent: 'text-green-700'
      },
      '2': { 
        hex: '#84cc16', 
        name: 'Fertilizantes',
        bg: 'bg-lime-50',
        border: 'border-lime-200',
        text: 'text-lime-900',
        accent: 'text-lime-700'
      },
      '3': { 
        hex: '#374151', 
        name: 'Herramientas',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-900',
        accent: 'text-gray-700'
      },
      '4': { 
        hex: '#059669', 
        name: 'Sustratos',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-900',
        accent: 'text-emerald-700'
      },
      '5': { 
        hex: '#f59e0b', 
        name: 'Otros',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-900',
        accent: 'text-amber-700'
      },
      '6': { 
        hex: '#059669', 
        name: 'Macetas',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-900',
        accent: 'text-emerald-700'
      },
      '7': { 
        hex: '#0891b2', 
        name: 'Sistemas de Riego',
        bg: 'bg-cyan-50',
        border: 'border-cyan-200',
        text: 'text-cyan-900',
        accent: 'text-cyan-700'
      },
      '8': { 
        hex: '#7c3aed', 
        name: 'Iluminación',
        bg: 'bg-violet-50',
        border: 'border-violet-200',
        text: 'text-violet-900',
        accent: 'text-violet-700'
      },
      '9': { 
        hex: '#dc2626', 
        name: 'Sensores',
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-900',
        accent: 'text-red-700'
      },
      '10': { 
        hex: '#f59e0b', 
        name: 'Protección',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-900',
        accent: 'text-amber-700'
      }
    };
    
    return colors[categoryId] || { 
      hex: '#6b7280', 
      name: 'Categoría',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-900',
      accent: 'text-gray-700'
    };
  };

  const colors = getCategoryColor(item.category);
  const isLightColor = colors.hex === '#84cc16' || colors.hex === '#f59e0b';

  return (
    <div
      className={`${colors.bg} ${colors.border} border-2 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] transform`}
      style={{
        animationDelay: `${index * 50}ms`,
        animation: 'fadeInUp 0.5s ease-out forwards',
        borderColor: colors.hex
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className={`text-lg font-semibold ${colors.text} line-clamp-2`}>
          {item.title}
        </h3>
        <span 
          className="px-2 py-1 rounded-md text-xs font-medium flex-shrink-0 ml-2"
          style={{ 
            backgroundColor: colors.hex,
            color: isLightColor ? '#1F2937' : '#FFFFFF'
          }}
        >
          {colors.name}
        </span>
      </div>
      
      <p className={`${colors.text} opacity-80 text-sm leading-relaxed mb-4 line-clamp-3`}>
        {item.description}
      </p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {item.tags && item.tags.map(tag => (
          <span
            key={tag}
            className={`px-2 py-1 rounded-md text-xs ${colors.accent} bg-white/50`}
          >
            <Tag className="w-3 h-3 inline mr-1" />
            {tag}
          </span>
        ))}
      </div>
      
      <div className={`flex items-center justify-between text-sm ${colors.accent}`}>
        <div className="flex items-center space-x-1">
          <User className="w-4 h-4" />
          <span>{item.author}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4" />
          <span>{new Date(item.date).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};
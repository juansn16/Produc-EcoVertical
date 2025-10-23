import React, { useState, useRef, useEffect } from 'react';
import { Store, Edit, Trash2, MapPin, Phone, Mail, Tag, MoreVertical } from 'lucide-react';
import Boton from '@/components/layout/Boton';

const ProviderCard = ({ provider, onEdit, onDelete, onViewDetails, isDarkMode = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleDelete = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    if (window.confirm('¿Estás seguro de que quieres eliminar este proveedor?')) {
      onDelete();
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    onEdit();
  };

  const handleViewDetails = () => {
    setIsMenuOpen(false);
    onViewDetails();
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  // Cerrar menú cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div 
      className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer`}
      onClick={handleViewDetails}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-eco-pear rounded-lg flex items-center justify-center">
            <Store className="w-6 h-6 text-eco-mountain-meadow-dark" />
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-lg mb-1`}>
              {provider.nombre_empresa}
            </h3>
            {provider.contacto_principal && (
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {provider.contacto_principal}
              </p>
            )}
          </div>
        </div>
        
        <div className="relative" ref={menuRef}>
          <button
            onClick={toggleMenu}
            className={`p-1 ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'} rounded transition-colors`}
          >
            <MoreVertical className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
          
          {isMenuOpen && (
            <div className={`absolute right-0 top-8 ${isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-200'} border rounded-lg shadow-lg py-1 z-10 min-w-[120px]`}>
              <button
                onClick={handleEdit}
                className={`w-full px-3 py-2 text-left text-sm ${isDarkMode ? 'hover:bg-gray-500 text-gray-200' : 'hover:bg-gray-50 text-gray-700'} flex items-center gap-2`}
              >
                <Edit className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={handleDelete}
                className={`w-full px-3 py-2 text-left text-sm ${isDarkMode ? 'hover:bg-gray-500 text-red-400' : 'hover:bg-gray-50 text-red-600'} flex items-center gap-2`}
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {/* Mostrar categorías múltiples */}
        {(() => {
          // Solo usar categorías múltiples
          let categoriasToShow = [];
          
          if (provider.categorias && Array.isArray(provider.categorias) && provider.categorias.length > 0) {
            // Usar categorías múltiples si están disponibles
            categoriasToShow = provider.categorias.filter(cat => cat && cat.trim() !== '');
          }
          
          if (categoriasToShow.length > 0) {
            return (
              <div className="space-y-2">
                <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <Tag className="w-4 h-4 text-eco-mountain-meadow" />
                  <span className="font-medium">
                    {categoriasToShow.length > 1 ? 'Categorías:' : 'Categoría:'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {categoriasToShow.map((categoria, index) => (
                    <span
                      key={index}
                      className="inline-block bg-eco-mountain-meadow text-white text-xs px-2 py-1 rounded-full"
                    >
                      {categoria}
                    </span>
                  ))}
                </div>
              </div>
            );
          } else {
            return (
              <div className="space-y-2">
                <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">Categorías:</span>
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} italic`}>
                  Sin categorías definidas
                </div>
              </div>
            );
          }
        })()}

        {provider.telefono && (
          <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <Phone className="w-4 h-4 text-eco-mountain-meadow" />
            <span>{provider.telefono}</span>
          </div>
        )}

        {provider.email && (
          <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <Mail className="w-4 h-4 text-eco-mountain-meadow" />
            <span className="truncate">{provider.email}</span>
          </div>
        )}

        {provider.ubicacion && (
          <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <MapPin className="w-4 h-4 text-eco-mountain-meadow" />
            <span className="truncate">
              {provider.ubicacion.ciudad}, {provider.ubicacion.estado}
            </span>
          </div>
        )}

        {provider.descripcion && (
          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-3`}>
            <p className="line-clamp-2">{provider.descripcion}</p>
          </div>
        )}
      </div>

      <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-100'}`}>
        <div className={`flex items-center justify-end text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <span>
            {new Date(provider.created_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;

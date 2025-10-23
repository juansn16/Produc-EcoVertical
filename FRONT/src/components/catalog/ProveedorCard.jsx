import React from 'react';
import { Tag, Package, MapPin, DollarSign, Calendar, User, Phone, Clock, Store } from 'lucide-react';

const ProveedorCard = ({ item }) => {
  const getCategoryColor = (category) => {
    const colors = {
      'dark': 'bg-gray-800 text-white',
      'green-dark': 'bg-green-800 text-white',
      'green-medium': 'bg-green-600 text-white',
      'green-light': 'bg-green-400 text-white',
      'cream': 'bg-yellow-200 text-gray-800'
    };
    return colors[category] || 'bg-gray-500 text-white';
  };

  const getDisponibilidadColor = (disponible) => {
    return disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getDisponibilidadText = (disponible) => {
    return disponible ? 'Disponible' : 'No Disponible';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 overflow-hidden">
      {/* Header con categoría */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {item.nombreProducto}
          </h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(item.categoria)}`}>
            {item.etiquetas[0]}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {item.descripcion}
        </p>

        {/* Información de precio y disponibilidad */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-gray-500" />
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDisponibilidadColor(item.disponible)}`}>
              {getDisponibilidadText(item.disponible)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign size={16} className="text-green-600" />
            <span className="text-sm font-semibold text-green-600">
              {item.precio}
            </span>
          </div>
        </div>

        {/* Nombre del proveedor */}
        <div className="flex items-center gap-2 mb-3">
          <Store size={16} className="text-blue-600" />
          <span className="text-sm font-medium text-blue-600">
            {item.nombreProveedor}
          </span>
        </div>

        {/* Dirección */}
        <div className="flex items-start gap-2 mb-3">
          <MapPin size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-gray-600 line-clamp-2">
            {item.direccion}
          </span>
        </div>

        {/* Horario */}
        <div className="flex items-center gap-2 mb-3">
          <Clock size={16} className="text-gray-500" />
          <span className="text-sm text-gray-600">
            {item.horario}
          </span>
        </div>

        {/* Contacto (si existe) */}
        {item.contacto && (
          <div className="flex items-center gap-2 mb-3">
            <Phone size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600">
              {item.contacto}
            </span>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex flex-wrap gap-1">
          {item.etiquetas.slice(1, 4).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
            >
              <Tag size={12} />
              {tag}
            </span>
          ))}
          {item.etiquetas.length > 4 && (
            <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              +{item.etiquetas.length - 4} más
            </span>
          )}
        </div>
      </div>

      {/* Footer con autor y fecha */}
      <div className="px-4 py-3 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <User size={14} />
            <span>{item.autor}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} />
            <span>{formatDate(item.fecha)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProveedorCard;
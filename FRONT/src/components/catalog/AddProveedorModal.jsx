import React, { useState, useEffect } from 'react';
import { X, Store, DollarSign, MapPin, Tag, Phone, Clock, User } from 'lucide-react';
import { categoryAPI } from '@/services/categoryService';
import Boton from '@/components/layout/Boton';

const AddProveedorModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    nombreProducto: '',
    descripcion: '',
    categoria_id: '',
    precio: '',
    direccion: '',
    contacto: '',
    nombreProveedor: '',
    horario: '',
    etiquetas: '',
    autor: ''
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar categorías desde la API
  useEffect(() => {
    const loadCategories = async () => {
      if (isOpen) {
        try {
          setLoading(true);
          const response = await categoryAPI.getAll();
          const categoriesResponse = response.success ? response : { data: [] };
          setCategories(categoriesResponse.data || []);
        } catch (error) {
          console.error('Error al cargar categorías:', error);
          // Fallback a categorías básicas si la API falla
          setCategories([
            { id: '1', nombre: 'Semillas' },
            { id: '2', nombre: 'Fertilizantes' },
            { id: '3', nombre: 'Herramientas' },
            { id: '4', nombre: 'Sustratos' },
            { id: '5', nombre: 'Otros' }
          ]);
        } finally {
          setLoading(false);
        }
      }
    };

    loadCategories();
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newItem = {
      ...formData,
      id: Date.now(),
      precio: `$${parseFloat(formData.precio).toFixed(2)}`,
      etiquetas: formData.etiquetas.split(',').map(tag => tag.trim()).filter(tag => tag),
      fecha: new Date().toISOString().split('T')[0],
      disponible: true
    };

    onSubmit(newItem);
    setFormData({
      nombreProducto: '',
      descripcion: '',
      categoria_id: '',
      precio: '',
      direccion: '',
      contacto: '',
      nombreProveedor: '',
      horario: '',
      etiquetas: '',
      autor: ''
    });
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si es el campo contacto (teléfono), filtrar solo números y símbolos permitidos
    if (name === 'contacto') {
      const allowedChars = /^[0-9+\-\(\)\s]*$/;
      if (!allowedChars.test(value)) {
        return; // No actualizar si contiene caracteres no permitidos
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Store size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Agregar Proveedor
              </h2>
              <p className="text-sm text-gray-600">
                Añade información sobre dónde comprar recursos del inventario
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Cerrar modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Nombre del producto y descripción */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  name="nombreProducto"
                  value={formData.nombreProducto}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Sistema de Riego Automático"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe el producto, sus características y usos..."
                  required
                />
              </div>
            </div>

            {/* Categoría y Precio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  name="categoria_id"
                  value={formData.categoria_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.nombre}
                    </option>
                  ))}
                </select>
                {loading && (
                  <p className="text-sm text-gray-500 mt-1">Cargando categorías...</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Nombre del proveedor y dirección */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Proveedor *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Store size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="nombreProveedor"
                    value={formData.nombreProveedor}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: TecnoRiego S.A."
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Av. Principal 123, Centro Comercial"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contacto y Horario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Contacto (Opcional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="contacto"
                    value={formData.contacto}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+52 55 1234 5678"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horario de Atención
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="horario"
                    value={formData.horario}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Lun-Vie 9:00-18:00"
                  />
                </div>
              </div>
            </div>

            {/* Tags y Autor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etiquetas
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="etiquetas"
                    value={formData.etiquetas}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Herramientas, Riego, Automático"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Separa las etiquetas con comas
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsable
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="autor"
                    value={formData.autor}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tu nombre"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
            <Boton
              texto="Cancelar"
              onClick={onClose}
              variant="secondary"
            />
            <Boton
              texto="Agregar Proveedor"
              type="submit"
              variant="primary"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProveedorModal;
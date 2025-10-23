import React, { useState, useEffect } from 'react';
import { X, Store, MapPin, Phone, Mail, User, Clock, Tag } from 'lucide-react';
import { categoryAPI } from '@/services/categoryService';
import Boton from '@/components/layout/Boton';

const AddProviderModal = ({ isOpen, onClose, onSubmit, provider = null, loading = false, isDarkMode = false }) => {
  const [formData, setFormData] = useState({
    nombre_empresa: '',
    contacto_principal: '',
    telefono: '',
    email: '',
    categorias: [], // Cambiar de especialidades a categorias
    descripcion: '',
    ubicacion: {
      nombre: '',
      calle: '',
      ciudad: '',
      estado: '',
      pais: 'Venezuela',
      descripcion: ''
    }
  });

  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Función helper para limpiar el formulario
  const resetForm = () => {
    setFormData({
      nombre_empresa: '',
      contacto_principal: '',
      telefono: '',
      email: '',
      categorias: [],
      descripcion: '',
      ubicacion: {
        nombre: '',
        calle: '',
        ciudad: '',
        estado: '',
        pais: 'Venezuela',
        descripcion: ''
      }
    });
    setErrors({});
  };

  // Cargar categorías desde la API
  useEffect(() => {
    const loadCategories = async () => {
      if (isOpen) {
        setLoadingCategories(true);
        try {
          const response = await categoryAPI.getAll();
          if (response.success) {
            setCategories(response.data);
            console.log('Categorías cargadas:', response.data);
          } else {
            console.error('Error al cargar categorías:', response.message);
            // Fallback a categorías básicas si la API falla
            setCategories([
              { id: '1', nombre: 'Semillas' },
              { id: '2', nombre: 'Fertilizantes' },
              { id: '3', nombre: 'Herramientas' },
              { id: '4', nombre: 'Sustratos' },
              { id: '5', nombre: 'Otros' }
            ]);
          }
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
          setLoadingCategories(false);
        }
      }
    };

    loadCategories();
  }, [isOpen]);

  // Actualizar formulario cuando se edita un proveedor
  useEffect(() => {
    if (provider) {
      console.log('🔍 Datos del proveedor recibidos para edición:', {
        nombre_empresa: provider.nombre_empresa,
        categorias: provider.categorias,
        tipo: typeof provider.categorias,
        esArray: Array.isArray(provider.categorias),
        longitud: provider.categorias?.length
      });
      
      setFormData({
        nombre_empresa: provider.nombre_empresa || '',
        contacto_principal: provider.contacto_principal || '',
        telefono: provider.telefono || '',
        email: provider.email || '',
        categorias: provider.categorias || [], // Usar categorías directamente
        descripcion: provider.descripcion || '',
        ubicacion: {
          nombre: provider.ubicacion?.nombre || '',
          calle: provider.ubicacion?.calle || '',
          ciudad: provider.ubicacion?.ciudad || '',
          estado: provider.ubicacion?.estado || '',
          pais: provider.ubicacion?.pais || 'Venezuela',
          descripcion: provider.ubicacion?.descripcion || ''
        }
      });
    } else {
      // Resetear formulario para nuevo proveedor
      resetForm();
    }
  }, [provider]);

  const handleInputChange = (field, value) => {
    // Si es el campo teléfono, filtrar solo números y símbolos permitidos
    if (field === 'telefono') {
      const allowedChars = /^[0-9+\-\(\)\s]*$/;
      if (!allowedChars.test(value)) {
        return; // No actualizar si contiene caracteres no permitidos
      }
    }
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Funciones para manejar categorías múltiples
  const handleCategoriaAdd = (categoria) => {
    if (categoria && !formData.categorias.includes(categoria)) {
      setFormData(prev => ({
        ...prev,
        categorias: [...prev.categorias, categoria]
      }));
    }
  };

  const handleCategoriaRemove = (categoriaToRemove) => {
    setFormData(prev => ({
      ...prev,
      categorias: prev.categorias.filter(cat => cat !== categoriaToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre_empresa.trim()) {
      newErrors.nombre_empresa = 'El nombre de la empresa es requerido';
    }

    if (!formData.contacto_principal.trim()) {
      newErrors.contacto_principal = 'El contacto principal es requerido';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    }

    if (!formData.ubicacion.ciudad.trim()) {
      newErrors['ubicacion.ciudad'] = 'La ciudad es requerida';
    }

    if (!formData.ubicacion.estado.trim()) {
      newErrors['ubicacion.estado'] = 'El estado es requerido';
    }

    // Validar que tenga al menos una categoría
    if (formData.categorias.length === 0) {
      newErrors.categorias = 'Al menos una categoría es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar datos para envío
      const dataToSend = {
        ...formData
        // Solo enviar especialidades múltiples
      };
      
      console.log('Datos enviados:', dataToSend); // Debug
      console.log('Categorías específicas:', {
        categorias: dataToSend.categorias,
        tipo: typeof dataToSend.categorias,
        esArray: Array.isArray(dataToSend.categorias),
        longitud: dataToSend.categorias?.length
      });
      
      // Enviar datos y esperar un momento para mostrar el estado "Creando..."
      await new Promise(resolve => setTimeout(resolve, 500)); // Mostrar "Creando..." por 500ms
      
      // Enviar datos sin esperar la respuesta completa
      onSubmit(dataToSend);
      
      // Limpiar formulario inmediatamente
      resetForm();
    } catch (error) {
      console.error('Error al guardar proveedor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-eco-pear rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-eco-mountain-meadow-dark" />
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {provider ? 'Editar Proveedor' : 'Agregar Proveedor'}
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {provider ? 'Modifica la información del proveedor' : 'Añade información sobre un nuevo proveedor'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              // Limpiar formulario al cerrar manualmente
              resetForm();
              onClose();
            }}
            className={`p-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
            aria-label="Cerrar modal"
          >
            <X className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Información básica */}
            <div className="space-y-4">
              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} flex items-center gap-2`}>
                <Store className="w-5 h-5 text-eco-mountain-meadow" />
                Información Básica
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                    Nombre de la Empresa *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre_empresa}
                    onChange={(e) => handleInputChange('nombre_empresa', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent ${
                      errors.nombre_empresa ? 'border-red-500' : isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300'
                    }`}
                    placeholder="Ej: Agrosupply S.A."
                  />
                  {errors.nombre_empresa && (
                    <p className="text-red-500 text-sm mt-1">{errors.nombre_empresa}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                    Contacto Principal *
                  </label>
                  <input
                    type="text"
                    value={formData.contacto_principal}
                    onChange={(e) => handleInputChange('contacto_principal', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent ${
                      errors.contacto_principal ? 'border-red-500' : isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300'
                    }`}
                    placeholder="Ej: Juan Pérez"
                  />
                  {errors.contacto_principal && (
                    <p className="text-red-500 text-sm mt-1">{errors.contacto_principal}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                    Teléfono *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => handleInputChange('telefono', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent ${
                        errors.telefono ? 'border-red-500' : isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300'
                      }`}
                      placeholder="Ej: +58 212 123 4567"
                    />
                  </div>
                  {errors.telefono && (
                    <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent ${
                        errors.email ? 'border-red-500' : isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300'
                      }`}
                      placeholder="Ej: contacto@agrosupply.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                    Categorías *
                  </label>
                  
                  {/* Selector de categorías */}
                  <div className="mb-3">
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          handleCategoriaAdd(e.target.value);
                          e.target.value = ''; // Resetear el select
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent ${
                        isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300'
                      }`}
                      disabled={loadingCategories}
                    >
                      <option value="">Agregar categoría</option>
                      {categories
                        .filter(category => !formData.categorias.includes(category.nombre))
                        .map(category => (
                          <option key={category.id} value={category.nombre}>
                            {category.nombre}
                          </option>
                        ))}
                    </select>
                    {loadingCategories && (
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Cargando categorías...</p>
                    )}
                  </div>

                  {/* Lista de categorías seleccionadas */}
                  {formData.categorias.length > 0 && (
                    <div className="space-y-2">
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Categorías seleccionadas:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.categorias.map((categoria, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-eco-mountain-meadow text-white px-3 py-1 rounded-full text-sm"
                          >
                            <span>{categoria}</span>
                            <button
                              type="button"
                              onClick={() => handleCategoriaRemove(categoria)}
                              className="hover:bg-eco-mountain-meadow-dark rounded-full p-1 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {errors.categorias && (
                    <p className="text-red-500 text-sm mt-1">{errors.categorias}</p>
                  )}
                  
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                    Selecciona las categorías de productos/servicios que ofrece el proveedor
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent ${
                      isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300'
                    }`}
                    placeholder="Describe los servicios o productos que ofrece el proveedor..."
                  />
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div className="space-y-4">
              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} flex items-center gap-2`}>
                <MapPin className="w-5 h-5 text-eco-mountain-meadow" />
                Ubicación
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    value={formData.ubicacion.ciudad}
                    onChange={(e) => handleInputChange('ubicacion.ciudad', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent ${
                      errors['ubicacion.ciudad'] ? 'border-red-500' : isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300'
                    }`}
                    placeholder="Ej: Caracas"
                  />
                  {errors['ubicacion.ciudad'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['ubicacion.ciudad']}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                    Estado *
                  </label>
                  <input
                    type="text"
                    value={formData.ubicacion.estado}
                    onChange={(e) => handleInputChange('ubicacion.estado', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent ${
                      errors['ubicacion.estado'] ? 'border-red-500' : isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300'
                    }`}
                    placeholder="Ej: Distrito Capital"
                  />
                  {errors['ubicacion.estado'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['ubicacion.estado']}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                    Calle
                  </label>
                  <input
                    type="text"
                    value={formData.ubicacion.calle}
                    onChange={(e) => handleInputChange('ubicacion.calle', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent ${
                      isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300'
                    }`}
                    placeholder="Ej: Av. Principal #123"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                    País
                  </label>
                  <input
                    type="text"
                    value={formData.ubicacion.pais}
                    onChange={(e) => handleInputChange('ubicacion.pais', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent ${
                      isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300'
                    }`}
                    placeholder="Venezuela"
                  />
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className={`flex items-center justify-end gap-3 pt-6 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
              <Boton
                texto="Cancelar"
                onClick={() => {
                  // Limpiar formulario al cancelar
                  resetForm();
                  onClose();
                }}
                variant="secondary"
                isDarkMode={isDarkMode}
              />
              <button
                type="submit"
                className="bg-eco-mountain-meadow hover:bg-eco-mountain-meadow-dark text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={isSubmitting || loading}
              >
                {(isSubmitting || loading) ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-semibold">
                      {provider ? 'Actualizando...' : 'Creando Proveedor...'}
                    </span>
                  </>
                ) : (
                  provider ? 'Actualizar Proveedor' : 'Crear Proveedor'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProviderModal;


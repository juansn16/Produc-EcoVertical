import React, { useState, useEffect } from 'react';
import { X, Package } from 'lucide-react';
import { providersAPI } from '@/services/apiService';
import { categoryAPI } from '@/services/categoryService';
import api from '@/services/apiService';

const AddInventoryModal = ({ isOpen, onClose, onSubmit, item }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria_id: '',
    cantidad_stock: '',
    cantidad_minima: '',
    precio_estimado: '',
    ubicacion_almacen: '',
    proveedor_id: '',
    imagen_url: ''
  });

  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(false);

  // Cargar datos de categorías, huertos y proveedores
  useEffect(() => {
    const loadData = async () => {
      if (isOpen) {
        try {
          setLoadingProviders(true);
          
          
          // Cargar proveedores reales desde la API
          const providersResponse = await providersAPI.getAllProviders();
          setProviders(providersResponse.data.data || []);

          // Cargar categorías reales desde la API
          try {
            const response = await categoryAPI.getAll();
            const categoriesResponse = response.success ? response : { data: [] };
            setCategories(categoriesResponse.data || []);
          } catch (error) {
            console.error('Error al cargar categorías:', error);
            // Fallback a categorías básicas si la API falla
            setCategories([
              { id: 'f624ed6c-918e-11f0-8bda-dc1ba1b74868', nombre: 'Semillas' },
              { id: 'f62502fb-918e-11f0-8bda-dc1ba1b74868', nombre: 'Fertilizantes' },
              { id: 'f625037d-918e-11f0-8bda-dc1ba1b74868', nombre: 'Herramientas' },
              { id: 'f62503a6-918e-11f0-8bda-dc1ba1b74868', nombre: 'Sustratos' },
              { id: 'f62503c6-918e-11f0-8bda-dc1ba1b74868', nombre: 'Macetas' }
            ]);
          }
          
        } catch (error) {
          console.error('Error al cargar datos:', error);
        } finally {
          setLoadingProviders(false);
        }
      }
    };

    loadData();
  }, [isOpen]);

  // Actualizar formulario cuando se edita un ítem
  useEffect(() => {
    if (item) {
      setFormData({
        nombre: item.nombre || '',
        descripcion: item.descripcion || '',
        categoria_id: item.categoria_id || '',
        cantidad_stock: item.cantidad_stock || '',
        cantidad_minima: item.cantidad_minima || '',
        precio_estimado: item.precio_estimado || '',
        ubicacion_almacen: item.ubicacion_almacen || '',
        proveedor_id: item.proveedor_id || '',
        imagen_url: item.imagen_url || ''
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        categoria_id: '',
        cantidad_stock: '',
        cantidad_minima: '5',
        precio_estimado: '',
        ubicacion_almacen: '',
        proveedor_id: '', // Inicializar como string vacío (se convertirá a null)
        imagen_url: ''
      });
    }
  }, [item]);

  // Resetear formulario cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        nombre: '',
        descripcion: '',
        categoria_id: '',
        cantidad_stock: '',
        cantidad_minima: '5',
        precio_estimado: '',
        ubicacion_almacen: '',
        proveedor_id: '',
        imagen_url: ''
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    
    try {
      const submitData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        categoria_id: formData.categoria_id,
        cantidad_stock: parseInt(formData.cantidad_stock),
        cantidad_minima: parseInt(formData.cantidad_minima),
        precio_estimado: formData.precio_estimado ? parseFloat(formData.precio_estimado) : null,
        ubicacion_almacen: formData.ubicacion_almacen,
        // Solo incluir proveedor_id si no está vacío
        ...(formData.proveedor_id !== '' && { proveedor_id: formData.proveedor_id }),
        // Solo incluir imagen_url si no está vacío
        ...(formData.imagen_url !== '' && { imagen_url: formData.imagen_url })
      };

      console.log('🔍 Datos del formulario antes de enviar:', formData);
      console.log('🔍 Datos procesados para enviar:', submitData);

      if (item) {
        await onSubmit(item.id, submitData);
      } else {
        await onSubmit(submitData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error al guardar ítem:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-theme-secondary dark:bg-theme-primary rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-eco-pear/20 dark:border-eco-pear/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-eco-mountain-meadow/20 dark:bg-eco-mountain-meadow/30 rounded-lg">
              <Package size={24} className="text-eco-mountain-meadow" />
            </div>
            <h2 className="text-xl font-semibold text-theme-primary">
              {item ? 'Editar Ítem' : 'Agregar al Inventario'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-theme-tertiary dark:hover:bg-theme-secondary rounded-lg transition-colors"
          >
            <X size={20} className="text-theme-secondary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-theme-secondary mb-2">
              Nombre del Producto *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-eco-pear/30 dark:border-eco-pear/50 rounded-lg focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent bg-theme-secondary dark:bg-theme-tertiary text-theme-primary"
              placeholder="Ej: Semillas de Tomate"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-theme-secondary mb-2">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-eco-pear/30 dark:border-eco-pear/50 rounded-lg focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent bg-theme-secondary dark:bg-theme-tertiary text-theme-primary"
              placeholder="Descripción detallada del producto..."
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-theme-secondary mb-2">
              Categoría *
            </label>
            <select
              name="categoria_id"
              value={formData.categoria_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-eco-pear/30 dark:border-eco-pear/50 rounded-lg focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent bg-theme-secondary dark:bg-theme-tertiary text-theme-primary"
              required
            >
              <option value="">Seleccionar categoría</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-theme-secondary mb-2">
                Stock Actual *
              </label>
              <input
                type="number"
                name="cantidad_stock"
                value={formData.cantidad_stock}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-eco-pear/30 dark:border-eco-pear/50 rounded-lg focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent bg-theme-secondary dark:bg-theme-tertiary text-theme-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-secondary mb-2">
                Stock Mínimo
              </label>
              <input
                type="number"
                name="cantidad_minima"
                value={formData.cantidad_minima}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-eco-pear/30 dark:border-eco-pear/50 rounded-lg focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent bg-theme-secondary dark:bg-theme-tertiary text-theme-primary"
              />
            </div>
          </div>

          {/* Precio y Ubicación */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-theme-secondary mb-2">
                Precio Estimado
              </label>
              <input
                type="number"
                name="precio_estimado"
                value={formData.precio_estimado}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-eco-pear/30 dark:border-eco-pear/50 rounded-lg focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent bg-theme-secondary dark:bg-theme-tertiary text-theme-primary"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-secondary mb-2">
                Ubicación en Almacén
              </label>
              <input
                type="text"
                name="ubicacion_almacen"
                value={formData.ubicacion_almacen}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-eco-pear/30 dark:border-eco-pear/50 rounded-lg focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent bg-theme-secondary dark:bg-theme-tertiary text-theme-primary"
                placeholder="Ej: Estante A-1"
              />
            </div>
          </div>


          {/* Proveedor */}
          <div>
            <label className="block text-sm font-medium text-theme-secondary mb-2">
              Proveedor
            </label>
            {loadingProviders ? (
              <div className="w-full px-3 py-2 border border-eco-pear/30 dark:border-eco-pear/50 rounded-lg bg-theme-tertiary dark:bg-theme-secondary">
                <span className="text-theme-secondary">Cargando proveedores...</span>
              </div>
            ) : (
              <select
                name="proveedor_id"
                value={formData.proveedor_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-eco-pear/30 dark:border-eco-pear/50 rounded-lg focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent bg-theme-secondary dark:bg-theme-tertiary text-theme-primary"
              >
                <option value="">Desconocido</option>
                {providers.map(provider => (
                  <option key={provider.id} value={provider.id}>
                    {provider.nombre_empresa}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* URL de imagen */}
          <div>
            <label className="block text-sm font-medium text-theme-secondary mb-2">
              URL de Imagen
            </label>
            <input
              type="url"
              name="imagen_url"
              value={formData.imagen_url}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-eco-pear/30 dark:border-eco-pear/50 rounded-lg focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent bg-theme-secondary dark:bg-theme-tertiary text-theme-primary"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-eco-pear/20 dark:border-eco-pear/30">
            <button
              type="submit"
              disabled={loading || loadingProviders}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald text-white rounded-lg hover:from-eco-mountain-meadow-dark hover:to-eco-emerald-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {loading ? 'Guardando...' : (item ? 'Actualizar' : 'Crear')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-theme-tertiary dark:bg-theme-secondary text-theme-primary rounded-lg hover:bg-theme-secondary dark:hover:bg-theme-tertiary transition-colors border border-eco-pear/30 dark:border-eco-pear/50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInventoryModal;
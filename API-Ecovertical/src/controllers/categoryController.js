import { CategoryQueries } from '../utils/queries/index.js';
import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

// Obtener todas las categorías disponibles
export const getAllCategories = async (req, res) => {
  try {
    console.log('Obteniendo todas las categorías...');
    
    const categories = await db.query(CategoryQueries.getAllProductCategories);
    
    console.log(`Categorías encontradas: ${categories.rows.length}`);
    
    res.json({
      success: true,
      data: categories.rows,
      message: 'Categorías obtenidas exitosamente'
    });
    
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

// Obtener una categoría por ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Obteniendo categoría con ID:', id);
    
    const categories = await db.query(CategoryQueries.getProductCategoryById, [id]);
    
    if (categories.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: categories.rows[0],
      message: 'Categoría obtenida exitosamente'
    });
    
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

// Crear nueva categoría de productos
export const createCategory = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    
    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la categoría es requerido'
      });
    }
    
    console.log('Creando nueva categoría:', { nombre, descripcion });
    
    const categoryId = uuidv4();
    await db.query(CategoryQueries.createProductCategory, [categoryId, nombre, descripcion || null]);
    
    // Obtener la categoría creada
    const result = await db.query(CategoryQueries.getProductCategoryById, [categoryId]);
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Categoría creada exitosamente'
    });
    
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

// Actualizar categoría de productos
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    
    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la categoría es requerido'
      });
    }
    
    console.log('Actualizando categoría:', { id, nombre, descripcion });
    
    // Verificar que la categoría existe
    const existingCategory = await db.query(CategoryQueries.getProductCategoryById, [id]);
    
    if (existingCategory.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
    
    await db.query(CategoryQueries.updateProductCategory, [nombre, descripcion || null, id]);
    
    // Obtener la categoría actualizada
    const result = await db.query(CategoryQueries.getProductCategoryById, [id]);
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Categoría actualizada exitosamente'
    });
    
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

// Eliminar categoría de productos
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Eliminando categoría:', id);
    
    // Verificar que la categoría existe
    const existingCategory = await db.query(CategoryQueries.getProductCategoryById, [id]);
    
    if (existingCategory.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
    
    // Verificar si la categoría está en uso
    const usageCheck = await db.query(CategoryQueries.checkProductCategoryInUse, [id]);
    
    if (usageCheck.rows[0].in_use > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar la categoría porque está siendo utilizada por productos'
      });
    }
    
    await db.query(CategoryQueries.deleteProductCategory, [id]);
    
    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });
    
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

// Buscar categorías por nombre
export const searchCategories = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro de búsqueda "q" es requerido'
      });
    }
    
    console.log('Buscando categorías con término:', q);
    
    const categories = await db.query(CategoryQueries.searchProductCategoriesByName, [`%${q}%`]);
    
    res.json({
      success: true,
      data: categories.rows,
      message: `Se encontraron ${categories.rows.length} categorías`
    });
    
  } catch (error) {
    console.error('Error al buscar categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

// Obtener estadísticas de categorías
export const getCategoryStats = async (req, res) => {
  try {
    console.log('Obteniendo estadísticas de categorías...');
    
    const stats = await db.query(CategoryQueries.getCategoryStats);
    
    res.json({
      success: true,
      data: stats.rows[0],
      message: 'Estadísticas obtenidas exitosamente'
    });
    
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};
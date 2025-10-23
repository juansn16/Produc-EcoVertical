import { ProveedorQueries } from '../utils/queries.js';
import db from '../config/db.js';

// Obtener todas las categorías disponibles
export const getAllCategories = async (req, res) => {
  try {
    console.log('Obteniendo todas las categorías...');
    
    const [categories] = await db.execute(ProveedorQueries.getAllCategorias);
    
    console.log(`Categorías encontradas: ${categories.length}`);
    
    res.json({
      success: true,
      data: categories,
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
    
    const [categories] = await db.execute(ProveedorQueries.getCategoriaById, [id]);
    
    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: categories[0],
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
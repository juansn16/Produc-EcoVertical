import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { LocationQueries } from '../utils/queries/index.js';

// Listar todas las ubicaciones
export const listLocations = async (req, res) => {
  try {
    const locationsResult = await db.query(LocationQueries.getAll);
    
    res.json({
      success: true,
      data: locationsResult.rows,
      total: locationsResult.rows.length
    });
  } catch (error) {
    console.error('Error al listar ubicaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener ubicación por ID
export const getLocationById = async (req, res) => {
  try {
    const { locationId } = req.params;
    
    const locationResult = await db.query(LocationQueries.getById, [locationId]);
    
    if (locationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ubicación no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: locationResult.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener ubicación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Crear nueva ubicación
export const createLocation = async (req, res) => {
  try {
    const {
      nombre,
      calle,
      ciudad,
      estado,
      pais,
      latitud,
      longitud,
      descripcion
    } = req.body;
    
    // Verificar si ya existe una ubicación similar
    const existingLocationResult = await db.query(LocationQueries.getByAddress, [
      calle || '',
      ciudad || '',
      estado || '',
      pais || ''
    ]);
    
    if (existingLocationResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una ubicación con esa dirección'
      });
    }
    
    // Redondear coordenadas a 2 decimales
    const latRounded = latitud ? Math.round(parseFloat(latitud) * 100) / 100 : null;
    const lngRounded = longitud ? Math.round(parseFloat(longitud) * 100) / 100 : null;
    
    // Crear la ubicación
    const result = await db.query(LocationQueries.create, [
      uuidv4(),
      nombre || `${calle}, ${ciudad}`,
      calle || '',
      ciudad || '',
      estado || '',
      pais || 'Venezuela',
      latRounded,
      lngRounded,
      descripcion || ''
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Ubicación creada exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear ubicación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar ubicación
export const updateLocation = async (req, res) => {
  try {
    const { locationId } = req.params;
    const updateData = req.body;
    
    // Verificar que la ubicación existe
    const locationResult = await db.query(LocationQueries.getById, [locationId]);
    if (locationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ubicación no encontrada'
      });
    }
    
    // Construir query de actualización dinámicamente
    const updateFields = [];
    const updateValues = [];
    
    if (updateData.nombre) {
      updateFields.push('nombre');
      updateValues.push(updateData.nombre);
    }
    if (updateData.calle) {
      updateFields.push('calle');
      updateValues.push(updateData.calle);
    }
    if (updateData.ciudad) {
      updateFields.push('ciudad');
      updateValues.push(updateData.ciudad);
    }
    if (updateData.estado) {
      updateFields.push('estado');
      updateValues.push(updateData.estado);
    }
    if (updateData.pais) {
      updateFields.push('pais');
      updateValues.push(updateData.pais);
    }
    if (updateData.latitud !== undefined) {
      updateFields.push('latitud');
      updateValues.push(Math.round(parseFloat(updateData.latitud) * 100) / 100);
    }
    if (updateData.longitud !== undefined) {
      updateFields.push('longitud');
      updateValues.push(Math.round(parseFloat(updateData.longitud) * 100) / 100);
    }
    if (updateData.descripcion !== undefined) {
      updateFields.push('descripcion');
      updateValues.push(updateData.descripcion);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron campos para actualizar'
      });
    }
    
    updateValues.push(locationId);
    
    const updateQuery = LocationQueries.buildUpdateQuery(updateFields);
    
    await db.query(updateQuery, updateValues);
    
    // Obtener la ubicación actualizada
    const updatedLocationResult = await db.query(LocationQueries.getById, [locationId]);
    
    res.json({
      success: true,
      message: 'Ubicación actualizada exitosamente',
      data: updatedLocationResult.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar ubicación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar ubicación (soft delete)
export const deleteLocation = async (req, res) => {
  try {
    const { locationId } = req.params;
    
    // Verificar que la ubicación existe
    const locationResult = await db.query(LocationQueries.getById, [locationId]);
    if (locationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ubicación no encontrada'
      });
    }
    
    // Verificar si hay huertos usando esta ubicación
    const gardensUsingLocationResult = await db.query(LocationQueries.checkGardenUsage, [locationId]);
    
    if (gardensUsingLocationResult.rows[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar la ubicación porque hay huertos asociados'
      });
    }
    
    // Realizar soft delete
    await db.query(LocationQueries.softDelete, [locationId]);
    
    res.json({
      success: true,
      message: 'Ubicación eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar ubicación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Buscar ubicaciones por ciudad
export const getLocationsByCity = async (req, res) => {
  try {
    const { ciudad } = req.params;
    
    const locationsResult = await db.query(LocationQueries.getByCiudad, [ciudad]);
    
    res.json({
      success: true,
      data: locationsResult.rows,
      total: locationsResult.rows.length
    });
  } catch (error) {
    console.error('Error al buscar ubicaciones por ciudad:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

import db from '../config/db.js';
import { UbicacionQueries } from '../utils/queries.js';

// Listar todas las ubicaciones
export const listLocations = async (req, res) => {
  try {
    const [locations] = await db.execute(UbicacionQueries.getAll);
    
    res.json({
      success: true,
      data: locations,
      total: locations.length
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
    
    const [locationResult] = await db.execute(UbicacionQueries.getById, [locationId]);
    
    if (locationResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ubicación no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: locationResult[0]
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
    const [existingLocation] = await db.execute(UbicacionQueries.getByAddress, [
      calle || '',
      ciudad || '',
      estado || '',
      pais || ''
    ]);
    
    if (existingLocation.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una ubicación con esa dirección'
      });
    }
    
    // Redondear coordenadas a 2 decimales
    const latRounded = latitud ? Math.round(parseFloat(latitud) * 100) / 100 : null;
    const lngRounded = longitud ? Math.round(parseFloat(longitud) * 100) / 100 : null;
    
    // Crear la ubicación
    const [result] = await db.execute(UbicacionQueries.create, [
      nombre || `${calle}, ${ciudad}`,
      calle || '',
      ciudad || '',
      estado || '',
      pais || 'Venezuela',
      latRounded,
      lngRounded,
      descripcion || ''
    ]);
    
    // Como usamos UUID(), necesitamos obtener la ubicación recién creada
    // Buscamos por los datos que acabamos de insertar
    const [locationResult] = await db.execute(
      `SELECT * FROM ubicaciones WHERE nombre = ? AND calle = ? AND ciudad = ? AND is_deleted = 0 ORDER BY created_at DESC LIMIT 1`,
      [nombre || `${calle}, ${ciudad}`, calle || '', ciudad || '']
    );
    
    res.status(201).json({
      success: true,
      message: 'Ubicación creada exitosamente',
      data: locationResult[0]
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
    const [locationResult] = await db.execute(UbicacionQueries.getById, [locationId]);
    if (locationResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ubicación no encontrada'
      });
    }
    
    // Construir query de actualización dinámicamente
    const updateFields = [];
    const updateValues = [];
    
    if (updateData.nombre) {
      updateFields.push('nombre = ?');
      updateValues.push(updateData.nombre);
    }
    if (updateData.calle) {
      updateFields.push('calle = ?');
      updateValues.push(updateData.calle);
    }
    if (updateData.ciudad) {
      updateFields.push('ciudad = ?');
      updateValues.push(updateData.ciudad);
    }
    if (updateData.estado) {
      updateFields.push('estado = ?');
      updateValues.push(updateData.estado);
    }
    if (updateData.pais) {
      updateFields.push('pais = ?');
      updateValues.push(updateData.pais);
    }
    if (updateData.latitud !== undefined) {
      updateFields.push('latitud = ?');
      updateValues.push(Math.round(parseFloat(updateData.latitud) * 100) / 100);
    }
    if (updateData.longitud !== undefined) {
      updateFields.push('longitud = ?');
      updateValues.push(Math.round(parseFloat(updateData.longitud) * 100) / 100);
    }
    if (updateData.descripcion !== undefined) {
      updateFields.push('descripcion = ?');
      updateValues.push(updateData.descripcion);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron campos para actualizar'
      });
    }
    
    updateValues.push(locationId);
    
    const updateQuery = `
      UPDATE ubicaciones 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND is_deleted = 0
    `;
    
    await db.execute(updateQuery, updateValues);
    
    // Obtener la ubicación actualizada
    const [updatedLocation] = await db.execute(UbicacionQueries.getById, [locationId]);
    
    res.json({
      success: true,
      message: 'Ubicación actualizada exitosamente',
      data: updatedLocation[0]
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
    const [locationResult] = await db.execute(UbicacionQueries.getById, [locationId]);
    if (locationResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ubicación no encontrada'
      });
    }
    
    // Verificar si hay huertos usando esta ubicación
    const [gardensUsingLocation] = await db.execute(`
      SELECT COUNT(*) as count FROM huertos 
      WHERE ubicacion_id = ? AND is_deleted = 0
    `, [locationId]);
    
    if (gardensUsingLocation[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar la ubicación porque hay huertos asociados'
      });
    }
    
    // Realizar soft delete
    await db.execute(UbicacionQueries.softDelete, [locationId]);
    
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
    
    const [locations] = await db.execute(UbicacionQueries.getByCiudad, [ciudad]);
    
    res.json({
      success: true,
      data: locations,
      total: locations.length
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

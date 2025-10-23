// providerController.js
import db from '../config/db.js';
import { ProviderQueries, LocationQueries } from '../utils/queries/index.js';
import { v4 as uuidv4 } from 'uuid';

export const getAllProviders = async (req, res) => {
  try {
    console.log('Obteniendo todos los proveedores...');
    
    const { category } = req.query;
    
    let query;
    let params = [];
    
    // Filtrar por categoría si se especifica
    if (category) {
      query = ProviderQueries.getProvidersByCategory;
      params = [category];
    } else {
      query = ProviderQueries.getAllProviders;
    }
    
    const providersResult = await db.query(query, params);
    
    // Formatear la respuesta para el frontend
    const formattedProviders = providersResult.rows.map(provider => {
      const formatted = {
        id: provider.id,
        nombre_empresa: provider.nombre_empresa,
        contacto_principal: provider.contacto_principal,
        telefono: provider.telefono,
        email: provider.email,
        descripcion: provider.descripcion,
        categorias: provider.categorias ? provider.categorias.split(',') : [], // Categorías múltiples
        created_at: provider.created_at,
        ubicacion: provider.ubicacion_id ? {
          ciudad: provider.ciudad,
          estado: provider.estado,
          calle: provider.calle,
          pais: provider.pais,
          descripcion: provider.ubicacion_descripcion
        } : null
      };
      
      return formatted;
    });

    console.log(`Proveedores encontrados: ${formattedProviders.length}`);
    
    res.json({
      success: true,
      data: formattedProviders,
      message: 'Proveedores obtenidos exitosamente'
    });
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

// Obtener proveedores por categoría de producto
export const getProvidersByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    console.log(`Obteniendo proveedores para categoría: ${categoryId}`);
    
    // Obtener proveedores que tienen productos de la categoría especificada
    const providersResult = await db.query(ProviderQueries.getProvidersByProductCategory, [categoryId]);
    
    // Formatear la respuesta
    const formattedProviders = providersResult.rows.map(provider => ({
      id: provider.id,
      nombre_empresa: provider.nombre_empresa,
      contacto_principal: provider.contacto_principal,
      telefono: provider.telefono,
      email: provider.email,
      descripcion: provider.descripcion,
      especialidad: provider.especialidad,
      created_at: provider.created_at,
      categoria_nombre: provider.categoria_nombre,
      ubicacion: provider.ubicacion_id ? {
        ciudad: provider.ciudad,
        estado: provider.estado,
        calle: provider.calle,
        pais: provider.pais,
        descripcion: provider.ubicacion_descripcion
      } : null
    }));

    console.log(`Proveedores encontrados para categoría ${categoryId}: ${formattedProviders.length}`);
    
    res.json({
      success: true,
      data: formattedProviders,
      message: `Proveedores para categoría ${providersResult.rows[0]?.categoria_nombre || 'específica'} obtenidos exitosamente`
    });
  } catch (error) {
    console.error('Error al obtener proveedores por categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

export const getProviderById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Obteniendo proveedor con ID: ${id}`);

    const providersResult = await db.query(ProviderQueries.getProviderById, [id]);
    
    if (providersResult.rows.length === 0) {
      console.log('Proveedor no encontrado');
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }
    
    const provider = providersResult.rows[0];
    
    // Formatear la respuesta como espera el frontend
    const formattedProvider = {
      id: provider.id,
      nombre_empresa: provider.nombre_empresa,
      contacto_principal: provider.contacto_principal,
      telefono: provider.telefono,
      email: provider.email,
      descripcion: provider.descripcion,
      categorias: provider.categorias ? provider.categorias.split(',') : [], // Categorías múltiples
      created_at: provider.created_at,
      ubicacion: provider.ubicacion_id ? {
        ciudad: provider.ciudad,
        estado: provider.estado,
        calle: provider.calle,
        pais: provider.pais,
        descripcion: provider.ubicacion_descripcion,
        nombre: provider.ubicacion_nombre
      } : null
    };

    console.log('Proveedor encontrado:', formattedProvider.nombre_empresa);
    
    res.json({
      success: true,
      data: formattedProvider,
      message: 'Proveedor obtenido exitosamente'
    });
  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

export const createProvider = async (req, res) => {
  try {
    const {
      nombre_empresa,
      contacto_principal,
      telefono,
      email,
      especialidades, // Mantener para compatibilidad
      categorias, // Campo principal
      descripcion,
      ubicacion
    } = req.body;

    console.log('Creando nuevo proveedor:', { nombre_empresa, contacto_principal });
    console.log('Datos recibidos en createProvider:', {
      especialidades: especialidades,
      categorias: categorias,
      tipoEspecialidades: typeof especialidades,
      esArrayEspecialidades: Array.isArray(especialidades),
      longitudEspecialidades: especialidades?.length,
      tipoCategorias: typeof categorias,
      esArrayCategorias: Array.isArray(categorias),
      longitudCategorias: categorias?.length
    });

    // Validaciones básicas
    if (!nombre_empresa) {
      return res.status(400).json({
        success: false,
        message: 'Nombre de empresa es requerido'
      });
    }

    // Validar email si se proporciona
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de email no válido'
      });
    }

    // Iniciar transacción PostgreSQL
    await db.query('BEGIN');

    try {
      let ubicacionId = null;

      // 1. Crear ubicación si se proporciona
      if (ubicacion && (ubicacion.ciudad || ubicacion.calle)) {
        console.log('Creando ubicación para proveedor...');
        
        const ubicacionId = uuidv4();
        const ubicacionData = [
          ubicacionId,
          ubicacion.nombre && ubicacion.nombre.trim() !== "" 
            ? ubicacion.nombre 
            : `Ubicación de ${nombre_empresa}`,
          ubicacion.calle || '',
          ubicacion.ciudad || '',
          ubicacion.estado || '',
          ubicacion.pais || 'Venezuela',
          ubicacion.descripcion || ''
        ];

        console.log('Datos de ubicación:', ubicacionData);

        // Crear la ubicación usando PostgreSQL
        await db.query(`
          INSERT INTO ubicaciones (id, nombre, calle, ciudad, estado, pais, descripcion)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, ubicacionData);

        console.log('Ubicación creada con ID:', ubicacionId);
      }

      // 2. Crear proveedor
      console.log('Creando proveedor en base de datos...');
      
      const providerId = uuidv4();
      
      // Determinar categorías a usar (priorizar categorias sobre especialidades)
      let categoriasToUse = [];
      if (categorias && Array.isArray(categorias) && categorias.length > 0) {
        categoriasToUse = categorias.filter(cat => cat && cat.trim() !== '');
      } else if (especialidades && Array.isArray(especialidades) && especialidades.length > 0) {
        categoriasToUse = especialidades.filter(esp => esp && esp.trim() !== '');
      }
      
      const providerData = [
        providerId, // Usamos el UUID generado
        nombre_empresa,
        contacto_principal || '',
        telefono || '',
        email || '',
        ubicacionId,
        descripcion || ''
      ];

      console.log('Datos del proveedor:', providerData);

      // Crear el proveedor usando PostgreSQL
      await db.query(`
        INSERT INTO proveedores (id, nombre_empresa, contacto_principal, telefono, email, ubicacion_id, descripcion)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, providerData);

      // 3. Crear categorías en la tabla proveedor_categorias
      if (categoriasToUse.length > 0) {
        console.log('Creando categorías para el proveedor:', categoriasToUse);
        
        for (const categoriaNombre of categoriasToUse) {
          // Buscar o crear la categoría
          let categoriaResult = await db.query(`
            SELECT id FROM categorias WHERE nombre = $1 AND is_deleted = false
          `, [categoriaNombre.trim()]);
          
          let categoriaId;
          if (categoriaResult.rows.length === 0) {
            // Crear nueva categoría
            categoriaId = uuidv4();
            await db.query(`
              INSERT INTO categorias (id, nombre, descripcion)
              VALUES ($1, $2, $3)
            `, [categoriaId, categoriaNombre.trim(), `Categoría para ${categoriaNombre.trim()}`]);
            console.log(`Categoría creada: ${categoriaNombre}`);
          } else {
            categoriaId = categoriaResult.rows[0].id;
            console.log(`Categoría existente: ${categoriaNombre}`);
          }
          
          // Crear relación proveedor-categoría
          await db.query(`
            INSERT INTO proveedor_categorias (id, proveedor_id, categoria_id)
            VALUES ($1, $2, $3)
          `, [uuidv4(), providerId, categoriaId]);
        }
        console.log('Categorías creadas en la tabla proveedor_categorias');
      }

      // 4. Obtener el proveedor creado con sus relaciones
      const providersResult = await db.query(`
        SELECT 
          p.*, 
          u.ciudad, 
          u.estado, 
          u.calle, 
          u.pais,
          u.descripcion as ubicacion_descripcion,
          u.nombre as ubicacion_nombre,
          STRING_AGG(c.nombre, ',') as categorias
        FROM proveedores p 
        LEFT JOIN ubicaciones u ON p.ubicacion_id = u.id 
        LEFT JOIN proveedor_categorias pc ON p.id = pc.proveedor_id AND pc.is_deleted = false
        LEFT JOIN categorias c ON pc.categoria_id = c.id AND c.is_deleted = false
        WHERE p.id = $1 AND p.is_deleted = false
        GROUP BY p.id, u.ciudad, u.estado, u.calle, u.pais, u.descripcion, u.nombre
      `, [providerId]);
      
      const newProvider = providersResult.rows[0];
      const formattedProvider = {
        id: newProvider.id,
        nombre_empresa: newProvider.nombre_empresa,
        contacto_principal: newProvider.contacto_principal,
        telefono: newProvider.telefono,
        email: newProvider.email,
        descripcion: newProvider.descripcion,
        categorias: newProvider.categorias ? newProvider.categorias.split(',') : [], // Categorías múltiples
        created_at: newProvider.created_at,
        ubicacion: newProvider.ubicacion_id ? {
          ciudad: newProvider.ciudad,
          estado: newProvider.estado,
          calle: newProvider.calle,
          pais: newProvider.pais,
          descripcion: newProvider.ubicacion_descripcion
        } : null
      };

      // Confirmar transacción
      await db.query('COMMIT');
      console.log('Proveedor creado exitosamente:', formattedProvider.nombre_empresa);

      res.status(201).json({
        success: true,
        data: formattedProvider,
        message: 'Proveedor creado exitosamente'
      });

    } catch (error) {
      // Revertir transacción en caso de error
      await db.query('ROLLBACK');
      console.error('Error en transacción:', error);
      throw error;
    }

  } catch (error) {
    console.error('Error al crear proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear proveedor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

export const updateProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre_empresa,
      contacto_principal,
      telefono,
      email,
      especialidades, // Mantener para compatibilidad
      categorias, // Campo principal
      descripcion,
      ubicacion
    } = req.body;

    console.log('🔄 Actualizando proveedor:', id);
    console.log('📊 Datos recibidos en updateProvider:', {
      nombre_empresa,
      contacto_principal,
      telefono,
      email,
      especialidades: especialidades,
      categorias: categorias,
      descripcion,
      ubicacion,
      tipoEspecialidades: typeof especialidades,
      esArrayEspecialidades: Array.isArray(especialidades),
      longitudEspecialidades: especialidades?.length,
      tipoCategorias: typeof categorias,
      esArrayCategorias: Array.isArray(categorias),
      longitudCategorias: categorias?.length
    });

    // Validar email si se proporciona
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de email no válido'
      });
    }

    console.log('🔗 Obteniendo conexión a la base de datos...');
    const connection = await db.getConnection();
    await connection.beginTransaction();
    console.log('✅ Transacción iniciada');

    try {
      // 1. Verificar si el proveedor existe
      console.log('🔍 Verificando si el proveedor existe...');
      const providersResult = await connection.query(
        ProviderQueries.checkProviderExists,
        [id]
      );
      
      if (providersResult.rows.length === 0) {
        console.log('❌ Proveedor no encontrado');
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: 'Proveedor no encontrado'
        });
      }

      const existingProvider = providersResult.rows[0];
      let ubicacionId = existingProvider.ubicacion_id;
      console.log('✅ Proveedor encontrado. Ubicación ID actual:', ubicacionId);

      // 2. Actualizar o crear ubicación
      if (ubicacion) {
        console.log('📍 Procesando ubicación:', ubicacion);
        if (ubicacionId) {
          // Actualizar ubicación existente (sin latitud/longitud)
          console.log('🔄 Actualizando ubicación existente...');
          
          await connection.query(ProviderQueries.updateLocation, [
            ubicacion.ciudad || '',
            ubicacion.estado || '',
            ubicacion.calle || '',
            ubicacion.pais || 'Venezuela',
            ubicacion.descripcion || '',
            ubicacionId
          ]);
          console.log('✅ Ubicación actualizada');
        } else if (ubicacion.ciudad || ubicacion.calle) {
          // Crear nueva ubicación (sin latitud/longitud)
          console.log('🆕 Creando nueva ubicación...');
          const ubicacionData = [
            ubicacion.nombre || `Ubicación de ${nombre_empresa}`,
            ubicacion.calle || '',
            ubicacion.ciudad || '',
            ubicacion.estado || '',
            ubicacion.pais || 'Venezuela',
            null, // latitud
            null, // longitud
            ubicacion.descripcion || ''
          ];

          console.log('📊 Datos de ubicación a crear:', ubicacionData);

          const ubicacionResult = await connection.query(
            LocationQueries.create,
            ubicacionData
          );
          
          // Obtener el ID de la ubicación recién creada
          const newLocationResult = await connection.query(
            ProviderQueries.getNewLocation,
            [ubicacionData[0], ubicacionData[1], ubicacionData[2]]
          );

          if (newLocationResult.rows.length > 0) {
            ubicacionId = newLocationResult.rows[0].id;
            console.log('✅ Ubicación creada con ID:', ubicacionId);
          } else {
            throw new Error('No se pudo obtener el ID de la ubicación creada');
          }
        }
      }

      // 3. Actualizar proveedor
      console.log('🔄 Actualizando datos del proveedor...');
      // Determinar categorías a usar (priorizar categorias sobre especialidades)
      let categoriasToUse = [];
      if (categorias && Array.isArray(categorias) && categorias.length > 0) {
        categoriasToUse = categorias.filter(cat => cat && cat.trim() !== '');
      } else if (especialidades && Array.isArray(especialidades) && especialidades.length > 0) {
        categoriasToUse = especialidades.filter(esp => esp && esp.trim() !== '');
      }
      
      console.log('📊 Categorías a usar:', categoriasToUse);
      
      const updateData = [
        nombre_empresa,
        contacto_principal || '',
        telefono || '',
        email || '',
        ubicacionId,
        descripcion || '',
        id
      ];
      
      console.log('📊 Datos de actualización del proveedor:', updateData);
      
      await connection.query(ProviderQueries.updateProvider, updateData);
      console.log('✅ Proveedor actualizado en base de datos');

      // 4. Actualizar categorías en la tabla proveedor_categorias
      if (categoriasToUse.length > 0) {
        console.log('🏷️ Actualizando categorías para el proveedor:', categoriasToUse);
        
        // Eliminar categorías existentes (soft delete)
        console.log('🗑️ Eliminando categorías existentes...');
        const deleteResult = await connection.query(ProviderQueries.deleteProviderCategories, [id]);
        console.log(`✅ Eliminadas ${deleteResult.rowCount} categorías existentes`);
        
        // Pequeña pausa para asegurar que la eliminación se procese
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Agregar nuevas categorías
        for (const categoriaNombre of categoriasToUse) {
          console.log(`🔍 Procesando categoría: ${categoriaNombre}`);
          // Buscar o crear la categoría
          let categoriaResult = await connection.query(
            ProviderQueries.findCategoryByName,
            [categoriaNombre.trim()]
          );
          
          let categoriaId;
          if (categoriaResult.rows.length === 0) {
            // Crear nueva categoría
            categoriaId = uuidv4();
            console.log(`🆕 Creando nueva categoría: ${categoriaNombre} con ID: ${categoriaId}`);
            await connection.query(
              ProviderQueries.createCategory,
              [categoriaId, categoriaNombre.trim(), `Categoría para ${categoriaNombre.trim()}`]
            );
            console.log(`✅ Categoría creada: ${categoriaNombre}`);
          } else {
            categoriaId = categoriaResult.rows[0].id;
            console.log(`✅ Categoría existente encontrada: ${categoriaNombre} con ID: ${categoriaId}`);
          }
          
          // Verificar si la relación ya existe (incluyendo las eliminadas)
          const existingRelationResult = await connection.query(
            ProviderQueries.checkProviderCategoryRelation,
            [id, categoriaId]
          );
          
          if (existingRelationResult.rows.length === 0) {
            // Crear nueva relación
            console.log(`🔗 Creando nueva relación proveedor-categoría: ${id} -> ${categoriaId}`);
            await connection.query(
              ProviderQueries.createProviderCategory,
              [uuidv4(), id, categoriaId]
            );
          } else {
            const relation = existingRelationResult.rows[0];
            if (relation.is_deleted === true) {
              // Restaurar relación eliminada
              console.log(`🔄 Restaurando relación eliminada: ${id} -> ${categoriaId}`);
              await connection.query(
                ProviderQueries.restoreProviderCategory,
                [relation.id]
              );
            } else {
              console.log(`ℹ️ Relación ya existe y está activa: ${id} -> ${categoriaId}`);
            }
          }
        }
        console.log('✅ Categorías actualizadas en la tabla proveedor_categorias');
      } else {
        // Si no hay categorías, eliminar todas las existentes
        console.log('🗑️ No hay categorías, eliminando todas las existentes...');
        const deleteResult = await connection.query(ProviderQueries.deleteProviderCategories, [id]);
        console.log(`✅ Eliminadas ${deleteResult.rowCount} categorías del proveedor`);
      }

      // 5. Obtener el proveedor actualizado
      console.log('🔍 Obteniendo proveedor actualizado...');
      const updatedProvidersResult = await connection.query(ProviderQueries.getProviderById, [id]);
      
      if (updatedProvidersResult.rows.length === 0) {
        throw new Error('No se pudo obtener el proveedor actualizado');
      }
      
      const updatedProvider = updatedProvidersResult.rows[0];
      const formattedProvider = {
        id: updatedProvider.id,
        nombre_empresa: updatedProvider.nombre_empresa,
        contacto_principal: updatedProvider.contacto_principal,
        telefono: updatedProvider.telefono,
        email: updatedProvider.email,
        descripcion: updatedProvider.descripcion,
        categorias: updatedProvider.categorias ? updatedProvider.categorias.split(',') : [], // Categorías múltiples
        created_at: updatedProvider.created_at,
        ubicacion: updatedProvider.ubicacion_id ? {
          ciudad: updatedProvider.ciudad,
          estado: updatedProvider.estado,
          calle: updatedProvider.calle,
          pais: updatedProvider.pais,
          descripcion: updatedProvider.ubicacion_descripcion
        } : null
      };

      console.log('💾 Confirmando transacción...');
      await connection.commit();
      console.log('✅ Proveedor actualizado exitosamente:', formattedProvider.nombre_empresa);

      res.json({
        success: true,
        data: formattedProvider,
        message: 'Proveedor actualizado exitosamente'
      });

    } catch (error) {
      console.error('❌ Error en transacción:', error);
      await connection.rollback();
      console.error('🔄 Transacción revertida');
      throw error;
    } finally {
      connection.release();
      console.log('🔗 Conexión liberada');
    }

  } catch (error) {
    console.error('❌ Error al actualizar proveedor:', error);
    console.error('📊 Detalles del error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: 'Error al actualizar proveedor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

export const deleteProvider = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Eliminando proveedor:', id);

    // Soft delete
    const result = await db.query(ProviderQueries.deleteProvider, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }

    console.log('Proveedor eliminado exitosamente');
    res.json({
      success: true,
      message: 'Proveedor eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar proveedor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

export const searchProviders = async (req, res) => {
  try {
    const { q } = req.query;
    console.log('Buscando proveedores:', q);
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Query de búsqueda requerida'
      });
    }

    const searchTerm = `%${q}%`;
    const providersResult = await db.query(ProviderQueries.searchProviders, [searchTerm]);

    const formattedProviders = providersResult.rows.map(provider => ({
      id: provider.id,
      nombre_empresa: provider.nombre_empresa,
      contacto_principal: provider.contacto_principal,
      telefono: provider.telefono,
      email: provider.email,
      descripcion: provider.descripcion,
      especialidad: provider.especialidad,
      created_at: provider.created_at,
      ubicacion: provider.ubicacion_id ? {
        ciudad: provider.ciudad,
        estado: provider.estado,
        calle: provider.calle,
        pais: provider.pais,
        descripcion: provider.ubicacion_descripcion
      } : null
    }));

    console.log(`Búsqueda completada. Resultados: ${formattedProviders.length}`);
    
    res.json({
      success: true,
      data: formattedProviders,
      message: 'Búsqueda completada exitosamente'
    });

  } catch (error) {
    console.error('Error en búsqueda de proveedores:', error);
    res.status(500).json({
      success: false,
      message: 'Error en la búsqueda',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};
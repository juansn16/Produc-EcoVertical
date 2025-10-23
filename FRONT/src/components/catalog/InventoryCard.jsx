import React, { useState, useEffect } from 'react';
import { Package, Edit, Trash2, TrendingUp, TrendingDown, MapPin, DollarSign, Users, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getInventoryPermissions } from '@/services/inventoryService';

const InventoryCard = ({ item, onEdit, onDelete, onUpdateStock, onRecordUsage, onShowHistory, canEdit, canDelete, canUpdateStock, canRecordUsage }) => {
  const { user: currentUser } = useAuth();
  const [permissions, setPermissions] = useState({
    canEdit: false,
    canUse: false,
    canViewHistory: false,
    canManagePermissions: false
  });
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [hasAssignedPermissions, setHasAssignedPermissions] = useState(false);
  
  // Verificar si el usuario es el propietario del ítem
  const isOwner = currentUser && item.usuario_creador === currentUser.id;
  const userRole = currentUser?.rol || currentUser?.role;

  // Debug: verificar si el item tiene imagen_url
  console.log('🔍 InventoryCard - Item data:', {
    nombre: item.nombre,
    imagen_url: item.imagen_url,
    hasImage: !!item.imagen_url
  });

  // Verificar permisos del usuario para este item
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        setLoadingPermissions(true);
        
        if (!currentUser) {
          setPermissions({
            canEdit: false,
            canUse: false,
            canViewHistory: false,
            canManagePermissions: false
          });
          setHasAssignedPermissions(false);
          return;
        }

        // userRole e isOwner ya están definidos en el scope del componente
        
             // Verificar permisos asignados desde la base de datos
             let assignedPermissionsFound = false;
             
             // Solo consultar permisos si no es el propietario ni admin/técnico
             if (!isOwner && !['administrador', 'tecnico'].includes(userRole)) {
               try {
                 const permissionsResponse = await getInventoryPermissions(item.id);
                 const assignedPermissions = permissionsResponse.data || [];
                 
                 // Verificar si el usuario actual tiene permisos asignados
                 assignedPermissionsFound = assignedPermissions.some(permission => 
                   permission.usuario_id === currentUser.id && permission.is_deleted === 0
                 );
               } catch (error) {
                 // Solo loggear errores que no sean 403 (esperados)
                 if (error.response?.status !== 403) {
                   console.log('No se pudieron cargar permisos asignados:', error);
                 }
               }
             } else if (isOwner) {
               // El propietario siempre tiene acceso completo
               assignedPermissionsFound = true;
             }
        
             // Lógica de permisos: propietario, admin/técnico, o permisos asignados (colaborador)
             const hasFullAccess = isOwner || ['administrador', 'tecnico'].includes(userRole) || assignedPermissionsFound;
        
        setPermissions({
          canEdit: hasFullAccess,
          canUse: hasFullAccess,
          canViewHistory: hasFullAccess,
          canManagePermissions: isOwner // Solo el dueño puede gestionar permisos
        });
        
        // Actualizar el estado de permisos asignados
        setHasAssignedPermissions(assignedPermissionsFound);

        console.log('✅ Permisos verificados:', {
          isOwner,
          userRole,
          hasAssignedPermissions: assignedPermissionsFound,
          canEdit: hasFullAccess,
          canUse: hasFullAccess,
          canViewHistory: hasFullAccess
        });
      } catch (error) {
        console.error('❌ Error verificando permisos:', error);
        setPermissions({
          canEdit: false,
          canUse: false,
          canViewHistory: false,
          canManagePermissions: false
        });
        setHasAssignedPermissions(false);
      } finally {
        setLoadingPermissions(false);
      }
    };

    checkPermissions();
  }, [item.usuario_creador, item.id, currentUser?.id, currentUser?.rol]); // Incluir item.id para recargar cuando cambie

  const getStockStatusColor = (stock, minimum) => {
    if (stock === 0) return 'bg-red-100 text-red-800';
    if (stock <= minimum) return 'bg-eco-pear/30 text-eco-cape-cod';
    return 'bg-eco-mountain-meadow/20 text-eco-mountain-meadow-dark';
  };

  const getStockStatusText = (stock, minimum) => {
    if (stock === 0) return 'Agotado';
    if (stock <= minimum) return 'Stock Bajo';
    return 'Disponible';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'semillas': 'bg-eco-mountain-meadow/20 text-eco-mountain-meadow-dark',
      'fertilizantes': 'bg-eco-emerald/20 text-eco-emerald-dark',
      'herramientas': 'bg-eco-pear/30 text-eco-cape-cod',
      'sustratos': 'bg-purple-100 text-purple-800',
      'otros': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-eco-pear hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Imagen del item o ícono por defecto */}
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-eco-mountain-meadow/20 flex items-center justify-center">
              {item.imagen_url ? (
                <img 
                  src={item.imagen_url} 
                  alt={item.nombre}
                  className="w-full h-full object-cover"
                  onLoad={() => {
                    console.log('✅ Imagen cargada exitosamente:', item.imagen_url);
                  }}
                  onError={(e) => {
                    console.error('❌ Error al cargar imagen:', item.imagen_url, e);
                    // Si la imagen falla al cargar, ocultar la imagen y mostrar el ícono
                    e.target.style.display = 'none';
                    const iconDiv = e.target.parentElement.querySelector('.fallback-icon');
                    if (iconDiv) {
                      iconDiv.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div 
                className="w-full h-full flex items-center justify-center fallback-icon"
                style={{ display: item.imagen_url ? 'none' : 'flex' }}
              >
                <Package size={20} className="text-eco-mountain-meadow" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-eco-cape-cod line-clamp-2">
                {item.nombre}
              </h3>
              <p className="text-sm text-eco-cape-cod/70">
                {item.usuario_creador_nombre || 'Usuario no especificado'}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {item.descripcion && (
          <p className="text-sm text-eco-cape-cod/80 mb-4 line-clamp-2">
            {item.descripcion}
          </p>
        )}

        {/* Stock and Price */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-eco-cape-cod/70" />
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStockStatusColor(item.cantidad_stock, item.cantidad_minima)}`}>
                {getStockStatusText(item.cantidad_stock, item.cantidad_minima)}
              </span>
            </div>
            {item.precio_estimado && (
              <div className="flex items-center gap-1">
                <DollarSign size={16} className="text-eco-mountain-meadow" />
                <span className="text-sm font-semibold text-eco-mountain-meadow">
                  ${item.precio_estimado}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-eco-cape-cod/70">Stock actual:</span>
            <span className="font-medium text-eco-cape-cod">
              {item.cantidad_stock} {item.unidad_medida || 'unidades'}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-eco-cape-cod/70">Stock mínimo:</span>
            <span className="font-medium text-eco-cape-cod">
              {item.cantidad_minima} {item.unidad_medida || 'unidades'}
            </span>
          </div>
        </div>

        {/* Category and Location */}
        <div className="flex gap-2 mb-4">
          {item.categoria_nombre && (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.categoria_nombre)}`}>
              {item.categoria_nombre}
            </span>
          )}
          
          {item.ubicacion_almacen && (
            <div className="flex items-center gap-1 text-xs text-eco-cape-cod/70">
              <MapPin size={12} />
              <span>{item.ubicacion_almacen}</span>
            </div>
          )}
        </div>

        {/* Provider */}
        {item.proveedor_nombre && (
          <div className="mb-4 p-3 bg-eco-pear/10 rounded-lg">
            <p className="text-sm text-eco-cape-cod/80">
              <span className="font-medium">Proveedor:</span> {item.proveedor_nombre}
            </p>
          </div>
        )}

    {/* Actions */}
    <div className="pt-4 border-t border-eco-pear">
      {loadingPermissions ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-eco-mountain-meadow"></div>
          <span className="ml-2 text-sm text-eco-cape-cod/70">Verificando permisos...</span>
        </div>
      ) : (
        <>
          {/* Primera fila de botones */}
          <div className="flex gap-2 mb-2">
            {permissions.canEdit && onEdit && (
              <button
                onClick={onEdit}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-eco-mountain-meadow hover:bg-eco-mountain-meadow/10 rounded-lg transition-colors"
              >
                <Edit size={16} />
                Editar
              </button>
            )}
            
            {permissions.canEdit && onUpdateStock && (
              <button
                onClick={onUpdateStock}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-eco-emerald hover:bg-eco-emerald/10 rounded-lg transition-colors"
              >
                <TrendingUp size={16} />
                Stock
              </button>
            )}
          </div>
          
          {/* Segunda fila de botones */}
          <div className="flex gap-2">
            {permissions.canUse && onRecordUsage && item.cantidad_stock > 0 && (
              <button
                onClick={onRecordUsage}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-eco-pear-dark hover:bg-eco-pear/20 rounded-lg transition-colors"
              >
                <TrendingDown size={16} />
                Usar
              </button>
            )}
            
            {permissions.canViewHistory && onShowHistory && (
              <button
                onClick={onShowHistory}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <Shield size={16} />
                Historial
              </button>
            )}
            
          </div>
          
          {/* Tercera fila - Solo eliminación */}
          {permissions.canEdit && canDelete && onDelete && (isOwner || ['administrador', 'tecnico'].includes(userRole) || hasAssignedPermissions) && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={onDelete}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
                Eliminar
              </button>
            </div>
          )}
        </>
      )}
    </div>


        {/* Created date */}
        <div className="mt-3 text-xs text-eco-cape-cod/50">
          Creado: {new Date(item.created_at).toLocaleDateString()}
        </div>
      </div>

    </div>
  );
};

export default InventoryCard;
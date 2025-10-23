import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  AlertCircle, 
  CheckCircle,
  Search,
  Filter
} from 'lucide-react';
import { 
  getGardenResidents, 
  assignResidentToGarden, 
  removeResidentFromGarden 
} from '../../services/gardenResidentService';
import { getCondominiumUsers } from '../../services/userService';
import Modal from '../common/Modal';

/**
 * Componente para gestionar residentes de un huerto
 * Solo visible y funcional para administradores
 */
export default function GardenResidentManager({ gardenId, gardenName, currentUser, onResidentChange }) {
  const [residents, setResidents] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  
  // Referencias para accesibilidad
  const searchInputRef = useRef(null);
  const assignButtonRef = useRef(null);

  // Verificar que el usuario es administrador
  console.log('🔍 GardenResidentManager - Usuario actual:', currentUser);
  const userRole = currentUser?.rol || currentUser?.role;
  console.log('🔍 GardenResidentManager - Rol del usuario:', userRole);
  
  if (userRole !== 'administrador') {
    console.log('❌ GardenResidentManager - Usuario no es administrador, no renderizando');
    return null;
  }
  
  console.log('✅ GardenResidentManager - Usuario es administrador, renderizando componente');

  useEffect(() => {
    loadData();
  }, [gardenId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar residentes actuales y usuarios disponibles en paralelo
      const [residentsResponse, usersResponse] = await Promise.all([
        getGardenResidents(gardenId),
        getCondominiumUsers()
      ]);

      setResidents(residentsResponse.data || []);
      setAvailableUsers(usersResponse.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignResident = async () => {
    if (!selectedUserId) {
      setError('Selecciona un usuario para asignar');
      return;
    }

    try {
      await assignResidentToGarden(gardenId, selectedUserId);
      setShowAssignModal(false);
      setSelectedUserId('');
      setSearchQuery('');
      loadData(); // Recargar datos
      // Notificar cambio para actualizar permisos
      if (onResidentChange) {
        onResidentChange();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveResident = async (userId, userName) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar a ${userName} del huerto?`)) {
      return;
    }

    try {
      await removeResidentFromGarden(gardenId, userId);
      loadData(); // Recargar datos
      // Notificar cambio para actualizar permisos
      if (onResidentChange) {
        onResidentChange();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Filtrar usuarios disponibles (excluir los que ya están asignados)
  const assignedUserIds = residents.map(r => r.usuario_id);
  const filteredUsers = availableUsers.filter(user => 
    !assignedUserIds.includes(user.id) &&
    user.rol === 'residente' &&
    user.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-theme-secondary to-theme-tertiary dark:from-theme-primary dark:to-theme-secondary rounded-3xl shadow-strong border border-eco-pear/20 dark:border-eco-pear/30 p-8 backdrop-blur-sm">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-mountain-meadow"></div>
          <span className="ml-3 text-eco-cape-cod/80 font-medium">Cargando residentes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-theme-secondary to-theme-tertiary dark:from-theme-primary dark:to-theme-secondary rounded-3xl shadow-strong border border-eco-pear/20 dark:border-eco-pear/30 p-8 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald rounded-2xl flex items-center justify-center shadow-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-theme-primary">
              Gestión de Residentes
            </h3>
            <p className="text-theme-secondary font-medium">
              Huerto: {gardenName}
            </p>
          </div>
        </div>
        
        <button
          ref={assignButtonRef}
          onClick={() => setShowAssignModal(true)}
          className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald text-white rounded-2xl hover:from-eco-mountain-meadow-dark hover:to-eco-emerald-dark transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:ring-offset-2"
          aria-label={`Asignar residente al huerto ${gardenName}`}
          type="button"
        >
          <UserPlus size={20} aria-hidden="true" />
          Asignar Residente
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div 
          className="mb-6 p-6 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-2 border-red-200 dark:border-red-600 rounded-2xl flex items-center gap-4 shadow-lg"
          role="alert"
          aria-live="polite"
        >
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-red-800 dark:text-red-300 text-lg">Error</h4>
            <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Cerrar mensaje de error"
            type="button"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Residents List */}
      <div className="space-y-4">
        {residents.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-eco-pear/10 to-eco-emerald/10 dark:from-eco-pear/20 dark:to-eco-emerald/20 rounded-2xl border border-eco-pear/20 dark:border-eco-pear/30">
            <div className="w-16 h-16 bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-bold text-theme-primary mb-2">No hay residentes asignados</h4>
            <p className="text-theme-secondary font-medium">Asigna residentes para que puedan comentar en este huerto</p>
          </div>
        ) : (
          residents.map((resident) => (
            <div
              key={resident.usuario_id}
              className="flex items-center justify-between p-6 bg-gradient-to-r from-theme-secondary to-theme-tertiary dark:from-theme-tertiary dark:to-theme-secondary border-2 border-eco-pear/20 dark:border-eco-pear/30 rounded-2xl hover:border-eco-emerald/30 dark:hover:border-eco-emerald/50 hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">
                    {resident.nombre.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-theme-primary text-lg">{resident.nombre}</p>
                  <p className="text-theme-secondary font-medium">{resident.email}</p>
                  <p className="text-xs text-theme-secondary/70 font-medium">
                    Asignado el {new Date(resident.assigned_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                  resident.assignment_role === 'propietario' 
                    ? 'bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald text-white' 
                    : 'bg-gradient-to-r from-eco-pear/20 to-eco-emerald/20 text-eco-cape-cod border border-eco-pear/30'
                }`}>
                  {resident.assignment_role}
                </span>
                {/* Solo mostrar botón de eliminar si NO es propietario */}
                {resident.assignment_role !== 'propietario' && (
                  <button
                    onClick={() => handleRemoveResident(resident.usuario_id, resident.nombre)}
                    className="p-3 text-theme-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    aria-label={`Eliminar residente ${resident.nombre} del huerto`}
                    title="Eliminar residente"
                    type="button"
                  >
                    <UserMinus size={20} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Assignment Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald rounded-xl flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <span className="text-2xl font-bold text-theme-primary">
              Asignar Residente
            </span>
          </div>
        }
        maxWidth="max-w-md"
        ariaLabel="Modal para asignar residente al huerto"
        ariaDescribedBy="modal-description"
        initialFocusRef={searchInputRef}
      >
        <div className="space-y-6">
          <div id="modal-description" className="sr-only">
            Busca y selecciona un residente para asignar al huerto {gardenName}
          </div>
          
          <div>
            <label 
              htmlFor="resident-search"
              className="block text-lg font-bold text-theme-primary mb-3"
            >
              Buscar residente
            </label>
            <div className="relative">
              <Search 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-theme-secondary" 
                aria-hidden="true" 
              />
              <input
                ref={searchInputRef}
                id="resident-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nombre o email del residente"
                className="w-full pl-12 pr-4 py-4 border-2 border-eco-pear dark:border-eco-pear/70 rounded-2xl focus:outline-none focus:ring-4 focus:ring-eco-mountain-meadow/30 focus:border-eco-mountain-meadow bg-theme-secondary dark:bg-theme-tertiary backdrop-blur-sm text-theme-primary font-medium"
                aria-describedby="search-help"
              />
            </div>
            <div id="search-help" className="sr-only">
              Escribe el nombre o email del residente que deseas buscar
            </div>
          </div>

          <div>
            <label 
              htmlFor="resident-select"
              className="block text-lg font-bold text-theme-primary mb-3"
            >
              Seleccionar residente
            </label>
            <select
              id="resident-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-4 py-4 border-2 border-eco-pear dark:border-eco-pear/70 rounded-2xl focus:outline-none focus:ring-4 focus:ring-eco-mountain-meadow/30 focus:border-eco-mountain-meadow bg-theme-secondary dark:bg-theme-tertiary backdrop-blur-sm text-theme-primary font-medium"
              aria-describedby="select-help"
            >
              <option value="">Selecciona un residente</option>
              {filteredUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nombre} ({user.email})
                </option>
              ))}
            </select>
            <div id="select-help" className="sr-only">
              Selecciona un residente de la lista para asignar al huerto
            </div>
          </div>

          {filteredUsers.length === 0 && searchQuery && (
            <div 
              className="p-4 bg-gradient-to-r from-eco-pear/10 to-eco-emerald/10 dark:from-eco-pear/20 dark:to-eco-emerald/20 border border-eco-pear/20 dark:border-eco-pear/30 rounded-2xl"
              role="status"
              aria-live="polite"
            >
              <p className="text-theme-secondary font-medium text-center">
                No se encontraron residentes que coincidan con la búsqueda
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-6">
          <button
            onClick={() => setShowAssignModal(false)}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-eco-cape-cod/10 to-eco-cape-cod/20 dark:from-eco-cape-cod/20 dark:to-eco-cape-cod/30 text-theme-primary rounded-2xl font-bold hover:from-eco-cape-cod/20 hover:to-eco-cape-cod/30 dark:hover:from-eco-cape-cod/30 dark:hover:to-eco-cape-cod/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-eco-cape-cod focus:ring-offset-2"
            aria-label="Cancelar asignación de residente"
            type="button"
          >
            Cancelar
          </button>
          <button
            ref={assignButtonRef}
            onClick={handleAssignResident}
            disabled={!selectedUserId}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald text-white rounded-2xl font-bold hover:from-eco-mountain-meadow-dark hover:to-eco-emerald-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:ring-offset-2"
            aria-label={selectedUserId ? `Asignar residente seleccionado al huerto ${gardenName}` : "Selecciona un residente para asignar"}
            type="button"
          >
            Asignar
          </button>
        </div>
      </Modal>
    </div>
  );
}

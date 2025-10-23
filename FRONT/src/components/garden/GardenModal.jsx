import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Users, MapPin, Calendar, Plus, ArrowRight, Trash2 } from "lucide-react";
import { getPublicGardens, getPrivateGardens, joinPublicGarden, createPrivateGarden, accessGarden, deleteGarden } from "@/services/gardenService";
import { getCurrentUser } from "@/services/authService";
import { useEventContext } from "@/contexts/EventContext";
import SuccessNotification from "../common/SuccessNotification";

const GardenModal = ({ isOpen, onClose, gardenType, onGardenSelect, isDarkMode = false }) => {
  const navigate = useNavigate();
  const [gardens, setGardens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    nombre: "",
    ubicacion: "",
    descripcion: "",
    superficie: "",
    tipo: "Tierra",
    imagen_url: ""
  });
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gardenToDelete, setGardenToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const currentUser = getCurrentUser();
  const { triggerGardenRefresh } = useEventContext();

  // Debug: verificar datos del usuario
  console.log('🔍 GardenModal - Usuario actual:', {
    currentUser,
    rol: currentUser?.rol,
    role: currentUser?.role,
    id: currentUser?.id
  });


  useEffect(() => {
    if (isOpen) {
      loadGardens();
      // Resetear el estado del formulario cuando se abre el modal
      setShowCreateForm(false);
      // Resetear los datos del formulario
      setCreateFormData({
        nombre: "",
        ubicacion: "",
        descripcion: "",
        superficie: "",
        tipo: "Tierra",
        imagen_url: ""
      });
    }
  }, [isOpen, gardenType]);

  const loadGardens = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Verificar si el usuario está autenticado
      if (!currentUser) {
        setError("Debes iniciar sesión para ver los jardines");
        return;
      }
      
      let response;
      if (gardenType === "publico") {
        response = await getPublicGardens();
      } else {
        response = await getPrivateGardens(currentUser?.id);
      }
      
      // La API devuelve { success: true, data: [...], total: number }
      setGardens(response.data || []);
    } catch (err) {
      setError("Error al cargar los jardines: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGarden = async (gardenId) => {
    try {
      await joinPublicGarden(gardenId, currentUser?.id);
      
      // Guardar la selección en localStorage
      localStorage.setItem("selectedGardenId", gardenId);
      localStorage.setItem("selectedGardenType", "publico");
      
      setSuccessMessage("¡Te has unido exitosamente al jardín público! Ahora puedes participar en las actividades del jardín.");
      setShowSuccessNotification(true);
      
      // Cerrar el modal
      onClose();
      
      // Redirigir directamente a la página de comentarios del jardín
      navigate(`/comments/${gardenId}`);
    } catch (err) {
      alert("Error al unirse al jardín: " + err.message);
    }
  };

  const handleAccessGarden = async (gardenId) => {
    try {
      await accessGarden(gardenId);
      // Guardar la selección en localStorage
      localStorage.setItem("selectedGardenId", gardenId);
      localStorage.setItem("selectedGardenType", "publico");
      
      // Mostrar notificación personalizada
      setSuccessMessage("¡Acceso al jardín autorizado! Ya puedes gestionar este jardín público.");
      setShowSuccessNotification(true);
      
      // Cerrar el modal
      onClose();
      
      // Redirigir directamente a la página de comentarios del jardín
      navigate(`/comments/${gardenId}`);
    } catch (err) {
      alert("Error al acceder al jardín: " + err.message);
    }
  };

  const handleCreateGarden = async (e) => {
    e.preventDefault();
    try {
      const gardenData = {
        ...createFormData,
        propietario: currentUser?.id,
        tipo: gardenType // Agregar el tipo de jardín
      };
      
      const response = await createPrivateGarden(gardenData);
      
      // Mostrar notificación personalizada según el tipo de jardín
      if (gardenType === "publico") {
        setSuccessMessage(`¡Jardín público "${createFormData.nombre}" creado exitosamente! Los usuarios ya pueden unirse y comenzar a cultivar juntos.`);
      } else {
        setSuccessMessage(`¡Jardín privado "${createFormData.nombre}" creado exitosamente! Ya puedes comenzar a planificar tus cultivos.`);
      }
      setShowSuccessNotification(true);
      
      setShowCreateForm(false);
       setCreateFormData({
         nombre: "",
         ubicacion: "",
         descripcion: "",
         superficie: "",
         tipo: "Tierra",
         imagen_url: ""
       });
      loadGardens(); // Recargar la lista
      
      // Notificar a otros componentes que se creó un nuevo huerto
      triggerGardenRefresh();
    } catch (err) {
      alert("Error al crear el jardín: " + err.message);
    }
  };

  const handleGardenSelect = (gardenId) => {
    // Guardar la selección en localStorage
    localStorage.setItem("selectedGardenId", gardenId);
    localStorage.setItem("selectedGardenType", gardenType);
    
    // Cerrar el modal
    onClose();
    
    // Redirigir directamente a la página de comentarios del jardín
    navigate(`/comments/${gardenId}`);
  };

  const handleDeleteClick = (e, garden) => {
    e.stopPropagation(); // Evitar que se abra el jardín
    setGardenToDelete(garden);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!gardenToDelete) return;
    
    setDeleting(true);
    try {
      await deleteGarden(gardenToDelete.id);
      setSuccessMessage(`Jardín "${gardenToDelete.nombre}" eliminado exitosamente`);
      setShowSuccessNotification(true);
      
      // Recargar la lista de jardines
      await loadGardens();
      
      // Cerrar modales
      setShowDeleteModal(false);
      setGardenToDelete(null);
      
      // Refrescar el contexto
      triggerGardenRefresh();
    } catch (error) {
      console.error('Error al eliminar jardín:', error);
      alert('Error al eliminar el jardín: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setGardenToDelete(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 sm:p-6 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
          <div className="flex-1 min-w-0">
            <h2 className={`text-lg sm:text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} truncate`}>
              {gardenType === "publico" ? "Jardines Públicos" : "Mis Jardines Privados"}
            </h2>
            <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1 truncate`}>
              {gardenType === "publico" 
                ? "Explora y únete a jardines comunitarios" 
                : "Gestiona tus jardines personales"
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors flex-shrink-0`}
          >
            <X size={20} className={`sm:w-6 sm:h-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eco-mountain-meadow"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className={`${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
            </div>
          ) : (
            <>
              {/* Botón crear jardín privado */}
              {gardenType === "privado" && (
                <div className="mb-6">
                  {!showCreateForm ? (
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="w-full bg-gradient-to-r from-eco-mountain-meadow to-eco-mountain-meadow-dark text-white py-3 px-4 rounded-lg hover:from-eco-mountain-meadow-dark hover:to-eco-mountain-meadow transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Plus size={20} />
                      Crear Nuevo Jardín Privado
                    </button>
                  ) : (
                                         <form onSubmit={handleCreateGarden} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg mb-4`}>
                       <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Crear Nuevo Jardín Privado</h3>
                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <input
                          type="text"
                          placeholder="Nombre del jardín"
                          value={createFormData.nombre}
                          onChange={(e) => setCreateFormData({...createFormData, nombre: e.target.value})}
                          className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow text-sm sm:text-base ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'border-gray-300'}`}
                          required
                        />
                        <input
                          type="text"
                          placeholder="Ubicación (se usará tu ubicación asignada)"
                          value="Tu ubicación asignada"
                          disabled
                          className={`px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-400' : 'bg-gray-100 border-gray-300 text-gray-600'} cursor-not-allowed`}
                        />
                        <input
                           type="text"
                           placeholder="Superficie (ej: 25 m²)"
                           value={createFormData.superficie}
                           onChange={(e) => setCreateFormData({...createFormData, superficie: e.target.value})}
                           className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow text-sm sm:text-base ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'border-gray-300'}`}
                           required
                         />
                         <select
                           value={createFormData.tipo}
                           onChange={(e) => setCreateFormData({...createFormData, tipo: e.target.value})}
                           className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow text-sm sm:text-base ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'border-gray-300'}`}
                         >
                           <option value="Tierra">Tierra</option>
                           <option value="Hidropónico">Hidropónico</option>
                           <option value="Vertical">Vertical</option>
                         </select>
                      </div>
                      <textarea
                        placeholder="Descripción del jardín"
                        value={createFormData.descripcion}
                        onChange={(e) => setCreateFormData({...createFormData, descripcion: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow mt-4 ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'border-gray-300'}`}
                        rows="3"
                        required
                      />
                      <input
                        type="url"
                        placeholder="URL de la imagen del jardín (opcional)"
                        value={createFormData.imagen_url}
                        onChange={(e) => setCreateFormData({...createFormData, imagen_url: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow mt-4 ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'border-gray-300'}`}
                      />
                      <div className="flex gap-2 mt-4">
                        <button
                          type="submit"
                          className="bg-eco-mountain-meadow text-white px-4 py-2 rounded-lg hover:bg-eco-mountain-meadow-dark transition-colors"
                        >
                          Crear Jardín
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCreateForm(false)}
                          className={`${isDarkMode ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'} px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base`}
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Botón crear jardín público para residentes, técnicos y administradores */}
              {gardenType === "publico" && ['residente', 'tecnico', 'administrador'].includes(currentUser?.rol || currentUser?.role) && (
                <div className="mb-6">
                  {!showCreateForm ? (
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="w-full bg-gradient-to-r from-eco-mountain-meadow to-eco-mountain-meadow-dark text-white py-3 px-4 rounded-lg hover:from-eco-mountain-meadow-dark hover:to-eco-mountain-meadow transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Plus size={20} />
                      Crear Nuevo Jardín Público
                    </button>
                  ) : (
                                         <form onSubmit={handleCreateGarden} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg mb-4`}>
                       <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Crear Nuevo Jardín Público</h3>
                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <input
                          type="text"
                          placeholder="Nombre del jardín"
                          value={createFormData.nombre}
                          onChange={(e) => setCreateFormData({...createFormData, nombre: e.target.value})}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Ubicación (se usará tu ubicación asignada)"
                          value="Tu ubicación asignada"
                          disabled
                          className={`px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-400' : 'bg-gray-100 border-gray-300 text-gray-600'} cursor-not-allowed`}
                        />
                        <input
                           type="text"
                           placeholder="Superficie (ej: 25 m²)"
                           value={createFormData.superficie}
                           onChange={(e) => setCreateFormData({...createFormData, superficie: e.target.value})}
                           className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'border-gray-300'}`}
                           required
                         />
                         <select
                           value={createFormData.tipo}
                           onChange={(e) => setCreateFormData({...createFormData, tipo: e.target.value})}
                           className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'border-gray-300'}`}
                         >
                           <option value="Tierra">Tierra</option>
                           <option value="Hidropónico">Hidropónico</option>
                           <option value="Vertical">Vertical</option>
                         </select>
                      </div>
                      <textarea
                        placeholder="Descripción del jardín"
                        value={createFormData.descripcion}
                        onChange={(e) => setCreateFormData({...createFormData, descripcion: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow mt-4 ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'border-gray-300'}`}
                        rows="3"
                        required
                      />
                      <div className="flex gap-2 mt-4">
                        <button
                          type="submit"
                          className="bg-eco-mountain-meadow text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-eco-mountain-meadow-dark transition-colors text-sm sm:text-base"
                        >
                          Crear Jardín Público
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCreateForm(false)}
                          className={`${isDarkMode ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'} px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base`}
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Lista de jardines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {gardens.map((garden) => (
                  <div
                    key={garden.id}
                    className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border rounded-lg p-3 sm:p-4 hover:shadow-lg transition-shadow relative group`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} truncate`}>{garden.nombre}</h3>
                      <div className="flex items-center gap-2">
                        {/* Botón eliminar - propietarios de sus huertos + admin/técnicos de cualquier huerto */}
                        {((garden.usuario_creador === currentUser?.id) || 
                          ((currentUser?.rol || currentUser?.role) === 'administrador' || 
                           (currentUser?.rol || currentUser?.role) === 'tecnico')) && (
                          <button
                            onClick={(e) => handleDeleteClick(e, garden)}
                            className={`p-1 rounded-lg transition-colors ${
                              isDarkMode 
                                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-600' 
                                : 'text-gray-500 hover:text-gray-600 hover:bg-gray-100'
                            } opacity-0 group-hover:opacity-100`}
                            title="Eliminar jardín"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                        <ArrowRight size={16} className="text-gray-400 sm:w-5 sm:h-5" />
                      </div>
                    </div>
                    
                    {/* Área clickeable para abrir el jardín */}
                    <div 
                      className="cursor-pointer"
                      onClick={() => handleGardenSelect(garden.id)}
                    >
                    
                                         <div className="space-y-2 mb-4">
                       <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                         <MapPin size={16} />
                         <span>{garden.ubicacion_nombre || 'Ubicación no especificada'}</span>
                       </div>
                       
                       {gardenType === "publico" ? (
                         <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                           <Calendar size={16} />
                           <span>Creado: {new Date(garden.created_at).toLocaleDateString()}</span>
                         </div>
                       ) : (
                         <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                           <Calendar size={16} />
                           <span>Creado: {new Date(garden.created_at).toLocaleDateString()}</span>
                         </div>
                       )}
                       
                     </div>
                    
                    <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3 sm:mb-4 line-clamp-2`}>{garden.descripcion || 'Sin descripción'}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-3 sm:mb-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        isDarkMode 
                          ? 'bg-green-900/30 text-green-300 border border-green-700/50' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {garden.tipo}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        isDarkMode 
                          ? 'bg-blue-900/30 text-blue-300 border border-blue-700/50' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {garden.creador_nombre || 'Usuario'}
                      </span>
                    </div>
                    
                    {/* Botón de acceso para jardines públicos (administradores y técnicos) */}
                    {gardenType === "publico" && ((currentUser?.rol || currentUser?.role) === 'administrador' || (currentUser?.rol || currentUser?.role) === 'tecnico') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Solo administradores y técnicos pueden acceder directamente
                          handleAccessGarden(garden.id);
                        }}
                        className="w-full bg-eco-mountain-meadow text-white py-2 px-3 sm:px-4 rounded-lg hover:bg-eco-mountain-meadow-dark transition-colors text-xs sm:text-sm !text-white"
                      >
                        Acceder al Jardín
                      </button>
                    )}
                    
                    {/* Botón de acceso para jardines privados (propietario) */}
                    {gardenType === "privado" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGardenSelect(garden.id);
                        }}
                        className="w-full bg-eco-mountain-meadow text-white py-2 px-3 sm:px-4 rounded-lg hover:bg-eco-mountain-meadow-dark transition-colors text-xs sm:text-sm !text-white"
                      >
                        Acceder al Jardín
                      </button>
                    )}
                    
                    {gardenType === "publico" && (currentUser?.rol || currentUser?.role) === 'residente' && (
                      <div className="bg-gradient-to-r from-eco-pear/20 to-eco-emerald/20 border-2 border-eco-pear/30 rounded-2xl p-4 shadow-lg">
                        <div className="flex items-center gap-3 text-eco-cape-cod">
                          <div className="w-8 h-8 bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">ℹ️</span>
                          </div>
                          <span className="font-bold text-lg">Información Importante</span>
                        </div>
                        <p className="text-eco-cape-cod/80 mt-3 font-medium leading-relaxed"> 
                          Solo puedes comentar en jardines donde estés asignado como residente. Puedes ver todos los huertos públicos, pero para participar necesitas ser invitado por el administrador.
                        </p>
                      </div>
                    )}
                    </div> {/* Cierre del div clickeable */}
                  </div>
                ))}
              </div>
              
              {gardens.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {gardenType === "publico" 
                      ? "No hay jardines públicos disponibles en este momento." 
                      : "No tienes jardines privados. ¡Crea tu primer jardín!"
                    }
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        </div>
        </div>
      
      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Trash2 size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Eliminar Jardín
              </h3>
            </div>
            
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              ¿Estás seguro de que quieres eliminar el jardín <strong>"{gardenToDelete?.nombre}"</strong>?
              <br />
              <span className="text-red-600 dark:text-red-400 font-medium">Esta acción no se puede deshacer.</span>
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDelete}
                disabled={deleting}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } disabled:opacity-50`}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Eliminando...
                  </>
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Notificación de éxito personalizada */}
      <SuccessNotification
        isVisible={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        title="¡Jardín Creado!"
        message={successMessage}
        type="garden"
        duration={6000}
      />
    </>
  );
};

export default GardenModal;
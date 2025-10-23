import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { getCurrentUser, logout } from '@/services/authService'
import { usersAPI } from '@/services/apiService'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import SuccessNotification from '../common/SuccessNotification'

function UserProfile() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [userData, setUserData] = useState(null)
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const navigate = useNavigate()
  const { logout: authLogout } = useAuth()

  useEffect(() => {
    setMounted(true);
    loadUserProfile();
    
    // Escuchar cambios en el usuario
    const handleUserUpdate = (event) => {
      console.log('🔄 Usuario actualizado en UserProfile:', event.detail);
      setUserData(event.detail);
    };
    
    window.addEventListener('userUpdated', handleUserUpdate);
    
    return () => {
      setMounted(false);
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);

  const loadUserProfile = async () => {
    try {
      console.log('🔄 Cargando perfil del usuario...');
      // Primero intentar obtener datos completos de la API
      const response = await usersAPI.getProfile();
      console.log('📡 Respuesta de la API:', response);
      
      if (response.data && response.data.user) {
        setUserData(response.data.user);
        console.log('✅ Perfil cargado desde API:', response.data.user);
        console.log('🖼️ Imagen URL:', response.data.user.imagen_url);
      } else {
        console.log('⚠️ Respuesta de API sin datos de usuario');
        // Fallback a datos del localStorage si la API falla
        const user = getCurrentUser();
        if (user) {
          setUserData(user);
          console.log('⚠️ Usando datos del localStorage como fallback');
        }
      }
    } catch (error) {
      console.error('❌ Error al cargar perfil desde API:', error);
      console.error('❌ Detalles del error:', error.response?.data || error.message);
      // Fallback a datos del localStorage
      const user = getCurrentUser();
      if (user) {
        setUserData(user);
        console.log('⚠️ Usando datos del localStorage como fallback');
      }
    }
  };

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleViewFullProfile = () => {
    navigate("/user");
    setIsOpen(false);
  }



  const handleLogout = async () => {
    try {
      // Cerrar sesión en el servidor
      await logout();
      
      // Cerrar sesión en el contexto de autenticación
      authLogout();
      
      // Cerrar el modal
      setIsOpen(false);
      
      // Navegar a la página principal
      navigate("/");
      
      // Mostrar notificación de éxito
      setSuccessMessage("¡Sesión cerrada exitosamente! Gracias por usar EcoVertical. 👋");
      setShowSuccessNotification(true);
      
      console.log('✅ Logout completado exitosamente');
    } catch (error) {
      console.error('❌ Error durante el logout:', error);
      
      // Aún así, limpiar el estado local y navegar
      authLogout();
      setIsOpen(false);
      navigate("/");
      
      // Mostrar mensaje de error
      setSuccessMessage("Sesión cerrada localmente. Hubo un problema con el servidor.");
      setShowSuccessNotification(true);
    }
  }

  // Si no hay usuario autenticado, no mostrar el componente
  if (!userData) {
    return null;
  }

  const modalContent = isOpen && (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] animate-[fadeIn_0.2s_ease]"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-xl shadow-xl w-80 max-w-[90vw] animate-[slideIn_0.3s_ease] overflow-hidden dark:bg-gray-800 dark:text-white relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón de cierre agregado aquí */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Cerrar perfil"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="p-6 text-center border-b border-gray-200 dark:border-gray-600 pt-12">
          {userData.imagen_url ? (
            <img 
              src={userData.imagen_url} 
              alt={`Avatar de ${userData.nombre || 'usuario'}`}
              className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-4 border-gray-200"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="w-20 h-20 rounded-full bg-gradient-to-br from-eco-mountain-meadow to-eco-emerald mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold"
            style={{ display: userData.imagen_url ? 'none' : 'flex' }}
          >
            {userData.nombre ? userData.nombre.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {userData.nombre || 'Usuario'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              {userData.email || 'usuario@ejemplo.com'}
            </p>
            <p className="text-sm text-gray-700 font-medium dark:text-gray-300">
              {userData.rol || 'Usuario'}
            </p>
          </div>
        </div>
        

        <div className="py-2">
          <button 
            className="w-full flex items-center px-6 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 dark:text-gray-300 dark:hover:bg-gray-600"
            onClick={handleViewFullProfile}
          >
            <span className="mr-3">👤</span>
            Ver perfil completo
          </button>
          
          
          <button 
            className="w-full flex items-center px-6 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 dark:text-red-400 dark:hover:bg-red-900/30"
            onClick={handleLogout}
          >
            <span className="mr-3">🚪</span>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <button 
        className="p-0 rounded-full transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md"
        onClick={() => setIsOpen(true)}
        aria-label="Perfil de usuario"
      >
        {userData.imagen_url ? (
          <img 
            src={userData.imagen_url} 
            alt={`Avatar de ${userData.nombre || 'usuario'}`}
            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="w-10 h-10 rounded-full bg-gradient-to-br from-eco-mountain-meadow to-eco-emerald flex items-center justify-center text-white font-bold border-2 border-gray-200"
          style={{ display: userData.imagen_url ? 'none' : 'flex' }}
        >
          {userData.nombre ? userData.nombre.charAt(0).toUpperCase() : 'U'}
        </div>
      </button>

      {mounted && isOpen && createPortal(modalContent, document.body)}
      
      {/* Notificación de éxito personalizada */}
      <SuccessNotification
        isVisible={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        title="¡Sesión Cerrada!"
        message={successMessage}
        type="garden"
        duration={4000}
      />
    </>
  )
}

export default UserProfile
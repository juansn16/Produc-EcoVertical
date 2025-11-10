import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import UserProfile from "../user/UserProfile";
import UnifiedNotifications from "../user/UnifiedNotifications";
import SuccessNotification from "../common/SuccessNotification";
import ToggleTheme from "../common/ToggleTheme";
import { Menu, X, LogOut, User, BarChart3, ClipboardList, Store, ArrowLeft, Droplets } from 'lucide-react';
import { logout as logoutService } from "@/services/authService";
import logger from '../../utils/logger';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const Header = ({ type = "Home", onAddComment, totalItems, filteredCount, showDocumentationMenu = false, isMenuOpen: externalIsMenuOpen = false, setIsMenuOpen: externalSetIsMenuOpen = () => {} }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  
  // Usar AuthContext en lugar de estado local
  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode } = useTheme();

  // Logging para verificar el estado del usuario (solo en desarrollo)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      logger.log('🔍 Header - Estado del usuario:', { 
        user, 
        isAuthenticated, 
        userRole: user?.role,
        userId: user?.id,
        userName: user?.nombre 
      });
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setShowSuccessNotification(true);
      setSuccessMessage("Sesión cerrada exitosamente");
      setTimeout(() => {
      navigate("/");
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // HEADER SIMPLIFICADO - SIEMPRE FUNCIONAL
    return (
      <>
        <header
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            isDarkMode ? 'border-b border-gray-700' : 'border-b border-eco-cape-cod/10'
          } ${
            isScrolled
              ? isDarkMode 
                ? "bg-gray-900 shadow-soft backdrop-blur-sm" 
                : "bg-eco-scotch-mist/98 shadow-soft backdrop-blur-sm"
              : isDarkMode 
                ? "bg-gray-900 backdrop-blur-sm" 
                : "bg-eco-scotch-mist/95 backdrop-blur-sm"
          }`}
        >
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
          <div className="flex items-center justify-between py-3 sm:py-4 min-h-[64px] sm:min-h-[72px]">
            {/* Logo */}
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 sm:gap-3 text-theme-primary no-underline hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="text-2xl sm:text-3xl drop-shadow-sm">🌱</div>
              <span className="text-lg sm:text-xl md:text-2xl font-bold eco-text-gradient">
                  EcoVertical
                </span>
            </button>

            {/* Botones del usuario */}
              <div className="flex items-center gap-4">
                {isAuthenticated ? (
                  <>
                    <UnifiedNotifications />
                    <UserProfile />
                    <ToggleTheme size="default" />
                    
                    {/* Botón de menú hamburguesa - SIEMPRE VISIBLE SI ESTÁ AUTENTICADO */}
                  <button
                      onClick={() => {
                        if (process.env.NODE_ENV === 'development') {
                          logger.log('🔘 Botón clickeado!', { isMenuOpen, newValue: !isMenuOpen });
                        }
                        setIsMenuOpen(!isMenuOpen);
                      }}
                      className="bg-eco-mountain-meadow text-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-eco-mountain-meadow-dark"
                    >
                      {isMenuOpen ? (
                        <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      ) : (
                        <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      )}
                  </button>
                  </>
                ) : (
                  /* Botones para usuarios NO autenticados */
                  <>
                    <ToggleTheme size="default" />
                    <button
                        onClick={() => navigate('/login')}
                        className="px-4 py-2 text-sm font-medium text-eco-mountain-meadow-dark bg-transparent border border-eco-mountain-meadow rounded-lg hover:bg-eco-mountain-meadow hover:text-white transition-all duration-200"
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        onClick={() => navigate('/register')}
                        className="px-4 py-2 text-sm font-medium text-white bg-eco-mountain-meadow rounded-lg hover:bg-eco-mountain-meadow-dark transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        Registrarse
                    </button>
                      </>
                    )}
              </div>
            </div>
          </div>
        </header>

      {/* MENÚ DE NAVEGACIÓN - SISTEMA O DOCUMENTACIÓN */}
      {(() => {
        if (process.env.NODE_ENV === 'development') {
          logger.log('🔍 Estado del menú:', { 
            isMenuOpen, 
            isAuthenticated, 
            userRole: user?.role,
            pathname: location.pathname,
            shouldShowMenu: isMenuOpen && isAuthenticated 
          });
        }
        return isMenuOpen && isAuthenticated;
      })() && (
        <>
          {/* Overlay para cerrar el menú al hacer clic fuera */}
          <div 
            className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-sm"
            onClick={() => {
              logger.log('🔘 Cerrando menú desde overlay');
              setIsMenuOpen(false);
            }}
          />
          
          {/* Menú de navegación */}
          <div className={`fixed top-16 sm:top-20 right-2 sm:right-4 z-[9999] ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-eco-pear'} border-2 rounded-xl shadow-2xl w-72 sm:w-80 p-4 sm:p-6 max-h-[80vh] overflow-y-auto`}>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-theme-primary flex items-center gap-2">
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="hidden sm:inline">
                {location.pathname === "/select-garden" ? "Documentación" : "Menú de Navegación"}
              </span>
              <span className="sm:hidden">Menú</span>
            </h2>
            <button 
              onClick={() => {
                logger.log('🔘 Cerrando menú desde botón X');
                setIsMenuOpen(false);
              }}
              className={`p-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-eco-pear/20'} rounded-lg transition-colors`}
            >
              <X className="w-5 h-5 text-theme-primary" />
            </button>
              </div>

          <div className="space-y-2 mb-4 sm:mb-6">
            {/* MENÚ DE DOCUMENTACIÓN - Solo en /select-garden */}
            {location.pathname === "/select-garden" ? (
              <>
                <button
                  onClick={() => {
                    navigate('/frutas');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 text-left ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} rounded-lg transition-colors`}
                >
                  <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>🍎 Frutas</span>
                </button>
                
                <button
                  onClick={() => {
                    navigate('/aromaticas');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 text-left ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} rounded-lg transition-colors`}
                >
                  <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>🌿 Hierbas Aromáticas y Medicinales</span>
                </button>
                
                <button
                  onClick={() => {
                    navigate('/ornamentales');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 text-left ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} rounded-lg transition-colors`}
                >
                  <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>🌸 Hierbas Ornamentales</span>
                </button>
                
                <button
                  onClick={() => {
                    navigate('/hortalizas-hojas');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 text-left ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} rounded-lg transition-colors`}
                >
                  <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>🥬 Hortalizas de Hoja</span>
                </button>
                
                <button
                  onClick={() => {
                    navigate('/hortalizas-pequeno');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 text-left ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} rounded-lg transition-colors`}
                >
                  <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>🍅 Hortalizas de Fruto Pequeño</span>
                </button>
              </>
            ) : (
              /* MENÚ DEL SISTEMA - Para todas las demás páginas */
              <>
                <button
                  onClick={() => {
                    navigate('/user');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 text-left ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} rounded-lg transition-colors`}
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>Mi Perfil</span>
                </button>
                
                <button
                  onClick={() => {
                    navigate('/inventario');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 text-left ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} rounded-lg transition-colors`}
                >
                  <ClipboardList className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>Inventario</span>
                </button>
                
                {/* Botón de Alertas de Riego - Solo para admin/tecnico */}
                {(() => {
                  const userRole = user?.role || user?.rol;
                  const canAccessAlerts = userRole === 'administrador' || userRole === 'tecnico';
                  logger.log('Verificando acceso a alertas de riego:', { 
                    userRole, 
                    canAccessAlerts,
                    userId: user?.id 
                  });
                  return canAccessAlerts;
                })() && (
                  <button
                    onClick={() => {
                      navigate('/irrigation-alerts');
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 text-left ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} rounded-lg transition-colors`}
                  >
                    <Droplets className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>Alertas de Riego</span>
                  </button>
                )}
                
                <button
                  onClick={() => {
                    navigate('/Estadisticas');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 text-left ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} rounded-lg transition-colors`}
                >
                  <BarChart3 className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>Estadísticas</span>
                </button>
                
                <button
                  onClick={() => {
                    navigate('/proveedores');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 text-left ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} rounded-lg transition-colors`}
                >
                  <Store className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>Proveedores</span>
                </button>
                
                
                <button
                  onClick={() => {
                    navigate('/select-garden');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 text-left ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} rounded-lg transition-colors`}
                >
                  <ArrowLeft className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>Cambiar Jardín</span>
                </button>
              </>
            )}
              </div>

            </div>
          </>
      )}

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
    );
};

export default Header;
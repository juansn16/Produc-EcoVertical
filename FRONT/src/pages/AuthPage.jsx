import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SignInForm from "@/components/auth/SignInForm";
import SignUpForm from "@/components/auth/SignUpForm";
import PasswordResetModal from "@/components/auth/PasswordResetModal";
import { login as loginService, register as registerService, isAuthenticated, getCurrentUser, logout as logoutService } from "@/services/authService";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import SuccessNotification from "@/components/common/SuccessNotification";
import { LogOut } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Usar AuthContext
  const { login: contextLogin, logout: contextLogout, user: contextUser, isAuthenticated: contextIsAuthenticated } = useAuth();

  useEffect(() => {
    // Detectar la ruta actual y establecer el estado correcto
    if (location.pathname === '/login') {
      setIsLogin(true);
    } else if (location.pathname === '/register') {
      setIsLogin(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    // Verificar si el usuario ya está autenticado usando AuthContext
    if (contextIsAuthenticated && contextUser) {
      setCurrentUser(contextUser);
    } else if (isAuthenticated()) {
      const user = getCurrentUser();
      setCurrentUser(user);
    }
  }, [contextIsAuthenticated, contextUser]);

  const handleLogin = async (email, password) => {
    try {
      setIsLoading(true);
      setError("");
      
      // Validación básica en el frontend
      if (!email || !password) {
        setError("❌ Por favor, completa todos los campos.");
        setIsLoading(false);
        return;
      }
      
      if (!email.includes('@')) {
        setError("❌ Por favor, ingresa un email válido.");
        setIsLoading(false);
        return;
      }
      
      if (password.length < 6) {
        setError("❌ La contraseña debe tener al menos 6 caracteres.");
        setIsLoading(false);
        return;
      }
      
      const result = await loginService(email, password);
      
      if (result.success) {
        // Actualizar AuthContext
        contextLogin(result.token, result.user);
        
        // Mostrar notificación personalizada
        setSuccessMessage(`¡Bienvenido ${result.user.nombre}! Ya puedes comenzar a explorar los jardines de EcoVertical. 🎉`);
        setShowSuccessNotification(true);
        
        // Redirigir a la página de selección de jardín
        navigate("/select-garden", { replace: true });
      }
    } catch (err) {
      // El error ya viene procesado desde handleAPIError con mensajes específicos
      setError(err.message || "❌ Error inesperado. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (formData) => {
    try {
      setIsLoading(true);
      setError("");
      
      // Validación básica en el frontend
      if (!formData.nombre || !formData.email || !formData.password) {
        setError("❌ Por favor, completa todos los campos.");
        setIsLoading(false);
        return;
      }
      
      if (!formData.email.includes('@')) {
        setError("❌ Por favor, ingresa un email válido.");
        setIsLoading(false);
        return;
      }
      
      if (formData.password.length < 6) {
        setError("❌ La contraseña debe tener al menos 6 caracteres.");
        setIsLoading(false);
        return;
      }
      
      // Solo validar confirmPassword si existe (para registro normal, no por código de invitación)
      if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
        setError("❌ Las contraseñas no coinciden.");
        setIsLoading(false);
        return;
      }
      
      if (formData.nombre.length < 2) {
        setError("❌ El nombre debe tener al menos 2 caracteres.");
        setIsLoading(false);
        return;
      }
      
      const result = await registerService(formData);
      
      if (result.success) {
        // Actualizar AuthContext
        contextLogin(result.token, result.user);
        
        // Mostrar notificación personalizada
        setSuccessMessage(`¡Cuenta creada exitosamente ${result.user.nombre}! Bienvenido a la comunidad EcoVertical. 🎉`);
        setShowSuccessNotification(true);
        
        // Redirigir a la página de selección de jardín
        navigate("/select-garden", { replace: true });
      }
    } catch (err) {
      // El error ya viene procesado desde handleAPIError con mensajes específicos
      setError(err.message || "❌ Error inesperado. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutService();
      // Actualizar AuthContext
      contextLogout();
      setCurrentUser(null);
      setSuccessMessage("¡Sesión cerrada exitosamente! Gracias por usar EcoVertical. 👋");
      setShowSuccessNotification(true);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Forzar logout
      contextLogout();
      setCurrentUser(null);
      setSuccessMessage("Sesión cerrada");
      setShowSuccessNotification(true);
    }
  };

  const handleTabChange = (newIsLogin) => {
    if (newIsLogin !== isLogin) {
      setIsTransitioning(true);
      setTimeout(() => {
        setIsLogin(newIsLogin);
        setError(""); // Limpiar errores al cambiar
        // Navegar a la ruta correcta
        if (newIsLogin) {
          navigate('/login', { replace: true });
        } else {
          navigate('/register', { replace: true });
        }
        setTimeout(() => {
          setIsTransitioning(false);
        }, 100);
      }, 300);
    }
  };

  // Función para limpiar errores cuando el usuario interactúa con los campos
  const clearError = () => {
    if (error) {
      setError("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex pt-16 sm:pt-13">
        {/* Panel izquierdo - Información y bienvenida */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-eco-mountain-meadow via-eco-emerald to-eco-pear relative overflow-hidden">
          
          <div className="relative z-10 flex flex-col justify-center items-center text-white px-12 text-center">
            <div className="text-6xl mb-6 animate-bounce">🌱</div>
            <h1 className="text-4xl font-bold mb-6 transition-all duration-500 transform">
              {isLogin ? "¡Bienvenido de vuelta!" : "¡Únete a EcoVertical!"}
            </h1>
            <p className="text-xl mb-8 leading-relaxed transition-all duration-500">
              {isLogin 
                ? "Para mantenerse conectado con nosotros, inicie sesión con su información personal."
                : "Comienza tu viaje hacia una agricultura urbana sostenible e inteligente."
              }
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">✓</div>
                <span>Gestión inteligente de huertos</span>
              </div>
              <div className="flex items-center space-x-3 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">✓</div>
                <span>Monitoreo en tiempo real</span>
              </div>
              <div className="flex items-center space-x-3 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">✓</div>
                <span>Comunidad de agricultores urbanos</span>
              </div>
            </div>
            
            {/* Información de credenciales de prueba */}
            <div className="mt-8 p-4 bg-white/10 rounded-lg animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <p className="text-sm font-medium mb-2">💡 Credenciales de prueba:</p>
              <p className="text-xs opacity-90">juan@test.com / maria@test.com / carlos@test.com</p>
              <p className="text-xs opacity-90">Contraseña: 123456</p>
            </div>
          </div>
        </div>

        {/* Panel derecho - Formularios */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 py-16 bg-gradient-to-br from-theme-tertiary to-theme-secondary dark:from-theme-primary dark:to-theme-secondary min-h-screen">
          <div className="w-full max-w-md">
            {/* Mostrar información del usuario si ya está autenticado */}
            {currentUser && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Ya estás autenticado como {currentUser.nombre}
                    </p>
                    <p className="text-xs text-green-600">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md transition-colors"
                  >
                    <LogOut size={14} />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}

            {/* Tabs de navegación */}
            <div className="flex mb-12 bg-theme-tertiary dark:bg-theme-primary rounded-lg p-1">
              <button
                onClick={() => handleTabChange(true)}
                disabled={isLoading}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-300 transform hover:scale-105 ${
                  isLogin
                    ? "bg-theme-secondary dark:bg-theme-tertiary text-eco-mountain-meadow-dark shadow-sm"
                    : "text-theme-secondary hover:text-theme-primary"
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => handleTabChange(false)}
                disabled={isLoading}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-300 transform hover:scale-105 ${
                  !isLogin
                    ? "bg-theme-secondary dark:bg-theme-tertiary text-eco-mountain-meadow-dark shadow-sm"
                    : "text-theme-secondary hover:text-theme-primary"
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Registrarse
              </button>
            </div>

            {/* Mensaje de error mejorado */}
            {error && (
              <div className="mb-8 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-400 text-red-800 dark:text-red-200 px-4 py-4 rounded-r-lg animate-fade-in shadow-sm">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                      Error de autenticación
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Indicador de carga */}
            {isLoading && (
              <div className="mb-8 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-600 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-lg text-sm animate-fade-in text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                  <span>Procesando...</span>
                </div>
              </div>
            )}

            {/* Contenido del formulario con animación */}
            <div className={`transition-all duration-500 ${isTransitioning ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'}`}>
              {isLogin ? (
                <SignInForm 
                  onLogin={handleLogin} 
                  isLoading={isLoading} 
                  onShowPasswordReset={() => setShowPasswordReset(true)}
                  onClearError={clearError}
                />
              ) : (
                <SignUpForm 
                  onRegister={handleRegister} 
                  isLoading={isLoading} 
                  onClearError={clearError}
                />
              )}
            </div>

            {/* Información adicional */}
            <div className={`mt-12 text-center text-sm text-theme-secondary transition-all duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              {isLogin ? (
                <p>
                  ¿No tienes una cuenta?{" "}
                  <button
                    onClick={() => handleTabChange(false)}
                    disabled={isLoading}
                    className="text-eco-mountain-meadow hover:text-eco-emerald font-medium transition-colors hover:underline"
                  >
                    Regístrate aquí
                  </button>
                </p>
              ) : (
                <p>
                  ¿Ya tienes una cuenta?{" "}
                  <button
                    onClick={() => handleTabChange(true)}
                    disabled={isLoading}
                    className="text-eco-mountain-meadow hover:text-eco-emerald font-medium transition-colors hover:underline"
                  >
                    Inicia sesión aquí
                  </button>
                </p>
              )}
            </div>


            {/* Información de seguridad */}
            <div className={`mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-600 rounded-lg transition-all duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-blue-600 dark:text-blue-400">🔒</span>
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Tu seguridad es importante</span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Utilizamos encriptación de extremo a extremo para proteger tu información personal y datos de tu jardín.
              </p>
            </div>

            {/* Espaciado adicional */}
            <div className="mt-8"></div>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Modal de restablecimiento de contraseña */}
      <PasswordResetModal
        isOpen={showPasswordReset}
        onClose={() => setShowPasswordReset(false)}
      />

      {/* Notificación de éxito personalizada */}
      <SuccessNotification
        isVisible={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        title="¡Bienvenido a EcoVertical!"
        message={successMessage}
        type="garden"
        duration={5000}
      />
    </div>
  );
}

export default AuthPage;
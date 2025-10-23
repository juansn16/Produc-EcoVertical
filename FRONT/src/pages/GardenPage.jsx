import { useState } from "react"
import { useNavigate } from "react-router-dom"
import GardenSelector from "@/components/garden/GardenSelector"
import Footer from "@/components/layout/Footer"
import Header from "@/components/layout/Header"
import { Menu, X, LogOut, BookOpen, Apple, Leaf, Flower, Carrot, Cherry } from "lucide-react"
import { logout as logoutService } from "@/services/authService"
import SuccessNotification from "@/components/common/SuccessNotification"
import { useTheme } from "@/contexts/ThemeContext"

export default function GardenPage() {
  const { isDarkMode } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logoutService()
      setSuccessMessage("¡Sesión cerrada exitosamente! Gracias por usar EcoVertical. 👋")
      setShowSuccessNotification(true)
      setTimeout(() => {
        navigate("/auth", { replace: true })
      }, 2000)
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      // Forzar logout
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")
      setSuccessMessage("Sesión cerrada")
      setShowSuccessNotification(true)
      setTimeout(() => {
        navigate("/auth", { replace: true })
      }, 2000)
    }
    setIsMenuOpen(false)
  }

  const menuItems = [
    {
      title: "Frutas",
      icon: <Apple className="w-5 h-5" />,
      path: "/frutas"
    },
    {
      title: "Hierbas Aromáticas y Medicinales",
      icon: <Leaf className="w-5 h-5" />,
      path: "/aromaticas"
    },
    {
      title: "Hierbas Aromáticas y Medicinales",
      icon: <Flower className="w-5 h-5" />,
      path: "/ornamentales"
    },
    {
      title: "Hortalizas de Hoja",
      icon: <Carrot className="w-5 h-5" />,
      path: "/hortalizas-hojas"
    },
    {
      title: "Hortalizas de Fruto Pequeño",
      icon: <Cherry className="w-5 h-5" />,
      path: "/hortalizas-pequeno"
    }
  ]

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-theme-primary' : 'from-eco-scotch-mist'}`}>
      <Header 
        showDocumentationMenu={true}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />
      
      {/* Menú desplegable */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMenuOpen(false)}>
          <div 
            className={`absolute top-16 sm:top-20 right-2 sm:right-4 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-eco-pear'} border rounded-xl shadow-2xl p-4 sm:p-6 w-72 sm:w-80 max-h-[80vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className={`text-lg sm:text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-eco-cape-cod'} flex items-center gap-2`}>
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-eco-mountain-meadow" />
                <span className="hidden sm:inline">Documentación de Huerto</span>
                <span className="sm:hidden">Docs</span>
              </h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className={`p-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-eco-pear/30'} rounded-full transition-colors`}
              >
                <X className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-eco-cape-cod'}`} />
              </button>
            </div>

            <div className="space-y-2 mb-4 sm:mb-6">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    navigate(item.path)
                    setIsMenuOpen(false)
                  }}
                  className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 text-left ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-eco-pear/20'} rounded-lg transition-colors group border border-transparent ${isDarkMode ? 'hover:border-gray-600' : 'hover:border-eco-pear'}`}
                >
                  <div className="text-eco-mountain-meadow group-hover:text-eco-emerald transition-colors">
                    {item.icon}
                  </div>
                  <span className={`${isDarkMode ? 'text-gray-200' : 'text-eco-cape-cod'} font-medium text-sm sm:text-base`}>{item.title}</span>
                </button>
              ))}
            </div>

            <div className={`border-t ${isDarkMode ? 'border-gray-600' : 'border-eco-pear'} pt-3 sm:pt-4`}>
              <button
                onClick={handleLogout}
                className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 text-left ${isDarkMode ? 'hover:bg-red-900/30' : 'hover:bg-red-50'} rounded-lg transition-colors group border border-transparent ${isDarkMode ? 'hover:border-red-700/50' : 'hover:border-red-200'}`}
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 group-hover:text-red-600 transition-colors" />
                <span className="text-red-600 font-medium text-sm sm:text-base">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <GardenSelector isDarkMode={isDarkMode} />
      <Footer/>

      {/* Notificación de éxito personalizada */}
      <SuccessNotification
        isVisible={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        title="¡Sesión Cerrada!"
        message={successMessage}
        type="garden"
        duration={3000}
      />
    </div>
  )
}
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import frutasData from '../data/manualPlanta/Frutas.json';
import { Card, CardHeader, CardTitle, CardContent } from '../components/home/Card';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Menu, X, LogOut, BookOpen, Apple, Leaf, Flower, Carrot, Cherry, ArrowLeft } from "lucide-react";
import { logout as logoutService } from "@/services/authService";
import SuccessNotification from "@/components/common/SuccessNotification";

function InfoBlock({ label, value, isDarkMode = false }) {
  if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) return null;
  
  const renderValue = (val, depth = 0) => {
    if (Array.isArray(val)) {
      return (
        <ul className={`list-disc ${depth > 0 ? 'ml-4' : 'ml-5'}`}>
          {val.map((item, i) => (
            <li key={i} className="mb-1">
              {typeof item === 'object' && item !== null ? renderValue(item, depth + 1) : item}
            </li>
          ))}
        </ul>
      );
    } else if (typeof val === 'object' && val !== null) {
      return (
        <div className={`${depth > 0 ? 'ml-4' : ''}`}>
          {Object.entries(val).map(([key, val], i) => (
            <div key={i} className="mb-2">
              <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
              <div className="ml-2 mt-1">
                {renderValue(val, depth + 1)}
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      return <span>{val}</span>;
    }
  };

  return (
    <div className="mb-2">
      {label && <span className={`font-semibold ${isDarkMode ? 'text-eco-mountain-meadow-light' : 'text-eco-mountain-meadow-dark'}`}>{label}: </span>}
      {renderValue(value)}
    </div>
  );
}

function getCultivoImage(id) {
  if (id === 'fresas') return '/Fresas.jpg';
  if (id === 'tomate-cherry') return '/Tomate cherry.png';
  if (id === 'pepino') return '/Pepino pequeño.jpg';
  if (id === 'maracuya') return '/Maracuyá.jpg';
  if (id === 'guayaba-enana') return '/Guayaba.jpg';
  return '/publico_garden.jpg';
}


function FrutasPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()

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

  const guia = frutasData.guia;
  return (
    <>
      <Header 
        showDocumentationMenu={true}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />
      
      {/* Menú desplegable */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMenuOpen(false)}>
          <div 
            className="absolute top-16 sm:top-20 right-2 sm:right-4 bg-huertotech-cream/98 backdrop-blur-sm border border-eco-pear rounded-xl shadow-2xl p-4 sm:p-6 w-72 sm:w-80 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-theme-primary flex items-center gap-2">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-eco-mountain-meadow" />
                <span className="hidden sm:inline">Documentación de Huerto</span>
                <span className="sm:hidden">Docs</span>
              </h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-eco-pear/30 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-theme-primary" />
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
                  className="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 text-left hover:bg-eco-pear/20 rounded-lg transition-colors group border border-transparent hover:border-eco-pear"
                >
                  <div className="text-eco-mountain-meadow group-hover:text-eco-mountain-meadow-dark transition-colors">
                    {item.icon}
                  </div>
                  <span className="text-theme-primary font-medium text-sm sm:text-base">{item.title}</span>
                </button>
              ))}
            </div>

            <div className="border-t border-eco-pear pt-3 sm:pt-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 text-left hover:bg-red-50 rounded-lg transition-colors group border border-transparent hover:border-red-200"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 group-hover:text-red-600 transition-colors" />
                <span className="text-red-600 font-medium text-sm sm:text-base">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <main className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-green-50 via-white to-yellow-50'}`}>
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-green-500 to-yellow-500 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                <span className="text-4xl">🍎</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                {guia.titulo}
              </h1>
              <p className="text-xl sm:text-2xl text-green-100 mb-8 max-w-2xl mx-auto">
                {guia.categoria}
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <span className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">🌱 Cultivo Vertical</span>
                <span className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">💧 Riego Inteligente</span>
                <span className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">📊 Monitoreo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Back to Garden Button */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/select-garden')}
              className={`inline-flex items-center gap-2 ${isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700 hover:border-gray-500' : 'bg-white/90 text-gray-700 border-gray-200 hover:border-green-300'} backdrop-blur-sm px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Escoger Huerto</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {guia.cultivos.map((cultivo, idx) => (
              <div key={cultivo.id} className={`group relative ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden`}>
                {/* Card Header with Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={getCultivoImage(cultivo.id)}
                    alt={cultivo.nombre_comun}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white mb-1">{cultivo.nombre_comun}</h3>
                    <p className="text-green-200 text-sm italic">{cultivo.nombre_cientifico}</p>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                      <Apple className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <span className="inline-block bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald text-white text-sm font-bold px-3 py-1 rounded-full">
                      {cultivo.titulo}
                    </span>
                  </div>

                  {/* Info Sections */}
                  <div className="space-y-4">
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2 flex items-center`}>
                        <span className="text-green-500 mr-2">🌱</span>
                        Sistema de Cultivo
                      </h4>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                        <InfoBlock label="" value={cultivo.sistema_cultivo} isDarkMode={isDarkMode} />
                      </div>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2 flex items-center`}>
                        <span className="text-blue-500 mr-2">⚙️</span>
                        Manejo
                      </h4>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                        <InfoBlock label="" value={cultivo.manejo} isDarkMode={isDarkMode} />
                      </div>
                    </div>

                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2 flex items-center`}>
                        <span className="text-orange-500 mr-2">🌡️</span>
                        Condiciones Climáticas
                      </h4>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                        <InfoBlock label="" value={cultivo.condiciones_climaticas} isDarkMode={isDarkMode} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Technologies Section */}
          <div className="mt-16">
            <div className="text-center mb-8">
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Tecnologías Avanzadas</h2>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
                Descubre las herramientas y sistemas que optimizan el cultivo de frutas en espacios verticales
              </p>
            </div>

            {guia.tecnologias && (guia.tecnologias.monitoreo || guia.tecnologias.sistemas || guia.tecnologias.control_ambiental) ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {guia.tecnologias.monitoreo && (
                  <div className={`${isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'} rounded-2xl p-6 border hover:shadow-lg transition-all duration-300`}>
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-500 rounded-full p-3 mr-4">
                        <span className="text-white text-xl">📊</span>
                      </div>
                      <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-blue-800'}`}>Monitoreo</h3>
                    </div>
                    <ul className="space-y-2">
                      {guia.tecnologias.monitoreo.map((item, idx) => (
                        <li key={idx} className={`flex items-start ${isDarkMode ? 'text-gray-300' : 'text-blue-700'}`}>
                          <span className="text-blue-500 mr-2 mt-1">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {guia.tecnologias.sistemas && (
                  <div className={`${isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'} rounded-2xl p-6 border hover:shadow-lg transition-all duration-300`}>
                    <div className="flex items-center mb-4">
                      <div className="bg-green-500 rounded-full p-3 mr-4">
                        <span className="text-white text-xl">⚙️</span>
                      </div>
                      <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-green-800'}`}>Sistemas</h3>
                    </div>
                    <ul className="space-y-2">
                      {guia.tecnologias.sistemas.map((item, idx) => (
                        <li key={idx} className={`flex items-start ${isDarkMode ? 'text-gray-300' : 'text-green-700'}`}>
                          <span className="text-green-500 mr-2 mt-1">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {guia.tecnologias.control_ambiental && (
                  <div className={`${isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'} rounded-2xl p-6 border hover:shadow-lg transition-all duration-300`}>
                    <div className="flex items-center mb-4">
                      <div className="bg-orange-500 rounded-full p-3 mr-4">
                        <span className="text-white text-xl">🌡️</span>
                      </div>
                      <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-orange-800'}`}>Control Ambiental</h3>
                    </div>
                    <ul className="space-y-2">
                      {guia.tecnologias.control_ambiental.map((item, idx) => (
                        <li key={idx} className={`flex items-start ${isDarkMode ? 'text-gray-300' : 'text-orange-700'}`}>
                          <span className="text-orange-500 mr-2 mt-1">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100'} rounded-2xl p-8 max-w-md mx-auto border`}>
                  <span className="text-6xl mb-4 block">🔧</span>
                  <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Tecnologías en Desarrollo</h3>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Próximamente tendremos información detallada sobre las tecnologías disponibles.</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-16 text-center">
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-6 shadow-lg border max-w-2xl mx-auto`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                Última actualización: <span className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{guia.actualizacion}</span>
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Versión: <span className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{guia.version}</span>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Notificación de éxito personalizada */}
      <SuccessNotification
        isVisible={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        title="¡Sesión Cerrada!"
        message={successMessage}
        type="garden"
        duration={3000}
      />
    </>
  );
}

export default FrutasPage;

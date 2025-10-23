import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SuccessNotification from '../components/common/SuccessNotification';
import { 
  ArrowLeft, 
  BookOpen, 
  X, 
  Apple, 
  Leaf, 
  Flower, 
  Carrot, 
  Cherry 
} from 'lucide-react';
import aromaticasData from '../data/manualPlanta/AromáticasMedicinales.json';

function AromaticasPage() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const menuItems = [
    {
      title: "Verduras",
      icon: <Carrot className="w-5 h-5" />,
      path: "/verduras"
    },
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
  ];

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
          <div className={`fixed top-16 sm:top-20 right-2 sm:right-4 z-50 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-eco-pear'} border-2 rounded-xl shadow-2xl w-72 sm:w-80 p-4 sm:p-6 max-h-[80vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className={`text-lg sm:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-eco-cape-cod'} flex items-center gap-2`}>
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="hidden sm:inline">Menú de Documentación</span>
                <span className="sm:hidden">Menú</span>
              </h2>
              <button 
                className={`p-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-eco-pear/20'} rounded-lg transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                <X className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-eco-cape-cod'}`} />
              </button>
            </div>
            
            <div className="space-y-2 mb-4 sm:mb-6">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    navigate(item.path);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 text-left ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} rounded-lg transition-colors`}
                >
                  {item.icon}
                  <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>{item.title}</span>
                </button>
              ))}
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
                <span className="text-4xl">🌿</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                Hierbas Aromáticas y Medicinales
              </h1>
              <p className="text-xl sm:text-2xl text-green-100 mb-8 max-w-2xl mx-auto">
                Guía completa para cultivar hierbas aromáticas en tu huerto vertical
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <span className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">🌿 Aromáticas</span>
                <span className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">🌱 Medicinales</span>
                <span className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">💚 Frescas</span>
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
            {aromaticasData.guia.cultivos.map((cultivo, idx) => (
              <div key={cultivo.id} className={`group relative ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden`}>
                {/* Card Header with Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={cultivo.imagen}
                    alt={cultivo.nombre}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white mb-1">{cultivo.nombre}</h3>
                    <p className="text-green-200 text-sm italic">{cultivo.categoria}</p>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                      <span className="text-2xl">🌿</span>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm leading-relaxed`}>{cultivo.descripcion}</p>
                  </div>

                  {/* Info Sections */}
                  <div className="space-y-4">
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2 flex items-center`}>
                        <span className="text-green-500 mr-2">🌱</span>
                        Sustrato
                      </h4>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                        {cultivo.secciones.sustrato && (
                          <>
                            {cultivo.secciones.sustrato.composicion && (
                              <div><span className="font-medium">Composición:</span> {cultivo.secciones.sustrato.composicion}</div>
                            )}
                            {(cultivo.secciones.sustrato.maceta || cultivo.secciones.sustrato.retencion || cultivo.secciones.sustrato.caracteristicas) && (
                              <div><span className="font-medium">
                                {cultivo.secciones.sustrato.maceta ? 'Maceta:' : 
                                 cultivo.secciones.sustrato.retencion ? 'Retención:' : 
                                 'Características:'}
                              </span> {cultivo.secciones.sustrato.maceta || cultivo.secciones.sustrato.retencion || cultivo.secciones.sustrato.caracteristicas}</div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2 flex items-center`}>
                        <span className="text-blue-500 mr-2">🌰</span>
                        Siembra
                      </h4>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                        {cultivo.secciones.siembra && (
                          <>
                            {(cultivo.secciones.siembra.semillas || cultivo.secciones.siembra.metodo) && (
                              <div><span className="font-medium">
                                {cultivo.secciones.siembra.semillas ? 'Semillas:' : 'Método:'}
                              </span> {cultivo.secciones.siembra.semillas || cultivo.secciones.siembra.metodo}</div>
                            )}
                            {(cultivo.secciones.siembra.germinacion || cultivo.secciones.siembra.enraizamiento || cultivo.secciones.siembra.plantacion) && (
                              <div><span className="font-medium">
                                {cultivo.secciones.siembra.germinacion ? 'Germinación:' : 
                                 cultivo.secciones.siembra.enraizamiento ? 'Enraizamiento:' : 
                                 'Plantación:'}
                              </span> {cultivo.secciones.siembra.germinacion || cultivo.secciones.siembra.enraizamiento || cultivo.secciones.siembra.plantacion}</div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="border-l-4 border-cyan-500 pl-4">
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2 flex items-center`}>
                        <span className="text-cyan-500 mr-2">💧</span>
                        Riego
                      </h4>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                        {cultivo.secciones.riego && (
                          <>
                            {cultivo.secciones.riego.frecuencia && (
                              <div><span className="font-medium">Frecuencia:</span> {cultivo.secciones.riego.frecuencia}</div>
                            )}
                            {cultivo.secciones.riego.metodo && (
                              <div><span className="font-medium">Método:</span> {cultivo.secciones.riego.metodo}</div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2 flex items-center`}>
                        <span className="text-orange-500 mr-2">⚡</span>
                        Abono
                      </h4>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                        {cultivo.secciones.abono && (
                          <>
                            {(cultivo.secciones.abono.tipo || cultivo.secciones.abono.frecuencia) && (
                              <div><span className="font-medium">
                                {cultivo.secciones.abono.tipo ? 'Tipo:' : 'Frecuencia:'}
                              </span> {cultivo.secciones.abono.tipo || cultivo.secciones.abono.frecuencia}</div>
                            )}
                            {cultivo.secciones.abono.aplicacion && (
                              <div><span className="font-medium">Aplicación:</span> {cultivo.secciones.abono.aplicacion}</div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2 flex items-center`}>
                        <span className="text-purple-500 mr-2">☀️</span>
                        Cuidados
                      </h4>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                        {cultivo.secciones.cuidados && (
                          <>
                            {(cultivo.secciones.cuidados.luz || cultivo.secciones.cuidados.ubicacion || cultivo.secciones.cuidados.agua || cultivo.secciones.cuidados.plagas) && (
                              <div><span className="font-medium">
                                {cultivo.secciones.cuidados.luz ? 'Luz:' : 
                                 cultivo.secciones.cuidados.ubicacion ? 'Ubicación:' : 
                                 cultivo.secciones.cuidados.agua ? 'Agua:' : 
                                 'Plagas:'}
                              </span> {cultivo.secciones.cuidados.luz || cultivo.secciones.cuidados.ubicacion || cultivo.secciones.cuidados.agua || cultivo.secciones.cuidados.plagas}</div>
                            )}
                            {(cultivo.secciones.cuidados.plagas || cultivo.secciones.cuidados.poda) && (
                              <div><span className="font-medium">
                                {cultivo.secciones.cuidados.plagas ? 'Plagas:' : 'Poda:'}
                              </span> {cultivo.secciones.cuidados.plagas || cultivo.secciones.cuidados.poda}</div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="border-l-4 border-yellow-500 pl-4">
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2 flex items-center`}>
                        <span className="text-yellow-500 mr-2">🌾</span>
                        Cosecha
                      </h4>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                        {cultivo.secciones.cosecha && (
                          <>
                            {(cultivo.secciones.cosecha.tiempo || cultivo.secciones.cosecha.metodo) && (
                              <div><span className="font-medium">
                                {cultivo.secciones.cosecha.tiempo ? 'Tiempo:' : 'Método:'}
                              </span> {cultivo.secciones.cosecha.tiempo || cultivo.secciones.cosecha.metodo}</div>
                            )}
                            {(cultivo.secciones.cosecha.metodo || cultivo.secciones.cosecha.consejo) && (
                              <div><span className="font-medium">
                                {cultivo.secciones.cosecha.metodo ? 'Método:' : 'Consejo:'}
                              </span> {cultivo.secciones.cosecha.metodo || cultivo.secciones.cosecha.consejo}</div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Info */}
          <div className="mt-16 text-center">
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-6 shadow-lg border max-w-2xl mx-auto`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                Última actualización: <span className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Noviembre 2025</span>
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Versión: <span className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>1.0</span>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      
      {/* Notificación de éxito */}
      <SuccessNotification
        isVisible={showSuccessNotification}
        message={successMessage}
        onClose={() => setShowSuccessNotification(false)}
      />
    </div>
  );
}

export default AromaticasPage;

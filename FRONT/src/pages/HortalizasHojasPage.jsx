import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Menu, X, LogOut, BookOpen, Apple, Leaf, Flower, Carrot, Cherry, ArrowLeft, Droplets, Sun, Bug, Scissors, Calendar, Zap } from "lucide-react";
import { logout as logoutService } from "@/services/authService";
import SuccessNotification from "@/components/common/SuccessNotification";

function getHortalizaHojasImage(id) {
  if (id === 'lechuga') return '/Lechuga.jpg';
  if (id === 'espinaca') return '/Espinaca.jpg';
  if (id === 'acelga') return '/Acelga.jpg';
  if (id === 'mostaza') return '/Mostaza verde.jpg';
  return '/publico_garden.jpg';
}

function HortalizasHojasPage() {
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

  const hortalizasHojasData = [
    {
      id: 'lechuga',
      nombre: 'Lechuga (hoja corta)',
      imagen: getHortalizaHojasImage('lechuga'),
      categoria: 'Hortalizas de hoja',
      descripcion: 'Hortaliza de hoja muy popular en ensaladas y comidas frescas',
      secciones: {
        sustrato: {
          composicion: 'Utiliza un sustrato ligero y fresco, mezclado con fibra de coco. Esta combinación proporciona una buena aireación y retención de humedad, lo que es ideal para el crecimiento de la lechuga.',
          caracteristicas: 'Asegúrate de que el sustrato tenga un buen drenaje para evitar el encharcamiento, que puede causar pudrición de raíces.'
        },
        siembra: {
          profundidad: 'Siembra las semillas a una profundidad de 0.5 cm. No es necesario cubrirlas demasiado, ya que necesitan luz para germinar.',
          germinacion: 'Las semillas de lechuga germinan en un período de 4 a 7 días. Mantén el sustrato húmedo durante este tiempo para asegurar una buena germinación.'
        },
        riego: {
          frecuencia: 'Riega las plantas con 100–150 ml diarios. Es importante mantener el sustrato constantemente húmedo, pero sin llegar a encharcarlo.',
          metodo: 'Utiliza un regador con boquilla fina para evitar que las semillas o plántulas se desplacen o se dañen.'
        },
        abono: {
          frecuencia: 'Aplica abono de manera semanal utilizando té de compost. Esto proporcionará los nutrientes necesarios para un crecimiento saludable y vigoroso.',
          aplicacion: 'Diluye el té de compost en agua y aplícalo directamente en la base de las plantas.'
        },
        cuidados: {
          luz: 'La lechuga de hoja corta prefiere sombra parcial, especialmente en climas cálidos. Coloca las plantas en un lugar donde reciban luz solar directa por la mañana y sombra durante las horas más calurosas del día.',
          plagas: 'Mantén un ojo en plagas como pulgones y caracoles. Puedes usar insecticidas naturales o trampas para caracoles para controlar estas plagas.'
        },
        cosecha: {
          tiempo: 'La lechuga estará lista para la cosecha entre 30 y 45 días después de la siembra.',
          metodo: 'Corta las hojas externas de la planta, dejando las hojas interiores para que continúen creciendo. Esto permitirá que sigas cosechando durante más tiempo.'
        },
        consejos: [
          'Rotación de Cultivos: Considera rotar la lechuga con otras plantas en tu huerto vertical para mantener la salud del sustrato y prevenir enfermedades.',
          'Compatibilidad: La lechuga se lleva bien con muchas otras plantas, como el cebollín y las zanahorias, así que puedes considerar plantarlas juntas para maximizar el espacio y los beneficios.'
        ]
      }
    },
    {
      id: 'espinaca',
      nombre: 'Espinaca',
      imagen: getHortalizaHojasImage('espinaca'),
      categoria: 'Hortalizas de hoja',
      descripcion: 'Hortaliza de hoja rica en hierro y nutrientes esenciales',
      secciones: {
        sustrato: {
          composicion: 'Utiliza un sustrato rico en compost y humus. Esta mezcla proporcionará los nutrientes esenciales que la espinaca necesita para crecer de manera saludable.',
          caracteristicas: 'Asegúrate de que el sustrato tenga un buen drenaje, ya que la espinaca no tolera el exceso de agua en las raíces.'
        },
        siembra: {
          metodo: 'Siembra las semillas directamente en el sustrato. Puedes hacer surcos o agujeros a una profundidad de aproximadamente 1-2 cm.',
          germinacion: 'Las semillas de espinaca germinan en un período de 7 a 10 días. Mantén el sustrato húmedo durante este tiempo para asegurar una buena germinación.'
        },
        riego: {
          frecuencia: 'Riega las plantas con 150 ml diarios. Mantén el sustrato constantemente húmedo, pero evita el encharcamiento, que puede causar problemas de hongos y pudrición de raíces.',
          metodo: 'Utiliza un regador o una manguera con boquilla fina para aplicar el agua de manera uniforme.'
        },
        abono: {
          frecuencia: 'Aplica abono cada 15 días utilizando compost líquido. Esto ayudará a proporcionar nutrientes adicionales durante el crecimiento.',
          aplicacion: 'Diluye el compost líquido en agua y aplícalo en la base de las plantas, evitando mojar las hojas en exceso.'
        },
        cuidados: {
          plagas: 'Protege las plantas de plagas como minadores y pulgones. Puedes usar trampas adhesivas o insecticidas naturales para controlar estas plagas.',
          luz: 'La espinaca prefiere luz solar parcial. Asegúrate de que reciba al menos 4-6 horas de luz directa al día, especialmente en climas cálidos.'
        },
        cosecha: {
          tiempo: 'La espinaca estará lista para la cosecha a los 40 días después de la siembra.',
          metodo: 'Corta las hojas grandes de la planta, comenzando por las hojas exteriores. Esto permitirá que las hojas interiores continúen creciendo y que puedas cosechar durante más tiempo.'
        },
        consejos: [
          'Rotación de Cultivos: Considera rotar la espinaca con otras plantas en tu huerto vertical para mantener la salud del sustrato y prevenir enfermedades.',
          'Compatibilidad: La espinaca se lleva bien con otras plantas como el cebollín y las fresas, así que puedes considerar plantarlas juntas para maximizar el espacio y los beneficios.'
        ]
      }
    },
    {
      id: 'acelga',
      nombre: 'Acelga',
      imagen: getHortalizaHojasImage('acelga'),
      categoria: 'Hortalizas de hoja',
      descripcion: 'Hortaliza de hoja muy nutritiva y versátil en la cocina',
      secciones: {
        sustrato: {
          composicion: 'Utiliza un sustrato profundo y rico en compost. Esto proporcionará los nutrientes necesarios y espacio suficiente para que las raíces se desarrollen adecuadamente.',
          caracteristicas: 'Asegúrate de que el sustrato tenga un buen drenaje para evitar el encharcamiento, que puede afectar la salud de las raíces.'
        },
        siembra: {
          metodo: 'Siembra las semillas a una profundidad de 1–2 cm. Puedes hacer surcos o agujeros en el sustrato para colocar las semillas.',
          germinacion: 'Las semillas de acelga germinan en un período de 7 a 10 días. Mantén el sustrato húmedo durante este tiempo para asegurar una buena germinación.'
        },
        riego: {
          frecuencia: 'Riega las plantas con 200 ml cada 2 días. Es importante mantener el sustrato húmedo, pero no encharcado, para prevenir problemas de hongos.',
          metodo: 'Usa un regador o una manguera con boquilla fina para aplicar el agua de manera uniforme, evitando mojar las hojas en exceso.'
        },
        abono: {
          frecuencia: 'Aplica abono cada 15 días utilizando compost sólido. Esto ayudará a proporcionar nutrientes adicionales durante el crecimiento.',
          aplicacion: 'Mezcla el compost sólido en la superficie del sustrato, asegurándote de que no cubra las plantas.'
        },
        cuidados: {
          plagas: 'Vigila la presencia de orugas, que pueden dañar las hojas de la acelga. Puedes usar insecticidas naturales o trampas para controlar estas plagas.',
          luz: 'La acelga prefiere luz solar plena, así que colócala en un lugar donde reciba al menos 6 horas de luz directa al día.'
        },
        cosecha: {
          tiempo: 'La acelga estará lista para la cosecha a los 60 días después de la siembra.',
          metodo: 'Corta las hojas externas de la planta, dejando las hojas interiores para que continúen creciendo. Esto permitirá que sigas cosechando durante más tiempo.'
        },
        consejos: [
          'Rotación de Cultivos: Considera rotar la acelga con otras plantas en tu huerto vertical para mantener la salud del sustrato y prevenir enfermedades.',
          'Compatibilidad: La acelga se lleva bien con otras plantas como el tomate y el pimiento, así que puedes considerar plantarlas juntas para maximizar el espacio y los beneficios.'
        ]
      }
    },
    {
      id: 'mostaza',
      nombre: 'Mostaza verde',
      imagen: getHortalizaHojasImage('mostaza'),
      categoria: 'Hortalizas de hoja',
      descripcion: 'Hortaliza de hoja picante y nutritiva',
      secciones: {
        sustrato: {
          composicion: 'Utiliza un sustrato fresco, mezclado con compost. Esta combinación proporciona un ambiente nutritivo y aireado, ideal para el crecimiento de la mostaza verde.',
          caracteristicas: 'Asegúrate de que el sustrato tenga un buen drenaje para evitar el encharcamiento, lo cual puede afectar el desarrollo de las raíces.'
        },
        siembra: {
          metodo: 'Siembra las semillas a una profundidad de 1 cm. Puedes hacer surcos o agujeros en el sustrato para colocar las semillas.',
          germinacion: 'Las semillas de mostaza verde germinan en un período de 4 a 6 días. Mantén el sustrato húmedo durante este tiempo para asegurar una buena germinación.'
        },
        riego: {
          frecuencia: 'Riega las plantas con 150 ml diarios. Es importante mantener el sustrato constantemente húmedo, pero sin llegar a encharcarlo.',
          metodo: 'Utiliza un regador o una manguera con boquilla fina para aplicar el agua de manera uniforme.'
        },
        abono: {
          frecuencia: 'Aplica abono de manera semanal utilizando agua de arroz. Este líquido es rico en nutrientes y ayudará a fomentar un crecimiento saludable.',
          aplicacion: 'Diluye el agua de arroz en agua fresca y aplícalo en la base de las plantas.'
        },
        cuidados: {
          plagas: 'Vigila la presencia de pulgones, que pueden afectar las hojas. Puedes usar insecticidas naturales o jabones insecticidas para controlar estas plagas.',
          luz: 'La mostaza verde prefiere luz solar plena, así que colócala en un lugar donde reciba al menos 6 horas de luz directa al día.'
        },
        cosecha: {
          tiempo: 'La mostaza verde estará lista para la cosecha a los 30 días después de la siembra.',
          metodo: 'Corta las hojas tiernas de la planta, comenzando por las hojas exteriores. Esto permitirá que las hojas interiores continúen creciendo y que puedas seguir cosechando durante más tiempo.'
        },
        consejos: [
          'Rotación de Cultivos: Considera rotar la mostaza verde con otras plantas en tu huerto vertical para mantener la salud del sustrato y prevenir enfermedades.',
          'Compatibilidad: La mostaza verde se lleva bien con otras plantas como el rábano y el brócoli, así que puedes considerar plantarlas juntas para maximizar el espacio y los beneficios.'
        ]
      }
    }
  ];

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
      title: "Plantas Ornamentales",
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
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-eco-scotch-mist via-white to-eco-pear/10'}`}>
      <Header type="Documentación" />
      
      {/* Menú de navegación */}
      {isMenuOpen && (
        <>
          <div 
            className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          ></div>
          <div className={`fixed top-16 sm:top-20 right-2 sm:right-4 z-[9999] ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-eco-pear'} border-2 rounded-xl shadow-2xl w-72 sm:w-80 p-4 sm:p-6 max-h-[80vh] overflow-y-auto`}>
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
        </>
      )}

      <main className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-green-50 via-white to-yellow-50'}`}>
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-green-500 to-yellow-500 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                <span className="text-4xl">🥬</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                Hortalizas de Hoja
              </h1>
              <p className="text-xl sm:text-2xl text-green-100 mb-8 max-w-2xl mx-auto">
                Guía completa para cultivar hortalizas de hoja en tu huerto vertical
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <span className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">🥬 Frescas</span>
                <span className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">🌱 Nutritivas</span>
                <span className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">💚 Saludables</span>
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
            {hortalizasHojasData.map((cultivo, idx) => (
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
                      <span className="text-2xl">🥬</span>
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
                            {cultivo.secciones.sustrato.caracteristicas && (
                              <div><span className="font-medium">Características:</span> {cultivo.secciones.sustrato.caracteristicas}</div>
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
                            {(cultivo.secciones.siembra.profundidad || cultivo.secciones.siembra.metodo) && (
                              <div><span className="font-medium">
                                {cultivo.secciones.siembra.profundidad ? 'Profundidad:' : 'Método:'}
                              </span> {cultivo.secciones.siembra.profundidad || cultivo.secciones.siembra.metodo}</div>
                            )}
                            {cultivo.secciones.siembra.germinacion && (
                              <div><span className="font-medium">Germinación:</span> {cultivo.secciones.siembra.germinacion}</div>
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
                            {cultivo.secciones.abono.frecuencia && (
                              <div><span className="font-medium">Frecuencia:</span> {cultivo.secciones.abono.frecuencia}</div>
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
                            {(cultivo.secciones.cuidados.luz || cultivo.secciones.cuidados.plagas) && (
                              <div><span className="font-medium">
                                {cultivo.secciones.cuidados.luz ? 'Luz:' : 'Plagas:'}
                              </span> {cultivo.secciones.cuidados.luz || cultivo.secciones.cuidados.plagas}</div>
                            )}
                            {(cultivo.secciones.cuidados.plagas || cultivo.secciones.cuidados.luz) && (
                              <div><span className="font-medium">
                                {cultivo.secciones.cuidados.plagas ? 'Plagas:' : 'Luz:'}
                              </span> {cultivo.secciones.cuidados.plagas || cultivo.secciones.cuidados.luz}</div>
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
                            {cultivo.secciones.cosecha.tiempo && (
                              <div><span className="font-medium">Tiempo:</span> {cultivo.secciones.cosecha.tiempo}</div>
                            )}
                            {cultivo.secciones.cosecha.metodo && (
                              <div><span className="font-medium">Método:</span> {cultivo.secciones.cosecha.metodo}</div>
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

export default HortalizasHojasPage;
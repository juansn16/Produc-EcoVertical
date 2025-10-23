import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
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
      <span className={`font-semibold ${isDarkMode ? 'text-eco-mountain-meadow' : 'text-eco-mountain-meadow-dark'}`}>{label}: </span>
      {renderValue(value)}
    </div>
  );
}

function getCultivoImage(id) {
  if (id === 'tomate-cherry') return '/Tomate cherry.png';
  if (id === 'pimiento') return '/Pimientos.jpg';
  if (id === 'berenjena') return '/Berenjena.jpg';
  if (id === 'pepino') return '/Pepino pequeño.jpg';
  if (id === 'frijol') return '/Frijol enredador.jpg';
  return '/publico_garden.jpg';
}

const hortalizasPequeñoData = {
  guia: {
    titulo: "Hortalizas de Fruto Pequeño",
    categoria: "Vegetales de Fruto",
    cultivos: [
      {
        id: 'tomate-cherry',
        nombre_comun: 'Tomates cherry',
        nombre_cientifico: 'Solanum lycopersicum var. cerasiforme',
        descripcion: 'Variedad de tomate de fruto pequeño, dulce y aromático, ideal para ensaladas y aperitivos.',
        sustrato: {
          composicion: 'Utiliza un sustrato rico en compost. Esto proporcionará los nutrientes necesarios para el crecimiento saludable de los tomates.',
          maceta: 'Asegúrate de usar una maceta de mínimo 25 cm de profundidad para permitir un buen desarrollo de las raíces.'
        },
        siembra: {
          metodo: 'Siembra las semillas en un semillero. Cuando las plántulas alcancen una altura de 15 cm, realiza el trasplante a la maceta definitiva.',
          espaciado: 'Asegúrate de dejar suficiente espacio entre las plántulas para permitir un buen flujo de aire y crecimiento.'
        },
        riego: {
          frecuencia: 'Riega las plantas con 300 ml cada 2 días. Es importante mantener el sustrato húmedo, pero evita el encharcamiento, que puede causar problemas de pudrición de raíces.',
          metodo: 'Usa un regador o una manguera con boquilla fina para aplicar el agua de manera uniforme, asegurando que llegue a las raíces.'
        },
        abono: {
          frecuencia: 'Aplica abono cada 10 días utilizando una mezcla de compost y cáscara de plátano. La cáscara de plátano es rica en potasio, lo que favorece la producción de frutos.',
          aplicacion: 'Mezcla el compost y las cáscaras en la superficie del sustrato, asegurándote de que estén bien integrados.'
        },
        cuidados: {
          poda: 'Es importante podar los brotes laterales para fomentar un crecimiento más fuerte y una mejor producción de frutos. Esto también ayuda a mejorar la circulación de aire.',
          soporte: 'Proporciona soporte con guías (como estacas o jaulas) para ayudar a las plantas a crecer verticalmente y evitar que se rompan bajo el peso de los frutos.'
        },
        cosecha: {
          tiempo: 'Los tomates cherry estarán listos para la cosecha entre 60 y 80 días después de la siembra.',
          metodo: 'Cosecha los frutos rojos cuando estén completamente maduros. Puedes recogerlos a medida que vayan alcanzando su color característico.'
        },
        consejos: [
          'Rotación de Cultivos: Considera rotar los tomates cherry con otras plantas en tu huerto vertical para mantener la salud del sustrato y prevenir enfermedades.',
          'Compatibilidad: Los tomates cherry se llevan bien con plantas como albahaca y cebollín, así que puedes considerar plantarlas juntas para maximizar el espacio y los beneficios.'
        ]
      },
      {
        id: 'pimiento',
        nombre_comun: 'Pimientos (ají, morrón pequeño)',
        nombre_cientifico: 'Capsicum annuum',
        descripcion: 'Planta de la familia Solanaceae, cultivada por sus frutos de diferentes colores y sabores.',
        sustrato: {
          composicion: 'Utiliza un sustrato fértil, rico en compost. Esto asegurará que las plantas tengan acceso a los nutrientes necesarios para un crecimiento saludable.',
          caracteristicas: 'Asegúrate de que el sustrato tenga un buen drenaje para evitar el encharcamiento, lo cual puede afectar la salud de las raíces.'
        },
        siembra: {
          metodo: 'Siembra las semillas en un semillero. Cuando las plántulas alcancen una altura de 15 cm, realiza el trasplante a la maceta definitiva.',
          espaciado: 'Deja suficiente espacio entre las plántulas para permitir un buen flujo de aire y crecimiento.'
        },
        riego: {
          frecuencia: 'Riega las plantas con 200 ml cada 2–3 días. Es importante mantener el sustrato húmedo, pero evita el encharcamiento.',
          metodo: 'Usa un regador o una manguera con boquilla fina para aplicar el agua de manera uniforme en la base de las plantas.'
        },
        abono: {
          frecuencia: 'Aplica abono cada 15 días utilizando una mezcla de compost y ceniza. La ceniza aporta potasio y ayuda a fortalecer las plantas.',
          aplicacion: 'Mezcla el compost y la ceniza en la superficie del sustrato, asegurándote de que estén bien integrados.'
        },
        cuidados: {
          plagas: 'Protege las plantas de pulgones y trips, que pueden dañar las hojas y los frutos. Puedes usar insecticidas naturales o trampas adhesivas para controlar estas plagas.',
          luz: 'Los pimientos prefieren luz solar plena, así que colócalos en un lugar donde reciban al menos 6 horas de luz directa al día.'
        },
        cosecha: {
          tiempo: 'Los pimientos estarán listos para la cosecha entre 80 y 100 días después de la siembra.',
          metodo: 'Cosecha los pimientos cuando hayan alcanzado su tamaño y color característicos. Puedes recogerlos a medida que maduran.'
        },
        consejos: [
          'Rotación de Cultivos: Considera rotar los pimientos con otras plantas en tu huerto vertical para mantener la salud del sustrato y prevenir enfermedades.',
          'Compatibilidad: Los pimientos se llevan bien con plantas como tomates y albahaca, así que puedes considerar plantarlas juntas para maximizar el espacio y los beneficios.'
        ]
      },
      {
        id: 'berenjena',
        nombre_comun: 'Berenjena',
        nombre_cientifico: 'Solanum melongena',
        descripcion: 'Planta de la familia Solanaceae, cultivada por sus frutos morados y carnosos.',
        sustrato: {
          composicion: 'Utiliza un sustrato profundo (mínimo 30 cm) y rico en compost. Esto permitirá un buen desarrollo de las raíces y proporcionará los nutrientes necesarios.',
          caracteristicas: 'Asegúrate de que el sustrato tenga un buen drenaje para evitar problemas de pudrición de raíces.'
        },
        siembra: {
          metodo: 'Siembra las semillas en un semillero. Cuando las plántulas alcancen una altura de 15 cm, realiza el trasplante a la maceta definitiva.',
          espaciado: 'Deja suficiente espacio entre las plántulas para permitir un buen flujo de aire y crecimiento.'
        },
        riego: {
          frecuencia: 'Riega las plantas con 250 ml cada 2 días. Mantén el sustrato húmedo, pero evita el encharcamiento, que puede afectar la salud de las raíces.',
          metodo: 'Usa un regador o una manguera con boquilla fina para aplicar el agua de manera uniforme.'
        },
        abono: {
          frecuencia: 'Aplica abono cada 15 días utilizando una mezcla de compost y calcio. El calcio es esencial para prevenir problemas como la pudrición apical.',
          aplicacion: 'Mezcla el compost y el calcio en la superficie del sustrato, asegurándote de que estén bien integrados.'
        },
        cuidados: {
          plagas: 'Vigila la presencia de escarabajos y ácaros, que pueden dañar las hojas y los frutos. Puedes usar insecticidas naturales o trampas adhesivas para controlar estas plagas.',
          luz: 'Las berenjenas prefieren luz solar plena, así que colócalas en un lugar donde reciban al menos 6 horas de luz directa al día.'
        },
        cosecha: {
          tiempo: 'Las berenjenas estarán listas para la cosecha a los 100 días después de la siembra.',
          metodo: 'Cosecha los frutos brillantes cuando estén firmes y de color intenso. Utiliza tijeras o un cuchillo para cortar los frutos, evitando dañar la planta.'
        },
        consejos: [
          'Rotación de Cultivos: Considera rotar las berenjenas con otras plantas en tu huerto vertical para mantener la salud del sustrato y prevenir enfermedades.',
          'Compatibilidad: Las berenjenas se llevan bien con plantas como albahaca y pimientos, así que puedes considerar plantarlas juntas para maximizar el espacio y los beneficios.'
        ]
      },
      {
        id: 'pepino',
        nombre_comun: 'Pepino pequeño',
        nombre_cientifico: 'Cucumis sativus',
        descripcion: 'Planta trepadora de la familia Cucurbitaceae, cultivada por sus frutos frescos y crujientes.',
        sustrato: {
          composicion: 'Utiliza un sustrato fresco y con drenaje alto. Esto es fundamental para evitar el encharcamiento, que puede perjudicar las raíces.',
          caracteristicas: 'Asegúrate de que el sustrato esté bien aireado y contenga materia orgánica para favorecer el crecimiento.'
        },
        siembra: {
          metodo: 'Siembra directamente en la maceta o en el suelo, colocando 2 semillas por hueco. Esto asegura que al menos una de las semillas germine.',
          profundidad: 'Siembra las semillas a una profundidad de aproximadamente 2-3 cm.'
        },
        riego: {
          frecuencia: 'Riega las plantas con 250–300 ml diarios. Los pepinos requieren un suministro constante de agua para crecer adecuadamente.',
          metodo: 'Utiliza un regador o una manguera con boquilla fina para aplicar el agua de manera uniforme alrededor de las raíces.'
        },
        abono: {
          frecuencia: 'Aplica compost líquido de manera semanal. Esto proporcionará los nutrientes necesarios para un crecimiento saludable.',
          aplicacion: 'Dilúyelo según las instrucciones del fabricante y aplica directamente en la base de las plantas.'
        },
        cuidados: {
          guia: 'Proporciona soporte utilizando una malla para guiar el crecimiento vertical de los pepinos. Esto ayuda a maximizar el espacio y mejora la circulación de aire.',
          hongos: 'Para prevenir hongos, puedes utilizar bicarbonato de sodio diluido en agua como un fungicida natural. Aplica una solución cada 2 semanas en las hojas.'
        },
        cosecha: {
          tiempo: 'Los pepinos estarán listos para la cosecha entre 45 y 60 días después de la siembra.',
          metodo: 'Cosecha los pepinos cuando estén firmes y de tamaño adecuado. Utiliza tijeras o un cuchillo para cortar los frutos, evitando dañar la planta.'
        },
        consejos: [
          'Rotación de Cultivos: Considera rotar los pepinos con otras plantas en tu huerto vertical para mantener la salud del sustrato y prevenir enfermedades.',
          'Compatibilidad: Los pepinos se llevan bien con plantas como maíz y frijoles, así que puedes considerar plantarlas juntas para maximizar el espacio y los beneficios.'
        ]
      },
      {
        id: 'frijol',
        nombre_comun: 'Frijol enredador',
        nombre_cientifico: 'Phaseolus vulgaris',
        descripcion: 'Planta trepadora de la familia Fabaceae, cultivada por sus vainas tiernas y nutritivas.',
        sustrato: {
          composicion: 'Utiliza un sustrato ligero y con poca cantidad de abono. Esto ayudará a que las raíces se desarrollen adecuadamente sin saturarse de nutrientes.',
          caracteristicas: 'Asegúrate de que el sustrato tenga un buen drenaje para evitar problemas de pudrición de raíces.'
        },
        siembra: {
          metodo: 'Siembra directamente en el suelo o en macetas, colocando 2 semillas juntas en cada hueco. Esto aumenta las posibilidades de germinación.',
          profundidad: 'Siembra las semillas a una profundidad de aproximadamente 5 cm.'
        },
        riego: {
          frecuencia: 'Riega las plantas con 200 ml cada 2 días. Mantén el sustrato húmedo, pero evita el encharcamiento.',
          metodo: 'Usa un regador o una manguera con boquilla fina para aplicar el agua de manera uniforme.'
        },
        abono: {
          frecuencia: 'Aplica poco abono de manera mensual utilizando compost. Esto es suficiente para proporcionar los nutrientes necesarios sin sobrecargar el sustrato.',
          aplicacion: 'Mezcla el compost en la superficie del sustrato, asegurándote de que esté bien integrado.'
        },
        cuidados: {
          soporte: 'Proporciona una malla o guía vertical para que los frijoles puedan enredarse y crecer hacia arriba. Esto maximiza el espacio y mejora la circulación de aire.',
          plagas: 'Vigila la presencia de plagas, como pulgones o escarabajos, y utiliza métodos naturales de control si es necesario.'
        },
        cosecha: {
          tiempo: 'Los frijoles estarán listos para la cosecha a los 60 días después de la siembra.',
          metodo: 'Cosecha las vainas tiernas cuando estén firmes y aún verdes. Utiliza tijeras o un cuchillo para cortar las vainas, evitando dañar la planta.'
        },
        consejos: [
          'Rotación de Cultivos: Considera rotar los frijoles con otras plantas en tu huerto vertical para mantener la salud del sustrato y prevenir enfermedades.',
          'Compatibilidad: Los frijoles enredadores se llevan bien con plantas como maíz y calabazas, así que puedes considerar plantarlas juntas para maximizar el espacio y los beneficios.'
        ]
      }
    ]
  }
};

function HortalizasPequeñoPage() {
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

  const guia = hortalizasPequeñoData.guia;
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
            className={`absolute top-16 sm:top-20 right-2 sm:right-4 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-huertotech-cream/98 border-eco-pear'} backdrop-blur-sm border rounded-xl shadow-2xl p-4 sm:p-6 w-72 sm:w-80 max-h-[80vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-eco-cape-cod'} flex items-center gap-2`}>
                <BookOpen className={`w-6 h-6 ${isDarkMode ? 'text-eco-mountain-meadow' : 'text-eco-mountain-meadow'}`} />
                Documentación de Huerto
              </h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className={`p-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-eco-pear/30'} rounded-full transition-colors`}
              >
                <X className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-eco-cape-cod'}`} />
              </button>
            </div>

            <div className="space-y-2 mb-6">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    navigate(item.path)
                    setIsMenuOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 p-3 text-left ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-eco-pear/20'} rounded-lg transition-colors group border border-transparent ${isDarkMode ? 'hover:border-gray-600' : 'hover:border-eco-pear'}`}
                >
                  <div className={`${isDarkMode ? 'text-eco-mountain-meadow' : 'text-eco-mountain-meadow'} group-hover:${isDarkMode ? 'text-eco-mountain-meadow' : 'text-eco-mountain-meadow-dark'} transition-colors`}>
                    {item.icon}
                  </div>
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-eco-cape-cod'} font-medium`}>{item.title}</span>
                </button>
              ))}
            </div>

            <div className={`border-t ${isDarkMode ? 'border-gray-600' : 'border-eco-pear'} pt-4`}>
              <button
                onClick={handleLogout}
                className={`w-full flex items-center gap-3 p-3 text-left ${isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50'} rounded-lg transition-colors group border border-transparent ${isDarkMode ? 'hover:border-red-800' : 'hover:border-red-200'}`}
              >
                <LogOut className="w-5 h-5 text-red-500 group-hover:text-red-600 transition-colors" />
                <span className="text-red-600 font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <main className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 via-white to-red-50'}`}>
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-orange-500 to-red-500 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                <span className="text-4xl">🍅</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                {guia.titulo}
              </h1>
              <p className="text-xl sm:text-2xl text-orange-100 mb-8 max-w-2xl mx-auto">
                {guia.categoria}
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <span className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">🍅 Frutos Pequeños</span>
                <span className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">🌶️ Picantes</span>
                <span className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">🥒 Frescos</span>
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
              className={`inline-flex items-center gap-2 ${isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700 hover:border-gray-500' : 'bg-white/90 text-gray-700 border-gray-200 hover:border-orange-300'} backdrop-blur-sm px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border`}
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
                    <p className="text-orange-200 text-sm italic">{cultivo.nombre_cientifico}</p>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                      <span className="text-2xl">🍅</span>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <span className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {cultivo.descripcion}
                    </span>
                  </div>

                  {/* Info Sections */}
                  <div className="space-y-4">
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2 flex items-center`}>
                        <span className="text-green-500 mr-2">🌱</span>
                        Siembra
                      </h4>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                        {cultivo.siembra && (
                          <>
                            {cultivo.siembra.metodo && (
                              <div><span className="font-medium">Método:</span> {cultivo.siembra.metodo}</div>
                            )}
                            {cultivo.siembra.espaciado && (
                              <div><span className="font-medium">Espaciado:</span> {cultivo.siembra.espaciado}</div>
                            )}
                            {cultivo.siembra.profundidad && (
                              <div><span className="font-medium">Profundidad:</span> {cultivo.siembra.profundidad}</div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2 flex items-center`}>
                        <span className="text-blue-500 mr-2">💧</span>
                        Cuidados
                      </h4>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                        {cultivo.cuidados && (
                          <>
                            {cultivo.cuidados.poda && (
                              <div><span className="font-medium">Poda:</span> {cultivo.cuidados.poda}</div>
                            )}
                            {cultivo.cuidados.soporte && (
                              <div><span className="font-medium">Soporte:</span> {cultivo.cuidados.soporte}</div>
                            )}
                            {cultivo.cuidados.plagas && (
                              <div><span className="font-medium">Plagas:</span> {cultivo.cuidados.plagas}</div>
                            )}
                            {cultivo.cuidados.luz && (
                              <div><span className="font-medium">Luz:</span> {cultivo.cuidados.luz}</div>
                            )}
                            {cultivo.cuidados.guia && (
                              <div><span className="font-medium">Guía:</span> {cultivo.cuidados.guia}</div>
                            )}
                            {cultivo.cuidados.hongos && (
                              <div><span className="font-medium">Hongos:</span> {cultivo.cuidados.hongos}</div>
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
                        {cultivo.cosecha && (
                          <>
                            {cultivo.cosecha.tiempo && (
                              <div><span className="font-medium">Tiempo:</span> {cultivo.cosecha.tiempo}</div>
                            )}
                            {cultivo.cosecha.metodo && (
                              <div><span className="font-medium">Método:</span> {cultivo.cosecha.metodo}</div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="border-l-4 border-red-500 pl-4">
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2 flex items-center`}>
                        <span className="text-red-500 mr-2">⚠️</span>
                        Cuidados Especiales
                      </h4>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                        {cultivo.cuidados && (
                          <>
                            {cultivo.cuidados.poda && (
                              <div><span className="font-medium">Poda:</span> {cultivo.cuidados.poda}</div>
                            )}
                            {cultivo.cuidados.soporte && (
                              <div><span className="font-medium">Soporte:</span> {cultivo.cuidados.soporte}</div>
                            )}
                            {cultivo.cuidados.plagas && (
                              <div><span className="font-medium">Plagas:</span> {cultivo.cuidados.plagas}</div>
                            )}
                            {cultivo.cuidados.luz && (
                              <div><span className="font-medium">Luz:</span> {cultivo.cuidados.luz}</div>
                            )}
                            {cultivo.cuidados.guia && (
                              <div><span className="font-medium">Guía:</span> {cultivo.cuidados.guia}</div>
                            )}
                            {cultivo.cuidados.hongos && (
                              <div><span className="font-medium">Hongos:</span> {cultivo.cuidados.hongos}</div>
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

export default HortalizasPequeñoPage;


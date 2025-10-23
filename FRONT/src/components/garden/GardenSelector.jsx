import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/home/Card"
import GardenModal from "./GardenModal"
import SuccessNotification from "../common/SuccessNotification"

export default function GardenSelector({ isDarkMode = false }) {
  const [hoveredCard, setHoveredCard] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedGardenType, setSelectedGardenType] = useState(null)
  const [flag, setFlag] = useState(true)
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const navigate = useNavigate()

  const gardenTypes = {
    privado: {
      title: "PRIVADO",
      image: "/privado_garden.jpg",
      imageAlt: "Huerto privado interior",
      info: {
        title: "Huerto Privado",
        description: "Perfecto para espacios interiores y controlados",
        features: [
          "Control total del ambiente",
          "Protección contra plagas",
          "Cultivo durante todo el año",
          "Menor consumo de agua",
          "Fácil mantenimiento",
        ],
      },
    },
    publico: {
      title: "PÚBLICO",
      image: "/publico_garden.jpg",
      imageAlt: "Huerto público exterior",
      info: {
        title: "Huerto Público",
        description: "Ideal para espacios comunitarios y exteriores",
        features: [
          "Mayor espacio de cultivo",
          "Interacción con la comunidad",
          "Aprovecha luz solar natural",
          "Biodiversidad natural",
          "Educación ambiental",
        ],
      },
    },
  }

  const handleCardClick = (gardenType) => {
    setSelectedGardenType(gardenType)
    setModalOpen(true)
  }

  const handleGardenSelect = (gardenId, gardenType) => {
    // Guardar la selección en localStorage para uso posterior
    localStorage.setItem("selectedGardenId", gardenId)
    localStorage.setItem("selectedGardenType", gardenType)

    // Cerrar el modal
    setModalOpen(false)

    // Mostrar notificación personalizada
    setSuccessMessage("¡Jardín seleccionado exitosamente! Ya puedes comenzar a gestionar tus cultivos y actividades.")
    setShowSuccessNotification(true)

    // Redirigir a la página del usuario
    navigate("/user")
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedGardenType(null)
  }

  return (
    <>
      <div className={`min-h-screen py-8 px-4 ${isDarkMode ? 'bg-theme-primary' : ''}`}>
        <div className="max-w-6xl mx-auto">
          {/* Título principal */}
          <div className="text-center mb-12 mt-14">
            <h1 className={`text-2xl md:text-3xl lg:text-4xl font-bold leading-tight ${isDarkMode ? 'text-green-400' : 'huertotech-text-gradient'}`}>
              ESCOGE UN TIPO DE HUERTO
              <br />
              QUE QUIERAS VER
            </h1>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-4 text-lg`}>
              Selecciona entre jardines públicos comunitarios o crea tu propio jardín privado
            </p>
          </div>

          {/* Cards container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 max-w-4xl mx-auto">
            {/* Card Privado */}
            {flag && (<div className="relative">
              <Card
                className={`group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-stone-400'} border-4 rounded-3xl overflow-hidden`}
                onMouseEnter={() => setHoveredCard("privado")}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleCardClick("privado")}
              >
                <CardContent className="p-0 relative">
                  {/* Título */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <h2 className={`text-xl md:text-2xl font-bold text-green-700 ${isDarkMode ? 'bg-gray-700' : 'bg-white'} px-4 py-2 rounded-lg shadow-md`}>
                      {gardenTypes.privado.title}
                    </h2>
                  </div>

                  {/* Imagen */}
                  <div className="aspect-square relative overflow-hidden">
                    <div
                      className="w-full h-full bg-cover bg-center bg-no-repeat"
                      style={{
                        backgroundImage: `url(${gardenTypes.privado.image})`,
                        backgroundPosition: "25% center",
                      }}
                    />
                  </div>

                  {/* Información hover */}
                  {hoveredCard === "privado" && (
                    <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center p-6 transition-all duration-300">
                      <div className="text-white text-center max-w-sm">
                        <h3 className="text-xl md:text-2xl font-bold mb-3 text-green-400">
                          {gardenTypes.privado.info.title}
                        </h3>
                        <p className="text-sm md:text-base mb-4 text-gray-200">{gardenTypes.privado.info.description}</p>
                        <ul className="text-xs md:text-sm space-y-2">
                          {gardenTypes.privado.info.features.map((feature, index) => (
                            <li key={index} className="flex items-center justify-center">
                              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4 text-sm text-green-300">
                          Haz clic para ver tus jardines privados
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>)}

            {/* Card Público */}
            <div className="relative">
              <Card
                className={`group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-stone-400'} border-4 rounded-3xl overflow-hidden`}
                onMouseEnter={() => setHoveredCard("publico")}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleCardClick("publico")}
              >
                <CardContent className="p-0 relative">
                  {/* Título */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <h2 className={`text-xl md:text-2xl font-bold text-green-700 ${isDarkMode ? 'bg-gray-700' : 'bg-white'} px-4 py-2 rounded-lg shadow-md`}>
                      {gardenTypes.publico.title}
                    </h2>
                  </div>

                  {/* Imagen */}
                  <div className="aspect-square relative overflow-hidden">
                    <div
                      className="w-full h-full bg-cover bg-center bg-no-repeat"
                      style={{
                        backgroundImage: `url(${gardenTypes.publico.image})`,
                        backgroundPosition: "75% center",
                      }}
                    />
                  </div>

                  {/* Información hover */}
                  {hoveredCard === "publico" && (
                    <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center p-6 transition-all duration-300">
                      <div className="text-white text-center max-w-sm">
                        <h3 className="text-xl md:text-2xl font-bold mb-3 text-green-400">
                          {gardenTypes.publico.info.title}
                        </h3>
                        <p className="text-sm md:text-base mb-4 text-gray-200">{gardenTypes.publico.info.description}</p>
                        <ul className="text-xs md:text-sm space-y-2">
                          {gardenTypes.publico.info.features.map((feature, index) => (
                            <li key={index} className="flex items-center justify-center">
                              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4 text-sm text-green-300">
                          Haz clic para explorar jardines comunitarios
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Información adicional */}
          <div className="text-center mt-12">
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
              Los jardines públicos te permiten unirte a la comunidad y participar en proyectos colaborativos.
              Los jardines privados son perfectos para tener control total sobre tu cultivo y experimentar con diferentes técnicas.
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      <GardenModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        gardenType={selectedGardenType}
        onGardenSelect={handleGardenSelect}
        isDarkMode={isDarkMode}
      />
      
      {/* Notificación de éxito personalizada */}
      <SuccessNotification
        isVisible={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        title="¡Jardín Seleccionado!"
        message={successMessage}
        type="garden"
        duration={5000}
      />
    </>
  )
}
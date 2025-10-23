function Overlay({ rightPanelActive, setRightPanelActive }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-r from-green-600 to-lime-400 text-white overflow-hidden">
      <div className="absolute inset-0 flex transition-all duration-500">
        {/* Panel izquierdo */}
        <div
          className={`h-screen flex flex-col justify-center items-center p-10 text-center space-y-4 bg-opacity-50 backdrop-blur-sm transition-all duration-500 ${
            rightPanelActive ? "opacity-100" : "opacity-0 pointer-events-none" 
          }`}
        >
          <h1 className="text-3xl font-bold">¡Bienvenido!</h1>
          <p className="text-sm">
            Para mantenerse conectado con nosotros, inicie sesión con su
            información personal.
          </p>
          <button
            className="mt-4 px-6 py-2 border border-white rounded-full hover:bg-white hover:text-green-700 transition"
            onClick={() => setRightPanelActive(false)}
          >
            Iniciar sesión
          </button>
        </div>

        {/* Panel derecho */}
        <div
          className={`h-screen flex flex-col justify-center items-center p-10 text-center space-y-4 bg-opacity-50 backdrop-blur-sm transition-all duration-500 ${
            rightPanelActive ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <h1 className="text-3xl font-bold">¡Hola, Amigos!</h1>
          <p className="text-sm">
            Introduce tus datos personales y comienza tu viaje con nosotros.
          </p>
          <button
            className="mt-4 px-6 py-2 border border-white rounded-full hover:bg-white hover:text-green-700 transition"
            onClick={() => setRightPanelActive(true)}
          >
            Inscribirse
          </button>
        </div>
      </div>
    </div>
  );
}

export default Overlay;

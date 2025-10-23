const variantes = {
  // Botones principales con nueva paleta EcoVertical
  submit: "relative overflow-hidden bg-gradient-to-br from-eco-mountain-meadow to-eco-emerald text-white border-none px-4 py-3 rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 mb-2 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(21,158,105,0.3)] disabled:bg-gradient-to-br disabled:from-gray-300 disabled:to-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed active:translate-y-0",
  next: "relative overflow-hidden bg-gradient-to-br from-eco-mountain-meadow to-eco-emerald text-white border-none px-4 py-3 rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 mb-2 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(21,158,105,0.3)] disabled:bg-gradient-to-br disabled:from-gray-300 disabled:to-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed active:translate-y-0",
  secundario: "relative overflow-hidden bg-gradient-to-br from-eco-mountain-meadow to-eco-emerald text-white border-none px-4 py-3 rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 mb-2 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(21,158,105,0.3)] disabled:bg-gradient-to-br disabled:from-gray-300 disabled:to-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed active:translate-y-0",
  primary: "relative overflow-hidden bg-gradient-to-br from-eco-mountain-meadow to-eco-emerald text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 px-6 py-3 rounded-lg font-semibold whitespace-nowrap min-w-fit disabled:bg-gradient-to-br disabled:from-gray-300 disabled:to-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed",
  secondary: "relative overflow-hidden bg-eco-scotch-mist text-eco-mountain-meadow-dark border-2 border-eco-mountain-meadow rounded-lg hover:bg-eco-mountain-meadow hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 px-6 py-3 font-semibold whitespace-nowrap min-w-fit disabled:bg-gradient-to-br disabled:from-gray-300 disabled:to-gray-400 disabled:text-gray-600 disabled:border-gray-400 disabled:cursor-not-allowed",
  accent: "relative overflow-hidden bg-gradient-to-br from-eco-pear to-eco-emerald text-eco-cape-cod font-semibold px-4 py-3 rounded-lg hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 disabled:bg-gradient-to-br disabled:from-gray-300 disabled:to-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed",
  // Nueva variante para el botón de Add Comment
  addComment: "flex items-center space-x-2 px-4 py-2 bg-eco-emerald text-white rounded-lg hover:bg-eco-emerald-dark transition-all duration-200 transform hover:scale-105 shadow-md",
  Limpiar: "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border-eco-mountain-meadow text-eco-mountain-meadow hover:bg-eco-mountain-meadow/10 flex items-center gap-2",
  Reporte: "relative overflow-hidden bg-gradient-to-br from-eco-pear-dark to-eco-pear text-eco-cape-cod shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 px-6 py-3 rounded-lg font-semibold whitespace-nowrap min-w-fit disabled:bg-gradient-to-br disabled:from-gray-300 disabled:to-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed",
  Eliminar: "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
};

const Boton = ({ 
  type = "button", 
  texto, 
  onClick, 
  disabled = false, 
  variant = "submit",
  icono = null,  // Nueva prop para el icono
  isDarkMode = false  // Nueva prop para modo oscuro
}) => {
  const handleClick = (e) => {
    if (onClick && !disabled) {
      onClick(e);
    }
  };

  // Función para obtener las clases CSS basadas en el modo oscuro
  const getButtonClasses = () => {
    const baseClasses = variantes[variant];
    
    if (isDarkMode) {
      // Adaptaciones para modo oscuro según el variant
      switch (variant) {
        case "secondary":
          return baseClasses
            .replace("bg-eco-scotch-mist", "bg-slate-700")
            .replace("text-eco-mountain-meadow-dark", "text-slate-200")
            .replace("border-eco-mountain-meadow", "border-slate-500")
            .replace("hover:bg-eco-mountain-meadow", "hover:bg-slate-600")
            .replace("hover:text-white", "hover:text-white");
        
        case "Reporte":
          return baseClasses
            .replace("bg-gradient-to-br from-eco-pear-dark to-eco-pear", "bg-gradient-to-br from-slate-600 to-slate-700")
            .replace("text-eco-cape-cod", "text-slate-200");
        
        case "accent":
          return baseClasses
            .replace("bg-gradient-to-br from-eco-pear to-eco-emerald", "bg-gradient-to-br from-slate-600 to-slate-700")
            .replace("text-eco-cape-cod", "text-slate-200");
        
        default:
          return baseClasses;
      }
    }
    
    return baseClasses;
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={getButtonClasses()}
    >
      {/* Efecto brillante - Solo se muestra cuando no está disabled */}
      {!disabled && variant !== 'addComment' && (
        <span className="absolute left-[-100%] top-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-500 group-hover:left-full"></span>
      )}

      {/* Contenido del botón */}
      <span className="relative z-10 flex items-center">
        {icono && <span className="mr-2">{icono}</span>}
        {texto}
      </span>
    </button>
  );
};

export default Boton;
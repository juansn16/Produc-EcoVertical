import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Home, Users, ArrowRight, Loader2 } from 'lucide-react';

const GardenSelector = ({ gardens, loading, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleGardenSelect = (gardenId) => {
    navigate(`/comments/${gardenId}`);
    setIsOpen(false);
    onClose();
  };

  const handleGoToUserPage = () => {
    navigate('/user');
    setIsOpen(false);
    onClose();
  };

  const handleGoToSelectGarden = () => {
    navigate('/select-garden');
    setIsOpen(false);
    onClose();
  };

  if (loading) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed text-sm sm:text-base"
      >
        <Loader2 size={16} className="animate-spin sm:w-5 sm:h-5" />
        <span className="hidden sm:inline">Cargando...</span>
        <span className="sm:hidden">...</span>
      </button>
    );
  }

  if (!gardens || gardens.length === 0) {
    return (
      <button
        onClick={handleGoToUserPage}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
      >
        <Home size={16} className="sm:w-5 sm:h-5" />
        <span className="hidden sm:inline">Mi Huerto</span>
        <span className="sm:hidden">Huerto</span>
      </button>
    );
  }

  if (gardens.length === 1) {
    const garden = gardens[0];
    return (
      <button
        onClick={() => handleGardenSelect(garden.id)}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
      >
        <Home size={16} className="sm:w-5 sm:h-5" />
        <span className="truncate max-w-[120px] sm:max-w-none">{garden.nombre}</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
      >
        <Home size={16} className="sm:w-5 sm:h-5" />
        <span className="hidden sm:inline">Mi Huerto</span>
        <span className="sm:hidden">Huerto</span>
        <ChevronDown size={14} className={`transition-transform sm:w-4 sm:h-4 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Overlay para cerrar el dropdown */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute top-full left-0 mt-2 w-56 sm:w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-2">
              <button
                onClick={handleGoToSelectGarden}
                className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Users size={16} className="text-gray-600 sm:w-[18px] sm:h-[18px]" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm sm:text-base truncate">Todos mis huertos</div>
                  <div className="text-xs sm:text-sm text-gray-500 truncate">Ver todos los huertos</div>
                </div>
                <ArrowRight size={14} className="text-gray-400 ml-auto sm:w-4 sm:h-4" />
              </button>
              
              <div className="border-t border-gray-200 my-2" />
              
              {gardens.map((garden) => (
                <button
                  key={garden.id}
                  onClick={() => handleGardenSelect(garden.id)}
                  className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Home size={16} className="text-gray-600 sm:w-[18px] sm:h-[18px]" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{garden.nombre}</div>
                    <div className="text-xs sm:text-sm text-gray-500 capitalize truncate">
                      {garden.tipo === 'privado' ? 'Huerto Privado' : 'Huerto Público'}
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-gray-400 ml-auto sm:w-4 sm:h-4" />
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GardenSelector;

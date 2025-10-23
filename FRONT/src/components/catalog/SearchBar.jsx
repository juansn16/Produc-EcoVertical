import React from 'react';
import { Search } from 'lucide-react';

export const SearchBar = ({ searchTerm, onSearchChange, placeholder, isDarkMode = false }) => {
  return (
    <div className="relative">
      <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'} w-5 h-5`} />
      <input
        type="text"
        placeholder={placeholder || "Buscar en inventario, herramientas, semillas..."}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent backdrop-blur-sm transition-all duration-200 ${
          isDarkMode 
            ? 'bg-gray-700/80 border-gray-600 text-gray-100 placeholder-gray-400' 
            : 'bg-white/80 border-gray-200 text-gray-900 placeholder-gray-500'
        }`}
      />
    </div>
  );
};
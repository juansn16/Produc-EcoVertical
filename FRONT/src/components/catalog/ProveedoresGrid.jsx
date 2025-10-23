import React from 'react';
import ProveedorCard from './ProveedorCard';
import { Store, AlertTriangle, CheckCircle } from 'lucide-react';
import Boton from '@/components/layout/Boton';

const ProveedoresGrid = ({ data, onClearFilters }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Store size={48} className="text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">
            No se encontraron proveedores
          </h3>
          <p className="text-gray-500 max-w-md">
            Intenta ajustar los filtros o términos de búsqueda para encontrar lo que buscas.
          </p>
          <Boton
            texto="Limpiar Filtros"
            onClick={onClearFilters}
            variant="primary"
          />
        </div>
      </div>
    );
  }

  // Calcular estadísticas para las alertas
  const totalProveedores = data.length;
  const proveedoresDisponibles = data.filter(item => item.disponible).length;
  const proveedoresNoDisponibles = data.filter(item => !item.disponible).length;
  const proveedoresConContacto = data.filter(item => item.contacto).length;

  return (
    <div className="space-y-6">
      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.map((item) => (
          <ProveedorCard key={item.id} item={item} />
        ))}
      </div>

      {/* Información adicional */}
      {proveedoresNoDisponibles > 0 && (
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-yellow-600" />
            <div>
              <h4 className="font-medium text-yellow-800">
                Atención: Proveedores No Disponibles
              </h4>
              <p className="text-sm text-yellow-700">
                {proveedoresNoDisponibles} {proveedoresNoDisponibles === 1 ? 'proveedor no está' : 'proveedores no están'} disponible actualmente. 
                Considera buscar alternativas.
              </p>
            </div>
          </div>
        </div>
      )}

      {proveedoresConContacto < totalProveedores && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Store size={20} className="text-blue-600" />
            <div>
              <h4 className="font-medium text-blue-800">
                Información de Contacto
              </h4>
              <p className="text-sm text-blue-700">
                {totalProveedores - proveedoresConContacto} {totalProveedores - proveedoresConContacto === 1 ? 'proveedor no tiene' : 'proveedores no tienen'} información de contacto. 
                Visita directamente la dirección para más información.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProveedoresGrid;
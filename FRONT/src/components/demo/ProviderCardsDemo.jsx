import React from 'react';
import ProviderCard from '@/components/catalog/ProviderCard';

// Componente de demostración para mostrar tarjetas con múltiples especialidades
const ProviderCardsDemo = () => {
  // Datos de prueba con múltiples especialidades
  const demoProviders = [
    {
      id: "demo-1",
      nombre_empresa: "AgroSupply S.A.",
      contacto_principal: "María González",
      telefono: "+58 212 123 4567",
      email: "contacto@agrosupply.com",
      especialidad: "Semillas", // Campo legacy
      especialidades: ["Semillas", "Fertilizantes", "Herramientas"], // Nuevo campo
      descripcion: "Proveedor especializado en productos agrícolas de alta calidad",
      ubicacion: {
        ciudad: "Caracas",
        estado: "Distrito Capital",
        calle: "Av. Principal #123",
        pais: "Venezuela"
      },
      created_at: "2024-01-01T00:00:00.000Z"
    },
    {
      id: "demo-2", 
      nombre_empresa: "TecnoRiego",
      contacto_principal: "Carlos Pérez",
      telefono: "+58 212 987 6543",
      email: "ventas@tecnoriego.com",
      especialidad: "Sistemas de Riego",
      especialidades: ["Sistemas de Riego", "Macetas", "Iluminación"],
      descripcion: "Especialistas en sistemas de riego automatizado y equipos de cultivo",
      ubicacion: {
        ciudad: "Valencia",
        estado: "Carabobo",
        calle: "Calle Comercial #456",
        pais: "Venezuela"
      },
      created_at: "2024-01-02T00:00:00.000Z"
    },
    {
      id: "demo-3",
      nombre_empresa: "Semillas del Valle",
      contacto_principal: "Ana Rodríguez",
      telefono: "+58 212 555 1234",
      email: "info@semillasdelvalle.com",
      especialidad: "Semillas",
      especialidades: ["Semillas"], // Solo una especialidad
      descripcion: "Productora de semillas orgánicas certificadas",
      ubicacion: {
        ciudad: "Mérida",
        estado: "Mérida",
        calle: "Av. Universidad #789",
        pais: "Venezuela"
      },
      created_at: "2024-01-03T00:00:00.000Z"
    },
    {
      id: "demo-4",
      nombre_empresa: "Proveedor Legacy",
      contacto_principal: "Juan Pérez",
      telefono: "+58 212 111 2222",
      email: "legacy@test.com",
      especialidad: "Herramientas", // Solo campo legacy (sin especialidades múltiples)
      especialidades: [], // Array vacío
      descripcion: "Proveedor con solo especialidad única",
      ubicacion: {
        ciudad: "Maracaibo",
        estado: "Zulia",
        calle: "Calle Principal #321",
        pais: "Venezuela"
      },
      created_at: "2024-01-04T00:00:00.000Z"
    }
  ];

  const handleEdit = (provider) => {
    console.log('Editar proveedor:', provider.nombre_empresa);
  };

  const handleDelete = (provider) => {
    console.log('Eliminar proveedor:', provider.nombre_empresa);
  };

  const handleViewDetails = (provider) => {
    console.log('Ver detalles del proveedor:', provider.nombre_empresa);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Demostración: Tarjetas con Especialidades Múltiples
        </h1>
        
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            📋 Casos de Prueba:
          </h2>
          <ul className="text-blue-800 space-y-1">
            <li>• <strong>AgroSupply:</strong> 3 especialidades (Semillas, Fertilizantes, Herramientas)</li>
            <li>• <strong>TecnoRiego:</strong> 3 especialidades (Sistemas de Riego, Macetas, Iluminación)</li>
            <li>• <strong>Semillas del Valle:</strong> 1 especialidad (Semillas)</li>
            <li>• <strong>Proveedor Legacy:</strong> Solo campo legacy (Herramientas)</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoProviders.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onEdit={() => handleEdit(provider)}
              onDelete={() => handleDelete(provider)}
              onViewDetails={() => handleViewDetails(provider)}
            />
          ))}
        </div>

        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            ✅ Características Implementadas:
          </h3>
          <ul className="text-green-800 space-y-1">
            <li>• <strong>Detección automática:</strong> Usa especialidades múltiples si están disponibles</li>
            <li>• <strong>Fallback inteligente:</strong> Usa especialidad única si no hay múltiples</li>
            <li>• <strong>Etiquetas dinámicas:</strong> "Especialidad:" vs "Especialidades:" según cantidad</li>
            <li>• <strong>Tags visuales:</strong> Cada especialidad se muestra como un tag verde</li>
            <li>• <strong>Compatibilidad total:</strong> Funciona con datos existentes y nuevos</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProviderCardsDemo;

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import SuccessNotification from './SuccessNotification';

const SuccessNotificationDemo = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('garden');

  const handleShowNotification = (type) => {
    setNotificationType(type);
    setShowNotification(true);
  };

  const getMessage = (type) => {
    switch (type) {
      case 'garden':
        return '¡Jardín público "Huerto Comunitario" creado exitosamente! Los usuarios ya pueden unirse y comenzar a cultivar juntos.';
      case 'plant':
        return '¡Planta "Tomate Cherry" agregada exitosamente! Ya puedes comenzar a monitorear su crecimiento.';
      case 'location':
        return '¡Ubicación "Parque Central" registrada exitosamente! Ahora puedes crear jardines en esta zona.';
      default:
        return '¡Operación completada exitosamente!';
    }
  };

  const getTitle = (type) => {
    switch (type) {
      case 'garden':
        return '¡Jardín Creado!';
      case 'plant':
        return '¡Planta Agregada!';
      case 'location':
        return '¡Ubicación Registrada!';
      default:
        return '¡Éxito!';
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Demo - Notificaciones de Éxito
        </h1>
        
        <div className="bg-white rounded-xl shadow-medium p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Prueba las diferentes notificaciones
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => handleShowNotification('garden')}
              className="bg-gradient-to-r from-eco-mountain-meadow to-huertotech-green-dark text-white hover:from-huertotech-green-dark hover:to-eco-mountain-meadow"
            >
              Jardín Público
            </Button>
            
            <Button
              onClick={() => handleShowNotification('plant')}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-green-500"
            >
              Planta
            </Button>
            
            <Button
              onClick={() => handleShowNotification('location')}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-blue-500"
            >
              Ubicación
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">Características:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Diseño consistente con la paleta de colores del proyecto</li>
              <li>• Animaciones suaves y profesionales</li>
              <li>• Iconos contextuales según el tipo de notificación</li>
              <li>• Barra de progreso animada</li>
              <li>• Cierre automático después de 6 segundos</li>
              <li>• Botón de cierre manual</li>
              <li>• Efectos de brillo y backdrop blur</li>
            </ul>
          </div>
        </div>
      </div>

      <SuccessNotification
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
        title={getTitle(notificationType)}
        message={getMessage(notificationType)}
        type={notificationType}
        duration={6000}
      />
    </div>
  );
};

export default SuccessNotificationDemo;

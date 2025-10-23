import React, { useState } from "react";
import SignUpForm from "../auth/SignUpForm";

const FormularioTest = () => {
  const [formData, setFormData] = useState(null);

  const handleRegister = (data) => {
    console.log("Datos del formulario recibidos:", data);
    setFormData(data);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-huertotech-green-dark">
        📝 Prueba del Formulario - EcoVertical
      </h2>
      
      {/* Información del formulario */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">ℹ️ Información de la Prueba</h3>
        <p className="text-blue-700 text-sm">
          Este formulario de prueba te permite verificar que no haya errores de validación.
          Navega por los pasos y verifica que no aparezcan errores en la consola.
        </p>
      </div>

      {/* Formulario de prueba */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <SignUpForm onRegister={handleRegister} isLoading={false} />
      </div>

      {/* Datos recibidos */}
      {formData && (
        <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-bold text-green-800 mb-3 text-lg">
            ✅ Formulario Enviado Exitosamente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div><strong>👤 Nombre:</strong> {formData.nombre}</div>
              <div><strong>🆔 Cédula:</strong> {formData.cedula}</div>
              <div><strong>📱 Teléfono:</strong> {formData.telefono}</div>
              <div><strong>🌱 Preferencias:</strong> {formData.preferencias_cultivo}</div>
            </div>
            <div className="space-y-2">
              <div><strong>📍 Calle:</strong> {formData.calle}</div>
              <div><strong>🏙️ Ciudad:</strong> {formData.ciudad}</div>
              <div><strong>📧 Email:</strong> {formData.email}</div>
              <div><strong>🔒 Contraseña:</strong> {'*'.repeat(formData.password.length)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Instrucciones */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">📋 Instrucciones de Prueba</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <strong>Paso 1:</strong> Completa la información personal</li>
          <li>• <strong>Paso 2:</strong> Selecciona ubicación en el mapa</li>
          <li>• <strong>Paso 3:</strong> Ingresa credenciales de acceso</li>
          <li>• <strong>Verificación:</strong> No debe haber errores en la consola</li>
        </ul>
      </div>
    </div>
  );
};

export default FormularioTest;

import { useState, useEffect } from "react";
import Boton from "../layout/Boton.jsx";
import PasswordInput from "../ui/PasswordInput";

function SignUpForm({ onRegister, isLoading = false, onClearError }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    cedula: "",
    telefono: "",
    calle: "",
    ciudad: "",
    estado: "",
    pais: "",
    email: "",
    password: "",
    quiere_ser_administrador: false,
    codigo_invitacion: "",
  });

  const [touchedFields, setTouchedFields] = useState({});
  const [cedulaError, setCedulaError] = useState("");
  const [isCheckingCedula, setIsCheckingCedula] = useState(false);
  const [codigoInvitacionError, setCodigoInvitacionError] = useState("");
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [codigoValidado, setCodigoValidado] = useState(false);
  const [codigoInfo, setCodigoInfo] = useState(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Función para verificar si la cédula ya existe
  const verificarCedula = async (cedula) => {
    if (!cedula || cedula.length < 3) {
      setCedulaError("");
      return;
    }

    setIsCheckingCedula(true);
    setCedulaError("");

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/auth/check-cedula?cedula=${cedula}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.exists) {
        setCedulaError("Esta cédula ya está registrada en el sistema");
      } else {
        setCedulaError("");
      }
    } catch (error) {
      console.log("Error al verificar cédula:", error);
      // En caso de error, no bloqueamos el formulario
    } finally {
      setIsCheckingCedula(false);
    }
  };

  // Función para validar código de invitación
  const validarCodigoInvitacion = async (codigo) => {
    if (!codigo || codigo.length !== 6) {
      setCodigoInvitacionError("");
      setCodigoValidado(false);
      setCodigoInfo(null);
      return;
    }

    setIsValidatingCode(true);
    setCodigoInvitacionError("");
    setCodigoValidado(false);
    setCodigoInfo(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/auth/validate-invitation-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codigo }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCodigoValidado(true);
        setCodigoInfo(data.data);
        setCodigoInvitacionError("");
      } else {
        setCodigoInvitacionError(data.message || "Código de invitación no válido");
        setCodigoValidado(false);
        setCodigoInfo(null);
      }
    } catch (error) {
      console.log("Error al validar código de invitación:", error);
      setCodigoInvitacionError("Error al validar el código de invitación");
      setCodigoValidado(false);
      setCodigoInfo(null);
    } finally {
      setIsValidatingCode(false);
    }
  };

  // Debounce para la verificación de cédula
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.cedula && formData.cedula.length >= 3) {
        verificarCedula(formData.cedula);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.cedula]);

  // Debounce para la validación del código de invitación
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.codigo_invitacion && formData.codigo_invitacion.length === 6) {
        validarCodigoInvitacion(formData.codigo_invitacion);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [formData.codigo_invitacion]);

  const handleInputChange = (e) => {
    if (isLoading) return;
    
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    
    // Si es el campo teléfono, filtrar solo números y símbolos permitidos
    if (name === 'telefono' && type !== 'checkbox') {
      const allowedChars = /^[0-9+\-\(\)\s]*$/;
      if (!allowedChars.test(value)) {
        return; // No actualizar si contiene caracteres no permitidos
      }
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: inputValue,
    }));
    setTouchedFields((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Limpiar errores si el usuario está editando
    if (name === 'cedula') {
      setCedulaError("");
    }
    if (name === 'codigo_invitacion') {
      setCodigoInvitacionError("");
      setCodigoValidado(false);
      setCodigoInfo(null);
    }
    
    // Limpiar errores generales cuando el usuario empiece a escribir
    if (onClearError) {
      onClearError();
    }
  };

  const handleNext = () => {
    if (currentStep < 3 && isStepValid() && !isLoading) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isStepValid() && !isLoading) {
      console.log("Datos del formulario:", formData);
      onRegister(formData);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.nombre.trim() &&
          formData.cedula.trim() &&
          formData.telefono.trim() &&
          !cedulaError // No permitir avanzar si hay error de cédula
        );
      case 2:
        return (
          formData.calle.trim() &&
          formData.ciudad.trim() &&
          formData.estado.trim() &&
          formData.pais.trim()
        );
      case 3:
        const emailValid = formData.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
        const passwordValid = formData.password.trim() && formData.password.length >= 6;
        
        // Si no quiere ser administrador, debe tener código de invitación válido
        if (!formData.quiere_ser_administrador) {
          return emailValid && passwordValid && codigoValidado && !codigoInvitacionError;
        }
        
        // Si quiere ser administrador, solo necesita email y contraseña
        return emailValid && passwordValid;
      default:
        return false;
    }
  };

  const irAtras = () => {
    if (currentStep > 1 && !isLoading) setCurrentStep((prev) => prev - 1);
  };


  const isFieldValid = (fieldName) => {
    // Solo validar campos que han sido tocados o están en el paso actual
    if (!touchedFields[fieldName] && currentStep !== 3) return true;
    
    const value = formData[fieldName];
    
    switch (fieldName) {
      case 'email':
        return value.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'password':
        return value.trim() && value.length >= 6;
      default:
        return value && value.trim();
    }
  };

  // Función para obtener atributos del campo según el paso actual
  const getFieldAttributes = (fieldName) => {
    const isCurrentStep = currentStep === 3;
    const isFieldRequired = isCurrentStep && (fieldName === 'email' || fieldName === 'password');
    
    const baseAttributes = {
      required: isFieldRequired,
      disabled: isLoading,
      'aria-required': isFieldRequired
    };

    // Agregar atributos específicos según el campo
    if (fieldName === 'password' && isCurrentStep) {
      baseAttributes.minLength = 6;
    }

    return baseAttributes;
  };

  return (
    <div className={`w-full transition-all duration-700 ${isVisible ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-4'}`}>
      {/* Indicador de pasos */}
      <div className="mb-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
        <div className="flex justify-center items-center space-x-1 mb-3">
          <span className="text-2xl font-bold text-eco-mountain-meadow-dark">
            {currentStep}
          </span>
          <span className="text-gray-600 text-base">/ 3</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(currentStep / 3) * 100}%`,
              background: "linear-gradient(to right, #149c68, #aee637)",
            }}
          ></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Paso 1 - Información Personal */}
        <div className={`transition-all duration-500 ${currentStep === 1 ? 'block opacity-100 transform translate-x-0' : 'hidden opacity-0 transform translate-x-4'}`}>
          <div className="text-center mb-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <h2 className="text-2xl font-bold text-theme-primary mb-2">
              Información Personal
            </h2>
            <p className="text-theme-secondary">
              Cuéntanos sobre ti para personalizar tu experiencia
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <label htmlFor="nombre" className="block text-sm font-medium text-theme-secondary mb-2">
                Nombre Completo
              </label>
              <input
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent transition-all duration-200 ${
                  isFieldValid("nombre") ? "border-eco-pear/30 dark:border-eco-pear/50" : "border-red-500 dark:border-red-400"
                } ${isLoading ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-theme-secondary dark:bg-theme-tertiary'} text-theme-primary`}
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ingresa tu nombre completo"
                required
                disabled={isLoading}
              />
              {!isFieldValid("nombre") && (
                <p className="mt-1 text-xs text-red-600">Este campo es requerido</p>
              )}
            </div>

            <div className="animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <label htmlFor="cedula" className="block text-sm font-medium text-theme-secondary mb-2">
                Cédula
              </label>
              <div className="relative">
                <input
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent transition-all duration-200 ${
                    cedulaError 
                      ? "border-red-500 dark:border-red-400" 
                      : isFieldValid("cedula") && !isCheckingCedula
                      ? "border-green-500 dark:border-green-400"
                      : "border-eco-pear/30 dark:border-eco-pear/50"
                  } ${isLoading ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-theme-secondary dark:bg-theme-tertiary'} text-theme-primary`}
                  type="text"
                  id="cedula"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleInputChange}
                  placeholder="Ingresa tu cédula"
                  required
                  disabled={isLoading}
                />
                {/* Indicador de estado de verificación */}
                {isCheckingCedula && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  </div>
                )}
                {!isCheckingCedula && formData.cedula && !cedulaError && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {!isCheckingCedula && cedulaError && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {cedulaError && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {cedulaError}
                </p>
              )}
              {isCheckingCedula && (
                <div className="mt-1 text-xs text-blue-600 flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500 mr-1"></div>
                  Verificando disponibilidad de cédula...
                </div>
              )}
              {!isFieldValid("cedula") && !cedulaError && !isCheckingCedula && (
                <p className="mt-1 text-xs text-red-600">Este campo es requerido</p>
              )}
            </div>

            <div className="animate-fade-in-up" style={{animationDelay: '0.5s'}}>
              <label htmlFor="telefono" className="block text-sm font-medium text-theme-secondary mb-2">
                Teléfono
              </label>
              <input
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent transition-all duration-200 ${
                  isFieldValid("telefono") ? "border-eco-pear/30 dark:border-eco-pear/50" : "border-red-500 dark:border-red-400"
                } ${isLoading ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-theme-secondary dark:bg-theme-tertiary'} text-theme-primary`}
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                placeholder="Ingresa tu teléfono"
                required
                disabled={isLoading}
              />
              {!isFieldValid("telefono") && (
                <p className="mt-1 text-xs text-red-600">Este campo es requerido</p>
              )}
            </div>

          </div>
        </div>

        {/* Paso 3 - Credenciales */}
        <div className={`transition-all duration-500 ${currentStep === 3 ? 'block opacity-100 transform translate-x-0' : 'hidden opacity-0 transform translate-x-4'}`}>
          <div className="text-center mb-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <h2 className="text-2xl font-bold text-theme-primary mb-2">
              Credenciales de Acceso
            </h2>
            <p className="text-theme-secondary">
              Crea tu cuenta para acceder a EcoVertical
            </p>
          </div>
          
          <div className="space-y-4">
            {/* Checkbox para ser administrador */}
            <div className="animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <label className="flex items-center space-x-3 p-4 border border-eco-pear/30 dark:border-eco-pear/50 rounded-lg hover:bg-theme-tertiary dark:hover:bg-theme-secondary cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  name="quiere_ser_administrador"
                  checked={formData.quiere_ser_administrador}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-5 h-5 text-eco-mountain-meadow border-eco-pear/30 dark:border-eco-pear/50 rounded focus:ring-eco-mountain-meadow focus:ring-2"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-theme-primary">
                    Quiero ser administrador
                  </span>
                  <p className="text-xs text-theme-secondary mt-1">
                    Como administrador podrás gestionar tu condominio y generar códigos de invitación
                  </p>
                </div>
              </label>
            </div>

            {/* Campo de código de invitación (solo si no quiere ser administrador) */}
            {!formData.quiere_ser_administrador && (
              <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                <label htmlFor="codigo_invitacion" className="block text-sm font-medium text-theme-secondary mb-2">
                  Código de Invitación
                </label>
                <div className="relative">
                  <input
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent transition-all duration-200 ${
                      codigoInvitacionError 
                        ? "border-red-500 dark:border-red-400" 
                        : codigoValidado
                        ? "border-green-500 dark:border-green-400"
                        : "border-eco-pear/30 dark:border-eco-pear/50"
                    } ${isLoading ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-theme-secondary dark:bg-theme-tertiary'} text-theme-primary`}
                    type="text"
                    id="codigo_invitacion"
                    name="codigo_invitacion"
                    value={formData.codigo_invitacion}
                    onChange={handleInputChange}
                    placeholder="Ingresa el código de 6 caracteres"
                    maxLength={6}
                    required
                    disabled={isLoading}
                    style={{textTransform: 'uppercase'}}
                  />
                  {/* Indicador de estado de validación */}
                  {isValidatingCode && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                  {!isValidatingCode && formData.codigo_invitacion && codigoValidado && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {!isValidatingCode && codigoInvitacionError && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Información del código validado */}
                {codigoValidado && codigoInfo && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium text-green-800">Código válido</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      Administrador: {codigoInfo.administrador.nombre} | 
                      Ubicación: {codigoInfo.ubicacion.ciudad}, {codigoInfo.ubicacion.estado}
                    </p>
                  </div>
                )}
                
                {/* Mensajes de error */}
                {codigoInvitacionError && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {codigoInvitacionError}
                  </p>
                )}
                {isValidatingCode && (
                  <div className="mt-1 text-xs text-blue-600 flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500 mr-1"></div>
                    Validando código de invitación...
                  </div>
                )}
              </div>
            )}
            <div className="animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <label htmlFor="email" className="block text-sm font-medium text-theme-secondary mb-2">
                Correo Electrónico
              </label>
              <input
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent transition-all duration-200 ${
                  isFieldValid("email") ? "border-eco-pear/30 dark:border-eco-pear/50" : "border-red-500 dark:border-red-400"
                } ${isLoading ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-theme-secondary dark:bg-theme-tertiary'} text-theme-primary`}
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="tu@email.com"
                {...getFieldAttributes('email')}
              />
              {!isFieldValid("email") && (
                <p className="mt-1 text-xs text-red-600">Este campo es requerido</p>
              )}
            </div>

            <div className="animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <label htmlFor="password" className="block text-sm font-medium text-theme-secondary mb-2">
                Contraseña
              </label>
              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Mínimo 6 caracteres"
                className={`${
                  isFieldValid("password") && formData.password.length >= 6 ? "border-eco-pear/30 dark:border-eco-pear/50" : "border-red-500 dark:border-red-400"
                } ${isLoading ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : ''}`}
                minLength={6}
                disabled={isLoading}
                {...getFieldAttributes('password')}
              />
              {(!isFieldValid("password") || formData.password.length < 6) && (
                <p className="mt-1 text-xs text-red-600">
                  {!formData.password ? "Este campo es requerido" : "La contraseña debe tener al menos 6 caracteres"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="flex justify-between pt-6 animate-fade-in-up" style={{animationDelay: '0.7s'}}>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={irAtras}
              disabled={isLoading}
              className={`px-6 py-3 font-medium rounded-lg transition-all duration-200 ${
                isLoading 
                  ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-300 cursor-not-allowed' 
                  : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-theme-primary hover:scale-105'
              }`}
            >
              Volver
            </button>
          )}
          
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid() || isLoading}
              className={`px-6 py-3 font-medium rounded-lg transition-all duration-200 ${
                isStepValid() && !isLoading
                  ? "bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald text-white hover:from-eco-mountain-meadow-dark hover:to-eco-emerald-dark transform hover:scale-105 shadow-lg hover:shadow-xl"
                  : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-300 cursor-not-allowed"
              }`}
            >
              Siguiente
            </button>
          ) : (
            <button
              type="submit"
              disabled={!isStepValid() || isLoading}
              className={`px-6 py-3 font-medium rounded-lg transition-all duration-200 ${
                isStepValid() && !isLoading
                  ? "bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald text-white hover:from-eco-mountain-meadow-dark hover:to-eco-emerald-dark transform hover:scale-105 shadow-lg hover:shadow-xl"
                  : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-300 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creando cuenta...</span>
                </div>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          )}
        </div>
      </form>

        {/* Paso 2 - Información de Dirección */}
        <div className={`transition-all duration-500 ${currentStep === 2 ? 'block opacity-100 transform translate-x-0' : 'hidden opacity-0 transform translate-x-4'}`}>
          <div className="text-center mb-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <h2 className="text-2xl font-bold text-theme-primary mb-2">
              Información de Dirección
            </h2>
            <p className="text-theme-secondary">
              Ingresa la dirección de tu ubicación
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <label htmlFor="calle" className="block text-sm font-medium text-theme-secondary mb-2">
                Calle y Número
              </label>
              <input
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent transition-all duration-200 ${
                  isFieldValid("calle") ? "border-eco-pear/30 dark:border-eco-pear/50" : "border-red-500 dark:border-red-400"
                } ${isLoading ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-theme-secondary dark:bg-theme-tertiary'} text-theme-primary`}
                type="text"
                id="calle"
                name="calle"
                value={formData.calle}
                onChange={handleInputChange}
                placeholder="Ej: Av. Principal #123"
                required
                disabled={isLoading}
              />
              {!isFieldValid("calle") && (
                <p className="mt-1 text-xs text-red-600">Este campo es requerido</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                <label htmlFor="ciudad" className="block text-sm font-medium text-theme-secondary mb-2">
                  Ciudad
                </label>
                <input
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent transition-all duration-200 ${
                    isFieldValid("ciudad") ? "border-eco-pear/30 dark:border-eco-pear/50" : "border-red-500 dark:border-red-400"
                  } ${isLoading ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-theme-secondary dark:bg-theme-tertiary'} text-theme-primary`}
                  type="text"
                  id="ciudad"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleInputChange}
                  placeholder="Ej: Caracas"
                  required
                  disabled={isLoading}
                />
                {!isFieldValid("ciudad") && (
                  <p className="mt-1 text-xs text-red-600">Este campo es requerido</p>
                )}
              </div>

              <div className="animate-fade-in-up" style={{animationDelay: '0.5s'}}>
                <label htmlFor="estado" className="block text-sm font-medium text-theme-secondary mb-2">
                  Estado
                </label>
                <input
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent transition-all duration-200 ${
                    isFieldValid("estado") ? "border-eco-pear/30 dark:border-eco-pear/50" : "border-red-500 dark:border-red-400"
                  } ${isLoading ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-theme-secondary dark:bg-theme-tertiary'} text-theme-primary`}
                  type="text"
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  placeholder="Ej: Distrito Capital"
                  required
                  disabled={isLoading}
                />
                {!isFieldValid("estado") && (
                  <p className="mt-1 text-xs text-red-600">Este campo es requerido</p>
                )}
              </div>
            </div>

            <div className="animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <label htmlFor="pais" className="block text-sm font-medium text-theme-secondary mb-2">
                País
              </label>
              <input
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent transition-all duration-200 ${
                  isFieldValid("pais") ? "border-eco-pear/30 dark:border-eco-pear/50" : "border-red-500 dark:border-red-400"
                } ${isLoading ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-theme-secondary dark:bg-theme-tertiary'} text-theme-primary`}
                type="text"
                id="pais"
                name="pais"
                value={formData.pais}
                onChange={handleInputChange}
                placeholder="Ej: Venezuela"
                required
                disabled={isLoading}
              />
              {!isFieldValid("pais") && (
                <p className="mt-1 text-xs text-red-600">Este campo es requerido</p>
              )}
            </div>

          </div>
        </div>
    </div>
  );
}

export default SignUpForm;

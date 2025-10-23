import { useState, useEffect } from "react";
import { X, Mail, Key, Lock, CheckCircle, AlertCircle } from "lucide-react";
import PasswordInput from "../ui/PasswordInput";

const PasswordResetModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1: email, 2: código, 3: nueva contraseña, 4: éxito
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Limpiar estado cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setEmail("");
      setCode("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");
      setSuccess("");
      setResendCooldown(0);
    }
  }, [isOpen]);

  // Cooldown para reenvío de código
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(data.message);
        setStep(2);
        setResendCooldown(60); // 60 segundos de cooldown
      } else {
        // Manejar errores específicos
        if (response.status === 404) {
          setError('No existe una cuenta registrada con este correo electrónico. Verifica el email o regístrate primero.');
        } else {
          setError(data.message || 'Error al procesar la solicitud');
        }
      }
    } catch (error) {
      setError('Error de conexión. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/verify-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setStep(3);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Error de conexión. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newPassword, confirmPassword }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setStep(4);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Error de conexión. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Código reenviado. Revisa tu bandeja de entrada.');
        setResendCooldown(60);
      } else {
        // Manejar errores específicos
        if (response.status === 404) {
          setError('No existe una cuenta registrada con este correo electrónico. Verifica el email o regístrate primero.');
        } else {
          setError(data.message || 'Error al procesar la solicitud');
        }
      }
    } catch (error) {
      setError('Error de conexión. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatEmail = (email) => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;
    return `${username.substring(0, 2)}${'*'.repeat(username.length - 2)}@${domain}`;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in"
        style={{
          margin: 'auto',
          transform: 'translate(0, 0)',
          animation: 'scale-in 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Restablecer Contraseña
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Paso 1: Solicitar Email */}
          {step === 1 && (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-eco-mountain-meadow/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-eco-mountain-meadow" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Ingresa tu correo electrónico
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Te enviaremos un código de verificación para restablecer tu contraseña
                </p>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="flex-1 px-4 py-3 bg-eco-mountain-meadow text-white rounded-lg hover:bg-eco-mountain-meadow-dark transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Enviar Código</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Paso 2: Verificar Código */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-eco-mountain-meadow/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key className="w-8 h-8 text-eco-mountain-meadow" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Verifica tu código
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Hemos enviado un código de 6 dígitos a <strong>{formatEmail(email)}</strong>
                </p>
              </div>

              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Código de Verificación
                </label>
                <input
                  type="text"
                  id="code"
                  placeholder="123456"
                  maxLength="6"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center text-2xl font-mono tracking-widest"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <p className="text-sm text-green-600">{success}</p>
                </div>
              )}

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || isLoading}
                  className="text-sm text-eco-mountain-meadow hover:text-eco-mountain-meadow-dark transition-colors disabled:opacity-50"
                >
                  {resendCooldown > 0 
                    ? `Reenviar código en ${resendCooldown}s` 
                    : 'Reenviar código'
                  }
                </button>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={isLoading || code.length !== 6}
                  className="flex-1 px-4 py-3 bg-eco-mountain-meadow text-white rounded-lg hover:bg-eco-mountain-meadow-dark transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>Verificar</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Paso 3: Nueva Contraseña */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-eco-mountain-meadow/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-eco-mountain-meadow" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Nueva Contraseña
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Crea una nueva contraseña segura para tu cuenta
                </p>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nueva Contraseña
                </label>
                <PasswordInput
                  id="newPassword"
                  placeholder="Mínimo 8 caracteres"
                  className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength="8"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Debe tener al menos 8 caracteres
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirmar Nueva Contraseña
                </label>
                <PasswordInput
                  id="confirmPassword"
                  placeholder="Repite tu nueva contraseña"
                  className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength="8"
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                  className="flex-1 px-4 py-3 bg-eco-mountain-meadow text-white rounded-lg hover:bg-eco-mountain-meadow-dark transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Restableciendo...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Restablecer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Paso 4: Éxito */}
          {step === 4 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-500 dark:text-green-400" />
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  ¡Contraseña Restablecida!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tu contraseña ha sido actualizada exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-full px-4 py-3 bg-eco-mountain-meadow text-white rounded-lg hover:bg-eco-mountain-meadow-dark transition-colors"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordResetModal;

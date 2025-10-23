import { useState, useEffect } from "react";
import Boton from "../layout/Boton";
import PasswordInput from "../ui/PasswordInput";

function SignInForm({ onLogin, isLoading = false, onShowPasswordReset, onClearError }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isLoading) {
      onLogin(email, password);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (onClearError) onClearError();
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (onClearError) onClearError();
  };

  return (
    <>
      <form className={`w-full space-y-6 transition-all duration-700 ${isVisible ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-4'}`} onSubmit={handleSubmit}>
      <div className="text-center mb-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
        <h1 className="text-3xl font-bold text-theme-primary mb-2">
          Inicio de Sesión
        </h1>
        <p className="text-theme-secondary">
          Ingresa tus credenciales para acceder a tu cuenta
        </p>
      </div>

      <div className="space-y-4">
        <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <label htmlFor="email" className="block text-sm font-medium text-theme-primary mb-2">
            Correo Electrónico
          </label>
          <input
            type="email"
            id="email"
            placeholder="tu@email.com"
            className="w-full px-4 py-3 border border-eco-pear dark:border-eco-pear/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent transition-all duration-200 bg-theme-secondary dark:bg-theme-tertiary text-theme-primary"
            value={email}
            onChange={handleEmailChange}
            required
            disabled={isLoading}
          />
        </div>

        <div className="animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <label htmlFor="password" className="block text-sm font-medium text-theme-primary mb-2">
            Contraseña
          </label>
          <PasswordInput
            id="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="••••••••"
            className="border border-eco-pear dark:border-eco-pear/70"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex items-center justify-between animate-fade-in-up" style={{animationDelay: '0.4s'}}>
        <label className="flex items-center">
          <input
            type="checkbox"
            className="w-4 h-4 text-eco-mountain-meadow bg-theme-secondary dark:bg-theme-tertiary border-eco-pear dark:border-eco-pear/70 rounded focus:ring-eco-mountain-meadow focus:ring-2"
            disabled={isLoading}
          />
          <span className="ml-2 text-sm text-theme-secondary">Recordarme</span>
        </label>
        <button
          type="button"
          onClick={onShowPasswordReset}
          className="text-sm text-eco-mountain-meadow hover:text-eco-emerald font-medium transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full font-medium py-3 px-4 rounded-lg transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:ring-offset-2 animate-fade-in-up ${
          isLoading 
            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-300 cursor-not-allowed' 
            : 'bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald text-white hover:from-eco-mountain-meadow-dark hover:to-eco-emerald-dark hover:scale-[1.02] shadow-lg hover:shadow-xl'
        }`}
        style={{animationDelay: '0.5s'}}
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Iniciando sesión...</span>
          </div>
        ) : (
          'Iniciar Sesión'
        )}
      </button>

    </form>
    </>
  );
}

export default SignInForm;

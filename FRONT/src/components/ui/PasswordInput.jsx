import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput = ({
  id,
  name,
  value,
  onChange,
  placeholder = "••••••••",
  className = "",
  required = false,
  disabled = false,
  minLength,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const baseClasses = "w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow focus:border-transparent transition-all duration-200 bg-theme-secondary dark:bg-theme-tertiary text-theme-primary";
  const disabledClasses = disabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : '';
  
  const inputClasses = `${baseClasses} ${disabledClasses} ${className}`;

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputClasses}
        required={required}
        disabled={disabled}
        minLength={minLength}
        {...props}
      />
      <button
        type="button"
        onClick={togglePasswordVisibility}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200"
        disabled={disabled}
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOff className="h-5 w-5" />
        ) : (
          <Eye className="h-5 w-5" />
        )}
      </button>
    </div>
  );
};

export default PasswordInput;

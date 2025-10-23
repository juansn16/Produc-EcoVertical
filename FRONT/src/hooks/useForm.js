import { useState, useCallback } from 'react';

export const useForm = (initialValues = {}, validationSchema = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setValues(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validar campo cuando pierde el foco
    if (validationSchema) {
      try {
        validationSchema.validateAt(name, values);
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      } catch (validationError) {
        setErrors(prev => ({
          ...prev,
          [name]: validationError.message
        }));
      }
    }
  }, [values, validationSchema]);

  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const validateForm = useCallback(async () => {
    if (!validationSchema) return true;

    try {
      await validationSchema.validate(values, { abortEarly: false });
      setErrors({});
      return true;
    } catch (validationErrors) {
      const newErrors = {};
      validationErrors.inner.forEach(error => {
        newErrors[error.path] = error.message;
      });
      setErrors(newErrors);
      return false;
    }
  }, [values, validationSchema]);

  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    
    try {
      const isValid = await validateForm();
      if (isValid) {
        await onSubmit(values);
      }
    } catch (error) {
      console.error('Error en submit:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm]);

  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    onChange: handleChange,
    onBlur: handleBlur,
    error: errors[name],
    touched: touched[name]
  }), [values, errors, touched, handleChange, handleBlur]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    resetForm,
    validateForm,
    getFieldProps
  };
}; 
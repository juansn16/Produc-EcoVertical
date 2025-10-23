// Utilidad para manejar notificaciones de manera más robusta
let toast = null;

// Función para inicializar toast de manera lazy
const getToast = async () => {
  if (!toast) {
    try {
      const { toast: toastModule } = await import('react-hot-toast');
      toast = toastModule;
    } catch (error) {
      console.warn('react-hot-toast no disponible, usando console.log como fallback');
      toast = {
        success: (message) => console.log('✅', message),
        error: (message) => console.error('❌', message),
        loading: (message) => console.log('⏳', message)
      };
    }
  }
  return toast;
};

export const showSuccess = async (message) => {
  const toastInstance = await getToast();
  return toastInstance.success(message);
};

export const showError = async (message) => {
  const toastInstance = await getToast();
  return toastInstance.error(message);
};

export const showLoading = async (message) => {
  const toastInstance = await getToast();
  return toastInstance.loading(message);
};

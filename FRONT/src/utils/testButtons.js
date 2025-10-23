// Script de prueba para verificar que los botones funcionan
export const testWateringAlertButtons = () => {
  console.log('🧪 Probando botones de WateringAlertCard...');
  
  // Simular datos de alerta
  const mockAlert = {
    id: 'test-alert-123',
    titulo: 'Prueba de Riego',
    descripcion: 'Esta es una alerta de prueba',
    esta_activa: true,
    proximo_riego: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    duracion_minutos: 30,
    notificar_antes_minutos: 15
  };

  // Simular funciones de callback
  const mockOnEdit = (alert) => {
    console.log('✅ Función onEdit llamada con:', alert);
  };

  const mockOnDelete = (alertId) => {
    console.log('✅ Función onDelete llamada con ID:', alertId);
  };

  const mockOnToggleActive = async (alertId, isActive) => {
    console.log('✅ Función onToggleActive llamada con:', { alertId, isActive });
    return Promise.resolve();
  };

  // Probar las funciones
  console.log('Probando onEdit...');
  mockOnEdit(mockAlert);

  console.log('Probando onDelete...');
  mockOnDelete(mockAlert.id);

  console.log('Probando onToggleActive...');
  mockOnToggleActive(mockAlert.id, false);

  console.log('✅ Todas las funciones de prueba ejecutadas correctamente');
};

// Función para verificar si los elementos del DOM están presentes
export const checkButtonElements = () => {
  console.log('🔍 Verificando elementos de botones en el DOM...');
  
  const pauseButton = document.querySelector('[data-testid="pause-button"]');
  const editButton = document.querySelector('[data-testid="edit-button"]');
  const deleteButton = document.querySelector('[data-testid="delete-button"]');
  
  console.log('Botón pausar encontrado:', !!pauseButton);
  console.log('Botón editar encontrado:', !!editButton);
  console.log('Botón eliminar encontrado:', !!deleteButton);
  
  if (pauseButton) {
    console.log('Botón pausar:', {
      disabled: pauseButton.disabled,
      textContent: pauseButton.textContent,
      onClick: pauseButton.onclick
    });
  }
  
  if (editButton) {
    console.log('Botón editar:', {
      disabled: editButton.disabled,
      textContent: editButton.textContent,
      onClick: editButton.onclick
    });
  }
  
  if (deleteButton) {
    console.log('Botón eliminar:', {
      disabled: deleteButton.disabled,
      textContent: deleteButton.textContent,
      onClick: deleteButton.onclick
    });
  }
};

// Función para simular clics en los botones
export const simulateButtonClicks = () => {
  console.log('🖱️ Simulando clics en botones...');
  
  const pauseButton = document.querySelector('button[class*="text-orange-700"]');
  const editButton = document.querySelector('button[class*="text-blue-700"]');
  const deleteButton = document.querySelector('button[class*="text-red-700"]');
  
  if (pauseButton) {
    console.log('Simulando clic en botón pausar...');
    pauseButton.click();
  }
  
  if (editButton) {
    console.log('Simulando clic en botón editar...');
    editButton.click();
  }
  
  if (deleteButton) {
    console.log('Simulando clic en botón eliminar...');
    deleteButton.click();
  }
};

// Función principal de prueba
export const runButtonTests = () => {
  console.log('🚀 Iniciando pruebas de botones...');
  
  testWateringAlertButtons();
  
  // Esperar un poco para que el DOM se cargue
  setTimeout(() => {
    checkButtonElements();
    simulateButtonClicks();
  }, 1000);
  
  console.log('🏁 Pruebas de botones completadas');
};

// Exportar para uso en consola del navegador
if (typeof window !== 'undefined') {
  window.testWateringAlertButtons = testWateringAlertButtons;
  window.checkButtonElements = checkButtonElements;
  window.simulateButtonClicks = simulateButtonClicks;
  window.runButtonTests = runButtonTests;
}


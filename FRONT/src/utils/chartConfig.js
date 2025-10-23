// Configuración para Chart.js optimizada para generar gráficas en PDF
export const chartConfig = {
  // Configuración común para todos los gráficos
  common: {
    responsive: false,
    animation: false,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 12,
            family: 'Arial, sans-serif'
          },
          color: '#374151'
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#22c55e',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 10,
            family: 'Arial, sans-serif'
          },
          color: '#6b7280'
        },
        grid: {
          color: '#e5e7eb',
          lineWidth: 0.5
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 10,
            family: 'Arial, sans-serif'
          },
          color: '#6b7280'
        },
        grid: {
          color: '#e5e7eb',
          lineWidth: 0.5
        }
      }
    }
  },

  // Configuración específica para gráficos de barras
  bar: {
    backgroundColor: 'rgba(34, 197, 94, 0.8)',
    borderColor: 'rgba(34, 197, 94, 1)',
    borderWidth: 2,
    borderRadius: 4
  },

  // Configuración específica para gráficos de líneas
  line: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: 'rgba(34, 197, 94, 1)',
    borderWidth: 3,
    fill: true,
    tension: 0.4,
    pointBackgroundColor: 'rgba(34, 197, 94, 1)',
    pointBorderColor: '#ffffff',
    pointBorderWidth: 2,
    pointRadius: 4
  },

  // Colores predefinidos para diferentes tipos de datos
  colors: {
    agua: {
      backgroundColor: 'rgba(6, 182, 212, 0.8)',
      borderColor: 'rgba(6, 182, 212, 1)'
    },
    siembra: {
      backgroundColor: 'rgba(34, 197, 94, 0.8)',
      borderColor: 'rgba(34, 197, 94, 1)'
    },
    cosecha: {
      backgroundColor: 'rgba(6, 182, 212, 0.8)',
      borderColor: 'rgba(6, 182, 212, 1)'
    },
    abono: {
      backgroundColor: 'rgba(34, 197, 94, 0.2)',
      borderColor: 'rgba(34, 197, 94, 1)'
    },
    plagas: {
      backgroundColor: 'rgba(239, 68, 68, 0.8)',
      borderColor: 'rgba(239, 68, 68, 1)'
    }
  }
};

// Función para crear configuración de gráfico combinando configuraciones
export const createChartConfig = (type, customOptions = {}) => {
  return {
    ...chartConfig.common,
    ...chartConfig[type],
    ...customOptions
  };
};

// Función para crear datasets con colores predefinidos
export const createDataset = (label, data, colorKey, type = 'bar') => {
  const colors = chartConfig.colors[colorKey] || chartConfig.colors.siembra;
  
  return {
    label,
    data,
    type,
    ...colors,
    ...chartConfig[type]
  };
};


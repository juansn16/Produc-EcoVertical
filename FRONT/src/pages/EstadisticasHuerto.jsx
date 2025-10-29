import { useState, useMemo, useEffect, useRef } from "react";
import Header from "@/components/layout/Header";

// Componente de Spinner para loading de reportes
const ReporteSpinner = ({ isLoading, tiempoEstimado, tipoReporte, progresoActual, tiempoRestante }) => {
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center">
          {/* Spinner */}
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
          
          {/* Título */}
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Generando Reporte
          </h3>
          
          {/* Tipo de reporte */}
          <p className="text-sm text-gray-600 mb-2">
            {tipoReporte === 'agua' && '💧 Reporte de Agua'}
            {tipoReporte === 'plagas' && '🐛 Reporte de Plagas'}
            {tipoReporte === 'abono' && '🌱 Reporte de Abono'}
            {tipoReporte === 'siembra' && '🌿 Reporte de Siembra'}
            {tipoReporte === 'mantenimiento' && '🔧 Reporte de Mantenimiento'}
            {tipoReporte === 'completo' && '📊 Reporte Completo'}
          </p>
          
          {/* Tiempo estimado */}
          {tiempoEstimado && (
            <p className="text-sm text-green-600 font-medium mb-2">
              {tiempoEstimado}
            </p>
          )}
          
          {/* Tiempo restante */}
          {tiempoRestante > 0 && (
            <p className="text-sm text-blue-600 font-medium mb-4">
              Tiempo restante: {Math.ceil(tiempoRestante)} segundos
            </p>
          )}
          
          {/* Progreso animado */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all duration-300 ease-out" 
              style={{width: `${progresoActual}%`}}
            ></div>
          </div>
          
          {/* Porcentaje de progreso */}
          <p className="text-xs text-gray-500 mb-2">
            {Math.round(progresoActual)}% completado
          </p>
          
          {/* Mensaje */}
          <p className="text-xs text-gray-500">
            Por favor espera mientras procesamos tu reporte...
          </p>
        </div>
      </div>
    </div>
  );
};
import Boton from "@/components/layout/Boton";
import { Label } from "@/components/layout/label";
import SuccessNotification from "@/components/common/SuccessNotification";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/layout/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/layout/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ComposedChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";
import {
  Search,
  User,
  Calendar,
  Filter,
  RotateCcw,
  Download,
  FileText,
  AlertCircle,
  Droplets,
  Leaf,
  Bug,
  Flower,
} from "lucide-react";
import useStatistics from "@/hooks/useStatistics";
import { createChartConfig, createDataset } from "@/utils/chartConfig";
import { debugStatistics } from "@/utils/debugStatistics";

export default function EstadisticasHuerto() {
  // Hook para el tema
  const { isDarkMode, theme } = useTheme();
  
  // Obtener el gardenId del localStorage en lugar de los parámetros de URL
  const gardenId = localStorage.getItem("selectedGardenId");
  const { 
    loading, 
    error, 
    data, 
    refresh, 
    clearCache,
    loadSpecificStatistics,
    getFilteredData, 
    calculateSummary 
  } = useStatistics(gardenId);

  // Estados para los filtros de fecha
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [filtrosActivos, setFiltrosActivos] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estados para datos específicos de las tablas
  const [specificAbonoData, setSpecificAbonoData] = useState([]);
  const [specificPlagasData, setSpecificPlagasData] = useState([]);
  const [specificAguaData, setSpecificAguaData] = useState([]);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Estados para loading de reportes
  const [loadingReportes, setLoadingReportes] = useState({
    agua: false,
    siembra: false,
    abono: false,
    plagas: false,
    mantenimiento: false,
    completo: false
  });
  const [tiempoEstimado, setTiempoEstimado] = useState("");
  const [progresoActual, setProgresoActual] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const intervaloProgresoRef = useRef(null);

  // Función para simular progreso durante la generación
  const iniciarProgresoSimulado = (tiempoEstimadoSegundos) => {
    // Limpiar intervalo anterior si existe
    if (intervaloProgresoRef.current) {
      clearInterval(intervaloProgresoRef.current);
    }
    
    setProgresoActual(0);
    setTiempoRestante(tiempoEstimadoSegundos);
    
    intervaloProgresoRef.current = setInterval(() => {
      setProgresoActual(prev => {
        const nuevoProgreso = prev + (100 / (tiempoEstimadoSegundos * 10)); // 10 actualizaciones por segundo
        return Math.min(nuevoProgreso, 95); // Máximo 95% hasta que termine realmente
      });
      
      setTiempoRestante(prev => {
        const nuevoTiempo = prev - 0.1;
        return Math.max(nuevoTiempo, 0);
      });
    }, 100); // Actualizar cada 100ms
  };

  // Función para detener el progreso simulado
  const detenerProgresoSimulado = () => {
    if (intervaloProgresoRef.current) {
      clearInterval(intervaloProgresoRef.current);
      intervaloProgresoRef.current = null;
    }
    setProgresoActual(100); // Completar al 100%
    setTiempoRestante(0);
  };

  // Función para detectar descarga y completar progreso
  const detectarDescargaYCompletarProgreso = () => {
    // Completar progreso inmediatamente cuando se inicia la descarga
    setProgresoActual(100);
    setTiempoRestante(0);
    
    // Detener el progreso simulado
    if (intervaloProgresoRef.current) {
      clearInterval(intervaloProgresoRef.current);
      intervaloProgresoRef.current = null;
    }
    
    console.log('📥 Descarga detectada - Progreso completado al 100%');
    
    // Pequeño delay para que el usuario vea el 100% antes de ocultar el spinner
    setTimeout(() => {
      // Desactivar loading después de mostrar el 100%
      setLoadingReportes(prev => {
        const newState = { ...prev };
        Object.keys(newState).forEach(key => {
          if (newState[key]) {
            newState[key] = false;
          }
        });
        return newState;
      });
      setTiempoEstimado("");
    }, 1000); // 1 segundo de delay
  };

  // Función para calcular tiempo estimado de generación (basado en tiempos reales)
  const calcularTiempoEstimado = (tipoReporte, cantidadDatos) => {
    const tiemposBase = {
      agua: 8, // segundos base realistas
      siembra: 6,
      abono: 8,
      plagas: 12, // más tiempo por análisis IA
      mantenimiento: 6,
      completo: 25 // mucho más tiempo por análisis completo y múltiples secciones
    };
    
    const tiempoBase = tiemposBase[tipoReporte] || 8;
    
    // Factor más realista basado en cantidad de datos
    let factorDatos = 0;
    if (cantidadDatos > 0) {
      factorDatos = Math.min(cantidadDatos / 5, 8); // máximo 8 segundos adicionales
    }
    
    // Factor adicional para análisis de IA
    let factorIA = 0;
    if (tipoReporte === 'plagas' || tipoReporte === 'completo') {
      factorIA = Math.min(cantidadDatos / 3, 15); // hasta 15 segundos adicionales para IA
    }
    
    const tiempoTotal = Math.ceil(tiempoBase + factorDatos + factorIA);
    return Math.max(tiempoTotal, 5); // mínimo 5 segundos
  };

  // Limpiar intervalo al desmontar el componente
  useEffect(() => {
    return () => {
      if (intervaloProgresoRef.current) {
        clearInterval(intervaloProgresoRef.current);
      }
    };
  }, []);

  // Datos filtrados usando useMemo para optimizar rendimiento
  const filteredData = useMemo(
    () => getFilteredData(fechaInicio, fechaFin),
    [fechaInicio, fechaFin, getFilteredData]
  );

  const { aguaData, siembraData, abonoData, plagasData, mantenimientoData } = filteredData;
  
  // Log temporal para depuración
  console.log('🔍 EstadisticasHuerto - Datos filtrados:', {
    fechaInicio,
    fechaFin,
    aguaDataLength: aguaData?.length || 0,
    siembraDataLength: siembraData?.length || 0,
    abonoDataLength: abonoData?.length || 0,
    plagasDataLength: plagasData?.length || 0,
    mantenimientoDataLength: mantenimientoData?.length || 0,
    aguaDataFirst: aguaData?.[0],
    siembraDataFirst: siembraData?.[0],
    rawData: data
  });
  
  // Función helper para obtener los datos correctos (específicos si están disponibles, sino los generales)
  const getTableData = (type) => {
    switch (type) {
      case 'abono':
        return specificAbonoData.length > 0 ? specificAbonoData : abonoData;
      case 'plagas':
        return specificPlagasData.length > 0 ? specificPlagasData : plagasData;
      case 'agua':
        return specificAguaData.length > 0 ? specificAguaData : aguaData;
      default:
        return [];
    }
  };

  // Función para recargar todas las estadísticas (generales + específicas)
  const recargarTodasLasEstadisticas = async () => {
    console.log('🔄 Recargando todas las estadísticas...');
    try {
      // Recargar datos generales primero
      console.log('📊 Recargando datos generales...');
      await refresh();
      console.log('✅ Datos generales recargados');
      
      // Recargar datos específicos con las nuevas rutas
      console.log('🔍 Recargando datos específicos...');
      const [fertilizerResult, pestsResult, waterResult] = await Promise.all([
        loadSpecificStatistics(gardenId, 'fertilizer').catch(err => {
          console.error('❌ Error cargando estadísticas de abono:', err);
          return null;
        }),
        loadSpecificStatistics(gardenId, 'pests').catch(err => {
          console.error('❌ Error cargando estadísticas de plagas:', err);
          return null;
        }),
        loadSpecificStatistics(gardenId, 'water').catch(err => {
          console.error('❌ Error cargando estadísticas de agua:', err);
          return null;
        })
      ]);
      
       // Actualizar estados locales solo si los datos son válidos
       console.log('💾 Actualizando estados locales...');
       if (fertilizerResult && fertilizerResult.fertilizerData) {
         setSpecificAbonoData(fertilizerResult.fertilizerData);
         console.log('✅ Datos de abono actualizados:', fertilizerResult.fertilizerData.length, 'registros');
         if (debugStatistics.isEnabled()) {
           debugStatistics.debugAbonoData(fertilizerResult.fertilizerData, 'Estado Local Actualizado');
         }
       } else {
         console.log('⚠️ No se pudieron cargar datos de abono');
         if (debugStatistics.isEnabled()) {
           console.log('🔍 Debug - Fertilizer result:', fertilizerResult);
         }
       }
       
       if (pestsResult && pestsResult.pestData) {
         setSpecificPlagasData(pestsResult.pestData);
         console.log('✅ Datos de plagas actualizados:', pestsResult.pestData.length, 'registros');
         if (debugStatistics.isEnabled()) {
           debugStatistics.debugPlagasData(pestsResult.pestData, 'Estado Local Actualizado');
         }
       } else {
         console.log('⚠️ No se pudieron cargar datos de plagas');
         if (debugStatistics.isEnabled()) {
           console.log('🔍 Debug - Pests result:', pestsResult);
         }
       }
       
       if (waterResult && waterResult.waterData) {
         setSpecificAguaData(waterResult.waterData);
         console.log('✅ Datos de agua actualizados:', waterResult.waterData.length, 'registros');
         if (debugStatistics.isEnabled()) {
           debugStatistics.debugAguaData(waterResult.waterData, 'Estado Local Actualizado');
         }
       } else {
         console.log('⚠️ No se pudieron cargar datos de agua');
         if (debugStatistics.isEnabled()) {
           console.log('🔍 Debug - Water result:', waterResult);
         }
       }
      
      console.log('✅ Todas las estadísticas recargadas exitosamente');
    } catch (error) {
      console.error('❌ Error crítico recargando estadísticas:', error);
      // En caso de error, al menos intentar recargar los datos generales
      try {
        console.log('🔄 Intentando recarga de emergencia...');
        await refresh();
        console.log('✅ Recarga de emergencia exitosa');
      } catch (emergencyError) {
        console.error('❌ Error en recarga de emergencia:', emergencyError);
      }
    }
  };

  // Función para aplicar filtros
  const aplicarFiltros = () => {
    setFiltrosActivos(true);
  };

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFechaInicio("");
    setFechaFin("");
    setFiltrosActivos(false);
  };

  // Función para obtener estadísticas resumidas
  const obtenerEstadisticas = () => {
    return calculateSummary(filteredData);
  };


  // Verificar si hay un huerto seleccionado
  if (!gardenId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-huertotech-cream to-huertotech-green-light">
        <Header type="Residente" />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-theme-primary mb-4">
                No hay huerto seleccionado
              </h1>
              <p className="text-theme-primary/80 mb-6">
                Para ver las estadísticas, primero debes seleccionar un huerto.
              </p>
              <Boton
                texto="Seleccionar Huerto"
                onClick={() => window.location.href = "/select-garden"}
                variant="primary"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Función para crear gráficas en PDF usando Chart.js
  const createChartImage = async (chartData, chartType, options = {}) => {
    try {
      console.log('📊 Creando gráfica:', { chartType, dataLength: chartData?.datasets?.[0]?.data?.length || 0 });
      
      // Importar Chart.js dinámicamente
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);
      
      // Crear un canvas temporal
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      
      // Usar configuración predefinida
      const chartOptions = createChartConfig(chartType, options);
      
      // Crear el gráfico
      const chart = new Chart(ctx, {
        type: chartType,
        data: chartData,
        options: chartOptions
      });
      
      // Renderizar el gráfico
      chart.render();
      
      // Convertir a imagen
      const imageData = canvas.toDataURL('image/png');
      
      // Limpiar
      chart.destroy();
      
      console.log('✅ Gráfica creada exitosamente');
      return imageData;
    } catch (error) {
      console.error('❌ Error creando gráfica:', error);
      return null;
    }
  };

  // Función auxiliar para agregar texto largo con paginación automática y formato mejorado
  const agregarTextoConPaginacion = (doc, texto, startY, titulo = null) => {
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    const maxWidth = 180; // Ancho máximo para el texto
    const lineHeight = 6; // Altura entre líneas aumentada para mejor legibilidad
    const maxY = pageHeight - 30; // Margen inferior para el footer
    let currentY = startY;

    // Agregar título si se proporciona con estilo mejorado
    if (titulo) {
      // Verificar espacio para título
      if (currentY + 20 > maxY) {
        doc.addPage();
        currentY = 20;
        agregarHeaderContinuacion(doc, margin, currentY);
        currentY += 8;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(34, 197, 94); // Verde EcoVertical para títulos
      doc.text(titulo, margin, currentY);
      currentY += 12;
      
      // Línea decorativa bajo el título
      doc.setDrawColor(34, 197, 94);
      doc.setLineWidth(0.5);
      doc.line(margin, currentY - 2, margin + 50, currentY - 2);
      currentY += 8;
    }

    // Procesar el texto para manejar formato básico mejorado y corregir ortografía
    const procesarTexto = (texto) => {
      return texto
        // Corregir errores de ortografía comunes
        .replace(/Anlisis/g, 'Análisis')
        .replace(/Produccin/g, 'Producción')
        .replace(/Perodo/g, 'Período')
        .replace(/Prcticas/g, 'Prácticas')
        .replace(/hdrico/g, 'hídrico')
        .replace(/Prdida/g, 'Pérdida')
        .replace(/cumplimentacin/g, 'cumplimentación')
        .replace(/mtodo/g, 'método')
        .replace(/Capacitacin/g, 'Capacitación')
        .replace(/gestin/g, 'gestión')
        .replace(/operacin/g, 'operación')
        .replace(/implementacin/g, 'implementación')
        .replace(/monitoreo/g, 'monitoreo')
        .replace(/sistemtico/g, 'sistemático')
        .replace(/especfico/g, 'específico')
        .replace(/tcnico/g, 'técnico')
        .replace(/climtico/g, 'climático')
        .replace(/hidrolgico/g, 'hidrológico')
        .replace(/agronmico/g, 'agronómico')
        .replace(/econmico/g, 'económico')
        .replace(/ecolgico/g, 'ecológico')
        .replace(/biolgico/g, 'biológico')
        .replace(/fsico/g, 'físico')
        .replace(/qumico/g, 'químico')
        .replace(/automtico/g, 'automático')
        .replace(/dinmico/g, 'dinámico')
        .replace(/esttico/g, 'estático')
        .replace(/crtico/g, 'crítico')
        .replace(/prctico/g, 'práctico')
        .replace(/terico/g, 'teórico')
        .replace(/emprico/g, 'empírico')
        .replace(/histrico/g, 'histórico')
        .replace(/geogrfico/g, 'geográfico')
        .replace(/demogrfico/g, 'demográfico')
        .replace(/estadstico/g, 'estadístico')
        .replace(/matemtico/g, 'matemático')
        .replace(/cientfico/g, 'científico')
        .replace(/acadmico/g, 'académico')
        .replace(/poltico/g, 'político')
        .replace(/social/g, 'social')
        .replace(/cultural/g, 'cultural')
        .replace(/natural/g, 'natural')
        .replace(/artificial/g, 'artificial')
        .replace(/manual/g, 'manual')
        .replace(/automtico/g, 'automático')
        .replace(/mecnico/g, 'mecánico')
        .replace(/elctrico/g, 'eléctrico')
        .replace(/electrnico/g, 'electrónico')
        .replace(/digital/g, 'digital')
        .replace(/analgico/g, 'analógico')
        .replace(/virtual/g, 'virtual')
        .replace(/real/g, 'real')
        .replace(/potencial/g, 'potencial')
        .replace(/actual/g, 'actual')
        .replace(/futuro/g, 'futuro')
        .replace(/pasado/g, 'pasado')
        .replace(/presente/g, 'presente')
        .replace(/continuo/g, 'continuo')
        .replace(/discontinuo/g, 'discontinuo')
        .replace(/permanente/g, 'permanente')
        .replace(/temporal/g, 'temporal')
        .replace(/inmediato/g, 'inmediato')
        .replace(/mediato/g, 'mediato')
        .replace(/directo/g, 'directo')
        .replace(/indirecto/g, 'indirecto')
        .replace(/positivo/g, 'positivo')
        .replace(/negativo/g, 'negativo')
        .replace(/neutro/g, 'neutro')
        .replace(/activo/g, 'activo')
        .replace(/pasivo/g, 'pasivo')
        .replace(/interno/g, 'interno')
        .replace(/externo/g, 'externo')
        .replace(/superior/g, 'superior')
        .replace(/inferior/g, 'inferior')
        .replace(/anterior/g, 'anterior')
        .replace(/posterior/g, 'posterior')
        .replace(/primero/g, 'primero')
        .replace(/segundo/g, 'segundo')
        .replace(/tercero/g, 'tercero')
        .replace(/ltimo/g, 'último')
        .replace(/primero/g, 'primero')
        .replace(/principal/g, 'principal')
        .replace(/secundario/g, 'secundario')
        .replace(/terciario/g, 'terciario')
        .replace(/cuaternario/g, 'cuaternario')
        .replace(/quintario/g, 'quintario')
        .replace(/sextario/g, 'sextario')
        .replace(/septenario/g, 'septenario')
        .replace(/octenario/g, 'octenario')
        .replace(/novenario/g, 'novenario')
        .replace(/decenario/g, 'decenario')
        .replace(/centenario/g, 'centenario')
        .replace(/milenario/g, 'milenario')
        .replace(/anual/g, 'anual')
        .replace(/mensual/g, 'mensual')
        .replace(/semanal/g, 'semanal')
        .replace(/diario/g, 'diario')
        .replace(/horario/g, 'horario')
        .replace(/minutario/g, 'minutario')
        .replace(/segundario/g, 'segundario')
        .replace(/milisegundario/g, 'milisegundario')
        .replace(/microsegundario/g, 'microsegundario')
        .replace(/nanosegundario/g, 'nanosegundario')
        .replace(/picosegundario/g, 'picosegundario')
        .replace(/femtosegundario/g, 'femtosegundario')
        .replace(/attosegundario/g, 'attosegundario')
        .replace(/zeptosegundario/g, 'zeptosegundario')
        .replace(/yoctosegundario/g, 'yoctosegundario')
        .replace(/plancksegundario/g, 'plancksegundario')
        .replace(/das/g, 'días')
        .replace(/meses/g, 'meses')
        .replace(/aos/g, 'años')
        .replace(/horas/g, 'horas')
        .replace(/minutos/g, 'minutos')
        .replace(/segundos/g, 'segundos')
        .replace(/milisegundos/g, 'milisegundos')
        .replace(/microsegundos/g, 'microsegundos')
        .replace(/nanosegundos/g, 'nanosegundos')
        .replace(/picosegundos/g, 'picosegundos')
        .replace(/femtosegundos/g, 'femtosegundos')
        .replace(/attosegundos/g, 'attosegundos')
        .replace(/zeptosegundos/g, 'zeptosegundos')
        .replace(/yoctosegundos/g, 'yoctosegundos')
        .replace(/plancksegundos/g, 'plancksegundos')
        // Correcciones adicionales de ortografía específicas
        .replace(/anlisis/g, 'análisis')
        .replace(/perodo/g, 'período')
        .replace(/prctica/g, 'práctica')
        .replace(/aplicadías/g, 'aplicadas')
        .replace(/observadías/g, 'observadas')
        .replace(/limitacin/g, 'limitación')
        .replace(/volmenes/g, 'volúmenes')
        .replace(/informadías/g, 'informadas')
        .replace(/estrs/g, 'estrés')
        .replace(/hdrico/g, 'hídrico')
        .replace(/especficas/g, 'específicas')
        .replace(/requerimientos/g, 'requerimientos')
        .replace(/aplicadías/g, 'aplicadas')
        .replace(/dao/g, 'daño')
        .replace(/races/g, 'raíces')
        .replace(/ahogamiento/g, 'ahogamiento')
        .replace(/interpretacin/g, 'interpretación')
        .replace(/Recoleccin/g, 'Recolección')
        .replace(/informacin/g, 'información')
        .replace(/climticas/g, 'climáticas')
        .replace(/cadías/g, 'caídas')
        .replace(/hdricas/g, 'hídricas')
        .replace(/mtricas/g, 'métricas')
        .replace(/todías/g, 'todas')
        .replace(/especficamente/g, 'específicamente')
        .replace(/estandarizado/g, 'estandarizado')
        .replace(/estandarizar/g, 'estandarizar')
        .replace(/mtricas/g, 'métricas')
        .replace(/estimacin/g, 'estimación')
        .replace(/ambientales/g, 'ambientales')
        .replace(/temperatura/g, 'temperatura')
        .replace(/humedad/g, 'humedad')
        .replace(/lluvias/g, 'lluvias')
        .replace(/ajustar/g, 'ajustar')
        .replace(/planes/g, 'planes')
        .replace(/riego/g, 'riego')
        .replace(/monitoreo/g, 'monitoreo')
        .replace(/medidor/g, 'medidor')
        .replace(/determinar/g, 'determinar')
        .replace(/calendario/g, 'calendario')
        .replace(/visual/g, 'visual')
        .replace(/asegurar/g, 'asegurar')
        .replace(/consistentemente/g, 'consistentemente')
        .replace(/especificada/g, 'especificada')
        .replace(/integrar/g, 'integrar')
        .replace(/factores/g, 'factores')
        .replace(/registrar/g, 'registrar')
        .replace(/cuenta/g, 'cuenta')
        .replace(/datos/g, 'datos')
        .replace(/temperatura/g, 'temperatura')
        .replace(/ambiente/g, 'ambiente')
        .replace(/relativa/g, 'relativa')
        .replace(/presencia/g, 'presencia')
        .replace(/ajustar/g, 'ajustar')
        .replace(/planes/g, 'planes')
        .replace(/riego/g, 'riego')
        // Correcciones específicas adicionales
        .replace(/extraccin/g, 'extracción')
        .replace(/Distribucin/g, 'Distribución')
        .replace(/recibio/g, 'recibió')
        .replace(/recibi/g, 'recibió')
        .replace(/debera/g, 'debería')
        .replace(/deberia/g, 'debería')
        .replace(/analisis/g, 'análisis')
        .replace(/profundo/g, 'profundo')
        .replace(/conclusiones/g, 'conclusiones')
        .replace(/robustas/g, 'robustas')
        .replace(/patrones/g, 'patrones')
        .replace(/eficiencia/g, 'eficiencia')
        .replace(/consumido/g, 'consumido')
        .replace(/disponibles/g, 'disponibles')
        .replace(/desigual/g, 'desigual')
        .replace(/siembra/g, 'siembra')
        .replace(/ocasion/g, 'ocasión')
        .replace(/mientras/g, 'mientras')
        .replace(/mostrando/g, 'mostrando')
        .replace(/diferencia/g, 'diferencia')
        .replace(/significativa/g, 'significativa')
        .replace(/cantidades/g, 'cantidades')
        .replace(/individuales/g, 'individuales')
        .replace(/identificado/g, 'identificado')
        .replace(/inconsistencia/g, 'inconsistencia')
        .replace(/campo/g, 'campo')
        .replace(/promedioPorRiego/g, 'promedioPorRiego')
        .replace(/indica/g, 'indica')
        .replace(/promedio/g, 'promedio')
        .replace(/dada/g, 'dada')
        .replace(/cantidad/g, 'cantidad')
        .replace(/total/g, 'total')
        .replace(/registros/g, 'registros')
        .replace(/individuales/g, 'individuales')
        .replace(/real/g, 'real')
        .replace(/deberia/g, 'debería')
        // Formato de texto
        .replace(/### /g, '\n\n') // Subtítulos principales
        .replace(/## /g, '\n\n') // Subtítulos
        .replace(/\*\*(.*?)\*\*/g, '$1') // Negrita
        .replace(/\*(.*?)\*/g, '$1') // Cursiva
        .replace(/---/g, '\n\n') // Separadores
        // Manejar mejor las frases problemáticas como "COMPARACIÓN MENSUAL"
        .replace(/COMPARACIÓN MENSUAL/g, 'Comparación Mensual')
        .replace(/TENDENCIA:/g, 'Tendencia:')
        .replace(/CAMBIO:/g, 'Cambio:')
        .replace(/\n{3,}/g, '\n\n') // Múltiples saltos de línea
        .replace(/\s+/g, ' ') // Normalizar espacios
        .trim();
    };

    const textoProcesado = procesarTexto(texto);
    
    // Dividir en párrafos simples sin separación automática
    const parrafos = textoProcesado.split('\n\n').filter(p => p.trim().length > 0);
    
    console.log(`📄 Procesando ${parrafos.length} párrafos de análisis IA`);

    // Procesar cada párrafo
    for (let i = 0; i < parrafos.length; i++) {
      const parrafo = parrafos[i].trim();
      
      // Verificar si es un subtítulo mejorado - criterios más específicos
      const esSubtitulo = /^\d+\.\s/.test(parrafo) || 
                         parrafo.startsWith('**') ||
                         (parrafo.length < 50 && parrafo.includes(':') && !parrafo.includes('COMPARACIÓN MENSUAL')) ||
                         (parrafo.length < 80 && parrafo.endsWith(':') && !parrafo.includes('COMPARACIÓN MENSUAL')) ||
                         // Solo considerar texto en mayúsculas si es muy corto y no contiene palabras específicas problemáticas
                         (/^[A-Z\s]+$/.test(parrafo) && parrafo.length < 30 && !parrafo.includes('COMPARACIÓN MENSUAL') && !parrafo.includes('TENDENCIA') && !parrafo.includes('CAMBIO'));

      if (esSubtitulo) {
        // Verificar espacio para subtítulo
        if (currentY + 20 > maxY) {
          doc.addPage();
          currentY = 20;
          agregarHeaderContinuacion(doc, margin, currentY);
          currentY += 8;
        }

        // Configurar subtítulo con estilo mejorado
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(34, 197, 94); // Verde EcoVertical
        doc.text(parrafo, margin, currentY);
        currentY += 12;
        
        // Línea decorativa sutil bajo subtítulos
        doc.setDrawColor(34, 197, 94);
        doc.setLineWidth(0.3);
        doc.line(margin, currentY - 2, margin + 30, currentY - 2);
        currentY += 4; // Espacio mínimo después de subtítulos
      } else {
        // Configurar texto normal con mejor formato
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(55, 65, 81);

        // Dividir el párrafo en líneas con justificación
        const lines = doc.splitTextToSize(parrafo, maxWidth);
        
        // Procesar cada línea del párrafo
        for (let j = 0; j < lines.length; j++) {
          const line = lines[j];
          
          // Verificar si necesitamos una nueva página
          if (currentY + lineHeight > maxY) {
            console.log(`📄 Nueva página necesaria en párrafo ${i + 1}, línea ${j + 1}`);
            doc.addPage();
            currentY = 20;
            agregarHeaderContinuacion(doc, margin, currentY);
            currentY += 8;
          }

          // Agregar la línea al PDF con justificación mejorada
          // Para texto justificado, usamos align: 'justify' cuando es posible
          if (line.length > 20) { // Solo justificar líneas suficientemente largas
            doc.text(line, margin, currentY, { align: 'justify', maxWidth: maxWidth });
          } else {
            doc.text(line, margin, currentY);
          }
          currentY += lineHeight;
          
          // Espacio adicional después de cada línea para evitar superposiciones
          if (j === lines.length - 1) {
            currentY += 4; // Más espacio al final del párrafo
          }
        }
        
        // Espacio mínimo entre párrafos para mantener texto continuo
        currentY += 2; // Espacio mínimo
      }

      // Espacio mínimo entre párrafos principales
      currentY += 3; // Espacio mínimo
    }

    // Espacio adicional después del texto completo
    currentY += 12;
    
    console.log(`✅ Análisis IA agregado exitosamente. Posición final Y: ${currentY}`);
    return currentY;
  };

  // Función auxiliar para agregar header de continuación
  const agregarHeaderContinuacion = (doc, margin, currentY) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(107, 114, 128);
    doc.text("Análisis IA (Gemini) - continuación", margin, currentY);
  };

  // Función auxiliar para crear tablas manualmente en PDF con nuevo formato
  const crearTablaManual = (doc, datos, columnas, startY, titulo, colorHeader = null, compactMode = false) => {
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    const tableWidth = pageWidth - 2 * margin;
    const colWidth = tableWidth / columnas.length;
    let currentY = startY;

    // Título de la tabla
    if (titulo) {
      doc.setFontSize(compactMode ? 10 : 12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(55, 65, 81);
      doc.text(titulo, margin, currentY);
      currentY += compactMode ? 6 : 10;
    }

    // Header de la tabla con colores específicos por sección
    const headerColor = colorHeader || [34, 197, 94]; // Verde por defecto
    const headerHeight = compactMode ? 7 : 10;
    doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
    doc.rect(margin, currentY, tableWidth, headerHeight, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(compactMode ? 8 : 10);
    doc.setFont("helvetica", "bold");

    columnas.forEach((col, index) => {
      doc.text(col.header, margin + index * colWidth + 3, currentY + (compactMode ? 4 : 6));
    });
    currentY += headerHeight;

    // Filas de datos con mejor formato
    doc.setFont("helvetica", "normal");
    doc.setFontSize(compactMode ? 7 : 9);

    if (datos.length === 0) {
      doc.setTextColor(107, 114, 128);
      doc.setFontSize(compactMode ? 8 : 10);
      doc.text("No hay datos disponibles para el rango seleccionado", margin + 2, currentY + (compactMode ? 5 : 8));
      return currentY + (compactMode ? 10 : 15);
    }

    const rowHeight = compactMode ? 6 : 8;
    datos.forEach((item, rowIndex) => {
      // Alternar colores de fondo para mejor legibilidad
      if (rowIndex % 2 === 0) {
        // Color de fondo alternado basado en el tipo de tabla
        if (colorHeader && colorHeader[0] === 6 && colorHeader[1] === 182 && colorHeader[2] === 212) {
          // Cyan para agua
          doc.setFillColor(207, 250, 254);
        } else if (colorHeader && colorHeader[0] === 239 && colorHeader[1] === 68 && colorHeader[2] === 68) {
          // Rojo para plagas
          doc.setFillColor(254, 226, 226);
        } else if (colorHeader && colorHeader[0] === 147 && colorHeader[1] === 51 && colorHeader[2] === 234) {
          // Púrpura para mantenimiento
          doc.setFillColor(243, 232, 255);
        } else {
          // Verde por defecto
          doc.setFillColor(240, 253, 244);
        }
        doc.rect(margin, currentY, tableWidth, rowHeight, "F");
      }

      doc.setTextColor(55, 65, 81);
      columnas.forEach((col, colIndex) => {
        const value = item[col.key] || "";
        // Truncar texto largo para evitar desbordamiento
        const text = String(value);
        const maxLength = Math.floor(colWidth / (compactMode ? 1.2 : 1.5)); // Más compacto en modo compacto
        const displayText = text.length > maxLength ? text.substring(0, maxLength - 3) + "..." : text;
        doc.text(displayText, margin + colIndex * colWidth + 3, currentY + (compactMode ? 3 : 5));
      });
      currentY += rowHeight;

      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
    });

    return currentY + (compactMode ? 5 : 10);
  };

  // Función especial para tabla de rendimiento con anchos personalizados
  const crearTablaRendimiento = (doc, datos, columnas, startY, titulo) => {
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    const tableWidth = pageWidth - 2 * margin;
    
    // Anchos personalizados para cada columna (en porcentaje del ancho total)
    const colWidths = [0.12, 0.12, 0.12, 0.12, 0.20, 0.32]; // La última columna (Interpretación) es más ancha
    const actualColWidths = colWidths.map(width => tableWidth * width);
    
    let currentY = startY;

    // Título de la tabla
    if (titulo) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(55, 65, 81);
      doc.text(titulo, margin, currentY);
      currentY += 10;
    }

    // Header de la tabla
    doc.setFillColor(34, 197, 94); // Verde EcoVertical
    doc.rect(margin, currentY, tableWidth, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");

    let xPos = margin;
    columnas.forEach((col, index) => {
      doc.text(col.header, xPos + 3, currentY + 6);
      xPos += actualColWidths[index];
    });
    currentY += 10;

    // Filas de datos
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    if (datos.length === 0) {
      doc.setTextColor(107, 114, 128);
      doc.setFontSize(10);
      doc.text("No hay datos disponibles para el rango seleccionado", margin + 2, currentY + 8);
      return currentY + 15;
    }

    datos.forEach((item, rowIndex) => {
      doc.setTextColor(55, 65, 81);
      xPos = margin;
      
      let maxRowHeight = 8; // Altura mínima de fila
      const allLines = []; // Para almacenar todas las líneas de todas las columnas
      
      // Primera pasada: calcular todas las líneas y la altura máxima
      columnas.forEach((col, colIndex) => {
        const value = item[col.key] || "";
        const text = String(value);
        
        // Calcular cuántas líneas necesita el texto (más conservador)
        let maxCharsPerLine;
        if (col.key === 'interpretacion') {
          maxCharsPerLine = Math.floor(actualColWidths[colIndex] / 2.0); // Más conservador para interpretación
        } else {
          maxCharsPerLine = Math.floor(actualColWidths[colIndex] / 1.8);
        }
        
        const lines = [];
        let currentLine = "";
        
        // Dividir el texto en palabras
        const words = text.split(' ');
        
        for (const word of words) {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          if (testLine.length <= maxCharsPerLine) {
            currentLine = testLine;
          } else {
            if (currentLine) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              // Si una palabra sola es muy larga, cortarla
              lines.push(word.substring(0, maxCharsPerLine - 3) + '...');
              currentLine = '';
            }
          }
        }
        
        if (currentLine) {
          lines.push(currentLine);
        }
        
        allLines.push(lines);
        maxRowHeight = Math.max(maxRowHeight, lines.length * 4 + 4);
      });
      
      // Dibujar el fondo de la fila con la altura calculada
      if (rowIndex % 2 === 0) {
        doc.setFillColor(240, 253, 244); // Verde claro
        doc.rect(margin, currentY, tableWidth, maxRowHeight, "F");
      }
      
      // Segunda pasada: dibujar el texto
      xPos = margin;
      columnas.forEach((col, colIndex) => {
        const lines = allLines[colIndex];
        
        // Dibujar cada línea del texto
        lines.forEach((line, lineIndex) => {
          doc.text(line, xPos + 3, currentY + 5 + (lineIndex * 4));
        });
        
        xPos += actualColWidths[colIndex];
      });
      
      currentY += maxRowHeight;

      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
    });

    return currentY + 10;
  };

  // Funciones de análisis estadístico avanzado
  // baseDate: fecha de referencia para "mes actual/mes anterior" (usa fechaFin del filtro)
  const calcularEstadisticas = (datos, tipo, baseDate) => {
    if (!datos || datos.length === 0) return null;

    console.log('📊 Calculando estadísticas:', { 
      datosLength: datos.length, 
      tipo, 
      baseDate,
      primerDato: datos[0],
      ultimoDato: datos[datos.length - 1]
    });

    // Determinar fecha base: prioridad a baseDate (p.ej. fechaFin del filtro);
    // si no existe, usar la fecha más reciente en los datos; si no, hoy.
    let referencia = baseDate ? new Date(baseDate) : null;
    if (!referencia || isNaN(referencia.getTime())) {
      const fechasOrdenadas = datos
        .map(item => new Date(item.fecha || item.fechaInicio || item.created_at))
        .filter(d => !isNaN(d))
        .sort((a, b) => b - a);
      referencia = fechasOrdenadas[0] || new Date();
    }

    const mesActual = referencia.getMonth();
    const añoActual = referencia.getFullYear();
    const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;
    const añoAnterior = mesActual === 0 ? añoActual - 1 : añoActual;

    console.log('📅 Fechas de referencia:', {
      referencia: referencia.toISOString(),
      mesActual: mesActual + 1,
      añoActual,
      mesAnterior: mesAnterior + 1,
      añoAnterior
    });

    // Mejorar lógica para usar meses reales del calendario
    // Ordenar datos por fecha
    const datosOrdenados = datos.sort((a, b) => {
      const fechaA = new Date(a.fecha || a.fechaInicio || a.created_at);
      const fechaB = new Date(b.fecha || b.fechaInicio || b.created_at);
      return fechaA - fechaB;
    });

    // Obtener todos los meses únicos en los datos
    const mesesUnicos = new Set();
    datosOrdenados.forEach(item => {
      const fecha = new Date(item.fecha || item.fechaInicio || item.created_at);
      const mesAño = `${fecha.getMonth()}-${fecha.getFullYear()}`;
      mesesUnicos.add(mesAño);
    });

    console.log('📅 Meses únicos encontrados:', Array.from(mesesUnicos));

    // Determinar qué mostrar según los meses disponibles
    let datosMesActual, datosMesAnterior;
    let mostrarComparacion = false;

    if (mesesUnicos.size === 1) {
      // Solo hay datos en un mes - mostrar solo ese mes
      const mesUnico = Array.from(mesesUnicos)[0];
      const [mes, año] = mesUnico.split('-').map(Number);
      
      datosMesActual = datos.filter(item => {
        const fecha = new Date(item.fecha || item.fechaInicio || item.created_at);
        return fecha.getMonth() === mes && fecha.getFullYear() === año;
      });
      datosMesAnterior = []; // Vacío
      mostrarComparacion = false;
      
      console.log(`📊 Solo datos en un mes: ${mes + 1}/${año}, registros: ${datosMesActual.length}`);
      
    } else if (mesesUnicos.size >= 2) {
      // Hay datos en múltiples meses - usar los dos más recientes
      const mesesOrdenados = Array.from(mesesUnicos).sort((a, b) => {
        const [mesA, añoA] = a.split('-').map(Number);
        const [mesB, añoB] = b.split('-').map(Number);
        return new Date(añoB, mesB) - new Date(añoA, mesA);
      });
      
      const mesActualStr = mesesOrdenados[0]; // Más reciente
      const mesAnteriorStr = mesesOrdenados[1]; // Segundo más reciente
      
      const [mesActual, añoActual] = mesActualStr.split('-').map(Number);
      const [mesAnterior, añoAnterior] = mesAnteriorStr.split('-').map(Number);
      
      datosMesActual = datos.filter(item => {
        const fecha = new Date(item.fecha || item.fechaInicio || item.created_at);
        return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
      });
      
      datosMesAnterior = datos.filter(item => {
        const fecha = new Date(item.fecha || item.fechaInicio || item.created_at);
        return fecha.getMonth() === mesAnterior && fecha.getFullYear() === añoAnterior;
      });
      
      mostrarComparacion = true;
      
      console.log(`📊 Comparación entre meses: ${mesActual + 1}/${añoActual} (${datosMesActual.length} registros) vs ${mesAnterior + 1}/${añoAnterior} (${datosMesAnterior.length} registros)`);
    } else {
      // No hay datos válidos
      datosMesActual = [];
      datosMesAnterior = [];
      mostrarComparacion = false;
    }

    // Calcular estadísticas según el tipo
    let estadisticas = {
      total: datos.length,
      mesActual: datosMesActual.length,
      mesAnterior: datosMesAnterior.length,
      promedioMesActual: 0,
      promedioMesAnterior: 0,
      tendencia: 'neutral',
      cambioPorcentual: 0,
      alertas: [],
      mostrarComparacion: mostrarComparacion,
      promedioGeneral: 0 // Promedio de todos los datos cuando no hay comparación
    };

    switch (tipo) {
      case 'agua':
        const aguaActual = datosMesActual.reduce((sum, item) => sum + (item.cantidadMl || (item.cantidad ? item.cantidad * 1000 : 0)), 0);
        const aguaAnterior = datosMesAnterior.reduce((sum, item) => sum + (item.cantidadMl || (item.cantidad ? item.cantidad * 1000 : 0)), 0);
        const aguaTotal = datos.reduce((sum, item) => sum + (item.cantidadMl || (item.cantidad ? item.cantidad * 1000 : 0)), 0);
        
        estadisticas.promedioMesActual = datosMesActual.length > 0 ? aguaActual / datosMesActual.length : 0;
        estadisticas.promedioMesAnterior = datosMesAnterior.length > 0 ? aguaAnterior / datosMesAnterior.length : 0;
        estadisticas.promedioGeneral = datos.length > 0 ? aguaTotal / datos.length : 0;
        
        // Solo calcular tendencia si hay comparación válida
        if (mostrarComparacion && estadisticas.promedioMesAnterior > 0) {
          estadisticas.cambioPorcentual = ((estadisticas.promedioMesActual - estadisticas.promedioMesAnterior) / estadisticas.promedioMesAnterior) * 100;
          
          if (estadisticas.cambioPorcentual > 5) {
            estadisticas.tendencia = 'ascendente';
          } else if (estadisticas.cambioPorcentual < -5) {
            estadisticas.tendencia = 'descendente';
          } else {
            estadisticas.tendencia = 'neutral';
          }
        } else {
          estadisticas.tendencia = 'sin_comparacion';
          estadisticas.cambioPorcentual = 0;
        }
        
        // Alertas para agua solo si hay comparación
        if (mostrarComparacion) {
          if (estadisticas.promedioMesActual > estadisticas.promedioMesAnterior * 1.5) {
            estadisticas.alertas.push({ tipo: 'warning', mensaje: 'Consumo de agua aumentó significativamente' });
          }
          if (estadisticas.promedioMesActual < estadisticas.promedioMesAnterior * 0.5) {
            estadisticas.alertas.push({ tipo: 'info', mensaje: 'Consumo de agua disminuyó considerablemente' });
          }
        }
        break;

      case 'abono':
        const abonoActual = datosMesActual.reduce((sum, item) => sum + (item.cantidad_abono || item.cantidadAbono || 0), 0);
        const abonoAnterior = datosMesAnterior.reduce((sum, item) => sum + (item.cantidad_abono || item.cantidadAbono || 0), 0);
        estadisticas.promedioMesActual = datosMesActual.length > 0 ? abonoActual / datosMesActual.length : 0;
        estadisticas.promedioMesAnterior = datosMesAnterior.length > 0 ? abonoAnterior / datosMesAnterior.length : 0;
        
        if (estadisticas.promedioMesAnterior > 0) {
          estadisticas.cambioPorcentual = ((estadisticas.promedioMesActual - estadisticas.promedioMesAnterior) / estadisticas.promedioMesAnterior) * 100;
        }
        break;

      case 'plagas':
        const plagasActual = datosMesActual.length;
        const plagasAnterior = datosMesAnterior.length;
        estadisticas.promedioMesActual = plagasActual;
        estadisticas.promedioMesAnterior = plagasAnterior;
        
        if (plagasAnterior > 0) {
          estadisticas.cambioPorcentual = ((plagasActual - plagasAnterior) / plagasAnterior) * 100;
        }
        
        // Alertas para plagas
        if (plagasActual > plagasAnterior * 2) {
          estadisticas.alertas.push({ tipo: 'danger', mensaje: 'Incremento alarmante en plagas detectadas' });
        }
        if (plagasActual < plagasAnterior * 0.3 && plagasAnterior > 0) {
          estadisticas.alertas.push({ tipo: 'success', mensaje: 'Excelente control de plagas este mes' });
        }
        break;

      case 'siembra':
        const siembraActual = datosMesActual.reduce((sum, item) => sum + (item.siembra || 0), 0);
        const siembraAnterior = datosMesAnterior.reduce((sum, item) => sum + (item.siembra || 0), 0);
        estadisticas.promedioMesActual = datosMesActual.length > 0 ? siembraActual / datosMesActual.length : 0;
        estadisticas.promedioMesAnterior = datosMesAnterior.length > 0 ? siembraAnterior / datosMesAnterior.length : 0;
        
        if (estadisticas.promedioMesAnterior > 0) {
          estadisticas.cambioPorcentual = ((estadisticas.promedioMesActual - estadisticas.promedioMesAnterior) / estadisticas.promedioMesAnterior) * 100;
        }
        break;
    }

    // Determinar tendencia
    if (estadisticas.cambioPorcentual > 10) {
      estadisticas.tendencia = 'ascendente';
    } else if (estadisticas.cambioPorcentual < -10) {
      estadisticas.tendencia = 'descendente';
    } else {
      estadisticas.tendencia = 'estable';
    }

    return estadisticas;
  };

  // Función para crear PDF con formato profesional y estadísticas avanzadas
  const crearPDF = async (titulo, datos, columnas, nombreArchivo, chartData = null, chartType = 'bar', colorHeader = null, tipoEstadistica = null) => {
    try {
      console.log('🚀 Iniciando generación de PDF:', { titulo, datos: datos.length, columnas: columnas.length, nombreArchivo });
      
      const jsPDFModule = await import("jspdf");
      const { jsPDF } = jsPDFModule;
      const { reportsAPI } = await import('../services/apiService');

      const doc = new jsPDF();
      console.log('✅ jsPDF inicializado correctamente');
      const fechaActual = new Date().toLocaleDateString("es-ES");
      const horaActual = new Date().toLocaleTimeString("es-ES");
      const nombreHuerto = data.garden?.nombre || 'Huerto';

      // Calcular estadísticas si se especifica el tipo
      const estadisticas = tipoEstadistica ? calcularEstadisticas(datos, tipoEstadistica, fechaFin) : null;

      // === PÁGINA 1: PORTADA ===
      // Header del documento - Color principal (verde)
      doc.setFillColor(34, 197, 94);
      doc.rect(0, 0, 210, 30, "F");

      // Logo y título principal
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("EcoVertical", 15, 18);

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Sistema de Gestión de Huertos", 15, 24);

      // Información del reporte
      doc.setTextColor(55, 65, 81);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("REPORTE DE ESTADISTICAS AVANZADAS", 15, 45);

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(titulo, 15, 55);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Huerto: ${nombreHuerto}`, 15, 65);
      doc.text(`Fecha: ${fechaActual}`, 15, 70);
      doc.text(`Hora: ${horaActual}`, 15, 75);
      doc.text(`Registros totales: ${datos.length}`, 15, 80);

      // Información de filtros si están activos
      let yPosition = 90;
      if (fechaInicio || fechaFin) {
        doc.setFillColor(255, 243, 205);
        doc.rect(15, yPosition - 3, 180, 12, "F");
        doc.setTextColor(146, 64, 14);
        doc.setFont("helvetica", "bold");
        doc.text("Filtros aplicados:", 17, yPosition + 3);
        doc.setFont("helvetica", "normal");
        let filtroTexto = "";
        if (fechaInicio) filtroTexto += `Desde: ${fechaInicio} `;
        if (fechaFin) filtroTexto += `Hasta: ${fechaFin}`;
        doc.text(filtroTexto, 17, yPosition + 8);
        yPosition += 20;
      }

      // Estadísticas resumidas en la portada - ESPECÍFICAS según el tipo de reporte
      doc.setTextColor(55, 65, 81);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Resumen Estadístico", 15, yPosition);
      yPosition += 5;

      // Crear tabla de estadísticas específicas según el tipo
      let statsData = [];
      
      if (tipoEstadistica === 'agua') {
        const totalAgua = datos.reduce((sum, item) => sum + (item.cantidadMl || (item.cantidad ? item.cantidad * 1000 : 0)), 0);
        const unidadAgua = totalAgua >= 1000 ? 'L' : 'mL';
        const valorAgua = totalAgua >= 1000 ? Math.round(totalAgua / 1000 * 100) / 100 : totalAgua;
        
        statsData = [
          { metrica: "Total Agua", valor: `${valorAgua} ${unidadAgua}` },
          { metrica: "Registros de Riego", valor: `${datos.length} eventos` },
          { metrica: "Promedio por Riego", valor: `${datos.length > 0 ? Math.round(totalAgua / datos.length) : 0} ${unidadAgua}` },
        ];
      } else if (tipoEstadistica === 'siembra') {
        const totalSiembra = datos.reduce((sum, item) => sum + (item.cantidad_siembra || item.siembra || 0), 0);
        const totalCosecha = datos.reduce((sum, item) => sum + (item.cantidad_cosecha || item.cosecha || 0), 0);
        
        statsData = [
          { metrica: "Total Siembra", valor: `${totalSiembra} unidades` },
          { metrica: "Total Cosecha", valor: `${totalCosecha} unidades` },
          { metrica: "Registros de Siembra", valor: `${datos.length} eventos` },
        ];
      } else if (tipoEstadistica === 'abono') {
        const totalAbono = datos.reduce((sum, item) => sum + (item.cantidad_abono || item.cantidadAbono || 0), 0);
        
        statsData = [
          { metrica: "Total Abono", valor: `${totalAbono} kg` },
          { metrica: "Registros de Abono", valor: `${datos.length} eventos` },
          { metrica: "Promedio por Evento", valor: `${datos.length > 0 ? Math.round(totalAbono / datos.length * 100) / 100 : 0} kg` },
        ];
      } else if (tipoEstadistica === 'plagas') {
        const totalPlagas = datos.reduce((sum, item) => sum + (item.cantidad_plagas || item.incidencias || 1), 0);
        
        statsData = [
          { metrica: "Total Plagas", valor: `${totalPlagas} incidencias` },
          { metrica: "Registros de Plagas", valor: `${datos.length} eventos` },
          { metrica: "Especies Detectadas", valor: `${new Set(datos.map(item => item.plaga_especie || 'No especificada')).size} tipos` },
        ];
      } else if (tipoEstadistica === 'mantenimiento') {
        const totalMantenimiento = datos.reduce((sum, item) => sum + (item.cantidad_mantenimiento || item.acciones || 1), 0);
        
        statsData = [
          { metrica: "Total Mantenimiento", valor: `${totalMantenimiento} acciones` },
          { metrica: "Registros de Mantenimiento", valor: `${datos.length} eventos` },
          { metrica: "Promedio por Evento", valor: `${datos.length > 0 ? Math.round(totalMantenimiento / datos.length * 100) / 100 : 0} acciones` },
        ];
      } else {
        // Si no hay tipo específico, usar resumen general
        const estadisticasResumen = obtenerEstadisticas();
        statsData = [
          { metrica: "Total Agua", valor: `${estadisticasResumen.totalAgua} ${estadisticasResumen.unidadAgua || 'mL'}` },
          { metrica: "Total Siembra", valor: `${estadisticasResumen.totalSiembra} unidades` },
          { metrica: "Total Cosecha", valor: `${estadisticasResumen.totalCosecha} unidades` },
          { metrica: "Total Plagas", valor: `${estadisticasResumen.totalPlagas} incidencias` },
          { metrica: "Acciones de Mantenimiento", valor: `${estadisticasResumen.totalMantenimiento} acciones` },
        ];
      }

      const statsColumns = [
        { header: "Métrica", key: "metrica" },
        { header: "Valor", key: "valor" },
      ];

      yPosition = crearTablaManual(
        doc,
        statsData,
        statsColumns,
        yPosition + 5,
        ""
      );

      // === PÁGINA 2: ANÁLISIS IA ===
      // Analítica IA (Gemini) - Obtener primero el contenido
      let aiAnalysis = "";
      try {
        console.log('🤖 Iniciando análisis de IA...');
        // Crear payload específico según el tipo de reporte
        let payload = {
          title: titulo,
          summary: `Registros: ${datos.length}. Huerto: ${nombreHuerto}. Periodo: ${fechaInicio || 'Todo'} - ${fechaFin || 'Actual'}.`,
          sections: [
            { title: 'Tabla', columns: columnas?.map(c => c.header), sample: datos?.slice(0, 20) }
          ]
        };

        // Agregar métricas específicas según el tipo
        if (tipoEstadistica === 'agua') {
          const totalAgua = datos.reduce((sum, item) => sum + (item.cantidadMl || (item.cantidad ? item.cantidad * 1000 : 0)), 0);
          const unidadAgua = totalAgua >= 1000 ? 'L' : 'mL';
          const valorAgua = totalAgua >= 1000 ? Math.round(totalAgua / 1000 * 100) / 100 : totalAgua;
          
          payload.sections.unshift({
            title: 'Resumen de Agua',
            metrics: {
              totalAgua: valorAgua,
              unidadAgua: unidadAgua,
              registrosRiego: datos.length,
              promedioPorRiego: datos.length > 0 ? Math.round(totalAgua / datos.length) : 0,
              unidadPromedio: 'mL', // Siempre en mL para evitar confusión
              promedioEnLitros: datos.length > 0 ? Math.round(totalAgua / datos.length / 1000 * 100) / 100 : 0,
              // Agregar datos individuales para mayor claridad
              registrosIndividuales: datos.map(item => ({
                fecha: item.fecha || item.fechaInicio,
                cantidad: item.cantidadMl || (item.cantidad ? item.cantidad * 1000 : 0),
                unidad: 'mL',
                siembra: item.nombre_siembra || item.siembra || 'No especificada'
              })),
              // Aclaración importante sobre unidades
              aclaracionUnidades: `Total: ${valorAgua} ${unidadAgua} = ${totalAgua} mL. Promedio: ${Math.round(totalAgua / datos.length)} mL = ${Math.round(totalAgua / datos.length / 1000 * 100) / 100} L`
            }
          });
        } else if (tipoEstadistica === 'siembra') {
          const totalSiembra = datos.reduce((sum, item) => sum + (item.cantidad_siembra || item.siembra || 0), 0);
          const totalCosecha = datos.reduce((sum, item) => sum + (item.cantidad_cosecha || item.cosecha || 0), 0);
          
          payload.sections.unshift({
            title: 'Resumen de Siembra',
            metrics: {
              totalSiembra: totalSiembra,
              totalCosecha: totalCosecha,
              registrosSiembra: datos.length
            }
          });
        } else if (tipoEstadistica === 'abono') {
          const totalAbono = datos.reduce((sum, item) => sum + (item.cantidad_abono || item.cantidadAbono || 0), 0);
          
          payload.sections.unshift({
            title: 'Resumen de Abono',
            metrics: {
              totalAbono: totalAbono,
              registrosAbono: datos.length,
              promedioPorEvento: datos.length > 0 ? Math.round(totalAbono / datos.length * 100) / 100 : 0
            }
          });
        } else if (tipoEstadistica === 'plagas') {
          const totalPlagas = datos.reduce((sum, item) => sum + (item.cantidad_plagas || item.incidencias || 1), 0);
          const especiesUnicas = new Set(datos.map(item => item.plaga_especie || 'No especificada')).size;
          
          payload.sections.unshift({
            title: 'Resumen de Plagas',
            metrics: {
              totalPlagas: totalPlagas,
              registrosPlagas: datos.length,
              especiesDetectadas: especiesUnicas
            }
          });
        } else if (tipoEstadistica === 'mantenimiento') {
          const totalMantenimiento = datos.reduce((sum, item) => sum + (item.cantidad_mantenimiento || item.acciones || 1), 0);
          
          payload.sections.unshift({
            title: 'Resumen de Mantenimiento',
            metrics: {
              totalMantenimiento: totalMantenimiento,
              registrosMantenimiento: datos.length,
              promedioPorEvento: datos.length > 0 ? Math.round(totalMantenimiento / datos.length * 100) / 100 : 0
            }
          });
        } else {
          // Si no hay tipo específico, usar resumen general
          payload.sections.unshift({
            title: 'Resumen General',
            metrics: obtenerEstadisticas()
          });
        }
        console.log('📤 Payload enviado a IA:', payload);
        const { data: ai } = await reportsAPI.analyzeReport(payload);
        console.log('📥 Respuesta de IA recibida:', ai);
        
        if (ai?.analysis) {
          // Limpiar texto de caracteres especiales antes de agregar al PDF
          aiAnalysis = ai.analysis
            .replace(/[^\x00-\x7F]/g, '') // Remover caracteres no ASCII
            .replace(/Ø|Ü|Ê|Å|Ë|Bá|=/g, '') // Remover caracteres específicos problemáticos
            .replace(/\s+/g, ' ') // Normalizar espacios
            .trim();
          console.log('✅ Análisis de IA procesado:', aiAnalysis.substring(0, 100) + '...');
        } else {
          console.log('⚠️ No se recibió análisis de IA');
          aiAnalysis = "No se pudo obtener análisis de IA. Verifique la conexión.";
        }
      } catch (aiError) {
        console.error('❌ Error al obtener análisis IA:', aiError);
        aiAnalysis = "Error al obtener análisis de IA: " + aiError.message;
      }

      // Inicializar currentY para usar después del análisis de IA
      let currentY = 30; // Valor por defecto
      
      // Solo crear página si hay contenido de IA
      if (aiAnalysis) {
        console.log('📄 Creando página de análisis de IA...');
        doc.addPage();
        
        // Header de página de análisis IA
        doc.setFillColor(34, 197, 94);
        doc.rect(0, 0, 210, 25, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("ANÁLISIS INTELIGENTE", 15, 16);

        doc.setTextColor(55, 65, 81);
        doc.setFontSize(12);
        doc.text(`Huerto: ${nombreHuerto}`, 15, 40);
        doc.text(`Reporte: ${titulo}`, 15, 50);

        currentY = 70;
        
        // Limpiar texto de caracteres especiales antes de agregar al PDF
        const cleanAnalysis = aiAnalysis
          .replace(/[^\x00-\x7F]/g, '') // Remover caracteres no ASCII
          .replace(/Ø|Ü|Ê|Å|Ë|Bá|=/g, '') // Remover caracteres específicos problemáticos
          .replace(/\s+/g, ' ') // Normalizar espacios
          .trim();
        
        // Usar función especializada para agregar texto con paginación automática
        currentY = agregarTextoConPaginacion(doc, cleanAnalysis, currentY, "ANÁLISIS IA (GEMINI)");
        console.log('✅ Texto de IA agregado exitosamente');
        
        // Verificar si necesitamos una nueva página después del análisis de IA
        const pageHeight = doc.internal.pageSize.height;
        const marginBottom = 30;
        if (currentY > pageHeight - marginBottom) {
          console.log('📄 Análisis IA ocupó toda la página, necesitamos nueva página para contenido siguiente');
          doc.addPage();
          currentY = 30; // Resetear posición Y para nueva página
        } else {
          console.log(`📄 Análisis IA terminó en posición Y: ${currentY}, espacio restante: ${pageHeight - currentY}`);
        }
        
        // SIEMPRE crear una nueva página después del análisis IA para evitar superposiciones
        console.log('📄 Forzando nueva página después del análisis IA para evitar superposiciones');
        doc.addPage();
        currentY = 30;
      } else {
        console.log('⚠️ No hay contenido de IA para mostrar');
      }

      // === PÁGINA 3: GRÁFICAS, ESTADÍSTICAS Y DATOS COMBINADOS ===
      let needsNewPage = true;
      let page3Y = currentY || 30; // Usar la posición actual del análisis de IA o empezar en 30
      const pageHeight = doc.internal.pageSize.height;
      const marginBottom = 30;

      // Verificar si hay gráficas
      if (chartData && datos.length > 0) {
        // Solo crear nueva página si realmente necesitamos espacio para la gráfica
        const chartSpaceNeeded = 120; // Más espacio necesario para gráfica + header + márgenes
        console.log(`📊 Verificando espacio para gráfica. Posición actual: ${page3Y}, espacio necesario: ${chartSpaceNeeded}, espacio disponible: ${pageHeight - page3Y - marginBottom}`);
        
        if (page3Y + chartSpaceNeeded > pageHeight - marginBottom) {
          console.log('📄 Creando nueva página para gráfica');
          doc.addPage();
          page3Y = 30;
          needsNewPage = false;
        } else {
          console.log('📊 Usando espacio disponible en página actual');
        }
        
        // Header de página de gráficas
        doc.setFillColor(34, 197, 94);
        doc.rect(0, 0, 210, 25, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("ANÁLISIS GRÁFICO", 15, 16);

        doc.setTextColor(55, 65, 81);
        doc.setFontSize(12);
        doc.text(`Huerto: ${nombreHuerto}`, 15, 40);
        doc.text(`Reporte: ${titulo}`, 15, 50);
        doc.text(`Período: ${fechaInicio || 'Todo'} - ${fechaFin || 'Actual'}`, 15, 60);

        try {
          // Crear gráfica usando Chart.js
          const chartImage = await createChartImage(chartData, chartType, {
            scales: {
              y: {
                beginAtZero: true
              }
            }
          });

          if (chartImage) {
            // Agregar la imagen del gráfico al PDF con posición más compacta
            doc.addImage(chartImage, 'PNG', 15, 80, 180, 80);
            
            // Agregar título de la gráfica
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(55, 65, 81);
            doc.text("GRÁFICA DE DATOS", 15, 75);
            page3Y = 170; // Posición después de la gráfica
          } else {
            doc.setTextColor(239, 68, 68);
            doc.text("No se pudo generar la gráfica", 15, 80);
            page3Y = 100;
          }
        } catch (chartError) {
          console.error('Error al generar gráfica:', chartError);
          doc.setTextColor(239, 68, 68);
          doc.text("Error al generar gráfica", 15, 80);
          page3Y = 100;
        }
      }

      // Sección de comparación mensual eliminada

      // Agregar tabla de datos en la misma página si hay espacio
      if (page3Y < 250) {
        // Verificar si hay espacio suficiente para la tabla
        const tableHeight = 30 + (datos.length * 6); // Altura aproximada de la tabla en modo compacto
        if (page3Y + tableHeight < 280) {
          // Agregar separador visual
          doc.setDrawColor(229, 231, 235);
          doc.line(15, page3Y, 195, page3Y);
          page3Y += 10;
          
          // Título de datos
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(55, 65, 81);
          doc.text("DATOS DETALLADOS", 15, page3Y);
          page3Y += 5;
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(`Total de registros: ${datos.length}`, 15, page3Y);
          page3Y += 10;

          // Tabla principal de datos más compacta
          crearTablaManual(
        doc,
        datos,
        columnas,
            page3Y,
            "",
            colorHeader,
            true // Modo compacto
          );
        } else {
          // No hay espacio suficiente, crear nueva página para la tabla
          doc.addPage();
          
          // Header de página de tablas
          doc.setFillColor(34, 197, 94);
          doc.rect(0, 0, 210, 25, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text("DATOS DETALLADOS", 15, 16);

          doc.setTextColor(55, 65, 81);
          doc.setFontSize(12);
          doc.text(`Huerto: ${nombreHuerto}`, 15, 40);
          doc.text(`Reporte: ${titulo}`, 15, 50);
          doc.text(`Total de registros: ${datos.length}`, 15, 60);

          // Tabla principal de datos
          crearTablaManual(
            doc,
            datos,
            columnas,
            80,
        "",
        colorHeader
      );
        }
      } else {
        // Crear nueva página para la tabla
        doc.addPage();
        
        // Header de página de tablas
        doc.setFillColor(34, 197, 94);
        doc.rect(0, 0, 210, 25, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("DATOS DETALLADOS", 15, 16);

        doc.setTextColor(55, 65, 81);
        doc.setFontSize(12);
        doc.text(`Huerto: ${nombreHuerto}`, 15, 40);
        doc.text(`Reporte: ${titulo}`, 15, 50);
        doc.text(`Total de registros: ${datos.length}`, 15, 60);

        // Tabla principal de datos
        crearTablaManual(
          doc,
          datos,
          columnas,
          80,
          "",
          colorHeader
        );
      }

      // Footer mejorado - Verde EcoVertical
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFillColor(34, 197, 94); // Verde EcoVertical
        doc.rect(0, 285, 210, 12, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text(`EcoVertical - Reporte Avanzado: ${nombreHuerto}`, 15, 292);
        doc.text(`Página ${i} de ${pageCount}`, 170, 292);
      }

      // Descargar el PDF
      console.log('💾 Guardando PDF:', nombreArchivo);
      
      // Detectar descarga y completar progreso antes de guardar
      detectarDescargaYCompletarProgreso();
      
      doc.save(nombreArchivo);
      console.log('✅ PDF generado y descargado exitosamente');
      
      setSuccessMessage("Reporte generado exitosamente");
      setShowSuccessNotification(true);
    } catch (error) {
      console.error("❌ Error al generar PDF:", error);
      console.error("❌ Detalles del error:", error.stack);
      setSuccessMessage("Error al generar el PDF. Por favor, intenta nuevamente.");
      setShowSuccessNotification(true);
    }
  };

  // Funciones específicas de exportación para cada sección
  const exportarAguaPDF = async () => {
    try {
      console.log('💧 Iniciando exportación de PDF de agua...');
      console.log('📊 Datos de agua disponibles:', aguaData.length);
      
      // Activar loading y calcular tiempo estimado
      setLoadingReportes(prev => ({ ...prev, agua: true }));
      const tiempoEstimadoSegundos = calcularTiempoEstimado('agua', aguaData.length);
      const tiempoMaximo = Math.ceil(tiempoEstimadoSegundos * 1.5);
      setTiempoEstimado(`Tiempo estimado: ${tiempoEstimadoSegundos}-${tiempoMaximo} segundos`);
      
      // Iniciar progreso simulado
      iniciarProgresoSimulado(tiempoEstimadoSegundos);
      
      // Pequeño delay para asegurar que el modal se renderice
      await new Promise(resolve => setTimeout(resolve, 300));
      
    const columnas = [
      { header: "Fecha", key: "fecha" },
      { header: "Cantidad de agua", key: "cantidadFormateada" },
      { header: "Nombre de Siembra", key: "nombre_siembra" },
    ];
    const datosFormateados = aguaData.map((item) => ({
      ...item,
      cantidadFormateada: `${item.cantidadMl || item.cantidad * 1000} mL`,
    }));
      
      console.log('📋 Datos formateados:', datosFormateados.length);
    
    // Preparar datos para la gráfica usando la configuración
    const chartData = {
      labels: aguaData.map(item => item.fecha),
      datasets: [createDataset('Cantidad de Agua (mL)', aguaData.map(item => (item.cantidadMl || item.cantidad * 1000)), 'agua', 'bar')]
    };
      
      console.log('📊 Datos de gráfica preparados:', chartData);
    
    const fechaActual = new Date().toISOString().split("T")[0];
    const nombreHuerto = data.garden?.nombre || 'huerto';
      
      console.log('📄 Llamando a crearPDF...');
    await crearPDF(
      `Cantidad de Agua para ${nombreHuerto}`,
      datosFormateados,
      columnas,
      `agua_${nombreHuerto.replace(/\s+/g, '_')}_${fechaActual}.pdf`,
      chartData,
      'bar',
      [6, 182, 212], // Color cyan para agua
      'agua' // Tipo de estadística
    );
    
      // Mostrar éxito (el loading se desactiva automáticamente)
      setSuccessMessage("Reporte de agua generado exitosamente");
      setShowSuccessNotification(true);
    
    } catch (error) {
      console.error('❌ Error en exportarAguaPDF:', error);
      setLoadingReportes(prev => ({ ...prev, agua: false }));
      detenerProgresoSimulado();
      setTiempoEstimado("");
      setSuccessMessage("Error al exportar reporte de agua");
      setShowSuccessNotification(true);
    }
  };

  const exportarSiembraPDF = async () => {
    try {
      console.log('🌿 Iniciando exportación de PDF de siembra...');
      console.log('📊 Datos de siembra disponibles:', siembraData.length);
      
      // Activar loading y calcular tiempo estimado
      setLoadingReportes(prev => ({ ...prev, siembra: true }));
      const tiempoEstimadoSegundos = calcularTiempoEstimado('siembra', siembraData.length);
      const tiempoMaximo = Math.ceil(tiempoEstimadoSegundos * 1.5);
      setTiempoEstimado(`Tiempo estimado: ${tiempoEstimadoSegundos}-${tiempoMaximo} segundos`);
      
      // Iniciar progreso simulado
      iniciarProgresoSimulado(tiempoEstimadoSegundos);
      
      // Pequeño delay para asegurar que el modal se renderice (aumentado a 300ms)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const columnas = [
      { header: "Fecha de Siembra", key: "fecha" },
      { header: "Nombre de Siembra", key: "nombre_siembra" },
      { header: "Cantidad de Sembrado", key: "siembra" },
      { header: "Fecha de Producción", key: "fecha_cosecha" },
      { header: "Cantidad de Producción", key: "cosecha" },
    ];
    
    // Calcular rendimiento y formatear datos
    const datosFormateados = siembraData.map((item) => {
      return {
        ...item,
        fecha_cosecha: item.fecha_cosecha || '-',
        cosecha: item.cosecha || 0,
      };
    });
    
    // Preparar datos para la gráfica combinada
    const chartData = {
      labels: siembraData.map(item => item.fecha),
      datasets: [
        {
          label: 'Siembra',
          data: siembraData.map(item => item.siembra),
          backgroundColor: '#22c55e', // Verde para siembra
          borderColor: '#22c55e',
          borderWidth: 1,
          type: 'bar'
        },
        {
          label: 'Cosecha',
          data: siembraData.map(item => item.cosecha),
          backgroundColor: '#f59e0b', // Naranja para cosecha
          borderColor: '#f59e0b',
          borderWidth: 1,
          type: 'bar'
        }
      ]
    };
    
    console.log('📋 Datos formateados:', datosFormateados.length);
    console.log('📊 Datos de gráfica preparados:', chartData);
    
    const fechaActual = new Date().toISOString().split("T")[0];
    const nombreHuerto = data.garden?.nombre || 'huerto';
    
    console.log('📄 Llamando a crearPDF...');
    await crearPDF(
      `Siembra y Producción para ${nombreHuerto}`,
      datosFormateados,
      columnas,
      `siembra_produccion_${nombreHuerto.replace(/\s+/g, '_')}_${fechaActual}.pdf`,
      chartData,
      'bar',
      [6, 182, 212], // Color cyan para siembra
      'siembra' // Tipo de estadística
    );
    
    // Mostrar éxito (el loading se desactiva automáticamente)
    setSuccessMessage("Reporte de siembra generado exitosamente");
    setShowSuccessNotification(true);
  
  } catch (error) {
    console.error('❌ Error en exportarSiembraPDF:', error);
    setLoadingReportes(prev => ({ ...prev, siembra: false }));
    detenerProgresoSimulado();
    setTiempoEstimado("");
    setSuccessMessage("Error al exportar reporte de siembra");
    setShowSuccessNotification(true);
  }
};

  const exportarAbonoPDF = async () => {
    try {
      console.log('🌱 Iniciando exportación de PDF de abono...');
      console.log('📊 Datos de abono disponibles:', abonoData.length);
      
      // Activar loading y calcular tiempo estimado
      setLoadingReportes(prev => ({ ...prev, abono: true }));
      const tiempoEstimadoSegundos = calcularTiempoEstimado('abono', abonoData.length);
      const tiempoMaximo = Math.ceil(tiempoEstimadoSegundos * 1.5);
      setTiempoEstimado(`Tiempo estimado: ${tiempoEstimadoSegundos}-${tiempoMaximo} segundos`);
      
      // Iniciar progreso simulado
      iniciarProgresoSimulado(tiempoEstimadoSegundos);
      
      // Pequeño delay para asegurar que el modal se renderice (aumentado a 300ms)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const columnas = [
        { header: "Fecha", key: "fecha" },
        { header: "Cantidad de Abono", key: "cantidad_abono" },
        { header: "Cambio de Tierra", key: "cambio_tierra" },
        { header: "Nombre de Siembra", key: "nombre_siembra" },
      ];
      
      console.log('📋 Datos de abono:', abonoData.length);
      
      const fechaActual = new Date().toISOString().split("T")[0];
      const nombreHuerto = data.garden?.nombre || 'huerto';
      
      console.log('📄 Llamando a crearPDF...');
      await crearPDF(
        `Cambio de Tierra y Abono para ${nombreHuerto}`,
        abonoData,
        columnas,
        `abono_tierra_${nombreHuerto.replace(/\s+/g, '_')}_${fechaActual}.pdf`,
        null, // Sin gráfica
        'line',
        [34, 197, 94], // Color verde para abono
        'abono' // Tipo de estadística
      );
      
      // Mostrar éxito (el loading se desactiva automáticamente)
      setSuccessMessage("Reporte de abono generado exitosamente");
      setShowSuccessNotification(true);
    
    } catch (error) {
      console.error('❌ Error en exportarAbonoPDF:', error);
      setLoadingReportes(prev => ({ ...prev, abono: false }));
      detenerProgresoSimulado();
      setTiempoEstimado("");
      setSuccessMessage("Error al exportar reporte de abono");
      setShowSuccessNotification(true);
    }
  };

  const exportarPlagasPDF = async () => {
    try {
      // Activar loading y calcular tiempo estimado
      setLoadingReportes(prev => ({ ...prev, plagas: true }));
      const tiempoEstimadoSegundos = calcularTiempoEstimado('plagas', plagasData.length);
      const tiempoMaximo = Math.ceil(tiempoEstimadoSegundos * 1.5);
      setTiempoEstimado(`Tiempo estimado: ${tiempoEstimadoSegundos}-${tiempoMaximo} segundos`);
      
      // Iniciar progreso simulado
      iniciarProgresoSimulado(tiempoEstimadoSegundos);
      
      // Pequeño delay para asegurar que el modal se renderice
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const columnas = [
        { header: "Fecha", key: "fecha" },
        { header: "Tipo de Plaga", key: "plaga_especie" },
        { header: "Nivel", key: "plaga_nivel" },
        { header: "Nombre de Siembra", key: "nombre_siembra" },
      ];
      
      const fechaActual = new Date().toISOString().split("T")[0];
      const nombreHuerto = data.garden?.nombre || 'huerto';
      
      await crearPDF(
        `Control de Plagas para ${nombreHuerto}`,
        plagasData,
        columnas,
        `control_plagas_${nombreHuerto.replace(/\s+/g, '_')}_${fechaActual}.pdf`,
        null, // Sin gráfica
        'bar',
        [239, 68, 68], // Color rojo para plagas
        'plagas' // Tipo de estadística
      );
      
      // Mostrar éxito (el loading se desactiva automáticamente)
      setSuccessMessage("Reporte de plagas generado exitosamente");
      setShowSuccessNotification(true);
      
    } catch (error) {
      console.error('❌ Error en exportarPlagasPDF:', error);
      setLoadingReportes(prev => ({ ...prev, plagas: false }));
      detenerProgresoSimulado();
      setTiempoEstimado("");
      setSuccessMessage("Error al exportar reporte de plagas");
      setShowSuccessNotification(true);
    }
  };

  const exportarMantenimientoPDF = async () => {
    try {
      // Activar loading y calcular tiempo estimado
      setLoadingReportes(prev => ({ ...prev, mantenimiento: true }));
      const tiempoEstimadoSegundos = calcularTiempoEstimado('mantenimiento', mantenimientoData.length);
      const tiempoMaximo = Math.ceil(tiempoEstimadoSegundos * 1.5);
      setTiempoEstimado(`Tiempo estimado: ${tiempoEstimadoSegundos}-${tiempoMaximo} segundos`);
      
      // Iniciar progreso simulado
      iniciarProgresoSimulado(tiempoEstimadoSegundos);
      
      // Pequeño delay para asegurar que el modal se renderice
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const columnas = [
        { header: "Fecha", key: "fecha" },
        { header: "Acciones", key: "acciones" },
        { header: "Tiempo", key: "tiempo" },
        { header: "Nombre de Siembra", key: "nombre_siembra" },
      ];
      
      const datosFormateados = mantenimientoData.map(item => ({
        ...item,
        acciones: item.contenido || item.acciones || "No especificado",
        tiempo: item.cantidad_mantenimiento && item.unidad_mantenimiento 
          ? `${item.cantidad_mantenimiento} ${item.unidad_mantenimiento}`
          : "No especificado"
      }));
      
      const fechaActual = new Date().toISOString().split("T")[0];
      const nombreHuerto = data.garden?.nombre || 'huerto';
      
      await crearPDF(
        `Mantenimiento de ${nombreHuerto}`,
        datosFormateados,
        columnas,
        `mantenimiento_${nombreHuerto.replace(/\s+/g, '_')}_${fechaActual}.pdf`,
        null, // Sin gráfica
        null, // Sin tipo de gráfica
        [147, 51, 234] // Color púrpura para mantenimiento
      );
      
      // Mostrar éxito (el loading se desactiva automáticamente)
      setSuccessMessage("✅ Reporte de mantenimiento exportado exitosamente");
      setShowSuccessNotification(true);
      
    } catch (error) {
      console.error('❌ Error en exportarMantenimientoPDF:', error);
      setLoadingReportes(prev => ({ ...prev, mantenimiento: false }));
      detenerProgresoSimulado();
      setTiempoEstimado("");
      setSuccessMessage("Error al exportar reporte de mantenimiento");
      setShowSuccessNotification(true);
    }
  };

  // Función para exportar reporte completo
  const exportarReporteCompleto = async () => {
    try {
      console.log('🚀 Iniciando exportación del reporte completo...');
      console.log('📊 Datos disponibles:', {
        aguaData: aguaData.length,
        siembraData: siembraData.length,
        abonoData: abonoData.length,
        plagasData: plagasData.length,
        garden: data.garden
      });
      
      // Activar loading y calcular tiempo estimado
      setLoadingReportes(prev => ({ ...prev, completo: true }));
      const totalDatos = aguaData.length + siembraData.length + abonoData.length + plagasData.length + mantenimientoData.length;
      const tiempoEstimadoSegundos = calcularTiempoEstimado('completo', totalDatos);
      const tiempoMaximo = Math.ceil(tiempoEstimadoSegundos * 1.5);
      setTiempoEstimado(`Tiempo estimado: ${tiempoEstimadoSegundos}-${tiempoMaximo} segundos`);
      
      // Iniciar progreso simulado
      iniciarProgresoSimulado(tiempoEstimadoSegundos);

      const jsPDFModule = await import("jspdf");
      const { jsPDF } = jsPDFModule;

      const doc = new jsPDF();
      const fechaActual = new Date().toLocaleDateString("es-ES");
      const horaActual = new Date().toLocaleTimeString("es-ES");
      const nombreHuerto = data.garden?.nombre || 'Huerto';

      console.log('📝 Generando portada para huerto:', nombreHuerto);

      // Portada - Color principal (verde)
      doc.setFillColor(34, 197, 94);
      doc.rect(0, 0, 210, 297, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.text("EcoVertical", 105, 80, { align: "center" });

      doc.setFontSize(20);
      doc.text("REPORTE COMPLETO", 105, 100, { align: "center" });
      doc.text("ESTADISTICAS DEL HUERTO", 105, 115, { align: "center" });

      doc.setFontSize(16);
      doc.text(`Huerto: ${nombreHuerto}`, 105, 135, { align: "center" });

      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text(`Generado el: ${fechaActual}`, 105, 155, { align: "center" });
      doc.text(`Hora: ${horaActual}`, 105, 165, { align: "center" });

      if (fechaInicio || fechaFin) {
        doc.setFontSize(12);
        doc.text("Periodo del reporte:", 105, 185, { align: "center" });
        let periodo = "";
        if (fechaInicio) periodo += `Desde: ${fechaInicio} `;
        if (fechaFin) periodo += `Hasta: ${fechaFin}`;
        doc.text(periodo, 105, 195, { align: "center" });
      }

      // Resumen ejecutivo
      doc.addPage();
      doc.setTextColor(55, 65, 81);
      // Header - Color principal (verde)
      doc.setFillColor(34, 197, 94);
      doc.rect(0, 0, 210, 25, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("RESUMEN EJECUTIVO", 15, 16);

      doc.setTextColor(55, 65, 81);
      const estadisticas = obtenerEstadisticas();
      console.log('📈 Estadísticas calculadas:', estadisticas);
      
      let yPos = 40;

      // Análisis IA sobre el reporte completo (dentro del Resumen ejecutivo, antes de métricas)
      try {
        console.log('🤖 Iniciando análisis IA para reporte completo...');
        const { reportsAPI } = await import('../services/apiService');
        
        // Primero probamos comunicación básica
        console.log('🧪 Probando comunicación básica...');
        const testPayload = { test: 'comunicacion', timestamp: new Date().toISOString() };
        const testResponse = await reportsAPI.testAnalyze(testPayload);
        console.log('✅ Test de comunicación exitoso:', testResponse.data);
        
        // Ahora intentamos el análisis IA
        const payload = {
          title: `Reporte Completo - ${nombreHuerto}`,
          summary: `Riego total: ${estadisticas.totalAgua} ${estadisticas.unidadAgua || 'mL'}. Siembra: ${estadisticas.totalSiembra}. Cosecha: ${estadisticas.totalCosecha}. Plagas: ${estadisticas.totalPlagas}.`,
          sections: [
            { title: 'Agua', sample: aguaData.slice(0, 50) },
            { title: 'Siembra', sample: siembraData.slice(0, 50) },
            { title: 'Abono', sample: abonoData.slice(0, 50) },
            { title: 'Plagas', sample: plagasData.slice(0, 50) },
          ]
        };
        console.log('📤 Payload para análisis IA:', payload);
        console.log('🌐 Llamando a reportsAPI.analyzeReport...');
        
        // Usar Promise.race para timeout personalizado (aumentado a 60 segundos)
        const analysisPromise = reportsAPI.analyzeReport(payload);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout personalizado de 60 segundos')), 60000)
        );
        
        const response = await Promise.race([analysisPromise, timeoutPromise]);
        console.log('✅ Respuesta recibida de análisis IA:', response);
        console.log('📊 Estructura de la respuesta:', {
          hasData: !!response?.data,
          hasAnalysis: !!response?.data?.analysis,
          analysisLength: response?.data?.analysis?.length || 0
        });
        
        if (response?.data?.analysis) {
          console.log('📝 Análisis IA obtenido, agregando al PDF...');
          console.log('📄 Primeros 200 caracteres del análisis:', response.data.analysis.substring(0, 200));
          
          // Limpiar texto de caracteres especiales antes de agregar al PDF
          const cleanAnalysis = response.data.analysis
            .replace(/[^\x00-\x7F]/g, '') // Remover caracteres no ASCII
            .replace(/Ø|Ü|Ê|Å|Ë|Bá|=/g, '') // Remover caracteres específicos problemáticos
            .replace(/\s+/g, ' ') // Normalizar espacios
            .trim();
          
          // Usar función especializada para agregar texto con paginación automática
          yPos = agregarTextoConPaginacion(doc, cleanAnalysis, yPos, "Analisis IA (Gemini)");
          console.log('✅ Análisis IA agregado exitosamente al PDF');
        } else {
          console.log('⚠️ No se recibió análisis en la respuesta');
          console.log('🔍 Respuesta completa:', response);
        }
      } catch (aiError) {
        console.error('❌ Error IA en reporte completo:', aiError);
        console.error('❌ Detalles del error:', {
          message: aiError.message,
          status: aiError.response?.status,
          statusText: aiError.response?.statusText,
          data: aiError.response?.data,
          isTimeout: aiError.message.includes('Timeout'),
          isNetworkError: !aiError.response
        });
        
        // Si es un timeout, mostrar mensaje específico
        if (aiError.message.includes('Timeout')) {
          console.log('⏰ El análisis IA tardó más de 35 segundos. Esto puede deberse a:');
          console.log('   - Volumen grande de datos');
          console.log('   - Latencia de red');
          console.log('   - Carga alta en los servidores de Gemini');
        }
        
        // Continuar sin análisis IA - no bloquear el PDF
        console.log('📄 Continuando generación de PDF sin análisis IA...');
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Metricas Principales", 15, yPos);
      yPos += 15;

      // Crear tabla de métricas manualmente
      const metricas = [
        {
          metrica: "Total de Agua Aplicada",
          valor: `${estadisticas.totalAgua} ${estadisticas.unidadAgua || 'mL'}`,
          descripcion: "Cantidad total de riego",
        },
        {
          metrica: "Total de Siembra",
          valor: `${estadisticas.totalSiembra} unidades`,
          descripcion: "Plantas sembradas",
        },
        {
          metrica: "Total de Cosecha",
          valor: `${estadisticas.totalCosecha} unidades`,
          descripcion: "Productos cosechados",
        },
        {
          metrica: "Incidencias de Plagas",
          valor: `${estadisticas.totalPlagas} casos`,
          descripcion: "Plagas detectadas",
        },
        {
          metrica: "Eficiencia de Producción",
          valor: estadisticas.totalSiembra > 0 ? `${(
            (estadisticas.totalCosecha / estadisticas.totalSiembra) *
            100
          ).toFixed(1)}%` : "0%",
          descripcion: "Relación cosecha/siembra",
        },
      ];

      const metricasColumns = [
        { header: "Métrica", key: "metrica" },
        { header: "Valor", key: "valor" },
        { header: "Descripción", key: "descripcion" },
      ];

      yPos = crearTablaManual(doc, metricas, metricasColumns, yPos, "");

      // Análisis de Rendimiento Detallado
      if (siembraData.length > 0) {
        yPos += 10;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Análisis de Rendimiento por Siembra", 15, yPos);
        yPos += 15;

        // Calcular análisis de rendimiento
        const analisisRendimiento = siembraData.map((item, index) => {
          const rendimiento = item.siembra > 0 ? ((item.cosecha / item.siembra) * 100).toFixed(1) : 0;
          const rendimientoTexto = item.siembra > 0 && item.cosecha > 0 
            ? `${rendimiento}% (${item.cosecha} cosechadas de ${item.siembra} sembradas)`
            : item.siembra > 0 
              ? "Sin cosecha aún"
              : "Sin datos";
          
          let interpretacion = "";
          if (item.siembra > 0 && item.cosecha > 0) {
            const porcentaje = parseFloat(rendimiento);
            if (porcentaje >= 200) {
              interpretacion = "Excelente rendimiento - Cada semilla produjo más de 2 plantas";
            } else if (porcentaje >= 100) {
              interpretacion = "Buen rendimiento - Cada semilla produjo al menos 1 planta";
            } else if (porcentaje >= 50) {
              interpretacion = "Rendimiento moderado - Algunas semillas no germinaron";
            } else {
              interpretacion = "Rendimiento bajo - Revisar condiciones de cultivo";
            }
          } else if (item.siembra > 0) {
            interpretacion = "En proceso - Aún no hay cosecha registrada";
          } else {
            interpretacion = "Sin datos de siembra";
          }

          return {
            siembra: `Siembra ${index + 1}`,
            fecha: item.fecha,
            sembradas: item.siembra,
            cosechadas: item.cosecha || 0,
            rendimiento: rendimientoTexto,
            interpretacion: interpretacion
          };
        });

        const rendimientoColumns = [
          { header: "Siembra", key: "siembra" },
          { header: "Fecha", key: "fecha" },
          { header: "Sembradas", key: "sembradas" },
          { header: "Cosechadas", key: "cosechadas" },
          { header: "Rendimiento", key: "rendimiento" },
          { header: "Interpretación", key: "interpretacion" },
        ];

        yPos = crearTablaRendimiento(doc, analisisRendimiento, rendimientoColumns, yPos + 5, "");
      }

      // Secciones detalladas con gráficas
      const secciones = [
        {
          titulo: `Cantidad de Agua para ${data.garden?.nombre || 'el Huerto'}`,
          datos: aguaData.map((item) => ({
            ...item,
            cantidadFormateada: `${item.cantidadMl || item.cantidad * 1000} mL`,
          })),
          columnas: [
            { header: "Fecha", key: "fecha" },
            { header: "Cantidad de agua", key: "cantidadFormateada" },
            { header: "Nombre de Siembra", key: "nombre_siembra" },
          ],
          chartData: {
            labels: aguaData.map(item => item.fecha),
            datasets: [createDataset('Cantidad de Agua (mL)', aguaData.map(item => item.cantidadMl || 0), 'agua', 'bar')]
          },
          chartType: 'bar',
          colorHeader: [6, 182, 212] // Cyan para agua
        },
        {
          titulo: `Siembra y Producción para ${data.garden?.nombre || 'el Huerto'}`,
          datos: siembraData.map((item) => {
            return {
              ...item,
              fecha_cosecha: item.fecha_cosecha || '-',
              cosecha: item.cosecha || 0,
            };
          }),
          columnas: [
            { header: "Fecha de Siembra", key: "fecha" },
            { header: "Nombre de Siembra", key: "nombre_siembra" },
            { header: "Cantidad de Sembrado", key: "siembra" },
            { header: "Fecha de Producción", key: "fecha_cosecha" },
            { header: "Cantidad de Producción", key: "cosecha" },
          ],
          chartData: {
            labels: siembraData.map(item => item.fecha),
            datasets: [
              {
                label: 'Siembra',
                data: siembraData.map(item => item.siembra),
                backgroundColor: '#22c55e',
                borderColor: '#22c55e',
                borderWidth: 1,
                type: 'bar'
              },
              {
                label: 'Cosecha',
                data: siembraData.map(item => item.cosecha),
                backgroundColor: '#f59e0b',
                borderColor: '#f59e0b',
                borderWidth: 1,
                type: 'bar'
              }
            ]
          },
          chartType: 'bar',
          colorHeader: [6, 182, 212] // Cyan para siembra
        },
        {
          titulo: `Cambio de Tierra y Abono para ${data.garden?.nombre || 'el Huerto'}`,
          datos: abonoData,
          columnas: [
            { header: "Fecha", key: "fecha" },
            { header: "Cantidad de Abono", key: "cantidad_abono" },
            { header: "Cambio de Tierra", key: "cambio_tierra" },
            { header: "Nombre de Siembra", key: "nombre_siembra" },
          ],
          chartData: null, // Sin gráfica
          chartType: 'line',
          colorHeader: [34, 197, 94] // Verde para abono
        },
        {
          titulo: `Control de Plagas para ${data.garden?.nombre || 'el Huerto'}`,
          datos: plagasData,
          columnas: [
            { header: "Fecha", key: "fecha" },
            { header: "Tipo de Plaga", key: "plaga_especie" },
            { header: "Nivel", key: "plaga_nivel" },
            { header: "Nombre de Siembra", key: "nombre_siembra" },
          ],
          chartData: null, // Sin gráfica
          chartType: 'bar',
          colorHeader: [239, 68, 68] // Rojo para plagas
        },
        {
          titulo: `Mantenimiento del Huerto para ${data.garden?.nombre || 'el Huerto'}`,
          datos: mantenimientoData.map(item => ({
            ...item,
            acciones: item.contenido || item.acciones || "No especificado",
            tiempo: item.cantidad_mantenimiento && item.unidad_mantenimiento 
              ? `${item.cantidad_mantenimiento} ${item.unidad_mantenimiento}`
              : "No especificado"
          })),
          columnas: [
            { header: "Fecha", key: "fecha" },
            { header: "Acciones", key: "acciones" },
            { header: "Tiempo", key: "tiempo" },
            { header: "Nombre de Siembra", key: "nombre_siembra" },
          ],
          chartData: null, // Sin gráfica para mantenimiento
          chartType: null,
          colorHeader: [147, 51, 234] // Púrpura para mantenimiento
        },
      ];

      console.log('📋 Procesando secciones del reporte...');

      // Procesar secciones secuencialmente para evitar problemas con async/await
      for (const seccion of secciones) {
        console.log(`📄 Procesando sección: ${seccion.titulo} con ${seccion.datos.length} registros`);
        
        doc.addPage();

        // Header de sección - Verde EcoVertical
        doc.setFillColor(34, 197, 94);
        doc.rect(0, 0, 210, 25, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(seccion.titulo.toUpperCase(), 15, 16);

        doc.setTextColor(55, 65, 81);
        doc.setFontSize(12);
        doc.text(`Huerto: ${nombreHuerto}`, 15, 40);
        doc.text(`Registros encontrados: ${seccion.datos.length}`, 15, 50);

        // Agregar gráfica si hay datos
        if (seccion.chartData && seccion.datos.length > 0) {
          try {
            console.log(`📊 Generando gráfica para: ${seccion.titulo}`);
            // Crear gráfica usando Chart.js
            const chartImage = await createChartImage(seccion.chartData, seccion.chartType, {
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            });

            if (chartImage) {
              // Agregar la imagen del gráfico al PDF
              doc.addImage(chartImage, 'PNG', 15, 70, 150, 120);
              crearTablaManual(doc, seccion.datos, seccion.columnas, 200, "", seccion.colorHeader);
            } else {
              crearTablaManual(doc, seccion.datos, seccion.columnas, 70, "", seccion.colorHeader);
            }
          } catch (chartError) {
            console.error('Error al generar gráfica:', chartError);
            crearTablaManual(doc, seccion.datos, seccion.columnas, 70, "", seccion.colorHeader);
          }
        } else {
          console.log(`📝 Agregando tabla sin gráfica para: ${seccion.titulo}`);
          crearTablaManual(doc, seccion.datos, seccion.columnas, 70, "", seccion.colorHeader);
        }
      }

      // Footer en todas las páginas - Verde EcoVertical
      const pageCount = doc.internal.getNumberOfPages();
      console.log(`📚 Total de páginas generadas: ${pageCount}`);
      
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFillColor(34, 197, 94); // Verde EcoVertical
        doc.rect(0, 285, 210, 12, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text(
          `EcoVertical - Reporte Completo del huerto: ${nombreHuerto}`,
          15,
          292
        );
        doc.text(`Página ${i} de ${pageCount}`, 170, 292);
      }

      const fechaArchivo = new Date().toISOString().split("T")[0];
      const nombreArchivo = `reporte_completo_huerto_${nombreHuerto.replace(/\s+/g, '_')}_${fechaArchivo}.pdf`;
      console.log('💾 Guardando archivo:', nombreArchivo);
      
      // Detectar descarga y completar progreso antes de guardar
      detectarDescargaYCompletarProgreso();
      
      doc.save(nombreArchivo);
      console.log('✅ Reporte completo generado exitosamente');
      
      // Mostrar éxito (el loading se desactiva automáticamente)
      setSuccessMessage("Reporte completo generado exitosamente");
      setShowSuccessNotification(true);
      
    } catch (error) {
      console.error("❌ Error al generar reporte completo:", error);
      setLoadingReportes(prev => ({ ...prev, completo: false }));
      detenerProgresoSimulado();
      setTiempoEstimado("");
      setSuccessMessage(
        "Error al generar el reporte completo. Por favor, intenta nuevamente."
      );
      setShowSuccessNotification(true);
    }
  };

  const estadisticas = obtenerEstadisticas();

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
        <Header 
          type='Administrador'
          onAddComment={() => setIsModalOpen(true)}
          totalItems={0}
          filteredCount={0}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-lg text-theme-primary/80">Cargando estadísticas...</p>
          </div>
        </main>
      </div>
    );
  }

  // Mostrar error si existe
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
        <Header 
          type='Administrador'
          onAddComment={() => setIsModalOpen(true)}
          totalItems={0}
          filteredCount={0}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="text-center">
            <AlertCircle className="h-32 w-32 text-red-500 mx-auto" />
            <h2 className="text-2xl font-bold text-red-600 mt-4">Error al cargar datos</h2>
            <p className="mt-2 text-theme-primary/80">{error}</p>
            <button
              onClick={recargarTodasLasEstadisticas}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-theme-primary' : 'bg-gradient-to-br from-eco-scotch-mist via-white to-eco-pear/10'}`}>
      <Header 
        type='Administrador'
        onAddComment={() => setIsModalOpen(true)}
        totalItems={0}
        filteredCount={0}
      />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 pt-24">
        {/* Encabezado principal con información del huerto */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald rounded-3xl shadow-strong p-8 text-white relative overflow-hidden">
            {/* Patrón decorativo de fondo */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
              <div className="absolute top-40 right-20 w-24 h-24 bg-white rounded-full"></div>
              <div className="absolute bottom-20 left-20 w-16 h-16 bg-white rounded-full"></div>
              <div className="absolute bottom-40 right-10 w-20 h-20 bg-white rounded-full"></div>
            </div>
            
            <div className="relative z-10 text-center">
              <h2 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">
                Reportes Gráficos
              </h2>
              
              
              {data.garden?.nombre ? (
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-4 h-4 bg-white rounded-full shadow-lg"></div>
                  <h3 className="text-2xl font-bold text-white">
                    Huerto: {data.garden.nombre}
                  </h3>
                  <div className="w-4 h-4 bg-white rounded-full shadow-lg"></div>
                </div>
              ) : (
                <h3 className="text-2xl text-white/90 font-medium">
                  Cargando información del huerto...
                </h3>
              )}
              {data.garden?.ubicacion && (
                <p className="text-lg text-white/90 font-medium">
                  📍 Ubicación: {data.garden.ubicacion}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Panel de Filtros */}
        <div className="bg-gradient-to-br from-bg-theme-primary to-eco-scotch-mist/30 rounded-3xl shadow-strong border border-theme-primary p-8 mb-8 backdrop-blur-sm">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-theme-primary flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald rounded-xl flex items-center justify-center">
                <Filter className="w-4 h-4 text-white" />
              </div>
              Filtros por Rango de Fechas
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div>
              <Label
                htmlFor="fecha-inicio"
                className="text-sm font-bold text-theme-secondary mb-2 block"
              >
                Fecha Inicio
              </Label>
              <input
                id="fecha-inicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full h-12 rounded-2xl border-2 border-eco-pear/30 dark:border-eco-pear/50 bg-theme-secondary dark:bg-theme-tertiary backdrop-blur-sm px-4 py-3 text-theme-primary font-medium focus:outline-none focus:ring-4 focus:ring-eco-mountain-meadow/30 focus:border-eco-mountain-meadow transition-all duration-300"
              />
            </div>
            <div>
              <Label
                htmlFor="fecha-fin"
                className="text-sm font-bold text-theme-secondary mb-2 block"
              >
                Fecha Fin
              </Label>
              <input
                id="fecha-fin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full h-12 rounded-2xl border-2 border-eco-pear/30 dark:border-eco-pear/50 bg-theme-secondary dark:bg-theme-tertiary backdrop-blur-sm px-4 py-3 text-theme-primary font-medium focus:outline-none focus:ring-4 focus:ring-eco-mountain-meadow/30 focus:border-eco-mountain-meadow transition-all duration-300"
              />
            </div>
            <div className="flex gap-3">
              <Boton
                variant="primary"
                texto="Aplicar"
                onClick={aplicarFiltros}
                icono={<Calendar className="h-4 w-4" />}
                isDarkMode={isDarkMode}
              />
              <Boton
                variant="secondary"
                texto="Limpiar"
                onClick={limpiarFiltros}
                icono={<RotateCcw className="h-4 w-4" />}
                isDarkMode={isDarkMode}
              />
              <Boton
                variant="Reporte"
                texto="Reporte PDF"
                onClick={exportarReporteCompleto}
                icono={<Download className="h-4 w-4" />}
                disabled={Object.values(loadingReportes).some(loading => loading)}
                isDarkMode={isDarkMode}
              />
              <Boton
                variant="secondary"
                texto="Recargar"
                 onClick={recargarTodasLasEstadisticas}
                icono={<RotateCcw className="h-4 w-4" />}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>

          {/* Estadísticas Resumidas */}
          {(fechaInicio || fechaFin) && (
            <div className="mt-8 p-6 bg-gradient-to-r from-eco-emerald/10 to-eco-pear/10 rounded-2xl border border-eco-emerald/30">
              <h4 className="text-xl font-bold text-theme-primary mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-eco-emerald to-eco-pear rounded-lg flex items-center justify-center">
                  <FileText className="w-3 h-3 text-white" />
                </div>
                Resumen del Período Filtrado
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-sm">
                <div className="text-center bg-gradient-to-br from-bg-theme-primary to-eco-scotch-mist/30 rounded-2xl p-4 border border-theme-primary">
                  <div className="text-3xl font-bold text-eco-mountain-meadow">
                    {estadisticas.totalAgua} {estadisticas.unidadAgua || 'mL'}
                  </div>
                  <div className="text-theme-secondary font-bold">Total Agua</div>
                </div>
                <div className="text-center bg-gradient-to-br from-bg-theme-primary to-eco-scotch-mist/30 rounded-2xl p-4 border border-theme-primary">
                  <div className="text-3xl font-bold text-eco-emerald">
                    {estadisticas.totalSiembra}
                  </div>
                  <div className="text-theme-secondary font-bold">Total Siembra</div>
                </div>
                <div className="text-center bg-gradient-to-br from-bg-theme-primary to-eco-scotch-mist/30 rounded-2xl p-4 border border-theme-primary">
                  <div className="text-3xl font-bold text-eco-pear-dark">
                    {estadisticas.totalCosecha}
                  </div>
                  <div className="text-theme-secondary font-bold">Total Cosecha</div>
                </div>
                <div className="text-center bg-gradient-to-br from-bg-theme-primary to-eco-scotch-mist/30 rounded-2xl p-4 border border-theme-primary">
                  <div className="text-3xl font-bold text-red-600">
                    {estadisticas.totalPlagas}
                  </div>
                  <div className="text-theme-secondary font-bold">Total Plagas</div>
                </div>
                <div className="text-center bg-gradient-to-br from-bg-theme-primary to-eco-scotch-mist/30 rounded-2xl p-4 border border-theme-primary">
                  <div className="text-3xl font-bold text-purple-600">
                    {estadisticas.totalMantenimiento}
                  </div>
                  <div className="text-theme-secondary font-bold">Mantenimiento</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Indicador de filtros activos */}
        {(fechaInicio || fechaFin) && (
          <div className="mb-8 p-6 bg-gradient-to-r from-eco-pear/20 to-yellow-100 border-l-4 border-eco-pear rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div className="text-theme-primary font-bold">
                <strong>Filtros activos:</strong>
                {fechaInicio && ` Desde: ${fechaInicio}`}
                {fechaFin && ` Hasta: ${fechaFin}`}
                {aguaData.length === 0 &&
                  siembraData.length === 0 &&
                  abonoData.length === 0 &&
                  plagasData.length === 0 &&
                  mantenimientoData.length === 0 &&
                  " - No se encontraron datos en este rango"}
              </div>
            </div>
          </div>
        )}

        {/* Sección 1: Cantidad de agua */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-bg-theme-primary to-eco-scotch-mist/30 rounded-3xl shadow-strong border border-theme-primary p-8 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-bold text-theme-primary flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2L14 8H16C17.1 8 18 8.9 18 10S17.1 12 16 12H14L10 18L6 12H4C2.9 12 2 11.1 2 10S2.9 8 4 8H6L10 2Z"/>
                  </svg>
                </div>
                Cantidad de agua para {data.garden?.nombre || 'el huerto'}
                <span className="text-lg text-theme-primary/70 font-medium ml-2">
                  ({getTableData('agua').length} registros)
                </span>
              </h3>
              <Boton
                    variant="Reporte"
                    texto="Exportar PDF"
                    onClick={exportarAguaPDF}
                    icono={<Download className="h-4 w-4" />}
                    disabled={getTableData('agua').length === 0 || Object.values(loadingReportes).some(loading => loading)}
                    isDarkMode={isDarkMode}
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Tabla de agua */}
              <div className="bg-gradient-to-br from-bg-theme-secondary to-bg-theme-tertiary rounded-2xl shadow-lg p-6 border border-cyan-200 dark:border-slate-600">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white">
                        <th className="px-6 py-4 text-left rounded-tl-xl font-bold">Fecha</th>
                        <th className="px-6 py-4 text-left font-bold">Cantidad de agua</th>
                        <th className="px-6 py-4 text-left rounded-tr-xl font-bold">Nombre de Siembra</th>
                      </tr>
                    </thead>
                    <tbody>
                    {getTableData('agua').length > 0 ? (
                      getTableData('agua').map((item, index) => (
                          <tr
                            key={index}
                            className={
                              index % 2 === 0 ? "bg-cyan-100 dark:bg-slate-700" : "bg-white dark:bg-slate-800"
                            }
                          >
                            <td className="px-6 py-4 font-medium text-theme-primary">{item.fecha}</td>
                            <td className="px-6 py-4 font-bold text-cyan-600">{item.cantidadMl || 0} mL</td>
                            <td className="px-6 py-4">
                              {item.nombre_siembra ? (
                                <span className="px-3 py-2 rounded-full text-xs font-bold bg-eco-emerald/20 text-eco-emerald-dark border border-eco-emerald/30">
                                  {item.nombre_siembra}
                                </span>
                              ) : (
                                <span className="text-theme-primary/50 font-medium">No especificado</span>
                              )}
                            </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-8 text-center text-theme-primary/50 font-medium"
                        >
                          No hay datos disponibles para el rango seleccionado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                </div>
              </div>

              {/* Gráfico de barras de agua */}
              <div className="bg-gradient-to-br from-bg-theme-primary to-eco-scotch-mist/30 rounded-3xl shadow-strong border border-theme-primary p-8 backdrop-blur-sm">
              {aguaData.length > 0 ? (
                <ChartContainer
                  config={{
                    cantidad: {
                      label: "Cantidad de agua (mL)",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <BarChart data={aguaData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="fecha"
                      tickFormatter={(value) => {
                        if (typeof value !== "string") return value;
                        const parts = value.split("/");
                        return parts.length >= 2
                          ? `${parts[0]}/${parts[1]}`
                          : value;
                      }}
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="cantidadMl" name="Cantidad (mL)" fill="#0891b2" />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-theme-primary/70">
                  No hay datos para mostrar en el gráfico
                </div>
              )}
              </div>
            </div>

          </div>
        </section>

        {/* Sección 2: Cantidad de sembrado y producción */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-bg-theme-primary to-eco-scotch-mist/30 rounded-3xl shadow-strong border border-theme-primary p-8 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-bold text-theme-primary flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2L14 8H16C17.1 8 18 8.9 18 10S17.1 12 16 12H14L10 18L6 12H4C2.9 12 2 11.1 2 10S2.9 8 4 8H6L10 2Z"/>
                  </svg>
                </div>
                Cantidad de sembrado y su producción para {data.garden?.nombre || 'el huerto'}
                <span className="text-lg text-theme-primary/70 font-medium ml-2">
                  ({siembraData.length} registros)
                </span>
              </h3>
              <Boton
                    variant="Reporte"
                    texto="Exportar PDF"
                    onClick={exportarSiembraPDF}
                    icono={<Download className="h-4 w-4" />}
                    disabled={siembraData.length === 0 || Object.values(loadingReportes).some(loading => loading)}
                    isDarkMode={isDarkMode}
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Tabla de siembra */}
              <div className="bg-gradient-to-br from-bg-theme-secondary to-bg-theme-tertiary rounded-2xl shadow-lg p-6 border border-green-200 dark:border-slate-600">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                        <th className="px-6 py-4 text-left rounded-tl-xl font-bold">Fecha de Siembra</th>
                        <th className="px-6 py-4 text-left font-bold">Nombre de Siembra</th>
                        <th className="px-6 py-4 text-left font-bold">Cantidad de Sembrado</th>
                        <th className="px-6 py-4 text-left font-bold">Fecha de Producción</th>
                        <th className="px-6 py-4 text-left rounded-tr-xl font-bold">Cantidad de Producción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {siembraData.length > 0 ? (
                        siembraData.map((item, index) => (
                          <tr
                            key={`siembra-${item.fecha}-${index}`}
                            className={
                              index % 2 === 0 ? "bg-green-100 dark:bg-slate-700" : "bg-white dark:bg-slate-800"
                            }
                          >
                            <td className="px-6 py-4 font-medium text-theme-primary">{item.fecha}</td>
                            <td className="px-6 py-4">
                              {item.nombre_siembra ? (
                                <span className="px-3 py-2 rounded-full text-xs font-bold bg-eco-emerald/20 text-eco-emerald-dark border border-eco-emerald/30">
                                  {item.nombre_siembra}
                                </span>
                              ) : (
                                <span className="text-theme-primary/70">No especificado</span>
                              )}
                            </td>
                            <td className="px-6 py-4 font-bold text-green-600">{item.siembra}</td>
                            <td className="px-6 py-4 font-medium text-theme-primary">{item.fecha_cosecha || '-'}</td>
                            <td className="px-6 py-4 font-bold text-green-600">{item.cosecha || 0}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-8 text-center text-theme-primary/70 font-medium"
                          >
                            No hay datos disponibles para el rango seleccionado
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Gráfico de barras agrupadas para siembra y cosecha */}
              <div className="bg-gradient-to-br from-bg-theme-primary to-eco-scotch-mist/30 rounded-3xl shadow-strong border border-theme-primary p-8 backdrop-blur-sm">
                {siembraData.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={siembraData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="fecha" 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => {
                            if (typeof value !== "string") return value;
                            const parts = value.split("/");
                            return parts.length >= 2
                              ? `${parts[0]}/${parts[1]}`
                              : value;
                          }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          label={{ value: 'Cantidad', angle: -90, position: 'insideLeft' }}
                        />
                        <ChartTooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className={`p-3 border rounded-lg shadow-lg ${
                                  isDarkMode 
                                    ? 'bg-slate-800 border-slate-600 text-white' 
                                    : 'bg-white border-gray-200'
                                }`}>
                                  <p className={`font-semibold mb-2 ${
                                    isDarkMode ? 'text-white' : 'text-theme-primary'
                                  }`}>
                                    Fecha: {label}
                                  </p>
                                  {payload.map((entry, index) => (
                                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                                      {entry.name}: {entry.value} unidades
                                    </p>
                                  ))}
                                  {payload.length === 2 && payload[0].value > 0 && payload[1].value > 0 && (
                                    <p className={`text-sm font-medium mt-1 ${
                                      isDarkMode ? 'text-green-400' : 'text-green-600'
                                    }`}>
                                      Rendimiento: {((payload[1].value / payload[0].value) * 100).toFixed(1)}%
                                    </p>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar 
                          dataKey="siembra" 
                          name="Siembra" 
                          fill="#22c55e" 
                          radius={[2, 2, 0, 0]}
                          maxBarSize={60}
                        />
                        <Bar 
                          dataKey="cosecha" 
                          name="Cosecha" 
                          fill="#f59e0b" 
                          radius={[2, 2, 0, 0]}
                          maxBarSize={60}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-theme-primary/70">
                    No hay datos para mostrar en el gráfico
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* Sección 3: Cambio de tierra o agregado de abono */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-bg-theme-primary to-eco-scotch-mist/30 rounded-3xl shadow-strong border border-theme-primary p-8 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-bold text-theme-primary flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2L14 8H16C17.1 8 18 8.9 18 10S17.1 12 16 12H14L10 18L6 12H4C2.9 12 2 11.1 2 10S2.9 8 4 8H6L10 2Z"/>
                  </svg>
                </div>
                Cambio de tierra o agregado de abono para {data.garden?.nombre || 'el huerto'}
                <span className="text-lg text-theme-primary/70 font-medium ml-2">
                  ({getTableData('abono').length} registros)
                </span>
              </h3>
              <Boton
                    variant="Reporte"
                    texto="Exportar PDF"
                    onClick={exportarAbonoPDF}
                    icono={<Download className="h-4 w-4" />}
                    disabled={getTableData('abono').length === 0 || Object.values(loadingReportes).some(loading => loading)}
                    isDarkMode={isDarkMode}
              />
            </div>

            <div className="bg-gradient-to-br from-bg-theme-secondary to-bg-theme-tertiary rounded-2xl shadow-lg p-6 border border-orange-200 dark:border-slate-600">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                      <th className="px-6 py-4 text-left rounded-tl-xl font-bold">Fecha</th>
                      <th className="px-6 py-4 text-left font-bold">Cantidad de Abono</th>
                      <th className="px-6 py-4 text-left font-bold">Cambio de Tierra</th>
                      <th className="px-6 py-4 text-left rounded-tr-xl font-bold">Nombre de Siembra</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getTableData('abono').length > 0 ? (
                      getTableData('abono').map((item, index) => (
                        <tr
                          key={index}
                          className={index % 2 === 0 ? "bg-orange-100 dark:bg-slate-700" : "bg-white dark:bg-slate-800"}
                        >
                          <td className="px-6 py-4 font-medium text-theme-primary">{item.fecha}</td>
                          <td className="px-6 py-4 font-bold text-orange-600">{item.cantidad_abono} {item.unidad_abono || 'kg'}</td>
                          <td className="px-6 py-4">
                            {item.cambio_tierra ? (
                              <span className={`px-3 py-2 rounded-full text-xs font-bold border ${
                                item.cambio_tierra === 'si' 
                                  ? 'bg-eco-emerald/20 text-eco-emerald-dark border-eco-emerald/30' 
                                  : 'bg-eco-pear/20 text-eco-pear-dark border-eco-pear/30'
                              }`}>
                                {item.cambio_tierra === 'si' ? 'Cambiada completamente' : 'Agregada por encima'}
                              </span>
                            ) : (
                              <span className="text-theme-primary/70">No especificado</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {item.nombre_siembra ? (
                              <span className="px-3 py-2 rounded-full text-xs font-bold bg-eco-pear/20 text-eco-pear-dark border border-eco-pear/30">
                                {item.nombre_siembra}
                              </span>
                            ) : (
                              <span className="text-theme-primary/70">No especificado</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-8 text-center text-theme-primary/70 font-medium"
                        >
                          No hay datos disponibles para el rango seleccionado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </section>

        {/* Sección 4: Control de plagas */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-bg-theme-primary to-eco-scotch-mist/30 rounded-3xl shadow-strong border border-theme-primary p-8 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-bold text-theme-primary flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2L14 8H16C17.1 8 18 8.9 18 10S17.1 12 16 12H14L10 18L6 12H4C2.9 12 2 11.1 2 10S2.9 8 4 8H6L10 2Z"/>
                  </svg>
                </div>
                Control de plagas
                <span className="text-lg text-theme-primary/70 font-medium ml-2">
                  ({getTableData('plagas').length} registros)
                </span>
              </h3>
              <Boton
                    variant="Reporte"
                    texto="Exportar PDF"
                    onClick={exportarPlagasPDF}
                    icono={<Download className="h-4 w-4" />}
                    disabled={getTableData('plagas').length === 0 || Object.values(loadingReportes).some(loading => loading)}
                    isDarkMode={isDarkMode}
              />
            </div>

            <div className="bg-gradient-to-br from-bg-theme-secondary to-bg-theme-tertiary rounded-2xl shadow-lg p-6 border border-red-200 dark:border-slate-600">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                      <th className="px-6 py-4 text-left rounded-tl-xl font-bold">Fecha</th>
                      <th className="px-6 py-4 text-left font-bold">Tipo de Plaga</th>
                      <th className="px-6 py-4 text-left font-bold">Nivel</th>
                      <th className="px-6 py-4 text-left rounded-tr-xl font-bold">Nombre de Siembra</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getTableData('plagas').length > 0 ? (
                      getTableData('plagas').map((item, index) => (
                        <tr
                          key={index}
                          className={index % 2 === 0 ? "bg-red-100 dark:bg-slate-700" : "bg-white dark:bg-slate-800"}
                        >
                          <td className="px-6 py-4 font-medium text-theme-primary">{item.fecha}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-2 rounded-full text-xs font-bold border ${
                              item.plaga_especie === 'No especificada' 
                                ? 'bg-gray-200 text-gray-700 border-gray-300' 
                                : 'bg-red-500/20 text-red-400 border-red-500/30'
                            }`}>
                              {item.plaga_especie}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-2 rounded-full text-xs font-bold border ${
                              item.plaga_nivel === 'pocos' 
                                ? 'bg-eco-pear/20 text-eco-pear-dark border-eco-pear/30'
                                : item.plaga_nivel === 'medio'
                                ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                                : 'bg-red-500/20 text-red-400 border-red-500/30'
                            }`}>
                              {item.plaga_nivel}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {item.nombre_siembra ? (
                              <span className="px-3 py-2 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                                {item.nombre_siembra}
                              </span>
                            ) : (
                              <span className="text-theme-primary/70">No especificado</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-8 text-center text-theme-primary/70 font-medium"
                        >
                          No hay datos disponibles para el rango seleccionado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </section>

        {/* Sección 5: Mantenimiento */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-bg-theme-primary to-eco-scotch-mist/30 rounded-3xl shadow-strong border border-theme-primary p-8 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-bold text-theme-primary flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2L14 8H16C17.1 8 18 8.9 18 10S17.1 12 16 12H14L10 18L6 12H4C2.9 12 2 11.1 2 10S2.9 8 4 8H6L10 2Z"/>
                  </svg>
                </div>
                Mantenimiento del huerto
                <span className="text-lg text-theme-primary/70 font-medium ml-2">
                  ({mantenimientoData.length} registros)
                </span>
              </h3>
              <Boton
                    variant="Reporte"
                    texto="Exportar PDF"
                    onClick={exportarMantenimientoPDF}
                    icono={<Download className="h-4 w-4" />}
                    disabled={mantenimientoData.length === 0 || loadingReportes.mantenimiento}
                    isDarkMode={isDarkMode}
              />
            </div>

            {/* Tabla de mantenimiento - Sin gráfica */}
            <div className="bg-gradient-to-br from-bg-theme-secondary to-bg-theme-tertiary rounded-2xl shadow-lg p-6 border border-purple-200 dark:border-slate-600">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                      <th className="px-6 py-4 text-left rounded-tl-xl font-bold">Fecha</th>
                      <th className="px-6 py-4 text-left font-bold">Acciones</th>
                      <th className="px-6 py-4 text-left font-bold">Tiempo</th>
                      <th className="px-6 py-4 text-left rounded-tr-xl font-bold">Nombre de Siembra</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mantenimientoData.length > 0 ? (
                      mantenimientoData.map((item, index) => (
                        <tr
                          key={index}
                          className={index % 2 === 0 ? "bg-purple-100 dark:bg-slate-700" : "bg-white dark:bg-slate-800"}
                        >
                          <td className="px-6 py-4 font-medium text-theme-primary">{item.fecha}</td>
                          <td className="px-6 py-4 font-medium text-theme-primary">
                            {item.contenido || item.acciones || "No especificado"}
                          </td>
                          <td className="px-6 py-4">
                            {item.cantidad_mantenimiento && item.unidad_mantenimiento ? (
                              <span className="px-3 py-2 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                {item.cantidad_mantenimiento} {item.unidad_mantenimiento}
                              </span>
                            ) : (
                              <span className="text-theme-primary/70">No especificado</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {item.nombre_siembra ? (
                              <span className="px-3 py-2 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                {item.nombre_siembra}
                              </span>
                            ) : (
                              <span className="text-theme-primary/70">No especificado</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-8 text-center text-theme-primary/70 font-medium"
                        >
                          No hay datos disponibles para el rango seleccionado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Notificación de éxito personalizada */}
      <SuccessNotification
        isVisible={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        title="¡Operación Completada!"
        message={successMessage}
        type="garden"
        duration={4000}
      />
      
      {/* Spinner de carga para reportes */}
      <ReporteSpinner 
        isLoading={Object.values(loadingReportes).some(loading => loading)}
        tiempoEstimado={tiempoEstimado}
        tipoReporte={
          loadingReportes.agua ? 'agua' :
          loadingReportes.plagas ? 'plagas' :
          loadingReportes.abono ? 'abono' :
          loadingReportes.siembra ? 'siembra' :
          loadingReportes.mantenimiento ? 'mantenimiento' :
          loadingReportes.completo ? 'completo' : null
        }
        progresoActual={progresoActual}
        tiempoRestante={tiempoRestante}
      />
    </div>
  );
}

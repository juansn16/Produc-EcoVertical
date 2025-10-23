import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/layout/card';
import { Button } from '@/components/layout/button';
import { 
  Brain, 
  Droplets, 
  Leaf, 
  Bug, 
  Flower, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import statisticsService from '@/services/statisticsService';

const GeminiAnalysisCard = ({ 
  gardenId, 
  analysisType, 
  title, 
  icon: Icon, 
  color = 'blue',
  onAnalysisComplete 
}) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-800',
      icon: 'text-orange-600',
      button: 'bg-orange-600 hover:bg-orange-700'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700'
    }
  };

  const currentColor = colorClasses[color] || colorClasses.blue;

  const getAnalysisFunction = () => {
    switch (analysisType) {
      case 'water':
        return statisticsService.analyzeWaterStatistics;
      case 'fertilizer':
        return statisticsService.analyzeFertilizerStatistics;
      case 'pests':
        return statisticsService.analyzePestStatistics;
      case 'planting':
        return statisticsService.analyzePlantingStatistics;
      default:
        throw new Error('Tipo de análisis no válido');
    }
  };

  const handleAnalyze = async () => {
    if (!gardenId) {
      setError('ID de huerto no disponible');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const analysisFunction = getAnalysisFunction();
      const result = await analysisFunction.call(statisticsService, gardenId);
      
      if (result.success) {
        setAnalysis(result.data);
        setLastUpdated(new Date());
        onAnalysisComplete?.(result.data);
      } else {
        setError('Error en el análisis');
      }
    } catch (err) {
      console.error('Error en análisis:', err);
      setError(err.message || 'Error al obtener análisis');
    } finally {
      setLoading(false);
    }
  };

  const formatAnalysisText = (text) => {
    if (!text) return '';
    
    // Limpiar caracteres especiales y codificación incorrecta
    const cleanText = text
      .replace(/[^\x00-\x7F]/g, '') // Remover caracteres no ASCII
      .replace(/Ø|Ü|Ê|Å|Ë|Bá|=/g, '') // Remover caracteres específicos problemáticos
      .replace(/\s+/g, ' ') // Normalizar espacios
      .trim();
    
    // Dividir por líneas y filtrar vacías
    const lines = cleanText.split('\n').filter(line => line.trim());
    
    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      
      // Si la línea está vacía, no renderizar nada
      if (!trimmedLine) return null;
      
      // Si la línea empieza con un número o bullet
      if (trimmedLine.match(/^\d+\.|\*|\-|\•/)) {
        return (
          <div key={index} className="mb-3 pl-4">
            <span className="font-medium text-gray-800">{trimmedLine}</span>
          </div>
        );
      }
      
      // Si la línea está en negrita (markdown)
      if (trimmedLine.includes('**')) {
        const parts = trimmedLine.split('**');
        return (
          <div key={index} className="mb-3">
            {parts.map((part, i) => 
              i % 2 === 1 ? (
                <strong key={i} className="font-semibold text-gray-900">{part}</strong>
              ) : (
                <span key={i} className="text-gray-700">{part}</span>
              )
            )}
          </div>
        );
      }
      
      // Línea normal
      return (
        <div key={index} className="mb-3 text-gray-700 leading-relaxed">
          {trimmedLine}
        </div>
      );
    }).filter(Boolean); // Filtrar elementos null
  };

  return (
    <Card className={`w-full ${currentColor.bg} ${currentColor.border} border-2`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${currentColor.text}`}>
          <Icon className={`h-5 w-5 ${currentColor.icon}`} />
          {title}
          <Brain className="h-4 w-4 ml-auto" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!analysis && !loading && !error && (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">
              Obtén un análisis inteligente específico para esta estadística
            </p>
            <Button 
              onClick={handleAnalyze}
              className={`${currentColor.button} text-white`}
            >
              <Brain className="h-4 w-4 mr-2" />
              Analizar con IA
            </Button>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-600" />
            <p className="text-gray-600">
              Analizando datos con Gemini...
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              onClick={handleAnalyze}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        )}

        {analysis && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600">Análisis completado</span>
              </div>
              {lastUpdated && (
                <span className="text-xs text-gray-500">
                  {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="max-w-none">
                <div className="text-sm leading-relaxed">
                  {formatAnalysisText(analysis.analysis)}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleAnalyze}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar Análisis
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GeminiAnalysisCard;

// Controlador de reportes

export const generateReport = (req, res) => {
  res.json({ message: 'Generar reporte' });
};

export const downloadReport = (req, res) => {
  res.json({ message: 'Descargar reporte', reportId: req.params.reportId });
};

export const getReportHistory = (req, res) => {
  res.json({ message: 'Historial de reportes' });
};

export const deleteReport = (req, res) => {
  res.json({ message: 'Eliminar reporte', id: req.params.id });
};

export const listReports = (req, res) => {
  res.json({ message: 'Listado de reportes generados' });
};

// --- Test endpoint para verificar comunicación ---
export const testAnalyze = async (req, res) => {
  try {
    console.log('🧪 TEST: POST /api/reports/test-analyze - Petición recibida');
    console.log('📦 Body recibido:', req.body);
    
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.log('❌ GEMINI_API_KEY no configurado');
      return res.status(200).json({ 
        message: 'Análisis de IA no disponible - API key no configurada',
        response: 'El análisis de IA está deshabilitado. Para habilitarlo, configure GEMINI_API_KEY en las variables de entorno.',
        model: 'N/A',
        timestamp: new Date().toISOString(),
        receivedData: req.body,
        warning: 'Esta es una respuesta simulada. Configure GEMINI_API_KEY para análisis real.'
      });
    }
    
    console.log('✅ API Key encontrada, inicializando Gemini...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const preferredModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    let model = genAI.getGenerativeModel({ model: preferredModel });
    
    const prompt = 'Responde con "Hola, soy Gemini y estoy funcionando correctamente" en español.';
    
    console.log('🤖 Enviando prompt de prueba a Gemini con modelo:', preferredModel);
    const startTime = Date.now();
    
    let result;
    try {
      result = await model.generateContent(prompt);
      const endTime = Date.now();
      console.log('✅ Gemini respondió en', (endTime - startTime), 'ms');
    } catch (primaryErr) {
      const endTime = Date.now();
      console.error('⚠️  Error con modelo preferido después de', (endTime - startTime), 'ms:', preferredModel, primaryErr?.status, primaryErr?.statusText);
      
      // Fallback automático
      const fallbackModelName = 'gemini-pro';
      try {
        console.log('🔁 Intentando fallback de modelo:', fallbackModelName);
        const fallbackStartTime = Date.now();
        model = genAI.getGenerativeModel({ model: fallbackModelName });
        result = await model.generateContent(prompt);
        const fallbackEndTime = Date.now();
        console.log('✅ Fallback exitoso en', (fallbackEndTime - fallbackStartTime), 'ms');
      } catch (fallbackErr) {
        const fallbackEndTime = Date.now();
        console.error('❌ Fallback también falló después de', (fallbackEndTime - fallbackStartTime), 'ms:', fallbackErr);
        throw primaryErr;
      }
    }
    
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Prueba exitosa:', text);
    return res.json({ 
      message: 'Prueba exitosa', 
      response: text, 
      model: preferredModel,
      timestamp: new Date().toISOString(),
      receivedData: req.body 
    });
  } catch (error) {
    console.error('❌ Error en test:', error);
    return res.status(500).json({ message: 'Error en test', error: error.message });
  }
};

// --- Análisis con Gemini ---
export const analyzeReport = async (req, res) => {
  try {
    console.log('🔍 POST /api/reports/analyze - Petición recibida');
    console.log('📋 Headers:', req.headers);
    console.log('📦 Body recibido:', req.body);
    
    const { title, summary, sections } = req.body || {};

    console.log('📊 Datos recibidos para análisis:', { title, summary, sectionsLength: sections?.length });

    if (!summary && (!sections || sections.length === 0)) {
      console.log('❌ Datos insuficientes para análisis');
      return res.status(400).json({ message: 'Datos insuficientes para análisis' });
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log('❌ GEMINI_API_KEY no configurado');
      return res.status(200).json({ 
        analysis: `ANÁLISIS SIMULADO - IA NO DISPONIBLE

Título: ${title || 'Reporte del Huerto'}
Resumen: ${summary || 'Sin resumen disponible'}

HALLAZGOS CLAVE:
• Los datos muestran actividad normal en el huerto
• Se observan patrones típicos de crecimiento
• No se detectan anomalías significativas

TENDENCIAS OBSERVADAS:
• Crecimiento estable de las plantas
• Mantenimiento regular del huerto
• Actividad de riego consistente

ALERTAS O RIESGOS:
• Ningún riesgo crítico identificado
• Monitoreo continuo recomendado

RECOMENDACIONES:
• Continuar con el mantenimiento actual
• Monitorear el crecimiento de las plantas
• Mantener el programa de riego establecido

NOTA: Este es un análisis simulado. Para análisis real con IA, configure GEMINI_API_KEY en las variables de entorno.`
      });
    }

    console.log('✅ API Key encontrada, inicializando Gemini...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const preferredModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    let model = genAI.getGenerativeModel({ model: preferredModel });

    const prompt = `Analiza estos datos de un huerto urbano y proporciona un análisis ejecutivo en español:

TÍTULO: ${title || 'Reporte del Huerto'}
RESUMEN: ${summary || 'Sin resumen disponible'}

DATOS DETALLADOS:
${JSON.stringify(sections || [], null, 2)}

Por favor proporciona:
1. Hallazgos clave (3-5 puntos principales)
2. Tendencias observadas
3. Alertas o riesgos identificados
4. Recomendaciones prácticas

Responde en español de manera clara y concisa.`;

    console.log('🤖 Enviando prompt a Gemini con modelo:', preferredModel);
    console.log('📏 Tamaño del prompt:', prompt.length, 'caracteres');
    console.log('⏰ Iniciando llamada a Gemini...');
    const startTime = Date.now();
    
    let response;
    try {
      response = await model.generateContent(prompt);
      const endTime = Date.now();
      console.log('✅ Gemini respondió en', (endTime - startTime), 'ms');
    } catch (primaryErr) {
      const endTime = Date.now();
      console.error('⚠️  Error con modelo preferido después de', (endTime - startTime), 'ms:', preferredModel, primaryErr?.status, primaryErr?.statusText);
      console.error('🔍 Detalles del error:', primaryErr);
      
      // Fallback automático a un modelo conocido si hay 404 u otro error
      const fallbackModelName = 'gemini-pro';
      try {
        console.log('🔁 Intentando fallback de modelo:', fallbackModelName);
        const fallbackStartTime = Date.now();
        model = genAI.getGenerativeModel({ model: fallbackModelName });
        response = await model.generateContent(prompt);
        const fallbackEndTime = Date.now();
        console.log('✅ Fallback exitoso en', (fallbackEndTime - fallbackStartTime), 'ms');
      } catch (fallbackErr) {
        const fallbackEndTime = Date.now();
        console.error('❌ Fallback también falló después de', (fallbackEndTime - fallbackStartTime), 'ms:', fallbackErr);
        throw primaryErr; // Propaga el error original
      }
    }

    const text = response?.response?.text?.() || '';

    console.log('✅ Respuesta de Gemini recibida:', text.substring(0, 200) + '...');
    console.log('📤 Enviando respuesta al frontend...');
    return res.json({ analysis: text.trim() });
  } catch (error) {
    console.error('❌ Error en analyzeReport:', error);
    return res.status(500).json({ message: 'Error al analizar reporte', error: error.message });
  }
};
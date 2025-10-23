import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

async function testStatisticsAPI() {
  try {
    console.log('🔍 Probando API de estadísticas...');

    // Usar token válido de usuario existente
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImEzMGY4NDQ3LTkyNTYtMTFmMC04Yjg4LWM4Zjc1MDBiYzMyOSIsInJvbGUiOiJhZG1pbmlzdHJhZG9yIiwiaWF0IjoxNzU4MTIzNDkxLCJleHAiOjE3NTgxMjcwOTF9.yoKgb-ocVOLY7j__UO--vCll4DUOj7yEzGeickgt1cE';

    console.log('🔐 Token generado:', token.substring(0, 50) + '...');

    // Probar la API de estadísticas
    const gardenId = '95b0d4af-91a3-11f0-8bda-dc1ba1b74868';
    const url = `http://localhost:3000/api/statistics/gardens/${gardenId}`;
    
    console.log('📡 Llamando a:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Status de respuesta:', response.status);
    console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Respuesta exitosa:');
      console.log('📈 Datos de siembra:', data.data?.plantingData?.length || 0, 'registros');
      console.log('💧 Datos de agua:', data.data?.waterData?.length || 0, 'registros');
      console.log('🌿 Datos de abono:', data.data?.fertilizerData?.length || 0, 'registros');
      console.log('🐛 Datos de plagas:', data.data?.pestData?.length || 0, 'registros');
      
      if (data.data?.plantingData?.length > 0) {
        console.log('\n🌱 Primeros datos de siembra:');
        data.data.plantingData.slice(0, 3).forEach((item, index) => {
          console.log(`  ${index + 1}. Fecha: ${item.fecha}`);
          console.log(`     Siembra: ${item.siembra || 0}`);
          console.log(`     Cosecha: ${item.cosecha || 0}`);
          console.log(`     Tipo: ${item.tipo_comentario}`);
        });
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Error en la respuesta:', errorText);
    }

  } catch (error) {
    console.error('❌ Error al probar la API:', error.message);
  }
}

testStatisticsAPI()
  .then(() => console.log('✅ Prueba completada'))
  .catch((err) => console.error('❌ Error en prueba:', err));

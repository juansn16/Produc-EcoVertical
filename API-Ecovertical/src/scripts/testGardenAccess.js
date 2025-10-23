import fetch from 'node-fetch';

async function testGardenAccess() {
  try {
    console.log('🔍 Probando acceso a huertos desde el frontend...\n');

    // Simular login de Renger
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: '0897@gmail.com',
        password: '123456'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Error en login:', await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login exitoso:', loginData.user?.nombre);

    const token = loginData.accessToken;
    console.log('🔑 Token obtenido:', token ? 'Sí' : 'No');

    // Probar obtener huertos privados
    console.log('\n🔍 Solicitando huertos privados...');
    const gardensResponse = await fetch('http://localhost:3000/api/gardens?type=privado', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('📊 Status de respuesta:', gardensResponse.status);
    
    if (gardensResponse.ok) {
      const gardensData = await gardensResponse.json();
      console.log('✅ Huertos obtenidos:', gardensData.data?.length || 0);
      gardensData.data?.forEach(garden => {
        console.log(`  - ${garden.nombre} (${garden.tipo}) - Acceso: ${garden.access_type}`);
      });
    } else {
      const errorText = await gardensResponse.text();
      console.log('❌ Error al obtener huertos:', errorText);
    }

    // Probar obtener detalles del huerto específico
    console.log('\n🔍 Probando acceso a huerto específico...');
    const gardenDetailResponse = await fetch('http://localhost:3000/api/gardens/e92a3616-a490-11f0-a158-02b6fb3e1c29', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('📊 Status de respuesta (detalles):', gardenDetailResponse.status);
    
    if (gardenDetailResponse.ok) {
      const gardenDetail = await gardenDetailResponse.json();
      console.log('✅ Detalles del huerto obtenidos:', gardenDetail.data?.nombre);
    } else {
      const errorText = await gardenDetailResponse.text();
      console.log('❌ Error al obtener detalles:', errorText);
    }

  } catch (error) {
    console.error('Error en prueba:', error);
  }
}

testGardenAccess();

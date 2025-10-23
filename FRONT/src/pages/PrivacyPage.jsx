import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-theme-primary">
      <Header />
      <main className="pt-16 sm:pt-13">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Header de la página */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-eco-emerald mb-4">
              Política de Privacidad
            </h1>
            <p className="text-lg text-gray-300">
              Última actualización: {new Date().toLocaleDateString('es-ES')}
            </p>
          </div>

          {/* Contenido */}
          <div className="prose prose-lg max-w-none text-white">
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-eco-emerald mb-4">
                1. Información General
              </h2>
              <p className="mb-4">
                En EcoVertical, respetamos su privacidad y nos comprometemos a proteger sus datos personales. 
                Esta Política de Privacidad explica cómo recopilamos, utilizamos y protegemos su información 
                cuando utiliza nuestros servicios.
              </p>
              <p className="mb-4">
                Al utilizar EcoVertical, usted acepta las prácticas descritas en esta política de privacidad.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-eco-emerald mb-4">
                2. Información que Recopilamos
              </h2>
              
              <h3 className="text-xl font-semibold text-eco-emerald mb-3">
                2.1 Información Personal
              </h3>
              <p className="mb-4">
                Recopilamos información que usted nos proporciona directamente, incluyendo:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Nombre completo y datos de contacto (email, teléfono)</li>
                <li>Información de la cuenta (nombre de usuario, contraseña)</li>
                <li>Dirección de residencia (para servicios de entrega)</li>
                <li>Preferencias de cultivo y jardín</li>
                <li>Comunicaciones que mantiene con nosotros</li>
              </ul>

              <h3 className="text-xl font-semibold text-eco-emerald mb-3">
                2.2 Información de Uso
              </h3>
              <p className="mb-4">
                Recopilamos automáticamente información sobre cómo utiliza nuestros servicios:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Datos de navegación y actividad en la plataforma</li>
                <li>Información de dispositivos (tipo, sistema operativo, navegador)</li>
                <li>Dirección IP y ubicación geográfica aproximada</li>
                <li>Cookies y tecnologías similares</li>
                <li>Datos de sensores de jardín (si utiliza dispositivos IoT)</li>
              </ul>

              <h3 className="text-xl font-semibold text-eco-emerald mb-3">
                2.3 Información de Jardín
              </h3>
              <p className="mb-4">
                Para proporcionar servicios personalizados, recopilamos:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Datos de cultivos y plantas</li>
                <li>Información de riego y fertilización</li>
                <li>Mediciones de sensores (humedad, temperatura, luz)</li>
                <li>Fotos y notas sobre el progreso de cultivos</li>
                <li>Historial de actividades de jardinería</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-eco-emerald mb-4">
                3. Cómo Utilizamos su Información
              </h2>
              <p className="mb-4">
                Utilizamos su información para los siguientes propósitos:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Provisión de servicios:</strong> Gestionar su cuenta y proporcionar funcionalidades de jardinería</li>
                <li><strong>Personalización:</strong> Adaptar recomendaciones y consejos a sus necesidades específicas</li>
                <li><strong>Comunicación:</strong> Enviar notificaciones importantes y actualizaciones del servicio</li>
                <li><strong>Mejora del servicio:</strong> Analizar el uso para mejorar nuestras funcionalidades</li>
                <li><strong>Investigación:</strong> Desarrollar nuevas características y servicios</li>
                <li><strong>Cumplimiento legal:</strong> Cumplir con obligaciones legales y regulatorias</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-eco-emerald mb-4">
                4. Compartir Información
              </h2>
              <p className="mb-4">
                No vendemos, alquilamos ni compartimos su información personal con terceros, excepto en las siguientes circunstancias:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Con su consentimiento:</strong> Cuando usted nos autoriza explícitamente</li>
                <li><strong>Proveedores de servicios:</strong> Empresas que nos ayudan a operar nuestra plataforma</li>
                <li><strong>Cumplimiento legal:</strong> Cuando la ley lo requiera o para proteger nuestros derechos</li>
                <li><strong>Emergencias:</strong> Para proteger la seguridad de usuarios o el público</li>
                <li><strong>Transferencias empresariales:</strong> En caso de fusión, adquisición o venta de activos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-eco-emerald mb-4">
                5. Seguridad de Datos
              </h2>
              <p className="mb-4">
                Implementamos medidas de seguridad técnicas y organizativas para proteger su información:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Encriptación de datos en tránsito y en reposo</li>
                <li>Acceso restringido a información personal</li>
                <li>Monitoreo regular de sistemas de seguridad</li>
                <li>Capacitación del personal en protección de datos</li>
                <li>Auditorías de seguridad regulares</li>
              </ul>
              <p className="mb-4">
                Sin embargo, ningún método de transmisión por internet es 100% seguro. 
                No podemos garantizar la seguridad absoluta de su información.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-eco-emerald mb-4">
                6. Sus Derechos
              </h2>
              <p className="mb-4">
                Bajo el Reglamento General de Protección de Datos (RGPD), usted tiene los siguientes derechos:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Acceso:</strong> Solicitar una copia de sus datos personales</li>
                <li><strong>Rectificación:</strong> Corregir información inexacta o incompleta</li>
                <li><strong>Eliminación:</strong> Solicitar la eliminación de sus datos personales</li>
                <li><strong>Limitación:</strong> Restringir el procesamiento de sus datos</li>
                <li><strong>Portabilidad:</strong> Recibir sus datos en un formato estructurado</li>
                <li><strong>Oposición:</strong> Oponerse al procesamiento de sus datos</li>
              </ul>
              <p className="mb-4">
                Para ejercer estos derechos, contacte con nosotros en privacy@ecovertical.com
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-eco-emerald mb-4">
                7. Cookies y Tecnologías Similares
              </h2>
              <p className="mb-4">
                Utilizamos cookies y tecnologías similares para:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Recordar sus preferencias y configuraciones</li>
                <li>Analizar el uso de la plataforma</li>
                <li>Proporcionar funcionalidades personalizadas</li>
                <li>Mejorar la experiencia del usuario</li>
              </ul>
              <p className="mb-4">
                Puede controlar las cookies a través de la configuración de su navegador, 
                pero esto puede afectar la funcionalidad de algunos servicios.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-eco-emerald mb-4">
                8. Retención de Datos
              </h2>
              <p className="mb-4">
                Conservamos su información personal durante el tiempo necesario para:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Proporcionar nuestros servicios</li>
                <li>Cumplir con obligaciones legales</li>
                <li>Resolver disputas</li>
                <li>Hacer cumplir nuestros acuerdos</li>
              </ul>
              <p className="mb-4">
                Los datos de jardín se conservan mientras mantenga una cuenta activa. 
                Puede solicitar la eliminación en cualquier momento.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-eco-emerald mb-4">
                9. Transferencias Internacionales
              </h2>
              <p className="mb-4">
                Sus datos pueden ser transferidos y procesados en países fuera del Espacio Económico Europeo. 
                En tales casos, nos aseguramos de que existan garantías adecuadas de protección de datos, 
                como cláusulas contractuales estándar o decisiones de adecuación de la Comisión Europea.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-eco-emerald mb-4">
                10. Menores de Edad
              </h2>
              <p className="mb-4">
                Nuestros servicios no están dirigidos a menores de 16 años. 
                No recopilamos conscientemente información personal de menores de 16 años. 
                Si descubrimos que hemos recopilado información de un menor, 
                la eliminaremos inmediatamente.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-eco-emerald mb-4">
                11. Cambios en esta Política
              </h2>
              <p className="mb-4">
                Podemos actualizar esta Política de Privacidad ocasionalmente. 
                Le notificaremos sobre cambios significativos mediante:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Notificación en la plataforma</li>
                <li>Email a la dirección registrada</li>
                <li>Actualización de la fecha de "última modificación"</li>
              </ul>
            </section>


          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default PrivacyPage;

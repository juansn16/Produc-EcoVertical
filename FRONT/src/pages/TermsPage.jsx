import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

function TermsPage() {
  return (
    <div className="min-h-screen bg-theme-primary">
      <Header />
      <main className="pt-16 sm:pt-13">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Header de la página */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-eco-emerald mb-4">
              Términos y Condiciones
            </h1>
            <p className="text-lg text-gray-300">
              Última actualización: {new Date().toLocaleDateString('es-ES')}
            </p>
          </div>

          {/* Contenido */}
          <div className="prose prose-lg max-w-none text-white">
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-eco-emerald mb-4">
                1. Aceptación de los Términos
              </h2>
              <p className="mb-4">
                Al acceder y utilizar EcoVertical, usted acepta estar sujeto a estos términos y condiciones de uso. 
                Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-eco-emerald mb-4">
                2. Descripción del Servicio
              </h2>
              <p className="mb-4">
                EcoVertical es una plataforma digital que facilita la gestión de jardines urbanos verticales, 
                proporcionando herramientas para el monitoreo, control y optimización de cultivos en espacios urbanos.
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Gestión inteligente de huertos urbanos</li>
                <li>Monitoreo en tiempo real de cultivos</li>
                <li>Recomendaciones personalizadas de cultivo</li>
                <li>Comunidad de agricultores urbanos</li>
                <li>Acceso a información y recursos educativos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-eco-emerald mb-4">
                3. Registro y Cuenta de Usuario
              </h2>
              <p className="mb-4">
                Para utilizar nuestros servicios, debe crear una cuenta proporcionando información precisa y actualizada. 
                Usted es responsable de:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Mantener la confidencialidad de su contraseña</li>
                <li>Actualizar su información personal cuando sea necesario</li>
                <li>Notificar inmediatamente cualquier uso no autorizado de su cuenta</li>
                <li>Ser responsable de todas las actividades que ocurran bajo su cuenta</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-eco-emerald mb-4">
                4. Uso Aceptable
              </h2>
              <p className="mb-4">
                Usted se compromete a utilizar EcoVertical únicamente para fines legales y de acuerdo con estos términos. 
                Está prohibido:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Utilizar el servicio para actividades ilegales o no autorizadas</li>
                <li>Interferir con el funcionamiento normal de la plataforma</li>
                <li>Intentar acceder a cuentas de otros usuarios</li>
                <li>Distribuir malware o contenido malicioso</li>
                <li>Violar derechos de propiedad intelectual</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-eco-emerald mb-4">
                5. Propiedad Intelectual
              </h2>
              <p className="mb-4">
                Todo el contenido de EcoVertical, incluyendo textos, gráficos, logos, imágenes y software, 
                es propiedad de EcoVertical o sus licenciantes y está protegido por leyes de derechos de autor.
              </p>
              <p className="mb-4">
                Usted puede utilizar el contenido únicamente para uso personal y no comercial, 
                siempre que mantenga todos los avisos de derechos de autor y propiedad.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-eco-emerald mb-4">
                6. Privacidad y Protección de Datos
              </h2>
              <p className="mb-4">
                Su privacidad es importante para nosotros. El uso de sus datos personales se rige por nuestra 
                Política de Privacidad, que forma parte integral de estos términos.
              </p>
              <p className="mb-4">
                Recopilamos información sobre sus jardines y cultivos para proporcionar servicios personalizados 
                y mejorar nuestra plataforma.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-eco-emerald mb-4">
                7. Limitación de Responsabilidad
              </h2>
              <p className="mb-4">
                EcoVertical se proporciona "tal como está" sin garantías de ningún tipo. No garantizamos que:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>El servicio esté libre de errores o interrupciones</li>
                <li>Los resultados de cultivo sean los esperados</li>
                <li>La información proporcionada sea completamente precisa</li>
              </ul>
              <p className="mb-4">
                En ningún caso EcoVertical será responsable por daños indirectos, incidentales o consecuenciales 
                derivados del uso de nuestros servicios.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-eco-emerald mb-4">
                8. Modificaciones
              </h2>
              <p className="mb-4">
                Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                Las modificaciones entrarán en vigor inmediatamente después de su publicación en la plataforma.
              </p>
              <p className="mb-4">
                Su uso continuado del servicio después de las modificaciones constituye su aceptación de los nuevos términos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-eco-emerald mb-4">
                9. Terminación
              </h2>
              <p className="mb-4">
                Podemos suspender o terminar su acceso al servicio en cualquier momento, 
                con o sin causa, con o sin previo aviso.
              </p>
              <p className="mb-4">
                Usted puede terminar su cuenta en cualquier momento contactándonos directamente.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-eco-emerald mb-4">
                10. Ley Aplicable
              </h2>
              <p className="mb-4">
                Estos términos se rigen por las leyes de España. Cualquier disputa será resuelta 
                en los tribunales competentes de España.
              </p>
            </section>


          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default TermsPage;

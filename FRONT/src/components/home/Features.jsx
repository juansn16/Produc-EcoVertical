import React from 'react';
import Boton from "@/components/layout/Boton";

const Features = () => {
  const features = [
    {
      icon: '🤖',
      title: 'Automatización Inteligente',
      description: 'Sistema de riego automático, monitoreo de condiciones ambientales y alertas en tiempo real para optimizar el crecimiento de tus cultivos.',
      benefits: ['Riego programado', 'Sensores IoT', 'Notificaciones automáticas']
    },
    {
      icon: '📊',
      title: 'Analytics Avanzado',
      description: 'Dashboards completos con métricas de producción, costos, eficiencia y proyecciones para tomar decisiones basadas en datos.',
      benefits: ['Reportes detallados', 'Análisis predictivo', 'KPIs personalizados']
    },
    {
      icon: '👥',
      title: 'Gestión Colaborativa',
      description: 'Plataforma multi-usuario con roles específicos para administradores, residentes y técnicos, facilitando la colaboración.',
      benefits: ['Roles diferenciados', 'Comunicación integrada', 'Asignación de tareas']
    },
    {
      icon: '💰',
      title: 'Control de Costos',
      description: 'Seguimiento completo de gastos, inventario de plantas, gestión de proveedores y análisis de rentabilidad.',
      benefits: ['Tracking de gastos', 'Gestión de inventario', 'ROI transparente']
    },
    {
      icon: '🌱',
      title: 'Optimización de Cultivos',
      description: 'Biblioteca de cultivos con guías específicas, calendario de siembra y cosecha, y recomendaciones personalizadas.',
      benefits: ['Base de datos de plantas', 'Calendarios inteligentes', 'Tips especializados']
    },
    {
      icon: '📱',
      title: 'Acceso Móvil',
      description: 'Aplicación responsive que funciona en cualquier dispositivo, con notificaciones push y acceso offline limitado.',
      benefits: ['Diseño responsive', 'Notificaciones push', 'Sincronización automática']
    }
  ];

  return (
    <section id="caracteristicas" className="bg-bg-theme-secondary py-20 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-eco-pear to-transparent"></div>
      
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-20 huertotech-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold leading-tight text-theme-primary mb-6">
            Características que{' '}
            <span className="huertotech-text-gradient">Transforman</span>{' '}
            tu Huerto
          </h2>
          <p className="text-xl leading-relaxed text-theme-secondary max-w-2xl mx-auto">
            Tecnología de vanguardia diseñada para maximizar la eficiencia 
            y productividad de tus huertos verticales
          </p>
        </div>

        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-bg-theme-secondary border-2 border-border-theme-secondary rounded-xl p-8 transition-all duration-300 relative overflow-hidden group hover:-translate-y-2 hover:shadow-strong hover:border-eco-pear huertotech-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-eco-mountain-meadow-dark via-eco-mountain-meadow to-eco-pear transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></div>
              
              <div className="text-5xl mb-6 flex items-center justify-center w-20 h-20 bg-gradient-to-br from-eco-pear/10 to-eco-mountain-meadow/10 rounded-2xl border border-eco-pear/30">
                {feature.icon}
              </div>
              
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-theme-primary mb-4">{feature.title}</h3>
                <p className="text-base leading-relaxed text-theme-secondary mb-6">{feature.description}</p>
                <ul className="list-none flex flex-col gap-3">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center gap-3 text-sm text-theme-primary">
                      <span className="flex items-center justify-center w-5 h-5 bg-eco-pear text-eco-cape-cod rounded-full text-xs font-bold flex-shrink-0">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-bg-theme-primary to-bg-theme-tertiary rounded-3xl p-12 lg:p-16 border-2 border-border-theme-secondary text-center huertotech-fade-in">
          <h3 className="text-3xl font-semibold text-theme-primary mb-4">¿Listo para optimizar tu huerto?</h3>
          <p className="text-lg text-theme-secondary mb-8 max-w-lg mx-auto">
            Únete a cientos de administradores que ya están revolucionando 
            sus cultivos con nuestra plataforma
          </p>
          <Boton 
            texto="Solicitar Demo Gratuita"
            variant="primary"
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
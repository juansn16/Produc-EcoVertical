import React from 'react';
import Boton from "@/components/layout/Boton";

const UserTypes = () => {
  const userTypes = [
    {
      type: 'Administrador',
      icon: '👨‍💼',
      color: 'admin',
      description: 'Gestión completa del huerto vertical, supervisión de residentes y técnicos, análisis de datos y toma de decisiones estratégicas.',
      features: [
        'Dashboard completo con métricas de rendimiento',
        'Gestión de usuarios y asignación de roles',
        'Análisis de costos y rentabilidad',
        'Configuración de alertas y notificaciones',
        'Reportes ejecutivos y proyecciones',
        'Integración con sistemas externos'
      ],
      benefits: [
        'Control total del huerto',
        'Optimización de recursos',
        'Toma de decisiones basada en datos',
        'Escalabilidad del sistema'
      ]
    },
    {
      type: 'Residente',
      icon: '👨‍👩‍👧‍👦',
      color: 'resident',
      description: 'Acceso a información personalizada sobre su espacio de cultivo, seguimiento de plantas y participación en la comunidad.',
      features: [
        'Vista personalizada de su espacio de cultivo',
        'Seguimiento del crecimiento de plantas',
        'Calendario de riego y mantenimiento',
        'Comunicación con técnicos y administradores',
        'Acceso a guías de cultivo',
        'Participación en actividades comunitarias'
      ],
      benefits: [
        'Cultivo exitoso y sostenible',
        'Aprendizaje continuo',
        'Participación comunitaria',
        'Alimentación saludable'
      ]
    },
    {
      type: 'Técnico',
      icon: '🔧',
      color: 'technician',
      description: 'Mantenimiento técnico, monitoreo de equipos, resolución de problemas y optimización de sistemas.',
      features: [
        'Panel de control técnico especializado',
        'Monitoreo de sensores y equipos IoT',
        'Control del inventario de herramientas y recursos',
        'Sistema de alertas para riego y mantenimiento',
        'Registro de actividades técnicas realizadas',
        'Programación de tareas de mantenimiento',
        'Reportes técnicos detallados'
      ],
      benefits: [
        'Mantenimiento preventivo eficiente',
        'Reducción de fallas y problemas',
        'Optimización del tiempo de trabajo',
        'Trazabilidad de actividades'
      ]
    }
  ];

  const getCardBorderColor = (color) => {
    switch(color) {
      case 'admin': return 'before:bg-gradient-to-r before:from-eco-mountain-meadow-dark before:to-eco-mountain-meadow';
      case 'resident': return 'before:bg-gradient-to-r before:from-eco-mountain-meadow before:to-eco-pear';
      case 'technician': return 'before:bg-gradient-to-r before:from-eco-pear before:to-yellow-400';
      default: return 'before:bg-gradient-to-r before:from-eco-mountain-meadow-dark before:to-eco-mountain-meadow';
    }
  };

  return (
    <section id="usuarios" className="bg-gradient-to-br from-bg-theme-primary to-bg-theme-tertiary py-20 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-20 huertotech-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold leading-tight text-theme-primary mb-6">
            Diseñado para{' '}
            <span className="huertotech-text-gradient">Cada Usuario</span>
          </h2>
          <p className="text-xl leading-relaxed text-theme-secondary max-w-2xl mx-auto">
            Funcionalidades específicamente adaptadas para cada rol dentro 
            del ecosistema de huertos verticales
          </p>
        </div>

        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-10">
          {userTypes.map((user, index) => (
            <div 
              key={index}
              className={`bg-bg-theme-secondary border-2 border-border-theme-secondary rounded-3xl overflow-hidden shadow-medium transition-all duration-300 relative hover:-translate-y-3 hover:shadow-strong huertotech-fade-in before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1.5 before:transition-all before:duration-300 ${getCardBorderColor(user.color)}`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="flex items-start gap-5 p-8 pb-6 bg-gradient-to-br from-bg-theme-tertiary to-bg-theme-secondary">
                <div className="text-5xl w-20 h-20 flex items-center justify-center bg-bg-theme-secondary rounded-2xl shadow-soft flex-shrink-0">
                  {user.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-theme-primary mb-3">{user.type}</h3>
                  <p className="text-base leading-relaxed text-theme-secondary">{user.description}</p>
                </div>
              </div>

              <div className="p-8 pt-0 flex flex-col gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-theme-primary mb-4 flex items-center gap-2 before:content-[''] before:w-1 before:h-5 before:bg-gradient-to-b before:from-eco-mountain-meadow before:to-eco-pear before:rounded-sm">
                    Funcionalidades Principales
                  </h4>
                  <ul className="list-none flex flex-col gap-3">
                    {user.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3 text-sm leading-relaxed text-theme-primary">
                        <span className="flex items-center justify-center w-4.5 h-4.5 bg-eco-pear text-eco-cape-cod rounded-full text-xs font-bold flex-shrink-0 mt-0.5">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-theme-primary mb-4 flex items-center gap-2 before:content-[''] before:w-1 before:h-5 before:bg-gradient-to-b before:from-eco-mountain-meadow before:to-eco-pear before:rounded-sm">
                    Beneficios Clave
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {user.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center gap-2 text-sm text-theme-primary p-3 bg-bg-theme-tertiary rounded-lg transition-colors duration-300 hover:bg-bg-theme-tertiary border border-border-theme-primary">
                        <span className="text-base flex-shrink-0">🎯</span>
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UserTypes;
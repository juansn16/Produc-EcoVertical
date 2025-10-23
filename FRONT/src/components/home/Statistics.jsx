import React, { useState, useEffect } from 'react';

const Statistics = () => {
  const [counters, setCounters] = useState({
    gardens: 0,
    users: 0,
    production: 0,
    savings: 0
  });

  const finalStats = {
    gardens: 150,
    users: 1200,
    production: 85,
    savings: 67
  };

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setCounters({
        gardens: Math.floor(finalStats.gardens * progress),
        users: Math.floor(finalStats.users * progress),
        production: Math.floor(finalStats.production * progress),
        savings: Math.floor(finalStats.savings * progress)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setCounters(finalStats);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, []);

  const testimonials = [
    {
      name: 'María González',
      role: 'Administradora de Conjunto',
      location: 'Bogotá, Colombia',
      avatar: '👩‍💼',
      quote: 'HuertoTech revolucionó completamente la gestión de nuestros huertos verticales. La productividad aumentó un 300% y los costos se redujeron significativamente.',
      rating: 5
    },
    {
      name: 'Carlos Ruiz',
      role: 'Residente',
      location: 'Medellín, Colombia',
      avatar: '👨‍🌾',
      quote: 'Como residente, me encanta poder ver en tiempo real cómo crecen nuestros cultivos y participar activamente en la comunidad del huerto.',
      rating: 5
    },
    {
      name: 'Ana Martínez',
      role: 'Técnica Especialista',
      location: 'Cali, Colombia',
      avatar: '👩‍🔧',
      quote: 'Las herramientas técnicas son increíbles. El sistema de alertas me permite mantener todo funcionando perfectamente sin estar físicamente presente.',
      rating: 5
    }
  ];

  return (
    <section id="estadisticas" className="bg-bg-theme-secondary py-20 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-eco-pear to-transparent"></div>
      
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-20 animate-fade-in-up">
          <h2 className="text-4xl lg:text-5xl font-bold leading-tight text-theme-primary mb-6">
            Resultados que{' '}
            <span className="eco-text-gradient">Hablan por Sí Solos</span>
          </h2>
          <p className="text-xl leading-relaxed text-theme-secondary max-w-3xl mx-auto">
            Nuestra plataforma ya está transformando huertos en toda Colombia, 
            generando resultados excepcionales para nuestros usuarios
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20 animate-fade-in-up">
          <div className="bg-gradient-to-br from-bg-theme-primary to-bg-theme-tertiary border-2 border-border-theme-secondary rounded-xl p-10 text-center transition-all duration-300 relative overflow-hidden hover:-translate-y-2 hover:shadow-strong hover:border-eco-emerald before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-eco-mountain-meadow before:via-eco-emerald before:to-eco-pear">
            <div className="text-5xl mb-5 block">🏢</div>
            <div className="text-5xl font-bold text-eco-mountain-meadow leading-none mb-3">{counters.gardens}+</div>
            <div className="text-lg font-semibold text-theme-primary mb-2">Huertos Activos</div>
            <div className="text-sm text-theme-secondary leading-snug">Conjuntos residenciales usando la plataforma</div>
          </div>
          
          <div className="bg-gradient-to-br from-bg-theme-primary to-bg-theme-tertiary border-2 border-border-theme-secondary rounded-xl p-10 text-center transition-all duration-300 relative overflow-hidden hover:-translate-y-2 hover:shadow-strong hover:border-eco-emerald before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-eco-mountain-meadow before:via-eco-emerald before:to-eco-pear">
            <div className="text-5xl mb-5 block">👥</div>
            <div className="text-5xl font-bold text-eco-mountain-meadow leading-none mb-3">{counters.users}+</div>
            <div className="text-lg font-semibold text-theme-primary mb-2">Usuarios Registrados</div>
            <div className="text-sm text-theme-secondary leading-snug">Entre administradores, residentes y técnicos</div>
          </div>
          
          <div className="bg-gradient-to-br from-bg-theme-primary to-bg-theme-tertiary border-2 border-border-theme-secondary rounded-xl p-10 text-center transition-all duration-300 relative overflow-hidden hover:-translate-y-2 hover:shadow-strong hover:border-eco-emerald before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-eco-mountain-meadow before:via-eco-emerald before:to-eco-pear">
            <div className="text-5xl mb-5 block">📈</div>
            <div className="text-5xl font-bold text-eco-mountain-meadow leading-none mb-3">{counters.production}%</div>
            <div className="text-lg font-semibold text-theme-primary mb-2">Aumento en Productividad</div>
            <div className="text-sm text-theme-secondary leading-snug">Comparado con métodos tradicionales</div>
          </div>
          
          <div className="bg-gradient-to-br from-bg-theme-primary to-bg-theme-tertiary border-2 border-border-theme-secondary rounded-xl p-10 text-center transition-all duration-300 relative overflow-hidden hover:-translate-y-2 hover:shadow-strong hover:border-eco-emerald before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-eco-mountain-meadow before:via-eco-emerald before:to-eco-pear">
            <div className="text-5xl mb-5 block">💰</div>
            <div className="text-5xl font-bold text-eco-mountain-meadow leading-none mb-3">{counters.savings}%</div>
            <div className="text-lg font-semibold text-theme-primary mb-2">Reducción de Costos</div>
            <div className="text-sm text-theme-secondary leading-snug">En mantenimiento y operación</div>
          </div>
        </div>

        <div className="mb-20">
          <h3 className="text-3xl lg:text-4xl font-semibold text-center text-theme-primary mb-15 huertotech-fade-in">
            Lo que Dicen Nuestros Usuarios
          </h3>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-bg-theme-secondary border-2 border-border-theme-secondary rounded-xl p-8 shadow-soft transition-all duration-300 relative hover:-translate-y-1 hover:shadow-medium hover:border-eco-pear huertotech-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="mb-6 relative">
                  <div className="text-6xl text-eco-pear/30 absolute -top-5 -left-2.5 font-serif">"</div>
                  <p className="text-base leading-relaxed text-theme-primary mb-4 relative z-10 italic">{testimonial.quote}</p>
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-base">⭐</span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 pt-6 border-t border-border-theme-primary">
                  <div className="text-4xl w-15 h-15 flex items-center justify-center bg-gradient-to-br from-bg-theme-tertiary to-bg-theme-secondary rounded-full flex-shrink-0">{testimonial.avatar}</div>
                  <div className="flex-1">
                    <div className="text-base font-semibold text-theme-primary mb-1">{testimonial.name}</div>
                    <div className="text-sm text-eco-mountain-meadow font-medium mb-0.5">{testimonial.role}</div>
                    <div className="text-xs text-theme-tertiary">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-bg-theme-primary to-bg-theme-tertiary rounded-3xl p-12 lg:p-16 border-2 border-border-theme-secondary huertotech-fade-in">
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="flex items-start gap-5">
              <div className="text-4xl w-18 h-18 flex items-center justify-center bg-bg-theme-secondary rounded-2xl shadow-soft flex-shrink-0">🌱</div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-theme-primary mb-3">Impacto Ambiental</h4>
                <p className="text-base leading-relaxed text-theme-secondary">
                  Reducción del 40% en el consumo de agua y 60% menos emisiones de CO₂ 
                  comparado con agricultura tradicional
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-5">
              <div className="text-4xl w-18 h-18 flex items-center justify-center bg-bg-theme-secondary rounded-2xl shadow-soft flex-shrink-0">🏘️</div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-theme-primary mb-3">Comunidad</h4>
                <p className="text-base leading-relaxed text-theme-secondary">
                  Fortalecimiento de lazos comunitarios y educación en sostenibilidad 
                  para más de 500 familias
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-5">
              <div className="text-4xl w-18 h-18 flex items-center justify-center bg-bg-theme-secondary rounded-2xl shadow-soft flex-shrink-0">💡</div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-theme-primary mb-3">Innovación</h4>
                <p className="text-base leading-relaxed text-theme-secondary">
                  Tecnología IoT y análisis de datos aplicados a la agricultura urbana 
                  con resultados medibles
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Statistics;
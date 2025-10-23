import React from 'react';
import Boton from "@/components/layout/Boton";

const CallToAction = () => {
  return (
    <section className="bg-gradient-to-br from-eco-mountain-meadow to-eco-emerald py-16 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="relative z-10 animate-fade-in-up">
          <div className="absolute inset-0 z-0">
            <div 
              className="absolute inset-0 animate-pattern-float"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 40% 40%, rgba(174, 230, 55, 0.2) 0%, transparent 50%)
                `,
                backgroundSize: '600px 600px, 800px 800px, 400px 400px'
              }}
            ></div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-20 items-center mb-15 relative z-10">
            <div className="text-white">
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6 text-white">
                ¿Listo para{' '}
                <span className="bg-gradient-to-br from-eco-pear to-eco-scotch-mist bg-clip-text text-transparent">Transformar</span>{' '}
                tu Huerto?
              </h2>
              <p className="text-xl leading-relaxed mb-8 opacity-90">
                Únete a cientos de administradores, residentes y técnicos que ya están 
                revolucionando la agricultura urbana con HuertoTech. Comienza tu viaje 
                hacia una gestión más inteligente y sostenible.
              </p>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 text-base opacity-90">
                  <span className="text-xl w-8 h-8 flex items-center justify-center bg-white/20 rounded-lg flex-shrink-0">🚀</span>
                  <span>Configuración en menos de 5 minutos</span>
                </div>
                <div className="flex items-center gap-3 text-base opacity-90">
                  <span className="text-xl w-8 h-8 flex items-center justify-center bg-white/20 rounded-lg flex-shrink-0">📞</span>
                  <span>Soporte técnico especializado 24/7</span>
                </div>
                <div className="flex items-center gap-3 text-base opacity-90">
                  <span className="text-xl w-8 h-8 flex items-center justify-center bg-white/20 rounded-lg flex-shrink-0">🎯</span>
                  <span>Resultados visibles desde el primer mes</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-8 items-center">
              <div className="flex flex-col gap-4 w-full max-w-sm">
                <Boton 
                  texto="Comenzar Gratis"
                  variant="accent"
                />
                <Boton 
                  texto="Solicitar Demo"
                  variant="secondary"
                />
              </div>
              
              <div className="w-full max-w-sm">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-white">
                  <span className="text-2xl flex-shrink-0">✅</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold mb-0.5">Garantía de 30 días</div>
                    <div className="text-xs opacity-80">100% satisfacción o tu dinero devuelto</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center gap-15 py-10 border-t border-white/20 relative z-10">
            <div className="text-center text-white">
              <div className="text-4xl font-bold leading-none mb-2 bg-gradient-to-br from-eco-pear to-eco-scotch-mist bg-clip-text text-transparent">150+</div>
              <div className="text-sm opacity-80 font-medium">Huertos Activos</div>
            </div>
            <div className="text-center text-white">
              <div className="text-4xl font-bold leading-none mb-2 bg-gradient-to-br from-eco-pear to-eco-scotch-mist bg-clip-text text-transparent">98%</div>
              <div className="text-sm opacity-80 font-medium">Satisfacción</div>
            </div>
            <div className="text-center text-white">
              <div className="text-4xl font-bold leading-none mb-2 bg-gradient-to-br from-eco-pear to-eco-scotch-mist bg-clip-text text-transparent">24/7</div>
              <div className="text-sm opacity-80 font-medium">Soporte</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
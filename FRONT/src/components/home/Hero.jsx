import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Boton from "@/components/layout/Boton";
import { Home } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-bg-theme-primary via-bg-theme-secondary to-bg-theme-tertiary">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-eco-mountain-meadow/10 via-transparent to-eco-emerald/10 opacity-50"></div>
        <div 
          className="absolute inset-0 animate-float"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(21, 158, 105, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(55, 200, 86, 0.1) 0%, transparent 50%)
            `,
            backgroundSize: '400px 400px'
          }}
        ></div>
      </div>
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="flex flex-col gap-8">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight text-theme-primary m-0 huertotech-fade-in">
              Revoluciona la{' '}
              <span className="eco-text-gradient">Administración</span>{' '}
              de tus{' '}
              <span className="eco-text-gradient">Huertos Verticales</span>
            </h1>
            
            <p className="text-xl leading-relaxed text-theme-secondary m-0 huertotech-fade-in">
              Plataforma inteligente diseñada para optimizar la gestión de huertos verticales 
              en propiedades horizontales. Maximiza tu producción, reduce costos y crea 
              comunidades sostenibles con tecnología de vanguardia.
            </p>
            
            <div className="flex gap-12 my-4 huertotech-fade-in">
              <div className="text-center">
                <div className="text-3xl font-bold text-eco-mountain-meadow leading-none">85%</div>
                <div className="text-sm text-theme-tertiary mt-1">Menos desperdicio</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-eco-mountain-meadow leading-none">3x</div>
                <div className="text-sm text-theme-tertiary mt-1">Mayor productividad</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-eco-mountain-meadow leading-none">24/7</div>
                <div className="text-sm text-theme-tertiary mt-1">Monitoreo inteligente</div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 huertotech-fade-in">
              {isAuthenticated ? (
                // Botones para usuarios autenticados
                <>
                  <button
                    onClick={() => navigate('/select-garden')}
                    className="flex items-center gap-2 px-6 py-3 bg-eco-mountain-meadow text-white rounded-lg hover:bg-eco-mountain-meadow-dark transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                  >
                    <Home className="w-5 h-5" />
                    Escoger Huerto
                  </button>
                  <button
                    onClick={() => navigate('/user')}
                    className="px-6 py-3 bg-bg-theme-secondary text-eco-mountain-meadow-dark border-2 border-eco-mountain-meadow rounded-lg hover:bg-eco-pear hover:text-eco-cape-cod transition-all duration-200 font-medium"
                  >
                    Mi Perfil
                  </button>
                </>
              ) : (
                // Botones para usuarios no autenticados
                <>
                  <Boton 
                    texto="Comenzar Ahora"
                    variant="primary"
                  />
                  <Boton 
                    texto="Conocer Más"
                    variant="secondary"
                    onClick={() => scrollToSection('caracteristicas')}
                  />
                </>
              )}
            </div>
          </div>
          
          <div className="flex justify-center items-center huertotech-slide-right">
            <div className="bg-bg-theme-secondary rounded-3xl shadow-strong overflow-hidden w-full max-w-md transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] border-2 border-border-theme-secondary">
              <div className="bg-gradient-to-br from-eco-mountain-meadow to-eco-emerald text-white p-5 flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="w-2 h-2 rounded-full bg-white/50"></span>
                  <span className="w-2 h-2 rounded-full bg-white/50"></span>
                  <span className="w-2 h-2 rounded-full bg-white/50"></span>
                </div>
                <div className="text-lg font-semibold">Panel de Control</div>
              </div>
              <div className="p-6 flex flex-col gap-5">
                <div className="flex items-center gap-4 p-4 bg-bg-theme-tertiary rounded-xl transition-all duration-300 hover:bg-bg-theme-tertiary hover:translate-x-1 border border-border-theme-primary">
                  <div className="text-2xl w-10 h-10 flex items-center justify-center bg-bg-theme-secondary rounded-lg shadow-soft">🌿</div>
                  <div className="flex-1">
                    <div className="text-sm text-theme-tertiary mb-1">Producción Actual</div>
                    <div className="text-xl font-bold text-eco-mountain-meadow">127 kg/mes</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-bg-theme-tertiary rounded-xl transition-all duration-300 hover:bg-bg-theme-tertiary hover:translate-x-1 border border-border-theme-primary">
                  <div className="text-2xl w-10 h-10 flex items-center justify-center bg-bg-theme-secondary rounded-lg shadow-soft">💧</div>
                  <div className="flex-1">
                    <div className="text-sm text-theme-tertiary mb-1">Ahorro de Agua</div>
                    <div className="text-xl font-bold text-eco-mountain-meadow">68%</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-bg-theme-tertiary rounded-xl transition-all duration-300 hover:bg-bg-theme-tertiary hover:translate-x-1 border border-border-theme-primary">
                  <div className="text-2xl w-10 h-10 flex items-center justify-center bg-bg-theme-secondary rounded-lg shadow-soft">📊</div>
                  <div className="flex-1">
                    <div className="text-sm text-theme-tertiary mb-1">Eficiencia</div>
                    <div className="text-xl font-bold text-eco-mountain-meadow">94%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
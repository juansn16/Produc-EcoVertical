import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const Footer = () => {
  const { isDarkMode } = useTheme();
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: 'Términos de Servicio', href: '/terms' },
    { name: 'Política de Privacidad', href: '/privacy' }
  ];

  const socialLinks = [
    { name: 'Facebook', icon: '📘', href: '#' },
    { name: 'Twitter', icon: '🐦', href: '#' },
    { name: 'LinkedIn', icon: '💼', href: '#' },
    { name: 'Instagram', icon: '📷', href: '#' },
    { name: 'YouTube', icon: '📺', href: '#' }
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={`${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-eco-cape-cod to-eco-cape-cod-dark'} text-white relative overflow-hidden`}>
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 animate-pattern-move"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(174, 230, 55, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(56, 201, 88, 0.05) 0%, transparent 50%)
            `,
            backgroundSize: '800px 800px'
          }}
        ></div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="pt-8 sm:pt-10 pb-0">
          {/* Sección principal compacta */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-6">
            {/* Logo y descripción */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="text-2xl drop-shadow-md">🌱</div>
                <span className="text-xl font-bold bg-gradient-to-br from-eco-pear to-eco-emerald bg-clip-text text-transparent">EcoVertical</span>
              </div>
              <p className="hidden sm:block text-sm opacity-80 max-w-sm">
                Revolucionando la administración de huertos verticales con tecnología inteligente.
              </p>
            </div>

            {/* Enlaces legales y redes sociales */}
            <div className="flex items-center gap-6">
              {/* Enlaces legales */}
              <div className="flex gap-4">
                {footerLinks.map((link, index) => (
                  <Link 
                    key={index}
                    to={link.href} 
                    className="text-white/70 no-underline text-sm transition-all duration-300 hover:text-eco-pear hover:translate-x-1"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              {/* Redes sociales */}
              <div className="flex gap-2">
                {socialLinks.map((social, index) => (
                  <a 
                    key={index}
                    href={social.href}
                    className="flex items-center justify-center w-8 h-8 bg-white/10 border border-white/10 rounded-lg transition-all duration-300 no-underline hover:bg-eco-pear/20 hover:border-eco-pear hover:-translate-y-0.5"
                    aria-label={social.name}
                  >
                    <span className="text-sm">{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Footer inferior compacto */}
          <div className="border-t border-white/10 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
                <p className="text-xs opacity-70 m-0">&copy; {currentYear} EcoVertical. Todos los derechos reservados.</p>
                <span className="hidden sm:inline text-xs opacity-70">•</span>
                <p className="text-xs opacity-70 m-0">Hecho con 💚 en Venezuela</p>
              </div>
              
              <button 
                className="flex items-center gap-1 bg-white/10 border border-white/20 text-white px-3 py-2 rounded-lg cursor-pointer transition-all duration-300 text-xs hover:bg-eco-pear/20 hover:border-eco-pear hover:-translate-y-0.5"
                onClick={scrollToTop}
                aria-label="Volver arriba"
              >
                <span className="text-sm font-bold">↑</span>
                <span className="hidden sm:inline">Volver arriba</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
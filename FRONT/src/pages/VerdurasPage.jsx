import React from 'react';
import { useNavigate } from 'react-router-dom';
import verdurasData from '../data/manualPlanta/Verduras.json';
import { Card, CardHeader, CardTitle, CardContent } from '../components/home/Card';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { ArrowLeft } from "lucide-react";

function InfoBlock({ label, value }) {
  if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) return null;
  return (
    <div className="mb-2">
      <span className="font-bold text-eco-mountain-meadow-dark">{label}: </span>
      {Array.isArray(value) ? (
        <ul className="list-disc ml-5">
          {value.map((v, i) => <li key={i} className="text-eco-cape-cod/80">{v}</li>)}
        </ul>
      ) : typeof value === 'object' ? (
        <ul className="list-disc ml-5">
          {Object.entries(value).map(([k, v], i) => (
            <li key={i} className="text-eco-cape-cod/80"><span className="font-bold text-eco-cape-cod">{k}:</span> {Array.isArray(v) ? v.join(', ') : typeof v === 'object' ? JSON.stringify(v) : v}</li>
          ))}
        </ul>
      ) : (
        <span className="text-eco-cape-cod/80">{value}</span>
      )}
    </div>
  );
}

function getCultivoImage(id) {
  if (id === 'lechuga') return '/publico_garden.jpg';
  if (id === 'espinaca') return '/privado_garden.jpg';
  if (id === 'zanahoria') return '/vite.svg';
  if (id === 'tomate') return '/a.png';
  if (id === 'pepino') return '/react.svg';
  if (id === 'pimiento') return '/vite.svg';
  if (id === 'acelga') return '/a.png';
  return '/publico_garden.jpg';
}


function VerdurasPage() {
  const navigate = useNavigate();
  const guia = verdurasData.guia;
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-eco-scotch-mist via-white to-eco-pear/10">
        {/* Hero Section con nueva paleta */}
        <div className="relative overflow-hidden bg-gradient-to-r from-eco-mountain-meadow via-eco-emerald to-eco-pear text-white">
          {/* Patrón decorativo de fondo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute top-40 right-20 w-24 h-24 bg-white rounded-full"></div>
            <div className="absolute bottom-20 left-20 w-16 h-16 bg-white rounded-full"></div>
            <div className="absolute bottom-40 right-10 w-20 h-20 bg-white rounded-full"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-6 py-20 sm:py-28">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full mb-8 backdrop-blur-sm border border-white/30 shadow-lg">
                <span className="text-5xl">🥬</span>
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 eco-text-gradient">
                {guia.titulo}
              </h1>
              <p className="text-2xl sm:text-3xl text-white/90 mb-10 max-w-3xl mx-auto font-medium">
                {guia.categoria}
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-lg">
                <span className="bg-white/20 px-6 py-3 rounded-2xl backdrop-blur-sm border border-white/30 font-bold hover:bg-white/30 transition-all duration-300 hover:scale-105">🥬 Verduras</span>
                <span className="bg-white/20 px-6 py-3 rounded-2xl backdrop-blur-sm border border-white/30 font-bold hover:bg-white/30 transition-all duration-300 hover:scale-105">🌱 Frescas</span>
                <span className="bg-white/20 px-6 py-3 rounded-2xl backdrop-blur-sm border border-white/30 font-bold hover:bg-white/30 transition-all duration-300 hover:scale-105">💚 Saludables</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* Back to Garden Button */}
          <div className="mb-12">
            <button
              onClick={() => navigate('/select-garden')}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald text-white px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/30 font-bold hover:scale-105"
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="text-lg">Escoger Huerto</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
            {guia.cultivos.map((cultivo, idx) => (
              <div key={cultivo.id} className="group relative bg-gradient-to-br from-white to-eco-scotch-mist/30 rounded-3xl shadow-strong hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3 overflow-hidden border border-eco-pear/20 backdrop-blur-sm">
                {/* Card Header with Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={getCultivoImage(cultivo.id)}
                    alt={cultivo.nombre_comun}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-3xl font-bold text-white mb-2">{cultivo.nombre_comun}</h3>
                    <p className="text-white/80 text-base italic">{cultivo.nombre_cientifico}</p>
                  </div>
                  <div className="absolute top-6 right-6">
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 border border-white/30">
                      <span className="text-3xl">🥬</span>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-8">
                  <div className="mb-6">
                    <span className="inline-block bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald text-white text-sm font-bold px-4 py-2 rounded-2xl shadow-lg">
                      {cultivo.titulo}
                    </span>
                  </div>

                  {/* Info Sections */}
                  <div className="space-y-6">
                    <div className="border-l-4 border-eco-mountain-meadow pl-6 bg-gradient-to-r from-eco-mountain-meadow/5 to-transparent rounded-r-2xl p-4">
                      <h4 className="font-bold text-eco-cape-cod mb-3 flex items-center text-lg">
                        <span className="text-eco-mountain-meadow mr-3 text-xl">🌱</span>
                        Sistema de Cultivo
                      </h4>
                      <div className="text-sm">
                        <InfoBlock label="" value={cultivo.sistema_cultivo} />
                      </div>
                    </div>

                    <div className="border-l-4 border-eco-emerald pl-6 bg-gradient-to-r from-eco-emerald/5 to-transparent rounded-r-2xl p-4">
                      <h4 className="font-bold text-eco-cape-cod mb-3 flex items-center text-lg">
                        <span className="text-eco-emerald mr-3 text-xl">⚙️</span>
                        Manejo
                      </h4>
                      <div className="text-sm">
                        <InfoBlock label="" value={cultivo.manejo} />
                      </div>
                    </div>

                    <div className="border-l-4 border-eco-pear pl-6 bg-gradient-to-r from-eco-pear/5 to-transparent rounded-r-2xl p-4">
                      <h4 className="font-bold text-eco-cape-cod mb-3 flex items-center text-lg">
                        <span className="text-eco-pear-dark mr-3 text-xl">🌡️</span>
                        Condiciones Climáticas
                      </h4>
                      <div className="text-sm">
                        <InfoBlock label="" value={cultivo.condiciones_climaticas} />
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-8 pt-6 border-t-2 border-eco-pear/20">
                    <button className="w-full bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald text-white py-4 px-6 rounded-2xl font-bold hover:from-eco-mountain-meadow-dark hover:to-eco-emerald-dark transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                      Ver Detalles Completos
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Technologies Section con nueva paleta */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-eco-cape-cod mb-6 eco-text-gradient">Tecnologías Verdes</h2>
              <p className="text-eco-cape-cod/70 text-xl max-w-3xl mx-auto font-medium">
                Sistemas innovadores para el cultivo sostenible de verduras frescas y saludables
              </p>
            </div>

            {guia.tecnologias && (guia.tecnologias.monitoreo || guia.tecnologias.sistemas || guia.tecnologias.control_ambiental) ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {guia.tecnologias.monitoreo && (
                  <div className="bg-gradient-to-br from-eco-mountain-meadow/10 to-eco-emerald/10 rounded-3xl p-8 border-2 border-eco-mountain-meadow/20 hover:shadow-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                    <div className="flex items-center mb-6">
                      <div className="bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald rounded-2xl p-4 mr-6 shadow-lg">
                        <span className="text-white text-2xl">📊</span>
                      </div>
                      <h3 className="text-2xl font-bold text-eco-cape-cod">Monitoreo</h3>
                    </div>
                    <ul className="space-y-3">
                      {guia.tecnologias.monitoreo.map((item, idx) => (
                        <li key={idx} className="flex items-start text-eco-cape-cod/80 font-medium">
                          <span className="text-eco-mountain-meadow mr-3 mt-1 text-lg">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {guia.tecnologias.sistemas && (
                  <div className="bg-gradient-to-br from-eco-emerald/10 to-eco-pear/10 rounded-3xl p-8 border-2 border-eco-emerald/20 hover:shadow-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                    <div className="flex items-center mb-6">
                      <div className="bg-gradient-to-r from-eco-emerald to-eco-pear rounded-2xl p-4 mr-6 shadow-lg">
                        <span className="text-white text-2xl">⚙️</span>
                      </div>
                      <h3 className="text-2xl font-bold text-eco-cape-cod">Sistemas</h3>
                    </div>
                    <ul className="space-y-3">
                      {guia.tecnologias.sistemas.map((item, idx) => (
                        <li key={idx} className="flex items-start text-eco-cape-cod/80 font-medium">
                          <span className="text-eco-emerald mr-3 mt-1 text-lg">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {guia.tecnologias.control_ambiental && (
                  <div className="bg-gradient-to-br from-eco-pear/10 to-orange-100 rounded-3xl p-8 border-2 border-eco-pear/20 hover:shadow-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                    <div className="flex items-center mb-6">
                      <div className="bg-gradient-to-r from-eco-pear to-orange-400 rounded-2xl p-4 mr-6 shadow-lg">
                        <span className="text-white text-2xl">🌡️</span>
                      </div>
                      <h3 className="text-2xl font-bold text-eco-cape-cod">Control Ambiental</h3>
                    </div>
                    <ul className="space-y-3">
                      {guia.tecnologias.control_ambiental.map((item, idx) => (
                        <li key={idx} className="flex items-start text-eco-cape-cod/80 font-medium">
                          <span className="text-eco-pear-dark mr-3 mt-1 text-lg">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="bg-gradient-to-br from-white to-eco-scotch-mist/30 rounded-3xl p-12 max-w-lg mx-auto border border-eco-pear/20 shadow-strong backdrop-blur-sm">
                  <span className="text-8xl mb-6 block">🌱</span>
                  <h3 className="text-2xl font-bold text-eco-cape-cod mb-4">Tecnologías en Desarrollo</h3>
                  <p className="text-eco-cape-cod/70 text-lg">Próximamente tendremos información detallada sobre las tecnologías disponibles.</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Info con nueva paleta */}
          <div className="mt-20 text-center">
            <div className="bg-gradient-to-br from-white to-eco-scotch-mist/30 rounded-3xl p-8 shadow-strong border border-eco-pear/20 max-w-2xl mx-auto backdrop-blur-sm">
              <p className="text-eco-cape-cod/70 text-lg mb-3">
                Última actualización: <span className="font-bold text-eco-cape-cod">{guia.actualizacion}</span>
              </p>
              <p className="text-eco-cape-cod/70 text-lg">
                Versión: <span className="font-bold text-eco-cape-cod">{guia.version}</span>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default VerdurasPage;

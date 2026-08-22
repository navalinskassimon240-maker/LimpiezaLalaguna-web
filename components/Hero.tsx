
import React from 'react';

export const Hero: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden bg-white pt-16 pb-12 sm:pt-24 sm:pb-20">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-0 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-10 w-72 h-72 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center space-y-10 max-w-4xl mx-auto">
          <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Abierto en Torreón
            </span>
          </div>
          
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            <h1 className="text-6xl font-[950] tracking-tighter text-slate-900 sm:text-7xl md:text-8xl leading-[0.9] text-balance">
              Brillo Impecable <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">
                Calidad Lalaguna
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto pt-4">
              Especialistas en fórmulas de limpieza de alto rendimiento. Llevamos la máxima desinfección y frescura a cada rincón de la Comarca.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            <button 
              onClick={() => scrollToSection('productos')}
              className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all"
            >
              Ver Catálogo
            </button>
            <button 
              onClick={() => scrollToSection('ubicacion')}
              className="px-10 py-5 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all"
            >
              Nuestra Ubicación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


import React from 'react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAI: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, cartCount, onOpenCart, onOpenAI, onOpenAuth, onOpenProfile }) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-2">
            <button onClick={() => scrollToSection('inicio')} className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                <i className="fas fa-soap text-xl"></i>
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent uppercase tracking-tighter">
                LimpiezaLalaguna
              </span>
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('inicio')} className="text-slate-500 hover:text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] transition-colors">Inicio</button>
            <button onClick={() => scrollToSection('productos')} className="text-slate-500 hover:text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] transition-colors">Productos</button>
            <button onClick={() => scrollToSection('ubicacion')} className="text-slate-500 hover:text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] transition-colors">Ubicación</button>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={onOpenAI}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-100 font-black text-[10px] uppercase tracking-widest"
            >
              <i className="fas fa-robot text-blue-500"></i>
              <span className="hidden sm:inline">Lalaguna IA</span>
            </button>
            
            <button 
              onClick={onOpenCart}
              className="relative p-2 text-slate-600 hover:text-blue-600 transition-colors"
            >
              <i className="fas fa-shopping-cart text-xl"></i>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <button 
                onClick={onOpenProfile}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-100 hover:border-blue-500 transition-all shadow-sm"
              >
                <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
              </button>
            ) : (
              <button 
                onClick={onOpenAuth}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
              >
                Entrar
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

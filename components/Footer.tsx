
import React from 'react';

interface FooterProps {
  onNavigate?: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white">
                <i className="fas fa-soap"></i>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">LimpiezaLalaguna</span>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              Líderes en distribución de productos de limpieza en toda la Comarca Lagunera. Calidad garantizada para tu hogar y empresa.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-blue-500 transition-colors"><i className="fab fa-facebook-f text-lg"></i></a>
              <a href="#" className="hover:text-pink-500 transition-colors"><i className="fab fa-instagram text-lg"></i></a>
              <a href="#" className="hover:text-green-500 transition-colors"><i className="fab fa-whatsapp text-lg"></i></a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-6">Categorías</h3>
            <ul className="space-y-4 text-sm">
              <li><a href="#productos" className="hover:text-white transition-colors">Cocina & Desengrasantes</a></li>
              <li><a href="#productos" className="hover:text-white transition-colors">Cuidado de Pisos</a></li>
              <li><a href="#productos" className="hover:text-white transition-colors">Baño & Desinfección</a></li>
              <li><a href="#productos" className="hover:text-white transition-colors">Lavandería Industrial</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-6">Empresa</h3>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Sobre Nosotros</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Ubicaciones</a></li>
              <li><button onClick={() => onNavigate?.('/terminos')} className="hover:text-white transition-colors">Términos de Servicio</button></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-6">Contacto</h3>
            <p className="text-xs mb-4">Av. Morelos 123, Torreón, Coah.</p>
            <div className="flex flex-col gap-2">
              <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest">WhatsApp Directo</span>
              <a href="https://wa.me/542241613188" className="bg-emerald-600 text-white px-4 py-3 rounded-xl hover:bg-emerald-700 transition-all text-center text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/20">
                Chatear con Asesor
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs">© 2024 LimpiezaLalaguna. Todos los derechos reservados.</p>
          <div className="flex gap-6 text-xs font-bold uppercase tracking-widest">
            <button onClick={() => onNavigate?.('/privacidad')} className="hover:text-white transition-colors">Privacidad</button>
            <button onClick={() => onNavigate?.('/terminos')} className="hover:text-white transition-colors">Términos</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

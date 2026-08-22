import React from 'react';
import { Droplets, Mail, MapPin, Phone, Clock } from 'lucide-react';
import { siteConfig } from '../data/config';
import { StoreStatusBadge } from './StoreStatusBadge';

export function Footer() {
  return (
    <footer id="contacto" className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-12">
          
          {/* Brand */}
          <div className="space-y-4 pr-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-teal-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md overflow-hidden shrink-0">
                {siteConfig.marca.logoUrl ? (
                  <img 
                    src={siteConfig.marca.logoUrl} 
                    alt={siteConfig.marca.nombrePrincipal}
                    className="w-full h-full object-cover rounded-xl"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                      const parent = (e.target as HTMLElement).parentElement;
                      if (parent && !parent.querySelector('.footer-logo-fallback')) {
                        const span = document.createElement('span');
                        span.className = 'footer-logo-fallback';
                        span.innerText = siteConfig.marca.letraIsotipo || 'L';
                        parent.appendChild(span);
                      }
                    }}
                  />
                ) : (
                  siteConfig.marca.letraIsotipo || 'L'
                )}
              </div>
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                <span className="text-white">{siteConfig.marca.nombrePrincipal}</span>
                <span className="text-emerald-400 font-black">{siteConfig.marca.nombreResaltado}</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              {siteConfig.footer.descripcionCorta}
            </p>
            <div className="pt-1">
              <StoreStatusBadge />
            </div>
          </div>

          {/* Contact Links */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">{siteConfig.footer.tituloContacto}</h4>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <a href={`tel:${siteConfig.whatsapp.numero}`} className="hover:text-white transition-colors">{siteConfig.contacto.telefonoMostrar}</a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <span>{siteConfig.contacto.email}</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <span>{siteConfig.contacto.direccionPiePagina1}<br/>{siteConfig.contacto.direccionPiePagina2}</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">{siteConfig.footer.tituloEnlaces}</h4>
            <ul className="space-y-2.5 text-sm">
              {siteConfig.navegacion.enlaces.map((item) => (
                <li key={item.nombre}>
                  <a href={item.href} className="hover:text-blue-400 transition-colors">
                    {item.nombre}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Horarios Card */}
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" /> {siteConfig.footer.tituloHorarios}
            </h4>
            <div className="space-y-1.5 text-xs text-slate-300 mb-3">
              {siteConfig.horarios.dias.slice(1, 6).every(d => d.isOpen) && (
                <p>
                  <span className="text-slate-400">Lun a Vie:</span>{' '}
                  {siteConfig.horarios.dias[1].shifts.map(s => `${s.open} - ${s.close}`).join(' | ')} hs
                </p>
              )}
              {siteConfig.horarios.dias[6] && (
                <p>
                  <span className="text-slate-400">Sábados:</span>{' '}
                  {siteConfig.horarios.dias[6].isOpen 
                    ? siteConfig.horarios.dias[6].shifts.map(s => `${s.open} - ${s.close}`).join(' | ') + ' hs'
                    : 'Cerrado'}
                </p>
              )}
              {siteConfig.horarios.dias[0] && (
                <p>
                  <span className="text-slate-400">Domingos:</span>{' '}
                  {siteConfig.horarios.dias[0].isOpen 
                    ? siteConfig.horarios.dias[0].shifts.map(s => `${s.open} - ${s.close}`).join(' | ') + ' hs'
                    : 'Cerrado'}
                </p>
              )}
            </div>
            <StoreStatusBadge compact className="w-full justify-center" />
          </div>

        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>© {new Date().getFullYear()} {siteConfig.footer.derechosReservados}</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">{siteConfig.footer.enlacePolitica}</a>
            <a href="#" className="hover:text-white transition-colors">{siteConfig.footer.enlaceAvisoLegal}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

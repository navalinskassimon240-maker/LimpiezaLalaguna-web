
import React from 'react';

interface LegalPageProps {
  type: 'privacy' | 'terms';
  onBack: () => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ type, onBack }) => {
  return (
    <div className="min-h-screen bg-white p-8 md:p-20">
      <button onClick={onBack} className="mb-12 flex items-center gap-2 text-blue-600 font-bold uppercase text-xs tracking-widest">
        <i className="fas fa-arrow-left"></i> Volver a la tienda
      </button>
      
      <div className="max-w-3xl mx-auto prose prose-slate">
        {type === 'privacy' ? (
          <>
            <h1 className="text-4xl font-black text-slate-900 mb-8 uppercase tracking-tighter">Política de Privacidad</h1>
            <p className="text-slate-600 leading-relaxed mb-6">En <strong>LimpiezaLalaguna</strong>, valoramos tu privacidad. Esta política explica cómo manejamos tu información cuando usas nuestro servicio de Google Sign-In.</p>
            <h2 className="text-xl font-bold text-slate-900 mt-10 mb-4">1. Datos que recolectamos</h2>
            <p className="text-slate-600">Solo solicitamos tu nombre, correo electrónico y foto de perfil a través de Google para personalizar tu experiencia y gestionar tus pedidos.</p>
            <h2 className="text-xl font-bold text-slate-900 mt-10 mb-4">2. Uso de la información</h2>
            <p className="text-slate-600">Tus datos se utilizan exclusivamente para identificarte en la plataforma y facilitar el contacto vía WhatsApp al realizar una compra.</p>
            <h2 className="text-xl font-bold text-slate-900 mt-10 mb-4">3. Terceros</h2>
            <p className="text-slate-600">No compartimos ni vendemos tus datos a ninguna empresa externa. Tus datos están seguros con nosotros.</p>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-black text-slate-900 mb-8 uppercase tracking-tighter">Términos del Servicio</h1>
            <p className="text-slate-600 leading-relaxed mb-6">Al usar <strong>LimpiezaLalaguna</strong>, aceptas los siguientes términos:</p>
            <h2 className="text-xl font-bold text-slate-900 mt-10 mb-4">1. Uso del sitio</h2>
            <p className="text-slate-600">Este sitio es un catálogo digital. Los precios y disponibilidad pueden variar. La compra final se concreta siempre vía WhatsApp.</p>
            <h2 className="text-xl font-bold text-slate-900 mt-10 mb-4">2. Pagos</h2>
            <p className="text-slate-600">Aceptamos transferencias bancarias y efectivo. El alias oficial para pagos es simon.navalinskas.mp.</p>
            <h2 className="text-xl font-bold text-slate-900 mt-10 mb-4">3. Envíos</h2>
            <p className="text-slate-600">Los envíos a domicilio están sujetos a zona de cobertura en la Comarca Lagunera.</p>
          </>
        )}
      </div>
    </div>
  );
};

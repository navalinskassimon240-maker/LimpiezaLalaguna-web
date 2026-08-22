
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User } from '../types';

declare global {
  interface Window {
    AppleID: any;
    google: any;
  }
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

type AuthStep = 'methods' | 'connecting' | 'verifying' | 'loading' | 'error';

const GOOGLE_CLIENT_ID = "542510293042-5k8pukffid4vb67d9oeqt5j4h42g4jnu.apps.googleusercontent.com";

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [step, setStep] = useState<AuthStep>('methods');
  const [errorMessage, setErrorMessage] = useState('');
  const [isIOS, setIsIOS] = useState(false);
  const googleBtnContainer = useRef<HTMLDivElement>(null);

  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const checkIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };
    setIsIOS(checkIOS());
  }, []);

  const handleDemoLogin = () => {
    setStep('verifying');
    const demoUser: User = {
      id: 'demo-123',
      name: 'Usuario Laguna',
      email: 'visita@lalaguna.com',
      photoUrl: 'https://ui-avatars.com/api/?name=Usuario+Laguna&background=0D6EFD&color=fff',
      backgroundUrl: '',
      authMethod: 'Google',
      subscribed: true,
      role: 'user'
    };
    setTimeout(() => {
      onLogin(demoUser);
      setStep('methods');
    }, 1500);
  };

  const initGoogleSDK = useCallback(() => {
    if (window.google && googleBtnContainer.current) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          setStep('verifying');
          const payload = parseJwt(response.credential);
          if (payload) {
            const googleUser: User = {
              id: payload.sub,
              name: payload.name,
              email: payload.email,
              photoUrl: payload.picture,
              backgroundUrl: '',
              authMethod: 'Google',
              subscribed: true,
              role: payload.email.toLowerCase() === 'simon@gmail.com' ? 'admin' : 'user'
            };
            setTimeout(() => {
              onLogin(googleUser);
              setStep('methods');
            }, 1000);
          } else {
            setStep('error');
            setErrorMessage('No se pudo verificar la cuenta de Google.');
          }
        },
        auto_select: false,
      });

      window.google.accounts.id.renderButton(
        googleBtnContainer.current,
        { theme: "filled_blue", size: "large", width: 280, shape: "pill", text: "continue_with" }
      );
    }
  }, [onLogin]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => initGoogleSDK(), 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initGoogleSDK]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl transition-opacity duration-500" onClick={onClose} />
      
      <div className={`relative bg-[#0a0a0a] w-full max-w-[420px] min-h-[620px] rounded-[4rem] overflow-hidden shadow-2xl border border-white/5 transition-all duration-700 transform ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
        
        {step === 'verifying' && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] p-8 text-center animate-in fade-in duration-500">
            <div className="w-24 h-24 rounded-[3rem] bg-blue-600/10 flex items-center justify-center border border-blue-500/20 animate-pulse mb-8">
              <i className="fas fa-shield-halved text-blue-500 text-5xl"></i>
            </div>
            <h3 className="text-white text-2xl font-black mb-4 uppercase tracking-tighter text-center">Verificando Acceso</h3>
            <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold">Lalaguna Secure Login</p>
          </div>
        )}

        {step === 'methods' && (
          <div className="p-12 flex flex-col h-full items-center justify-center animate-in fade-in zoom-in-95 duration-700">
            <div className="mb-10 w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2.5rem] flex items-center justify-center shadow-3xl shadow-blue-500/40 relative">
               <i className="fas fa-soap text-4xl text-white"></i>
               <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full border-4 border-[#0a0a0a]"></div>
            </div>
            
            <h2 className="text-5xl font-black text-white mb-2 tracking-tighter text-center leading-none">
              Limpieza<br/><span className="text-blue-500">Lalaguna</span>
            </h2>
            <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em] mb-12">Comarca Lagunera</p>
            
            <div className="w-full space-y-4 flex flex-col items-center">
              <div className="min-h-[50px] flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                <div ref={googleBtnContainer}></div>
              </div>

              <div className="w-full flex items-center gap-4 py-4">
                <div className="h-[1px] flex-grow bg-white/10"></div>
                <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">o bien</span>
                <div className="h-[1px] flex-grow bg-white/10"></div>
              </div>

              <button 
                onClick={handleDemoLogin}
                className="w-[280px] h-[48px] bg-white/5 border border-white/10 text-white rounded-full font-black flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-95 text-[10px] uppercase tracking-widest"
              >
                <i className="fas fa-bolt text-blue-500"></i>
                Entrar Modo Invitado
              </button>

              {isIOS && (
                <button 
                  className="w-[280px] bg-white text-black h-[48px] rounded-full font-black flex items-center justify-center gap-3 hover:bg-slate-200 transition-all active:scale-95 text-[10px] uppercase tracking-widest"
                >
                  <i className="fab fa-apple text-lg"></i>
                  Apple Sign In
                </button>
              )}
            </div>
            
            <div className="mt-16 flex flex-col items-center gap-2">
              <p className="text-[8px] text-white/10 font-black uppercase tracking-[0.4em] text-center max-w-[220px] leading-loose">
                Para el acceso real de Google, registra tu URL en la consola de Google Cloud
              </p>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-8 border border-red-500/20">
              <i className="fas fa-exclamation-triangle text-red-500 text-3xl"></i>
            </div>
            <h3 className="text-white text-xl font-black mb-4 uppercase tracking-tighter">Error de Origen</h3>
            <p className="text-white/40 text-[10px] mb-12 font-bold uppercase tracking-widest leading-relaxed">
              La URL de tu navegador no está autorizada en Google Cloud.<br/>
              Usa el "Modo Invitado" para probar la web.
            </p>
            <button onClick={() => setStep('methods')} className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-colors">Volver</button>
          </div>
        )}
      </div>
    </div>
  );
};

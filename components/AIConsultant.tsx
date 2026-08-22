
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, User } from '../types';
import { getCleaningAdvice } from '../services/geminiService';

interface AIConsultantProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const AIConsultant: React.FC<AIConsultantProps> = ({ isOpen, onClose, user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      const greeting = user 
        ? `¡Hola ${user.name.split(' ')[0]}! Soy la IA de LimpiezaLalaguna 🧼✨. ¿Cómo puedo ayudarte hoy con tu limpieza?`
        : '¡Hola! Soy la IA oficial de LimpiezaLalaguna 🧼✨. ¿Tienes alguna duda sobre nuestros productos?';
      setMessages([{ role: 'model', text: greeting }]);
    }
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    const response = await getCleaningAdvice(messages, userMsg);
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl h-[80vh] bg-white rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
              <i className="fas fa-robot text-xl"></i>
            </div>
            <div>
              <h2 className="font-black text-xl tracking-tight leading-none">Lalaguna IA</h2>
              <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mt-1">Soporte Inteligente</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div ref={scrollRef} className="flex-grow overflow-y-auto p-8 space-y-6 bg-slate-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-5 rounded-3xl ${
                msg.role === 'user' 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 rounded-tr-none' 
                : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'
              }`}>
                <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-3xl rounded-tl-none shadow-sm border border-slate-100 flex gap-2 items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-slate-100">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-3">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregunta lo que quieras..."
              className="flex-grow px-6 py-4 rounded-2xl bg-slate-100 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium"
            />
            <button 
              disabled={isLoading}
              type="submit"
              className="bg-blue-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xl shadow-blue-200"
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

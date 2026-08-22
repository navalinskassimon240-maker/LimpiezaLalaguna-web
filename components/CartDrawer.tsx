
import React, { useState } from 'react';
import { CartItem, ShippingMethod, PaymentMethod } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onClearCart: () => void;
}

type CheckoutStep = 'cart' | 'shipping' | 'payment' | 'summary' | 'success';

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onUpdateQuantity, onRemove, onClearCart }) => {
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfer');
  const [address, setAddress] = useState('');
  const [orderId] = useState(() => `LAL-${Math.floor(1000 + Math.random() * 9000)}`);

  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const phoneNumber = "542241613188";
  const mpAlias = "simon.navalinskas.mp";
  const localAddress = "Av. Morelos 123, Torreon";

  const isLiquid = (name: string): boolean => {
    const liquidKeywords = ['lavandina', 'jabon', 'cloro', 'detergente', 'suavizante', 'limpiador', 'desengrasante', 'alcohol', 'perfume', 'liquido'];
    const lowerName = name.toLowerCase();
    return liquidKeywords.some(keyword => lowerName.includes(keyword));
  };

  const getUnitValue = (unitStr: string): number => {
    const lower = unitStr.toLowerCase();
    const match = lower.match(/(\d+(\.\d+)?)/);
    if (!match) return 1;
    let val = parseFloat(match[0]);
    if (lower.includes('ml')) val = val / 1000;
    return val;
  };

  const handleClose = () => {
    if (step === 'success') {
      setStep('cart');
      onClearCart();
    }
    onClose();
  };

  const handleFinishOrder = () => {
    const lineBreak = "%0A";
    
    const itemsFormatted = items.map(item => {
      const unitVal = getUnitValue(item.unit);
      if (isLiquid(item.name)) {
        const totalLiters = (unitVal * item.quantity).toFixed(2).replace(/\.00$/, '');
        return `- ${totalLiters}L de ${item.name.toUpperCase()}`;
      } else {
        const totalUnits = Math.round(unitVal * item.quantity);
        return `- ${totalUnits} un. de ${item.name.toUpperCase()}`;
      }
    }).join(lineBreak);
    
    const entregaStr = shippingMethod === 'pickup' ? "RETIRO EN LOCAL" : "ENVIO A DOMICILIO";
    const direccionStr = shippingMethod === 'delivery' ? `DIRECCION: ${address}` : `RETIRA EN: ${localAddress}`;
    const pagoStr = paymentMethod === 'transfer' ? `PAGO: TRANSFERENCIA (ALIAS: ${mpAlias})` : "PAGO: EFECTIVO AL RECIBIR";

    const textLines = [
      `🛒 *PEDIDO ${orderId}*`,
      `--------------------------`,
      `📦 *ENTREGA*`,
      entregaStr,
      direccionStr,
      ``,
      `💳 *PAGO*`,
      pagoStr,
      ``,
      `🧼 *PRODUCTOS*`,
      itemsFormatted,
      ``,
      `💰 *TOTAL: $${total}.00*`,
      `--------------------------`,
      `_Este es un pedido automático de la web._`,
      paymentMethod === 'transfer' ? `*Aguardamos el comprobante por aqui.*` : `*Por favor confirme que recibió este pedido.*`
    ];

    const finalMessage = textLines.join(lineBreak);
    window.open(`https://wa.me/${phoneNumber}?text=${finalMessage}`, '_blank');
    
    setStep('success');
  };

  const renderStep = () => {
    switch (step) {
      case 'cart':
        return (
          <div className="flex-grow overflow-y-auto px-6 py-4 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <i className="fas fa-shopping-basket text-6xl mb-4 opacity-20"></i>
                <p className="font-medium">Tu carrito esta vacio</p>
                <button onClick={onClose} className="mt-4 text-blue-600 font-bold underline">VER CATALOGO</button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b border-slate-100 pb-4">
                  <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl object-cover bg-slate-50 border border-slate-100" />
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">{item.name}</h3>
                      <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${isLiquid(item.name) ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                        {isLiquid(item.name) ? 'Liquido' : 'Solido'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">${item.price}.00 x {item.unit}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                        <button onClick={() => onUpdateQuantity(item.id, -1)} className="px-3 py-1 hover:bg-slate-50 text-slate-400">-</button>
                        <span className="px-3 text-xs font-bold text-slate-700">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.id, 1)} className="px-3 py-1 hover:bg-slate-50 text-slate-400">+</button>
                      </div>
                      <button onClick={() => onRemove(item.id)} className="text-red-500 text-xs font-bold">Quitar</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'shipping':
        return (
          <div className="flex-grow overflow-y-auto px-6 py-4 space-y-6">
            <h3 className="text-lg font-black text-slate-900 uppercase">¿Como lo enviamos?</h3>
            <div className="space-y-3">
              <button onClick={() => setShippingMethod('pickup')} className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${shippingMethod === 'pickup' ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${shippingMethod === 'pickup' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}><i className="fas fa-store"></i></div>
                  <div><p className="font-black text-sm uppercase">Retiro Personal</p><p className="text-xs text-slate-500 mt-1">{localAddress}</p></div>
                </div>
              </button>
              <button onClick={() => setShippingMethod('delivery')} className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${shippingMethod === 'delivery' ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${shippingMethod === 'delivery' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}><i className="fas fa-truck"></i></div>
                  <div><p className="font-black text-sm uppercase">Envio a Domicilio</p><p className="text-xs text-slate-500 mt-1">Llevamos todo a tu casa</p></div>
                </div>
              </button>
            </div>
            {shippingMethod === 'delivery' && (
              <div className="pt-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-black text-slate-500 uppercase">¿Donde entregamos?</label>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Direccion completa y referencias..." className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none h-32 text-sm bg-slate-50"/>
              </div>
            )}
          </div>
        );

      case 'payment':
        return (
          <div className="flex-grow overflow-y-auto px-6 py-4 space-y-6">
            <h3 className="text-lg font-black text-slate-900 uppercase">¿Como pagas?</h3>
            <div className="space-y-3">
              <button onClick={() => setPaymentMethod('transfer')} className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${paymentMethod === 'transfer' ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === 'transfer' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}><i className="fas fa-university"></i></div>
                  <div><p className="font-black text-sm uppercase">Transferencia</p><p className="text-xs text-slate-500 mt-1">Mercado Pago / Alias</p></div>
                </div>
              </button>
              <button onClick={() => setPaymentMethod('cash')} className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${paymentMethod === 'cash' ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === 'cash' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}><i className="fas fa-money-bill-wave"></i></div>
                  <div><p className="font-black text-sm uppercase">Efectivo</p><p className="text-xs text-slate-500 mt-1">Al recibir el pedido</p></div>
                </div>
              </button>
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="flex-grow overflow-y-auto px-6 py-4 space-y-6">
            <div className="text-center py-6"><div className="w-20 h-20 bg-emerald-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-xl shadow-emerald-100"><i className="fas fa-receipt"></i></div><h3 className="text-2xl font-black text-slate-900 uppercase">Ticket {orderId}</h3></div>
            <div className="bg-slate-900 rounded-3xl p-6 space-y-4 text-sm text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-3"><span className="uppercase text-[9px] font-black">Entrega</span><span className="font-bold text-white uppercase text-xs">{shippingMethod === 'pickup' ? 'Retiro' : 'Domicilio'}</span></div>
              <div className="flex justify-between border-b border-slate-800 pb-3"><span className="uppercase text-[9px] font-black">Pago</span><span className="font-bold text-white uppercase text-xs">{paymentMethod === 'transfer' ? 'Transfer' : 'Efectivo'}</span></div>
              <div className="pt-2"><span className="uppercase text-[9px] font-black block mb-3">Resumen</span><div className="space-y-2">{items.map(i => (<div key={i.id} className="flex justify-between text-[11px] items-center"><span className="text-slate-400">{isLiquid(i.name) ? `${(getUnitValue(i.unit) * i.quantity).toFixed(2).replace(/\.00$/, '')}L de ${i.name}` : `${Math.round(getUnitValue(i.unit) * i.quantity)} un. de ${i.name}`}</span><span className="font-black text-white">${i.price * i.quantity}</span></div>))}</div></div>
              <div className="pt-4 mt-4 border-t border-slate-800 flex justify-between items-center"><span className="font-black text-white text-lg">TOTAL</span><span className="text-2xl font-black text-emerald-400">${total}.00</span></div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-6">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl shadow-inner animate-pulse">
              <i className="fas fa-paper-plane"></i>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-slate-900 uppercase">¡Pedido Finalizado!</h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                El pedido ha sido enviado. <br/>
                Pronto <span className="text-blue-600 font-bold">LimpiezaLalaguna</span> te respondera para confirmar todo 😊✨
              </p>
            </div>
            <button onClick={handleClose} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100">VOLVER AL INICIO</button>
          </div>
        );
    }
  };

  return (
    <div className={`fixed inset-0 z-[60] overflow-hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleClose} />
      <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
            <div className="flex items-center gap-3">
              {['shipping', 'payment', 'summary'].includes(step) && (<button onClick={() => setStep(step === 'summary' ? 'payment' : step === 'payment' ? 'shipping' : 'cart')} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors"><i className="fas fa-arrow-left text-sm"></i></button>)}
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">{step === 'cart' ? 'Carrito' : step === 'shipping' ? 'Logistica' : step === 'payment' ? 'Pago' : step === 'summary' ? 'Revision' : '¡Exito!'}</h2>
            </div>
            <button onClick={handleClose} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"><i className="fas fa-times text-sm"></i></button>
          </div>
          {renderStep()}
          {items.length > 0 && step !== 'success' && (
            <div className="p-6 border-t border-slate-100 bg-white">
              <div className="flex justify-between items-center mb-6"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total a pagar</span><span className="text-3xl font-black text-slate-900">${total}.00</span></div>
              {step === 'cart' && (<button onClick={() => setStep('shipping')} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">CONTINUAR ENTREGA</button>)}
              {step === 'shipping' && (<button disabled={shippingMethod === 'delivery' && !address.trim()} onClick={() => setStep('payment')} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50">ELEGIR PAGO</button>)}
              {step === 'payment' && (<button onClick={() => setStep('summary')} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">VER RESUMEN</button>)}
              {step === 'summary' && (<button onClick={handleFinishOrder} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3"><i className="fab fa-whatsapp text-lg"></i>ENVIAR PEDIDO</button>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

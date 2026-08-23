import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight, Truck, Store, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { siteConfig } from '../data/config';
import { createWhatsAppUrl } from '../utils/whatsapp';

type CheckoutStep = 'cart' | 'checkout';

export function Cart() {
  const [mounted, setMounted] = useState(false);
  const { isCartOpen, setIsCartOpen, cartItems, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [shippingMethod, setShippingMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');
  
  // Delivery fields
  const [address, setAddress] = useState('');
  const [receiverName, setReceiverName] = useState('');
  
  // Pickup fields
  const [pickupName, setPickupName] = useState('');
  const [orderName, setOrderName] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  if (!mounted) return null;

  const handleClose = () => {
    setIsCartOpen(false);
    setTimeout(() => {
      setStep('cart');
      setIsProcessing(false);
    }, 300);
  };

  const isFormValid = () => {
    if (shippingMethod === 'delivery') {
      return address.trim() !== '' && receiverName.trim() !== '';
    } else {
      return pickupName.trim() !== '' && orderName.trim() !== '';
    }
  };

  const handleCheckout = () => {
    if (!isFormValid()) return;
    
    setIsProcessing(true);
    
    // Generar mensaje de WhatsApp con formato prolijo y emojis
    let text = `✨ *¡HOLA LIMPIEZALALAGUNA!* ✨\n`;
    text += `Quiero realizar el siguiente pedido:\n\n`;
    
    text += `🛒 *DETALLE DEL PEDIDO:*\n`;
    cartItems.forEach(item => {
      text += `• *${item.quantity}x* ${item.name} (${item.selectedOption.label}) ➔ *$${(item.price * item.quantity).toLocaleString('es-AR')}*\n`;
    });
    
    text += `\n💰 *TOTAL A PAGAR: $${cartTotal.toLocaleString('es-AR')}*\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    
    if (shippingMethod === 'delivery') {
      text += `🚚 *MÉTODO DE ENTREGA:* Envío a Domicilio\n`;
      text += `📍 *DIRECCIÓN:* ${address.trim()}\n`;
      text += `👤 *QUIÉN RECIBE:* ${receiverName.trim()}\n`;
      text += `💵 *FORMA DE PAGO:* ${paymentMethod === 'cash' ? 'Efectivo al recibir' : 'Transferencia bancaria'}\n`;
    } else {
      text += `🏪 *MÉTODO DE ENTREGA:* Retiro en el Local\n`;
      text += `📍 *SUCURSAL:* ${siteConfig.contacto.direccionRetiroCarrito}\n`;
      text += `🏷️ *A NOMBRE DE:* ${orderName.trim()}\n`;
      text += `👤 *QUIÉN RETIRA:* ${pickupName.trim()}\n`;
      text += `💵 *FORMA DE PAGO:* ${paymentMethod === 'cash' ? 'Pago en el local' : 'Transferencia bancaria'}\n`;
    }
    
    if (paymentMethod === 'transfer') {
      text += `📲 _(Te enviaré el comprobante de transferencia por aquí)_\n`;
    }
    text += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `¡Muchas gracias! 🙌`;
    
    const whatsappUrl = createWhatsAppUrl(siteConfig.whatsapp.numero, text);
    
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      setIsProcessing(false);
      handleClose();
    }, 600);
  };

  return createPortal(
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            className="relative h-full w-full max-w-md bg-white shadow-2xl z-10 flex flex-col border-l border-slate-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {step === 'cart' && 'Tu Carrito'}
                  {step === 'checkout' && 'Detalles del Pedido'}
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all active:scale-95"
                aria-label="Cerrar carrito"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden relative">
              <AnimatePresence mode="wait">
                {/* STEP 1: CART */}
                {step === 'cart' && (
                  <motion.div 
                    key="cart"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="absolute inset-0 flex flex-col"
                  >
                    <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3">
                      {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4 my-auto py-12">
                          <ShoppingBag className="w-16 h-16 opacity-30 text-slate-400" />
                          <p className="text-base font-medium">Tu carrito está vacío</p>
                          <button 
                            onClick={handleClose}
                            className="text-blue-600 font-bold bg-blue-50 px-5 py-2.5 rounded-xl hover:bg-blue-100 transition-colors text-sm"
                          >
                            Ver Catálogo de Productos
                          </button>
                        </div>
                      ) : (
                        cartItems.map((item) => (
                          <div 
                            key={item.cartItemId} 
                            className="flex gap-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80 shadow-sm"
                          >
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl overflow-hidden shrink-0 border border-slate-100">
                              <img 
                                src={item.imageUrl} 
                                alt={item.name} 
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=800';
                                }}
                                className="w-full h-full object-cover" 
                              />
                            </div>
                            <div className="flex-1 flex flex-col justify-between min-w-0">
                              <div className="flex justify-between items-start gap-1">
                                <div className="min-w-0 pr-1">
                                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight truncate">{item.name}</h4>
                                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                                    {item.selectedOption.label}
                                  </span>
                                </div>
                                <button 
                                  onClick={() => removeFromCart(item.cartItemId)}
                                  className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition-colors shrink-0"
                                  aria-label="Eliminar producto"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <span className="font-black text-blue-600 text-sm sm:text-base">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                                <div className="flex items-center gap-1 bg-white rounded-xl p-0.5 border border-slate-200 shadow-sm">
                                  <button 
                                    onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                    className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-blue-600 rounded transition-all"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="text-xs font-bold w-5 text-center text-slate-700">{item.quantity}</span>
                                  <button 
                                    onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                    className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-blue-600 rounded transition-all"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {cartItems.length > 0 && (
                      <div className="p-4 sm:p-5 border-t border-slate-100 bg-white z-10 relative">
                        <div className="flex justify-between items-end mb-4">
                          <span className="text-slate-500 text-xs sm:text-sm font-medium">Subtotal ({cartCount} {cartCount === 1 ? 'producto' : 'productos'})</span>
                          <span className="text-2xl font-black text-slate-900">${cartTotal.toLocaleString('es-AR')}</span>
                        </div>
                        <button 
                          onClick={() => setStep('checkout')}
                          className="flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-3.5 rounded-2xl shadow-lg transition-all active:scale-98 text-sm sm:text-base"
                        >
                          Continuar Pedido <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* STEP 2: CHECKOUT */}
                {step === 'checkout' && (
                  <motion.div 
                    key="checkout"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="absolute inset-0 flex flex-col"
                  >
                    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                      <h3 className="text-sm sm:text-base font-bold text-slate-800">¿Cómo querés recibir tu pedido?</h3>
                      
                      <div className="grid grid-cols-2 gap-2.5">
                        <div 
                          onClick={() => setShippingMethod('delivery')}
                          className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-1.5 ${shippingMethod === 'delivery' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 bg-white hover:border-blue-300'}`}
                        >
                          <div className={`p-2 rounded-xl w-fit ${shippingMethod === 'delivery' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            <Truck className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-slate-900">A Domicilio</h4>
                            <p className="text-[11px] text-slate-500">Entrega rápida</p>
                          </div>
                        </div>

                        <div 
                          onClick={() => setShippingMethod('pickup')}
                          className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-1.5 ${shippingMethod === 'pickup' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 bg-white hover:border-blue-300'}`}
                        >
                          <div className={`p-2 rounded-xl w-fit ${shippingMethod === 'pickup' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            <Store className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-slate-900">Retiro en Local</h4>
                            <p className="text-[11px] text-slate-500">Sin costo</p>
                          </div>
                        </div>
                      </div>

                      {shippingMethod === 'delivery' ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Dirección completa</label>
                            <input 
                              type="text" 
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              placeholder="Calle, número, barrio o piso/depto" 
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none text-xs sm:text-sm font-medium" 
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">¿Quién recibe?</label>
                            <input 
                              type="text" 
                              value={receiverName}
                              onChange={(e) => setReceiverName(e.target.value)}
                              placeholder="Nombre y apellido" 
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none text-xs sm:text-sm font-medium" 
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Forma de Pago</label>
                            <div className="grid grid-cols-2 gap-2">
                              <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-blue-600 bg-blue-50/50 font-bold' : 'border-slate-200'}`}>
                                <input type="radio" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="hidden" />
                                <span className="text-xs text-slate-700">Efectivo al recibir</span>
                              </label>
                              <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'transfer' ? 'border-blue-600 bg-blue-50/50 font-bold' : 'border-slate-200'}`}>
                                <input type="radio" checked={paymentMethod === 'transfer'} onChange={() => setPaymentMethod('transfer')} className="hidden" />
                                <span className="text-xs text-slate-700">Transferencia</span>
                              </label>
                            </div>
                          </div>
                          
                          {paymentMethod === 'transfer' && (
                            <div className="p-3 bg-blue-50/80 rounded-xl text-xs text-slate-700 border border-blue-100">
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="p-3 bg-slate-50 rounded-xl flex items-start gap-2.5 border border-slate-200/80">
                            <Store className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-slate-600 leading-relaxed">
                              Retirás en: <strong className="text-slate-900">{siteConfig.contacto.direccionRetiroCarrito}</strong>
                            </p>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del pedido</label>
                            <input 
                              type="text" 
                              value={orderName}
                              onChange={(e) => setOrderName(e.target.value)}
                              placeholder="¿A nombre de quién?" 
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none text-xs sm:text-sm font-medium" 
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">¿Quién lo retira?</label>
                            <input 
                              type="text" 
                              value={pickupName}
                              onChange={(e) => setPickupName(e.target.value)}
                              placeholder="Nombre de la persona" 
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none text-xs sm:text-sm font-medium" 
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Forma de Pago</label>
                            <div className="grid grid-cols-2 gap-2">
                              <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-blue-600 bg-blue-50/50 font-bold' : 'border-slate-200'}`}>
                                <input type="radio" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="hidden" />
                                <span className="text-xs text-slate-700">Pago en local</span>
                              </label>
                              <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'transfer' ? 'border-blue-600 bg-blue-50/50 font-bold' : 'border-slate-200'}`}>
                                <input type="radio" checked={paymentMethod === 'transfer'} onChange={() => setPaymentMethod('transfer')} className="hidden" />
                                <span className="text-xs text-slate-700">Transferencia</span>
                              </label>
                            </div>
                          </div>
                          
                          {paymentMethod === 'transfer' && (
                            <div className="p-3 bg-blue-50/80 rounded-xl text-xs text-slate-700 border border-blue-100">
          
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="p-4 sm:p-5 border-t border-slate-100 bg-white z-10 relative">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs text-slate-500">Total a Pagar</span>
                        <span className="text-2xl font-black text-blue-600">${cartTotal.toLocaleString('es-AR')}</span>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => setStep('cart')} className="px-4 py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Atrás</button>
                        <button 
                          onClick={handleCheckout}
                          disabled={!isFormValid() || isProcessing}
                          className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition-all disabled:opacity-50 text-xs sm:text-sm cursor-pointer disabled:cursor-not-allowed"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              Enviar por WhatsApp <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

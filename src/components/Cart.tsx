import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Minus, 
  Plus, 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  Truck, 
  Store, 
  Loader2, 
  Tag, 
  Ticket, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { siteConfig } from '../data/config';
import { createWhatsAppUrl } from '../utils/whatsapp';
import { triggerHaptic } from '../utils/haptics';

type CheckoutStep = 'cart' | 'checkout';

export function Cart() {
  const [mounted, setMounted] = useState(false);
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    cartTotal, 
    cartCount,
    availableCoupons,
    appliedCoupon,
    couponError,
    applyCoupon,
    removeCoupon,
    discountAmount,
    finalTotal
  } = useCart();
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [shippingMethod, setShippingMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');
  
  // Coupon input state
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
      setCouponFeedback(null);
    }, 300);
  };

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponCodeInput).trim().toUpperCase();
    if (!code) {
      setCouponFeedback({ type: 'error', message: 'Por favor escribí el código de cupón' });
      return;
    }
    const result = applyCoupon(code);
    if (result.success) {
      setCouponFeedback({ type: 'success', message: result.message });
      setCouponCodeInput('');
    } else {
      setCouponFeedback({ type: 'error', message: result.message });
    }
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
    
    if (appliedCoupon && discountAmount > 0) {
      text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
      text += `📊 *Subtotal:* $${cartTotal.toLocaleString('es-AR')}\n`;
      text += `🎟️ *CUPÓN APLICADO:* ${appliedCoupon.code} (${appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}% OFF` : `$${appliedCoupon.discountValue.toLocaleString('es-AR')} OFF`})\n`;
      text += `💸 *DESCUENTO:* -$${discountAmount.toLocaleString('es-AR')}\n`;
      text += `💰 *TOTAL A PAGAR CON DESCUENTO: $${finalTotal.toLocaleString('es-AR')}*\n\n`;
    } else {
      text += `\n💰 *TOTAL A PAGAR: $${cartTotal.toLocaleString('es-AR')}*\n\n`;
    }

    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    
    if (shippingMethod === 'delivery') {
      text += `🚚 *MÉTODO DE ENTREGA:* Envío a Domicilio\n`;
      text += `📍 *DIRECCIÓN:* ${address.trim()}\n`;
      text += `👤 *QUIÉN RECIBE:* ${receiverName.trim()}\n`;
      text += `💵 *FORMA DE PAGO:* ${paymentMethod === 'cash' ? 'Efectivo al recibir' : 'Transferencia'}\n`;
    } else {
      text += `🏪 *MÉTODO DE ENTREGA:* Retiro en el Local\n`;
      text += `📍 *SUCURSAL:* ${siteConfig.contacto.direccionRetiroCarrito}\n`;
      text += `🏷️ *A NOMBRE DE:* ${orderName.trim()}\n`;
      text += `👤 *QUIÉN RETIRA:* ${pickupName.trim()}\n`;
      text += `💵 *FORMA DE PAGO:* ${paymentMethod === 'cash' ? 'Efectivo en el local' : 'Transferencia'}\n`;
    }
    
    text += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `¡Muchas gracias! 🙌`;
    
    const whatsappUrl = createWhatsAppUrl(siteConfig.whatsapp.numero, text);
    
    setTimeout(() => {
      window.location.href = whatsappUrl;
      clearCart();
      setIsProcessing(false);
      handleClose();
    }, 400);
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
            {/* Mobile Drag Handle Bar */}
            <div 
              onClick={handleClose}
              className="md:hidden flex justify-center py-2.5 bg-white cursor-pointer active:opacity-60 transition-opacity shrink-0"
              title="Tocar para cerrar"
            >
              <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
            </div>

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

            <div className="flex-1 overflow-hidden relative flex flex-col">
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
                                src={item.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=800'} 
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
                                  onClick={() => {
                                    triggerHaptic('warning');
                                    removeFromCart(item.cartItemId);
                                  }}
                                  className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg transition-colors shrink-0 active:scale-90"
                                  aria-label="Eliminar producto"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <span className="font-black text-blue-600 text-sm sm:text-base">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                                <div className="flex items-center gap-1 bg-white rounded-xl p-0.5 border border-slate-200 shadow-sm">
                                  <button 
                                    onClick={() => {
                                      triggerHaptic('light');
                                      updateQuantity(item.cartItemId, item.quantity - 1);
                                    }}
                                    className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-blue-600 rounded transition-all active:scale-90"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="text-xs font-bold w-5 text-center text-slate-700">{item.quantity}</span>
                                  <button 
                                    onClick={() => {
                                      triggerHaptic('light');
                                      updateQuantity(item.cartItemId, item.quantity + 1);
                                    }}
                                    className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-blue-600 rounded transition-all active:scale-90"
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

                    {/* STEP 1 FOOTER: COUPON & PRICE BREAKDOWN */}
                    {cartItems.length > 0 && (
                      <div className="p-4 sm:p-5 border-t border-slate-100 bg-white z-10 relative space-y-3.5">
                        {/* Coupon Box */}
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                          {appliedCoupon ? (
                            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="p-1 bg-emerald-600 text-white rounded-lg shrink-0">
                                  <Ticket className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-black text-xs text-emerald-900 tracking-wider">
                                      {appliedCoupon.code}
                                    </span>
                                    <span className="text-[10px] font-bold bg-emerald-200/70 text-emerald-800 px-1.5 py-0.2 rounded-md">
                                      {appliedCoupon.badgeText || (appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}% OFF` : `$${appliedCoupon.discountValue.toLocaleString('es-AR')}`)}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-emerald-700 truncate mt-0.5">
                                    {appliedCoupon.description}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={removeCoupon}
                                className="text-xs font-bold text-red-600 hover:text-red-700 bg-white hover:bg-red-50 px-2.5 py-1 rounded-lg border border-red-200 transition-colors ml-2 shrink-0 cursor-pointer"
                              >
                                Quitar
                              </button>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  <input
                                    type="text"
                                    value={couponCodeInput}
                                    onChange={(e) => {
                                      setCouponCodeInput(e.target.value.toUpperCase());
                                      setCouponFeedback(null);
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleApplyCoupon();
                                      }
                                    }}
                                    placeholder="Ingresá tu cupón de descuento"
                                    className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-xs font-bold uppercase tracking-wider text-slate-800 placeholder:normal-case placeholder:font-normal placeholder:text-slate-400 outline-none"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleApplyCoupon()}
                                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-95 shadow-sm shadow-blue-500/30 flex items-center gap-1"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Aplicar</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Coupon feedback alert */}
                          {couponFeedback && (
                            <div className={`mt-2 p-2 rounded-xl text-[11px] font-medium flex items-center gap-1.5 ${
                              couponFeedback.type === 'success' 
                                ? 'bg-emerald-100/80 text-emerald-800 border border-emerald-200' 
                                : 'bg-rose-100/80 text-rose-800 border border-rose-200'
                            }`}>
                              {couponFeedback.type === 'success' ? (
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                              ) : (
                                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                              )}
                              <span>{couponFeedback.message}</span>
                            </div>
                          )}
                        </div>

                        {/* Price summary */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between items-center text-xs text-slate-500">
                            <span>Subtotal ({cartCount} {cartCount === 1 ? 'producto' : 'productos'})</span>
                            <span className="font-bold text-slate-700">${cartTotal.toLocaleString('es-AR')}</span>
                          </div>

                          {appliedCoupon && discountAmount > 0 && (
                            <div className="flex justify-between items-center text-xs font-bold text-emerald-600">
                              <span className="flex items-center gap-1">
                                <Ticket className="w-3.5 h-3.5" />
                                Descuento ({appliedCoupon.code})
                              </span>
                              <span>-${discountAmount.toLocaleString('es-AR')}</span>
                            </div>
                          )}

                          <div className="flex justify-between items-end pt-1 border-t border-slate-100">
                            <span className="text-slate-900 text-sm font-black">Total</span>
                            <div className="text-right">
                              {appliedCoupon && discountAmount > 0 && (
                                <span className="text-xs text-slate-400 line-through mr-2 font-medium">
                                  ${cartTotal.toLocaleString('es-AR')}
                                </span>
                              )}
                              <span className="text-2xl font-black text-slate-900">${finalTotal.toLocaleString('es-AR')}</span>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => setStep('checkout')}
                          className="flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-3.5 rounded-2xl shadow-lg transition-all active:scale-98 text-sm sm:text-base cursor-pointer"
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
                        </div>
                      )}
                    </div>

                    <div className="p-4 sm:p-5 border-t border-slate-100 bg-white z-10 relative">
                      {appliedCoupon && discountAmount > 0 && (
                        <div className="mb-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-800">
                          <span className="flex items-center gap-1.5">
                            <Ticket className="w-3.5 h-3.5 text-emerald-600" />
                            Cupón {appliedCoupon.code} aplicado
                          </span>
                          <span>-${discountAmount.toLocaleString('es-AR')}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs text-slate-500">Total a Pagar</span>
                        <div className="text-right">
                          {appliedCoupon && discountAmount > 0 && (
                            <span className="text-xs text-slate-400 line-through mr-2 font-medium">
                              ${cartTotal.toLocaleString('es-AR')}
                            </span>
                          )}
                          <span className="text-2xl font-black text-blue-600">${finalTotal.toLocaleString('es-AR')}</span>
                        </div>
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

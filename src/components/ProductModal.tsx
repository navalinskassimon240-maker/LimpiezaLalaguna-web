import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, Star, ShieldCheck, Truck, Package, Droplets, Box, CheckCircle2, Sparkles, Plus, Minus } from 'lucide-react';
import { Product, ProductOption } from '../types';
import { useCart } from '../context/CartContext';
import { siteConfig } from '../data/config';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [mounted, setMounted] = useState(false);
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [selectedOption, setSelectedOption] = useState<ProductOption | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [comboCount, setComboCount] = useState<number>(1);

  const isCombo = Boolean(product?.category === 'Combos y Promos' || (product?.includes && product.includes.length > 0));

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Reset selected option when product changes
  useEffect(() => {
    if (product && product.options.length > 0) {
      setSelectedOption(product.options[0]);
      setCustomAmount('');
      setComboCount(1);
    }
  }, [product]);

  if (!mounted || !product || !selectedOption) return null;

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    
    if (val === '') {
      setSelectedOption(product.options[0]);
      return;
    }

    const numVal = parseInt(val, 10);
    if (!isNaN(numVal) && numVal > 0) {
      const unitText = product.unitType === 'litros' 
        ? (numVal === 1 ? 'Litro' : 'Litros')
        : (numVal === 1 ? 'Unidad' : 'Unidades');
      
      setSelectedOption({
        label: `${numVal} ${unitText}`,
        price: product.basePrice * numVal
      });
    }
  };

  const handlePresetSelect = (option: ProductOption) => {
    setSelectedOption(option);
    setCustomAmount('');
  };

  const isInvalidCustom = !isCombo && customAmount !== '' && (isNaN(parseInt(customAmount, 10)) || parseInt(customAmount, 10) <= 0);

  const handleAddToCart = () => {
    if (isInvalidCustom) return;
    
    if (isCombo) {
      // Add combo with unit price and comboCount as item quantity
      const comboOption: ProductOption = {
        label: product.options[0]?.label || `Combo Completo (${product.includes?.join(' + ') || 'Pack'})`,
        price: product.basePrice
      };
      addToCart(product, comboOption, comboCount);
    } else {
      addToCart(product, selectedOption, 1);
    }

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose(); // Auto close modal after a brief moment
    }, 1500);
  };

  const currentPrice = isCombo ? product.basePrice * comboCount : selectedOption.price;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-200 flex flex-col md:flex-row my-auto max-h-[90vh]"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-50 p-2 bg-white/90 hover:bg-white text-slate-700 rounded-full shadow-md transition-all active:scale-95"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Section */}
            <div className="md:w-2/5 relative h-40 sm:h-52 md:h-auto overflow-hidden bg-slate-100 shrink-0">
              <img 
                src={product.imageUrl} 
                alt={product.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=800';
                }}
                className="w-full h-full object-cover"
              />
              
              <div className="absolute bottom-3 left-3 z-20">
                <div className={`px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 font-bold text-xs ${
                  isCombo 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-white/95 text-blue-700'
                }`}>
                  {isCombo ? <Sparkles className="w-3.5 h-3.5" /> : product.unitType === 'litros' ? <Droplets className="w-3.5 h-3.5" /> : <Box className="w-3.5 h-3.5" />}
                  {isCombo ? 'Pack Todo Incluido' : 'Presentación'}
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="md:w-3/5 p-4 sm:p-6 flex flex-col justify-start relative bg-white overflow-y-auto flex-1">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-2">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-slate-400 text-xs ml-1.5">(4.9/5 Calidad)</span>
                </div>

                <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 mb-2 leading-tight">
                  {product.name}
                </h2>
                
                <div className="text-2xl sm:text-3xl font-black text-blue-600 mb-3 flex items-baseline gap-2">
                  ${currentPrice.toLocaleString('es-AR')}
                  <span className="text-xs sm:text-sm font-medium text-slate-400">
                    {isCombo ? `(${comboCount} ${comboCount === 1 ? 'pack' : 'packs'})` : `/ ${selectedOption.label}`}
                  </span>
                </div>

                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                  {product.description}
                </p>

                {/* 📦 COMBO ITEMS INCLUDED BOX */}
                {isCombo && product.includes && product.includes.length > 0 && (
                  <div className="mb-4 p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-950 font-bold mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{siteConfig.modalProducto.tituloIncluyeCombo}</span>
                    </div>
                    <div className="space-y-1 mb-2">
                      {product.includes.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 font-semibold text-slate-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity & Options Selector */}
                {isCombo ? (
                  <div className="mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-slate-800 block">Cantidad de Packs</span>
                      <span className="text-[11px] text-slate-500">Combos completos</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                      <button
                        type="button"
                        onClick={() => setComboCount(prev => Math.max(1, prev - 1))}
                        disabled={comboCount <= 1}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 flex items-center justify-center font-bold"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-5 text-center font-extrabold text-sm text-slate-900">{comboCount}</span>
                      <button
                        type="button"
                        onClick={() => setComboCount(prev => prev + 1)}
                        className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center font-bold shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Standard Product Options */
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                      {product.options.length > 1 ? siteConfig.modalProducto.tituloOpciones : 'Presentación'}
                    </h4>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {product.options.map((option) => (
                        <button
                          key={option.label}
                          type="button"
                          onClick={() => handlePresetSelect(option)}
                          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-bold transition-all border-2 text-xs sm:text-sm ${
                            selectedOption.label === option.label && customAmount === ''
                              ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-2">
                      <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                        ¿Otra cantidad?
                      </label>
                      <div className="relative flex-1">
                        <input 
                          type="number" 
                          min="1"
                          value={customAmount}
                          onChange={handleCustomAmountChange}
                          placeholder="Ej: 15"
                          className={`w-full pl-3 pr-8 py-1.5 border-2 rounded-xl text-xs sm:text-sm font-bold text-slate-900 bg-white focus:outline-none ${
                            customAmount !== '' 
                              ? isInvalidCustom 
                                ? 'border-red-400' 
                                : 'border-blue-600' 
                              : 'border-slate-200 focus:border-blue-400'
                          }`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                          {product.unitType === 'litros' ? 'L' : 'U'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="flex items-center gap-2 p-2 bg-blue-50/60 rounded-xl text-blue-700 text-xs">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span className="font-semibold">Garantía Total</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-blue-50/60 rounded-xl text-blue-700 text-xs">
                    <Truck className="w-4 h-4 shrink-0" />
                    <span className="font-semibold">Entrega Rápida</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isInvalidCustom}
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                    isAdded 
                      ? 'bg-emerald-600 text-white shadow-emerald-600/30' 
                      : isInvalidCustom
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      : isCombo
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                      : 'bg-slate-900 hover:bg-blue-600 text-white shadow-blue-600/30'
                  }`}
                >
                  {isAdded ? (
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 animate-bounce" />
                      <span>{siteConfig.modalProducto.textoAgregadoExito}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      <span>{isCombo 
                        ? `Añadir Combo ($${currentPrice.toLocaleString('es-AR')})` 
                        : `Añadir ${selectedOption.label}`}</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CartItem, Product, ProductOption, Coupon } from '../types';
import { subscribeCoupons } from '../services/storeService';
import { initialCoupons } from '../data/coupons';

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  addToCart: (product: Product, option: ProductOption, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  // Coupons & Discounts
  availableCoupons: Coupon[];
  appliedCoupon: Coupon | null;
  couponError: string | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  discountAmount: number;
  finalTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>(initialCoupons);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Subscribe to live coupons from Firestore
  useEffect(() => {
    const unsub = subscribeCoupons((coups) => {
      if (coups && Array.isArray(coups)) {
        setAvailableCoupons(coups);
        // If applied coupon was modified or disabled in DB, update local state
        setAppliedCoupon((prev) => {
          if (!prev) return null;
          const updated = coups.find(c => c.code.toUpperCase() === prev.code.toUpperCase());
          if (!updated || !updated.active) return null;
          return updated;
        });
      }
    });
    return () => unsub();
  }, []);

  const addToCart = (product: Product, option: ProductOption, quantityToAdd: number = 1) => {
    if (product.outOfStock) return;
    const cartItemId = `${product.id}-${option.label}`;
    setCartItems(prev => {
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map(item => 
          item.cartItemId === cartItemId 
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item
        );
      }
      
      const { options, ...productData } = product;
      return [...prev, { ...productData, cartItemId, selectedOption: option, quantity: quantityToAdd, price: option.price }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems(prev => 
      prev.map(item => 
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  const cartCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  // Discount Calculation logic
  const discountAmount = useMemo(() => {
    if (!appliedCoupon || cartTotal === 0) return 0;

    // Check minimum spend constraint
    if (appliedCoupon.minSpend && cartTotal < appliedCoupon.minSpend) {
      return 0;
    }

    if (appliedCoupon.appliesTo === 'combos') {
      // Calculate only on combos
      const comboTotal = cartItems
        .filter(item => item.category === 'Combos y Promos' || (item.includes && item.includes.length > 0))
        .reduce((sum, item) => sum + (item.price * item.quantity), 0);

      if (comboTotal === 0) return 0;

      if (appliedCoupon.discountType === 'percentage') {
        return Math.round((comboTotal * appliedCoupon.discountValue) / 100);
      } else {
        return Math.min(appliedCoupon.discountValue, comboTotal);
      }
    }

    // Applies to all products
    if (appliedCoupon.discountType === 'percentage') {
      return Math.round((cartTotal * appliedCoupon.discountValue) / 100);
    } else {
      return Math.min(appliedCoupon.discountValue, cartTotal);
    }
  }, [appliedCoupon, cartTotal, cartItems]);

  const finalTotal = Math.max(0, cartTotal - discountAmount);

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    setCouponError(null);

    if (!cleanCode) {
      const msg = 'Ingresá un código de cupón';
      setCouponError(msg);
      return { success: false, message: msg };
    }

    const found = availableCoupons.find(c => c.code.toUpperCase() === cleanCode);

    if (!found) {
      const msg = `El cupón "${cleanCode}" no es válido o no existe`;
      setCouponError(msg);
      return { success: false, message: msg };
    }

    if (!found.active) {
      const msg = `El cupón "${cleanCode}" se encuentra pausado o vencido`;
      setCouponError(msg);
      return { success: false, message: msg };
    }

    if (found.minSpend && cartTotal < found.minSpend) {
      const msg = `El cupón ${found.code} requiere una compra mínima de $${found.minSpend.toLocaleString('es-AR')} (tu carrito tiene $${cartTotal.toLocaleString('es-AR')})`;
      setCouponError(msg);
      return { success: false, message: msg };
    }

    if (found.appliesTo === 'combos') {
      const hasCombo = cartItems.some(item => item.category === 'Combos y Promos' || (item.includes && item.includes.length > 0));
      if (!hasCombo) {
        const msg = `El cupón ${found.code} es exclusivo para Combos y Promos. ¡Agregá un combo para aplicarlo!`;
        setCouponError(msg);
        return { success: false, message: msg };
      }
    }

    setAppliedCoupon(found);
    setCouponError(null);
    return { success: true, message: `¡Cupón ${found.code} aplicado con éxito!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
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
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

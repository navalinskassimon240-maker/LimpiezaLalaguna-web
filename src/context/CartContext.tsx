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
  // Cupones y Descuentos
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

  useEffect(() => {
    const unsub = subscribeCoupons((coups) => {
      if (coups && Array.isArray(coups)) {
        setAvailableCoupons(coups);
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
    // Ya NO abre el carrito a la fuerza. El usuario puede seguir agregando productos libremente.
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
    return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [cartItems]);

  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    setCouponError(null);
    if (!code || !code.trim()) {
      setCouponError('Ingresá un código');
      return { success: false, message: 'Ingresá un código' };
    }

    const cleanCode = code.trim().toUpperCase();
    const found = availableCoupons.find(c => c.code.toUpperCase() === cleanCode);

    if (!found) {
      const msg = 'Cupón inexistente o inválido';
      setCouponError(msg);
      return { success: false, message: msg };
    }

    if (!found.active) {
      const msg = 'Este cupón se encuentra inactivo';
      setCouponError(msg);
      return { success: false, message: msg };
    }

    if (found.minPurchase && cartTotal < found.minPurchase) {
      const msg = `Mínimo de compra requerido: $${found.minPurchase.toLocaleString('es-AR')}`;
      setCouponError(msg);
      return { success: false, message: msg };
    }

    setAppliedCoupon(found);
    return { success: true, message: `¡Cupón ${found.code} aplicado con éxito!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.minPurchase && cartTotal < appliedCoupon.minPurchase) {
      return 0;
    }

    if (appliedCoupon.type === 'percentage') {
      return Math.round((cartTotal * appliedCoupon.value) / 100);
    } else {
      return Math.min(appliedCoupon.value, cartTotal);
    }
  }, [appliedCoupon, cartTotal]);

  const finalTotal = useMemo(() => {
    return Math.max(0, cartTotal - discountAmount);
  }, [cartTotal, discountAmount]);

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
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
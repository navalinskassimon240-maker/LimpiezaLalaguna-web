
import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { AIConsultant } from './components/AIConsultant';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { Footer } from './components/Footer';
import { INITIAL_PRODUCTS } from './constants';
import { Product, CartItem, ProductCategory, User } from './types';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('lalaguna_inventory');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [savedAccounts, setSavedAccounts] = useState<User[]>(() => {
    const saved = localStorage.getItem('lalaguna_accounts');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [user, setUser] = useState<User | null>(() => {
    const active = localStorage.getItem('lalaguna_active_user');
    return active ? JSON.parse(active) : null;
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(!user);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'Todos'>('Todos');

  // Sincronizar cambios de inventario desde el admin
  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('lalaguna_inventory');
      if (saved) setProducts(JSON.parse(saved));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const visibleProducts = useMemo(() => {
    let filtered = products.filter(p => p.stock > 0);
    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    return filtered;
  }, [products, selectedCategory]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleLogin = (userData: User) => {
    setSavedAccounts(prev => {
      const others = prev.filter(a => a.email !== userData.email);
      const updated = [...others, userData];
      localStorage.setItem('lalaguna_accounts', JSON.stringify(updated));
      return updated;
    });
    setUser(userData);
    localStorage.setItem('lalaguna_active_user', JSON.stringify(userData));
    setIsAuthOpen(false);
  };

  return (
    <div id="inicio" className="min-h-screen flex flex-col bg-white">
      <Navbar 
        user={user}
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} 
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAI={() => setIsAIOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />
      
      <main className={`flex-grow transition-all duration-700 ${!user ? 'blur-xl grayscale' : ''}`}>
        <Hero />
        
        <section id="productos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">Catálogo <span className="text-blue-600">Lalaguna</span></h2>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {['Todos', ...Object.values(ProductCategory)].map((cat) => (
                <button key={cat} onClick={() => setSelectedCategory(cat as any)} className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          {visibleProducts.length === 0 ? (
            <div className="py-20 text-center">
              <i className="fas fa-box-open text-6xl text-slate-100 mb-4"></i>
              <p className="text-slate-400 font-bold uppercase tracking-widest">No hay productos disponibles en esta categoría.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {visibleProducts.map(p => <ProductCard key={p.id} product={p} onAddToCart={addToCart} />)}
            </div>
          )}
        </section>
      </main>

      <Footer />
      
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} onUpdateQuantity={(id, delta) => setCart(prev => prev.map(i => i.id === id ? {...i, quantity: Math.max(1, i.quantity + delta)} : i))} onRemove={(id) => setCart(prev => prev.filter(i => i.id !== id))} onClearCart={() => setCart([])} />
      <AIConsultant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} user={user} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLogin={handleLogin} />
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        user={user} 
        savedAccounts={savedAccounts} 
        products={products}
        onLogout={() => { setUser(null); localStorage.removeItem('lalaguna_active_user'); setIsAuthOpen(true); setIsProfileOpen(false); }} 
        onSwitch={(e) => { const u = savedAccounts.find(a => a.email === e); if(u) { setUser(u); localStorage.setItem('lalaguna_active_user', JSON.stringify(u)); } setIsProfileOpen(false); }}
        onUpdateStock={() => {}} // Ya no se gestiona desde aquí
        onAddProduct={() => {}} // Ya no se gestiona desde aquí
        onToggleSub={() => {}} 
      />
    </div>
  );
};

export default App;

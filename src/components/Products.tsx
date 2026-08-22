import React, { useState, useMemo } from 'react';
import { ShoppingBag, ShoppingCart, Eye, Search, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { ProductModal } from './ProductModal';
import { Product } from '../types';
import { siteConfig } from '../data/config';
import { products } from '../data/products';

export function Products() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[];
    return ['Todos', ...unique];
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory;
      const matchSearch = searchTerm.trim() === '' || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.includes && p.includes.some(inc => inc.toLowerCase().includes(searchTerm.toLowerCase())));
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchTerm]);

  return (
    <section id="productos" className="py-24 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 perspective-1000">
        
        <motion.div 
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4 shadow-inner">
            <ShoppingBag className="h-6 w-6 text-blue-700" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 drop-shadow-sm">{siteConfig.catalogo.titulo}</h2>
          <p className="text-lg text-slate-600 mb-6">
            {siteConfig.catalogo.descripcion}
          </p>

          {/* Search bar */}
          <div className="relative max-w-md mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder={siteConfig.catalogo.placeholderBuscador}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-slate-800 placeholder-slate-400 font-medium"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105'
                    : 'bg-white/80 backdrop-blur-md text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-slate-200'
                }`}
              >
                {cat === 'Combos y Promos' ? '🔥 Combos y Promos' : cat}
              </button>
            ))}
          </div>
        </motion.div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white/60 backdrop-blur-md rounded-3xl border border-slate-200 max-w-md mx-auto">
            <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">No encontramos productos</h3>
            <p className="text-sm text-slate-500 mt-1">Intenta con otra búsqueda o categoría</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => {
                const isCombo = Boolean(product.category === 'Combos y Promos' || (product.includes && product.includes.length > 0));

                return (
                  <motion.div
                    key={product.id}
                    layout
                    onClick={() => setSelectedProduct(product)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -10, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className={`bg-white/90 backdrop-blur-xl rounded-3xl border p-5 shadow-xl transition-all flex flex-col h-full transform-style-3d group relative cursor-pointer ${
                      isCombo 
                        ? 'border-emerald-300/80 shadow-emerald-900/10 hover:border-emerald-500 hover:shadow-emerald-900/20' 
                        : 'border-slate-200 shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-900/20 hover:border-blue-300'
                    }`}
                  >
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-emerald-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    
                    <div className="aspect-video bg-slate-100 rounded-2xl mb-4 overflow-hidden relative shadow-inner">
                      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-500 ease-out"
                      />
                      
                      {/* Combo Badge on top of image */}
                      {isCombo && (
                        <div className="absolute top-2.5 left-2.5 z-20 bg-emerald-600 text-white text-[11px] font-black uppercase px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-200" />
                          <span>Pack Completo</span>
                        </div>
                      )}

                      {/* Floating View & Add Buttons on Image Hover */}
                      <div className="absolute inset-0 z-20 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-4 py-2.5 rounded-full shadow-xl text-white transition-colors flex items-center gap-2 font-bold text-sm ${
                            isCombo ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          <Eye className="w-4 h-4" /> {isCombo ? 'Ver Combo' : 'Ver Producto'}
                        </motion.button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col flex-grow relative z-10">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className={`text-base font-bold leading-tight pr-2 transition-colors ${
                          isCombo ? 'text-slate-900 group-hover:text-emerald-700' : 'text-slate-900 group-hover:text-blue-700'
                        }`}>
                          {product.name}
                        </h3>
                        <span className={`font-extrabold whitespace-nowrap px-2.5 py-1 rounded-lg shadow-sm border flex flex-col items-center leading-none shrink-0 ${
                          isCombo 
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                            : 'text-blue-600 bg-blue-50 border-blue-100/50'
                        }`}>
                          <span className="text-[9px] uppercase tracking-wider mb-0.5 opacity-70">
                            {isCombo ? 'Total Pack' : 'Precio'}
                          </span>
                          <span className="text-sm">${product.basePrice.toLocaleString('es-AR')}</span>
                        </span>
                      </div>

                      <p className="text-slate-500 text-xs flex-grow line-clamp-2 mb-3">
                        {product.description}
                      </p>

                      {/* Includes preview for combos */}
                      {isCombo && product.includes && (
                        <div className="mb-3 p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-200/80 text-[11px] text-emerald-950 space-y-1">
                          <span className="font-bold block text-[10px] uppercase text-emerald-800 tracking-wider">Incluye todo el pack:</span>
                          {product.includes.map((inc, i) => (
                            <div key={i} className="flex items-center gap-1 line-clamp-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="truncate">{inc}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(product);
                        }}
                        className={`mt-auto flex items-center justify-center gap-2 w-full py-2.5 text-white font-semibold text-sm rounded-xl transition-colors shadow-md ${
                          isCombo
                            ? 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-600/30'
                            : 'bg-slate-900 hover:bg-blue-600 hover:shadow-blue-500/40'
                        }`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {isCombo ? 'Comprar Combo Completo' : 'Comprar Producto'}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <ProductModal 
        product={selectedProduct} 
        isOpen={selectedProduct !== null} 
        onClose={() => setSelectedProduct(null)} 
      />
    </section>
  );
}


import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div className="group flex flex-col transition-all duration-500 hover:-translate-y-2">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-slate-100 shadow-sm border border-slate-100">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
        />
        <div className="absolute top-5 left-5">
          <span className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl text-[9px] font-black text-slate-900 uppercase tracking-[0.15em] shadow-xl border border-white/20">
            {product.category}
          </span>
        </div>
        
        {/* Overlay de acción rápida */}
        <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <button 
            onClick={() => onAddToCart(product)}
            className="w-full py-5 bg-white text-slate-900 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-3"
          >
            <i className="fas fa-shopping-basket"></i>
            Agregar al Carrito
          </button>
        </div>
      </div>
      
      <div className="mt-6 px-2">
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-xl font-black text-slate-900 tracking-tighter leading-tight group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <span className="text-xl font-black text-slate-900 shrink-0">
            ${product.price}
          </span>
        </div>
        <p className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
          <i className="fas fa-tag text-[8px] text-blue-500"></i>
          {product.unit} • Garantía Lalaguna
        </p>
      </div>
    </div>
  );
};

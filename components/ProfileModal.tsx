
import React, { useState } from 'react';
import { User, Product, ProductCategory } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  savedAccounts: User[];
  products: Product[];
  onLogout: () => void;
  onSwitch: (email: string) => void;
  onToggleSub: () => void;
  onUpdateStock: (id: string, newStock: number) => void;
  onAddProduct: (product: Product) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ 
  isOpen, onClose, user, savedAccounts, products, onLogout, onSwitch, onToggleSub, onUpdateStock, onAddProduct 
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'inventory'>('profile');
  const [newProd, setNewProd] = useState({
    name: '',
    description: '',
    price: '',
    unit: '',
    stock: '',
    category: ProductCategory.BATHROOM
  });

  if (!isOpen || !user) return null;

  const initials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const handleCreateProduct = () => {
    if (!newProd.name || !newProd.price || !newProd.stock) {
      alert("Por favor rellena los campos obligatorios: Nombre, Precio y Stock.");
      return;
    }

    // Generar nombre de archivo automático (ej: Lavandina -> imagenes/lavandina.jpg)
    const fileName = newProd.name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quitar acentos
      .replace(/\s+/g, '-');
    
    const autoImagePath = `/imagenes/${fileName}.jpg`;

    const product: Product = {
      id: `prod-${Date.now()}`,
      name: newProd.name,
      description: newProd.description || 'Producto de alta calidad',
      price: Number(newProd.price),
      unit: newProd.unit || '1 Unidad',
      stock: Number(newProd.stock),
      category: newProd.category,
      image: autoImagePath
    };

    onAddProduct(product);
    setNewProd({ name: '', description: '', price: '', unit: '', stock: '', category: ProductCategory.BATHROOM });
    alert(`¡Producto registrado! \n\nInstrucciones para el creador:\n1. Busca o crea una imagen.\n2. Cámbiale el nombre a: ${fileName}.jpg\n3. Ponla en la carpeta "imagenes" de tu proyecto.\n\nLa web la mostrará automáticamente.`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-lg h-full sm:h-[90vh] sm:rounded-[3.5rem] overflow-hidden shadow-2xl animate-in zoom-in slide-in-from-bottom-10 duration-300 flex flex-col">
        
        {/* Header Fijo */}
        <div className="shrink-0 bg-slate-900 text-white p-8 pb-4">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <i className="fas fa-user-gear"></i>
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter">Panel de Control</h2>
                <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest">Gestión Lalaguna</p>
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-6">
            <button 
              onClick={() => setActiveTab('profile')} 
              className={`text-[10px] font-black uppercase tracking-[0.2em] pb-3 border-b-2 transition-all ${activeTab === 'profile' ? 'text-blue-400 border-blue-400' : 'text-slate-500 border-transparent'}`}
            >
              Mi Perfil
            </button>
            {user.role === 'admin' && (
              <button 
                onClick={() => setActiveTab('inventory')} 
                className={`text-[10px] font-black uppercase tracking-[0.2em] pb-3 border-b-2 transition-all ${activeTab === 'inventory' ? 'text-blue-400 border-blue-400' : 'text-slate-500 border-transparent'}`}
              >
                Inventario
              </button>
            )}
          </div>
        </div>

        {/* Cuerpo con Scroll */}
        <div className="flex-grow overflow-y-auto px-8 py-8 bg-slate-50">
          {activeTab === 'profile' ? (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-[2.5rem] bg-blue-600 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden mb-4">
                  {user.photoUrl ? (
                    <img src={user.photoUrl} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <span className="text-white text-3xl font-black">{initials(user.name)}</span>
                  )}
                </div>
                <h3 className="text-2xl font-black text-slate-900 leading-none mb-1">{user.name}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{user.email}</p>
                <span className="mt-3 px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-widest">Cuenta Verificada</span>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-200 pb-2">Cuentas Guardadas</h4>
                {savedAccounts.length <= 1 ? (
                  <p className="text-[10px] text-slate-400 italic">No hay otras cuentas registradas en este dispositivo.</p>
                ) : (
                  savedAccounts.filter(a => a.email !== user.email).map(acc => (
                    <button key={acc.email} onClick={() => onSwitch(acc.email)} className="w-full p-4 rounded-2xl bg-white border border-slate-200 flex items-center gap-4 hover:border-blue-400 transition-all group">
                      <img src={acc.photoUrl} className="w-10 h-10 rounded-xl object-cover" alt="" />
                      <div className="flex-grow text-left">
                        <p className="font-bold text-sm text-slate-700">{acc.name}</p>
                        <p className="text-[10px] text-slate-400">{acc.email}</p>
                      </div>
                      <i className="fas fa-arrow-right text-slate-200 group-hover:text-blue-500 transition-colors"></i>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-12 animate-in fade-in duration-500 pb-10">
              {/* Formulario */}
              <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                  Nuevo Artículo
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <input 
                      value={newProd.name} 
                      onChange={e => setNewProd({...newProd, name: e.target.value})} 
                      placeholder="Nombre del Producto (ej: Lavandina)" 
                      className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium" 
                    />
                  </div>
                  <div>
                    <input 
                      type="number" 
                      value={newProd.price} 
                      onChange={e => setNewProd({...newProd, price: e.target.value})} 
                      placeholder="Precio ($)" 
                      className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                    />
                  </div>
                  <div>
                    <input 
                      type="number" 
                      value={newProd.stock} 
                      onChange={e => setNewProd({...newProd, stock: e.target.value})} 
                      placeholder="Stock inicial" 
                      className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                    />
                  </div>
                  <div className="col-span-2">
                    <select 
                      value={newProd.category} 
                      onChange={e => setNewProd({...newProd, category: e.target.value as ProductCategory})} 
                      className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-slate-500 appearance-none"
                    >
                      {Object.values(ProductCategory).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <button 
                  onClick={handleCreateProduct} 
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                >
                  Guardar en Inventario
                </button>
              </div>

              {/* Lista de Gestión */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-200 pb-2 flex justify-between">
                  Listado Actual <span>{products.length} Items</span>
                </h3>
                <div className="space-y-3">
                  {products.map(p => (
                    <div key={p.id} className="p-4 rounded-3xl bg-white border border-slate-200 flex items-center gap-4 group hover:border-blue-200 transition-all">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 border border-slate-50">
                        <img 
                          src={p.image} 
                          className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all" 
                          alt="" 
                          onError={(e) => { (e.target as any).src = 'https://placehold.co/100x100?text=SINFOTO'; }}
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-black text-xs text-slate-900 truncate uppercase tracking-tighter">{p.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${p.stock <= 5 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                            {p.stock <= 0 ? 'Sin Stock' : `${p.stock} Litros/Un.`}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => onUpdateStock(p.id, Math.max(0, p.stock - 5))} 
                          className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center text-xs"
                        >
                          -5
                        </button>
                        <button 
                          onClick={() => onUpdateStock(p.id, p.stock + 5)} 
                          className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center justify-center text-xs"
                        >
                          +5
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Fijo */}
        <div className="shrink-0 p-8 bg-white border-t border-slate-100">
          <button 
            onClick={onLogout} 
            className="w-full py-5 rounded-[1.5rem] bg-red-50 text-red-500 font-black uppercase text-[10px] tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all shadow-sm"
          >
            Cerrar Sesión Activa
          </button>
        </div>
      </div>
    </div>
  );
};

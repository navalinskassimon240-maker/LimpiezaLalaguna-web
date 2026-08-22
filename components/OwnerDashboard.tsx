
import React, { useState, useEffect } from 'react';
import { Product, User, ProductCategory, Promotion } from '../types';

interface OwnerDashboardProps {
  products: Product[];
  users: User[];
  onExit: () => void;
  onUpdateProducts: (products: Product[]) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ products, users, onExit, onUpdateProducts }) => {
  const [activeSection, setActiveSection] = useState<'inventory' | 'promos' | 'stats'>('inventory');
  const [onlineCount, setOnlineCount] = useState(Math.floor(Math.random() * 15) + 5);
  
  // Formulario Nuevo Producto
  const [newProd, setNewProd] = useState({ name: '', price: '', stock: '', category: ProductCategory.BATHROOM, unit: '1 Litro' });
  
  // Formulario Promo
  const [promo, setPromo] = useState({ title: '', message: '', image: '' });
  const [isSendingPromo, setIsSendingPromo] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(prev => Math.max(1, prev + (Math.random() > 0.5 ? 1 : -1)));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAddProduct = () => {
    if(!newProd.name || !newProd.price || !newProd.stock) return;
    
    const fileName = newProd.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
    const product: Product = {
      id: `owner-${Date.now()}`,
      name: newProd.name,
      description: 'Cargado por el dueño',
      price: Number(newProd.price),
      stock: Number(newProd.stock),
      unit: newProd.unit,
      category: newProd.category,
      image: `/imagenes/${fileName}.jpg`
    };

    onUpdateProducts([product, ...products]);
    setNewProd({ name: '', price: '', stock: '', category: ProductCategory.BATHROOM, unit: '1 Litro' });
    alert(`¡Éxito! Imagen vinculada: imagenes/${fileName}.jpg`);
  };

  const deleteProduct = (id: string) => {
    if(window.confirm("¿Eliminar este producto de la tienda?")) {
      onUpdateProducts(products.filter(p => p.id !== id));
    }
  };

  const updateStock = (id: string, delta: number) => {
    onUpdateProducts(products.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p));
  };

  const sendPromo = () => {
    if(!promo.title || !promo.message) return;
    setIsSendingPromo(true);
    
    // Simulación de envío a todos los correos
    setTimeout(() => {
      setIsSendingPromo(false);
      alert(`¡Promoción enviada con éxito a ${users.length} correos electrónicos registrados!`);
      setPromo({ title: '', message: '', image: '' });
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans">
      {/* Header Admin */}
      <header className="bg-slate-900 border-b border-white/5 p-6 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
            <i className="fas fa-crown text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter">LimpiezaLalaguna</h1>
            <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.3em]">Owner Control Room</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{onlineCount} Online</span>
            </div>
            <div className="w-[1px] h-6 bg-white/10"></div>
            <div className="flex items-center gap-2">
              <i className="fas fa-users text-slate-500 text-xs"></i>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{users.length} Clientes</span>
            </div>
          </div>
          <button onClick={onExit} className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Salir a la Web</button>
        </div>
      </header>

      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar */}
        <aside className="w-20 md:w-64 bg-slate-900 border-r border-white/5 p-4 flex flex-col gap-2 shrink-0">
          <button onClick={() => setActiveSection('inventory')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeSection === 'inventory' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
            <i className="fas fa-boxes-stacked w-5"></i>
            <span className="hidden md:inline font-bold text-xs uppercase tracking-widest">Inventario</span>
          </button>
          <button onClick={() => setActiveSection('promos')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeSection === 'promos' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
            <i className="fas fa-bullhorn w-5"></i>
            <span className="hidden md:inline font-bold text-xs uppercase tracking-widest">Promociones</span>
          </button>
          <button onClick={() => setActiveSection('stats')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeSection === 'stats' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
            <i className="fas fa-chart-line w-5"></i>
            <span className="hidden md:inline font-bold text-xs uppercase tracking-widest">Estadísticas</span>
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-grow overflow-y-auto p-6 md:p-12 no-scrollbar bg-[#080808]">
          
          {activeSection === 'inventory' && (
            <div className="space-y-12 animate-in fade-in duration-500">
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
                <div>
                  <h2 className="text-4xl font-black uppercase tracking-tighter">Gestión de <span className="text-blue-500">Stock</span></h2>
                  <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest font-bold">Añade o edita productos de LimpiezaLalaguna</p>
                </div>
              </header>

              {/* Formulario Add */}
              <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-8 space-y-8">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-400 flex items-center gap-3">
                  <i className="fas fa-plus-circle"></i> Nuevo Producto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-500">Nombre Comercial</label>
                    <input value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} placeholder="Ej: Jabón Liquido VIP" className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-500">Precio ($)</label>
                    <input type="number" value={newProd.price} onChange={e => setNewProd({...newProd, price: e.target.value})} placeholder="0.00" className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-500">Stock Inicial</label>
                    <input type="number" value={newProd.stock} onChange={e => setNewProd({...newProd, stock: e.target.value})} placeholder="50" className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-500">Unidad de Venta</label>
                    <input value={newProd.unit} onChange={e => setNewProd({...newProd, unit: e.target.value})} placeholder="Ej: 1 Litro / 5 Kilos / Unidad" className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-500">Categoría</label>
                    <select value={newProd.category} onChange={e => setNewProd({...newProd, category: e.target.value as ProductCategory})} className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm">
                      {Object.values(ProductCategory).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={handleAddProduct} className="w-full bg-blue-600 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/10">Publicar en Tienda</button>
              </div>

              {/* Lista Productos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map(p => (
                  <div key={p.id} className="bg-slate-900/30 border border-white/5 p-4 rounded-3xl flex items-center gap-6 group hover:border-blue-500/30 transition-all">
                    <div className="w-20 h-20 bg-black rounded-2xl overflow-hidden shrink-0">
                      <img src={p.image} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all" alt="" onError={(e) => (e.target as any).src = 'https://placehold.co/200x200?text=Subir+Foto'} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-black text-sm uppercase truncate leading-none mb-2">{p.name}</h4>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{p.category} • ${p.price}</p>
                      <div className="mt-3 flex items-center gap-2">
                         <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${p.stock <= 5 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                           {p.stock} {p.unit.split(' ')[1] || 'Un.'} Disp.
                         </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-1">
                        <button onClick={() => updateStock(p.id, -5)} className="w-8 h-8 bg-white/5 rounded-lg text-[9px] font-bold hover:bg-red-500/20">-5</button>
                        <button onClick={() => updateStock(p.id, 5)} className="w-8 h-8 bg-white/5 rounded-lg text-[9px] font-bold hover:bg-blue-500/20">+5</button>
                      </div>
                      <button onClick={() => deleteProduct(p.id)} className="w-full h-8 bg-red-500/10 text-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Borrar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'promos' && (
            <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-500">
              <header className="text-center">
                <h2 className="text-4xl font-black uppercase tracking-tighter">Broadcast de <span className="text-emerald-500">Promos</span></h2>
                <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest font-bold">Envía un mensaje a todos los clientes de LimpiezaLalaguna</p>
              </header>

              <div className="bg-slate-900 border border-white/5 rounded-[3rem] p-10 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><i className="fas fa-envelope-open-text text-[10rem]"></i></div>
                
                <div className="space-y-6 relative z-10">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Asunto del Correo</label>
                    <input value={promo.title} onChange={e => setPromo({...promo, title: e.target.value})} placeholder="Ej: ¡Súper Oferta de Lavandina!" className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl outline-none focus:border-emerald-500 transition-all text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">URL de la Imagen (Opcional)</label>
                    <input value={promo.image} onChange={e => setPromo({...promo, image: e.target.value})} placeholder="https://..." className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl outline-none focus:border-emerald-500 transition-all text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Mensaje para tus Clientes</label>
                    <textarea value={promo.message} onChange={e => setPromo({...promo, message: e.target.value})} placeholder="Escribe aquí tu promoción detallada..." className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl outline-none focus:border-emerald-500 transition-all text-sm h-48 resize-none" />
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                   <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest italic">Este mensaje llegará a {users.length} usuarios registrados.</p>
                   <button 
                    disabled={isSendingPromo || !promo.title || !promo.message}
                    onClick={sendPromo} 
                    className={`w-full py-6 rounded-2xl font-black uppercase text-xs tracking-[0.4em] transition-all flex items-center justify-center gap-4 ${isSendingPromo ? 'bg-slate-800' : 'bg-emerald-600 hover:bg-emerald-700 shadow-2xl shadow-emerald-500/20'}`}
                   >
                     {isSendingPromo ? (
                       <><i className="fas fa-circle-notch animate-spin"></i> Lanzando Correo...</>
                     ) : (
                       <><i className="fas fa-paper-plane"></i> Lanzar Promo Ahora</>
                     )}
                   </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'stats' && (
            <div className="space-y-12 animate-in fade-in duration-500">
               <h2 className="text-4xl font-black uppercase tracking-tighter">Análisis de <span className="text-blue-500">Métricas</span></h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-slate-900 p-8 rounded-[2rem] border border-white/5 flex flex-col items-center text-center">
                   <i className="fas fa-eye text-blue-500 text-3xl mb-4"></i>
                   <span className="text-4xl font-black">{onlineCount}</span>
                   <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-2">Usuarios en vivo</span>
                 </div>
                 <div className="bg-slate-900 p-8 rounded-[2rem] border border-white/5 flex flex-col items-center text-center">
                   <i className="fas fa-user-check text-emerald-500 text-3xl mb-4"></i>
                   <span className="text-4xl font-black">{users.length}</span>
                   <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-2">Registrados totales</span>
                 </div>
                 <div className="bg-slate-900 p-8 rounded-[2rem] border border-white/5 flex flex-col items-center text-center">
                   <i className="fas fa-box text-amber-500 text-3xl mb-4"></i>
                   <span className="text-4xl font-black">{products.length}</span>
                   <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-2">Productos activos</span>
                 </div>
               </div>
               
               <div className="bg-slate-900 p-10 rounded-[3rem] border border-white/5">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">Actividad Reciente de Clientes</h4>
                 <div className="space-y-4">
                   {users.slice(0, 5).map(u => (
                     <div key={u.id} className="flex justify-between items-center py-4 border-b border-white/5">
                       <div className="flex items-center gap-4">
                         <img src={u.photoUrl} className="w-8 h-8 rounded-lg" alt="" />
                         <div>
                           <p className="text-xs font-bold">{u.name}</p>
                           <p className="text-[9px] text-slate-500 uppercase">{u.email}</p>
                         </div>
                       </div>
                       <span className="text-[8px] bg-white/5 px-2 py-1 rounded text-slate-400 uppercase font-black">Online</span>
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

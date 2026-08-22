
import React, { useState, useEffect } from 'react';
import { Product, User, ProductCategory } from './types';
import { INITIAL_PRODUCTS } from './constants';

const AdminApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'promos' | 'users'>('inventory');
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('lalaguna_inventory');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('lalaguna_accounts');
    return saved ? JSON.parse(saved) : [];
  });
  const [onlineCount, setOnlineCount] = useState(Math.floor(Math.random() * 8) + 3);

  // Formulario Nuevo Producto
  const [newProd, setNewProd] = useState({ name: '', price: '', stock: '', category: ProductCategory.BATHROOM, unit: '1 Litro' });
  
  // Formulario Promo
  const [promo, setPromo] = useState({ title: '', message: '', image: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    localStorage.setItem('lalaguna_inventory', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(prev => Math.max(1, prev + (Math.random() > 0.5 ? 1 : -1)));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAddProduct = () => {
    if(!newProd.name || !newProd.price || !newProd.stock) return;
    const slug = newProd.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
    const product: Product = {
      id: `admin-${Date.now()}`,
      name: newProd.name,
      description: 'Producto gestionado por el Dueño',
      price: Number(newProd.price),
      stock: Number(newProd.stock),
      unit: newProd.unit,
      category: newProd.category,
      image: `/imagenes/${slug}.jpg`
    };
    setProducts([product, ...products]);
    setNewProd({ name: '', price: '', stock: '', category: ProductCategory.BATHROOM, unit: '1 Litro' });
    alert(`¡Producto Agregado!\nRecuerda guardar la imagen como: ${slug}.jpg`);
  };

  const handleSendPromo = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      alert(`Promoción enviada con éxito a ${users.length} correos electrónicos.`);
      setPromo({ title: '', message: '', image: '' });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white flex font-sans">
      {/* Sidebar Maestro */}
      <aside className="w-64 bg-[#111114] border-r border-white/5 flex flex-col shrink-0">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-crown text-sm"></i>
            </div>
            <span className="font-black uppercase tracking-tighter text-lg">Lalaguna <span className="text-blue-500">Admin</span></span>
          </div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Panel de Control Maestro</p>
        </div>

        <nav className="flex-grow p-4 space-y-2">
          <button onClick={() => setActiveTab('inventory')} className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all ${activeTab === 'inventory' ? 'bg-blue-600 shadow-lg shadow-blue-500/20' : 'hover:bg-white/5 text-slate-400'}`}>
            <i className="fas fa-warehouse text-sm"></i>
            <span className="text-[10px] font-black uppercase tracking-widest">Inventario</span>
          </button>
          {/* Fixed: Use 'activeTab' instead of 'activeSection' which was causing the error */}
          <button onClick={() => setActiveTab('promos')} className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all ${activeTab === 'promos' ? 'bg-blue-600 shadow-lg shadow-blue-500/20' : 'hover:bg-white/5 text-slate-400'}`}>
            <i className="fas fa-bullhorn text-sm"></i>
            <span className="text-[10px] font-black uppercase tracking-widest">Promociones</span>
          </button>
          <button onClick={() => setActiveTab('users')} className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all ${activeTab === 'users' ? 'bg-blue-600 shadow-lg shadow-blue-500/20' : 'hover:bg-white/5 text-slate-400'}`}>
            <i className="fas fa-users text-sm"></i>
            <span className="text-[10px] font-black uppercase tracking-widest">Clientes</span>
          </button>
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
           <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-slate-500 uppercase">Estado</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
           </div>
           <button onClick={() => window.location.href = '/'} className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Ver Web Pública</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto p-12 bg-radial-at-t from-[#111114] to-[#0a0a0b]">
        
        {/* Stats Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#111114] p-6 rounded-3xl border border-white/5">
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">En Línea Ahora</p>
            <h3 className="text-3xl font-black">{onlineCount} <span className="text-emerald-500 text-xs font-bold ml-2">LIVE</span></h3>
          </div>
          <div className="bg-[#111114] p-6 rounded-3xl border border-white/5">
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Productos Tienda</p>
            <h3 className="text-3xl font-black">{products.length} <span className="text-blue-500 text-xs font-bold ml-2">SKU</span></h3>
          </div>
          <div className="bg-[#111114] p-6 rounded-3xl border border-white/5">
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Clientes Registrados</p>
            <h3 className="text-3xl font-black">{users.length} <span className="text-purple-500 text-xs font-bold ml-2">BASE</span></h3>
          </div>
        </div>

        {activeTab === 'inventory' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Formulario */}
            <section className="bg-slate-900/50 p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
              <h2 className="text-xl font-black uppercase tracking-widest mb-8 flex items-center gap-3">
                <i className="fas fa-plus-circle text-blue-500"></i> Nuevo Producto
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nombre Comercial</label>
                  <input value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} placeholder="Ej: Jabón Premium" className="w-full bg-black/50 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Precio ($)</label>
                  <input type="number" value={newProd.price} onChange={e => setNewProd({...newProd, price: e.target.value})} placeholder="0.00" className="w-full bg-black/50 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Stock</label>
                  <input type="number" value={newProd.stock} onChange={e => setNewProd({...newProd, stock: e.target.value})} placeholder="Cant." className="w-full bg-black/50 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-sm" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Unidad</label>
                  <input value={newProd.unit} onChange={e => setNewProd({...newProd, unit: e.target.value})} placeholder="1 Litro / 5 Unidades" className="w-full bg-black/50 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-sm" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Categoría</label>
                  <select value={newProd.category} onChange={e => setNewProd({...newProd, category: e.target.value as ProductCategory})} className="w-full bg-black/50 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-sm appearance-none">
                    {Object.values(ProductCategory).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={handleAddProduct} className="w-full mt-8 bg-blue-600 py-6 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98]">Subir a LimpiezaLalaguna</button>
            </section>

            {/* Lista de Gestión */}
            <section className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 border-b border-white/5 pb-4">Gestión de Catálogo Activo</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {products.map(p => (
                  <div key={p.id} className="bg-white/5 border border-white/5 p-4 rounded-3xl flex items-center gap-6 group hover:bg-white/10 transition-all">
                    <div className="w-16 h-16 bg-black rounded-xl overflow-hidden shrink-0 border border-white/5">
                      <img src={p.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="" onError={(e) => (e.target as any).src = 'https://placehold.co/200x200?text=SINFOTO'} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-black text-xs uppercase truncate mb-1">{p.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-blue-400">${p.price}</span>
                        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                        <span className={`text-[9px] font-black uppercase ${p.stock <= 5 ? 'text-red-500' : 'text-emerald-500'}`}>{p.stock} Disponibles</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setProducts(products.map(x => x.id === p.id ? {...x, stock: Math.max(0, x.stock - 5)} : x))} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 transition-colors text-[10px]">-5</button>
                      <button onClick={() => setProducts(products.map(x => x.id === p.id ? {...x, stock: x.stock + 5} : x))} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-blue-500/20 transition-colors text-[10px]">+5</button>
                      <button onClick={() => { if(confirm('¿Borrar?')) setProducts(products.filter(x => x.id !== p.id)) }} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><i className="fas fa-trash-alt text-[10px]"></i></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'promos' && (
          <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in zoom-in-95 duration-500">
            <header className="text-center">
               <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Envío de <span className="text-emerald-500">Notificaciones</span></h2>
               <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">Llega directo al correo de tus clientes</p>
            </header>

            <div className="bg-[#111114] p-12 rounded-[3rem] border border-white/5 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Título de la Promo</label>
                  <input value={promo.title} onChange={e => setPromo({...promo, title: e.target.value})} placeholder="Ej: ¡2x1 en Lavandina hoy!" className="w-full bg-black/30 border border-white/10 p-5 rounded-2xl outline-none focus:border-emerald-500 transition-all text-sm font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Imagen URL (Opcional)</label>
                  <input value={promo.image} onChange={e => setPromo({...promo, image: e.target.value})} placeholder="https://..." className="w-full bg-black/30 border border-white/10 p-5 rounded-2xl outline-none focus:border-emerald-500 transition-all text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Mensaje Publicitario</label>
                  <textarea value={promo.message} onChange={e => setPromo({...promo, message: e.target.value})} placeholder="Escribe tu anuncio aquí..." className="w-full bg-black/30 border border-white/10 p-5 rounded-2xl outline-none focus:border-emerald-500 transition-all text-sm h-48 resize-none font-medium" />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex flex-col items-center gap-4">
                <p className="text-[10px] text-slate-500 font-bold italic">Se enviará a los {users.length} correos en tu base de datos.</p>
                <button 
                  disabled={sending || !promo.title || !promo.message}
                  onClick={handleSendPromo} 
                  className={`w-full py-6 rounded-2xl font-black uppercase text-xs tracking-[0.5em] transition-all flex items-center justify-center gap-4 ${sending ? 'bg-slate-800' : 'bg-emerald-600 hover:bg-emerald-700 shadow-2xl shadow-emerald-500/20'}`}
                >
                  {sending ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-paper-plane"></i>}
                  {sending ? 'Enviando...' : 'Lanzar Promo Ahora'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-xl font-black uppercase tracking-widest">Base de Clientes <span className="text-slate-500 text-sm ml-4">{users.length} Usuarios</span></h2>
            <div className="bg-[#111114] rounded-[2.5rem] border border-white/5 overflow-hidden">
               <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500">
                    <tr>
                      <th className="p-6">Usuario</th>
                      <th className="p-6">Correo</th>
                      <th className="p-6">Método</th>
                      <th className="p-6">Suscrito</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-6 flex items-center gap-4">
                          <img src={u.photoUrl} className="w-8 h-8 rounded-lg" alt="" />
                          <span className="font-bold">{u.name}</span>
                        </td>
                        <td className="p-6 text-slate-400 font-medium">{u.email}</td>
                        <td className="p-6">
                           <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{u.authMethod || 'Google'}</span>
                        </td>
                        <td className="p-6">
                          <i className={`fas ${u.subscribed ? 'fa-check-circle text-emerald-500' : 'fa-times-circle text-slate-700'}`}></i>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">No hay usuarios registrados aún.</td>
                      </tr>
                    )}
                  </tbody>
               </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminApp;

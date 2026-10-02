import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit3, 
  Camera, 
  Image as ImageIcon, 
  Check, 
  X, 
  Search, 
  Lock, 
  Unlock, 
  ExternalLink, 
  Sparkles, 
  Megaphone, 
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Key,
  Smartphone,
  Monitor,
  RotateCcw,
  BookmarkPlus,
  History,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { Product, ProductOption } from '../types';
import { products as initialProducts } from '../data/products';
import { 
  subscribeProducts, 
  saveProduct, 
  deleteProduct, 
  subscribeAnnouncements, 
  saveAnnouncement, 
  deleteAnnouncement, 
  verifyAdminPin, 
  setAdminPin,
  restoreAllInitialProducts,
  restoreAllInitialAnnouncements,
  createRestorePoint,
  subscribeRestorePoints,
  restoreFromPoint,
  deleteRestorePoint,
  RestorePoint,
  AnnouncementItem 
} from '../services/storeService';
import { compressImageFile } from '../utils/imageCompressor';
import { useDevice } from '../utils/useDevice';
import { ImagePickerModal } from './ImagePickerModal';

interface AdminPanelProps {
  onBackToStore: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToStore }) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('laguna_admin_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Store data - initialize with initialProducts so it is NEVER empty
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [restorePoints, setRestorePoints] = useState<RestorePoint[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'announcements' | 'restore-points' | 'settings'>('products');

  // Restore Point creation modal state
  const [isCreatingPointModal, setIsCreatingPointModal] = useState(false);
  const [newPointName, setNewPointName] = useState('');
  const [newPointNote, setNewPointNote] = useState('');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Product Editing / Creating
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    category: 'Productos de Limpieza',
    description: '',
    imageUrl: '',
    basePrice: 0,
    unitType: 'litros',
    options: [{ label: 'Bidón x 5 Lts', price: 0 }]
  });

  // Announcement Editing / Creating
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementItem | null>(null);
  const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState<Partial<AnnouncementItem>>({
    title: '',
    subtitle: '',
    description: '',
    tag: 'Novedad',
    tagColor: 'bg-emerald-600 text-white',
    imageUrl: '',
    ctaText: 'Consultar'
  });

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // New PIN modal
  const [newPinValue, setNewPinValue] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);

  // Device detection (celular vs computadora)
  const device = useDevice();

  // Multi-device Image Picker Modal State
  const [imagePickerTarget, setImagePickerTarget] = useState<{
    isOpen: boolean;
    type: 'direct-product' | 'product-form' | 'announcement-form';
    productId?: string;
    currentUrl?: string;
    title?: string;
    subtitle?: string;
  }>({
    isOpen: false,
    type: 'direct-product'
  });

  // Hidden file input refs for direct photo uploads fallback
  const directImageInputRef = useRef<HTMLInputElement>(null);
  const [targetProductIdForPhoto, setTargetProductIdForPhoto] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Subscribe to real-time Firestore data
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubProducts = subscribeProducts((list) => {
      setProducts(list.filter(Boolean));
    });

    const unsubAnnouncements = subscribeAnnouncements((list) => {
      setAnnouncements(list.filter(Boolean));
    });

    const unsubRestorePoints = subscribeRestorePoints((list) => {
      setRestorePoints(list.filter(Boolean));
    });

    return () => {
      unsubProducts();
      unsubAnnouncements();
      unsubRestorePoints();
    };
  }, [isAuthenticated]);

  // Handle PIN Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;

    setIsVerifying(true);
    setPinError('');
    try {
      const isValid = await verifyAdminPin(pinInput);
      if (isValid) {
        setIsAuthenticated(true);
        sessionStorage.setItem('laguna_admin_auth', 'true');
      } else {
        setPinError('Código incorrecto. Por favor verificá e intentá nuevamente.');
      }
    } catch {
      setPinError('Error de conexión al verificar el código.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('laguna_admin_auth');
  };

  // Multi-device Image Selection handler
  const triggerDirectPhotoUpload = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    setImagePickerTarget({
      isOpen: true,
      type: 'direct-product',
      productId,
      currentUrl: prod?.imageUrl || '',
      title: prod ? `Foto de "${prod.name}"` : 'Cambiar Foto',
      subtitle: device.isComputer
        ? 'Elegí una imagen de tus carpetas o del catálogo del local'
        : 'Elegí de la galería del celular, sacá una foto o elegí del catálogo'
    });
  };

  const handleImagePicked = async (imageUrl: string) => {
    if (imagePickerTarget.type === 'direct-product' && imagePickerTarget.productId) {
      const prod = products.find(p => p.id === imagePickerTarget.productId);
      if (prod) {
        setIsProcessing(true);
        try {
          await saveProduct({
            ...prod,
            imageUrl
          });
          showToast(`✅ Foto de "${prod.name}" actualizada con éxito.`);
        } catch (err: any) {
          alert('Error al actualizar la foto: ' + (err?.message || ''));
        } finally {
          setIsProcessing(false);
        }
      }
    } else if (imagePickerTarget.type === 'product-form') {
      setProductForm(prev => ({ ...prev, imageUrl }));
    } else if (imagePickerTarget.type === 'announcement-form') {
      setAnnouncementForm(prev => ({ ...prev, imageUrl }));
    }
  };

  const handleDirectPhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetProductIdForPhoto) return;

    setIsProcessing(true);
    try {
      const compressedBase64 = await compressImageFile(file);
      const prod = products.find(p => p.id === targetProductIdForPhoto);
      if (prod) {
        await saveProduct({
          ...prod,
          imageUrl: compressedBase64
        });
        showToast(`✅ Foto de "${prod.name}" actualizada con éxito.`);
      }
    } catch (err: any) {
      alert('Error al procesar la foto: ' + (err?.message || 'Error desconocido'));
    } finally {
      setIsProcessing(false);
      setTargetProductIdForPhoto(null);
    }
  };

  // Product Form Photo selection
  const handleFormPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const compressedBase64 = await compressImageFile(file);
      setProductForm(prev => ({ ...prev, imageUrl: compressedBase64 }));
    } catch (err: any) {
      alert('Error al cargar la foto: ' + (err?.message || ''));
    } finally {
      setIsProcessing(false);
    }
  };

  // Announcement Form Photo selection
  const handleAnnouncementPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const compressedBase64 = await compressImageFile(file);
      setAnnouncementForm(prev => ({ ...prev, imageUrl: compressedBase64 }));
    } catch (err: any) {
      alert('Error al cargar la foto: ' + (err?.message || ''));
    } finally {
      setIsProcessing(false);
    }
  };

  // Open modal to add product
  const startAddProduct = () => {
    setProductForm({
      id: 'prod-' + Date.now(),
      name: '',
      category: 'Productos de Limpieza',
      description: '',
      imageUrl: '',
      basePrice: 0,
      unitType: 'litros',
      options: [{ label: 'Bidón x 5 Lts', price: 0 }]
    });
    setIsCreatingProduct(true);
    setEditingProduct(null);
  };

  // Open modal to edit product
  const startEditProduct = (prod: Product) => {
    setProductForm({
      ...prod,
      options: prod.options && prod.options.length > 0 ? [...prod.options] : [{ label: 'Unidad', price: prod.basePrice }]
    });
    setEditingProduct(prod);
    setIsCreatingProduct(false);
  };

  // Save product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name?.trim()) {
      alert('Por favor escribí el nombre del producto');
      return;
    }

    setIsProcessing(true);
    try {
      const id = productForm.id || 'prod-' + Date.now();
      const basePrice = Number(productForm.basePrice) || 0;
      
      const newProduct: Product = {
        id,
        name: productForm.name.trim(),
        category: productForm.category?.trim() || 'Productos de Limpieza',
        description: productForm.description?.trim() || '',
        imageUrl: productForm.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=800',
        basePrice,
        unitType: productForm.unitType === 'unidades' ? 'unidades' : 'litros',
        options: productForm.options && productForm.options.length > 0 
          ? productForm.options 
          : [{ label: productForm.unitType === 'unidades' ? 'Unidad' : 'Bidón x 5 Lts', price: basePrice }]
      };

      await saveProduct(newProduct);
      showToast(`🎉 ¡"${newProduct.name}" guardado exitosamente!`);
      setEditingProduct(null);
      setIsCreatingProduct(false);
    } catch (err: any) {
      alert('Error al guardar el producto: ' + (err?.message || 'Error'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (prod: Product) => {
    const confirm = window.confirm(`¿Estás seguro de que querés borrar el producto "${prod.name}" de la tienda?`);
    if (!confirm) return;

    setIsProcessing(true);
    try {
      await deleteProduct(prod.id);
      showToast(`🗑️ Producto "${prod.name}" eliminado.`);
    } catch (err: any) {
      alert('Error al eliminar: ' + err?.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Restore all initial catalog products into Firestore
  const handleRestoreProducts = async () => {
    const confirm = window.confirm(
      '¿Deseas REVERTIR TODOS LOS CAMBIOS DE PRODUCTOS y volver al catálogo original de 53 productos?\n\nEsto reestablecerá todos los precios, nombres y fotos originales de fábrica, y quitará cualquier producto nuevo que hayas agregado.'
    );
    if (!confirm) return;

    setIsProcessing(true);
    try {
      const count = await restoreAllInitialProducts(true);
      showToast(`✅ ¡Catálogo reestablecido! ${count} productos originales restaurados.`);
    } catch (err: any) {
      alert('Error al reestablecer catálogo: ' + (err?.message || 'Error'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Restore all initial announcements (banners) into Firestore
  const handleRestoreAnnouncements = async () => {
    const confirm = window.confirm(
      '¿Deseas REVERTIR TODOS LOS CAMBIOS DE LAS NOVEDADES y volver a las 3 promociones originales de fábrica?\n\n1. Miércoles: 10% de Descuento\n2. ¡Envío Gratis en tu Compra!\n3. ¡Atención Revendedores!\n\nEsto reestablecerá textos, fotos y quitará banners nuevos.'
    );
    if (!confirm) return;

    setIsProcessing(true);
    try {
      const count = await restoreAllInitialAnnouncements(true);
      showToast(`✅ ¡Novedades reestablecidas! ${count} banners originales restaurados.`);
    } catch (err: any) {
      alert('Error al reestablecer novedades: ' + (err?.message || 'Error'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Create custom Restore Point
  const handleCreateRestorePoint = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsProcessing(true);
    try {
      const pt = await createRestorePoint(newPointName, newPointNote);
      showToast(`💾 ¡Punto de restauración "${pt.name}" guardado exitosamente!`);
      setNewPointName('');
      setNewPointNote('');
      setIsCreatingPointModal(false);
    } catch (err: any) {
      alert('Error al guardar punto de restauración: ' + (err?.message || 'Error'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Apply a Restore Point
  const handleApplyRestorePoint = async (point: RestorePoint) => {
    const formattedDate = new Date(point.createdAt).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const confirm = window.confirm(
      `¿Deseas REVERTIR LA TIENDA al punto guardado:\n"${point.name}"?\n\nFecha de guardado: ${formattedDate}\nProductos a restaurar: ${point.productCount}\nNovedades a restaurar: ${point.announcementCount}\n\nLos productos y novedades de la tienda volverán exactamente al estado de ese momento.`
    );
    if (!confirm) return;

    setIsProcessing(true);
    try {
      const res = await restoreFromPoint(point);
      showToast(`🔄 ¡Tienda revertida exitosamente! Se restauraron ${res.productsCount} productos y ${res.announcementsCount} novedades.`);
    } catch (err: any) {
      alert('Error al restaurar punto: ' + (err?.message || 'Error'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete a Restore Point
  const handleDeleteRestorePoint = async (point: RestorePoint) => {
    const confirm = window.confirm(`¿Estás seguro de eliminar el punto de restauración "${point.name}"?`);
    if (!confirm) return;

    try {
      await deleteRestorePoint(point.id);
      showToast(`🗑️ Punto de restauración eliminado.`);
    } catch (err: any) {
      alert('Error al eliminar punto: ' + (err?.message || 'Error'));
    }
  };

  // Announcement Handlers
  const startAddAnnouncement = () => {
    setAnnouncementForm({
      id: 'novedad-' + Date.now(),
      title: '',
      subtitle: '',
      description: '',
      tag: '¡Promo Destacada!',
      tagColor: 'bg-emerald-600 text-white',
      imageUrl: '',
      ctaText: 'Consultar Promo'
    });
    setIsCreatingAnnouncement(true);
    setEditingAnnouncement(null);
  };

  const startEditAnnouncement = (item: AnnouncementItem) => {
    setAnnouncementForm({ ...item });
    setEditingAnnouncement(item);
    setIsCreatingAnnouncement(false);
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementForm.title?.trim()) {
      alert('Por favor ingresá un título para la novedad');
      return;
    }

    setIsProcessing(true);
    try {
      const id = announcementForm.id || 'novedad-' + Date.now();
      const item: AnnouncementItem = {
        id,
        title: announcementForm.title.trim(),
        subtitle: announcementForm.subtitle?.trim() || announcementForm.description?.trim() || '',
        description: announcementForm.description?.trim() || announcementForm.subtitle?.trim() || '',
        tag: announcementForm.tag?.trim() || 'Novedad',
        tagColor: announcementForm.tagColor || 'bg-emerald-600 text-white',
        imageUrl: announcementForm.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=1400',
        ctaText: announcementForm.ctaText?.trim() || 'Consultar'
      };

      await saveAnnouncement(item);
      showToast(`📢 ¡Novedad "${item.title}" guardada con éxito!`);
      setEditingAnnouncement(null);
      setIsCreatingAnnouncement(false);
    } catch (err: any) {
      alert('Error al guardar la novedad: ' + err?.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteAnnouncement = async (item: AnnouncementItem) => {
    const confirm = window.confirm(`¿Querés borrar la novedad "${item.title}"?`);
    if (!confirm) return;

    setIsProcessing(true);
    try {
      await deleteAnnouncement(item.id);
      showToast(`🗑️ Novedad eliminada.`);
    } catch (err: any) {
      alert('Error al eliminar: ' + err?.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Change PIN handler
  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinValue.trim().length < 4) {
      alert('El código debe tener al menos 4 caracteres (ej: 4 números).');
      return;
    }

    setIsProcessing(true);
    try {
      await setAdminPin(newPinValue.trim());
      setPinChangeSuccess(true);
      setNewPinValue('');
      showToast('🔑 ¡Código de acceso actualizado correctamente!');
    } catch (err: any) {
      alert('Error al cambiar el código: ' + err?.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Categories list derived from products
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category || 'Otros')))];

  // Filtered products
  const filteredProducts = products.filter(p => {
    const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCategory && matchSearch;
  });

  // -------------------------------------------------------------
  // VIEW 1: PIN LOCK SCREEN (If not authenticated)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 relative">
          
          <button
            onClick={onBackToStore}
            className="absolute top-6 left-6 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-bold"
            title="Volver a la tienda"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </button>

          <div className="text-center pt-6 pb-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-600 via-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 text-white">
              <Lock className="w-8 h-8" />
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Panel de Control
            </h2>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mt-1">
              Limpieza La Laguna
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Ingresá tu código de seguridad para administrar productos, fotos y novedades.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Código de Acceso / PIN
              </label>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Ingresá el código..."
                className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 focus:border-blue-600 rounded-2xl text-center text-xl font-bold tracking-widest outline-none transition-colors"
                autoFocus
              />
            </div>

            {pinError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying || !pinInput.trim()}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 disabled:opacity-50 text-white font-black text-base rounded-2xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-5 h-5" />
                  <span>Entrar al Panel</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              💡 Código por defecto inicial: <span className="font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">1234</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Podrás cambiarlo en cualquier momento desde adentro del panel.
            </p>
          </div>

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: AUTHENTICATED ADMIN DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-20">
      
      {/* Hidden file input for direct photo uploads */}
      <input 
        type="file" 
        ref={directImageInputRef} 
        onChange={handleDirectPhotoFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/40 animate-bounce">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-teal-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md">
              L
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-black text-slate-900 leading-none">
                  Administrador La Laguna
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  En Vivo
                </span>
                {device.isComputer ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    <Monitor className="w-3 h-3 text-blue-600" />
                    <span>Modo Compu</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Smartphone className="w-3 h-3 text-emerald-600" />
                    <span>Modo Celular</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Cualquier cambio se guarda y se ve al instante en la web
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreatingPointModal(true)}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Guardar punto de restauración actual"
            >
              <BookmarkPlus className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Guardar Punto</span>
            </button>

            <button
              onClick={onBackToStore}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-blue-600" />
              <span>Ver Tienda</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              title="Cerrar Sesión"
            >
              Salir
            </button>
          </div>

        </div>

        {/* Tab Selection */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-2 border-t border-slate-100 pt-2 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Productos ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-4 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'announcements'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Novedades & Ofertas ({announcements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('restore-points')}
            className={`px-4 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'restore-points'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Puntos de Restauración ({restorePoints.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Cambiar Código PIN</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: PRODUCT CATALOG MANAGEMENT                             */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'products' && (
          <div className="space-y-6">

            {/* Actions Bar: Add Product & Search */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={startAddProduct}
                  className="py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  <span>Agregar Producto Nuevo</span>
                </button>

                <button
                  onClick={handleRestoreProducts}
                  disabled={isProcessing}
                  title="Revertir todos los cambios y volver a los 53 productos originales de fábrica"
                  className="py-3.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                  <span>Revertir Cambios (Originales 53)</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-2xl">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar producto por nombre..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
                >
                  <option value="all">Todas las categorías ({products.length})</option>
                  {categories.filter(c => c !== 'all').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredProducts.map((prod) => (
                <div 
                  key={prod.id}
                  className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Product Image with Direct Camera Upload button */}
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 mb-3 border border-slate-100 group">
                      <img 
                        src={prod.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=800'} 
                        alt={prod.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=800';
                        }}
                      />

                      {/* Direct Change Photo Button */}
                      <button
                        onClick={() => triggerDirectPhotoUpload(prod.id)}
                        className="absolute inset-0 bg-black/50 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-xs"
                      >
                        <Camera className="w-6 h-6" />
                        <span>Cambiar Foto</span>
                      </button>

                      {/* Small Quick Camera Icon for Mobile */}
                      <button
                        onClick={() => triggerDirectPhotoUpload(prod.id)}
                        className="sm:hidden absolute top-2 right-2 p-2 bg-white/90 text-slate-800 rounded-full shadow-md active:scale-95"
                        title="Cambiar Foto"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Category Tag */}
                    <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-black uppercase rounded-md mb-1.5">
                      {prod.category || 'Limpieza'}
                    </span>

                    {/* Product Name */}
                    <h3 className="font-black text-slate-900 text-base leading-snug line-clamp-2">
                      {prod.name}
                    </h3>

                    {/* Description preview */}
                    {prod.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {prod.description}
                      </p>
                    )}
                  </div>

                  {/* Pricing & Management Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Precio</span>
                      <span className="text-xl font-black text-emerald-600">
                        ${prod.basePrice.toLocaleString('es-AR')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => startEditProduct(prod)}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="Editar producto"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span className="hidden sm:inline">Editar</span>
                      </button>

                      <button
                        onClick={() => handleDeleteProduct(prod)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors cursor-pointer"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-black text-slate-800 text-base">No se encontraron productos</h4>
                <p className="text-xs text-slate-500 mt-1">Probá cambiando el filtro o agregá un producto nuevo.</p>
              </div>
            )}

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: ANNOUNCEMENTS & PROMOTIONS MANAGEMENT                  */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">Novedades y Promociones</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Estos son los banners destacados que los clientes ven arriba de todo en la tienda.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={handleRestoreAnnouncements}
                  disabled={isProcessing}
                  title="Revertir cambios de novedades y volver a las 3 promociones originales de fábrica"
                  className="py-3 px-4 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs sm:text-sm rounded-2xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                  <span>Revertir Novedades (Originales 3)</span>
                </button>

                <button
                  onClick={startAddAnnouncement}
                  className="py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-md shadow-emerald-600/25 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Novedad</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {announcements.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 flex flex-col justify-between"
                >
                  <div className="relative aspect-video bg-slate-950 overflow-hidden">
                    <img 
                      src={item.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=1400'} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase shadow-md ${item.tagColor}`}>
                        {item.tag}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">{item.title}</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {item.subtitle || item.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => startEditAnnouncement(item)}
                        className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => handleDeleteAnnouncement(item)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: RESTORE POINTS & BACKUPS                               */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'restore-points' && (
          <div className="space-y-6">

            {/* Header Card */}
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider mb-3 border border-purple-400/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Seguridad y Respaldos</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Puntos de Restauración y Reversión
                </h2>
                <p className="text-sm text-purple-200 mt-1 leading-relaxed">
                  Guardá una copia completa del catálogo y las novedades antes de hacer cambios. Podés volver a cualquier punto guardado o a los originales de fábrica con 1 solo clic.
                </p>
              </div>

              <button
                onClick={() => setIsCreatingPointModal(true)}
                className="py-3.5 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/30 flex items-center gap-2.5 transition-all cursor-pointer whitespace-nowrap active:scale-95"
              >
                <BookmarkPlus className="w-5 h-5" />
                <span>+ Guardar Punto Actual</span>
              </button>
            </div>

            {/* Resumen de Estado Actual */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Productos Activos</p>
                  <p className="text-xl font-black text-slate-900">{products.length} productos</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Megaphone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Novedades Activas</p>
                  <p className="text-xl font-black text-slate-900">{announcements.length} promociones</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Puntos Guardados</p>
                  <p className="text-xl font-black text-slate-900">{restorePoints.length} copias</p>
                </div>
              </div>
            </div>

            {/* Lista de Puntos Personalizados Guardados */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Mis Puntos de Restauración Guardados</h3>
                  <p className="text-xs text-slate-500">
                    Elegí un punto guardado para revertir los productos y promociones a esa versión exacta.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreatingPointModal(true)}
                  className="text-xs font-bold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Punto</span>
                </button>
              </div>

              {restorePoints.length === 0 ? (
                <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <BookmarkPlus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-700">Aún no creaste ningún punto de restauración</p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                    Guardá una copia del estado actual para poder experimentar tranquilo y volver atrás si lo necesitás.
                  </p>
                  <button
                    onClick={() => setIsCreatingPointModal(true)}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-md shadow-purple-600/20 cursor-pointer"
                  >
                    Guardar Punto de Restauración Ahora
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {restorePoints.map((point) => (
                    <div
                      key={point.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-base font-black text-slate-900 leading-snug">{point.name}</h4>
                          <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(point.createdAt).toLocaleString('es-AR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        {point.note && (
                          <p className="text-xs text-slate-600 mt-1 italic">
                            "{point.note}"
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 text-[11px] font-black">
                            📦 {point.productCount} productos
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-black">
                            📢 {point.announcementCount} novedades
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-slate-200/80">
                        <button
                          onClick={() => handleApplyRestorePoint(point)}
                          disabled={isProcessing}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                          <span>Revertir a este punto</span>
                        </button>

                        <button
                          onClick={() => handleDeleteRestorePoint(point)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          title="Eliminar este punto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Puntos Originales de Fábrica */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Puntos de Restauración de Fábrica</h3>
                <p className="text-xs text-slate-500">
                  Valores predeterminados oficiales para volver a empezar en limpio.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fábrica Productos */}
                <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/50 flex flex-col justify-between">
                  <div>
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-amber-200 text-amber-900">
                      Catálogo Oficial
                    </span>
                    <h4 className="text-base font-black text-slate-900 mt-2">
                      53 Productos Originales de Fábrica
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Restaura todos los precios base, fotos de local, opciones de litros/unidades y descripciones oficiales de Limpieza La Laguna.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-amber-200/80">
                    <button
                      onClick={handleRestoreProducts}
                      disabled={isProcessing}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                      <span>Revertir Productos (Originales 53)</span>
                    </button>
                  </div>
                </div>

                {/* Fábrica Novedades */}
                <div className="p-5 rounded-2xl border border-pink-200 bg-pink-50/50 flex flex-col justify-between">
                  <div>
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-pink-200 text-pink-900">
                      Banners Oficiales
                    </span>
                    <h4 className="text-base font-black text-slate-900 mt-2">
                      3 Novedades Originales de Fábrica
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Restaura los 3 banners principales: Promo Miércoles 10% Descuento, Envío Gratis y Atención Revendedores.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-pink-200/80">
                    <button
                      onClick={handleRestoreAnnouncements}
                      disabled={isProcessing}
                      className="w-full py-2.5 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                      <span>Revertir Novedades (Originales 3)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: SETTINGS / CHANGE PIN                                  */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'settings' && (
          <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <Key className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-black text-slate-900">Cambiar Código PIN de Acceso</h2>
            <p className="text-xs text-slate-500 mt-1">
              Podés cambiar el código que se pide para entrar a este panel.
            </p>

            <form onSubmit={handleChangePin} className="space-y-4 mt-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Nuevo Código PIN
                </label>
                <input
                  type="text"
                  value={newPinValue}
                  onChange={(e) => setNewPinValue(e.target.value)}
                  placeholder="Ej: 5678"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-bold outline-none focus:border-blue-600 tracking-wider"
                  maxLength={12}
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Mínimo 4 números o letras fáciles de recordar.
                </p>
              </div>

              {pinChangeSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>¡Código actualizado correctamente! Recordalo para la próxima vez.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing || !newPinValue.trim()}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
              >
                {isProcessing ? 'Guardando...' : 'Guardar Nuevo Código'}
              </button>
            </form>
          </div>
        )}

      </main>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT PRODUCT                                     */}
      {/* ------------------------------------------------------------- */}
      {(isCreatingProduct || editingProduct) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-900">
                {isCreatingProduct ? '➕ Agregar Producto Nuevo' : '✏️ Editar Producto'}
              </h3>
              <button
                onClick={() => {
                  setIsCreatingProduct(false);
                  setEditingProduct(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 mt-5">
              
              {/* Product Name */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  value={productForm.name || ''}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Lavandina Concentrada x 5 Lts"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={productForm.category || 'Productos de Limpieza'}
                    onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-600 focus:bg-white"
                  >
                    <option value="Productos de Limpieza">Productos de Limpieza</option>
                    <option value="Combos y Promos">Combos y Promos</option>
                    <option value="Escobillón y Mopas">Escobillón y Mopas</option>
                    <option value="Papel">Papel</option>
                    <option value="Bolsas">Bolsas</option>
                    <option value="Aromatizadores">Aromatizadores</option>
                    <option value="Control de Plagas">Control de Plagas</option>
                    <option value="Bazar y Decoración">Bazar y Decoración</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Precio ($ ARS) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={productForm.basePrice ?? 0}
                    onChange={(e) => setProductForm(prev => ({ ...prev, basePrice: Number(e.target.value) }))}
                    placeholder="Ej: 5200"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Unit Type */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Tipo de Unidad
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="unitType"
                      checked={productForm.unitType === 'litros'}
                      onChange={() => setProductForm(prev => ({ ...prev, unitType: 'litros' }))}
                      className="text-blue-600"
                    />
                    <span>Litros / Bidones</span>
                  </label>

                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="unitType"
                      checked={productForm.unitType === 'unidades'}
                      onChange={() => setProductForm(prev => ({ ...prev, unitType: 'unidades' }))}
                      className="text-blue-600"
                    />
                    <span>Unidades / Paquetes</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Descripción Corta
                </label>
                <textarea
                  rows={2}
                  value={productForm.description || ''}
                  onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detalles sobre el producto, aroma, usos recomendados..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              {/* Photo Upload Section */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <label className="block text-xs font-black uppercase text-slate-700">
                  Foto del Producto
                </label>

                <div className="flex items-center gap-4">
                  {productForm?.imageUrl && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0 shadow-sm">
                      <img 
                        src={productForm.imageUrl} 
                        alt="Vista previa" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <button
                      type="button"
                      onClick={() => setImagePickerTarget({
                        isOpen: true,
                        type: 'product-form',
                        currentUrl: productForm?.imageUrl || '',
                        title: 'Elegir Foto del Producto',
                        subtitle: device.isComputer 
                          ? 'Seleccionar de tus carpetas de la compu o del catálogo del local' 
                          : 'Elegir de la galería de tu celu, tomar foto o del catálogo'
                      })}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:border-blue-500 rounded-xl text-xs font-bold text-slate-700 shadow-xs cursor-pointer hover:bg-blue-50 transition-colors"
                    >
                      <Camera className="w-4 h-4 text-blue-600" />
                      <span>{device.isComputer ? 'Elegir de mis Carpetas / Catálogo' : 'Galería / Cámara del Celu'}</span>
                    </button>

                    <input
                      type="text"
                      value={productForm?.imageUrl || ''}
                      onChange={(e) => setProductForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="O pegar URL de imagen aquí..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Actions Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingProduct(false);
                    setEditingProduct(null);
                  }}
                  className="px-5 py-3 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-md shadow-emerald-600/25 transition-all cursor-pointer flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Guardar en la Web</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT ANNOUNCEMENT                                */}
      {/* ------------------------------------------------------------- */}
      {(isCreatingAnnouncement || editingAnnouncement) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-900">
                {isCreatingAnnouncement ? '➕ Agregar Novedad' : '✏️ Editar Novedad'}
              </h3>
              <button
                onClick={() => {
                  setIsCreatingAnnouncement(false);
                  setEditingAnnouncement(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-4 mt-5">
              
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Título de la Promoción *
                </label>
                <input
                  type="text"
                  required
                  value={announcementForm.title || ''}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Miércoles: 10% de Descuento"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Etiqueta Superior (Badge)
                </label>
                <input
                  type="text"
                  value={announcementForm.tag || ''}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, tag: e.target.value }))}
                  placeholder="Ej: ¡Promo Semanal Destacada!"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Descripción o Subtítulo
                </label>
                <textarea
                  rows={2}
                  value={announcementForm.subtitle || ''}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Detalles de la oferta o promoción..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              {/* Photo Upload Section */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <label className="block text-xs font-black uppercase text-slate-700">
                  Foto del Banner
                </label>

                <div className="flex items-center gap-4">
                  {announcementForm?.imageUrl && (
                    <div className="w-24 h-16 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0 shadow-sm">
                      <img 
                        src={announcementForm.imageUrl} 
                        alt="Vista previa" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <button
                      type="button"
                      onClick={() => setImagePickerTarget({
                        isOpen: true,
                        type: 'announcement-form',
                        currentUrl: announcementForm?.imageUrl || '',
                        title: 'Elegir Foto del Banner',
                        subtitle: device.isComputer 
                          ? 'Seleccionar de tus carpetas de la compu o del catálogo del local' 
                          : 'Elegir de la galería de tu celu, tomar foto o del catálogo'
                      })}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:border-blue-500 rounded-xl text-xs font-bold text-slate-700 shadow-xs cursor-pointer hover:bg-blue-50 transition-colors"
                    >
                      <Camera className="w-4 h-4 text-blue-600" />
                      <span>{device.isComputer ? 'Elegir de mis Carpetas / Catálogo' : 'Galería / Cámara del Celu'}</span>
                    </button>

                    <input
                      type="text"
                      value={announcementForm?.imageUrl || ''}
                      onChange={(e) => setAnnouncementForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="O pegar URL de imagen..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingAnnouncement(false);
                    setEditingAnnouncement(null);
                  }}
                  className="px-5 py-3 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-md shadow-emerald-600/25 transition-all cursor-pointer flex items-center gap-2"
                >
                  {isProcessing ? 'Guardando...' : 'Guardar Novedad'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: CREAR PUNTO DE RESTAURACIÓN                            */}
      {/* ------------------------------------------------------------- */}
      {isCreatingPointModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <BookmarkPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">Guardar Punto</h3>
                  <p className="text-xs text-slate-500">Copia de seguridad del catálogo</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreatingPointModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRestorePoint} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Nombre del Punto (Opcional)
                </label>
                <input
                  type="text"
                  value={newPointName}
                  onChange={(e) => setNewPointName(e.target.value)}
                  placeholder={`Ej: Copia antes del aumento (${products.length} productos)`}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Nota o Descripción (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={newPointNote}
                  onChange={(e) => setNewPointNote(e.target.value)}
                  placeholder="Ej: Guardado antes de cambiar fotos y ofertas del fin de semana..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-purple-600"
                />
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-xs text-purple-900">
                <p className="font-bold">Se guardará en este punto:</p>
                <ul className="mt-1 list-disc list-inside text-[11px] text-purple-800 space-y-0.5">
                  <li>{products.length} productos con sus fotos, precios y opciones</li>
                  <li>{announcements.length} promociones con sus fotos y textos</li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingPointModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  <span>{isProcessing ? 'Guardando...' : 'Guardar Punto Ahora'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Multi-Device Image Picker Modal (Celu: Galería y Cámara | Compu: Carpetas y Drag & Drop) */}
      <ImagePickerModal
        isOpen={imagePickerTarget.isOpen}
        onClose={() => setImagePickerTarget(prev => ({ ...prev, isOpen: false }))}
        onSelectImage={handleImagePicked}
        currentImageUrl={imagePickerTarget.currentUrl}
        title={imagePickerTarget.title}
        subtitle={imagePickerTarget.subtitle}
      />

    </div>
  );
};

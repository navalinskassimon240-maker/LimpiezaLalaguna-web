import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit3, 
  Camera, 
  Check, 
  X, 
  Search, 
  ExternalLink, 
  Sparkles, 
  Megaphone, 
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  Key,
  Smartphone,
  Monitor,
  ShieldAlert,
  Lock,
  Unlock,
  ArrowLeft
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
  const [activeTab, setActiveTab] = useState<'products' | 'announcements' | 'settings'>('products');

  // Safety Confirmation Modal state (prevents accidental reverts or deletions)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    warningDetails?: string[];
    confirmButtonText: string;
    confirmButtonVariant?: 'danger' | 'warning';
    requireSafetyCheck?: boolean;
    onConfirm: () => Promise<void> | void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmButtonText: 'Confirmar',
    onConfirm: () => {}
  });
  const [safetyCheckAccepted, setSafetyCheckAccepted] = useState(false);

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

    return () => {
      unsubProducts();
      unsubAnnouncements();
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

  // Delete product with safety confirmation modal
  const handleDeleteProduct = (prod: Product) => {
    setSafetyCheckAccepted(false);
    setConfirmModal({
      isOpen: true,
      title: `¿Eliminar "${prod.name}"?`,
      description: `El producto se quitará de la tienda web y los clientes ya no podrán verlo ni comprarlo.`,
      confirmButtonText: 'Sí, Eliminar Producto',
      confirmButtonVariant: 'danger',
      requireSafetyCheck: false,
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          await deleteProduct(prod.id);
          showToast(`🗑️ Producto "${prod.name}" eliminado.`);
        } catch (err: any) {
          alert('Error al eliminar: ' + err?.message);
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };

  // Restore all initial catalog products with double-safety confirmation modal
  const handleRestoreProducts = () => {
    setSafetyCheckAccepted(false);
    setConfirmModal({
      isOpen: true,
      title: '¿Revertir catálogo a los 53 productos originales de fábrica?',
      description: `Actualmente tenés ${products.length} productos en la tienda. Esta función está pensada para reiniciar todo el catálogo si fuera necesario.`,
      warningDetails: [
        'Se perderán todos los productos nuevos que hayas agregado manualmente.',
        'Se restablecerán los precios y fotos originales de fábrica de los 53 productos.',
        'Esta acción no se puede deshacer.'
      ],
      confirmButtonText: 'Sí, Revertir a 53 Originales',
      confirmButtonVariant: 'danger',
      requireSafetyCheck: true,
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          const count = await restoreAllInitialProducts(true);
          showToast(`✅ Catálogo restablecido con éxito (${count} productos originales de fábrica).`);
        } catch (err: any) {
          alert('Error al restablecer catálogo: ' + (err?.message || 'Error'));
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };

  // Restore all initial announcements (banners) with safety confirmation modal
  const handleRestoreAnnouncements = () => {
    setSafetyCheckAccepted(false);
    setConfirmModal({
      isOpen: true,
      title: '¿Revertir novedades a las 3 promociones originales de fábrica?',
      description: 'Se restablecerán los 3 banners destacados oficiales de Limpieza La Laguna:',
      warningDetails: [
        '1. Miércoles: 10% de Descuento (Efectivo/Transferencia)',
        '2. ¡Envío Gratis en tu Compra! (Superando los $15.000)',
        '3. ¡Atención Revendedores! (Cloro x 1000 LTS)',
        'Cualquier banner adicional que hayas creado será eliminado.'
      ],
      confirmButtonText: 'Sí, Revertir Novedades',
      confirmButtonVariant: 'warning',
      requireSafetyCheck: false,
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          const count = await restoreAllInitialAnnouncements(true);
          showToast(`✅ Novedades restablecidas con éxito (${count} banners originales).`);
        } catch (err: any) {
          alert('Error al restablecer novedades: ' + (err?.message || 'Error'));
        } finally {
          setIsProcessing(false);
        }
      }
    });
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

  const handleDeleteAnnouncement = (item: AnnouncementItem) => {
    setSafetyCheckAccepted(false);
    setConfirmModal({
      isOpen: true,
      title: `¿Eliminar banner "${item.title}"?`,
      description: `Este anuncio se quitará del carrusel de novedades en la parte superior de la página principal.`,
      confirmButtonText: 'Sí, Eliminar Novedad',
      confirmButtonVariant: 'danger',
      requireSafetyCheck: false,
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          await deleteAnnouncement(item.id);
          showToast(`🗑️ Novedad eliminada con éxito.`);
        } catch (err: any) {
          alert('Error al eliminar: ' + err?.message);
        } finally {
          setIsProcessing(false);
        }
      }
    });
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
        {/* TAB 3: SETTINGS / CHANGE PIN                                  */}
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
      {/* MODAL DE SEGURIDAD / CONFIRMACIÓN DE ACCIONES                  */}
      {/* ------------------------------------------------------------- */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200">
            
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                confirmModal.confirmButtonVariant === 'warning' 
                  ? 'bg-amber-100 text-amber-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="flex-1 min-w-0 pr-2">
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  {confirmModal.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  {confirmModal.description}
                </p>
              </div>

              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Warning details bullets if provided */}
            {confirmModal.warningDetails && confirmModal.warningDetails.length > 0 && (
              <div className="mb-5 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2">
                <p className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  <span>Por favor tené en cuenta:</span>
                </p>
                <ul className="space-y-1.5 text-xs text-amber-900/90 font-medium">
                  {confirmModal.warningDetails.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mandatory Checkbox safety step for dangerous actions */}
            {confirmModal.requireSafetyCheck && (
              <div className="mb-5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={safetyCheckAccepted}
                    onChange={(e) => setSafetyCheckAccepted(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-700">
                    Comprendo las consecuencias y deseo restablecer el catálogo
                  </span>
                </label>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer text-center"
              >
                Cancelar y Volver
              </button>

              <button
                type="button"
                disabled={isProcessing || (confirmModal.requireSafetyCheck && !safetyCheckAccepted)}
                onClick={async () => {
                  const action = confirmModal.onConfirm;
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                  await action();
                }}
                className={`px-6 py-3 rounded-xl text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  confirmModal.confirmButtonVariant === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25'
                    : 'bg-red-600 hover:bg-red-700 shadow-red-600/25'
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <span>{confirmModal.confirmButtonText}</span>
                )}
              </button>
            </div>

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

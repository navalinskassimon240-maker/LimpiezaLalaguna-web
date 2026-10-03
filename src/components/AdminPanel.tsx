import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  ArrowLeft,
  SlidersHorizontal,
  History,
  RotateCcw,
  CheckCircle2,
  Info,
  ShieldCheck,
  Tag,
  Palette,
  CheckCheck,
  Clock,
  Ban,
  PauseCircle,
  PlayCircle,
  Layers,
  ListPlus
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
  restoreAllInitialAnnouncements,
  acknowledgeProductChanges,
  acknowledgeAllProductChanges,
  toggleProductStock,
  AnnouncementItem 
} from '../services/storeService';
import { compressImageFile } from '../utils/imageCompressor';
import { useDevice } from '../utils/useDevice';
import { ImagePickerModal } from './ImagePickerModal';

interface AdminPanelProps {
  onBackToStore: () => void;
}

export interface ProductDiff {
  status: 'modified' | 'new' | 'unchanged';
  product: Product;
  initialProduct?: Product;
  changes: {
    field: string;
    label: string;
    oldValue: string;
    newValue: string;
  }[];
}

// Preset color options for product tags
const TAG_COLOR_PRESETS = [
  { label: 'Verde Esmeralda', value: 'bg-emerald-600 text-white', color: '#059669' },
  { label: 'Azul Océano', value: 'bg-blue-600 text-white', color: '#2563eb' },
  { label: 'Rojo Pasión / Oferta', value: 'bg-rose-600 text-white', color: '#e11d48' },
  { label: 'Naranja Promo', value: 'bg-amber-500 text-white', color: '#f59e0b' },
  { label: 'Violeta Premium', value: 'bg-purple-600 text-white', color: '#9333ea' },
  { label: 'Negro Elegante', value: 'bg-slate-900 text-white', color: '#0f172a' },
  { label: 'Rosa / Magenta', value: 'bg-pink-600 text-white', color: '#db2777' },
  { label: 'Celeste / Cyan', value: 'bg-cyan-600 text-white', color: '#0891b2' },
];

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
  const [activeTab, setActiveTab] = useState<'products' | 'changes' | 'announcements' | 'settings'>('products');

  // Filter state for Products tab
  const [productStatusFilter, setProductStatusFilter] = useState<'all' | 'in_stock' | 'out_of_stock' | 'modified' | 'new'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Safety Confirmation Modal state (prevents accidental reverts or deletions)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    warningDetails?: string[];
    confirmButtonText: string;
    confirmButtonVariant?: 'danger' | 'warning' | 'primary';
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
    tag: '',
    tagColor: 'bg-emerald-600 text-white',
    options: [{ label: 'Bidón x 5 Lts', price: 0 }]
  });

  // Custom tag custom hex input state
  const [customTagHex, setCustomTagHex] = useState('');

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

  // -------------------------------------------------------------
  // SMART CHANGE DETECTION
  // 1. New products: tag as 'new' only if created within 5 days and not acknowledged yet
  // 2. Modified products: tag as 'modified' only if not acknowledged yet
  // -------------------------------------------------------------
  const productDiffsMap = useMemo(() => {
    const diffMap = new Map<string, ProductDiff>();

    products.forEach((prod) => {
      const initial = initialProducts.find((p) => p.id === prod.id);

      // New Product Case (Not in initial 53 factory catalog)
      if (!initial) {
        // Calculate days since creation (default 5-day window)
        const daysSinceCreation = prod.createdAt 
          ? (Date.now() - new Date(prod.createdAt).getTime()) / (1000 * 60 * 60 * 24)
          : 0;

        // Automatically expires after 5 days and integrates as standard catalog product
        const isStillNew = daysSinceCreation <= 5;

        diffMap.set(prod.id, {
          status: isStillNew ? 'new' : 'unchanged',
          product: prod,
          changes: [
            {
              field: 'new',
              label: 'Producto nuevo',
              oldValue: 'No existía en catálogo inicial',
              newValue: `Creado como "${prod.name}" ($${prod.basePrice.toLocaleString('es-AR')})`
            }
          ]
        });
        return;
      }

      // If changes have been acknowledged/accepted by admin, don't flag as pending modified
      const isAcknowledged = Boolean(prod.acknowledgedAt);

      const changes: { field: string; label: string; oldValue: string; newValue: string }[] = [];

      if (prod.name.trim() !== initial.name.trim()) {
        changes.push({
          field: 'name',
          label: 'Nombre',
          oldValue: initial.name,
          newValue: prod.name
        });
      }

      if (Number(prod.basePrice) !== Number(initial.basePrice)) {
        changes.push({
          field: 'basePrice',
          label: 'Precio Base',
          oldValue: `$${Number(initial.basePrice).toLocaleString('es-AR')}`,
          newValue: `$${Number(prod.basePrice).toLocaleString('es-AR')}`
        });
      }

      if (prod.category !== initial.category) {
        changes.push({
          field: 'category',
          label: 'Categoría',
          oldValue: initial.category || '(Sin categoría)',
          newValue: prod.category || '(Sin categoría)'
        });
      }

      if (prod.imageUrl !== initial.imageUrl) {
        changes.push({
          field: 'imageUrl',
          label: 'Foto / Imagen',
          oldValue: 'Foto original de fábrica',
          newValue: 'Foto personalizada cargada'
        });
      }

      if ((prod.description || '') !== (initial.description || '')) {
        changes.push({
          field: 'description',
          label: 'Descripción',
          oldValue: initial.description || '(Vacía)',
          newValue: prod.description || '(Vacía)'
        });
      }

      if (prod.unitType !== initial.unitType) {
        changes.push({
          field: 'unitType',
          label: 'Tipo de Unidad',
          oldValue: initial.unitType || 'litros',
          newValue: prod.unitType || 'litros'
        });
      }

      if (prod.tag && prod.tag.trim() !== '') {
        changes.push({
          field: 'tag',
          label: 'Etiqueta personalizada',
          oldValue: '(Sin etiqueta)',
          newValue: `"${prod.tag}"`
        });
      }

      if (changes.length > 0 && !isAcknowledged) {
        diffMap.set(prod.id, {
          status: 'modified',
          product: prod,
          initialProduct: initial,
          changes
        });
      } else {
        diffMap.set(prod.id, {
          status: 'unchanged',
          product: prod,
          initialProduct: initial,
          changes: []
        });
      }
    });

    return diffMap;
  }, [products]);

  // Statistics
  const modifiedProductsList: ProductDiff[] = useMemo(() => {
    return (Array.from(productDiffsMap.values()) as ProductDiff[]).filter((d) => d.status === 'modified');
  }, [productDiffsMap]);

  const newProductsList: ProductDiff[] = useMemo(() => {
    return (Array.from(productDiffsMap.values()) as ProductDiff[]).filter((d) => d.status === 'new');
  }, [productDiffsMap]);

  const deletedOriginalProducts = useMemo(() => {
    return initialProducts.filter((initial) => !products.some((p) => p.id === initial.id));
  }, [products]);

  const inStockCount = useMemo(() => {
    return products.filter((p) => !p.outOfStock).length;
  }, [products]);

  const outOfStockCount = useMemo(() => {
    return products.filter((p) => Boolean(p.outOfStock)).length;
  }, [products]);

  // 1-Click Toggle Product Stock Status (Pausar / Reactivar)
  const handleToggleStock = async (product: Product) => {
    const newStockStatus = !product.outOfStock;
    setIsProcessing(true);
    try {
      await toggleProductStock(product.id, newStockStatus);
      showToast(
        newStockStatus 
          ? `⏸️ "${product.name}" marcado como Sin Stock (Pausado).` 
          : `🟢 "${product.name}" reactivado con stock disponible.`
      );
    } catch (err: any) {
      alert('Error al cambiar estado de stock: ' + (err?.message || 'Error'));
    } finally {
      setIsProcessing(false);
    }
  };

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
        setPinError('Código incorrecto.');
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
    const prod = products.find((p) => p.id === productId);
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
      const prod = products.find((p) => p.id === imagePickerTarget.productId);
      if (prod) {
        setIsProcessing(true);
        try {
          await saveProduct({
            ...prod,
            imageUrl,
            acknowledgedAt: undefined // Trigger change tracking until acknowledged
          });
          showToast(`✅ Foto de "${prod.name}" actualizada.`);
        } catch (err: any) {
          alert('Error al actualizar la foto: ' + (err?.message || ''));
        } finally {
          setIsProcessing(false);
        }
      }
    } else if (imagePickerTarget.type === 'product-form') {
      setProductForm((prev) => ({ ...prev, imageUrl }));
    } else if (imagePickerTarget.type === 'announcement-form') {
      setAnnouncementForm((prev) => ({ ...prev, imageUrl }));
    }
  };

  const handleDirectPhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetProductIdForPhoto) return;

    setIsProcessing(true);
    try {
      const compressedBase64 = await compressImageFile(file);
      const prod = products.find((p) => p.id === targetProductIdForPhoto);
      if (prod) {
        await saveProduct({
          ...prod,
          imageUrl: compressedBase64,
          acknowledgedAt: undefined
        });
        showToast(`✅ Foto de "${prod.name}" actualizada.`);
      }
    } catch (err: any) {
      alert('Error al procesar la foto: ' + (err?.message || 'Error desconocido'));
    } finally {
      setIsProcessing(false);
      setTargetProductIdForPhoto(null);
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
      tag: '',
      tagColor: 'bg-emerald-600 text-white',
      outOfStock: false,
      options: [{ label: 'Bidón x 5 Lts', price: 0 }],
      includes: []
    });
    setCustomTagHex('');
    setIsCreatingProduct(true);
    setEditingProduct(null);
  };

  // Open modal to edit product
  const startEditProduct = (prod: Product) => {
    setProductForm({
      ...prod,
      tag: prod.tag || '',
      tagColor: prod.tagColor || 'bg-emerald-600 text-white',
      outOfStock: Boolean(prod.outOfStock),
      options: prod.options && prod.options.length > 0 
        ? prod.options.map(o => ({ label: o.label, price: o.price })) 
        : [{ label: prod.unitType === 'unidades' ? 'Unidad' : 'Bidón x 5 Lts', price: prod.basePrice }],
      includes: prod.includes ? [...prod.includes] : []
    });
    setCustomTagHex(prod.tagColor && prod.tagColor.startsWith('#') ? prod.tagColor : '');
    setEditingProduct(prod);
    setIsCreatingProduct(false);
  };

  // Save product with validation
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
      
      // Clean and sanitize options
      const rawOptions = productForm.options || [];
      const validOptions: ProductOption[] = rawOptions
        .filter(opt => opt && typeof opt.label === 'string' && opt.label.trim() !== '')
        .map(opt => ({
          label: opt.label.trim(),
          price: typeof opt.price === 'number' && !isNaN(opt.price) ? opt.price : basePrice
        }));

      const finalOptions = validOptions.length > 0
        ? validOptions
        : [{ label: productForm.unitType === 'unidades' ? 'Unidad' : 'Bidón x 5 Lts', price: basePrice }];

      // Clean and sanitize includes for combos
      const rawIncludes = productForm.includes || [];
      const finalIncludes = rawIncludes
        .filter(inc => typeof inc === 'string' && inc.trim() !== '')
        .map(inc => inc.trim());

      const newProduct: Product = {
        id,
        name: productForm.name.trim(),
        category: productForm.category?.trim() || 'Productos de Limpieza',
        description: productForm.description?.trim() || '',
        imageUrl: productForm.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=800',
        basePrice: finalOptions[0]?.price && basePrice === 0 ? finalOptions[0].price : basePrice,
        unitType: productForm.unitType === 'unidades' ? 'unidades' : 'litros',
        options: finalOptions,
        includes: finalIncludes,
        tag: productForm.tag ? productForm.tag.trim() : '',
        tagColor: (customTagHex.trim() || productForm.tagColor?.trim()) || '',
        outOfStock: Boolean(productForm.outOfStock),
        createdAt: isCreatingProduct ? new Date().toISOString() : productForm.createdAt || new Date().toISOString()
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

  // -------------------------------------------------------------
  // ACKNOWLEDGE / ACCEPT PRODUCT CHANGES (Removes pending alert)
  // -------------------------------------------------------------
  const handleAcknowledgeSingleProduct = async (diff: ProductDiff) => {
    setIsProcessing(true);
    try {
      await acknowledgeProductChanges(diff.product.id);
      showToast(`✓ Cambios de "${diff.product.name}" fijados como versión definitiva.`);
    } catch (err: any) {
      alert('Error al fijar cambios: ' + (err?.message || ''));
    } finally {
      setIsProcessing(false);
    }
  };

  // Accept all pending product modifications at once
  const handleAcknowledgeAllProducts = async () => {
    const ids = modifiedProductsList.map((d) => d.product.id);
    if (ids.length === 0) return;

    setIsProcessing(true);
    try {
      await acknowledgeAllProductChanges(ids);
      showToast(`✓ Todas las modificaciones fueron aceptadas como versión definitiva.`);
    } catch (err: any) {
      alert('Error al aceptar modificaciones: ' + (err?.message || ''));
    } finally {
      setIsProcessing(false);
    }
  };

  // -------------------------------------------------------------
  // SELECTIVE REVERT: Revert ONLY THIS specific product to factory original
  // -------------------------------------------------------------
  const handleRevertSingleProduct = (diff: ProductDiff) => {
    if (!diff.initialProduct) return;
    const initial = diff.initialProduct;
    const current = diff.product;

    setConfirmModal({
      isOpen: true,
      title: `¿Revertir solo "${current.name}" a fábrica?`,
      description: `Se desharán los cambios hechos en este producto específico y volverá a su estado original de fábrica.`,
      warningDetails: [
        ...diff.changes.map((c) => `${c.label}: Cambiará de "${c.newValue}" a "${c.oldValue}"`),
        '🔒 GARANTÍA: Todos los demás productos que creaste o modificaste permanecerán 100% intactos.'
      ],
      confirmButtonText: 'Sí, Revertir Solo Este Producto',
      confirmButtonVariant: 'warning',
      requireSafetyCheck: false,
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          await saveProduct(initial);
          showToast(`✅ "${initial.name}" restablecido a su versión original de fábrica.`);
        } catch (err: any) {
          alert('Error al revertir: ' + (err?.message || 'Error'));
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };

  // Restore an individual deleted factory product
  const handleRestoreDeletedFactoryProduct = (initial: Product) => {
    setConfirmModal({
      isOpen: true,
      title: `¿Restaurar "${initial.name}" al catálogo?`,
      description: `Se volverá a agregar este producto original de fábrica a la tienda (${initial.category} - $${initial.basePrice.toLocaleString('es-AR')}).`,
      warningDetails: [
        '🔒 GARANTÍA: No afectará ni modificará ninguno de tus otros productos creados o editados.'
      ],
      confirmButtonText: 'Sí, Restaurar al Catálogo',
      confirmButtonVariant: 'primary',
      requireSafetyCheck: false,
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          await saveProduct(initial);
          showToast(`✅ Producto original "${initial.name}" restaurado.`);
        } catch (err: any) {
          alert('Error al restaurar: ' + (err?.message || 'Error'));
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
        '3. ¡Atención Revendedores! (Cloro x 1000 LTS)'
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
      alert('El código debe tener al menos 4 caracteres.');
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
  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category || 'Otros')))];

  // Filtered products for products tab
  const filteredProducts = products.filter((p) => {
    const diff = productDiffsMap.get(p.id);
    const matchStatus = 
      productStatusFilter === 'all' ? true :
      productStatusFilter === 'in_stock' ? !p.outOfStock :
      productStatusFilter === 'out_of_stock' ? Boolean(p.outOfStock) :
      productStatusFilter === 'modified' ? diff?.status === 'modified' :
      productStatusFilter === 'new' ? diff?.status === 'new' : true;

    const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (p.tag && p.tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchStatus && matchCategory && matchSearch;
  });

  // -------------------------------------------------------------
  // VIEW 1: ELEGANT, MINIMALIST & PROFESSIONAL PIN LOGIN SCREEN
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
        
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-800/80 relative z-10">
          
          <button
            onClick={onBackToStore}
            className="absolute top-6 left-6 p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Volver a la tienda"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tienda</span>
          </button>

          <div className="text-center pt-6 pb-2">
            <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl flex items-center justify-center shadow-lg shadow-black/40 text-emerald-400">
              <Lock className="w-6 h-6" />
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Panel de Gestión
            </h2>
            <p className="text-xs font-medium text-slate-400 mt-1">
              Limpieza La Laguna
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 mt-6">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
                Código de Seguridad
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="••••"
                  className="w-full px-4 py-3.5 bg-slate-950/80 border border-slate-700/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl text-center text-2xl font-bold tracking-[0.4em] text-white outline-none transition-all placeholder:text-slate-600 placeholder:tracking-normal"
                  autoFocus
                />
              </div>
            </div>

            {pinError && (
              <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-xs text-red-400 font-medium flex items-center gap-2 justify-center">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying || !pinInput.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Ingresar</span>
                </>
              )}
            </button>
          </form>

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
            onClick={() => setActiveTab('changes')}
            className={`px-4 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'changes'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4 text-amber-500" />
            <span>Control de Cambios</span>
            {(modifiedProductsList.length > 0 || newProductsList.length > 0) && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'changes' ? 'bg-white text-blue-700' : 'bg-amber-100 text-amber-800'
              }`}>
                {modifiedProductsList.length + newProductsList.length}
              </span>
            )}
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
            <span>Novedades & Banners ({announcements.length})</span>
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
            <span>Código PIN</span>
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

            {/* Actions Bar: Add Product & Filters */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={startAddProduct}
                  className="py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Producto Nuevo</span>
                </button>

                {/* Quick Filter Buttons */}
                <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-2xl gap-1">
                  <button
                    onClick={() => setProductStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      productStatusFilter === 'all' 
                        ? 'bg-white text-slate-900 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Todos ({products.length})
                  </button>

                  <button
                    onClick={() => setProductStatusFilter('in_stock')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      productStatusFilter === 'in_stock' 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    <span>En Stock</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/25">
                      {inStockCount}
                    </span>
                  </button>

                  <button
                    onClick={() => setProductStatusFilter('out_of_stock')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      productStatusFilter === 'out_of_stock' 
                        ? 'bg-red-600 text-white shadow-xs' 
                        : 'text-red-700 hover:bg-red-50'
                    }`}
                  >
                    <span>Sin Stock</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/25">
                      {outOfStockCount}
                    </span>
                  </button>

                  <button
                    onClick={() => setProductStatusFilter('modified')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      productStatusFilter === 'modified' 
                        ? 'bg-amber-500 text-white shadow-xs' 
                        : 'text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    <span>Modificados</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/25">
                      {modifiedProductsList.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setProductStatusFilter('new')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      productStatusFilter === 'new' 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : 'text-blue-700 hover:bg-blue-50'
                    }`}
                  >
                    <span>Nuevos</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/25">
                      {newProductsList.length}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-2xl">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar producto por nombre, categoría o etiqueta..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all"
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
                  <option value="all">Todas las categorías</option>
                  {categories.filter((c) => c !== 'all').map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredProducts.map((prod) => {
                const diff = productDiffsMap.get(prod.id);
                const isModified = diff?.status === 'modified';
                const isNew = diff?.status === 'new';

                return (
                  <div 
                    key={prod.id}
                    className={`bg-white rounded-3xl p-4 shadow-sm border transition-all flex flex-col justify-between ${
                      prod.outOfStock
                        ? 'border-red-200/90 bg-red-50/10'
                        : isModified 
                        ? 'border-amber-300 ring-1 ring-amber-200/50' 
                        : isNew 
                        ? 'border-emerald-300 ring-1 ring-emerald-200/50' 
                        : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* Product Image with Direct Camera Upload button */}
                      <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 mb-3 border border-slate-100 group">
                        <img 
                          src={prod.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=800'} 
                          alt={prod.name}
                          className={`w-full h-full object-cover ${
                            prod.outOfStock ? 'grayscale-[50%] opacity-85' : ''
                          }`}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=800';
                          }}
                        />

                        {/* Custom Marketing Tag (Top-Left) with max-width constraint */}
                        {prod.tag && prod.tag.trim() !== '' && (
                          <div className="absolute top-2.5 left-2.5 z-10 max-w-[55%]">
                            <span 
                              title={prod.tag}
                              className={`px-2.5 py-1 text-white text-[10px] font-black uppercase rounded-full shadow-md flex items-center gap-1 truncate ${
                                prod.tagColor && prod.tagColor.startsWith('bg-') ? prod.tagColor : 'bg-emerald-600'
                              }`}
                              style={
                                prod.tagColor && !prod.tagColor.startsWith('bg-')
                                  ? { backgroundColor: prod.tagColor }
                                  : undefined
                              }
                            >
                              <Tag className="w-3 h-3 shrink-0" />
                              <span className="truncate">{prod.tag}</span>
                            </span>
                          </div>
                        )}

                        {/* System Status Indicator (Top-Right) */}
                        <div className="absolute top-2.5 right-2.5 z-10 flex flex-col items-end gap-1">
                          {prod.outOfStock && (
                            <span className="px-2.5 py-0.5 bg-red-600/95 backdrop-blur-xs text-white text-[10px] font-black uppercase rounded-full shadow-md flex items-center gap-1 border border-white/20">
                              <Ban className="w-3 h-3" />
                              <span>Sin Stock</span>
                            </span>
                          )}
                          {isModified && (
                            <span className="px-2.5 py-0.5 bg-amber-500/95 backdrop-blur-xs text-white text-[10px] font-black uppercase rounded-full shadow-md flex items-center gap-1 border border-white/20">
                              <AlertCircle className="w-3 h-3" />
                              <span>Modificado</span>
                            </span>
                          )}
                          {isNew && (
                            <span className="px-2.5 py-0.5 bg-emerald-600/95 backdrop-blur-xs text-white text-[10px] font-black uppercase rounded-full shadow-md flex items-center gap-1 border border-white/20">
                              <Sparkles className="w-3 h-3" />
                              <span>Nuevo</span>
                            </span>
                          )}
                        </div>

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
                          className="sm:hidden absolute bottom-2 right-2 p-2 bg-white/90 text-slate-800 rounded-full shadow-md active:scale-95"
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

                      {/* Show change hints if modified */}
                      {isModified && diff && diff.changes.length > 0 && (
                        <div className="mt-2.5 p-2 bg-amber-50 rounded-xl border border-amber-200/70 text-[11px] text-amber-900 space-y-0.5">
                          <p className="font-black text-[10px] uppercase tracking-wider text-amber-700">
                            Cambios detectados:
                          </p>
                          {diff.changes.slice(0, 2).map((c, i) => (
                            <p key={i} className="line-clamp-1">
                              • <span className="font-bold">{c.label}:</span> {c.newValue} <span className="text-slate-400 line-through text-[10px]">{c.oldValue}</span>
                            </p>
                          ))}
                        </div>
                      )}
                      {/* Options / Variants summary */}
                      {prod.options && prod.options.length > 1 && (
                        <div className="mt-2.5 p-2 bg-blue-50/70 rounded-xl border border-blue-200/60 text-[11px] text-blue-900">
                          <div className="flex items-center gap-1 font-bold text-blue-800">
                            <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{prod.options.length} opciones en la foto:</span>
                          </div>
                          <p className="text-[10px] text-slate-600 mt-0.5 line-clamp-1 font-medium">
                            {prod.options.map(o => o.label).join(' • ')}
                          </p>
                        </div>
                      )}

                      {/* Includes preview for combos */}
                      {prod.includes && prod.includes.length > 0 && (
                        <div className="mt-2.5 p-2 bg-emerald-50/70 rounded-xl border border-emerald-200/60 text-[11px] text-emerald-900">
                          <div className="flex items-center gap-1 font-bold text-emerald-800">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{prod.includes.length} artículos en el pack:</span>
                          </div>
                          <p className="text-[10px] text-emerald-700 mt-0.5 line-clamp-1 font-medium">
                            {prod.includes.join(' + ')}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Pricing & Management Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Precio</span>
                          <span className="text-xl font-black text-emerald-600">
                            ${prod.basePrice.toLocaleString('es-AR')}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* 1-Click Stock Pause / Resume Button */}
                          <button
                            onClick={() => handleToggleStock(prod)}
                            className={`p-2 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                              prod.outOfStock
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800'
                            }`}
                            title={prod.outOfStock ? 'Reactivar disponibilidad de stock' : 'Pausar producto (marcar sin stock con 1 clic)'}
                          >
                            {prod.outOfStock ? (
                              <>
                                <PlayCircle className="w-4 h-4 text-emerald-600" />
                                <span className="hidden sm:inline">Reactivar</span>
                              </>
                            ) : (
                              <>
                                <PauseCircle className="w-4 h-4 text-amber-600" />
                                <span className="hidden sm:inline">Pausar</span>
                              </>
                            )}
                          </button>

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

                      {/* Revert Single Product Button (Only on modified products) */}
                      {isModified && diff && (
                        <div className="flex gap-1.5 pt-1">
                          <button
                            onClick={() => handleAcknowledgeSingleProduct(diff)}
                            className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            title="Aceptar estos cambios como la versión definitiva y quitar el aviso"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Aceptar Cambios</span>
                          </button>

                          <button
                            onClick={() => handleRevertSingleProduct(diff)}
                            className="py-1.5 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            title="Volver a los valores originales de fábrica solo para este producto"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                            <span>Revertir</span>
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-black text-slate-800 text-base">No se encontraron productos</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Probá cambiando el filtro o agregá un producto nuevo.
                </p>
              </div>
            )}

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: SMART CHANGE DETECTION & SELECTIVE REVERT             */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'changes' && (
          <div className="space-y-6">

            {/* Summary Header Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-xs font-bold mb-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Control Seguro de Cambios</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900">
                    Historial y Detección de Cambios
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                    Acá podés ver qué productos tienen cambios pendientes. Podés <strong>aceptar y fijar los cambios</strong> como definitivos para que no aparezca más la alerta, o <strong>revertir producto por producto</strong> a fábrica sin tocar el resto.
                  </p>
                </div>

                {/* Actions & Metrics */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {modifiedProductsList.length > 0 && (
                    <button
                      onClick={handleAcknowledgeAllProducts}
                      disabled={isProcessing}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>Aceptar Todas las Modificaciones</span>
                    </button>
                  )}

                  <div className="flex items-center gap-2">
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2 text-center">
                      <span className="text-lg font-black text-amber-800 block leading-none">
                        {modifiedProductsList.length}
                      </span>
                      <span className="text-[10px] font-bold text-amber-700 uppercase">
                        Modificados
                      </span>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2 text-center">
                      <span className="text-lg font-black text-emerald-800 block leading-none">
                        {newProductsList.length}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">
                        Nuevos (&lt; 5d)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 1: Modified Products with Detailed Diff */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <span>Productos Modificados ({modifiedProductsList.length})</span>
                </h3>
                <span className="text-xs text-slate-500">
                  Podés aceptar los cambios o revertirlos individualmente
                </span>
              </div>

              {modifiedProductsList.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <h4 className="font-bold text-slate-800 text-sm">No hay modificaciones pendientes</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Todos los productos están aceptados o en su estado original de fábrica.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {modifiedProductsList.map((diff) => (
                    <div 
                      key={diff.product.id}
                      className="bg-white rounded-3xl p-5 shadow-sm border border-amber-200 hover:border-amber-300 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start gap-3">
                          <img 
                            src={diff.product.imageUrl || 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=200'} 
                            alt={diff.product.name}
                            className="w-16 h-16 rounded-2xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                              {diff.product.category}
                            </span>
                            <h4 className="font-black text-slate-900 text-sm mt-1 truncate">
                              {diff.product.name}
                            </h4>
                            <p className="text-xs font-bold text-emerald-600 mt-0.5">
                              Precio actual: ${diff.product.basePrice.toLocaleString('es-AR')}
                            </p>
                          </div>
                        </div>

                        {/* List of Differences */}
                        <div className="mt-4 p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/60 space-y-2">
                          <p className="text-[11px] font-black uppercase text-amber-900">
                            Detalle de cambios:
                          </p>
                          <ul className="space-y-1.5 text-xs text-slate-700">
                            {diff.changes.map((change, idx) => (
                              <li key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1 border-b border-amber-100 last:border-none">
                                <span className="font-bold text-amber-950">{change.label}:</span>
                                <div className="text-xs flex items-center gap-1.5 flex-wrap">
                                  <span className="line-through text-slate-400 text-[11px] bg-white px-1.5 py-0.5 rounded">
                                    {change.oldValue}
                                  </span>
                                  <span className="font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                                    {change.newValue}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                        <button
                          onClick={() => handleAcknowledgeSingleProduct(diff)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Aceptar y Fijar Cambios</span>
                        </button>

                        <button
                          onClick={() => handleRevertSingleProduct(diff)}
                          className="px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                          <span>Revertir a Fábrica</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: Newly Created Products */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    <span>Productos Nuevos Recientes ({newProductsList.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    La etiqueta "Nuevo" se quita automáticamente a los 5 días de su creación para integrarse al catálogo habitual.
                  </p>
                </div>
              </div>

              {newProductsList.length === 0 ? (
                <div className="bg-white rounded-3xl p-6 text-center border border-slate-200">
                  <p className="text-xs text-slate-500">
                    No hay productos nuevos pendientes en los últimos 5 días.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {newProductsList.map((diff) => {
                    const daysPassed = diff.product.createdAt 
                      ? Math.floor((Date.now() - new Date(diff.product.createdAt).getTime()) / (1000 * 60 * 60 * 24))
                      : 0;
                    const daysLeft = Math.max(1, 5 - daysPassed);

                    return (
                      <div 
                        key={diff.product.id}
                        className="bg-white rounded-3xl p-4 shadow-sm border border-emerald-200 flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img 
                            src={diff.product.imageUrl || 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=200'} 
                            alt={diff.product.name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              {diff.product.category || 'Limpieza'}
                            </span>
                            <h4 className="font-bold text-slate-900 text-xs truncate mt-0.5">
                              {diff.product.name}
                            </h4>
                            <span className="text-xs font-black text-emerald-600 block">
                              ${diff.product.basePrice.toLocaleString('es-AR')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                          <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Quedan {daysLeft} {daysLeft === 1 ? 'día' : 'días'}</span>
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => startEditProduct(diff.product)}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors cursor-pointer"
                              title="Editar"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(diff.product)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors cursor-pointer"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 3: Deleted Factory Products (If any) */}
            {deletedOriginalProducts.length > 0 && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <History className="w-5 h-5 text-slate-500" />
                    <span>Productos de Fábrica que Fueron Eliminados ({deletedOriginalProducts.length})</span>
                  </h3>
                  <span className="text-xs text-slate-500">
                    Podés restaurarlos individualmente si los necesitás
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {deletedOriginalProducts.map((prod) => (
                    <div 
                      key={prod.id}
                      className="bg-slate-50 rounded-3xl p-4 border border-slate-200 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          {prod.category}
                        </span>
                        <h4 className="font-bold text-slate-700 text-xs truncate">
                          {prod.name}
                        </h4>
                        <span className="text-xs font-bold text-slate-500 block">
                          ${prod.basePrice.toLocaleString('es-AR')}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRestoreDeletedFactoryProduct(prod)}
                        className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Restaurar</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: ANNOUNCEMENTS & PROMOTIONS MANAGEMENT                  */}
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
                  className="py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs rounded-2xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                  <span>Revertir Banners a Originales (3)</span>
                </button>

                <button
                  onClick={startAddAnnouncement}
                  className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md shadow-emerald-600/25 flex items-center gap-2 transition-all cursor-pointer"
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
        {/* TAB 4: SETTINGS / CHANGE PIN                                  */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'settings' && (
          <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <Key className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-black text-slate-900">Cambiar Código PIN de Acceso</h2>
            <p className="text-xs text-slate-500 mt-1">
              Podés cambiar el código de seguridad que se pide para ingresar al panel.
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
                  Mínimo 4 caracteres fáciles de recordar.
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
      {/* MODAL: ADD / EDIT PRODUCT (WITH CUSTOM TAGS & COLORS)         */}
      {/* ------------------------------------------------------------- */}
      {(isCreatingProduct || editingProduct) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Modal Header (Sticky) */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <span>{isCreatingProduct ? '➕ Agregar Producto Nuevo' : '✏️ Editar Producto'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsCreatingProduct(false);
                  setEditingProduct(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              
              {/* Modal Body (Scrollable) */}
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
                
                {/* Product Name */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name || ''}
                    onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Lavandina Concentrada x 5 Lts"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>

                {/* Category & Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                      Categoría
                    </label>
                    <select
                      value={productForm.category || 'Productos de Limpieza'}
                      onChange={(e) => setProductForm((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-600 focus:bg-white transition-all"
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
                      onChange={(e) => setProductForm((prev) => ({ ...prev, basePrice: Number(e.target.value) }))}
                      placeholder="Ej: 5200"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-600 focus:bg-white transition-all"
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
                        onChange={() => setProductForm((prev) => ({ ...prev, unitType: 'litros' }))}
                        className="text-blue-600"
                      />
                      <span>Litros / Bidones</span>
                    </label>

                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="unitType"
                        checked={productForm.unitType === 'unidades'}
                        onChange={() => setProductForm((prev) => ({ ...prev, unitType: 'unidades' }))}
                        className="text-blue-600"
                      />
                      <span>Unidades / Paquetes</span>
                    </label>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* 🧩 OPCIONES / VARIANTES / PRODUCTOS EN LA FOTO                */}
                {/* ------------------------------------------------------------- */}
                <div className="p-4 bg-blue-50/50 border border-blue-200/80 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span>Opciones, Variantes o Productos en la Foto</span>
                    </label>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full">
                      {(productForm.options?.length || 0)} {(productForm.options?.length || 0) === 1 ? 'opción' : 'opciones'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Si tu foto muestra <strong>2 o más productos</strong> (por ejemplo: un <em>Bidón de Suavizante</em> y un <em>Jabón Líquido</em>), o si ofrecés distintas presentaciones/aromas con sus propios precios, configuralos acá para que el cliente elija cuál comprar.
                  </p>

                  {/* Listado dinámico de opciones */}
                  <div className="space-y-2 pt-1.5">
                    {(productForm.options || []).map((opt, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-xl shadow-2xs"
                      >
                        <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 text-xs font-black flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>

                        <div className="flex-1">
                          <input
                            type="text"
                            required
                            value={opt.label}
                            onChange={(e) => {
                              const newOpts = [...(productForm.options || [])];
                              newOpts[idx] = { ...newOpts[idx], label: e.target.value };
                              setProductForm(prev => ({ ...prev, options: newOpts }));
                            }}
                            placeholder={idx === 0 ? "Ej: Bidón de Suavizante (5L)" : idx === 1 ? "Ej: Jabón Líquido (5L)" : "Nombre de la opción / producto"}
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition-all"
                          />
                        </div>

                        <div className="w-28 sm:w-32 relative shrink-0">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                          <input
                            type="number"
                            min={0}
                            required
                            value={opt.price ?? 0}
                            onChange={(e) => {
                              const newOpts = [...(productForm.options || [])];
                              newOpts[idx] = { ...newOpts[idx], price: Number(e.target.value) };
                              setProductForm(prev => ({ ...prev, options: newOpts }));
                            }}
                            placeholder="Precio"
                            className="w-full pl-6 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition-all"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const newOpts = (productForm.options || []).filter((_, i) => i !== idx);
                            setProductForm(prev => ({ 
                              ...prev, 
                              options: newOpts.length > 0 ? newOpts : [{ label: 'Unidad', price: Number(productForm.basePrice) || 0 }] 
                            }));
                          }}
                          disabled={(productForm.options || []).length <= 1}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors cursor-pointer shrink-0"
                          title="Eliminar esta opción"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Botón Agregar Opción */}
                  <button
                    type="button"
                    onClick={() => {
                      const currentOpts = productForm.options || [];
                      const defaultPrice = Number(productForm.basePrice) || (currentOpts[0]?.price ?? 0);
                      setProductForm(prev => ({
                        ...prev,
                        options: [
                          ...currentOpts,
                          { label: `Opción ${currentOpts.length + 1}`, price: defaultPrice }
                        ]
                      }));
                    }}
                    className="w-full py-2 bg-white hover:bg-blue-50 border border-dashed border-blue-300 text-blue-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Agregar otra opción / producto a la foto</span>
                  </button>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* 📦 COMBO ITEMS (INCLUYE PACK)                                 */}
                {/* ------------------------------------------------------------- */}
                {(productForm.category === 'Combos y Promos' || (productForm.includes && productForm.includes.length > 0)) && (
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase text-emerald-950 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>Artículos incluidos en el Combo / Pack</span>
                      </label>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                        {(productForm.includes?.length || 0)} items
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-tight">
                      Listá acá todo lo que incluye el pack para que el cliente lo vea detallado con tildes verdes.
                    </p>

                    <div className="space-y-1.5">
                      {(productForm.includes || []).map((inc, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <input
                            type="text"
                            value={inc}
                            onChange={(e) => {
                              const newInc = [...(productForm.includes || [])];
                              newInc[i] = e.target.value;
                              setProductForm(prev => ({ ...prev, includes: newInc }));
                            }}
                            placeholder="Ej: 5 Lts Suavizante para Ropa"
                            className="flex-1 px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:border-emerald-600"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newInc = (productForm.includes || []).filter((_, idx) => idx !== i);
                              setProductForm(prev => ({ ...prev, includes: newInc }));
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setProductForm(prev => ({
                          ...prev,
                          includes: [...(prev.includes || []), '']
                        }));
                      }}
                      className="w-full py-1.5 bg-white hover:bg-emerald-100/50 border border-dashed border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Agregar artículo incluido al pack</span>
                    </button>
                  </div>
                )}

                {/* Custom Tag & Color Customizer Section */}
                <div className="p-3.5 sm:p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <span>Etiqueta Destacada / Badge (Opcional)</span>
                    </label>
                    {productForm.tag && (
                      <span 
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase shadow-xs text-white max-w-[150px] truncate ${
                          customTagHex ? '' : (productForm.tagColor || 'bg-emerald-600')
                        }`}
                        style={customTagHex ? { backgroundColor: customTagHex } : undefined}
                      >
                        {productForm.tag}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        maxLength={25}
                        value={productForm.tag || ''}
                        onChange={(e) => setProductForm((prev) => ({ ...prev, tag: e.target.value }))}
                        placeholder="Ej: ¡Más Vendido!, Oferta, 2x1..."
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:border-blue-600"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Máx. 25 letras para mantener las tarjetas ordenadas y prolijas.
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                        <Palette className="w-3.5 h-3.5 text-blue-600" />
                        <span>Elegí el color:</span>
                      </p>
                      
                      {/* Preset color chips */}
                      <div className="flex flex-wrap gap-1.5">
                        {TAG_COLOR_PRESETS.map((preset) => (
                          <button
                            key={preset.value}
                            type="button"
                            onClick={() => {
                              setProductForm((prev) => ({ ...prev, tagColor: preset.value }));
                              setCustomTagHex('');
                            }}
                            className={`w-6 h-6 rounded-full transition-transform cursor-pointer border ${
                              productForm.tagColor === preset.value && !customTagHex
                                ? 'scale-125 ring-2 ring-slate-800 border-white shadow-sm' 
                                : 'opacity-80 hover:opacity-100 border-black/10'
                            }`}
                            style={{ backgroundColor: preset.color }}
                            title={preset.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock Availability Selector */}
                <div className="p-3.5 sm:p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <label className="block text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                    <PauseCircle className="w-4 h-4 text-blue-600" />
                    <span>Disponibilidad / Estado de Stock</span>
                  </label>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Si marcás "Sin Stock", el producto seguirá visible en la web para los clientes pero no podrán agregarlo al carrito.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setProductForm((prev) => ({ ...prev, outOfStock: false }))}
                      className={`py-2.5 px-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                        !productForm.outOfStock
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>🟢 En Stock (Disponible)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setProductForm((prev) => ({ ...prev, outOfStock: true }))}
                      className={`py-2.5 px-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                        productForm.outOfStock
                          ? 'bg-red-600 text-white border-red-600 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Ban className="w-4 h-4" />
                      <span>⏸️ Pausado / Sin Stock</span>
                    </button>
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
                    onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Detalles sobre el producto, aroma, usos recomendados..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                {/* Photo Upload Section */}
                <div className="p-3.5 sm:p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <label className="block text-xs font-black uppercase text-slate-700">
                    Foto del Producto
                  </label>

                  <div className="flex items-center gap-3 sm:gap-4">
                    {productForm?.imageUrl && (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0 shadow-sm">
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
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 hover:border-blue-500 rounded-xl text-xs font-bold text-slate-700 shadow-xs cursor-pointer hover:bg-blue-50 transition-colors"
                      >
                        <Camera className="w-4 h-4 text-blue-600" />
                        <span>{device.isComputer ? 'Elegir de mis Carpetas / Catálogo' : 'Galería / Cámara del Celu'}</span>
                      </button>

                      <input
                        type="text"
                        value={productForm?.imageUrl || ''}
                        onChange={(e) => setProductForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                        placeholder="O pegar URL de imagen aquí..."
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer (Sticky) */}
              <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/90 backdrop-blur-xs flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingProduct(false);
                    setEditingProduct(null);
                  }}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-md shadow-emerald-600/25 transition-all cursor-pointer flex items-center gap-2"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Modal Header (Sticky) */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                {isCreatingAnnouncement ? '📢 Nueva Novedad / Banner' : '✏️ Editar Novedad'}
              </h3>
              <button
                onClick={() => {
                  setIsCreatingAnnouncement(false);
                  setEditingAnnouncement(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveAnnouncement} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              
              {/* Modal Body (Scrollable) */}
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Título Principal *
                  </label>
                  <input
                    type="text"
                    required
                    value={announcementForm.title || ''}
                    onChange={(e) => setAnnouncementForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Ej: ¡Miércoles 10% de Descuento!"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Descripción o Subtítulo
                  </label>
                  <textarea
                    rows={2}
                    value={announcementForm.subtitle || announcementForm.description || ''}
                    onChange={(e) => setAnnouncementForm((prev) => ({ 
                      ...prev, 
                      subtitle: e.target.value,
                      description: e.target.value 
                    }))}
                    placeholder="Detalles de la oferta, días de validez, condiciones..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-blue-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                      Etiqueta / Tag
                    </label>
                    <input
                      type="text"
                      value={announcementForm.tag || ''}
                      onChange={(e) => setAnnouncementForm((prev) => ({ ...prev, tag: e.target.value }))}
                      placeholder="Ej: Promo Destacada"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                      Texto del Botón
                    </label>
                    <input
                      type="text"
                      value={announcementForm.ctaText || 'Consultar'}
                      onChange={(e) => setAnnouncementForm((prev) => ({ ...prev, ctaText: e.target.value }))}
                      placeholder="Ej: Ver Oferta"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                {/* Photo for Banner */}
                <div className="p-3.5 sm:p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <label className="block text-xs font-black uppercase text-slate-700">
                    Foto / Imagen del Banner
                  </label>

                  <div className="flex items-center gap-3 sm:gap-4">
                    {announcementForm?.imageUrl && (
                      <div className="w-20 h-14 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0 shadow-sm">
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
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 hover:border-blue-500 rounded-xl text-xs font-bold text-slate-700 shadow-xs cursor-pointer hover:bg-blue-50 transition-colors"
                      >
                        <Camera className="w-4 h-4 text-blue-600" />
                        <span>{device.isComputer ? 'Elegir de mis Carpetas / Catálogo' : 'Galería / Cámara del Celu'}</span>
                      </button>

                      <input
                        type="text"
                        value={announcementForm?.imageUrl || ''}
                        onChange={(e) => setAnnouncementForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                        placeholder="O pegar URL de imagen..."
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer (Sticky) */}
              <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/90 backdrop-blur-xs flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingAnnouncement(false);
                    setEditingAnnouncement(null);
                  }}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-md shadow-emerald-600/25 transition-all cursor-pointer flex items-center gap-2"
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
                  : confirmModal.confirmButtonVariant === 'primary'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {confirmModal.confirmButtonVariant === 'warning' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : confirmModal.confirmButtonVariant === 'primary' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <AlertCircle className="w-6 h-6" />
                )}
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
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
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
                  <span>Detalles de la acción:</span>
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

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer text-center"
              >
                Cancelar y Volver
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={async () => {
                  const action = confirmModal.onConfirm;
                  setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                  await action();
                }}
                className={`px-6 py-3 rounded-xl text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  confirmModal.confirmButtonVariant === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25'
                    : confirmModal.confirmButtonVariant === 'primary'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
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
        onClose={() => setImagePickerTarget((prev) => ({ ...prev, isOpen: false }))}
        onSelectImage={handleImagePicked}
        currentImageUrl={imagePickerTarget.currentUrl}
        title={imagePickerTarget.title}
        subtitle={imagePickerTarget.subtitle}
      />

    </div>
  );
};

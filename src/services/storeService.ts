import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Coupon } from '../types';
import { products as initialProducts } from '../data/products';
import { initialCoupons } from '../data/coupons';
import { siteConfig } from '../data/config';

export interface AnnouncementItem {
  id: string;
  tag: string;
  tagColor: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  fallbackUrl?: string;
  whatsappMessage?: string;
  ctaText?: string;
  updatedAt?: string;
}

const PRODUCTS_COLLECTION = 'products';
const ANNOUNCEMENTS_COLLECTION = 'announcements';
const SETTINGS_COLLECTION = 'settings';
const RESTORE_POINTS_COLLECTION = 'restore_points';
const COUPONS_COLLECTION = 'coupons';
const DEFAULT_PIN = '1234';
const LOCAL_STORAGE_RESTORE_KEY = 'laguna_local_restore_points';

export interface RestorePoint {
  id: string;
  name: string;
  note?: string;
  createdAt: string;
  productCount: number;
  announcementCount: number;
  products: Product[];
  announcements: AnnouncementItem[];
}

// Flag to track if initial seeding has already run
let isSeedingProducts = false;
let isSeedingAnnouncements = false;

/**
 * Restores all initial products into Firestore using batch operations.
 * When wipeExtras is true, also deletes any created test products not in the original catalog.
 */
export async function restoreAllInitialProducts(wipeExtras: boolean = true): Promise<number> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const existingSnap = await getDocs(productsRef);
    const initialIds = new Set(initialProducts.map(p => p.id));

    const batch = writeBatch(db);

    // Remove any created products that do not belong to the original catalog
    if (wipeExtras) {
      existingSnap.docs.forEach((docSnap) => {
        if (!initialIds.has(docSnap.id)) {
          batch.delete(docSnap.ref);
        }
      });
    }

    // Overwrite every product back to its exact initial state
    for (const prod of initialProducts) {
      const ref = doc(db, PRODUCTS_COLLECTION, prod.id);
      batch.set(ref, {
        ...prod,
        updatedAt: new Date().toISOString()
      });
    }

    await batch.commit();
    return initialProducts.length;
  } catch (err) {
    console.error('Error al restaurar catálogo inicial en Firestore:', err);
    throw err;
  }
}

/**
 * Real-time subscription to products.
 * Automatically seeds the database from `initialProducts` if Firestore is empty.
 */
export function subscribeProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (error: Error) => void
): () => void {
  const productsRef = collection(db, PRODUCTS_COLLECTION);

  // Immediately broadcast initialProducts as initial cache
  onUpdate(initialProducts);

  const unsubscribe = onSnapshot(
    productsRef,
    async (snapshot) => {
      if (snapshot.empty && !isSeedingProducts) {
        isSeedingProducts = true;
        try {
          console.log('Sembrando catálogo inicial de 54 productos en Firestore...');
          await restoreAllInitialProducts();
        } catch (e) {
          console.warn('No se pudo sembrar el catálogo en Firestore:', e);
        } finally {
          isSeedingProducts = false;
        }
        onUpdate(initialProducts);
        return;
      }

      const list: Product[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          name: data.name || '',
          category: data.category || 'Varios',
          description: data.description || '',
          imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=800',
          basePrice: typeof data.basePrice === 'number' ? data.basePrice : Number(data.basePrice) || 0,
          unitType: (data.unitType === 'unidades' ? 'unidades' : 'litros'),
          options: Array.isArray(data.options) ? data.options : [
            { label: 'Unidad', price: typeof data.basePrice === 'number' ? data.basePrice : 0 }
          ],
          includes: data.includes || [],
          tag: data.tag ? String(data.tag).trim() : undefined,
          tagColor: data.tagColor ? String(data.tagColor).trim() : undefined,
          outOfStock: Boolean(data.outOfStock || data.isOutOfStock),
          createdAt: data.createdAt ? String(data.createdAt) : undefined,
          acknowledgedAt: data.acknowledgedAt ? String(data.acknowledgedAt) : undefined
        });
      });

      if (list.length > 0) {
        onUpdate(list);
      } else {
        onUpdate(initialProducts);
      }
    },
    (err) => {
      console.warn('Error en suscripción de productos Firestore (usando catálogo local):', err);
      onUpdate(initialProducts);
      if (onError) onError(err);
    }
  );

  return unsubscribe;
}

/**
 * Helper to strip any undefined values from objects before writing to Firestore
 */
function sanitizeFirestoreObject<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = value;
    }
  }
  return clean;
}

/**
 * Saves (creates or updates) a product in Firestore.
 */
export async function saveProduct(product: Product): Promise<void> {
  const productDoc = doc(db, PRODUCTS_COLLECTION, product.id);
  const dataToSave: Record<string, any> = {
    id: product.id,
    name: product.name ? product.name.trim() : '',
    category: product.category ? product.category.trim() : 'Productos de Limpieza',
    description: product.description ? product.description.trim() : '',
    imageUrl: product.imageUrl ? product.imageUrl.trim() : '',
    basePrice: typeof product.basePrice === 'number' ? product.basePrice : Number(product.basePrice) || 0,
    unitType: product.unitType === 'unidades' ? 'unidades' : 'litros',
    options: Array.isArray(product.options) ? product.options : [],
    includes: Array.isArray(product.includes) ? product.includes : [],
    tag: product.tag ? product.tag.trim() : '',
    tagColor: product.tagColor ? product.tagColor.trim() : '',
    outOfStock: Boolean(product.outOfStock || product.isOutOfStock),
    createdAt: product.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (product.acknowledgedAt) {
    dataToSave.acknowledgedAt = product.acknowledgedAt;
  }

  await setDoc(productDoc, sanitizeFirestoreObject(dataToSave), { merge: true });
}

/**
 * Quick toggle for product in-stock vs out-of-stock status.
 */
export async function toggleProductStock(productId: string, outOfStock: boolean): Promise<void> {
  const productDoc = doc(db, PRODUCTS_COLLECTION, productId);
  await setDoc(productDoc, {
    outOfStock: Boolean(outOfStock),
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

/**
 * Deletes a product from Firestore and registers factory deletion timestamp if it's an initial product.
 */
export async function deleteProduct(productId: string): Promise<void> {
  const productDoc = doc(db, PRODUCTS_COLLECTION, productId);
  await deleteDoc(productDoc);
  // If it's a factory initial product, record deletion date so it expires after 3 or 5 days
  await recordFactoryProductDeletion(productId).catch(() => {});
}

/**
 * Marks product changes as acknowledged/accepted so it is treated as baseline and no longer alerts.
 */
export async function acknowledgeProductChanges(productId: string): Promise<void> {
  const productDoc = doc(db, PRODUCTS_COLLECTION, productId);
  await setDoc(productDoc, {
    acknowledgedAt: new Date().toISOString()
  }, { merge: true });
}

/**
 * Batch marks multiple products as acknowledged/accepted.
 */
export async function acknowledgeAllProductChanges(productIds: string[]): Promise<void> {
  if (!productIds || productIds.length === 0) return;
  const batch = writeBatch(db);
  const now = new Date().toISOString();
  for (const id of productIds) {
    const productDoc = doc(db, PRODUCTS_COLLECTION, id);
    batch.set(productDoc, { acknowledgedAt: now }, { merge: true });
  }
  await batch.commit();
}

/**
 * Real-time subscription to announcements / novedades.
 * Seeds with siteConfig.novedades.lista if empty.
 */
export function subscribeAnnouncements(
  onUpdate: (items: AnnouncementItem[]) => void,
  onError?: (error: Error) => void
): () => void {
  const ref = collection(db, ANNOUNCEMENTS_COLLECTION);

  const unsubscribe = onSnapshot(
    ref,
    async (snapshot) => {
      if (snapshot.empty && !isSeedingAnnouncements) {
        isSeedingAnnouncements = true;
        try {
          const initialList = siteConfig.novedades.lista;
          for (const item of initialList) {
            await setDoc(doc(db, ANNOUNCEMENTS_COLLECTION, item.id), {
              ...item,
              updatedAt: new Date().toISOString()
            });
          }
        } catch (e) {
          console.warn('No se pudo sembrar novedades en Firestore:', e);
          onUpdate(siteConfig.novedades.lista as AnnouncementItem[]);
        } finally {
          isSeedingAnnouncements = false;
        }
        return;
      }

      const list: AnnouncementItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          tag: data.tag || 'Novedad',
          tagColor: data.tagColor || 'bg-blue-600 text-white',
          title: data.title || '',
          subtitle: data.subtitle || data.description || '',
          description: data.description || data.subtitle || '',
          imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=1400',
          fallbackUrl: data.fallbackUrl,
          whatsappMessage: data.whatsappMessage,
          ctaText: data.ctaText || 'Consultar',
          updatedAt: data.updatedAt
        });
      });

      if (list.length > 0) {
        onUpdate(list);
      } else {
        onUpdate(siteConfig.novedades.lista as AnnouncementItem[]);
      }
    },
    (err) => {
      console.warn('Error en suscripción de novedades Firestore:', err);
      onUpdate(siteConfig.novedades.lista as AnnouncementItem[]);
      if (onError) onError(err);
    }
  );

  return unsubscribe;
}

/**
 * Saves an announcement item to Firestore.
 */
export async function saveAnnouncement(item: AnnouncementItem): Promise<void> {
  const itemDoc = doc(db, ANNOUNCEMENTS_COLLECTION, item.id);
  await setDoc(itemDoc, sanitizeFirestoreObject({
    ...item,
    updatedAt: new Date().toISOString()
  }), { merge: true });
}

/**
 * Deletes an announcement from Firestore.
 */
export async function deleteAnnouncement(id: string): Promise<void> {
  const itemDoc = doc(db, ANNOUNCEMENTS_COLLECTION, id);
  await deleteDoc(itemDoc);
}

// Flag for coupon seeding
let isSeedingCoupons = false;
const COUPONS_STATE_DOC = 'coupons_state';
const DELETED_FACTORY_DOC = 'deleted_factory_products';
const CATEGORIES_DOC = 'categories';
const SECTIONS_CONFIG_DOC = 'sections_config';

export const defaultCatalogCategories = [
  'Combos y Promos',
  'Productos de Limpieza',
  'Escobillón y Mopas',
  'Papel',
  'Bolsas',
  'Aromatizadores',
  'Control de Plagas',
  'Bazar y Decoración',
  'Otros'
];

export interface SiteSectionsConfig {
  novedadesTitulo?: string;
  novedadesSubtitulo?: string;
  novedadesEtiqueta?: string;
  catalogoTitulo?: string;
  catalogoDescripcion?: string;
  serviciosTitulo?: string;
  serviciosDescripcion?: string;
  menuInicio?: string;
  menuNovedades?: string;
  menuProductos?: string;
  menuServicios?: string;
  menuContacto?: string;
}

export interface DeletedFactoryProductEntry {
  deletedAt: string;
  dismissed?: boolean;
}

/**
 * Real-time subscription to discount coupons.
 * Allows having 0 coupons without auto-resetting or resurrecting deleted coupons.
 */
export function subscribeCoupons(
  onUpdate: (coupons: Coupon[]) => void,
  onError?: (error: Error) => void
): () => void {
  const couponsRef = collection(db, COUPONS_COLLECTION);

  const unsubscribe = onSnapshot(
    couponsRef,
    async (snapshot) => {
      // If snapshot is empty, check if initial seeding was already completed
      if (snapshot.empty) {
        const localSeeded = localStorage.getItem('laguna_coupons_seeded');
        
        // If never seeded before, check Firestore settings doc
        if (!localSeeded && !isSeedingCoupons) {
          try {
            const stateSnap = await getDoc(doc(db, SETTINGS_COLLECTION, COUPONS_STATE_DOC));
            if (!stateSnap.exists() || !stateSnap.data()?.initialized) {
              // Very first bootstrap ever: seed initial coupons
              isSeedingCoupons = true;
              const batch = writeBatch(db);
              for (const coup of initialCoupons) {
                const coupDoc = doc(db, COUPONS_COLLECTION, coup.code.toUpperCase());
                batch.set(coupDoc, {
                  ...coup,
                  code: coup.code.toUpperCase(),
                  updatedAt: new Date().toISOString()
                });
              }
              batch.set(doc(db, SETTINGS_COLLECTION, COUPONS_STATE_DOC), {
                initialized: true,
                updatedAt: new Date().toISOString()
              }, { merge: true });
              await batch.commit();
              localStorage.setItem('laguna_coupons_seeded', 'true');
              onUpdate(initialCoupons);
              return;
            }
          } catch (e) {
            console.warn('Error verificando estado de cupones:', e);
          } finally {
            isSeedingCoupons = false;
          }
        }

        // If it was already initialized or user deleted all coupons, keep list empty as desired!
        onUpdate([]);
        return;
      }

      // Snapshot has coupons
      localStorage.setItem('laguna_coupons_seeded', 'true');
      const list: Coupon[] = [];
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          code: (data.code || docSnap.id).toUpperCase(),
          discountType: data.discountType === 'fixed' ? 'fixed' : 'percentage',
          discountValue: Number(data.discountValue) || 0,
          description: data.description || '',
          minSpend: typeof data.minSpend === 'number' ? data.minSpend : Number(data.minSpend) || 0,
          appliesTo: data.appliesTo === 'combos' ? 'combos' : 'all',
          active: data.active !== false,
          expiresAt: data.expiresAt || undefined,
          badgeText: data.badgeText || undefined,
          updatedAt: data.updatedAt
        });
      });

      onUpdate(list);
    },
    (err) => {
      console.warn('Error en suscripción de cupones Firestore:', err);
      if (onError) onError(err);
    }
  );

  return unsubscribe;
}

/**
 * Saves (creates or updates) a coupon in Firestore.
 */
export async function saveCoupon(coupon: Coupon): Promise<void> {
  const code = coupon.code.trim().toUpperCase();
  const couponDoc = doc(db, COUPONS_COLLECTION, code);
  await setDoc(couponDoc, sanitizeFirestoreObject({
    ...coupon,
    code,
    discountValue: Number(coupon.discountValue) || 0,
    minSpend: Number(coupon.minSpend) || 0,
    active: Boolean(coupon.active),
    updatedAt: new Date().toISOString()
  }), { merge: true });

  // Mark initialized
  localStorage.setItem('laguna_coupons_seeded', 'true');
  try {
    await setDoc(doc(db, SETTINGS_COLLECTION, COUPONS_STATE_DOC), {
      initialized: true,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch {}
}

/**
 * Deletes a coupon from Firestore.
 */
export async function deleteCoupon(code: string): Promise<void> {
  const cleanCode = code.trim().toUpperCase();
  const couponDoc = doc(db, COUPONS_COLLECTION, cleanCode);
  await deleteDoc(couponDoc);
  // Ensure we keep initialized flag so it doesn't auto-reset
  localStorage.setItem('laguna_coupons_seeded', 'true');
}

/**
 * Deletes ALL coupons from Firestore in a single batch operation.
 * Leaves the coupon collection completely empty without auto-resetting.
 */
export async function deleteAllCoupons(): Promise<void> {
  const couponsSnap = await getDocs(collection(db, COUPONS_COLLECTION));
  const batch = writeBatch(db);
  couponsSnap.docs.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });
  // Record that coupons are intentionally empty
  batch.set(doc(db, SETTINGS_COLLECTION, COUPONS_STATE_DOC), {
    initialized: true,
    emptyAt: new Date().toISOString()
  }, { merge: true });
  await batch.commit();
  localStorage.setItem('laguna_coupons_seeded', 'true');
}

/**
 * Quick toggle for coupon active status.
 */
export async function toggleCouponStatus(code: string, active: boolean): Promise<void> {
  const cleanCode = code.trim().toUpperCase();
  const couponDoc = doc(db, COUPONS_COLLECTION, cleanCode);
  await setDoc(couponDoc, {
    active: Boolean(active),
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

/**
 * Restores initial 5 coupons explicitly when requested by admin.
 */
export async function restoreInitialCoupons(): Promise<void> {
  const batch = writeBatch(db);
  for (const coup of initialCoupons) {
    const ref = doc(db, COUPONS_COLLECTION, coup.code.toUpperCase());
    batch.set(ref, {
      ...coup,
      code: coup.code.toUpperCase(),
      updatedAt: new Date().toISOString()
    });
  }
  batch.set(doc(db, SETTINGS_COLLECTION, COUPONS_STATE_DOC), {
    initialized: true,
    restoredAt: new Date().toISOString()
  }, { merge: true });
  await batch.commit();
  localStorage.setItem('laguna_coupons_seeded', 'true');
}

/**
 * Verifies admin PIN (defaults to 1234 if not configured).
 */
export async function verifyAdminPin(enteredPin: string): Promise<boolean> {
  try {
    const authDoc = await getDoc(doc(db, SETTINGS_COLLECTION, 'auth'));
    if (authDoc.exists()) {
      const storedPin = authDoc.data()?.adminPin;
      if (storedPin) {
        return enteredPin.trim() === String(storedPin).trim();
      }
    }
  } catch (e) {
    console.warn('No se pudo verificar PIN en Firestore, usando PIN por defecto:', e);
  }
  return enteredPin.trim() === DEFAULT_PIN;
}

/**
 * Updates admin PIN in Firestore.
 */
export async function setAdminPin(newPin: string): Promise<void> {
  const authDoc = doc(db, SETTINGS_COLLECTION, 'auth');
  await setDoc(authDoc, {
    adminPin: newPin.trim(),
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

/**
 * Restores all initial 3 announcements/banners into Firestore.
 * When wipeExtras is true, deletes any additional announcements created by the user.
 */
export async function restoreAllInitialAnnouncements(wipeExtras: boolean = true): Promise<number> {
  try {
    const announcementsRef = collection(db, ANNOUNCEMENTS_COLLECTION);
    const existingSnap = await getDocs(announcementsRef);
    const initialList = siteConfig.novedades.lista as AnnouncementItem[];
    const initialIds = new Set(initialList.map(a => a.id));

    const batch = writeBatch(db);

    // Delete created announcements not in initial factory list
    if (wipeExtras) {
      existingSnap.docs.forEach((docSnap) => {
        if (!initialIds.has(docSnap.id)) {
          batch.delete(docSnap.ref);
        }
      });
    }

    // Restore the factory initial 3 banners
    for (const item of initialList) {
      const ref = doc(db, ANNOUNCEMENTS_COLLECTION, item.id);
      batch.set(ref, {
        ...item,
        updatedAt: new Date().toISOString()
      });
    }

    await batch.commit();
    return initialList.length;
  } catch (err) {
    console.error('Error al restaurar novedades originales en Firestore:', err);
    throw err;
  }
}

/**
 * Reads local restore points from localStorage.
 */
function getLocalRestorePoints(): RestorePoint[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_RESTORE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Saves local restore points into localStorage.
 */
function saveLocalRestorePoints(points: RestorePoint[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_RESTORE_KEY, JSON.stringify(points));
  } catch (e) {
    console.warn('No se pudo guardar punto de restauración en localStorage:', e);
  }
}

/**
 * Creates a new Restore Point (Snapshot) of current products and announcements.
 * Stored both in Firestore and localStorage.
 */
export async function createRestorePoint(customName?: string, note?: string): Promise<RestorePoint> {
  try {
    // Fetch live products
    const productsSnap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    const currentProducts: Product[] = [];
    if (!productsSnap.empty) {
      productsSnap.forEach(d => {
        const data = d.data();
        currentProducts.push({
          id: d.id,
          name: data.name || '',
          category: data.category || 'Varios',
          description: data.description || '',
          imageUrl: data.imageUrl || '',
          basePrice: typeof data.basePrice === 'number' ? data.basePrice : Number(data.basePrice) || 0,
          unitType: data.unitType === 'unidades' ? 'unidades' : 'litros',
          options: Array.isArray(data.options) ? data.options : [{ label: 'Unidad', price: Number(data.basePrice) || 0 }],
          includes: data.includes || []
        });
      });
    } else {
      currentProducts.push(...initialProducts);
    }

    // Fetch live announcements
    const announcementsSnap = await getDocs(collection(db, ANNOUNCEMENTS_COLLECTION));
    const currentAnnouncements: AnnouncementItem[] = [];
    if (!announcementsSnap.empty) {
      announcementsSnap.forEach(d => {
        const data = d.data();
        currentAnnouncements.push({
          id: d.id,
          tag: data.tag || 'Novedad',
          tagColor: data.tagColor || 'bg-blue-600 text-white',
          title: data.title || '',
          subtitle: data.subtitle || data.description || '',
          description: data.description || data.subtitle || '',
          imageUrl: data.imageUrl || '',
          fallbackUrl: data.fallbackUrl,
          whatsappMessage: data.whatsappMessage,
          ctaText: data.ctaText || 'Consultar',
          updatedAt: data.updatedAt
        });
      });
    } else {
      currentAnnouncements.push(...(siteConfig.novedades.lista as AnnouncementItem[]));
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    const pointId = `punto-${Date.now()}`;
    const point: RestorePoint = {
      id: pointId,
      name: customName?.trim() || `Copia ${formattedDate} (${currentProducts.length} productos)`,
      note: note?.trim() || '',
      createdAt: now.toISOString(),
      productCount: currentProducts.length,
      announcementCount: currentAnnouncements.length,
      products: currentProducts,
      announcements: currentAnnouncements
    };

    // Save to Firestore
    try {
      const pointDoc = doc(db, RESTORE_POINTS_COLLECTION, pointId);
      await setDoc(pointDoc, point);
    } catch (fsErr) {
      console.warn('Guardando punto sólo local por error en Firestore:', fsErr);
    }

    // Save to localStorage as redundancy
    const localList = getLocalRestorePoints();
    const updatedLocal = [point, ...localList.filter(p => p.id !== pointId)].slice(0, 20); // Keep max 20 points
    saveLocalRestorePoints(updatedLocal);

    return point;
  } catch (err) {
    console.error('Error al crear punto de restauración:', err);
    throw err;
  }
}

/**
 * Real-time subscription to saved Restore Points.
 */
export function subscribeRestorePoints(
  onUpdate: (points: RestorePoint[]) => void
): () => void {
  const pointsRef = collection(db, RESTORE_POINTS_COLLECTION);

  // Send local points immediately
  const initialLocal = getLocalRestorePoints();
  if (initialLocal.length > 0) {
    onUpdate(initialLocal);
  }

  const unsubscribe = onSnapshot(
    pointsRef,
    (snapshot) => {
      const list: RestorePoint[] = [];
      snapshot.forEach(d => {
        const data = d.data() as RestorePoint;
        if (data && data.id) {
          list.push({
            id: d.id,
            name: data.name || 'Punto Guardado',
            note: data.note || '',
            createdAt: data.createdAt || new Date().toISOString(),
            productCount: typeof data.productCount === 'number' ? data.productCount : (data.products?.length || 0),
            announcementCount: typeof data.announcementCount === 'number' ? data.announcementCount : (data.announcements?.length || 0),
            products: Array.isArray(data.products) ? data.products : [],
            announcements: Array.isArray(data.announcements) ? data.announcements : []
          });
        }
      });

      // Sort by newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      if (list.length > 0) {
        saveLocalRestorePoints(list);
        onUpdate(list);
      } else {
        const local = getLocalRestorePoints();
        onUpdate(local);
      }
    },
    (err) => {
      console.warn('Error suscribiendo a puntos en Firestore, usando copia local:', err);
      onUpdate(getLocalRestorePoints());
    }
  );

  return unsubscribe;
}

/**
 * Restores products and announcements from a specific Restore Point.
 */
export async function restoreFromPoint(point: RestorePoint): Promise<{ productsCount: number; announcementsCount: number }> {
  try {
    if (!point || !Array.isArray(point.products)) {
      throw new Error('El punto de restauración no contiene productos válidos.');
    }

    // 1. Restore Products
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const existingProductsSnap = await getDocs(productsRef);
    const targetProductIds = new Set(point.products.map(p => p.id));

    // Chunk batches if more than 400 operations
    const pBatch = writeBatch(db);

    // Delete products not in target point
    existingProductsSnap.docs.forEach(docSnap => {
      if (!targetProductIds.has(docSnap.id)) {
        pBatch.delete(docSnap.ref);
      }
    });

    // Write products from target point
    point.products.forEach(prod => {
      const ref = doc(db, PRODUCTS_COLLECTION, prod.id);
      pBatch.set(ref, {
        ...prod,
        updatedAt: new Date().toISOString()
      });
    });

    await pBatch.commit();

    // 2. Restore Announcements if present in point
    let announcementsCount = 0;
    if (Array.isArray(point.announcements) && point.announcements.length > 0) {
      const announcementsRef = collection(db, ANNOUNCEMENTS_COLLECTION);
      const existingAnnounceSnap = await getDocs(announcementsRef);
      const targetAnnounceIds = new Set(point.announcements.map(a => a.id));

      const aBatch = writeBatch(db);

      existingAnnounceSnap.docs.forEach(docSnap => {
        if (!targetAnnounceIds.has(docSnap.id)) {
          aBatch.delete(docSnap.ref);
        }
      });

      point.announcements.forEach(item => {
        const ref = doc(db, ANNOUNCEMENTS_COLLECTION, item.id);
        aBatch.set(ref, {
          ...item,
          updatedAt: new Date().toISOString()
        });
      });

      await aBatch.commit();
      announcementsCount = point.announcements.length;
    }

    return {
      productsCount: point.products.length,
      announcementsCount
    };
  } catch (err) {
    console.error('Error al restaurar desde punto de guardado:', err);
    throw err;
  }
}

/**
 * Deletes a Restore Point from Firestore and local storage.
 */
export async function deleteRestorePoint(pointId: string): Promise<void> {
  try {
    const pointDoc = doc(db, RESTORE_POINTS_COLLECTION, pointId);
    await deleteDoc(pointDoc);
  } catch (e) {
    console.warn('Error eliminando punto en Firestore:', e);
  }

  const localList = getLocalRestorePoints();
  saveLocalRestorePoints(localList.filter(p => p.id !== pointId));
}

/* ========================================================================= */
/* DELETED FACTORY PRODUCTS (EXPIRATION & DISMISSAL)                         */
/* ========================================================================= */

const LOCAL_STORAGE_DELETED_FACTORY_KEY = 'laguna_deleted_factory_products';
const LOCAL_STORAGE_EXPIRATION_DAYS_KEY = 'laguna_factory_expiration_days';

/**
 * Reads local cached deleted factory products.
 */
function getLocalDeletedFactory(): Record<string, DeletedFactoryProductEntry> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DELETED_FACTORY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalDeletedFactory(data: Record<string, DeletedFactoryProductEntry>): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_DELETED_FACTORY_KEY, JSON.stringify(data));
  } catch {}
}

/**
 * Records a factory product deletion with timestamp.
 */
export async function recordFactoryProductDeletion(productId: string): Promise<void> {
  const isFactory = initialProducts.some(p => p.id === productId);
  if (!isFactory) return;

  const now = new Date().toISOString();
  const current = getLocalDeletedFactory();
  current[productId] = { deletedAt: now, dismissed: false };
  saveLocalDeletedFactory(current);

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, DELETED_FACTORY_DOC);
    await setDoc(docRef, {
      [productId]: { deletedAt: now, dismissed: false }
    }, { merge: true });
  } catch (e) {
    console.warn('No se pudo guardar registro de producto de fábrica eliminado en Firestore:', e);
  }
}

/**
 * Dismisses a deleted factory product so it disappears immediately from the restore list.
 */
export async function dismissDeletedFactoryProduct(productId: string): Promise<void> {
  const current = getLocalDeletedFactory();
  if (current[productId]) {
    current[productId].dismissed = true;
  } else {
    current[productId] = { deletedAt: new Date().toISOString(), dismissed: true };
  }
  saveLocalDeletedFactory(current);

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, DELETED_FACTORY_DOC);
    await setDoc(docRef, {
      [productId]: { dismissed: true, dismissedAt: new Date().toISOString() }
    }, { merge: true });
  } catch (e) {
    console.warn('Error descartando producto de fábrica:', e);
  }
}

/**
 * Dismisses ALL deleted factory products at once.
 */
export async function dismissAllDeletedFactoryProducts(productIds: string[]): Promise<void> {
  const current = getLocalDeletedFactory();
  const payload: Record<string, any> = {};
  const now = new Date().toISOString();

  productIds.forEach((id) => {
    current[id] = { deletedAt: current[id]?.deletedAt || now, dismissed: true };
    payload[id] = { dismissed: true, dismissedAt: now };
  });

  saveLocalDeletedFactory(current);

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, DELETED_FACTORY_DOC);
    await setDoc(docRef, payload, { merge: true });
  } catch (e) {
    console.warn('Error descartando todos los productos de fábrica eliminados:', e);
  }
}

/**
 * Real-time subscription to deleted factory products map.
 */
export function subscribeDeletedFactoryProducts(
  onUpdate: (data: Record<string, DeletedFactoryProductEntry>) => void
): () => void {
  const docRef = doc(db, SETTINGS_COLLECTION, DELETED_FACTORY_DOC);

  // Send local cache first
  onUpdate(getLocalDeletedFactory());

  const unsubscribe = onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data() as Record<string, DeletedFactoryProductEntry>;
      saveLocalDeletedFactory(data);
      onUpdate(data);
    } else {
      onUpdate(getLocalDeletedFactory());
    }
  }, (err) => {
    console.warn('Error escuchando deleted_factory_products:', err);
    onUpdate(getLocalDeletedFactory());
  });

  return unsubscribe;
}

/**
 * Saves expiration days setting (e.g. 3 or 5 days).
 */
export async function saveFactoryExpirationDays(days: number): Promise<void> {
  const cleanDays = days === 5 ? 5 : 3;
  localStorage.setItem(LOCAL_STORAGE_EXPIRATION_DAYS_KEY, String(cleanDays));
  try {
    await setDoc(doc(db, SETTINGS_COLLECTION, 'factory_expiration'), {
      days: cleanDays,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch {}
}

/**
 * Subscribes to expiration days preference (3 or 5 days).
 */
export function subscribeFactoryExpirationDays(onUpdate: (days: number) => void): () => void {
  const localVal = Number(localStorage.getItem(LOCAL_STORAGE_EXPIRATION_DAYS_KEY));
  onUpdate(localVal === 5 ? 5 : 3);

  const docRef = doc(db, SETTINGS_COLLECTION, 'factory_expiration');
  const unsubscribe = onSnapshot(docRef, (snap) => {
    if (snap.exists() && typeof snap.data()?.days === 'number') {
      const d = snap.data()?.days === 5 ? 5 : 3;
      localStorage.setItem(LOCAL_STORAGE_EXPIRATION_DAYS_KEY, String(d));
      onUpdate(d);
    }
  }, () => {});

  return unsubscribe;
}

/* ========================================================================= */
/* CATEGORIES / SECTIONS MANAGEMENT                                          */
/* ========================================================================= */

const LOCAL_STORAGE_CATEGORIES_KEY = 'laguna_catalog_categories';

/**
 * Reads local cached categories.
 */
export function getLocalCategories(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);
    if (!raw) return defaultCatalogCategories;
    const list = JSON.parse(raw);
    return Array.isArray(list) && list.length > 0 ? list : defaultCatalogCategories;
  } catch {
    return defaultCatalogCategories;
  }
}

/**
 * Real-time subscription to catalog categories.
 */
export function subscribeCategories(onUpdate: (categories: string[]) => void): () => void {
  const docRef = doc(db, SETTINGS_COLLECTION, CATEGORIES_DOC);

  // Send cache immediately
  onUpdate(getLocalCategories());

  const unsubscribe = onSnapshot(docRef, async (snap) => {
    if (snap.exists() && Array.isArray(snap.data()?.list) && snap.data()?.list.length > 0) {
      const list = snap.data()?.list as string[];
      localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(list));
      onUpdate(list);
    } else {
      // If doc does not exist, seed default list
      try {
        await setDoc(docRef, {
          list: defaultCatalogCategories,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch {}
      onUpdate(defaultCatalogCategories);
    }
  }, (err) => {
    console.warn('Error escuchando categorías:', err);
    onUpdate(getLocalCategories());
  });

  return unsubscribe;
}

/**
 * Saves updated list of categories.
 */
export async function saveCategories(categories: string[]): Promise<void> {
  const cleanList = Array.from(new Set(categories.map(c => c.trim()).filter(Boolean)));
  localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(cleanList));

  const docRef = doc(db, SETTINGS_COLLECTION, CATEGORIES_DOC);
  await setDoc(docRef, {
    list: cleanList,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

/**
 * Renames a category across all products in Firestore and in the categories list.
 * Returns the number of affected products.
 */
export async function renameCategory(oldName: string, newName: string): Promise<number> {
  const trimmedOld = oldName.trim();
  const trimmedNew = newName.trim();

  if (!trimmedOld || !trimmedNew || trimmedOld === trimmedNew) {
    return 0;
  }

  // 1. Fetch products
  const productsSnap = await getDocs(collection(db, PRODUCTS_COLLECTION));
  const batch = writeBatch(db);
  let updatedCount = 0;

  productsSnap.docs.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.category === trimmedOld) {
      batch.set(docSnap.ref, {
        category: trimmedNew,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      updatedCount++;
    }
  });

  // 2. Update categories list in settings
  const currentCats = getLocalCategories();
  const newCatList = currentCats.map(c => c === trimmedOld ? trimmedNew : c);
  if (!newCatList.includes(trimmedNew)) {
    newCatList.push(trimmedNew);
  }
  const cleanNewCats = Array.from(new Set(newCatList.map(c => c.trim()).filter(Boolean)));

  const catDoc = doc(db, SETTINGS_COLLECTION, CATEGORIES_DOC);
  batch.set(catDoc, {
    list: cleanNewCats,
    updatedAt: new Date().toISOString()
  }, { merge: true });

  await batch.commit();
  localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(cleanNewCats));

  return updatedCount;
}

/**
 * Deletes an unused category from the list.
 */
export async function deleteCategory(categoryName: string): Promise<void> {
  const trimmed = categoryName.trim();
  const current = getLocalCategories();
  const updated = current.filter(c => c !== trimmed);
  await saveCategories(updated);
}

/* ========================================================================= */
/* WEBSITE SECTIONS CONFIGURATION (TITLES & SUBTITLES)                       */
/* ========================================================================= */

const LOCAL_STORAGE_SECTIONS_KEY = 'laguna_site_sections_config';

export function getLocalSectionsConfig(): SiteSectionsConfig {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SECTIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Subscribes to custom section titles and descriptions.
 */
export function subscribeSiteSectionsConfig(onUpdate: (config: SiteSectionsConfig) => void): () => void {
  const docRef = doc(db, SETTINGS_COLLECTION, SECTIONS_CONFIG_DOC);

  // Send local cache immediately
  onUpdate(getLocalSectionsConfig());

  const unsubscribe = onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data() as SiteSectionsConfig;
      localStorage.setItem(LOCAL_STORAGE_SECTIONS_KEY, JSON.stringify(data));
      onUpdate(data);
    } else {
      onUpdate(getLocalSectionsConfig());
    }
  }, (err) => {
    console.warn('Error escuchando configuración de secciones:', err);
    onUpdate(getLocalSectionsConfig());
  });

  return unsubscribe;
}

/**
 * Saves custom section titles and descriptions to Firestore.
 */
export async function saveSiteSectionsConfig(config: SiteSectionsConfig): Promise<void> {
  localStorage.setItem(LOCAL_STORAGE_SECTIONS_KEY, JSON.stringify(config));
  const docRef = doc(db, SETTINGS_COLLECTION, SECTIONS_CONFIG_DOC);
  await setDoc(docRef, {
    ...config,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

/**
 * Resets site section titles back to initial factory values.
 */
export async function resetSiteSectionsConfig(): Promise<void> {
  localStorage.removeItem(LOCAL_STORAGE_SECTIONS_KEY);
  const docRef = doc(db, SETTINGS_COLLECTION, SECTIONS_CONFIG_DOC);
  await deleteDoc(docRef).catch(() => {});
}

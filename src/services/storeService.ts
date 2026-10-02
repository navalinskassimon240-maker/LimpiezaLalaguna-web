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
import { Product } from '../types';
import { products as initialProducts } from '../data/products';
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
          includes: data.includes || []
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
 * Saves (creates or updates) a product in Firestore.
 */
export async function saveProduct(product: Product): Promise<void> {
  const productDoc = doc(db, PRODUCTS_COLLECTION, product.id);
  await setDoc(productDoc, {
    ...product,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

/**
 * Deletes a product from Firestore.
 */
export async function deleteProduct(productId: string): Promise<void> {
  const productDoc = doc(db, PRODUCTS_COLLECTION, productId);
  await deleteDoc(productDoc);
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
  await setDoc(itemDoc, {
    ...item,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

/**
 * Deletes an announcement from Firestore.
 */
export async function deleteAnnouncement(id: string): Promise<void> {
  const itemDoc = doc(db, ANNOUNCEMENTS_COLLECTION, id);
  await deleteDoc(itemDoc);
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


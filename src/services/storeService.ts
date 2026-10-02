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
const DEFAULT_PIN = '1234';

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

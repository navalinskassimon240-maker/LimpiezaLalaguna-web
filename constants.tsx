
import { Product, ProductCategory } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'lav1',
    name: 'Lavandina Concentrada',
    description: 'Máxima pureza para desinfección total de superficies y baños.',
    price: 90,
    category: ProductCategory.BATHROOM,
    image: 'https://images.unsplash.com/photo-1584622781564-1d9876a13d00?auto=format&fit=crop&q=80&w=400',
    unit: '1 Litro',
    stock: 50
  },
  {
    id: 'jab1',
    name: 'Jabon Liquido para Ropa',
    description: 'Fórmula activa para limpieza profunda con aroma fresco.',
    price: 320,
    category: ProductCategory.LAUNDRY,
    image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&q=80&w=400',
    unit: '3 Litros',
    stock: 20
  },
  {
    id: 'det1',
    name: 'Detergente Ultra',
    description: 'Elimina la grasa más difícil de tus platos con una sola gota.',
    price: 110,
    category: ProductCategory.KITCHEN,
    image: 'https://images.unsplash.com/photo-1603533200714-3507d9154f31?auto=format&fit=crop&q=80&w=400',
    unit: '750ml',
    stock: 100
  }
];

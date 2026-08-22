
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  image: string;
  unit: string;
  stock: number;
}

export enum ProductCategory {
  KITCHEN = 'Cocina',
  BATHROOM = 'Baño',
  FLOORS = 'Pisos',
  LAUNDRY = 'Lavandería',
  INDUSTRIAL = 'Industrial',
  TOOLS = 'Herramientas'
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
  backgroundUrl: string;
  authMethod?: 'Google' | 'Apple';
  role?: 'admin' | 'user';
  subscribed?: boolean;
}

export interface Promotion {
  id: string;
  title: string;
  message: string;
  image?: string;
  sentAt: Date;
}

// Fixed: Explicitly export ShippingMethod and PaymentMethod types for use in CartDrawer.tsx
export type ShippingMethod = 'pickup' | 'delivery';
export type PaymentMethod = 'transfer' | 'cash';

export interface OrderInfo {
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  address?: string;
}

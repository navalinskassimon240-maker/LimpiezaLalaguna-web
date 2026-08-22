export interface ProductOption {
  label: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category?: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  unitType: 'litros' | 'unidades';
  options: ProductOption[];
  includes?: string[];
}

export interface CartItem extends Omit<Product, 'options'> {
  cartItemId: string;
  quantity: number;
  selectedOption: ProductOption;
  price: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

import { Coupon } from '../types';

/**
 * =========================================================================================
 * 🎟️ CUPONES DE DESCUENTO OFICIALES - LIMPIEZA LA LAGUNA
 * =========================================================================================
 */

export const initialCoupons: Coupon[] = [
  {
    code: 'LAGUNA10',
    discountType: 'percentage',
    discountValue: 10,
    description: '10% OFF de Inauguración en toda la tienda online',
    minSpend: 0,
    appliesTo: 'all',
    active: true,
    badgeText: '10% OFF INAUGURACIÓN'
  },
  {
    code: 'BIENVENIDA',
    discountType: 'percentage',
    discountValue: 15,
    description: '15% OFF de Bienvenida para tu primer pedido (mín. $5.000)',
    minSpend: 5000,
    appliesTo: 'all',
    active: true,
    badgeText: '15% OFF PRIMER PEDIDO'
  },
  {
    code: 'LIMPIEZA20',
    discountType: 'percentage',
    discountValue: 20,
    description: '20% OFF en compras mayores a $15.000',
    minSpend: 15000,
    appliesTo: 'all',
    active: true,
    badgeText: '20% OFF SUPERIOR A $15.000'
  },
  {
    code: 'VECINO',
    discountType: 'fixed',
    discountValue: 1500,
    description: '$1.500 de regalo para clientes de Chascomús (mín. $8.000)',
    minSpend: 8000,
    appliesTo: 'all',
    active: true,
    badgeText: '$1.500 REGALO'
  },
  {
    code: 'COMBOAHORRO',
    discountType: 'percentage',
    discountValue: 10,
    description: '10% OFF extra en todos los Combos y Packs de Ahorro',
    minSpend: 0,
    appliesTo: 'combos',
    active: true,
    badgeText: '10% OFF EN COMBOS'
  }
];

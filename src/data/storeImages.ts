export interface StoreImageItem {
  id: string;
  name: string;
  category: string;
  path: string;
}

export const STORE_PRESET_IMAGES: StoreImageItem[] = [
  { id: 'combo-10l', name: 'Combo Ahorro x10L', category: 'Combos', path: '/IMG/ComboX10.png' },
  { id: 'combo-25l', name: 'Combo Ahorro x25L', category: 'Combos', path: '/IMG/ComboX25.png' },
  { id: 'cloro', name: 'Cloro Puro / Concentrado', category: 'Químicos', path: '/IMG/cloro.png' },
  { id: 'lavandina', name: 'Lavandina Clásica / Concentrada', category: 'Químicos', path: '/IMG/Lavandina.png' },
  { id: 'detergente', name: 'Detergente Vajilla Ultra', category: 'Limpieza', path: '/IMG/Detergente.png' },
  { id: 'suavizante', name: 'Suavizante de Ropa', category: 'Lavandería', path: '/IMG/suavizante.png' },
  { id: 'jabon-liquido', name: 'Jabón Líquido Ariel / Skip', category: 'Lavandería', path: '/IMG/JabonLiquidoTArielskip.png' },
  { id: 'desodorante-piso', name: 'Desodorante para Pisos', category: 'Perfumería', path: '/IMG/DesodorantePiso.png' },
  { id: 'concentrado-piso', name: 'Concentrado de Pisos', category: 'Perfumería', path: '/IMG/ConcentradoPiso.png' },
  { id: 'mopa-giratoria', name: 'Mopa Giratoria / Algodón', category: 'Mopas', path: '/IMG/mopa.png' },
  { id: 'mopa-amarilla', name: 'Mopa Microfibra Amarilla', category: 'Mopas', path: '/IMG/mopaAmarilla.png' },
  { id: 'secador-piso', name: 'Secador de Piso Reforzado', category: 'Escobas', path: '/IMG/secador.png' },
  { id: 'escoba-piso-duras', name: 'Escoba Cerdas Duras', category: 'Escobas', path: '/IMG/EscobaPisoCerdasDuras.png' },
  { id: 'escoba-sina-dura', name: 'Escoba Sina Cerdas Duras', category: 'Escobas', path: '/IMG/EscobaSinaCerdaDura.png' },
  { id: 'escobillon-curvo', name: 'Escobillón Curvo', category: 'Escobas', path: '/IMG/escobillonCurvo.png' },
  { id: 'escobillon-laqueado', name: 'Escobillón Laqueado', category: 'Escobas', path: '/IMG/escobillonLaqueado.png' },
  { id: 'escobillon-recto', name: 'Escobillón Recto', category: 'Escobas', path: '/IMG/escobillonRecto.png' },
  { id: 'escobillon-sina', name: 'Escobillón Sina', category: 'Escobas', path: '/IMG/escobillonSina.png' },
  { id: 'cepillo-coche', name: 'Cepillo Lava Coches', category: 'Cepillos', path: '/IMG/CepilloCoche.png' },
  { id: 'anden-1mt', name: 'Escobillón de Andén 1 Metro', category: 'Escobas', path: '/IMG/anden1MT.png' },
  { id: 'barrendero-40cm', name: 'Barrendero 40 cm', category: 'Escobas', path: '/IMG/barrandero40CM.png' },
  { id: 'barrendero-60cm', name: 'Barrendero 60 cm', category: 'Escobas', path: '/IMG/barrendero60CM.png' },
  { id: 'barrendero-reforzado', name: 'Barrendero Reforzado', category: 'Escobas', path: '/IMG/BarrenderoReforsado.png' },
  { id: 'logo-oficial', name: 'Logo Oficial La Laguna', category: 'Marca', path: '/IMG/logo2.png' },
  { id: 'novedad-miercoles', name: 'Banner Promo Miércoles', category: 'Banners', path: '/IMG/novedad3.png' },
  { id: 'novedad-envios', name: 'Banner Envíos Gratis', category: 'Banners', path: '/IMG/envios2.png' },
  { id: 'novedad-revendedores', name: 'Banner Atención Revendedores', category: 'Banners', path: '/IMG/novedad4.png' },
];

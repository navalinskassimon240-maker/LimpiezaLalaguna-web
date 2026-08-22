import { Product } from '../types';

/**
 * =========================================================================================
 * 📦 GESTIÓN TOTAL DEL CATÁLOGO DE PRODUCTOS (AGREGAR, EDITAR, ELIMINAR Y VER TODO)
 * =========================================================================================
 * 
 * ¡Hola! En este archivo tienes el CONTROL TOTAL de todos los productos de tu tienda.
 * 
 * 📋 GUÍA PASO A PASO PARA MODIFICAR EL CÓDIGO:
 * 
 * 🔍 1. ¿CÓMO VER TODOS LOS PRODUCTOS QUE HAY?
 *    - Desliza hacia abajo en este archivo. Están organizados por categorías claras:
 *      • Combos y Promos
 *      • Productos de Limpieza (Líquidos, Bidones, Cloro)
 *      • Escobillón y Mopas (Escobas, Secadores, Trapos, Cestos)
 *      • Papel (Rollos de cocina, Papel higiénico)
 *      • Bolsas (Residuos, Consorcio Biobag)
 *      • Aromatizadores (Aerosoles, Saphirus, Difusores)
 *      • Control de Plagas (Insecticidas, Raticidas)
 *      • Bazar y Decoración (Vasijas, Sahumerios)
 * 
 * ➕ 2. ¿CÓMO AGREGAR UN PRODUCTO NUEVO?
 *    a) Copia el siguiente bloque de plantilla:
 * 
 *    {
 *      id: 'mi-producto-nuevo',
 *      name: 'Nombre del Producto',
 *      category: 'Productos de Limpieza',
 *      description: 'Descripción corta y atractiva del producto.',
 *      imageUrl: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=800',
 *      basePrice: 2500,
 *      unitType: 'unidades', // Usar 'unidades' o 'litros'
 *      options: [
 *        { label: 'Unidad de 500ml', price: 2500 },
 *        { label: 'Bidón x 5 Lts', price: 6000 }
 *      ]
 *    },
 * 
 *    b) Pégalo dentro del arreglo `export const products: Product[] = [` más abajo.
 *    c) Cambia los valores (precio, nombre, id único, etc.). ¡Listo! Aparecerá en la web al instante.
 * 
 * ✏️ 3. ¿CÓMO MODIFICAR O CAMBIAR UN PRECIO / NOMBRE / IMAGEN?
 *    - Busca el producto por su nombre o ID.
 *    - Cambia el número en `basePrice: 5000` o en `price: 5000` dentro de `options`.
 *    - También puedes editar la `description`, el `name` o la `imageUrl`.
 * 
 * 🗑️ 4. ¿CÓMO ELIMINAR / SACAR UN PRODUCTO?
 *    - OPCIÓN A (Definitiva): Borra todo el bloque `{ id: '...', ... },` del producto.
 *    - OPCIÓN B (Temporal): Pon `//` delante de cada línea del producto para ocultarlo sin borrarlo.
 * 
 * =========================================================================================
 */

export const products: Product[] = [

  // =======================================================================================
  // 🌟 CATEGORÍA 1: COMBOS Y PROMOS (Packs Especiales)
  // =======================================================================================
  {
    id: 'combo-ahorro-10l',
    name: 'Combo Ahorro x 10 Lts',
    category: 'Combos y Promos',
    description: 'Combo ahorro especial para el lavado de ropa. Incluye bidones de 5L listos para usar.',
    imageUrl: 'https://images.unsplash.com/photo-1585836696096-7bbcfd703cb8?auto=format&fit=crop&q=80&w=800',
    basePrice: 8500,
    unitType: 'unidades',
    includes: [
      '5 Lts Suavizante para Ropa',
      '5 Lts Jabón Líquido',
      'Bidones incluidos'
    ],
    options: [
      { label: 'Combo Completo x 10 Lts (Suavizante + Jabón Líquido)', price: 8500 }
    ]
  },
  {
    id: 'combo-ahorro-25l',
    name: 'Combo Ahorro x 25 Lts',
    category: 'Combos y Promos',
    description: 'El combo más completo para la limpieza y desinfección total. Incluye los 5 bidones de 5 litros.',
    imageUrl: 'https://images.unsplash.com/photo-1584820927498-cafe4c23ccdb?auto=format&fit=crop&q=80&w=800',
    basePrice: 22000,
    unitType: 'unidades',
    includes: [
      '5 Lts Lavandina',
      '5 Lts Desodorante para Pisos',
      '5 Lts Jabón Líquido',
      '5 Lts Suavizante para Ropa',
      '5 Lts Detergente',
      'Bidones incluidos'
    ],
    options: [
      { label: 'Combo Completo x 25 Lts (5 Bidones x 5L)', price: 22000 }
    ]
  },

  // =======================================================================================
  // 🧼 CATEGORÍA 2: PRODUCTOS DE LIMPIEZA INDIVIDUALES (Lípidos y Bidones x 5L)
  // =======================================================================================
  {
    id: 'cloro-puro-5l',
    name: 'Cloro Puro x 5 Lts',
    category: 'Productos de Limpieza',
    description: 'Cloro puro de máxima concentración para desinfección profunda y piletas.',
    imageUrl: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=800',
    basePrice: 7000,
    unitType: 'litros',
    options: [
      { label: 'Bidón x 5 Lts', price: 7000 }
    ]
  },
  {
    id: 'suavizante-5l',
    name: 'Suavizante x 5 Lts',
    category: 'Productos de Limpieza',
    description: 'Suavizante para ropa perfumado. Deja tus prendas suaves con aroma duradero. Variedad de fragancias.',
    imageUrl: 'public/IMG/suavizante.png',
    basePrice: 5100,
    unitType: 'litros',
    options: [
      { label: 'Bidón x 5 Lts', price: 5100 }
    ]
  },
  {
    id: 'detergente-ultra-5l',
    name: 'Detergente Ultra x 5 Lts',
    category: 'Productos de Limpieza',
    description: 'Detergente concentrado ultra desengrasante con alto poder espumígeno para vajilla y cocina.',
    imageUrl: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&q=80&w=800',
    basePrice: 6200,
    unitType: 'litros',
    options: [
      { label: 'Bidón x 5 Lts', price: 6200 }
    ]
  },
  {
    id: 'jabon-liquido-5l',
    name: 'Jabón Líquido T/Ariel o Skip x 5 Lts',
    category: 'Productos de Limpieza',
    description: 'Jabón líquido premium para lavarropas automático y lavado a mano. Tipo Ariel o Skip.',
    imageUrl: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&q=80&w=800',
    basePrice: 5100,
    unitType: 'litros',
    options: [
      { label: 'Bidón x 5 Lts (Tipo Ariel o Skip)', price: 5100 }
    ]
  },
  {
    id: 'lavandina-5l',
    name: 'Lavandina x 5 Lts',
    category: 'Productos de Limpieza',
    description: 'Lavandina clásica desinfectante para baños, pisos y desinfección general.',
    imageUrl: 'https://images.unsplash.com/photo-1584820927498-cafe4c23ccdb?auto=format&fit=crop&q=80&w=800',
    basePrice: 3500,
    unitType: 'litros',
    options: [
      { label: 'Bidón x 5 Lts', price: 3500 }
    ]
  },
  {
    id: 'desodorante-piso-5l',
    name: 'Desodorante para Piso x 5 Lts',
    category: 'Productos de Limpieza',
    description: 'Limpiador desodorizante perfumado para todo tipo de pisos.',
    imageUrl: 'https://images.unsplash.com/photo-1629853925763-74b2f4f2de63?auto=format&fit=crop&q=80&w=800',
    basePrice: 3500,
    unitType: 'litros',
    options: [
      { label: 'Bidón x 5 Lts', price: 3500 }
    ]
  },
  {
    id: 'perfumina-5l',
    name: 'Perfumina Concentrada x 5 Lts',
    category: 'Productos de Limpieza',
    description: 'Perfumina concentrada con fragancias florales y cítricas intensas para aromatizar y limpiar pisos.',
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800',
    basePrice: 4200,
    unitType: 'litros',
    options: [
      { label: 'Bidón x 5 Lts', price: 4200 }
    ]
  },
  {
    id: 'concentrado-piso-50l',
    name: 'Concentrado para Piso (Rinde 50 Lts)',
    category: 'Productos de Limpieza',
    description: 'Botella de concentrado para preparar 50 litros de desodorante de piso. Fragancias: Citronella, Lysoform, Lavanda, Marina, etc.',
    imageUrl: 'https://images.unsplash.com/photo-1608248597369-0268a7356c9a?auto=format&fit=crop&q=80&w=800',
    basePrice: 2700,
    unitType: 'unidades',
    options: [
      { label: 'Botella Concentrado (Rinde 50L)', price: 2700 }
    ]
  },

  // =======================================================================================
  // 🧹 CATEGORÍA 3: ESCOBILLÓN, MOPA, SECADOR Y ACCESORIOS DE LIMPIEZA
  // =======================================================================================
  {
    id: 'mopa-algodon',
    name: 'Mopa de Algodón',
    category: 'Escobillón y Mopas',
    description: 'Mopa de hilado de algodón súper absorbente para limpieza de todo tipo de pisos.',
    imageUrl: 'https://images.unsplash.com/photo-1527515862127-a4fc05baf7a5?auto=format&fit=crop&q=80&w=800',
    basePrice: 4200,
    unitType: 'unidades',
    options: [
      { label: '1 Unidad', price: 4200 }
    ]
  },
  {
    id: 'mopa-sintetica',
    name: 'Mopa Sintética',
    category: 'Escobillón y Mopas',
    description: 'Mopa sintética flecos amarillos de alta durabilidad y escurrido rápido.',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
    basePrice: 4800,
    unitType: 'unidades',
    options: [
      { label: '1 Unidad', price: 4800 }
    ]
  },
  {
    id: 'secador-piragua',
    name: 'Secador Piragua',
    category: 'Escobillón y Mopas',
    description: 'Secador de piso plástico reforzado modelo piragua con goma doble de excelente arrastre.',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
    basePrice: 3200,
    unitType: 'unidades',
    options: [
      { label: '1 Unidad', price: 3200 }
    ]
  },
  {
    id: 'escobillon-recto',
    name: 'Escobillón Recto',
    category: 'Escobillón y Mopas',
    description: 'Escobillón recto con cerdas suaves para interiores y pisos delicados.',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
    basePrice: 3400,
    unitType: 'unidades',
    options: [
      { label: '1 Unidad', price: 3400 }
    ]
  },
  {
    id: 'escobillon-curvo-bicolor',
    name: 'Escobillón Curvo Bicolor',
    category: 'Escobillón y Mopas',
    description: 'Escobillón curvo bicolor ergonómico para barrer esquinas y zócalos fácilmente.',
    imageUrl: 'https://images.unsplash.com/photo-1527515862127-a4fc05baf7a5?auto=format&fit=crop&q=80&w=800',
    basePrice: 4200,
    unitType: 'unidades',
    options: [
      { label: '1 Unidad', price: 4200 }
    ]
  },
  {
    id: 'escobillon-laqueado',
    name: 'Escobillón Laqueado',
    category: 'Escobillón y Mopas',
    description: 'Escobillón con base de madera laqueada y cerdas finas tupidas de gran calidad.',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
    basePrice: 6300,
    unitType: 'unidades',
    options: [
      { label: '1 Unidad', price: 6300 }
    ]
  },
  {
    id: 'escobillon-anden-1m',
    name: 'Escobillón Andén 1 Mt',
    category: 'Escobillón y Mopas',
    description: 'Escobillón industrial de andén de 1 metro para veredas, galpones y grandes superficies.',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
    basePrice: 30000,
    unitType: 'unidades',
    options: [
      { label: '1 Metro de ancho', price: 30000 }
    ]
  },
  {
    id: 'barrendero-40cm',
    name: 'Barrendero 40 cm',
    category: 'Escobillón y Mopas',
    description: 'Cepillo barrendero reforzado de 40 cm ideal para veredas, patios y cemento.',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
    basePrice: 7100,
    unitType: 'unidades',
    options: [
      { label: '40 cm', price: 7100 }
    ]
  },
  {
    id: 'barrendero-60cm',
    name: 'Barrendero x 60 cm',
    category: 'Escobillón y Mopas',
    description: 'Cepillo barrendero reforzado de 60 cm para veredas y barrido de alto rendimiento.',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
    basePrice: 18000,
    unitType: 'unidades',
    options: [
      { label: '60 cm', price: 18000 }
    ]
  },
  {
    id: 'barrendero-reforzado',
    name: 'Barrendero Reforzado',
    category: 'Escobillón y Mopas',
    description: 'Barrendero plástico extra resistente para trabajo pesado.',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
    basePrice: 18400,
    unitType: 'unidades',
    options: [
      { label: '1 Unidad', price: 18400 }
    ]
  },
  {
    id: 'escobon-sina',
    name: 'Escobón Sina',
    category: 'Escobillón y Mopas',
    description: 'Escobón tipo Sina para exteriores, hojas y suciedad gruesa.',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
    basePrice: 5100,
    unitType: 'unidades',
    options: [
      { label: '1 Unidad', price: 5100 }
    ]
  },
  {
    id: 'escoba-sina-dura',
    name: 'Escoba Sina Cerda Dura',
    category: 'Escobillón y Mopas',
    description: 'Escoba Sina con cerdas duras para fregar pisos y barrer polvo rebelde.',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
    basePrice: 4000,
    unitType: 'unidades',
    options: [
      { label: '1 Unidad', price: 4000 }
    ]
  },
  {
    id: 'cepillo-piso-dura',
    name: 'Cepillo Piso Cerdas Duras',
    category: 'Escobillón y Mopas',
    description: 'Cepillo para fregar pisos, juntas y baldosas exteriores.',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
    basePrice: 3600,
    unitType: 'unidades',
    options: [
      { label: '1 Unidad', price: 3600 }
    ]
  },
  {
    id: 'cepillo-lava-coche',
    name: 'Cepillo Lava Coche',
    category: 'Escobillón y Mopas',
    description: 'Cepillo con cerdas súper suaves especiales para el lavado de autos sin rayar carrocería.',
    imageUrl:-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=800',
    basePrice: 4200,
    unitType: 'unidades',
    options: [
      { label: '1 Unidad', price: 4200 }
    ]
  },
  {
    id: 'cabos-madera',
    name: 'Cabos de Madera 1,20 Mts',
    category: 'Escobillón y Mopas',
    description: 'Cabos de madera con rosca estándar de 1,20 metros para escobillones y secadores.',
    imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=800',
    basePrice: 2000,
    unitType: 'unidades',
    options: [
      { label: '1,20 Mts', price: 2000 }
    ]
  },
  {
    id: 'esponja-acero',
    name: 'Esponja de Acero',
    category: 'Escobillón y Mopas',
    description: 'Esponja espiral de acero inoxidable para ollas, asaderas y manchas difíciles.',
    imageUrl: 'https://images.unsplash.com/photo-1585836696096-7bbcfd703cb8?auto=format&fit=crop&q=80&w=800',
    basePrice: 1500,
    unitType: 'unidades',
    options: [
      { label: '1 Unidad', price: 1500 }
    ]
  },
  {
    id: 'virulana-rollitos',
    name: 'Virulana (Lana de Acero)',
    category: 'Escobillón y Mopas',
    description: 'Paquete de rollitos de virulana para brillo y pulido de metales y vajilla.',
    imageUrl: 'https://images.unsplash.com/photo-1584820927498-cafe4c23ccdb?auto=format&fit=crop&q=80&w=800',
    basePrice: 1300,
    unitType: 'unidades',
    options: [
      { label: '1 Paquete', price: 1300 }
    ]
  },
  {
    id: 'cesto-basura-30l',
    name: 'Cesto para la Basura Grande con Tapa',
    category: 'Escobillón y Mopas',
    description: 'Tacho cesto de basura reforzado con tapa resistente para exterior o consorcio.',
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800',
    basePrice: 34000,
    unitType: 'unidades',
    options: [
      { label: '1 Unidad Grande con Tapa', price: 34000 }
    ]
  },
  {
    id: 'trapo-piso-rayado',
    name: 'Trapo de Piso Rayado',
    category: 'Escobillón y Mopas',
    description: 'Trapo de piso tejido de algodón reforzado de gran resistencia y absorción.',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
    basePrice: 2400,
    unitType: 'unidades',
    options: [
      { label: '1 Unidad', price: 2400 }
    ]
  },
  {
    id: 'rejilla-microfibra',
    name: 'Rejilla Microfibra Multiuso',
    category: 'Escobillón y Mopas',
    description: 'Paño de microfibra suave y ultra absorbente. No deja pelusa ni raya.',
    imageUrl: 'https://images.unsplash.com/photo-1584820927498-cafe4c23ccdb?auto=format&fit=crop&q=80&w=800',
    basePrice: 1000,
    unitType: 'unidades',
    options: [
      { label: '1 Unidad', price: 1000 }
    ]
  },
  {
    id: 'rejilla-americana',
    name: 'Rejilla Americana',
    category: 'Escobillón y Mopas',
    description: 'Rejilla americana tejida tradicional para cocina y secado de platos.',
    imageUrl: 'https://images.unsplash.com/photo-1584820927498-cafe4c23ccdb?auto=format&fit=crop&q=80&w=800',
    basePrice: 700,
    unitType: 'unidades',
    options: [
      { label: '1 Unidad', price: 700 }
    ]
  },

  // =======================================================================================
  // 🧻 CATEGORÍA 4: PAPEL Y DESCARTABLES DE COCINA Y BAÑO
  // =======================================================================================
  {
    id: 'eco-family-cocina',
    name: 'Eco Family Cocina (Rollos de cocina)',
    category: 'Papel',
    description: 'Rollos de papel de cocina súper absorbentes para uso diario.',
    imageUrl: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?auto=format&fit=crop&q=80&w=800',
    basePrice: 2300,
    unitType: 'unidades',
    options: [
      { label: 'Paquete x 3 rollos', price: 2300 }
    ]
  },
  {
    id: 'eco-family-higienico',
    name: 'Eco Family Papel Higiénico',
    category: 'Papel',
    description: 'Papel higiénico suave y rendidor. Disponible en packs de 4 y 6 rollos.',
    imageUrl: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?auto=format&fit=crop&q=80&w=800',
    basePrice: 2300,
    unitType: 'unidades',
    options: [
      { label: 'Pack x 4 rollos', price: 2300 },
      { label: 'Pack x 6 rollos', price: 3200 }
    ]
  },

  // =======================================================================================
  // 🛍️ CATEGORÍA 5: BOLSAS DE RESIDUOS Y CONSORCIO (BIOBAG)
  // =======================================================================================
  {
    id: 'bolsa-biobag-45x60',
    name: 'Bolsas Biobag 45 x 60',
    category: 'Bolsas',
    description: 'Bolsas de residuos tamaño chica 45 x 60 cm (paquete x 10 unidades).',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
    basePrice: 1100,
    unitType: 'unidades',
    options: [
      { label: 'Paquete x 10 unidades (45 x 60)', price: 1100 }
    ]
  },
  {
    id: 'bolsa-biobag-50x70',
    name: 'Bolsas Biobag 50 x 70',
    category: 'Bolsas',
    description: 'Bolsas de consorcio / residuos mediana 50 x 70 cm (paquete x 10 unidades).',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
    basePrice: 1300,
    unitType: 'unidades',
    options: [
      { label: 'Paquete x 10 unidades (50 x 70)', price: 1300 }
    ]
  },
  {
    id: 'bolsa-biobag-60x90',
    name: 'Bolsas Biobag 60 x 90',
    category: 'Bolsas',
    description: 'Bolsas de consorcio grande 60 x 90 cm (paquete x 10 unidades).',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
    basePrice: 2300,
    unitType: 'unidades',
    options: [
      { label: 'Paquete x 10 unidades (60 x 90)', price: 2300 }
    ]
  },
  {
    id: 'bolsa-biobag-80x110',
    name: 'Bolsas Biobag 80 x 110',
    category: 'Bolsas',
    description: 'Bolsas de consorcio extra grande 80 x 110 cm (paquete x 10 unidades).',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
    basePrice: 3900,
    unitType: 'unidades',
    options: [
      { label: 'Paquete x 10 unidades (80 x 110)', price: 3900 }
    ]
  },
  {
    id: 'bolsa-biobag-90x120',
    name: 'Bolsas Biobag 90 x 120',
    category: 'Bolsas',
    description: 'Bolsas de consorcio súper reforzadas 90 x 120 cm (paquete x 10 unidades).',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
    basePrice: 5300,
    unitType: 'unidades',
    options: [
      { label: 'Paquete x 10 unidades (90 x 120)', price: 5300 }
    ]
  },

  // =======================================================================================
  // 🌸 CATEGORÍA 6: AROMATIZADORES, DIFUSORES Y PERFUMERÍA AMBIENTAL
  // =======================================================================================
  {
    id: 'lysoform-aerosol',
    name: 'Lysoform Desinfectante Aerosol',
    category: 'Aromatizadores',
    description: 'Desinfectante en aerosol antibacteriano mata el 99.9% de virus y bacterias.',
    imageUrl: 'https://images.unsplash.com/photo-1584820927498-cafe4c23ccdb?auto=format&fit=crop&q=80&w=800',
    basePrice: 7000,
    unitType: 'unidades',
    options: [
      { label: 'Aerosol 360ml / 390cm3', price: 7000 }
    ]
  },
  {
    id: 'poett-aerosol',
    name: 'Poett Aromatizante en Aerosol',
    category: 'Aromatizadores',
    description: 'Aromatizante en aerosol Poett con deliciosas fragancias duraderas (consultar variedad).',
    imageUrl: 'https://images.unsplash.com/photo-1629853925763-74b2f4f2de63?auto=format&fit=crop&q=80&w=800',
    basePrice: 6000,
    unitType: 'unidades',
    options: [
      { label: 'Aerosol 360ml', price: 6000 }
    ]
  },
  {
    id: 'saphirus-textil',
    name: 'Saphirus Aromatizador Textil / Gatillo',
    category: 'Aromatizadores',
    description: 'Aromatizador ambiental y textil en gatillo spray Saphirus. Gran variedad de fragancias.',
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800',
    basePrice: 5600,
    unitType: 'unidades',
    options: [
      { label: 'Botella con gatillo 250ml / 500ml', price: 5600 }
    ]
  },
  {
    id: 'difusor-saphirus',
    name: 'Difusor Aromático Saphirus con Varillas',
    category: 'Aromatizadores',
    description: 'Difusor aromático continuo con varillas de bambú Saphirus.',
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800',
    basePrice: 7200,
    unitType: 'unidades',
    options: [
      { label: '1 Difusor con varillas', price: 7200 }
    ]
  },
  {
    id: 'aromatizador-aerosol-auto',
    name: 'Aromatizador Aerosol Automático',
    category: 'Aromatizadores',
    description: 'Repuesto de aerosol para dispensador automático (consultar por aparato dosificador).',
    imageUrl: 'https://images.unsplash.com/photo-1629853925763-74b2f4f2de63?auto=format&fit=crop&q=80&w=800',
    basePrice: 6000,
    unitType: 'unidades',
    options: [
      { label: 'Repuesto Aerosol', price: 6000 }
    ]
  },
  {
    id: 'sahumerios',
    name: 'Sahumerios Aromáticos',
    category: 'Aromatizadores',
    description: 'Paquetes de sahumerios de finos aromas (consultar fragancias disponibles).',
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800',
    basePrice: 1300,
    unitType: 'unidades',
    options: [
      { label: '1 Paquete', price: 1300 }
    ]
  },
  {
    id: 'esferas-magicas',
    name: 'Esferas Mágicas de Aroma',
    category: 'Aromatizadores',
    description: 'Caja de esferas aromáticas para sahumado, purificación y aroma en el hogar.',
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800',
    basePrice: 10000,
    unitType: 'unidades',
    options: [
      { label: '1 Caja', price: 10000 }
    ]
  },

  // =======================================================================================
  // 🐜 CATEGORÍA 7: CONTROL DE PLAGAS E INSECTICIDAS
  // =======================================================================================
  {
    id: 'ultra-plus-lauchas',
    name: 'Ultra Plus Lauchas Granos (50gr)',
    category: 'Control de Plagas',
    description: 'Cebo raticida granulado de acción rápida en paquete por 50gr.',
    imageUrl: 'https://images.unsplash.com/photo-1584820927498-cafe4c23ccdb?auto=format&fit=crop&q=80&w=800',
    basePrice: 2300,
    unitType: 'unidades',
    options: [
      { label: 'Paquete x 50gr', price: 2300 }
    ]
  },
  {
    id: 'quick-killer-raticida',
    name: 'Quick Killer Raticida en Pastilla',
    category: 'Control de Plagas',
    description: 'Caja de bloques / pastillas raticidas resistentes al agua y humedad.',
    imageUrl: 'https://images.unsplash.com/photo-1584820927498-cafe4c23ccdb?auto=format&fit=crop&q=80&w=800',
    basePrice: 7300,
    unitType: 'unidades',
    options: [
      { label: '1 Caja en pastillas', price: 7300 }
    ]
  },
  {
    id: 'geltex-insecticida',
    name: 'Geltex Insecticida Jeringa',
    category: 'Control de Plagas',
    description: 'Gel insecticida cucarachicida en jeringa de alta eficacia y fácil aplicación.',
    imageUrl: 'https://images.unsplash.com/photo-1584820927498-cafe4c23ccdb?auto=format&fit=crop&q=80&w=800',
    basePrice: 3500,
    unitType: 'unidades',
    options: [
      { label: '1 Jeringa aplicadora', price: 3500 }
    ]
  },
  {
    id: 'fumixan-hogar',
    name: 'Fumixan Hogar (Fumígeno)',
    category: 'Control de Plagas',
    description: 'Comprimido fumígeno para desinsectación total de ambientes interiores.',
    imageUrl: 'https://images.unsplash.com/photo-1584820927498-cafe4c23ccdb?auto=format&fit=crop&q=80&w=800',
    basePrice: 4500,
    unitType: 'unidades',
    options: [
      { label: '1 Unidad Fumixan', price: 4500 }
    ]
  },
  {
    id: 'pegatrap',
    name: 'Pegatrap Trampa Adhesiva',
    category: 'Control de Plagas',
    description: 'Trampa adhesiva ecológica y sin veneno para roedores e insectos.',
    imageUrl: 'https://images.unsplash.com/photo-1584820927498-cafe4c23ccdb?auto=format&fit=crop&q=80&w=800',
    basePrice: 2500,
    unitType: 'unidades',
    options: [
      { label: '1 Trampa Adhesiva', price: 2500 }
    ]
  },
  {
    id: 'escudo-mata-moscas',
    name: 'Escudo Mata Moscas y Mosquitos',
    category: 'Control de Plagas',
    description: 'Insecticida en aerosol Escudo acción fulminante contra insectos voladores.',
    imageUrl: 'https://images.unsplash.com/photo-1584820927498-cafe4c23ccdb?auto=format&fit=crop&q=80&w=800',
    basePrice: 5100,
    unitType: 'unidades',
    options: [
      { label: 'Aerosol', price: 5100 }
    ]
  },
  {
    id: 'escudo-mata-cucarachas',
    name: 'Escudo Mata Cucarachas',
    category: 'Control de Plagas',
    description: 'Insecticida en aerosol Escudo de alta potencia residual contra cucarachas.',
    imageUrl: 'https://images.unsplash.com/photo-1584820927498-cafe4c23ccdb?auto=format&fit=crop&q=80&w=800',
    basePrice: 6000,
    unitType: 'unidades',
    options: [
      { label: 'Aerosol', price: 6000 }
    ]
  },

  // =======================================================================================
  // 🏺 CATEGORÍA 8: BAZAR Y DECORACIÓN ARTESANAL
  // =======================================================================================
  {
    id: 'vasijas-pequenas',
    name: 'Vasijas Pequeñas Artesanales',
    category: 'Bazar y Decoración',
    description: 'Vasijas decorativas de cerámica ideales para sahumar o decoración del hogar.',
    imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800',
    basePrice: 3000,
    unitType: 'unidades',
    options: [
      { label: '1 Vasija pequeña', price: 3000 }
    ]
  },
  {
    id: 'vasija-andina',
    name: 'Vasija Andina Rústica',
    category: 'Bazar y Decoración',
    description: 'Vasija andina artesanal de barro con soga y presentación en caja de regalo.',
    imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800',
    basePrice: 10000,
    unitType: 'unidades',
    options: [
      { label: '1 Vasija Andina con Caja', price: 10000 }
    ]
  }

];

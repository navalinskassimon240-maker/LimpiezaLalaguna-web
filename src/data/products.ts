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
 * 🖼️ ¿CÓMO PONER IMÁGENES DESDE TU CARPETA public/IMG?
 *    - Pones la foto de tu producto adentro de la carpeta `public/IMG/` (ejemplo: `suavizante.png`).
 *    - NO escribas 'public', escribí directamente la ruta con barra `/IMG/`:
 *      👉 `imageUrl: '/IMG/suavizante.png'`
 *    - O si quieres usar una imagen de internet, pon el link directo:
 *      👉 `imageUrl: 'https://images.unsplash.com/...'`
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
 *      imageUrl: '/IMG/mi-foto-de-producto.jpg', // 👈 ¡AQUÍ PONÉS TU IMAGEN DE public/IMG!
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
    imageUrl: '/IMG/ComboX10.png',
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
    imageUrl: '/IMG/ComboX25.png',
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
    imageUrl: '/IMG/cloro.png',
    basePrice: 7000,
    unitType: 'litros',
    options: [
      { label: 'Cloro x 5 Lts', price: 7000 }
    ]
  },
  {
    id: 'suavizante-5l',
    name: 'Suavizante x 5 Lts',
    category: 'Productos de Limpieza',
    description: 'Suavizante para ropa perfumado. Deja tus prendas suaves con aroma duradero. Variedad de fragancias.',
    imageUrl: '/IMG/suavizante.png',
    basePrice: 5100,
    unitType: 'litros',
    options: [
      { label: 'Suavizante blanco x5 lts', price: 5200 },
      { label: 'Suavizante celeste x5 lts', price: 5200 },
      { label: 'Suavizante lila x5 lts', price: 5200 }
    ]
  },
  {
    id: 'detergente-ultra-5l',
    name: 'Detergente Ultra x 5 Lts',
    category: 'Productos de Limpieza',
    description: 'Detergente concentrado ultra desengrasante con alto poder espumígeno para vajilla y cocina.',
    imageUrl: 'IMG/Detergente.png',
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
    imageUrl: '/IMG/JabonLiquidoTArielskip.png',
    basePrice: 5100,
    unitType: 'litros',
    options: [
      { label: 'Jabon T/Ariel', price: 5100 },
      { label: 'Jabon T/Skip', price: 5100 }
    ]
  },
  {
    id: 'lavandina-5l',
    name: 'Lavandina x 5 Lts',
    category: 'Productos de Limpieza',
    description: 'Lavandina clásica desinfectante para baños, pisos y desinfección general.',
    imageUrl: '/IMG/Lavandina.png',
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
    imageUrl: '/IMG/DesodorantePiso.png',
    basePrice: 3500,
    unitType: 'litros',
    options: [
      { label: 'Bidón x 5 Lts', price: 3500 }
    ]
  },

  {
    id: 'concentrado-piso-10l',
    name: 'Concentrado para Piso (Rinde 10Lts)',
    category: 'Productos de Limpieza',
    description: 'Botella de concentrado para preparar 510 litros de desodorante de piso. Fragancias: Citronella, Lysoform, Lavanda, Marina, etc.',
    imageUrl: '/IMG/ConcentradoPiso.png',
    basePrice: 2700,
    unitType: 'unidades',
    options: [
      { label: 'Citronella', price: 2700 },
      { label: 'Lysoform', price: 2700 },
      { label: 'Lavanda', price: 2700 },
      { label: 'Marina', price: 2700 },
      { label: 'Colonia', price: 2700 },
      { label: 'Limón', price: 2700 },
      { label: 'Flores Blancas', price: 2700 },
      { label: 'Cítrico', price: 2700 },
      { label: 'Frutos rojos', price: 2700 },
      { label: 'Arpege', price: 2700 },
      { label: 'Procenex', price: 2700 },
      { label: 'Espadol', price: 2700 }
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
    imageUrl: '/IMG/mopa.png',
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
    imageUrl: '/IMG/mopaAmarilla.png',
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
    imageUrl: '/IMG/secador.png',
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
    imageUrl: '/IMG/escobillonRecto.png',
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
    imageUrl: '/IMG/escobillonCurvo.png',
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
    imageUrl: '/IMG/escobillonLaqueado.png',
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
    imageUrl: '/IMG/anden1MT.png',
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
    imageUrl: '/IMG/barrandero40CM.png',
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
    imageUrl: '/IMG/barrendero60CM.png',
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
    imageUrl: '/IMG/BarrenderoReforsado.png',
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
    imageUrl: '/IMG/escobillonSina.png',
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
    imageUrl: '/IMG/EscobaSinaCerdaDura.png',
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
    imageUrl: '/IMG/EscobaPisoCerdasDuras.png',
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
    imageUrl: '/IMG/CepilloCoche.png',
    basePrice: 4200,
    unitType: 'unidades',
    options: [
      { label: '1 Unidad', price: 4200 }
    ]
  }
  

];
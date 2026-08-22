import React from 'react';
import { 
  Home, 
  Briefcase, 
  Wind, 
  ShieldCheck, 
  Sparkles, 
  Droplets, 
  Truck, 
  ShoppingBag,
  Award,
  HeartHandshake
} from 'lucide-react';
import promoMiercolesImg from '../assets/images/promo_miercoles_la_laguna_1787353634962.jpg';

/**
 * =========================================================================================
 * 🌟 PANEL DE CONTROL Y CONFIGURACIÓN MAESTRA DE LA PÁGINA WEB
 * =========================================================================================
 * 
 * ¡Bienvenido/a! Desde este único archivo puedes personalizar y cambiar ABSOLUTAMENTE TODO 
 * en tu página web: nombres, teléfonos, textos, promociones, horarios, servicios, colores, 
 * mensajes de WhatsApp, botones, dirección y formas de pago.
 * 
 * Está organizado en 14 SECCIONES numeradas para que encuentres cualquier detalle al instante.
 * 
 * 💡 TIPS DE EDICIÓN:
 * 1. Los textos van siempre entre comillas: "Mi texto aquí".
 * 2. Si quieres cambiar el número de WhatsApp, pon el código de país sin el signo + (ej: "5492241613188" o "2241613188").
 * 3. Para editar los productos individuales del catálogo, también puedes ver `src/data/products.ts`.
 * =========================================================================================
 */

export const siteConfig = {

  // =======================================================================================
  // 📌 SECCIÓN 1: DATOS DE LA MARCA Y LOGOTIPO
  // =======================================================================================
  marca: {
    // Nombre que aparece en la cabecera (dividido en 2 para poder darle colores distintos)
      nombrePrincipal: "La",      // Parte 1 (en azul)
    nombreResaltado: "Lalaguna",      // Parte 2 (en verde esmeralda)
    
    // Letra o inicial que va dentro del ícono del logo (si no usas imagen)
    letraIsotipo: "L",
    
    // 🖼️ IMAGEN O FOTO DEL LOGO:
    // Puedes colocar la ruta de una imagen dentro de la carpeta public (ej: "/IMG/logo.png" o "/img/logo.png")
    // o pegar la URL directa de internet (ej: "https://midominio.com/mi-logo.png").
    // Si lo dejas vacío (""), se usará la inicial letraIsotipo ("L").
    logoUrl: "/IMG/logo.png",
    
    // Eslogan corto o descripción de la marca
    eslogan: "Artículos de Limpieza, Químicos Sueltos y Perfumería",
  },

  // =======================================================================================
  // 📱 SECCIÓN 2: NÚMEROS DE WHATSAPP Y DATOS BANCARIOS (PAGOS)
  // =======================================================================================
  whatsapp: {
    // Número al que llegan todos los pedidos y consultas (sin espacios ni guiones)
    numero: "2241613188", 
    
    // Alias de Mercado Pago, CBU o Cuenta Bancaria para transferencias
    aliasTransferencia: "LIMPIEZALALAGUNA.MP",
    titularCuenta: "Limpieza Lalaguna",
    banco: "Mercado Pago / Transferencia",
  },

  // =======================================================================================
  // 📍 SECCIÓN 3: DATOS DE CONTACTO Y DIRECCIONES
  // =======================================================================================
  contacto: {
    // Teléfono que se muestra visible en el pie de página
    telefonoMostrar: "+54 9 2241 613188",
    
    // Correo electrónico de contacto
    email: "info@limpiezalalaguna.com",
    
    // Dirección física mostrada en el pie de página
    direccionPiePagina1: "Calle Principal 123",
    direccionPiePagina2: "Chascomús, Buenos Aires",
    
    // Dirección exacta donde los clientes retiran su pedido cuando eligen "Retiro en el local"
    direccionRetiroCarrito: "Av. Siempre Viva 1234, Local 5 (Chascomús)",
    
    // Mensaje de ayuda para retiros
    notaRetiro: "Te avisaremos por WhatsApp en cuanto tu pedido esté empaquetado y listo para retirar.",
  },

  // =======================================================================================
  // 🌐 SECCIÓN 4: REDES SOCIALES
  // =======================================================================================
  redesSociales: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    tiktok: "https://tiktok.com",
    googleMaps: "https://maps.google.com",
  },

  // =======================================================================================
  // 🧭 SECCIÓN 5: MENÚ DE NAVEGACIÓN (Cabecera)
  // =======================================================================================
  navegacion: {
    enlaces: [
      { nombre: 'Inicio', href: '#inicio' },
      { nombre: 'Novedades', href: '#novedades' },
      { nombre: 'Productos', href: '#productos' },
      { nombre: 'Servicios', href: '#servicios' },
      { nombre: 'Contacto', href: '#contacto' },
    ],
    textoBotonCarrito: "Ver Carrito",
    textoBotonHorarios: "Ver Horarios",
  },

  // =======================================================================================
  // 🚀 SECCIÓN 6: SECCIÓN HERO (PORTADA PRINCIPAL ARRIBA DE TODO)
  // =======================================================================================
  inicio: {
    // Pastilla/Etiqueta superior pequeña arriba del título
    etiquetaArriba: "Artículos y Servicios de Limpieza",
    
    // Título grande en 2 líneas
    tituloLinea1: "Tu espacio impecable,",
    tituloLinea2: "siempre brillante.",
    
    // Párrafo descriptivo principal
    descripcion: "LimpiezaLalaguna te ofrece productos de alta calidad y servicios de limpieza eficaces para mantener tu hogar o negocio reluciente. Fácil, rápido y al mejor precio.",
    
    // Botones de acción principales
    textoBotonPrimario: "Ver Productos",
    destinoBotonPrimario: "productos", // Hace scroll a la sección #productos
    
    textoBotonSecundario: "Nuestros Servicios",
    destinoBotonSecundario: "servicios", // Hace scroll a la sección #servicios
  },

  // =======================================================================================
  // 📢 SECCIÓN 7: AVISOS, NOVEDADES Y PROMOCIONES (SLIDER DE FOTOS)
  // =======================================================================================
  novedades: {
    tituloSeccion: "Novedades",
    subtituloSeccion: "Enterate de las últimas promociones, lanzamientos y beneficios especiales.",
    etiquetaSuperior: "Avisos & Ofertas",
    
    // Lista de banners del carrusel (puedes editar, agregar o cambiar textos e imágenes)
    lista: [
      {
        id: 'promo-miercoles',
        tag: '¡Promo Semanal Destacada!',
        tagColor: 'bg-emerald-600 text-white',
        title: 'Miércoles: 10% de Descuento',
        subtitle: 'Pagando en efectivo o transferencia bancaria en todas tus compras del día.',
        imageUrl: '/IMG/promo-miercoles.png',
        fallbackUrl: promoMiercolesImg,
        whatsappMessage: '¡Hola! Quiero aprovechar la promo del 10% de descuento de los miércoles.',
        ctaText: 'Aprovechar Descuento'
      },
      {
        id: 'promo-combo-hogar',
        tag: 'Super Ahorro',
        tagColor: 'bg-blue-600 text-white',
        title: 'Combos Ahorro x 10L y x 25L',
        subtitle: 'Combo x 10L a $8.500 (Jabón + Suavizante) y Combo x 25L a $22.000 con 5 bidones incluidos.',
        imageUrl: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=1400',
        whatsappMessage: '¡Hola! Quisiera pedir los Combos Ahorro con bidones incluidos.',
        ctaText: 'Consultar Combos'
      },
      {
        id: 'promo-bidones',
        tag: 'Mayor y Menor',
        tagColor: 'bg-emerald-600 text-white',
        title: 'Productos Sueltos y Bidones x 5 Lts',
        subtitle: 'Variedad de artículos de limpieza y desinfección de primera calidad al mejor precio.',
        imageUrl: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&q=80&w=1400',
        whatsappMessage: '¡Hola! Quería consultar por los bidones y productos de limpieza disponibles.',
        ctaText: 'Ver Productos'
      },
      {
        id: 'promo-aromas',
        tag: 'Nuevos Ingresos',
        tagColor: 'bg-purple-600 text-white',
        title: 'Línea de Perfumería y Aromatización',
        subtitle: 'Difusores de varillas, aerosoles textiles, fragancias ambientales y esencias para el hogar.',
        imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=1400',
        whatsappMessage: '¡Hola! Quisiera consultar la lista de aromas y fragancias disponibles.',
        ctaText: 'Consultar Fragancias'
      }
    ]
  },

  // =======================================================================================
  // 🛍️ SECCIÓN 8: CATÁLOGO DE PRODUCTOS (Textos, Filtros y Categorías)
  // 💡 NOTA IMPORTANTE: Para AGREGAR, EDITAR o BORRAR productos individuales del catálogo, 
  // dirígete al archivo `src/data/products.ts` donde tienes la lista completa y una guía paso a paso.
  // =======================================================================================
  catalogo: {
    titulo: "Catálogo de Productos",
    descripcion: "Descubre nuestra amplia variedad de productos sueltos, bidones x 5L y combos ahorro para tu hogar o comercio.",
    placeholderBuscador: "Buscar lavandina, suavizante, combo, mopa, bolsas...",
    mensajeSinResultados: "No encontramos productos que coincidan con tu búsqueda.",
    textoBotonLimpiarBusqueda: "Ver todos los productos",
    
    // Categorías de las pestañas de filtro
    categorias: [
      'Todos',
      'Combos y Promos',
      'Productos de Limpieza',
      'Escobillón y Mopas',
      'Papel',
      'Bolsas',
      'Aromatizadores',
      'Control de Plagas',
      'Bazar y Decoración',
    ],

    // Textos de las tarjetas de producto
    etiquetaCombo: "Pack Completo",
    textoBotonVerCombo: "Ver Combo",
    textoBotonVerProducto: "Ver Producto",
    textoBotonComprar: "Comprar / Opciones",
    monedaSimbolo: "$",
  },

  // =======================================================================================
  // 🔍 SECCIÓN 9: VENTANA MODAL DEL PRODUCTO (Detalles al hacer clic)
  // =======================================================================================
  modalProducto: {
    tituloOpciones: "Elige la presentación:",
    tituloCantidad: "Cantidad:",
    tituloIncluyeCombo: "Incluye en el Pack Completo:",
    textoBotonAgregar: "Agregar al Carrito",
    textoAgregadoExito: "¡Agregado al Carrito!",
    notaCalidad: "Garantía de calidad y máxima eficacia garantizada.",
    ayudaLitrosPersonalizados: "Ingresa la cantidad exacta de litros que deseas:",
  },

  // =======================================================================================
  // 🧹 SECCIÓN 10: SECCIÓN DE SERVICIOS DE LIMPIEZA
  // =======================================================================================
  servicios: {
    titulo: "Nuestros Servicios",
    descripcion: "En LimpiezaLalaguna nos adaptamos a tus necesidades, ofreciendo soluciones eficaces y profesionales para cada tipo de espacio.",
    
    // Lista de tarjetas de servicios
    lista: [
      {
        icono: <Home className="h-8 w-8 text-blue-600" />,
        titulo: 'Limpieza Residencial',
        descripcion: 'Dejamos tu hogar impecable. Cocinas, baños, salones y dormitorios limpios a fondo con productos seguros y de calidad.'
      },
      {
        icono: <Briefcase className="h-8 w-8 text-emerald-600" />,
        titulo: 'Limpieza de Oficinas',
        descripcion: 'Espacios de trabajo higienizados para mejorar la productividad de tu equipo y dar una excelente imagen a tus clientes.'
      },
      {
        icono: <Wind className="h-8 w-8 text-blue-600" />,
        titulo: 'Limpieza Profunda',
        descripcion: 'Ideal para mudanzas o limpiezas estacionales. Nos encargamos de los rincones más difíciles y olvidados de forma minuciosa.'
      },
      {
        icono: <ShieldCheck className="h-8 w-8 text-emerald-600" />,
        titulo: 'Desinfección Segura',
        descripcion: 'Uso de productos de alta eficacia para eliminar bacterias y virus, garantizando un entorno 100% saludable.'
      }
    ]
  },

  // =======================================================================================
  // 🛒 SECCIÓN 11: CARRITO DE COMPRAS Y FINALIZACIÓN DE PEDIDO
  // =======================================================================================
  carrito: {
    tituloCarrito: "Tu Carrito",
    tituloCheckout: "Detalles del Pedido",
    textoCarritoVacio: "Tu carrito está vacío",
    subtextoCarritoVacio: "Explora nuestro catálogo y agrega los productos de limpieza que necesitas.",
    textoBotonExplorar: "Explorar Productos",
    
    // Opciones de entrega
    opcionEnvioDomicilio: "Envío a Domicilio",
    opcionRetiroLocal: "Retiro en el Local",
    
    // Formas de pago
    opcionEfectivo: "Efectivo",
    opcionTransferencia: "Transferencia Bancaria",
    
    // Textos de los campos del formulario
    campoDireccion: "Dirección de Entrega (Calle, Número, Barrio)",
    campoNombreReceptor: "Nombre y Apellido de quien recibe",
    campoNombrePedido: "Nombre para identificar el pedido",
    campoNombreRetiro: "Nombre de la persona que retira",
    campoAclaraciones: "Notas o aclaraciones (opcional)",
    
    // Botones de acción
    textoBotonContinuar: "Continuar con el Pedido",
    textoBotonEnviarWhatsApp: "Enviar Pedido por WhatsApp",
    textoBotonVaciar: "Vaciar Carrito",
    
    // Formato del mensaje de WhatsApp que se envía
    encabezadoMensajeWhatsApp: "✨ *¡HOLA LIMPIEZALALAGUNA!* ✨\nQuiero realizar el siguiente pedido:\n\n",
    despedidaMensajeWhatsApp: "\n¡Muchas gracias! 🙌",
  },

  // =======================================================================================
  // ⏰ SECCIÓN 12: HORARIOS DE ATENCIÓN Y ESTADO DEL LOCAL (Abierto / Cerrado)
  // =======================================================================================
  horarios: {
    zonaHoraria: 'America/Argentina/Buenos_Aires',
    notaEspecial: 'Atención presencial en local y pedidos online por WhatsApp',
    
    // Textos del badge
    textoAbierto: "Abierto Ahora",
    textoCerrado: "Cerrado Ahora",
    
    // Mensajes dentro del modal de horarios
    tituloModal: "Horarios Semanales",
    subtituloModal: "Atención al Público y Entregas",
    notaFueraDeHorarioTitulo: "¿Hacés tu pedido fuera de horario?",
    notaFueraDeHorarioDesc: "Podés armar y enviar tu pedido por la web en cualquier momento. Te responderemos apenas abramos para coordinar entrega o retiro.",
    textoBotonConsultaWhatsApp: "Consultar por WhatsApp",
    
    // Configuración día por día (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
    // Puedes cambiar los horarios en formato 'HH:MM' de 24 horas (ej: '08:30', '12:30', '16:30', '20:30')
    dias: [
      {
        dayName: 'Domingo',
        dayIndex: 0,
        isOpen: false,
        shifts: []
      },
      {
        dayName: 'Lunes',
        dayIndex: 1,
        isOpen: true,
        shifts: [
          { open: '08:30', close: '12:30' },
          { open: '16:30', close: '20:30' }
        ]
      },
      {
        dayName: 'Martes',
        dayIndex: 2,
        isOpen: true,
        shifts: [
          { open: '08:30', close: '12:30' },
          { open: '16:30', close: '20:30' }
        ]
      },
      {
        dayName: 'Miércoles',
        dayIndex: 3,
        isOpen: true,
        shifts: [
          { open: '08:30', close: '12:30' },
          { open: '16:30', close: '20:30' }
        ]
      },
      {
        dayName: 'Jueves',
        dayIndex: 4,
        isOpen: true,
        shifts: [
          { open: '08:30', close: '12:30' },
          { open: '16:30', close: '20:30' }
        ]
      },
      {
        dayName: 'Viernes',
        dayIndex: 5,
        isOpen: true,
        shifts: [
          { open: '08:30', close: '12:30' },
          { open: '16:30', close: '20:30' }
        ]
      },
      {
        dayName: 'Sábado',
        dayIndex: 6,
        isOpen: true,
        shifts: [
          { open: '09:00', close: '13:00' },
          { open: '17:00', close: '20:30' }
        ]
      }
    ]
  },

  // =======================================================================================
  // 💬 SECCIÓN 13: BOTÓN FLOTANTE DE WHATSAPP (Abajo a la derecha)
  // =======================================================================================
  whatsappFlotante: {
    mensajePredeterminado: "👋 ¡Hola! Tengo una consulta sobre los productos y servicios de LimpiezaLalaguna.",
    tituloBurbuja: "¿Tenés alguna duda?",
    textoBurbuja: "Escribinos directamente a nuestro WhatsApp y te asesoramos al instante.",
    textoPillHover: "¿Dudas? Chateá acá",
  },

  // =======================================================================================
  // 📄 SECCIÓN 14: PIE DE PÁGINA (FOOTER)
  // =======================================================================================
  footer: {
    descripcionCorta: "Soluciones completas de limpieza, desinfección y perfumería para tus espacios. Productos de máxima calidad y atención personalizada.",
    tituloContacto: "Contacto Directo",
    tituloEnlaces: "Enlaces Rápidos",
    tituloHorarios: "Horarios de Atención",
    derechosReservados: "LimpiezaLalaguna - Artículos de Limpieza. Todos los derechos reservados.",
    enlacePolitica: "Política de Privacidad",
    enlaceAvisoLegal: "Aviso Legal",
  }

};

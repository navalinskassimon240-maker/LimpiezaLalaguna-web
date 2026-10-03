# 📦 Paquete de Animaciones Web (React + Motion + Tailwind)

Esta carpeta contiene todas las animaciones interactivas creadas para la tienda, listas para que puedas copiarlas y pegarlas en cualquier otra página web o proyecto React / Next.js / Vite.

---

## 🚀 Requisitos de instalación en tu proyecto

En la terminal de tu proyecto web ejecuta:

```bash
npm install motion lucide-react
```

*(Si usas Tailwind CSS, los estilos ya utilizan clases utilitarias estándar de Tailwind).*

---

## 📂 Archivos incluidos en esta carpeta (`/src/animaciones/`):

| Archivo | Qué hace |
| :--- | :--- |
| **`RevealOnScroll.tsx`** | Revela elementos suavemente con un *Fade In* hacia arriba cuando el usuario hace scroll hacia abajo. |
| **`FlyToCart.tsx`** | Animación parabólica de producto volando hacia el ícono del carrito, con efecto `+1`, vibración háptica y cartel no invasivo para seguir comprando. |
| **`ProductCardTilt.tsx`** | Tarjeta con inclinación 3D (tilt) con reflejo holográfico de luz dinámico al mover el ratón en computadoras y amortiguación táctil en celulares. |
| **`FreshnessBubbles.tsx`** | Burbujas de jabón/limpieza que flotan en el Hero y explotan interactivamente con efecto pop al hacer clic o tocarlas. |
| **`BenefitsTicker.tsx`** | Marquesina infinita fluida con degradados en los bordes y pausa al pasar el cursor encima. |
| **`haptics.ts`** | Utilidad para vibración háptica suave (`light`, `medium`, `success`) en navegadores de teléfonos móviles. |
| **`index.ts`** | Archivo para importar todo desde una sola línea. |

---

## 💡 Ejemplos de Uso Rápido

### 1. Revelado Suave al Scroll (`RevealOnScroll`)
Envuelve cualquier componente, título o sección para que aparezca suavemente cuando entre en pantalla:

```tsx
import { RevealOnScroll } from './animaciones';

export function MiSeccion() {
  return (
    <RevealOnScroll direction="up" delay={0.1}>
      <h2>Mi Título que aparece al hacer scroll</h2>
      <p>Texto con animación suave y profesional.</p>
    </RevealOnScroll>
  );
}
```

---

### 2. Producto Volando al Carrito (`FlyToCart`)

**Paso A:** Agrega el contenedor una sola vez en tu componente raíz (`App.tsx` o `layout.tsx`):
```tsx
import { FlyToCartContainer } from './animaciones';

export default function App() {
  return (
    <div>
      {/* Tu contenido */}
      
      {/* Contenedor de la animación voladora */}
      <FlyToCartContainer onOpenCart={() => alert('Abrir carrito')} />
    </div>
  );
}
```

**Paso B:** Asegúrate de que el botón de tu carrito tenga el id o clase `id="header-cart-btn"` (para computadoras) o `id="mobile-cart-btn"` (para celulares).

**Paso C:** Llama a la función al presionar "Agregar al carrito":
```tsx
import { triggerFlyToCart } from './animaciones';

function BotonAgregar({ producto }) {
  const handleClick = (e) => {
    // 1. Dispara el vuelo del producto
    triggerFlyToCart(e, producto.imagenUrl, producto.nombre);
    
    // 2. Tu lógica normal de agregar al estado
    agregarAlCarrito(producto);
  };

  return (
    <button onClick={handleClick}>
      Agregar al carrito
    </button>
  );
}
```

---

### 3. Tarjeta 3D con Reflejo de Luz (`ProductCardTilt`)

Envuelve tus tarjetas de productos para darles un aspecto premium:

```tsx
import { ProductCardTilt } from './animaciones';

function TarjetaProducto({ producto }) {
  return (
    <ProductCardTilt onClick={() => console.log('Click')}>
      <div className="p-4 bg-white rounded-2xl shadow-md">
        <img src={producto.imagen} alt={producto.nombre} className="rounded-xl w-full" />
        <h3 className="font-bold text-lg mt-2">{producto.nombre}</h3>
        <p className="text-emerald-600 font-bold">${producto.precio}</p>
      </div>
    </ProductCardTilt>
  );
}
```

---

### 4. Burbujas de Limpieza Flotantes (`FreshnessBubbles`)

Ponlo en tu portada o hero como fondo interactivo:

```tsx
import { FreshnessBubbles } from './animaciones';

export function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[500px]">
      <FreshnessBubbles />
      
      <div className="relative z-10 text-center py-20">
        <h1 className="text-4xl font-extrabold">Productos de Limpieza</h1>
      </div>
    </section>
  );
}
```

---

### 5. Marquesina Infinita (`BenefitsTicker`)

```tsx
import { BenefitsTicker } from './animaciones';

export function BarraBeneficios() {
  return (
    <BenefitsTicker 
      items={[
        { title: 'Envíos en el día', badge: 'Rápido' },
        { title: '10% OFF Efectivo', badge: 'Ahorro' },
        { title: 'Atención por WhatsApp', badge: 'Directo' }
      ]}
    />
  );
}
```

---

### 6. Vibración Háptica en Móviles (`triggerHaptic`)

```tsx
import { triggerHaptic } from './animaciones';

// Al presionar un botón:
<button onClick={() => triggerHaptic('light')}>Botón ligero</button>
<button onClick={() => triggerHaptic('success')}>Compra exitosa</button>
```

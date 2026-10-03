/**
 * Utilidad para Feedback Háptico (Vibración suave en móviles)
 * y efectos táctiles nativos.
 */

export function triggerHaptic(type: 'light' | 'medium' | 'success' | 'warning' = 'light') {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) {
    return;
  }

  try {
    switch (type) {
      case 'light':
        // Micro-pulso imperceptible y elegante (10ms)
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(18);
        break;
      case 'success':
        // Doble toque de confirmación
        navigator.vibrate([12, 50, 20]);
        break;
      case 'warning':
        navigator.vibrate([30, 40, 30]);
        break;
    }
  } catch {
    // Si el navegador bloquea la vibración, silenciamos el error
  }
}

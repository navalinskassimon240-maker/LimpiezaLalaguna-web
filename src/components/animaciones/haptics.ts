/**
 * Utilidad para Feedback Háptico (Vibración suave en móviles)
 * Funciona en navegadores Android y dispositivos compatibles con la API navigator.vibrate.
 */

export function triggerHaptic(type: 'light' | 'medium' | 'success' | 'warning' = 'light') {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) {
    return;
  }

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(10); // Toque sutil casi imperceptible
        break;
      case 'medium':
        navigator.vibrate(22); // Pulsación estándar
        break;
      case 'success':
        navigator.vibrate([12, 40, 20]); // Doble pulso festivo
        break;
      case 'warning':
        navigator.vibrate([25, 40, 30]); // Alerta suave
        break;
      default:
        navigator.vibrate(12);
    }
  } catch {
    // Si el navegador bloquea vibraciones sin gesto de usuario, ignora silenciosamente
  }
}

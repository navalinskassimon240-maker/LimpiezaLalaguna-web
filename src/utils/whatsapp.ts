/**
 * Utilidades para formatear y generar enlaces de WhatsApp con soporte completo de emojis UTF-8.
 * Usar `api.whatsapp.com/send` previene la pérdida y corrupción de emojis que ocurre en los redirects de `wa.me`.
 */

export function normalizeWhatsAppNumber(phone: string): string {
  let clean = phone.replace(/\D/g, '');
  // Si tiene 10 dígitos (ej: 2241613188 para Argentina), anteponer 549
  if (clean.length === 10) {
    clean = `549${clean}`;
  } else if (clean.startsWith('54') && !clean.startsWith('549') && clean.length === 12) {
    clean = `549${clean.slice(2)}`;
  }
  return clean;
}

export function createWhatsAppUrl(phone: string, text: string): string {
  const cleanPhone = normalizeWhatsAppNumber(phone);
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
}

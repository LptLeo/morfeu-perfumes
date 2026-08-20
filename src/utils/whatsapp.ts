import { Product } from '@/types/store';

/**
 * Cria a URL do WhatsApp formatada com mensagem codificada.
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

/**
 * Cria a mensagem personalizada de interesse para um produto específico.
 */
export function buildProductMessage(product: Product): string {
  const brandPart = product.brand ? ` (${product.brand})` : '';
  return `Olá, Marcos! Vim pelo site da Elixir n°7 e tenho interesse no decant do ${product.name}${brandPart}. Gostaria de saber mais sobre disponibilidade.`;
}

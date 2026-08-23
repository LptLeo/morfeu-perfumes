import { Product, ProductSize } from '@/types/store';
import { formatPriceCents } from '@/lib/productsRepository';

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
 * Quando um tamanho é informado, inclui tamanho e preço na mensagem.
 */
export function buildProductMessage(product: Product, size?: ProductSize): string {
  const brandPart = product.brand ? ` (${product.brand})` : '';

  if (size) {
    const priceStr = typeof size.priceCents === 'number'
      ? formatPriceCents(size.priceCents)
      : 'Preço sob consulta';
    return `Olá! Vim pelo site da Elixir n°7 e quero pedir o decant do ${product.name}${brandPart} — tamanho ${size.size} (${priceStr}).`;
  }

  return `Olá! Vim pelo site da Elixir n°7 e tenho interesse no decant do ${product.name}${brandPart}. Gostaria de saber mais sobre disponibilidade.`;
}
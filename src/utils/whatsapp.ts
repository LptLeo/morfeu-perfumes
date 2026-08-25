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
 * Quando um ou mais tamanhos são informados, inclui cada um com seu preço.
 */
export function buildProductMessage(product: Product, sizes?: ProductSize[]): string {
  const brandPart = product.brand ? ` (${product.brand})` : '';

  if (sizes && sizes.length > 0) {
    if (sizes.length === 1) {
      const s = sizes[0];
      const priceStr = typeof s.priceCents === 'number'
        ? formatPriceCents(s.priceCents)
        : 'Preço sob consulta';
      return `Olá! Vim pelo site da Elixir n°7 e quero pedir o decant do ${product.name}${brandPart} — tamanho ${s.size} (${priceStr}).`;
    }

    const items = sizes.map((s) => {
      const priceStr = typeof s.priceCents === 'number'
        ? formatPriceCents(s.priceCents)
        : 'Preço sob consulta';
      return `• ${s.size} (${priceStr})`;
    }).join('\n');
    return `Olá! Vim pelo site da Elixir n°7 e quero pedir o decant do ${product.name}${brandPart} — tamanhos:\n${items}`;
  }

  return `Olá! Vim pelo site da Elixir n°7 e tenho interesse no decant do ${product.name}${brandPart}. Gostaria de saber mais sobre disponibilidade.`;
}
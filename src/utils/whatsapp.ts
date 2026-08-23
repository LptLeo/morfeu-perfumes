import { Product, ProductSize } from '@/types/store';

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
    return `Olá! Vim pelo site da Elixir n°7 e quero pedir o decant do ${product.name}${brandPart} — tamanho ${size.size} (${size.price}).`;
  }

  return `Olá! Vim pelo site da Elixir n°7 e tenho interesse no decant do ${product.name}${brandPart}. Gostaria de saber mais sobre disponibilidade.`;
}

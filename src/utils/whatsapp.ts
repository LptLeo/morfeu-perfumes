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

/** Mapa de preenchimento dos placeholders de uma mensagem template. */
export type WhatsAppMessageFills = Record<string, string>;

/**
 * Substitui os placeholders {chave} de uma mensagem template pelos valores
 * fornecidos. Placeholders desconhecidos são preservados no texto.
 */
export function fillMessageTemplate(template: string, fills: WhatsAppMessageFills): string {
  return template.replace(/\{([^}]+)\}/g, (match, key: string) => fills[key] ?? match);
}

/** Monta os valores de preenchimento a partir de um produto e tamanhos selecionados. */
function buildProductFills(product: Product, sizes?: ProductSize[]): WhatsAppMessageFills {
  const brand = product.brand ? ` (${product.brand})` : '';

  const sizeList = sizes && sizes.length > 0 ? sizes.map((s) => s.size) : [];
  const priceList = sizes && sizes.length > 0
    ? sizes.map((s) => (typeof s.priceCents === 'number' ? formatPriceCents(s.priceCents) : 'sob consulta'))
    : [];

  return {
    'Qtde em ml': sizeList.length > 0 ? sizeList.join(', ') : 'sob consulta',
    Produto: product.name,
    Marca: brand,
    Preço: priceList.length > 0 ? priceList.join(', ') : 'sob consulta',
  };
}

/**
 * Cria a mensagem personalizada de interesse para um produto específico.
 *
 * Se um `template` for informado (campo whatsapp.productMessage no Firestore),
 * os placeholders são substituídos com os dados do produto/tamanhos:
 *   {Qtde em ml}, {Produto}, {Marca} e {Preço}.
 * Quando vazio/ausente, usa as mensagens padrão do código.
 */
export function buildProductMessage(product: Product, sizes?: ProductSize[], template?: string): string {
  if (template && template.trim()) {
    return fillMessageTemplate(template, buildProductFills(product, sizes));
  }

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
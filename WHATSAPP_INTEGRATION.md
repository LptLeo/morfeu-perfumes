# WhatsApp Integration Documentation

> Geração de URLs e mensagens personalizadas para WhatsApp Business.

---

## 📦 Visão Geral

O projeto usa **wa.me links** (WhatsApp Click-to-Chat) para iniciar conversas diretas sem necessidade de API oficial. Todas as mensagens são geradas client-side e abertas em nova aba.

### Arquivo Principal

`src/utils/whatsapp.ts` — Duas funções exportadas:
- `buildWhatsAppUrl(phone, message)` — Gera URL `https://wa.me/...`
- `buildProductMessage(product, sizes?)` — Gera mensagem personalizada

---

## 🔧 API Reference

### `buildWhatsAppUrl(phone: string, message: string): string`

```typescript
export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '');        // Remove não-dígitos
  const encodedText = encodeURIComponent(message);    // URL-safe
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
```

**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `phone` | string | Número no formato E.164 (ex: `5531998406246`) |
| `message` | string | Texto da mensagem (será encodeURIComponent) |

**Retorno:** URL completa pronta para `window.open()` ou `<a href>`

**Exemplo:**
```typescript
buildWhatsAppUrl('5531998406246', 'Olá, quero pedir um decant')
// "https://wa.me/5531998406246?text=Ol%C3%A1%2C%20quero%20pedir%20um%20decant"
```

---

### `buildProductMessage(product: Product, sizes?: ProductSize[]): string`

```typescript
export function buildProductMessage(product: Product, sizes?: ProductSize[]): string {
  const brandPart = product.brand ? ` (${product.brand})` : '';

  if (sizes && sizes.length > 0) {
    if (sizes.length === 1) {
      // Single size
      const s = sizes[0];
      const priceStr = typeof s.priceCents === 'number'
        ? formatPriceCents(s.priceCents)
        : 'Preço sob consulta';
      return `Olá! Vim pelo site da Elixir n°7 e quero pedir o decant do ${product.name}${brandPart} — tamanho ${s.size} (${priceStr}).`;
    }

    // Multiple sizes
    const items = sizes.map((s) => {
      const priceStr = typeof s.priceCents === 'number'
        ? formatPriceCents(s.priceCents)
        : 'Preço sob consulta';
      return `• ${s.size} (${priceStr})`;
    }).join('\n');
    return `Olá! Vim pelo site da Elixir n°7 e quero pedir o decant do ${product.name}${brandPart} — tamanhos:\n${items}`;
  }

  // No size (fallback)
  return `Olá! Vim pelo site da Elixir n°7 e tenho interesse no decant do ${product.name}${brandPart}. Gostaria de saber mais sobre disponibilidade.`;
}
```

**Parâmetros:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `product` | `Product` | ✅ | Objeto produto (name, brand, sizes[]) |
| `sizes` | `ProductSize[]` | ❌ | Tamanhos selecionados pelo usuário |

**Retorno:** String formatada em PT-BR

---

## 📱 Exemplos de Mensagens Geradas

### 1 Tamanho Selecionado

```
Olá! Vim pelo site da Elixir n°7 e quero pedir o decant do Le Male Elixir (Jean Paul Gaultier) — tamanho 3ml (R$ 30,00).
```

### Múltiplos Tamanhos Selecionados

```
Olá! Vim pelo site da Elixir n°7 e quero pedir o decant do Le Male Elixir (Jean Paul Gaultier) — tamanhos:
• 3ml (R$ 30,00)
• 10ml (R$ 90,00)
```

### Nenhum Tamanho (Fallback)

```
Olá! Vim pelo site da Elixir n°7 e tenho interesse no decant do Le Male Elixir (Jean Paul Gaultier). Gostaria de saber mais sobre disponibilidade.
```

### Botão Flutuante / CTA Genérico

```
Olá! Vim pelo site da Elixir n°7 e quero conhecer os perfumes disponíveis para decant.
```

### Botão "Sugerir Perfume"

```
Olá! Não encontrei no catálogo da Elixir n°7 o perfume que eu queria. Gostaria de sugerir: 
```

---

## 🎯 Pontos de Integração na Landing

| Componente | Arquivo | Uso |
|------------|---------|-----|
| `ProductCard` | `components/Catalog/ProductCard.tsx` | Botão "Encomendar no WhatsApp" — usa tamanho(s) selecionado(s) no card |
| `Hero` | `components/Hero/Hero.tsx` | Botão primário "Quero escolher meu decant" — mensagem genérica |
| `CtaFinal` | `components/CtaFinal/CtaFinal.tsx` | CTA final da página — mensagem genérica |
| `Footer` | `components/Footer/Footer.tsx` | Botão "Falar no WhatsApp" — mensagem genérica |
| `FloatingWhatsApp` | `components/FloatingWhatsApp/FloatingWhatsApp.tsx` | Botão fixo flutuante — mensagem genérica |
| `Catalog` (fallback) | `components/Catalog/Catalog.tsx` | Botão "Sugerir um perfume" — mensagem de sugestão |

### ProductCard — Lógica de Seleção

```tsx
// State: múltiplos tamanhos selecionados
const [selectedSizes, setSelectedSizes] = useState<ProductSize[]>([]);

const toggleSize = (size: ProductSize) => {
  setSelectedSizes((prev) =>
    prev.some((s) => s.size === size.size && s.priceCents === size.priceCents)
      ? prev.filter((s) => s !== size)
      : [...prev, size],
  );
};

// Link WhatsApp usa seleção ou fallback para primeiro tamanho
href={buildWhatsAppUrl(
  whatsappNumber,
  buildProductMessage(
    product,
    selectedSizes.length > 0 ? selectedSizes : product.sizes?.length ? [product.sizes[0]] : undefined
  )
)}
```

---

## 🔧 Configuração

### Número do WhatsApp

Definido em `storeInfo.whatsapp.number` (Firestore) / `storeData.json`:

```json
{
  "storeInfo": {
    "whatsapp": {
      "number": "5531998406246"
    }
  }
}
```

**Formato:** Apenas dígitos, código do país + DDD + número (E.164 sem `+`)

### Mensagens Padrão

```json
{
  "storeInfo": {
    "whatsapp": {
      "defaultMessage": "Olá! Vim pelo site da Elixir n°7 e quero conhecer os perfumes disponíveis para decant.",
      "suggestionMessage": "Olá! Não encontrei no catálogo da Elixir n°7 o perfume que eu queria. Gostaria de sugerir: "
    }
  }
}
```

Editáveis via **Admin → Textos**.

---

## 🧪 Testando Localmente

### 1. Via DevTools Console

```javascript
// No console do navegador (página da landing)
import { buildWhatsAppUrl, buildProductMessage } from '/src/utils/whatsapp.ts';

// Produto mock
const product = {
  name: 'Le Male Elixir',
  brand: 'Jean Paul Gaultier',
  sizes: [{ size: '3ml', priceCents: 3000 }]
};

// Teste
const url = buildWhatsAppUrl('5531998406246', buildProductMessage(product, product.sizes));
console.log(url);
// Abre em nova aba
window.open(url, '_blank');
```

### 2. Via ProductCard (UI)

1. Acesse `http://localhost:5173`
2. Vá ao catálogo
3. Clique em um ou mais tamanhos no card do produto
4. Clique "Encomendar no WhatsApp"
5. Verifique se a mensagem inclui os tamanhos corretos

### 3. Verificar Encoding

Mensagens com acentos/emojis devem ser codificadas corretamente:

```typescript
// Teste manual
const msg = 'Olá! Tamanho 3ml (R$ 30,00) ✨';
const encoded = encodeURIComponent(msg);
// "Ol%C3%A1%21%20Tamanho%203ml%20(R%24%2030%2C00)%20%E2%9C%A8"
```

---

## 🎨 Personalização de Mensagens

### Alterar Template

Edite `src/utils/whatsapp.ts`:

```typescript
export function buildProductMessage(product: Product, sizes?: ProductSize[]): string {
  // Template customizado
  const prefix = '🌟 Novo pedido via site Elixir n°7:\n\n';
  // ... resto da lógica
}
```

### Adicionar Campos Extras

```typescript
// Ex: incluir categoria
const catPart = product.category ? ` [${product.category}]` : '';
return `${prefix}Produto: ${product.name}${brandPart}${catPart}...`;
```

### Internacionalização (i18n)

Para suportar múltiplos idiomas:

```typescript
type Locale = 'pt-BR' | 'en-US';

export function buildProductMessage(
  product: Product,
  sizes?: ProductSize[],
  locale: Locale = 'pt-BR'
): string {
  const templates = {
    'pt-BR': { ... },
    'en-US': { ... }
  };
  // ...
}
```

---

## ⚠️ Limitações Conhecidas

| Limitação | Impacto | Workaround |
|-----------|---------|------------|
| Tamanho da URL | ~2000 chars (browser limit) | Mensagens longas com muitos tamanhos podem truncar |
| Pré-preenchimento | Não funciona no WhatsApp Web/Desktop em alguns navegadores | Usuário copia/cola manualmente |
| Tracking | Sem analytics nativo | Adicionar UTM params na URL: `?text=...&utm_source=landing` |
| Formatação | Apenas texto plano (sem markdown/negrito) | Usar Unicode: `•`, `—`, `✨` |

---

## 🔒 Segurança e Privacidade

- **Nenhum dado sensível** na URL (apenas nome do produto, tamanho, preço)
- **Número do WhatsApp** exposto no frontend (público por design)
- **Mensagem** visível no histórico do chat do usuário
- **Recomendação**: Não incluir dados pessoais (CPF, endereço) na mensagem automática

---

## 📋 Checklist de QA

- [ ] 1 tamanho selecionado → mensagem correta
- [ ] Múltiplos tamanhos → lista com bullet points
- [ ] Nenhum tamanho → fallback "Gostaria de saber mais..."
- [ ] Acentos/emojis → encoding correto na URL
- [ ] Botão flutuante → mensagem genérica
- [ ] Hero CTA → mensagem genérica
- [ ] Footer → mensagem genérica
- [ ] "Sugerir perfume" → mensagem de sugestão
- [ ] Número whatsapp configurado no admin → reflete na landing
- [ ] Mensagens personalizadas no admin → reflete na landing
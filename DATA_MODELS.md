# Data Models & Type Definitions

> Referência completa dos tipos TypeScript, estruturas Firestore e exemplos de JSON.

---

## 📦 Tipos Principais (`src/types/store.ts`)

### `Product`

```typescript
interface Product {
  id: string;                    // slug gerado automaticamente (ex: "le-male-elixir")
  name: string;                  // "Le Male Elixir"
  brand: string;                 // "Jean Paul Gaultier"
  category: string;              // Texto livre — alimenta filtros dinâmicos ("Importado", "Árabe", "Nacional")
  genero: ProductGender;         // 'masculino' | 'feminino' | 'unissex'
  sizes: ProductSize[];          // Array de tamanhos/preços
  description: string | null;    // Notas olfativas, família, etc.
  image: string | null;          // Legacy compat (landing usa 'image')
  imageUrl: string | null;       // URL real da imagem (Firebase Storage / CDN)
  imageFocus: ImageFocus | null; // { x: 0.5, y: 0.5, zoom: 1 } — ponto focal + zoom
}

type ProductGender = 'masculino' | 'feminino' | 'unissex';

interface ProductSize {
  size: string;        // Formato livre: "3ml", "5ml", "10ml", "2ml", etc.
  priceCents: number;  // Preço em centavos (ex: 3000 = R$ 30,00)
}

interface ImageFocus {
  x: number;   // 0.0–1.0 (horizontal)
  y: number;   // 0.0–1.0 (vertical)
  zoom: number; // >= 1.0
}
```

#### Exemplo JSON (produto)

```json
{
  "id": "le-male-elixir",
  "name": "Le Male Elixir",
  "brand": "Jean Paul Gaultier",
  "genero": "masculino",
  "category": "Importado",
  "sizes": [
    { "size": "3ml", "priceCents": 3000 },
    { "size": "5ml", "priceCents": 5000 },
    { "size": "10ml", "priceCents": 9000 }
  ],
  "description": "Notas de topo: cardamomo, lavanda...",
  "imageUrl": "https://cdn.exemplo.com/le-male-elixir.jpg",
  "imageFocus": { "x": 0.5, "y": 0.3, "zoom": 1.2 }
}
```

---

### `StoreData` — Configuração completa do site

Estrutura única que alimenta **toda a landing page** (textos, imagens, SEO, WhatsApp, produtos).

```typescript
interface StoreData {
  storeInfo: StoreInfo;
  hero: HeroData;
  whyDecants: WhyDecantsData;
  catalog: CatalogData;
  products: Product[];
  howItWorks: HowItWorksData;
  testimonials: TestimonialsData;
  faq: FaqData;
  ctaFinal: CtaFinalData;
  footer: FooterData;
}
```

#### Sub-tipos

```typescript
// StoreInfo — configurações globais
interface StoreInfo {
  name: string;                    // "Elixir n°7"
  tagline: string;                 // "Decants árabes & importados"
  seo: { title: string; description: string };
  whatsapp: {
    number: string;                // "5531998406246" (apenas dígitos)
    defaultMessage: string;        // Msg genérica botão flutuante
    suggestionMessage: string;     // Msg botão "Sugerir perfume"
  };
  sellerName: string;              // "Marcos"
  logo?: ImageWithFocus;           // Logo do header
}

// Hero — seção principal
interface HeroData {
  eyebrow: string;
  title: string;
  titleEmphasis: string;           // Palavra em destaque (negrito/itálico)
  description: string;
  primaryCta: string;
  secondaryCta: string;
  trustBadges: string[];           // Selos de confiança
  tagline?: string;                // Sincronizada com storeInfo.tagline
  image?: ImageWithFocus;          // Background image
  logoImage?: ImageWithFocus;      // Logo alternativa
  fallbackText: string;            // Alt text / fallback
}

// WhyDecants — benefícios
interface WhyDecantsData {
  eyebrow: string;
  title: string;
  description: string;
  items: WhyItem[];
}
interface WhyItem {
  id: string;
  icon: 'flask' | 'layers' | 'pocket' | 'sparkles';
  title: string;
  description: string;
}

// HowItWorks — passos + trust
interface HowItWorksData {
  eyebrow: string;
  title: string;
  description?: string;
  steps: StepItemData[];
  trustItems: TrustItemData[];
}
interface StepItemData {
  step: number;
  title: string;
  description: string;
}
interface TrustItemData {
  id: string;
  icon: 'shield' | 'award';
  title: string;
  description: string;
}

// Testimonials
interface TestimonialsData {
  eyebrow: string;
  title: string;
  description: string;
  items: TestimonialItem[];
}
interface TestimonialItem {
  id: string;
  stars: number;      // 1–5
  comment: string;
  author: string;
  sub: string;        // Subtítulo (ex: "Cliente desde 2023")
}

// FAQ
interface FaqData {
  eyebrow: string;
  title: string;
  items: FaqItemData[];
}
interface FaqItemData {
  id: string;
  question: string;
  answer: string;
}

// CTA Final
interface CtaFinalData {
  title: string;
  description: string;
  buttonText: string;
}

// Footer
interface FooterData {
  brand: string;
  description: string;
  buttonText: string;
  bottomTextLeft: string;
  bottomTextRight: string;
}

// Catalog
interface CatalogData {
  eyebrow: string;
  title: string;
  description: string;
  categories: CategoryOption[];
  fallbackNote: {
    title: string;
    description: string;
    ctaText: string;
  };
}
interface CategoryOption {
  id: string;
  label: string;
}

// ImageWithFocus — imagem com ponto focal
interface ImageWithFocus {
  url: string | null;
  focus?: { x: number; y: number; zoom: number } | null;
}
```

---

## 🔥 Estruturas Firestore

### Coleção: `products`

```typescript
// Documento: products/{productId}
interface ProductDoc {
  name: string;
  brand: string;
  category: string;
  genero: 'masculino' | 'feminino' | 'unissex';
  sizes: { size: string; priceCents: number }[];
  description: string | null;
  imageUrl: string | null;
  imageFocus: { x: number; y: number; zoom: number } | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}
```

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|-------|
| `name` | string | ✅ | Nome do perfume |
| `brand` | string | ✅ | Marca |
| `category` | string | ✅ | Texto livre (filtro dinâmico) |
| `genero` | string | ✅ | Enum: masculino/feminino/unissex |
| `sizes` | array | ✅ | Mínimo 1 item |
| `description` | string | ❌ | Null se vazio |
| `imageUrl` | string | ❌ | URL Firebase Storage |
| `imageFocus` | object | ❌ | {x, y, zoom} |
| `createdAt` | Timestamp | auto | Server timestamp |
| `updatedAt` | Timestamp | auto | Server timestamp |

#### Exemplo documento Firestore

```json
{
  "name": "Le Male Elixir",
  "brand": "Jean Paul Gaultier",
  "category": "Importado",
  "genero": "masculino",
  "sizes": [
    { "size": "3ml", "priceCents": 3000 },
    { "size": "5ml", "priceCents": 5000 },
    { "size": "10ml", "priceCents": 9000 }
  ],
  "description": "Notas de topo: cardamomo, lavanda...",
  "imageUrl": "https://firebasestorage.googleapis.com/...",
  "imageFocus": { "x": 0.5, "y": 0.3, "zoom": 1.2 },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-20T14:22:00.000Z"
}
```

---

### Coleção: `site_texts`

Documento único: `site_texts/content`

```typescript
// Firestore document: site_texts/content
interface SiteTextsDoc {
  hero: HeroData;
  whyDecants: WhyDecantsData;
  catalog: CatalogData;
  howItWorks: HowItWorksData;
  faq: FaqData;
  footer: FooterData;
  storeInfo: StoreInfo;
  updatedAt: string; // ISO timestamp
}
```

> **Nota**: Usa os mesmos tipos da landing (`StoreData` sem `products`). O `textsService.ts` faz merge com defaults do `storeData.json`.

---

## 🔄 Fluxo de Dados

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│  Admin UI   │────▶│  Firestore   │────▶│  Landing (Real-  │
│  (CRUD)     │     │  (source of  │     │   time listener)  │
└─────────────┘     │   truth)     │     └──────────────────┘
                    └──────────────┘              │
                           │                      ▼
                    ┌──────────────┐     ┌──────────────────┐
                    │  products/   │     │  SiteTextsContext│
                    │  site_texts  │     │  (Provider)      │
                    └──────────────┘     └──────────────────┘
```

### Landing — Leitura

| Fonte | Método | Cache |
|-------|--------|-------|
| **Produtos** | `productsRepository.listProducts()` | Não (stale-while-revalidate via UI) |
| **Textos** | `SiteTextsProvider` + `onSnapshot` | Real-time (atualiza sem reload) |
| **Fallback** | `storeData.json` (embutido no build) | Estático |

### Admin — Escrita

| Operação | Service | Regras |
|----------|---------|--------|
| Create Product | `productsService.createProduct()` | `isAdmin()` + `email_verified` |
| Update Product | `productsService.updateProduct()` | `isAdmin()` + `email_verified` |
| Delete Product | `productsService.deleteProduct()` | `isAdmin()` + `email_verified` |
| Import Catalog | `productsService.importCatalog()` | `isAdmin()` + coleção vazia |
| Save Texts | `textsService.saveSiteTexts()` | `isAdmin()` + `email_verified` |

---

## 🛠 Helpers & Utilities

### `productsRepository.ts`

```typescript
// Formata centavos → "R$ 30,00"
formatPriceCents(cents: number | null | undefined): string

// Lista produtos (ordem: createdAt desc)
listProducts(): Promise<Product[]>

// Lista categorias únicas para filtros
listCategories(): Promise<string[]> // ['Todos', 'Árabe', 'Importado', 'Nacional']

// Verifica se Firebase configurado
isFirebaseConfigured(): boolean
```

### `whatsapp.ts`

```typescript
// Gera wa.me URL
buildWhatsAppUrl(phone: string, message: string): string

// Gera mensagem personalizada
buildProductMessage(product: Product, sizes?: ProductSize[]): string
```

**Exemplos de mensagem:**

```typescript
// 1 tamanho
buildProductMessage(product, [sizes[0]])
// "Olá! Vim pelo site da Elixir n°7 e quero pedir o decant do Le Male Elixir (Jean Paul Gaultier) — tamanho 3ml (R$ 30,00)."

// Múltiplos tamanhos
buildProductMessage(product, sizes)
// "Olá! Vim pelo site da Elixir n°7 e quero pedir o decant do Le Male Elixir (Jean Paul Gaultier) — tamanhos:
// • 3ml (R$ 30,00)
// • 10ml (R$ 90,00)"

// Sem tamanho (fallback)
buildProductMessage(product)
// "Olá! Vim pelo site da Elixir n°7 e tenho interesse no decant do Le Male Elixir (Jean Paul Gaultier). Gostaria de saber mais sobre disponibilidade."
```

### `productsService.ts` — Helpers

```typescript
// Gera slug a partir do nome
slugify(name: string): string
// "Le Male Elixir" → "le-male-elixir"
// "Club de Nuit Intense" → "club-de-nuit-intense"
```

---

## 📋 Validações (Frontend)

### Produto (`ProductForm.tsx`)

| Campo | Validação |
|-------|-----------|
| `name` | Obrigatório, max 120 chars |
| `brand` | Obrigatório, max 80 chars |
| `category` | Texto livre (sugestões: Importado, Árabe, Nacional) |
| `genero` | Enum obrigatório |
| `sizes[]` | Mínimo 1, cada item: size (string) + priceCents (number > 0) |
| `description` | Opcional, max 500 chars |
| `imageUrl` | Opcional, URL válida |
| `imageFocus` | Opcional, {x, y ∈ [0,1], zoom ≥ 1} |

### Textos (`AdminTexts.tsx`)

Todos os campos são strings livres. Listas (trustBadges, whyItems, steps, faqs, trustItems) permitem add/remove/reorder.

---

## 🌱 Seed Data (`src/data/storeData.json`)

Arquivo estático com 24 produtos + textos padrão. Usado como:

1. **Fallback** se Firestore indisponível
2. **Source** para `importCatalog()` quando coleção `products` vazia
3. **Defaults** para `textsService.defaultSiteTexts`

> **Não edite em produção** — use o painel `/admin/textos` e `/admin/produtos`.
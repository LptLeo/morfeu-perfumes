export type ProductGender = 'masculino' | 'feminino' | 'unissex';

export interface ProductSize {
  size: string;
  priceCents: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string; // texto livre (alimenta filtros dinâmicos)
  genero: ProductGender;
  sizes: ProductSize[];
  description: string | null;
  image: string | null; // compat: landing usa 'image'
  imageUrl: string | null;
  imageFocus: { x: number; y: number; zoom: number; fitMode?: 'cover' | 'contain' } | null;
}

/** Opção de categoria para UI (mantido para compatibilidade) */
export interface CategoryOption {
  id: string;
  label: string;
}

export interface WhyItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface StepItemData {
  step: number;
  title: string;
  description: string;
}

export interface TestimonialItem {
  id: string;
  stars: number;
  comment: string;
  author: string;
  sub: string;
}

export interface TrustItemData {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface FaqItemData {
  id: string;
  question: string;
  answer: string;
}

export interface ImageWithFocus {
  url: string | null;
  focus?: { x: number; y: number; zoom: number; fitMode?: 'cover' | 'contain' } | null;
}

export interface StoreInfo {
  name: string;
  tagline: string;
  seo: {
    title: string;
    description: string;
  };
  whatsapp: {
    number: string;
    defaultMessage: string;
    suggestionMessage: string;
  };
  sellerName: string;
  logo?: ImageWithFocus; // Header logo with focus support
}

export interface StoreData {
  storeInfo: StoreInfo;
  hero: {
    eyebrow: string;
    title: string;
    titleEmphasis: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    trustBadges: string[];
    tagline?: string; // Tagline exibida no header (sincronizada)
    image?: ImageWithFocus; // Hero background image with focus support
    logoImage?: ImageWithFocus; // Hero logo (alternative to background image) with focus support
    fallbackText: string;
  };
  whyDecants: {
    eyebrow: string;
    title: string;
    description: string;
    items: WhyItem[];
  };
  catalog: {
    eyebrow: string;
    title: string;
    description: string;
    categories: CategoryOption[];
    fallbackNote: {
      title: string;
      description: string;
      ctaText: string;
    };
  };
  products: Product[];
  howItWorks: {
    eyebrow: string;
    title: string;
    description?: string;
    steps: StepItemData[];
    trustItems: TrustItemData[];
  };
  testimonials: {
    eyebrow: string;
    title: string;
    description: string;
    items: TestimonialItem[];
  };
  faq: {
    eyebrow: string;
    title: string;
    items: FaqItemData[];
  };
  ctaFinal: {
    title: string;
    description: string;
    buttonText: string;
  };
  footer: {
    brand: string;
    description: string;
    buttonText: string;
    bottomTextLeft: string;
    bottomTextRight: string;
  };
}

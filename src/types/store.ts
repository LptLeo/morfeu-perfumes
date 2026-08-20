export type ProductCategory = 'todos' | 'importado' | 'arabe' | 'nacional';
export type ProductGender = 'masculino' | 'feminino' | 'unissex';

export interface ProductSize {
  size: string;
  price: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  categoria: 'importado' | 'arabe' | 'nacional';
  genero: ProductGender;
  sizes: ProductSize[];
  description: string | null;
  image: string | null;
}

export interface CategoryOption {
  id: ProductCategory;
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
    steps: StepItemData[];
  };
  testimonials: {
    eyebrow: string;
    title: string;
    description: string;
    items: TestimonialItem[];
    trustItems: TrustItemData[];
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

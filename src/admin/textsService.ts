import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  type Firestore,
} from 'firebase/firestore';
import { getFirebaseApp } from '@/lib/firebase';
import type { StoreData, ImageWithFocus } from '@/types/store';

const TEXTS_COLLECTION = 'site_texts';
const TEXTS_DOC_ID = 'content';

let _db: Firestore | null = null;

export function getDb(): Firestore {
  if (!_db) {
    _db = getFirestore(getFirebaseApp());
  }
  return _db;
}

const defaultImageWithFocus = (url: string | null): ImageWithFocus => ({
  url,
  focus: { x: 0.5, y: 0.5, zoom: 1 },
});

// SiteTexts usa os mesmos tipos do storeData.json para compatibilidade total
export interface SiteTexts {
  hero: StoreData['hero'];
  whyDecants: StoreData['whyDecants'];
  catalog: StoreData['catalog'];
  howItWorks: StoreData['howItWorks'];
  faq: StoreData['faq'];
  footer: StoreData['footer'];
  storeInfo: StoreData['storeInfo'];
  updatedAt?: string;
}

/** Dados padrão (fallback do storeData.json) */
export const defaultSiteTexts: SiteTexts = {
  hero: {
    eyebrow: 'Decants · Árabes, contratipos & importados',
    title: 'Descubra seu próximo perfume favorito antes de investir no frasco inteiro.',
    titleEmphasis: 'antes',
    description: 'Fragrâncias árabes, contratipos e importados selecionados em decants — na medida certa para você experimentar na pele antes de decidir. Peça pelo WhatsApp.',
    primaryCta: 'Quero escolher meu decant',
    secondaryCta: 'Ver perfumes disponíveis',
    tagline: 'Decants árabes & importados',
    image: defaultImageWithFocus(null),
    logoImage: defaultImageWithFocus('/favicon.svg'),
    fallbackText: 'Elixir n°7 — Decants árabes & importados',
    trustBadges: ['Loja 100% online', 'Atendimento direto com Marcos', 'Curadoria de fragrâncias'],
  },
  whyDecants: {
    eyebrow: 'Por que decants',
    title: 'Experimente primeiro. Ame depois.',
    description: 'Comprar um frasco inteiro sem conhecer a fragrância na sua pele é um risco — o decant tira essa dúvida do caminho.',
    items: [
      { id: 'experimente', icon: 'flask', title: 'Experimente antes de investir', description: 'Conheça a fragrância na sua própria pele antes de comprar o frasco original.' },
      { id: 'opcoes', icon: 'layers', title: 'Mais opções para explorar', description: 'Acesse diferentes perfumes sem precisar comprar vários frascos cheios.' },
      { id: 'praticidade', icon: 'pocket', title: 'Praticidade no dia a dia', description: 'Tamanho compacto para levar na bolsa, na mochila ou na mala de viagem.' },
      { id: 'descoberta', icon: 'sparkles', title: 'Descubra novas fragrâncias', description: 'Experimente perfumes que talvez você nunca tivesse coragem de comprar no frasco inteiro.' },
    ],
  },
  catalog: {
    eyebrow: 'Catálogo',
    title: 'Escolha a fragrância que combina com você',
    description: 'Decants de 3ml, 5ml e 10ml dos perfumes mais desejados. Escolha o tamanho e peça pelo WhatsApp.',
    categories: [
      { id: 'todos', label: 'Todos' },
      { id: 'importado', label: 'Importados' },
      { id: 'arabe', label: 'Árabes & contratipos' },
      { id: 'nacional', label: 'Nacionais' },
    ],
    fallbackNote: {
      title: 'Não encontrou o perfume que procurava?',
      description: 'Nosso catálogo está sempre crescendo. Manda o nome pelo WhatsApp e a gente avalia incluir na loja.',
      ctaText: 'Sugerir um perfume',
    },
  },
  howItWorks: {
    eyebrow: 'Como funciona',
    title: 'Do interesse ao decant na sua mão',
    steps: [
      { step: 1, title: 'Escolha sua fragrância', description: 'Navegue pelo catálogo e encontre o perfume que desperta sua curiosidade.' },
      { step: 2, title: 'Fale conosco pelo WhatsApp', description: 'Clique no botão e envie seu pedido diretamente para a nossa equipe.' },
      { step: 3, title: 'Receba seu decant', description: 'Combine os detalhes finais e finalize sua compra pelo WhatsApp.' },
    ],
    trustItems: [
      { id: '1', icon: 'shield', title: 'Atendimento direto com Marcos', description: 'Tire dúvidas e finalize seu pedido falando direto com o vendedor pelo WhatsApp.' },
      { id: '2', icon: 'award', title: 'Loja especializada em decants', description: 'Foco em perfumes importados e árabes, com curadoria de fragrâncias.' },
    ],
  },
  faq: {
    eyebrow: 'Dúvidas frequentes',
    title: 'Antes de comprar, tire suas dúvidas',
    items: [
      { id: 'faq-1', question: 'O que é um decant?', answer: 'Um decant é uma pequena quantidade de um perfume original, transferida profissionalmente para um frasco menor (3ml, 5ml ou 10ml). Permite testar a fragrância na pele por dias antes de decidir comprar o frasco cheio.' },
      { id: 'faq-2', question: 'Os perfumes são originais?', answer: 'Sim. Todos os perfumes são adquiridos de distribuidores autorizados ou lojas oficiais. O decant é feito a partir do frasco original lacrado.' },
      { id: 'faq-3', question: 'Quanto tempo dura um decant?', answer: 'Um decant de 3ml rende cerca de 30–45 borrifadas (3–5 dias de uso diário). 5ml dura ~1 semana. 10ml dura ~2 semanas. Varia conforme a frequência de uso.' },
      { id: 'faq-4', question: 'Como funciona a entrega?', answer: 'Entregamos em Belo Horizonte e região metropolitana. O prazo e valor são combinados diretamente no WhatsApp. Para outras cidades, consultar disponibilidade de envio.' },
      { id: 'faq-5', question: 'Posso devolver se não gostar?', answer: 'Por se tratar de produto fracionado (aberto para decant), não aceitamos devolução por preferência olfativa. Por isso recomendamos testar primeiro com o menor tamanho (3ml).' },
      { id: 'faq-6', question: 'Como faço para sugerir um perfume que não tem no catálogo?', answer: 'Use o botão "Sugerir um perfume" no catálogo ou mande uma mensagem direta no WhatsApp. Avaliamos todas as sugestões para expandir nossa seleção.' },
    ],
  },
  footer: {
    brand: 'Elixir n°7',
    description: 'Decants de perfumes árabes, contratipos e importados. Atendimento e pedidos direto pelo WhatsApp com Marcos.',
    buttonText: 'Falar no WhatsApp',
    bottomTextLeft: 'Elixir n°7. Loja 100% online.',
    bottomTextRight: '',
  },
  storeInfo: {
    name: 'Elixir n°7',
    tagline: 'Decants árabes & importados',
    seo: {
      title: 'Elixir n°7 | Decants de Perfumes Árabes, Contratipos e Importados',
      description: 'Decants de perfumes árabes, contratipos e importados selecionados pela Elixir n°7. Experimente antes de investir no frasco — peça pelo WhatsApp.',
    },
    whatsapp: {
      number: '5531998406246',
      defaultMessage: 'Olá! Vim pelo site da Elixir n°7 e quero conhecer os perfumes disponíveis para decant.',
      suggestionMessage: 'Olá! Não encontrei no catálogo da Elixir n°7 o perfume que eu queria. Gostaria de sugerir: ',
    },
    sellerName: 'Marcos',
    logo: defaultImageWithFocus('/favicon.svg'),
  },
};

/** Busca textos do Firestore; se não existir, cria com defaults */
export async function getSiteTexts(): Promise<SiteTexts> {
  const db = getDb();
  const ref = doc(db, TEXTS_COLLECTION, TEXTS_DOC_ID);
  const snap = await getDocs(collection(db, TEXTS_COLLECTION));
  
  // Se a coleção não existe ou o doc não existe, cria com defaults
  const docSnap = snap.docs.find(d => d.id === TEXTS_DOC_ID);
  if (!docSnap) {
    await setDoc(ref, { ...defaultSiteTexts, updatedAt: new Date().toISOString() });
    return defaultSiteTexts;
  }
  
  const data = docSnap.data() as SiteTexts;
  return { ...defaultSiteTexts, ...data };
}

/** Salva textos no Firestore */
export async function saveSiteTexts(texts: Partial<SiteTexts>): Promise<void> {
  const db = getDb();
  const ref = doc(db, TEXTS_COLLECTION, TEXTS_DOC_ID);
  await setDoc(ref, { ...texts, updatedAt: new Date().toISOString() }, { merge: true });
}
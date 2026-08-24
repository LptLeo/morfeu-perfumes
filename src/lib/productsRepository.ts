/**
 * Repositório de produtos — única fonte de verdade para o catálogo.
 * - Lê do Firestore em produção
 * - Não mantém cache local persistente (stale-while-revalidate
 *   delegado ao nível de UI: a tela pinta com JSON embutido e
 *   substitui quando o Firestore responde)
 * - Falha do Firestore = estado "indisponível + retry" (sem dado velho)
 */

import {
  getFirestore,
  getDocs,
  query,
  collection,
  orderBy,
  type Firestore,
  type DocumentData,
} from 'firebase/firestore';
import { getFirebaseApp } from '@/lib/firebase';
import type { Product } from '@/types/store';

function isConfigured() {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
    appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
  };
  return Boolean(
    config.apiKey &&
    config.authDomain &&
    config.projectId &&
    config.appId
  );
}

let _db: Firestore | null = null;

export function getDb(): Firestore {
  if (!isConfigured()) throw new Error('Firebase não configurado');
  if (!_db) {
    _db = getFirestore(getFirebaseApp());
  }
  return _db;
}

/** Mapeia doc do Firestore → tipo Product da landing (com priceCents → string formatada) */
function mapDoc(id: string, data: DocumentData): Product {
  const sizes = (data.sizes ?? []).map((s: { size: string; priceCents: number }) => ({
    size: String(s.size),
    priceCents: s.priceCents,
  }));
  return {
    id,
    name: String(data.name ?? ''),
    brand: String(data.brand ?? ''),
    category: data.category ?? 'Importado',
    genero: data.genero ?? 'unissex',
    sizes,
    description: data.description ?? null,
    image: data.imageUrl ?? null, // compat
    imageUrl: data.imageUrl ?? null,
    imageFocus: data.imageFocus ?? null,
  };
}

export function formatPriceCents(cents: number | null | undefined): string {
  if (cents == null) return 'R$ 0,00';
  const reais = cents / 100;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(reais);
}

/**
 * Busca todos os produtos ordenados por createdAt (mais novos primeiro).
 * Retorna array de Product já formatados para a landing.
 * Lança se Firebase não configurado ou erro de rede/regras.
 */
export async function listProducts(): Promise<Product[]> {
  if (!isConfigured()) throw new Error('Firebase não configurado');
  const db = getDb();
  const snap = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
  return snap.docs.map((doc) => mapDoc(doc.id, doc.data()));
}

/**
 * Retorna lista ordenada de categorias únicas (para filtros dinâmicos).
 * ['Todos', ...categorias alfabéticas]
 */
export async function listCategories(): Promise<string[]> {
  const products = await listProducts();
  const set = new Set(products.map((p) => p.category).filter(Boolean));
  return ['Todos', ...Array.from(set).sort()];
}

/** Verifica se o Firebase está configurado (para UI condicional) */
export function isFirebaseConfigured(): boolean {
  return isConfigured();
}
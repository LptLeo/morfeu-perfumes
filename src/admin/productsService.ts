/**
 * Serviço de produtos do painel administrativo.
 * Escrita no Firestore exige sessão admin (rules: isAdmin()).
 */

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import type { Product } from '@/types/store';
import { getDb, formatPriceCents } from '@/lib/productsRepository';

/** Forma do documento como está no Firestore */
export interface ProductDoc {
  name: string;
  brand: string;
  category: string;
  genero: Product['genero'];
  sizes: { size: string; priceCents: number }[];
  description: string | null;
  imageUrl: string | null;
  imageFocus: { x: number; y: number; zoom: number } | null;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface AdminProduct extends ProductDoc {
  id: string;
}

function mapAdmin(id: string, data: Record<string, unknown>): AdminProduct {
  return {
    id,
    name: String(data.name ?? ''),
    brand: String(data.brand ?? ''),
    category: String(data.category ?? ''),
    genero: (data.genero as Product['genero']) ?? 'unissex',
    sizes: ((data.sizes as { size: string; priceCents: number }[]) ?? []).map((s) => ({
      size: String(s.size),
      priceCents: Number(s.priceCents),
    })),
    description: (data.description as string | null) ?? null,
    imageUrl: (data.imageUrl as string | null) ?? null,
    imageFocus: (data.imageFocus as AdminProduct['imageFocus']) ?? null,
    createdAt: (data.createdAt as Timestamp) ?? null,
    updatedAt: (data.updatedAt as Timestamp) ?? null,
  };
}

/** Lista todos os produtos (ordem alfabética por nome — ordenação manual vem na Fase 2). */
export async function listAdminProducts(): Promise<AdminProduct[]> {
  const db = getDb();
  const snap = await getDocs(query(collection(db, 'products'), orderBy('name')));
  return snap.docs.map((d) => mapAdmin(d.id, d.data()));
}

/** Cria produto novo com ID slug gerado a partir do nome. */
export async function createProduct(data: ProductDoc): Promise<string> {
  const db = getDb();
  const id = slugify(data.name);
  await setDoc(doc(db, 'products', id), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return id;
}

/** Atualiza produto existente. */
export async function updateProduct(id: string, data: ProductDoc): Promise<void> {
  const db = getDb();
  await setDoc(
    doc(db, 'products', id),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

/** Exclui produto. Confirmação é responsabilidade da UI. */
export async function deleteProduct(id: string): Promise<void> {
  const db = getDb();
  await deleteDoc(doc(db, 'products', id));
}

/**
 * Importa catálogo inicial (dataset embutido pós-migração).
 * Visível apenas quando a coleção está vazia; some após sucesso.
 * Preserva os slugs originais como IDs dos documentos.
 * Retorna quantidade importada.
 */
export async function importCatalog(items: SeedItem[]): Promise<number> {
  const db = getDb();
  let count = 0;
  for (const { seedId, ...data } of items) {
    await setDoc(doc(db, 'products', seedId), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    count++;
  }
  return count;
}

export type SeedItem = ProductDoc & { seedId: string };

// ── helpers ────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

export { formatPriceCents };

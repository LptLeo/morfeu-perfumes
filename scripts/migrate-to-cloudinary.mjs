/**
 * Migração one-off: catálogo imgbb → Cloudinary (otimizado).
 *
 * O que faz:
 *  1. Lê credenciais Cloudinary + Firebase do .env.local
 *  2. Pareia cada produto (storeData.json) com seu arquivo em src/assets/
 *     (exato → prefixo → remanescentes únicos)
 *  3. Otimiza com sharp: máx 800px de largura (sem ampliar), WebP q82
 *  4. Sobe ao Cloudinary em elixir7/products/<slug> com assinatura SHA-1
 *  5. Atualiza imageUrl no Firestore (login admin via e-mail/senha)
 *  6. Salva relatório local (gitignored) com URLs antigas/novas
 *
 * Uso: node scripts/migrate-to-cloudinary.mjs [--dry-run]
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

const ROOT = path.resolve(process.cwd());
const DRY_RUN = process.argv.includes('--dry-run');
const CLOUD = 'ix9xjjko'; // validado contra api.cloudinary.com/usage
const FOLDER = 'elixir7/products';

// ── env (.env.local — valores podem ter caracteres especiais) ──────────
function env(name) {
  const line = readFileSync(path.join(ROOT, '.env.local'), 'utf8')
    .split(/\r?\n/)
    .find((l) => l.startsWith(`${name}=`));
  if (!line) throw new Error(`Variável ${name} ausente em .env.local`);
  return line.slice(name.length + 1).trim();
}

const CLOUDINARY_KEY = env('CLOUDINARY_API_KEY');
const CLOUDINARY_SECRET = env('CLOUDINARY_API_SECRET');

// ── pareamento produto ↔ arquivo local ────────────────────────────────
const norm = (s) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

async function buildMapping(products) {
  const files = (await readdir(path.join(ROOT, 'src/assets'))).filter((f) =>
    /\.(png|jpe?g|webp)$/i.test(f)
  );
  const used = new Set();
  const map = new Map(); // id -> filename
  const missing = [];

  // Alvo primário: basename da URL imgbb (ex.: .../le-male-elixir.jpg);
  // fallback: o próprio id normalizado.
  const targetsFor = (p) => {
    const base = p.imageUrl.split('/').pop().replace(/\.\w+$/, '');
    return [norm(base), norm(p.id)].filter(Boolean);
  };

  const take = (predicate) => {
    const hit = files.find((f) => !used.has(f) && predicate(norm(f.replace(/\.\w+$/, ''))));
    if (hit) used.add(hit);
    return hit;
  };

  for (const p of products) {
    let file = null;
    for (const target of targetsFor(p)) {
      file =
        take((f) => f === target) ||
        take((f) => target.startsWith(f) && f.length > 3);
      if (file) break;
    }
    if (!file) missing.push(p.id); // resolve depois por exclusão
    else map.set(p.id, file);
  }
  // Fallback final: pareia sobras na ordem (caso "conexão" manglado na imgbb).
  if (missing.length) {
    const leftovers = files.filter((f) => !used.has(f));
    if (leftovers.length === missing.length) {
      missing.forEach((id, i) => map.set(id, leftovers[i]));
    } else {
      throw new Error(
        `Pareamento incompleto: faltam ${missing.join(', ')} | sobras: ${leftovers.join(', ')}`
      );
    }
  }
  return map;
}

// ── Cloudinary (REST assinado, sem SDK) ────────────────────────────────
function signParams(params) {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return createHash('sha1').update(sorted + CLOUDINARY_SECRET).digest('hex');
}

async function uploadToCloudinary(buffer, publicId) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signParams({ folder: FOLDER, public_id: publicId, timestamp });

  const form = new FormData();
  form.append('file', new Blob([buffer], { type: 'image/webp' }), `${publicId}.webp`);
  form.append('api_key', CLOUDINARY_KEY);
  form.append('timestamp', String(timestamp));
  form.append('folder', FOLDER);
  form.append('public_id', publicId);
  form.append('signature', signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
    method: 'POST',
    body: form,
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(`Cloudinary (${publicId}): ${json.error?.message ?? res.status}`);
  }
  return json;
}

/** URL de entrega já otimizada: WebP automático, qualidade auto, máx 800px. */
function deliveryUrl(secureUrl) {
  return secureUrl.replace('/upload/', '/upload/f_auto,q_auto,w_800/');
}

// ── main ────────────────────────────────────────────────────────────────
const store = JSON.parse(readFileSync(path.join(ROOT, 'src/data/storeData.json'), 'utf8'));
const products = store.products.filter((p) => p.imageUrl?.includes('i.ibb.co'));
console.log(`Produtos a migrar: ${products.length}`);

const mapping = await buildMapping(products);

// Login Firebase (as regras exigem admin verificado p/ escrever)
const app = initializeApp({
  apiKey: env('VITE_FIREBASE_API_KEY'),
  authDomain: env('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: env('VITE_FIREBASE_PROJECT_ID'),
});
const db = getFirestore(app);
await signInWithEmailAndPassword(
  getAuth(app),
  env('MIGRATION_EMAIL'),
  env('MIGRATION_PASSWORD')
);

const report = [];
for (const p of products) {
  const file = mapping.get(p.id);
  const raw = readFileSync(path.join(ROOT, 'src/assets', file));

  const optimized = await sharp(raw)
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  console.log(
    `${p.id.padEnd(28)} ${file.padEnd(30)} ${(raw.length / 1024).toFixed(0)}KB → ${(optimized.length / 1024).toFixed(0)}KB`
  );

  if (DRY_RUN) continue;

  const json = await uploadToCloudinary(optimized, p.id);
  const url = deliveryUrl(json.secure_url);

  await updateDoc(doc(db, 'products', p.id), { imageUrl: url });
  report.push({
    id: p.id,
    publicId: json.public_id,
    secureUrl: json.secure_url,
    deliveryUrl: url,
    oldImgbbUrl: p.imageUrl,
    bytesOptimized: optimized.length,
  });
  console.log(`  ✓ ${url}`);
}

if (!DRY_RUN) {
  const { writeFile } = await import('node:fs/promises');
  await writeFile(
    path.join(ROOT, 'scripts/cloudinary-report.local.json'),
    JSON.stringify(report, null, 2)
  );
}
console.log(DRY_RUN ? 'DRY-RUN concluído.' : `Concluído: ${report.length} produtos migrados.`);
process.exit(0);

/**
 * Migração one-off: imagens locais dos produtos → imgbb + dataset canônico.
 *
 * O que faz:
 *  1. Lê IMGBB_KEY do .env.local
 *  2. Para cada produto com imagem local (assets/produtos/*): sobe à imgbb
 *  3. Converte preços "R$ 30,00" → priceCents: 3000
 *  4. Reescreve products[] em src/data/storeData.json no formato canônico
 *     (category como texto livre, imageUrl absoluta, imageFocus null)
 *  5. Salva relatório com delete_url da imgbb em arquivo LOCAL (gitignored)
 *
 * Idempotente: produtos já migrados (imageUrl i.ibb.co) são preservados.
 * Uso: node scripts/migrate-images.mjs
 */
import { readFile, writeFile, rename } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const ENV_PATH = path.join(ROOT, '.env.local');
const DATA_PATH = path.join(ROOT, 'src/data/storeData.json');
const REPORT_PATH = path.join(ROOT, 'scripts/imgbb-report.local.json');

// ── util ────────────────────────────────────────────────────────────────
function loadEnvKey() {
  // chave possivelmente com caracteres especiais: captura tudo após o "="
  const lines = readFileSync(ENV_PATH, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const m = /^IMGBB_KEY=(.+)$/.exec(line.trim());
    if (m) return m[1].trim();
  }
  throw new Error('IMGBB_KEY não encontrada em .env.local');
}

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

function toCents(raw) {
  if (raw == null) return null;
  let s = String(raw).replace(/[R$\s]/g, '');
  if (!s) return null;
  // remove separadores de milhar (pontos seguidos de exatamente 3 dígitos até vírgula/fim)
  s = s.replace(/\.(?=\d{3}(?:,|$))/g, '').replace(',', '.');
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}

const CATEGORY_DISPLAY = { importado: 'Importado', arabe: 'Árabe', nacional: 'Nacional' };

async function uploadToImgbb(key, absPath, attempt = 0) {
  const buf = await readFile(absPath);
  const ext = path.extname(absPath).toLowerCase();
  const form = new FormData();
  form.append('image', new Blob([buf], { type: MIME[ext] ?? 'application/octet-stream' }), path.basename(absPath));

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok && attempt < 2) {
    await new Promise((r) => setTimeout(r, 1200));
    return uploadToImgbb(key, absPath, attempt + 1);
  }
  if (!res.ok) throw new Error(`imgbb HTTP ${res.status}: ${await res.text().then((t) => t.slice(0, 200))}`);
  const json = await res.json();
  if (!json?.success || !json?.data?.url) throw new Error(`resposta inesperada da imgbb: ${JSON.stringify(json).slice(0, 200)}`);
  return { url: json.data.url, deleteUrl: json.data.delete_url ?? null };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── execução ────────────────────────────────────────────────────────────
async function main() {
  const key = loadEnvKey();
  /** @type {any} */
  const store = JSON.parse(await readFile(DATA_PATH, 'utf8'));
  const products = store.products;
  console.log(`Produtos no dataset: ${products.length}`);

  // backup de segurança antes da primeira escrita
  await rename(DATA_PATH, `${DATA_PATH}.migrating.bak`);
  try {
    const report = [];
    let uploaded = 0;
    let skipped = 0;

    for (const [i, p] of products.entries()) {
      const isMigrated = typeof p.imageUrl === 'string' && p.imageUrl.includes('i.ibb.co');
      if (isMigrated) {
        skipped++;
        continue;
      }
      if (!p.image || !p.image.startsWith('assets/produtos/')) {
        throw new Error(`[${p.id}] imagem inesperada: ${p.image}`);
      }
      const absPath = path.join(ROOT, 'public', p.image);
      process.stdout.write(`(${i + 1}/${products.length}) ${p.id} … `);
      const { url, deleteUrl } = await uploadToImgbb(key, absPath);
      p.imageUrl = url;
      report.push({ id: p.id, url, deleteUrl });
      uploaded++;
      console.log('ok');
      await sleep(400); // cortesia com a API
    }

    // canonicaliza TODOS os produtos (inclusive os já migrados)
    for (const p of products) {
      p.category = CATEGORY_DISPLAY[p.categoria] ?? p.categoria ?? '';
      delete p.categoria;
      p.sizes = (p.sizes ?? []).map((s) => ({ size: String(s.size), priceCents: toCents(s.price) }));
      if (p.sizes.some((s) => s.priceCents == null)) {
        throw new Error(`[${p.id}] preço não interpretável em ${JSON.stringify(p.sizes)}`);
      }
      p.imageUrl = p.imageUrl ?? null;
      p.imageFocus = null;
      delete p.image;
    }

    await writeFile(DATA_PATH, JSON.stringify(store, null, 2) + '\n');
    await writeFile(REPORT_PATH, JSON.stringify(report, null, 2) + '\n');

    console.log(`\n✅ Migração concluída: ${uploaded} enviadas, ${skipped} já existentes.`);
    console.log(`   Dataset canônico salvo em src/data/storeData.json`);
    console.log(`   delete_url da imgbb em scripts/imgbb-report.local.json (LOCAL — não commitar)`);
  } catch (err) {
    // restaura backup em caso de falha parcial para não corromper o dataset
    await rename(`${DATA_PATH}.migrating.bak`, DATA_PATH).catch(() => {});
    console.error('\n❌ Falhou — dataset original restaurado:', err.message);
    process.exit(1);
  }
}

main();

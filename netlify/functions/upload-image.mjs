/**
 * Netlify Function (v2): upload de imagem para Cloudinary (admin autenticado)
 *
 * Fluxo:
 *   1. Valida o ID Token do Firebase server-side (RS256 via chaves públicas do Google)
 *   2. Exige e-mail verificado
 *   3. Valida tipo/tamanho do arquivo
 *   4. Faz upload assinado ao Cloudinary (SHA-1 nativo do Node, sem SDK)
 *   5. Retorna { url (já com f_auto,q_auto,w_800), publicId, deleteUrl }
 *
 * Runtime: Netlify Functions v2 — recebe um Request padrão Web.
 * Segurança: sem dependências externas; assinatura HMAC calculada localmente.
 */

import { createHash } from 'node:crypto';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const CLOUDINARY_FOLDER = 'elixir7/products';

// Chaves públicas do Google (atualização a cada 1h)
const GOOGLE_JWKS = createRemoteJWKSet(
  new URL(
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
  ),
  { cooldownDuration: 1_000, cacheMaxAge: 3_600_000 }
);

// Cache leve das credenciais (poupa re-leitura em cold starts)
let CACHED_CREDS = null;
function getCreds() {
  if (CACHED_CREDS) return CACHED_CREDS;
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !key || !secret) {
    throw new Error('Credenciais Cloudinary não configuradas');
  }
  CACHED_CREDS = { cloud, key, secret };
  return CACHED_CREDS;
}

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

async function verifyFirebaseIdToken(token, projectId) {
  const { payload } = await jwtVerify(token, GOOGLE_JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
    clockTolerance: 10,
  });
  return payload;
}

function signCloudinary(params, secret) {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return createHash('sha1').update(sorted + secret).digest('hex');
}

/** URL de entrega já otimizada: WebP automático, qualidade auto, máx 800px. */
function deliveryUrl(secureUrl) {
  return secureUrl.replace('/upload/', '/upload/f_auto,q_auto,w_800/');
}

export async function handler(req) {
  const method = req.method ?? req.httpMethod;
  if (method !== 'POST') return json(405, { error: 'Método não permitido' });

  const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
  if (!PROJECT_ID) {
    return json(500, { error: 'Configuração do servidor incompleta' });
  }

  // ── Autenticação ──────────────────────────────────────────────────────
  const authHeader =
    typeof req.headers?.get === 'function'
      ? req.headers.get('authorization')
      : req.headers?.authorization ?? req.headers?.Authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return json(401, { error: 'Token de autenticação ausente' });
  }
  const idToken = authHeader.slice(7);

  let claims;
  try {
    claims = await verifyFirebaseIdToken(idToken, PROJECT_ID);
  } catch {
    return json(401, { error: 'Token inválido' });
  }
  if (!claims.email_verified) return json(403, { error: 'E-mail não verificado' });

  // ── Arquivo + publicId do formulário ─────────────────────────────────
  let file;
  let requestedPublicId;
  try {
    const formData = await req.formData();
    file = formData.get('file');
    requestedPublicId = formData.get('publicId');
  } catch {
    return json(400, { error: 'Formato multipart inválido' });
  }
  if (!file || typeof file === 'string') return json(400, { error: 'Arquivo não enviado' });

  const mime = file.type || '';
  if (!ALLOWED_TYPES.includes(mime)) {
    return json(400, { error: 'Tipo não permitido (use JPEG, PNG ou WebP)' });
  }

  const arrayBuf = await file.arrayBuffer();
  if (arrayBuf.byteLength > MAX_BYTES) {
    return json(400, { error: `Arquivo excede ${MAX_BYTES / 1_048_576} MB` });
  }

  // ── publicId: do form (slug do produto) ou fallback pelo nome/timestamp
  const timestamp = Math.floor(Date.now() / 1000);
  const rawPublicId = requestedPublicId || file.name?.replace(/\.\w+$/, '') || `upload-${timestamp}`;
  const publicId = String(rawPublicId).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);

  // ── Cloudinary: upload assinado ──────────────────────────────────────
  let cloud, apiKey, secret;
  try {
    ({ cloud, key: apiKey, secret } = getCreds());
  } catch (e) {
    return json(500, { error: e.message });
  }

  const signature = signCloudinary(
    { folder: CLOUDINARY_FOLDER, public_id: publicId, timestamp },
    secret
  );

  const form = new FormData();
  form.append('file', new Blob([arrayBuf], { type: mime }), `${publicId}.webp`);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('folder', CLOUDINARY_FOLDER);
  form.append('public_id', publicId);
  form.append('signature', signature);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
      { method: 'POST', body: form }
    );
    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error?.message ?? `Cloudinary ${res.status}`);
    }
    return json(200, {
      url: deliveryUrl(data.secure_url),
      publicId: data.public_id,
      deleteUrl: data.delete_url ?? null,
    });
  } catch (err) {
    console.error('Cloudinary error:', err);
    return json(502, { error: 'Falha ao enviar imagem ao provedor' });
  }
}

export default handler;

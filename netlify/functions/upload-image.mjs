/**
 * Netlify Function (v2): upload de imagem para imgbb (admin autenticado)
 *
 * Fluxo:
 *   1. Valida o ID Token do Firebase server-side (RS256 contra chaves públicas do Google)
 *   2. Exige e-mail verificado
 *   3. Valida tipo/tamanho do arquivo
 *   4. Repassa à imgbb com a IMGBB_KEY do ambiente (nunca exposta ao browser)
 *   5. Retorna { url, deleteUrl }
 *
 * Runtime: Netlify Functions v2 — recebe um Request padrão Web.
 * Sem dependências além de `jose`; roda igual em Deno (produção) e Node ≥18 (testes locais).
 */

import { createRemoteJWKSet, jwtVerify } from 'jose';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

// Cache das chaves públicas do Google (atualização a cada 1h)
// ⚠️ Endpoint correto p/ jose: .../v1/jwk/... devolve JWKS {keys:[...]}.
// O espelho /metadata/x509/ devolve certificados PEM e NÃO é um JWKS.
const GOOGLE_JWKS = createRemoteJWKSet(
  new URL(
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
  ),
  {
    cooldownDuration: 1_000,
    cacheMaxAge: 3_600_000, // 1h
  }
);

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

async function verifyFirebaseIdToken(token, projectId) {
  try {
    const { payload } = await jwtVerify(token, GOOGLE_JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
      clockTolerance: 10, // segundos
    });
    return payload;
  } catch (err) {
    throw new Error(`Token inválido: ${err?.message ?? err}`);
  }
}

export async function handler(req) {
  // Compatibilidade: no runtime v2 `req` é um Request (req.method);
  // mantemos leitura tolerante caso algum wrapper passe o evento legado.
  const method = req.method ?? req.httpMethod;
  if (method !== 'POST') {
    return json(405, { error: 'Método não permitido' });
  }

  const IMGBB_KEY = process.env.IMGBB_KEY;
  const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
  if (!IMGBB_KEY || !PROJECT_ID) {
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
  } catch (e) {
    return json(401, { error: e.message });
  }

  if (!claims.email_verified) {
    return json(403, { error: 'E-mail não verificado' });
  }

  // ── Arquivo ───────────────────────────────────────────────────────────
  let file;
  try {
    const formData = await req.formData();
    file = formData.get('file');
    if (!file || typeof file === 'string') {
      return json(400, { error: 'Arquivo não enviado' });
    }
  } catch {
    return json(400, { error: 'Formato multipart inválido' });
  }

  const mime = file.type || '';
  if (!ALLOWED_TYPES.includes(mime)) {
    return json(400, { error: 'Tipo de arquivo não permitido (use JPEG, PNG ou WebP)' });
  }

  const arrayBuf = await file.arrayBuffer();
  if (arrayBuf.byteLength > MAX_BYTES) {
    return json(400, { error: `Arquivo excede ${MAX_BYTES / 1_048_576} MB` });
  }

  // ── imgbb ─────────────────────────────────────────────────────────────
  const formImgbb = new FormData();
  formImgbb.append('image', new Blob([arrayBuf], { type: mime }), 'upload');
  try {
    const res = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(IMGBB_KEY)}`,
      { method: 'POST', body: formImgbb }
    );
    if (!res.ok) throw new Error(`imgbb ${res.status}`);
    const jsonData = await res.json();
    if (!jsonData.success || !jsonData.data?.url) throw new Error('resposta imgbb inválida');
    return json(200, { url: jsonData.data.url, deleteUrl: jsonData.data.delete_url ?? null });
  } catch (err) {
    console.error('imgbb error:', err);
    return json(502, { error: 'Falha ao enviar imagem ao provedor' });
  }
}

export default handler;

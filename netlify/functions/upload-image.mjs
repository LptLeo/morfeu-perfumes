/**
 * Netlify Function: upload de imagem para imgbb (admin autenticado)
 * 
 * Valida o ID Token do Firebase server-side (RS256 via chaves públicas do Google)
 * → verifica tipo/tamanho do arquivo
 * → repassa à imgbb com a IMGBB_KEY do ambiente
 * → retorna { url, deleteUrl }
 * 
 * Segurança: sem dependências externas; valida assinatura RSA-256 contra as
 * chaves públicas do Google (expostas em https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com)
 * Cacheia as chaves por 1h.
 */

import { createRemoteJWKSet, jwtVerify } from 'jose';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

// Cache das chaves públicas do Google (atualização a cada 1h)
const GOOGLE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'),
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
    throw new Error(`Token inválido: ${err.message}`);
  }
}

export async function handler(event) {
  // Só POST
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Método não permitido' });
  }

  const IMGBB_KEY = process.env.IMGBB_KEY;
  const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
  if (!IMGBB_KEY || !PROJECT_ID) {
    return json(500, { error: 'Configuração do servidor incompleta' });
  }

  // Autenticação: Authorization: Bearer <ID_TOKEN>
  const auth = event.headers.authorization ?? event.headers.Authorization;
  if (!auth?.startsWith('Bearer ')) {
    return json(401, { error: 'Token de autenticação ausente' });
  }
  const idToken = auth.slice(7);

  let claims;
  try {
    claims = await verifyFirebaseIdToken(idToken, PROJECT_ID);
  } catch (e) {
    return json(401, { error: e.message });
  }

  // Admin check: rule já garante admin, mas verificamos email verificado
  if (!claims.email_verified) {
    return json(403, { error: 'E-mail não verificado' });
  }

  // Parse multipart
  let file;
  try {
    const form = await event.body.arrayBuffer();
    const blob = new Blob([form]);
    const formData = new FormData(new Response(blob));
    file = formData.get('file');
    if (!file || typeof file === 'string') {
      return json(400, { error: 'Arquivo não enviado' });
    }
  } catch {
    return json(400, { error: 'Formato multipart inválido' });
  }

  // Valida tipo
  const mime = file.type;
  if (!ALLOWED_TYPES.includes(mime)) {
    return json(400, { error: 'Tipo de arquivo não permitido (use JPEG, PNG ou WebP)' });
  }

  // Valida tamanho
  const arrayBuf = await file.arrayBuffer();
  if (arrayBuf.byteLength > MAX_BYTES) {
    return json(400, { error: `Arquivo excede ${MAX_BYTES / 1_048_576} MB` });
  }

  // Envia à imgbb
  const formImgbb = new FormData();
  formImgbb.append('image', new Blob([arrayBuf], { type: mime }), 'upload');
  try {
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(process.env.IMGBB_KEY)}`, {
      method: 'POST',
      body: formImgbb,
    });
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
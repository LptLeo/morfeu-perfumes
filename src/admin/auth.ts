import {
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';

/**
 * Autenticação do painel administrativo via Firebase Auth.
 *
 * Modelo de segurança:
 * - O allowlist de e-mails (VITE_ADMIN_EMAILS) é camada de UX: rejeita
 *   rápido contas fora da lista. A autorização REAL vive nas
 *   firestore.rules (isAdmin), avaliadas server-side pelo Google.
 * - Mensagens de erro são genéricas para evitar enumeração de usuários.
 */

/** E-mails autorizados, vindos do .env (separados por vírgula). */
const ADMIN_EMAILS: string[] = (import.meta.env.VITE_ADMIN_EMAILS ?? '')
  .split(',')
  .map((email: string) => email.trim().toLowerCase())
  .filter(Boolean);

export function isAllowedAdmin(user: User | null): boolean {
  return Boolean(user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()));
}

/** Assina mudanças de sessão. Retorna função de unsubscribe. */
export function watchAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

export async function logout(): Promise<void> {
  await signOut(getFirebaseAuth());
}

/**
 * Traduz códigos do Firebase para mensagens PT-BR genéricas.
 * Nunca revela se um e-mail existe ou não.
 */
function friendlyError(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Credenciais inválidas. Verifique e tente novamente.';
    case 'auth/user-not-found':
      // Mesma mensagem do caso acima: sem enumeração de contas.
      return 'Credenciais inválidas. Verifique e tente novamente.';
    case 'auth/invalid-email':
      return 'Informe um e-mail válido.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.';
    case 'auth/network-request-failed':
      return 'Falha de conexão. Verifique sua internet e tente novamente.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Login com Google cancelado antes de concluir.';
    case 'auth/popup-blocked':
      return 'O navegador bloqueou a janela do Google. Permita popups neste site e tente novamente.';
    default:
      return 'Não foi possível concluir a operação. Tente novamente em instantes.';
  }
}

/** Login com e-mail e senha (usuário criado no console Firebase). */
export async function loginEmail(email: string, password: string): Promise<void> {
  try {
    await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
  } catch (error) {
    throw new Error(friendlyError(error));
  }
}

/**
 * Login com Google + allowlist.
 * Conta fora da lista é deslogada imediatamente com erro claro.
 */
export async function loginGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  let user: User;
  try {
    const result = await signInWithPopup(getFirebaseAuth(), provider);
    user = result.user;
  } catch (error) {
    throw new Error(friendlyError(error));
  }

  if (!isAllowedAdmin(user)) {
    // Sessão não pode persistir para conta sem permissão.
    await signOut(getFirebaseAuth());
    throw new Error('Esta conta não tem acesso ao painel administrativo.');
  }
}

/**
 * Envia o e-mail de redefinição de senha.
 * Anti-enumeração: conta inexistente recebe a MESMA resposta de sucesso.
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
  } catch (error) {
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code: unknown }).code)
        : '';

    if (code === 'auth/user-not-found') {
      // Silencia a existência da conta: sucesso aparente.
      return;
    }
    if (code === 'auth/too-many-requests') {
      throw new Error(
        'Muitas solicitações seguidas. Aguarde alguns minutos antes de tentar de novo.'
      );
    }
    if (code === 'auth/invalid-email') {
      throw new Error('Informe um e-mail válido.');
    }
    throw new Error(
      'Não foi possível enviar o e-mail agora. Tente novamente em instantes.'
    );
  }
}

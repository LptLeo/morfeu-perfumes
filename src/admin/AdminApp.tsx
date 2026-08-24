import React, { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { isAllowedAdmin, logout, resendVerificationEmail, watchAuth } from './auth';
import { navigate, usePathname } from './router';
import { getFirebaseAuth } from '@/lib/firebase';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminProducts } from './pages/AdminProducts';
import { ProductForm } from './pages/ProductForm';
import { AdminTexts } from './pages/AdminTexts';
import type { AdminProduct } from './productsService';

/**
 * Shell administrativo com guarda de rota ASSÍNCRONA.
 *
 * Fluxo:
 *   /admin/login → se já autenticado (e autorizado), vai para /admin
 *   /admin       → se NÃO autenticado, vai para /admin/login
 *   /admin/*     → mesmo comportamento de /admin
 *
 * - Estado "checking" enquanto o onAuthStateChanged resolve: evita flash
 *   de redirect e falso-negativo no primeiro paint.
 * - Redirects usam history.replaceState: o botão "voltar" não retorna à
 *   área protegida após logout.
 */
export const AdminApp: React.FC = () => {
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    try {
      const unsubscribe = watchAuth((u) => {
        setUser(u);
        setChecking(false);
      });
      return () => unsubscribe();
    } catch {
      // Firebase sem configuração (.env.local ausente): trata como deslogado.
      setConfigured(false);
      setChecking(false);
      setUser(null);
    }
  }, []);

  // Sessão órfã fora da allowlist (ex.: lista mudou): desloga silenciosamente.
  useEffect(() => {
    if (user && !isAllowedAdmin(user)) {
      void logout();
    }
  }, [user]);

  const authed = Boolean(user && isAllowedAdmin(user));
  const isLoginRoute = pathname === '/admin/login';

  useEffect(() => {
    if (checking) return;
    if (isLoginRoute && authed) navigate('/admin', true);
    if (!isLoginRoute && !authed) navigate('/admin/login', true);
  }, [checking, isLoginRoute, authed]);

  /** Navegação interna do painel (replace=false → botão voltar funciona entre telas). */
  const go = (path: string) => navigate(path);

  /** Reenvio do e-mail de verificação + feedback. */
  const [verifMsg, setVerifMsg] = useState<string | null>(null);
  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail();
      setVerifMsg('E-mail enviado. Confirme na sua caixa de entrada e clique em "Já confirmei".');
    } catch (err) {
      setVerifMsg(err instanceof Error ? err.message : 'Falha ao reenviar.');
    }
  };

  /** Força refresh do token após o usuário clicar no link do e-mail. */
  const handleVerifiedNow = async () => {
    try {
      await getFirebaseAuth().currentUser?.reload();
      await getFirebaseAuth().currentUser?.getIdToken(true);
      // onAuthStateChanged não dispara em reload(); força re-render via state
      setUser(getFirebaseAuth().currentUser);
    } finally {
      window.location.reload();
    }
  };

  if (checking) {
    return (
      <div className="admin-boot" aria-busy="true">
        Carregando…
      </div>
    );
  }

  if (isLoginRoute) {
    return authed ? null : <LoginPage configured={configured} />;
  }

  if (!authed) return null;

  // E-mail não verificado: bloqueia o painel com instruções claras.
  if (!user!.emailVerified) {
    return (
      <div style={{ maxWidth: 560, margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 26 }}>
          Confirme seu e-mail
        </h1>
        <p style={{ color: '#5A616E', lineHeight: 1.6, marginTop: 12 }}>
          Enviamos um link de confirmação para <strong>{user!.email}</strong>. A verificação é
          obrigatória para gerenciar produtos — ela protege a loja contra escritas não autorizadas.
        </p>
        {verifMsg && (
          <p role="status" style={{ marginTop: 14, fontWeight: 600 }}>
            {verifMsg}
          </p>
        )}
        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: 22,
          }}
        >
          <button type="button" onClick={handleResendVerification} style={verifyBtn}>
            Reenviar e-mail
          </button>
          <button type="button" onClick={handleVerifiedNow} style={verifyBtn}>
            Já confirmei — atualizar
          </button>
          <button
            type="button"
            onClick={() => logout().then(() => navigate('/admin/login', true))}
            style={{ ...verifyBtn, background: 'none', border: 'none', color: '#5A616E' }}
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  // ── Rotas ────────────────────────────────────────────────
  const productsMatch = /^\/admin\/produtos(\/novo|\/([^/]+))?$/.exec(pathname);
  let content: React.ReactNode;

  if (pathname === '/admin' || pathname === '/admin/') {
    content = <AdminDashboard email={user!.email!} />;
  } else if (pathname === '/admin/textos') {
    content = <AdminTexts />;
  } else if (pathname === '/admin/produtos') {
    content = (
      <AdminProducts
        onEdit={(p) => go(`/admin/produtos/${p.id}`)}
        onCreate={() => go('/admin/produtos/novo')}
      />
    );
  } else if (productsMatch) {
    const param = productsMatch[2]; // undefined em /novo
    if (param) {
      return (
        <ProductEditLoader
          productId={param}
          onDone={() => go('/admin/produtos')}
          onCancel={() => go('/admin/produtos')}
        />
      );
    }
    content = (
      <ProductForm onDone={() => go('/admin/produtos')} onCancel={() => go('/admin/produtos')} />
    );
  } else {
    content = <AdminDashboard email={user!.email!} />;
  }

  return <>{content}</>;
};

/**
 * Carrega o produto por ID antes de abrir o formulário de edição.
 * (Evita duplicar a busca na lista e no form.)
 */
const ProductEditLoader: React.FC<{
  productId: string;
  onDone: () => void;
  onCancel: () => void;
}> = ({ productId, onDone, onCancel }) => {
  const [state, setState] = useState<
    { status: 'loading' } | { status: 'missing' } | { status: 'ready'; product: AdminProduct }
  >({ status: 'loading' });

  useEffect(() => {
    let alive = true;
    import('./productsService')
      .then(({ listAdminProducts }) => listAdminProducts())
      .then((all) => {
        if (!alive) return;
        const found = all.find((p) => p.id === productId);
        setState(found ? { status: 'ready', product: found } : { status: 'missing' });
      })
      .catch(() => alive && setState({ status: 'missing' }));
    return () => {
      alive = false;
    };
  }, [productId]);

  if (state.status === 'loading') {
    return (
      <div className="admin-boot" aria-busy="true">
        Carregando produto…
      </div>
    );
  }
  if (state.status === 'missing') {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p>Produto não encontrado.</p>
        <button onClick={onCancel}>&larr; Voltar à lista</button>
      </div>
    );
  }
  return <ProductForm product={state.product} onDone={onDone} onCancel={onCancel} />;
};

export default AdminApp;

const verifyBtn: React.CSSProperties = {
  padding: '11px 20px',
  borderRadius: 999,
  border: '1px solid #d8dde4',
  background: '#fff',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
};
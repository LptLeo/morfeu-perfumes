import React, { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { isAllowedAdmin, logout, watchAuth } from './auth';
import { navigate, usePathname } from './router';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';

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

  return authed ? <AdminDashboard email={user!.email!} /> : null;
};

export default AdminApp;

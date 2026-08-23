import { useEffect, useState } from 'react';

/**
 * Roteador mínimo baseado na History API — evita adicionar react-router
 * (e seu peso) à landing page. Suficiente para as rotas /admin.
 *
 * ⚠️ Hospedagem: em produção, o servidor precisa fazer fallback de todas
 * as rotas para /index.html (ex.: rewrites do Firebase Hosting,
 * try_files do nginx, _redirects do Netlify).
 */

export function navigate(path: string, replace = false): void {
  if (replace) {
    window.history.replaceState({}, '', path);
  } else {
    window.history.pushState({}, '', path);
  }
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function usePathname(): string {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  return pathname;
}

import React, { useState } from 'react';
import { loginEmail, loginGoogle, resetPassword } from '../auth';
import { navigate } from '../router';
import styles from './LoginPage.module.scss';

interface LoginPageProps {
  /** false quando o .env.local não está preenchido */
  configured: boolean;
}

type Mode = 'login' | 'forgot';

export const LoginPage: React.FC<LoginPageProps> = ({ configured }) => {
  const [mode, setMode] = useState<Mode>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const busy = submitting || googleSubmitting;

  const clearFeedback = () => {
    setError(null);
    setNotice(null);
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    clearFeedback();
    setSubmitting(true);
    try {
      await loginEmail(email, password);
      navigate('/admin', true);
      return; // sucesso: componente sai da árvore no redirect
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
    }
    setSubmitting(false);
  };

  const handleGoogle = async () => {
    if (busy) return;
    clearFeedback();
    setGoogleSubmitting(true);
    try {
      await loginGoogle();
      navigate('/admin', true);
      return;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
    }
    setGoogleSubmitting(false);
  };

  const handleForgot = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    clearFeedback();
    setSubmitting(true);
    try {
      await resetPassword(email);
      // Mensagem idêntica exista ou não a conta (anti-enumeração).
      setNotice(
        'Se este e-mail estiver cadastrado, você receberá um link de redefinição em instantes.'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
    }
    setSubmitting(false);
  };

  if (!configured) {
    return (
      <main className={styles.loginPage}>
        <div className={styles.card}>
          <div className={styles.brandIcon} aria-hidden="true">E7</div>
          <h1 className={styles.title}>Painel administrativo</h1>
          <p className={styles.subtitle}>
            Credenciais do Firebase ausentes. Copie o arquivo{' '}
            <code>.env.example</code> para <code>.env.local</code>, preencha as
            variáveis e recarregue esta página.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.loginPage}>
      <div className={styles.card}>
        <div className={styles.brandIcon} aria-hidden="true">E7</div>

        <h1 className={styles.title}>Painel administrativo</h1>
        <p className={styles.subtitle}>Acesso restrito à equipe Elixir n°7.</p>

        {error && (
          <p className={styles.error} role="alert" aria-live="assertive">
            {error}
          </p>
        )}
        {notice && (
          <p className={styles.notice} role="status" aria-live="polite">
            {notice}
          </p>
        )}

        {mode === 'login' ? (
          <>
            <form onSubmit={handleLogin} noValidate>
              <div className={styles.field}>
                <label htmlFor="admin-email">E-mail</label>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@elixirn7.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(error)}
                  disabled={busy}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="admin-password">Senha</label>
                <div className={styles.passwordWrap}>
                  <input
                    id="admin-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={Boolean(error)}
                    disabled={busy}
                    required
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                <button
                  type="button"
                  className={styles.forgotLink}
                  onClick={() => {
                    clearFeedback();
                    setMode('forgot');
                  }}
                  disabled={busy}
                >
                  Esqueci minha senha
                </button>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={busy}>
                {submitting ? 'Entrando…' : 'Entrar'}
              </button>
            </form>

            <div className={styles.divider} role="separator">ou</div>

            <button
              type="button"
              className={styles.googleBtn}
              onClick={handleGoogle}
              disabled={busy}
            >
              <svg viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.4C29.3 34.8 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.3 5.4C41.4 35.4 44 30.2 44 24c0-1.2-.1-2.3-.4-3.5z"/>
              </svg>
              {googleSubmitting ? 'Conectando…' : 'Entrar com Google'}
            </button>
          </>
        ) : (
          <form onSubmit={handleForgot} noValidate>
            <p className={styles.forgotIntro}>
              Informe o e-mail da conta admin para receber o link de redefinição.
            </p>
            <div className={styles.field}>
              <label htmlFor="forgot-email">E-mail</label>
              <input
                id="forgot-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="voce@elixirn7.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
                required
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={busy}>
              {submitting ? 'Enviando…' : 'Enviar link de redefinição'}
            </button>

            <button
              type="button"
              className={styles.forgotLink}
              onClick={() => {
                clearFeedback();
                setMode('login');
              }}
              disabled={busy}
            >
              &larr; Voltar ao login
            </button>
          </form>
        )}

        <p className={styles.backLink}>
          <a href="/">&larr; Voltar à loja</a>
        </p>
      </div>
    </main>
  );
};

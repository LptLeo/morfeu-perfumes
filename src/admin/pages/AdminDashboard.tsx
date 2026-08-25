import React from 'react';
import { Button } from '@/components/ui/Button';
import { logout } from '../auth';
import { navigate } from '../router';
import styles from './AdminDashboard.module.scss';

interface AdminDashboardProps {
  email: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ email }) => {
  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', true);
  };

  return (
    <div className={styles.dashboard}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.brandIcon} aria-hidden="true">E7</span>
          <span className={styles.brandName}>Painel administrativo</span>
        </div>
        <div className={styles.userArea}>
          {email && <span className={styles.userEmail}>{email}</span>}
          <Button variant="outline" onClick={handleLogout} isCompact>
            Sair
          </Button>
        </div>
      </header>

      <main className={styles.content}>
        <h1>Bem-vindo{email ? `, ${email}` : ''}</h1>
        <p>
          Área administrativa da loja. Comece pela gestão do catálogo ou textos:
        </p>
        <nav className={styles.quickLinks} aria-label="Atalhos do painel">
          <button 
            type="button" 
            className={styles.cardLink}
            onClick={() => navigate('/admin/produtos')}
          >
            <span className={styles.cardIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </span>
            <span className={styles.cardTitle}>Gerenciar produtos</span>
            <span className={styles.cardDesc}>Adicionar, editar e remover perfumes do catálogo</span>
          </button>
          <button 
            type="button" 
            className={styles.cardLink}
            onClick={() => navigate('/admin/textos')}
          >
            <span className={styles.cardIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </span>
            <span className={styles.cardTitle}>Gerenciar textos</span>
            <span className={styles.cardDesc}>Editar textos, imagens e configurações do site</span>
          </button>
        </nav>
      </main>
    </div>
  );
};

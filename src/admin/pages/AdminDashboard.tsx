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
          Esta é a área administrativa. A gestão de produtos, pedidos e
          depoimentos será construída aqui nas próximas etapas.
        </p>
      </main>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { StoreInfo } from '@/types/store';
import { buildWhatsAppUrl } from '@/utils/whatsapp';
import styles from './Header.module.scss';

interface HeaderProps {
  storeInfo: StoreInfo;
}

export const Header: React.FC<HeaderProps> = ({ storeInfo }) => {
  const waUrl = buildWhatsAppUrl(
    storeInfo.whatsapp.number,
    storeInfo.whatsapp.defaultMessage
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close menu on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const navLinks = [
    { href: '#por-que', label: 'Por que decants' },
    { href: '#catalogo', label: 'Catálogo' },
    { href: '#como-funciona', label: 'Como funciona' },
    { href: '#faq', label: 'Dúvidas' },
  ];

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <a href="#topo" className={styles.brand} aria-label={storeInfo.name}>
            <div className={styles.brandIcon}>E7</div>
            <span className={styles.brandWord}>
              <span className={styles.brandName}>{storeInfo.name}</span>
              <span className={styles.brandTag}>{storeInfo.tagline}</span>
            </span>
          </a>

          <nav className={styles.navLinks} aria-label="Navegação principal">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}>{link.label}</a>
            ))}
          </nav>

          <Button
            variant="gold"
            href={waUrl}
            target="_blank"
            className={styles.headerCta}
          >
            Falar no WhatsApp
          </Button>

          <button
            type="button"
            className={styles.mobileMenuBtn}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <div
        ref={overlayRef}
        className={`${styles.mobileMenuOverlay} ${menuOpen ? styles.visible : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <div
        ref={menuRef}
        id="mobile-menu"
        className={`${styles.mobileMenu} ${menuOpen ? styles.open : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
      >
        <nav>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={closeMenu}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className={styles.mobileMenuCta}>
          <a
            href={waUrl}
            target="_blank"
            onClick={closeMenu}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </>
  );
};

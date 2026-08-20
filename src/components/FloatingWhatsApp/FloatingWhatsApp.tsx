import React from 'react';
import { WhatsAppIcon } from '@/assets/icons';
import { buildWhatsAppUrl } from '@/utils/whatsapp';
import styles from './FloatingWhatsApp.module.scss';

interface FloatingWhatsAppProps {
  phoneNumber: string;
  defaultMessage: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  phoneNumber,
  defaultMessage,
}) => {
  const waUrl = buildWhatsAppUrl(phoneNumber, defaultMessage);

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.waFloat}
      aria-label="Falar no WhatsApp"
    >
      <WhatsAppIcon size={30} />
    </a>
  );
};

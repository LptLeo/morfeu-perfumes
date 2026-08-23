import React from 'react';
import styles from './Button.module.scss';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gold' | 'outline';
  isBlock?: boolean;
  isCompact?: boolean;
  href?: string;
  target?: string;
  rel?: string;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isBlock = false,
  isCompact = false,
  href,
  target,
  rel,
  icon,
  className = '',
  // Padrão seguro: dentro de <form>, <button> sem type é submit implícito.
  // Aqui o padrão é 'button' — quem quiser submit declara type="submit".
  type = 'button',
  ...rest
}) => {
  // Monta a classe concatenando apenas as que se aplicam — sem biblioteca extra
  const blockClass = isBlock ? styles.block : '';
  const compactClass = isCompact ? styles.compact : '';
  const buttonClass = `${styles.btn} ${styles[variant]} ${blockClass} ${compactClass} ${className}`.trim();

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={target === '_blank' ? (rel ?? 'noopener noreferrer') : rel}
        className={buttonClass}
      >
        {icon}
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={buttonClass} {...rest}>
      {icon}
      {children}
    </button>
  );
};
